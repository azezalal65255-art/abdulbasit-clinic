-- ==============================================================================
-- Supabase PostgreSQL Migration for Dr. Abdulbasit Clinic
-- Production Schema with RLS, RBAC, Indexes, and Constraints
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. ROLES & PERMISSIONS
CREATE TABLE IF NOT EXISTS roles (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO roles (id, name, description) VALUES
  ('super_admin', 'المدير العام', 'صلاحيات كاملة تشمل إدارة النظام والمستخدمين والبيانات'),
  ('admin', 'إدارة العيادة', 'إدارة الحجوزات والرسائل والجدول والمحتوى الطبي'),
  ('receptionist', 'الاستقبال والمواعيد', 'إدارة طلبات الحجز والرسائل ومتابعة المواعيد'),
  ('content_manager', 'مسؤول التحرير والمحتوى', 'إدارة الحالات الطبية والمقالات والأسئلة الشائعة')
ON CONFLICT (id) DO NOTHING;

-- 2. USERS
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(150) NOT NULL,
  phone VARCHAR(50),
  role_id VARCHAR(50) REFERENCES roles(id) ON DELETE SET NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. DOCTOR PROFILE
CREATE TABLE IF NOT EXISTS doctor_profile (
  id VARCHAR(50) PRIMARY KEY DEFAULT 'main_doctor',
  name VARCHAR(150) NOT NULL,
  title VARCHAR(200) NOT NULL,
  job_title VARCHAR(200),
  bio TEXT NOT NULL,
  photo_url VARCHAR(500),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS qualifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  degree VARCHAR(200) NOT NULL,
  institution VARCHAR(250) NOT NULL,
  description TEXT,
  icon_type VARCHAR(50) DEFAULT 'academic',
  display_order INT DEFAULT 0
);

-- 4. SERVICES
CREATE TABLE IF NOT EXISTS services (
  id VARCHAR(50) PRIMARY KEY,
  slug VARCHAR(100) UNIQUE NOT NULL,
  title VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  full_description TEXT,
  icon_name VARCHAR(100),
  image_url VARCHAR(500),
  features JSONB DEFAULT '[]'::jsonb,
  display_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. CONDITION CATEGORIES
CREATE TABLE IF NOT EXISTS condition_categories (
  id VARCHAR(50) PRIMARY KEY,
  slug VARCHAR(100) UNIQUE NOT NULL,
  name VARCHAR(150) NOT NULL,
  description TEXT,
  display_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE
);

INSERT INTO condition_categories (id, slug, name, description, display_order) VALUES
  ('cat_digestive', 'gastroenterology', 'أمراض الجهاز الهضمي والمعدة', 'تشخيص وعلاج اضطرابات المريء، المعدة، القولون، والأمعاء', 1),
  ('cat_liver', 'liver', 'أمراض الكبد والقنوات الصفراوية', 'تشخيص ومتابعة أمراض الكبد، التهابات الكبد الفيروسية والمناعية، والكبد الدهني', 2),
  ('cat_internal', 'internal-medicine', 'أمراض الباطنة العامة', 'التقييم الشامل للأمراض الباطنية المزمنة، ضغط الدم، السكري، وفقر الدم', 3),
  ('cat_endoscopy', 'endoscopy', 'مناظير الجهاز الهضمي التشخيصية والعلاجية', 'مناظير المعدة والقولون الدقيقة وأخذ العينات والتدخلات العلاجية', 4)
ON CONFLICT (id) DO NOTHING;

-- 6. MEDICAL CONDITIONS
CREATE TABLE IF NOT EXISTS conditions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug VARCHAR(150) UNIQUE NOT NULL,
  category_id VARCHAR(50) REFERENCES condition_categories(id) ON DELETE RESTRICT,
  name VARCHAR(200) NOT NULL,
  short_description TEXT NOT NULL,
  definition TEXT NOT NULL,
  common_symptoms JSONB DEFAULT '[]'::jsonb,
  causes JSONB DEFAULT '[]'::jsonb,
  risk_factors JSONB DEFAULT '[]'::jsonb,
  when_to_see_doctor JSONB DEFAULT '[]'::jsonb,
  diagnosis TEXT,
  tests JSONB DEFAULT '[]'::jsonb,
  needs_endoscopy TEXT,
  treatment_overview TEXT,
  general_tips JSONB DEFAULT '[]'::jsonb,
  faqs JSONB DEFAULT '[]'::jsonb,
  related_conditions JSONB DEFAULT '[]'::jsonb,
  related_articles JSONB DEFAULT '[]'::jsonb,
  related_services JSONB DEFAULT '[]'::jsonb,
  keywords JSONB DEFAULT '[]'::jsonb,
  image_url VARCHAR(500),
  display_order INT DEFAULT 0,
  is_featured BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_conditions_slug ON conditions(slug);
CREATE INDEX IF NOT EXISTS idx_conditions_category ON conditions(category_id);
CREATE INDEX IF NOT EXISTS idx_conditions_is_active ON conditions(is_active);

-- 7. ENDOSCOPY SERVICES
CREATE TABLE IF NOT EXISTS endoscopy_services (
  id VARCHAR(50) PRIMARY KEY,
  slug VARCHAR(150) UNIQUE NOT NULL,
  title VARCHAR(200) NOT NULL,
  short_description TEXT NOT NULL,
  full_description TEXT,
  indications JSONB DEFAULT '[]'::jsonb,
  preparation JSONB DEFAULT '[]'::jsonb,
  aftercare JSONB DEFAULT '[]'::jsonb,
  duration VARCHAR(100),
  is_sedated BOOLEAN DEFAULT TRUE,
  image_url VARCHAR(500),
  display_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. ARTICLE CATEGORIES & ARTICLES
CREATE TABLE IF NOT EXISTS article_categories (
  id VARCHAR(50) PRIMARY KEY,
  slug VARCHAR(100) UNIQUE NOT NULL,
  name VARCHAR(150) NOT NULL
);

CREATE TABLE IF NOT EXISTS articles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug VARCHAR(150) UNIQUE NOT NULL,
  category_id VARCHAR(50) REFERENCES article_categories(id) ON DELETE SET NULL,
  title VARCHAR(250) NOT NULL,
  excerpt TEXT NOT NULL,
  content TEXT NOT NULL,
  cover_image VARCHAR(500),
  reading_time_minutes INT DEFAULT 5,
  author_name VARCHAR(150) DEFAULT 'د. عبدالباسط عبده الحاج مقبل',
  status VARCHAR(30) DEFAULT 'published',
  published_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_articles_slug ON articles(slug);
CREATE INDEX IF NOT EXISTS idx_articles_status ON articles(status);

-- 9. FAQS
CREATE TABLE IF NOT EXISTS faqs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category VARCHAR(100) NOT NULL,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  display_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE
);

-- 10. BOOKINGS (Real patient appointment requests - NO FAKE DATA)
CREATE TABLE IF NOT EXISTS bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_name VARCHAR(150) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  visit_type VARCHAR(100) NOT NULL,
  service_id VARCHAR(50),
  requested_date DATE NOT NULL,
  period VARCHAR(30) NOT NULL CHECK (period IN ('morning', 'evening')),
  notes TEXT,
  status VARCHAR(30) NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'confirmed', 'completed', 'cancelled')),
  admin_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_created_at ON bookings(created_at DESC);

