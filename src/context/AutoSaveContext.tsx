import React, { createContext, useContext, useState, useRef, useCallback, ReactNode } from 'react';

export type AutoSaveStatus = 'idle' | 'saving' | 'saved' | 'error';

interface AutoSaveContextType {
  status: AutoSaveStatus;
  lastSavedAt: Date | null;
  errorMessage: string | null;
  /**
   * Queue or immediately trigger an auto-save operation.
   * Debounces by default (e.g. 1200ms) so rapid typing doesn't overload.
   */
  triggerAutoSave: (
    key: string,
    saveFn: () => Promise<any>,
    options?: { debounceMs?: number; immediate?: boolean }
  ) => void;
  /**
   * Set status directly when manual save/publish or specific view finishes
   */
  setSaveStatus: (status: AutoSaveStatus, error?: string) => void;
}

const AutoSaveContext = createContext<AutoSaveContextType | undefined>(undefined);

export const AutoSaveProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [status, setStatus] = useState<AutoSaveStatus>('idle');
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const timersRef = useRef<Record<string, any>>({});
  const activeSavesCountRef = useRef(0);
  const statusResetTimeoutRef = useRef<any>(null);

  const setSaveStatus = useCallback((newStatus: AutoSaveStatus, err?: string) => {
    setStatus(newStatus);
    if (newStatus === 'saved') {
      setLastSavedAt(new Date());
      setErrorMessage(null);
      // Keep "Saved" badge visible, revert to idle after 4 seconds
      if (statusResetTimeoutRef.current) clearTimeout(statusResetTimeoutRef.current);
      statusResetTimeoutRef.current = setTimeout(() => {
        setStatus((cur) => (cur === 'saved' ? 'idle' : cur));
      }, 4000);
    } else if (newStatus === 'error') {
      setErrorMessage(err || 'فشل الحفظ التلقائي في الخادم');
    }
  }, []);

  const triggerAutoSave = useCallback(
    (
      key: string,
      saveFn: () => Promise<any>,
      options?: { debounceMs?: number; immediate?: boolean }
    ) => {
      const debounceMs = options?.debounceMs ?? 1300;

      // Clear existing debounce timer for this specific key
      if (timersRef.current[key]) {
        clearTimeout(timersRef.current[key]);
      }

      const executeSave = async () => {
        delete timersRef.current[key];
        activeSavesCountRef.current += 1;
        setStatus('saving');

        try {
          // Await server confirmation - ONLY marked as saved after server confirms!
          await saveFn();
          activeSavesCountRef.current = Math.max(0, activeSavesCountRef.current - 1);

          if (activeSavesCountRef.current === 0) {
            setSaveStatus('saved');
          }
        } catch (err: any) {
          activeSavesCountRef.current = Math.max(0, activeSavesCountRef.current - 1);
          console.error(`[AutoSave Error on ${key}]:`, err);
          setSaveStatus('error', err?.message || 'تعذر الحفظ في قاعدة البيانات');
        }
      };

      if (options?.immediate) {
        executeSave();
      } else {
        timersRef.current[key] = setTimeout(executeSave, debounceMs);
      }
    },
    [setSaveStatus]
  );

  return (
    <AutoSaveContext.Provider
      value={{
        status,
        lastSavedAt,
        errorMessage,
        triggerAutoSave,
        setSaveStatus,
      }}
    >
      {children}
    </AutoSaveContext.Provider>
  );
};

export function useAutoSave() {
  const context = useContext(AutoSaveContext);
  if (!context) {
    throw new Error('useAutoSave must be used within an AutoSaveProvider');
  }
  return context;
}
