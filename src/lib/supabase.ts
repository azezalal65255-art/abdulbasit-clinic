import { createClient } from '@supabase/supabase-js';

const defaultUrl = 'https://rmvhgoewsegyohdbsjsd.supabase.co';
const defaultKey = 'sb_publishable_yROJ40jpb1d5RdyfJ3zeRQ_hfN_VmPu';

const supabaseUrl =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_URL) ||
  (typeof process !== 'undefined' && (process.env?.VITE_SUPABASE_URL || process.env?.SUPABASE_URL)) ||
  defaultUrl;

const supabaseKey =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_PUBLISHABLE_KEY) ||
  (typeof process !== 'undefined' && (process.env?.VITE_SUPABASE_PUBLISHABLE_KEY || process.env?.SUPABASE_ANON_KEY)) ||
  defaultKey;

export const supabase = createClient(supabaseUrl, supabaseKey);

export const SUPABASE_CONFIG = {
  url: supabaseUrl,
  bucket: 'media',
  folders: {
    images: 'images',
    videos: 'videos',
  },
} as const;

export default supabase;