-- 11. MESSAGES (Real patient messages - NO FAKE DATA)
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(150) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  email VARCHAR(255),
  subject VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'read', 'replied')),
  admin_reply TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_messages_status ON messages(status);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);

-- 12. CLINIC SCHEDULE
CREATE TABLE IF NOT EXISTS clinic_schedule (
  id VARCHAR(50) PRIMARY KEY DEFAULT 'main_schedule',
  morning_hours VARCHAR(100) DEFAULT '9:00 صباحًا – 2:00 ظهرًا',
  evening_hours VARCHAR(100) DEFAULT '5:00 مساءً – 9:00 مساءً',
  working_days VARCHAR(150) DEFAULT 'السبت إلى الخميس',
  morning_active BOOLEAN DEFAULT TRUE,
  evening_active BOOLEAN DEFAULT TRUE,
  emergency_notice TEXT,
  is_notice_active BOOLEAN DEFAULT FALSE,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. CONTACT SETTINGS
CREATE TABLE IF NOT EXISTS contact_settings (
  id VARCHAR(50) PRIMARY KEY DEFAULT 'main_contact',
  phone_primary VARCHAR(50) NOT NULL DEFAULT '777554626',
  phone_secondary VARCHAR(50) DEFAULT '777560603',
  whatsapp VARCHAR(50) NOT NULL DEFAULT '777554626',
  email VARCHAR(255) DEFAULT 'baset.clinic@gmail.com',
  address TEXT NOT NULL DEFAULT 'مركز المأمون الطبي التشخيصي – صنعاء – شارع تعز – جولة تعز',
  address_short VARCHAR(200) DEFAULT 'صنعاء – شارع تعز – جولة تعز',
  building VARCHAR(200) DEFAULT 'مركز المأمون الطبي التشخيصي',
  city VARCHAR(100) DEFAULT 'صنعاء',
  country VARCHAR(100) DEFAULT 'اليمن',
  google_maps_url TEXT,
  facebook_url TEXT,
  instagram_url TEXT,
  youtube_url TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 14. SEO SETTINGS
CREATE TABLE IF NOT EXISTS seo_settings (
  id VARCHAR(50) PRIMARY KEY DEFAULT 'main_seo',
  default_meta_title VARCHAR(255) NOT NULL DEFAULT 'د. عبدالباسط عبده الحاج مقبل | استشاري الجهاز الهضمي والكبد والمناظير في صنعاء',
  default_meta_description TEXT NOT NULL DEFAULT 'الموقع الرسمي لعيادة د. عبدالباسط عبده الحاج مقبل، استشاري الباطنة والجهاز الهضمي والكبد والمناظير في صنعاء. تعرف على خدمات العيادة ومواعيد الدوام واحجز موعدك.',
  site_keywords JSONB DEFAULT '["دكتور جهاز هضمي صنعاء", "طبيب جهاز هضمي صنعاء", "دكتور كبد صنعاء", "مناظير الجهاز الهضمي صنعاء", "طبيب باطنة صنعاء", "عيادة الجهاز الهضمي صنعاء", "عبدالباسط عبده الحاج مقبل"]'::jsonb,
  canonical_url VARCHAR(500),
  og_title VARCHAR(255),
  og_description TEXT,
  og_image VARCHAR(500) DEFAULT '/images/clinic-logo.jpg',
  robots_txt TEXT DEFAULT 'User-agent: *\nAllow: /\nDisallow: /admin/\nSitemap: /sitemap.xml',
  sitemap_enabled BOOLEAN DEFAULT TRUE,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 15. MEDIA
CREATE TABLE IF NOT EXISTS media (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(200) NOT NULL,
  url VARCHAR(500) NOT NULL,
  alt_text VARCHAR(250),
  file_size VARCHAR(50),
  file_type VARCHAR(50),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 16. NOTIFICATIONS (Real activity only)
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(50) NOT NULL,
  link VARCHAR(255),
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 17. AUDIT LOGS (Real security logs only)
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID,
  user_name VARCHAR(150),
  user_role VARCHAR(50),
  action VARCHAR(100) NOT NULL,
  module VARCHAR(100) NOT NULL,
  details TEXT,
  ip_address VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 18. SITE SETTINGS
CREATE TABLE IF NOT EXISTS site_settings (
  id VARCHAR(50) PRIMARY KEY DEFAULT 'main_settings',
  site_name VARCHAR(200) NOT NULL DEFAULT 'عيادة د. عبدالباسط عبده الحاج مقبل',
  clinic_name VARCHAR(200) NOT NULL DEFAULT 'عيادة د. عبدالباسط عبده الحاج مقبل',
  doctor_name VARCHAR(200) NOT NULL DEFAULT 'د. عبدالباسط عبده الحاج مقبل',
  doctor_specialty VARCHAR(200) NOT NULL DEFAULT 'استشاري الباطنة والجهاز الهضمي والكبد والمناظير',
  logo_url VARCHAR(500) DEFAULT '/images/clinic-logo.jpg',
  favicon_url VARCHAR(500) DEFAULT '/favicon.ico',
  hero_headline VARCHAR(250) DEFAULT 'رعاية متخصصة لجهازك الهضمي وصحة كبدك',
  hero_subheadline TEXT DEFAULT 'تشخيص دقيق • علاج فعّال • رعاية شاملة',
  maintenance_mode BOOLEAN DEFAULT FALSE,
  ga_measurement_id VARCHAR(100),
  search_console_verification VARCHAR(255),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
ALTER TABLE conditions ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE endoscopy_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctor_profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinic_schedule ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE seo_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Public read access for active website content
CREATE POLICY "Public Read Active Conditions" ON conditions FOR SELECT USING (is_active = true);
CREATE POLICY "Public Read Active Services" ON services FOR SELECT USING (is_active = true);
CREATE POLICY "Public Read Active Endoscopy" ON endoscopy_services FOR SELECT USING (is_active = true);
CREATE POLICY "Public Read Published Articles" ON articles FOR SELECT USING (status = 'published');
CREATE POLICY "Public Read Active FAQs" ON faqs FOR SELECT USING (is_active = true);
CREATE POLICY "Public Read Doctor Profile" ON doctor_profile FOR SELECT USING (true);
CREATE POLICY "Public Read Schedule" ON clinic_schedule FOR SELECT USING (true);
CREATE POLICY "Public Read Contact" ON contact_settings FOR SELECT USING (true);
CREATE POLICY "Public Read SEO" ON seo_settings FOR SELECT USING (true);
CREATE POLICY "Public Read Site Settings" ON site_settings FOR SELECT USING (true);

-- Public can submit new bookings and contact messages
CREATE POLICY "Public Can Create Booking" ON bookings FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Can Create Message" ON messages FOR INSERT WITH CHECK (true);

-- Authenticated staff can read and manage bookings, messages, audit logs, and content
CREATE POLICY "Staff Full Access Bookings" ON bookings FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Staff Full Access Messages" ON messages FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Staff Full Access Conditions" ON conditions FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Staff Full Access Articles" ON articles FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Staff Full Access Services" ON services FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Staff Full Access Logs" ON audit_logs FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Staff Full Access Settings" ON site_settings FOR ALL USING (auth.role() = 'authenticated');
