
-- =========================================================================
-- COMPLETE SUPABASE POSTGRESQL SCHEMA FOR DR. ABDULBASIT CLINIC
-- Generated for persistent relational storage with full RLS policies
-- =========================================================================

-- 1. USERS
CREATE TABLE IF NOT EXISTS public.users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'viewer',
  password_hash TEXT NOT NULL,
  phone TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_login TIMESTAMPTZ
);

-- 2. DOCTOR PROFILE
CREATE TABLE IF NOT EXISTS public.doctor (
  id TEXT PRIMARY KEY DEFAULT 'doctor_profile',
  name TEXT NOT NULL,
  title TEXT,
  job_title TEXT,
  bio TEXT,
  photo TEXT,
  experiences JSONB DEFAULT '[]'::jsonb,
  qualifications JSONB DEFAULT '[]'::jsonb,
  experience_years INT DEFAULT 15,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. SERVICES
CREATE TABLE IF NOT EXISTS public.services (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  full_description TEXT,
  icon_name TEXT,
  image TEXT,
  features JSONB DEFAULT '[]'::jsonb,
  meta_title TEXT,
  meta_description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  "order" INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. CATEGORIES
CREATE TABLE IF NOT EXISTS public.categories (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  "order" INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. CONDITIONS
CREATE TABLE IF NOT EXISTS public.conditions (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  category TEXT,
  icon TEXT,
  description TEXT,
  image TEXT,
  image_url TEXT,
  symptoms JSONB DEFAULT '[]'::jsonb,
  treatment_approach TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  "order" INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. ENDOSCOPY
CREATE TABLE IF NOT EXISTS public.endoscopy (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  image TEXT,
  indications JSONB DEFAULT '[]'::jsonb,
  duration TEXT,
  prep_summary TEXT,
  pre_instructions JSONB DEFAULT '[]'::jsonb,
  post_instructions JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN DEFAULT TRUE,
  "order" INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. ARTICLES
CREATE TABLE IF NOT EXISTS public.articles (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  excerpt TEXT,
  content TEXT,
  category TEXT,
  author TEXT,
  read_time TEXT,
  date TEXT,
  image TEXT,
  tags JSONB DEFAULT '[]'::jsonb,
  meta_title TEXT,
  meta_description TEXT,
  status TEXT DEFAULT 'published',
  views INT DEFAULT 0,
  keywords TEXT,
  is_deleted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. CUSTOM PAGES
CREATE TABLE IF NOT EXISTS public.pages (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  excerpt TEXT,
  content TEXT,
  cover_image TEXT,
  meta_title TEXT,
  meta_description TEXT,
  keywords TEXT,
  show_in_header BOOLEAN DEFAULT TRUE,
  show_in_footer BOOLEAN DEFAULT TRUE,
  "order" INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. FAQS
CREATE TABLE IF NOT EXISTS public.faqs (
  id TEXT PRIMARY KEY,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  category TEXT,
  "order" INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. BOOKINGS
CREATE TABLE IF NOT EXISTS public.bookings (
  id TEXT PRIMARY KEY,
  patient_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  whatsapp TEXT,
  gender TEXT,
  visit_type TEXT,
  service_id TEXT,
  preferred_date TEXT,
  preferred_shift TEXT,
  preferred_time TEXT,
  notes TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. MESSAGES
CREATE TABLE IF NOT EXISTS public.messages (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  subject TEXT,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'unread',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. SCHEDULE
CREATE TABLE IF NOT EXISTS public.schedule (
  id TEXT PRIMARY KEY DEFAULT 'schedule_settings',
  morning_hours TEXT,
  evening_hours TEXT,
  working_days JSONB DEFAULT '[]'::jsonb,
  morning_active BOOLEAN DEFAULT TRUE,
  evening_active BOOLEAN DEFAULT TRUE,
  emergency_notice TEXT,
  is_notice_active BOOLEAN DEFAULT FALSE,
  holidays JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. CONTACT
CREATE TABLE IF NOT EXISTS public.contact (
  id TEXT PRIMARY KEY DEFAULT 'contact_settings',
  phone1 TEXT,
  phone2 TEXT,
  whatsapp TEXT,
  email TEXT,
  address TEXT,
  address_short TEXT,
  building TEXT,
  city TEXT,
  country TEXT,
  google_maps_url TEXT,
  google_maps_embed TEXT,
  facebook TEXT,
  instagram TEXT,
  youtube TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 14. MEDIA
CREATE TABLE IF NOT EXISTS public.media (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  file_name TEXT,
  title TEXT,
  storage_path TEXT NOT NULL,
  public_url TEXT,
  url TEXT,
  file_type TEXT,
  mime_type TEXT,
  file_size BIGINT DEFAULT 0,
  category TEXT DEFAULT 'general',
  alt_text TEXT,
  status TEXT DEFAULT 'active',
  media_status TEXT DEFAULT 'active',
  is_video BOOLEAN DEFAULT FALSE,
  usages JSONB DEFAULT '[]'::jsonb,
  in_use BOOLEAN DEFAULT FALSE,
  uploaded_by TEXT,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 15. SEO
CREATE TABLE IF NOT EXISTS public.seo (
  id TEXT PRIMARY KEY DEFAULT 'seo_settings',
  default_meta_title TEXT,
  default_meta_description TEXT,
  site_keywords TEXT,
  canonical_url TEXT,
  og_title TEXT,
  og_description TEXT,
  og_image TEXT,
  robots_txt TEXT,
  sitemap_enabled BOOLEAN DEFAULT TRUE,
  schemas JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 16. SETTINGS
CREATE TABLE IF NOT EXISTS public.settings (
  id TEXT PRIMARY KEY DEFAULT 'site_settings',
  site_name TEXT,
  clinic_name TEXT,
  doctor_name TEXT,
  doctor_specialty TEXT,
  logo_url TEXT,
  favicon_url TEXT,
  hero_badge TEXT,
  hero_headline TEXT,
  hero_subheadline TEXT,
  book_button_text TEXT,
  contact_button_text TEXT,
  default_whats_app_text TEXT,
  maintenance_mode BOOLEAN DEFAULT FALSE,
  footer_copyright TEXT,
  sections_config JSONB DEFAULT '{}'::jsonb,
  sections_order JSONB DEFAULT '[]'::jsonb,
  banners JSONB DEFAULT '[]'::jsonb,
  whatsapp_number TEXT,
  hero_doctor_photo TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 17. VIDEOS
CREATE TABLE IF NOT EXISTS public.videos (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  youtube_url TEXT,
  youtube_id TEXT,
  thumbnail_url TEXT,
  duration TEXT,
  "order" INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 18. CAREERS
CREATE TABLE IF NOT EXISTS public.careers (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  department TEXT,
  description TEXT,
  requirements JSONB DEFAULT '[]'::jsonb,
  experience TEXT,
  location TEXT,
  employment_type TEXT,
  deadline TEXT,
  posted_date TEXT,
  status TEXT DEFAULT 'active',
  "order" INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 19. JOB APPLICATIONS
CREATE TABLE IF NOT EXISTS public.job_applications (
  id TEXT PRIMARY KEY,
  career_id TEXT,
  applicant_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  resume_url TEXT,
  cover_letter TEXT,
  status TEXT DEFAULT 'received',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 20. CONFERENCES
CREATE TABLE IF NOT EXISTS public.conferences (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  image TEXT,
  date TEXT,
  location TEXT,
  short_description TEXT,
  details TEXT,
  organizer TEXT,
  year TEXT,
  role TEXT,
  description TEXT,
  certificate_url TEXT,
  "order" INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 21. RESEARCH
CREATE TABLE IF NOT EXISTS public.research (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  authors JSONB DEFAULT '[]'::jsonb,
  year TEXT,
  institution TEXT,
  journal TEXT,
  abstract TEXT,
  pdf_url TEXT,
  "order" INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 22. SLIDERS
CREATE TABLE IF NOT EXISTS public.sliders (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  subtitle TEXT,
  description TEXT,
  image_url TEXT,
  image TEXT,
  badge_text TEXT,
  button_text TEXT,
  button_link TEXT,
  secondary_button_text TEXT,
  secondary_button_link TEXT,
  "order" INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 23. NOTIFICATIONS
CREATE TABLE IF NOT EXISTS public.notifications (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'info',
  is_read BOOLEAN DEFAULT FALSE,
  link TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 24. ACTIVITY LOGS
CREATE TABLE IF NOT EXISTS public.activity_logs (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  user_name TEXT,
  user_role TEXT,
  action TEXT NOT NULL,
  module TEXT NOT NULL,
  details TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- 25. ANALYTICS
CREATE TABLE IF NOT EXISTS public.analytics (
  id TEXT PRIMARY KEY DEFAULT 'analytics_data',
  total_visits INT DEFAULT 0,
  whatsapp_clicks INT DEFAULT 0,
  phone_clicks INT DEFAULT 0,
  booking_form_submissions INT DEFAULT 0,
  page_views INT DEFAULT 0,
  devices JSONB DEFAULT '{"desktop": 0, "mobile": 0, "tablet": 0}'::jsonb,
  daily_visits JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 26. RECYCLE BIN
CREATE TABLE IF NOT EXISTS public.recycle_bin (
  id TEXT PRIMARY KEY,
  entity_type TEXT NOT NULL,
  original_id TEXT NOT NULL,
  data JSONB NOT NULL,
  deleted_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_by TEXT
);

-- =========================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES FOR DATABASE TABLES
-- Allows public reads for active published website content
-- Allows authenticated/backend management for all operations
-- =========================================================================

DO $$
DECLARE
  tbl text;
BEGIN
  FOR tbl IN
    SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'
  LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY;', tbl);
    EXECUTE format('DROP POLICY IF EXISTS "Public Read All" ON public.%I;', tbl);
    EXECUTE format('CREATE POLICY "Public Read All" ON public.%I FOR SELECT USING (true);', tbl);
    EXECUTE format('DROP POLICY IF EXISTS "Anon Insert Manage" ON public.%I;', tbl);
    EXECUTE format('CREATE POLICY "Anon Insert Manage" ON public.%I FOR ALL TO anon, authenticated, service_role USING (true) WITH CHECK (true);', tbl);
  END LOOP;
END $$;

-- =========================================================================
-- STORAGE CONFIGURATION & RLS POLICIES FOR SUPABASE STORAGE ('media' BUCKET)
-- =========================================================================

-- 1. Ensure 'media' bucket exists and is set to public
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'media',
  'media',
  true,
  26214400, -- 25MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml', 'image/x-icon', 'video/mp4', 'video/webm', 'application/pdf']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 26214400;

-- 2. Drop any legacy restrictive policies
DROP POLICY IF EXISTS "Public Select media" ON storage.objects;
DROP POLICY IF EXISTS "Public Insert media" ON storage.objects;
DROP POLICY IF EXISTS "Public Update media" ON storage.objects;
DROP POLICY IF EXISTS "Public Delete media" ON storage.objects;
DROP POLICY IF EXISTS "Allow All to media bucket" ON storage.objects;

-- 3. Create full access policy for media bucket (SELECT, INSERT, UPDATE, DELETE)
CREATE POLICY "Allow All to media bucket" ON storage.objects
FOR ALL
TO anon, authenticated, service_role
USING (bucket_id = 'media')
WITH CHECK (bucket_id = 'media');

