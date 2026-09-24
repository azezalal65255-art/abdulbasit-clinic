import { useRef, useEffect } from 'react';
import { useAutoSave } from '../context/AutoSaveContext';

interface UseAutoSaveFormOptions<T> {
  key: string;
  data: T;
  onSave: (data: T) => Promise<any>;
  isReady?: boolean;
  debounceMs?: number;
}

/**
 * Custom hook to automatically save form or view state when modified.
 * Only triggers after initial load (isReady === true), comparing with previous serialized value.
 * Updates state to 'saving' -> 'saved' only upon server confirmation.
 */
export function useAutoSaveForm<T>({
  key,
  data,
  onSave,
  isReady = true,
  debounceMs = 1200,
}: UseAutoSaveFormOptions<T>) {
  const { triggerAutoSave, setSaveStatus } = useAutoSave();
  const initialDataRef = useRef<string | null>(null);
  const isFirstRun = useRef(true);

  // Initialize baseline when ready
  useEffect(() => {
    if (isReady && data && initialDataRef.current === null) {
      initialDataRef.current = JSON.stringify(data);
      isFirstRun.current = true;
    }
  }, [isReady, data]);

  // Track data changes and trigger debounced auto save
  useEffect(() => {
    if (!isReady || !data) return;

    // Skip the very first render/fetch populate
    if (isFirstRun.current) {
      isFirstRun.current = false;
      return;
    }

    const currentStringified = JSON.stringify(data);
    if (initialDataRef.current && initialDataRef.current === currentStringified) {
      return; // No real change
    }

    triggerAutoSave(
      key,
      async () => {
        const result = await onSave(data);
        // Update baseline upon confirmed server response
        initialDataRef.current = JSON.stringify(data);
        return result;
      },
      { debounceMs }
    );
  }, [key, data, onSave, isReady, debounceMs, triggerAutoSave]);

  const markSavedImmediately = (newData?: T) => {
    if (newData) initialDataRef.current = JSON.stringify(newData);
    setSaveStatus('saved');
  };

  return { markSavedImmediately };
}
