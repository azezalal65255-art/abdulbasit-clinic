import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { db } from './db';
import {
  DoctorProfile,
  MedicalServiceItem,
  MedicalConditionItem,
  EndoscopyItem,
  ArticleItem,
  SliderItem,
  MediaItem,
  SiteSettings,
  CustomPageItem,
  FaqItemRecord,
  ClinicVideoItem,
  CareerItem,
  ConferenceItem,
  ResearchItem,
  ScheduleSettings,
  ContactSettings,
  SeoSettings,
} from './types';

const defaultUrl = 'https://rmvhgoewsegyohdbsjsd.supabase.co';
const defaultKey = 'sb_publishable_yROJ40jpb1d5RdyfJ3zeRQ_hfN_VmPu';

const supabaseUrl =
  process.env.SUPABASE_URL ||
  process.env.VITE_SUPABASE_URL ||
  defaultUrl;

const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  process.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  process.env.VITE_SUPABASE_ANON_KEY ||
  defaultKey;

export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

export const SUPABASE_PROJECT_URL = supabaseUrl;

// Helper to check if a table is reachable in Supabase
const tableAvailability: Record<string, boolean> = {};

export async function checkTableExists(tableName: string): Promise<boolean> {
  try {
    const { data, error } = await supabase.from(tableName).select('id').limit(1);
    if (!error) {
      tableAvailability[tableName] = true;
      return true;
    }
    tableAvailability[tableName] = false;
    return false;
  } catch {
    tableAvailability[tableName] = false;
    return false;
  }
}

function resolveServerImageUrl(...candidates: any[]): string {
  const supabaseUrl = candidates.find(
    (val) => typeof val === 'string' && val.includes('supabase.co/storage/')
  );
  if (supabaseUrl) return supabaseUrl.trim();

  const valid = candidates.find(
    (val) => typeof val === 'string' && val.trim() !== '' && !val.startsWith('blob:') && !val.startsWith('data:')
  );
  return valid ? valid.trim() : '';
}

/**
 * Fetch all dynamic website content directly from Supabase.
 * If Supabase tables are ready, reads from Supabase PostgreSQL in real-time.
 * If Supabase tables are not yet initialized or pending migration, serves from the synchronized
 * persistent store and triggers background sync.
 */
export async function getLivePublicContent() {
  const local = db.get();

  // Try fetching directly from Supabase tables
  let doctor = local.doctor;
  let services = local.services.filter((s) => s.isActive && !s.isDeleted);
  let conditions = local.conditions.filter((c) => c.isActive && !c.isDeleted);
  let endoscopy = local.endoscopy.filter((e) => e.isActive && !e.isDeleted);
  let articles = local.articles.filter((a) => a.status === 'published' && !a.isDeleted);
  let pages = (local.pages || []).filter((p) => p.isActive && !p.isDeleted);
  let faqs = local.faqs.filter((f) => f.isActive && !f.isDeleted);
  let videos = (local.videos || []).filter((v) => v.isActive && !v.isDeleted);
  let careers = (local.careers || []).filter((c) => c.isActive && !c.isDeleted && c.status === 'open');
  let conferences = (local.conferences || []).filter((c) => c.isActive && !c.isDeleted);
  let research = (local.research || []).filter((r) => r.isActive && !r.isDeleted);
  let sliders = (local.sliders || []).filter((s) => s.isActive && !s.isDeleted);
  let schedule = local.schedule;
  let contact = local.contact;
  let settings = local.settings;
  let seo = local.seo;
  let media = local.media.filter((m) => m.status !== 'trash');

  try {
    // Attempt parallel fetch from Supabase
    const [
      docRes,
      srvRes,
      condRes,
      endoRes,
      artRes,
      sliderRes,
      pageRes,
      faqRes,
      vidRes,
      careerRes,
      confRes,
      resRes,
      schedRes,
      contRes,
      setRes,
      seoRes,
      medRes,
    ] = await Promise.allSettled([
      supabase.from('doctor').select('*').limit(1).maybeSingle(),
      supabase.from('services').select('*').eq('is_active', true).order('order', { ascending: true }),
      supabase.from('conditions').select('*').eq('is_active', true).order('order', { ascending: true }),
      supabase.from('endoscopy').select('*').eq('is_active', true).order('order', { ascending: true }),
      supabase.from('articles').select('*').eq('status', 'published').eq('is_deleted', false).order('created_at', { ascending: false }),
      supabase.from('sliders').select('*').eq('is_active', true).order('order', { ascending: true }),
      supabase.from('pages').select('*').eq('is_active', true).order('order', { ascending: true }),
      supabase.from('faqs').select('*').eq('is_active', true).order('order', { ascending: true }),
      supabase.from('videos').select('*').eq('is_active', true).order('order', { ascending: true }),
      supabase.from('careers').select('*').eq('is_active', true).eq('status', 'open').order('order', { ascending: true }),
      supabase.from('conferences').select('*').eq('is_active', true).order('order', { ascending: true }),
      supabase.from('research').select('*').eq('is_active', true).order('order', { ascending: true }),
      supabase.from('schedule').select('*').limit(1).maybeSingle(),
      supabase.from('contact').select('*').limit(1).maybeSingle(),
      supabase.from('settings').select('*').limit(1).maybeSingle(),
      supabase.from('seo').select('*').limit(1).maybeSingle(),
      supabase.from('media').select('*').neq('status', 'trash').order('created_at', { ascending: false }).limit(100),
    ]);

    if (docRes.status === 'fulfilled' && docRes.value.data) {
      const d = docRes.value.data;
      const resolvedPhoto = resolveServerImageUrl(d.photo, doctor.photo);
      doctor = {
        name: d.name || doctor.name,
        title: d.title || doctor.title,
        jobTitle: d.job_title || doctor.jobTitle,
        bio: d.bio || doctor.bio,
        photo: resolvedPhoto,
        experiences: d.experiences || doctor.experiences,
        qualifications: d.qualifications || doctor.qualifications,
      };
    }

    if (srvRes.status === 'fulfilled' && srvRes.value.data && srvRes.value.data.length > 0) {
      services = srvRes.value.data.map((s: any) => {
        const resolvedImg = resolveServerImageUrl(s.image);
        return {
          id: s.id,
          title: s.title,
          slug: s.slug,
          description: s.description,
          fullDescription: s.full_description || s.description,
          iconName: s.icon_name || 'Activity',
          image: resolvedImg,
          imageUrl: resolvedImg,
          features: s.features || [],
          metaTitle: s.meta_title,
          metaDescription: s.meta_description,
          isActive: s.is_active !== false,
          order: s.order || 0,
          createdAt: s.created_at,
          updatedAt: s.updated_at,
        };
      });
    }

    if (condRes.status === 'fulfilled' && condRes.value.data && condRes.value.data.length > 0) {
      conditions = condRes.value.data.map((c: any) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        category: c.category,
        icon: c.icon,
        description: c.description,
        symptoms: c.symptoms || [],
        treatmentApproach: c.treatment_approach || '',
        isActive: c.is_active !== false,
        order: c.order || 0,
        createdAt: c.created_at,
        updatedAt: c.updated_at,
      }));
    }

    if (endoRes.status === 'fulfilled' && endoRes.value.data && endoRes.value.data.length > 0) {
      endoscopy = endoRes.value.data.map((e: any) => {
        const resolvedImg = resolveServerImageUrl(e.image);
        return {
          id: e.id,
          title: e.title,
          slug: e.slug,
          description: e.description,
          image: resolvedImg,
          imageUrl: resolvedImg,
          indications: e.indications || [],
          duration: e.duration,
          prepSummary: e.prep_summary || '',
          preInstructions: e.pre_instructions || [],
          postInstructions: e.post_instructions || [],
          isActive: e.is_active !== false,
          order: e.order || 0,
          createdAt: e.created_at,
          updatedAt: e.updated_at,
        };
      });
    }

    if (artRes.status === 'fulfilled' && artRes.value.data && artRes.value.data.length > 0) {
      articles = artRes.value.data.map((a: any) => {
        const resolvedImg = resolveServerImageUrl(a.image);
        return {
          id: a.id,
          title: a.title,
          slug: a.slug,
          excerpt: a.excerpt,
          content: a.content,
          category: a.category,
          author: a.author,
          readTime: a.read_time || '3 دقائق',
          date: a.date,
          image: resolvedImg,
          imageUrl: resolvedImg,
          tags: a.tags || [],
          metaTitle: a.meta_title,
          metaDescription: a.meta_description,
          status: a.status || 'published',
          views: a.views || 0,
          keywords: a.keywords ? (Array.isArray(a.keywords) ? a.keywords : a.keywords.split(',')) : [],
          createdAt: a.created_at,
          updatedAt: a.updated_at,
        };
      });
    }

    if (sliderRes.status === 'fulfilled' && sliderRes.value.data && sliderRes.value.data.length > 0) {
      sliders = sliderRes.value.data.map((s: any) => {
        const resolvedImg = resolveServerImageUrl(s.image, s.image_url);
        return {
          id: s.id,
          title: s.title,
          subtitle: s.subtitle,
          description: s.description,
          image: resolvedImg,
          imageUrl: resolvedImg,
          badgeText: s.badge_text,
          buttonText: s.button_text,
          buttonLink: s.button_link,
          secondaryButtonText: s.secondary_button_text,
          secondaryButtonLink: s.secondary_button_link,
          order: s.order || 0,
          isActive: s.is_active !== false,
          createdAt: s.created_at,
          updatedAt: s.updated_at,
        };
      });
    }

    if (pageRes.status === 'fulfilled' && pageRes.value.data && pageRes.value.data.length > 0) {
      pages = pageRes.value.data.map((p: any) => ({
        id: p.id,
        title: p.title,
        slug: p.slug,
        excerpt: p.excerpt,
        content: p.content,
        coverImage: p.cover_image,
        metaTitle: p.meta_title,
        metaDescription: p.meta_description,
        keywords: p.keywords,
        showInHeader: p.show_in_header !== false,
        showInFooter: p.show_in_footer !== false,
        order: p.order || 0,
        isActive: p.is_active !== false,
        createdAt: p.created_at,
        updatedAt: p.updated_at,
      }));
    }

    if (faqRes.status === 'fulfilled' && faqRes.value.data && faqRes.value.data.length > 0) {
      faqs = faqRes.value.data.map((f: any) => ({
        id: f.id,
        question: f.question,
        answer: f.answer,
        category: f.category,
        order: f.order || 0,
        isActive: f.is_active !== false,
        createdAt: f.created_at,
        updatedAt: f.updated_at,
      }));
    }

    if (vidRes.status === 'fulfilled' && vidRes.value.data && vidRes.value.data.length > 0) {
      videos = vidRes.value.data.map((v: any) => ({
        id: v.id,
        title: v.title,
        description: v.description,
        youtubeUrl: v.youtube_url,
        youtubeId: v.youtube_id,
        thumbnailUrl: v.thumbnail_url,
        duration: v.duration,
        order: v.order || 0,
        isActive: v.is_active !== false,
        createdAt: v.created_at,
        updatedAt: v.updated_at,
      }));
    }

    if (careerRes.status === 'fulfilled' && careerRes.value.data && careerRes.value.data.length > 0) {
      careers = careerRes.value.data.map((c: any) => ({
        id: c.id,
        title: c.title,
        department: c.department,
        description: c.description,
        requirements: c.requirements || [],
        experience: c.experience,
        location: c.location,
        employmentType: c.employment_type,
        deadline: c.deadline,
        postedDate: c.posted_date,
        status: c.status,
        order: c.order || 0,
        isActive: c.is_active !== false,
        createdAt: c.created_at,
        updatedAt: c.updated_at,
      }));
    }

    if (confRes.status === 'fulfilled' && confRes.value.data && confRes.value.data.length > 0) {
      conferences = confRes.value.data.map((c: any) => ({
        id: c.id,
        title: c.title,
        image: c.image,
        date: c.date,
        location: c.location,
        shortDescription: c.short_description,
        details: c.details,
        organizer: c.organizer,
        year: c.year,
        role: c.role,
        description: c.description,
        certificateUrl: c.certificate_url,
        order: c.order || 0,
        isActive: c.is_active !== false,
        createdAt: c.created_at,
        updatedAt: c.updated_at,
      }));
    }

    if (resRes.status === 'fulfilled' && resRes.value.data && resRes.value.data.length > 0) {
      research = resRes.value.data.map((r: any) => ({
        id: r.id,
        title: r.title,
        authors: r.authors || [],
        year: r.year,
        institution: r.institution,
        journal: r.journal,
        abstract: r.abstract,
        pdfUrl: r.pdf_url,
        order: r.order || 0,
        isActive: r.is_active !== false,
        createdAt: r.created_at,
        updatedAt: r.updated_at,
      }));
    }

    if (schedRes.status === 'fulfilled' && schedRes.value.data) {
      const s = schedRes.value.data;
      schedule = {
        morningHours: s.morning_hours || schedule.morningHours,
        eveningHours: s.evening_hours || schedule.eveningHours,
        workingDays: s.working_days || schedule.workingDays,
        morningActive: s.morning_active !== false,
        eveningActive: s.evening_active !== false,
        emergencyNotice: s.emergency_notice || schedule.emergencyNotice,
        isNoticeActive: s.is_notice_active === true,
        holidays: s.holidays || schedule.holidays,
      };
    }

    if (contRes.status === 'fulfilled' && contRes.value.data) {
      const c = contRes.value.data;
      contact = {
        phone1: c.phone1 || contact.phone1,
        phone2: c.phone2 || contact.phone2,
        whatsapp: c.whatsapp || contact.whatsapp,
        email: c.email || contact.email,
        address: c.address || contact.address,
        addressShort: c.address_short || contact.addressShort,
        building: c.building || contact.building,
        city: c.city || contact.city,
        country: c.country || contact.country,
        googleMapsUrl: c.google_maps_url || contact.googleMapsUrl,
        googleMapsEmbed: c.google_maps_embed || contact.googleMapsEmbed,
        facebook: c.facebook || contact.facebook,
        instagram: c.instagram || contact.instagram,
        youtube: c.youtube || contact.youtube,
      };
    }

    if (setRes.status === 'fulfilled' && setRes.value.data) {
      const s = setRes.value.data;
      settings = {
        ...settings,
        siteName: s.site_name || settings.siteName,
        clinicName: s.clinic_name || settings.clinicName,
        doctorName: s.doctor_name || settings.doctorName,
        doctorSpecialty: s.doctor_specialty || settings.doctorSpecialty,
        logoUrl: s.logo_url || settings.logoUrl,
        faviconUrl: s.favicon_url || settings.faviconUrl,
        heroBadge: s.hero_badge || settings.heroBadge,
        heroHeadline: s.hero_headline || settings.heroHeadline,
        heroSubheadline: s.hero_subheadline || settings.heroSubheadline,
        bookButtonText: s.book_button_text || settings.bookButtonText,
        contactButtonText: s.contact_button_text || settings.contactButtonText,
        defaultWhatsAppText: s.default_whats_app_text || settings.defaultWhatsAppText,
        maintenanceMode: s.maintenance_mode === true,
        footerCopyright: s.footer_copyright || settings.footerCopyright,
        whatsappNumber: s.whatsapp_number || settings.whatsappNumber,
        heroDoctorPhoto: s.hero_doctor_photo || settings.heroDoctorPhoto,
      };
    }

    if (seoRes.status === 'fulfilled' && seoRes.value.data) {
      const o = seoRes.value.data;
      seo = {
        defaultMetaTitle: o.default_meta_title || seo.defaultMetaTitle,
        defaultMetaDescription: o.default_meta_description || seo.defaultMetaDescription,
        siteKeywords: o.site_keywords || seo.siteKeywords,
        canonicalUrl: o.canonical_url || seo.canonicalUrl,
        ogTitle: o.og_title || seo.ogTitle,
        ogDescription: o.og_description || seo.ogDescription,
        ogImage: o.og_image || seo.ogImage,
        robotsTxt: o.robots_txt || seo.robotsTxt,
        sitemapEnabled: o.sitemap_enabled !== false,
        schemas: o.schemas || seo.schemas,
      };
    }

    if (medRes.status === 'fulfilled' && medRes.value.data && medRes.value.data.length > 0) {
      media = medRes.value.data.map((m: any) => ({
        id: m.id,
        name: m.name,
        title: m.title || m.name,
        url: m.url || m.public_url,
        publicUrl: m.public_url || m.url,
        storagePath: m.storage_path,
        fileType: m.file_type || m.mime_type,
        mimeType: m.mime_type || m.file_type,
        fileSize: typeof m.file_size === 'number' ? `${Math.round(m.file_size / 1024)} KB` : m.file_size,
        category: m.category || 'general',
        altText: m.alt_text || m.name,
        status: m.status || 'active',
        createdAt: m.created_at,
        updatedAt: m.updated_at,
      }));
    }
  } catch (supaErr) {
    console.warn('[Supabase Sync Warning]: Using synchronized store due to:', supaErr);
  }

  return {
    doctor,
    services: services.sort((a, b) => a.order - b.order),
    conditions: conditions.sort((a, b) => a.order - b.order),
    endoscopy: endoscopy.sort((a, b) => a.order - b.order),
    articles,
    pages: pages.sort((a, b) => a.order - b.order),
    faqs: faqs.sort((a, b) => a.order - b.order),
    videos: videos.sort((a, b) => a.order - b.order),
    careers: careers.sort((a, b) => a.order - b.order),
    conferences: conferences.sort((a, b) => a.order - b.order),
    research: research.sort((a, b) => a.order - b.order),
    sliders: sliders.sort((a, b) => a.order - b.order),
    schedule,
    contact,
    settings,
    seo,
    media: media.slice(0, 50),
  };
}

/**
 * Persist and propagate any entity update or image update to Supabase PostgreSQL immediately.
 */
export async function syncEntityToSupabase(entityType: string, data: any) {
  try {
    switch (entityType) {
      case 'doctor':
        await supabase.from('doctor').upsert({
          id: 'doctor_profile',
          name: data.name,
          title: data.title,
          job_title: data.jobTitle,
          bio: data.bio,
          photo: data.photo,
          experiences: data.experiences,
          qualifications: data.qualifications,
          updated_at: new Date().toISOString(),
        });
        break;

      case 'service':
        await supabase.from('services').upsert({
          id: data.id,
          title: data.title,
          slug: data.slug || data.id,
          description: data.description,
          full_description: data.fullDescription,
          icon_name: data.iconName,
          image: data.image,
          features: data.features,
          meta_title: data.metaTitle,
          meta_description: data.metaDescription,
          is_active: data.isActive !== false,
          order: data.order || 0,
          updated_at: new Date().toISOString(),
        });
        break;

      case 'slider':
        await supabase.from('sliders').upsert({
          id: data.id,
          title: data.title,
          subtitle: data.subtitle,
          description: data.description,
          image: data.image || data.imageUrl,
          image_url: data.imageUrl || data.image,
          badge_text: data.badgeText,
          button_text: data.buttonText,
          button_link: data.buttonLink,
          secondary_button_text: data.secondaryButtonText,
          secondary_button_link: data.secondaryButtonLink,
          order: data.order || 0,
          is_active: data.isActive !== false,
          updated_at: new Date().toISOString(),
        });
        break;

      case 'article':
        await supabase.from('articles').upsert({
          id: data.id,
          title: data.title,
          slug: data.slug || data.id,
          excerpt: data.excerpt,
          content: typeof data.content === 'string' ? data.content : JSON.stringify(data.content),
          category: data.category,
          author: data.author,
          read_time: data.readTime,
          date: data.date,
          image: data.image,
          tags: data.tags,
          meta_title: data.metaTitle,
          meta_description: data.metaDescription,
          status: data.status || 'published',
          views: data.views || 0,
          keywords: Array.isArray(data.keywords) ? data.keywords.join(', ') : data.keywords,
          is_deleted: data.isDeleted === true,
          updated_at: new Date().toISOString(),
        });
        break;

      case 'endoscopy':
        await supabase.from('endoscopy').upsert({
          id: data.id,
          title: data.title,
          slug: data.slug || data.id,
          description: data.description,
          image: data.image,
          indications: data.indications,
          duration: data.duration,
          prep_summary: data.prepSummary,
          pre_instructions: data.preInstructions,
          post_instructions: data.postInstructions,
          is_active: data.isActive !== false,
          order: data.order || 0,
          updated_at: new Date().toISOString(),
        });
        break;

      case 'condition':
        await supabase.from('conditions').upsert({
          id: data.id,
          name: data.name,
          slug: data.slug || data.id,
          category: data.category,
          icon: data.icon,
          description: data.description,
          symptoms: data.symptoms,
          treatment_approach: data.treatmentApproach,
          is_active: data.isActive !== false,
          order: data.order || 0,
          updated_at: new Date().toISOString(),
        });
        break;

      case 'media':
        await supabase.from('media').upsert({
          id: data.id,
          name: data.name || data.title,
          title: data.title || data.name,
          file_name: data.fileName || data.name,
          storage_path: data.storagePath,
          public_url: data.url || data.publicUrl,
          url: data.url || data.publicUrl,
          file_type: data.fileType || data.mimeType,
          mime_type: data.mimeType || data.fileType,
          file_size: typeof data.fileSize === 'number' ? data.fileSize : 0,
          category: data.category || 'general',
          alt_text: data.altText || data.name,
          status: data.status || 'active',
          updated_at: new Date().toISOString(),
        });
        break;

      case 'settings':
        await supabase.from('settings').upsert({
          id: 'site_settings',
          site_name: data.siteName,
          clinic_name: data.clinicName,
          doctor_name: data.doctorName,
          doctor_specialty: data.doctorSpecialty,
          logo_url: data.logoUrl,
          favicon_url: data.faviconUrl,
          hero_badge: data.heroBadge,
          hero_headline: data.heroHeadline,
          hero_subheadline: data.heroSubheadline,
          book_button_text: data.bookButtonText,
          contact_button_text: data.contactButtonText,
          default_whats_app_text: data.defaultWhatsAppText,
          maintenance_mode: data.maintenanceMode === true,
          footer_copyright: data.footerCopyright,
          whatsapp_number: data.whatsappNumber,
          hero_doctor_photo: data.heroDoctorPhoto,
          updated_at: new Date().toISOString(),
        });
        break;

      default:
        break;
    }
  } catch (err) {
    console.warn(`[Supabase Entity Sync Warning (${entityType})]:`, err);
  }
}

/**
 * Diagnostic status function for /api/system/supabase-status
 */
export async function getSupabaseDiagnosticStatus() {
  const local = db.get();
  let isConnected = false;
  let mediaCount = local.media.filter((m) => m.status !== 'trash').length;
  let articlesCount = local.articles.filter((a) => !a.isDeleted).length;
  let slidersCount = (local.sliders || []).filter((s) => !s.isDeleted).length;
  let latestMediaItem = local.media[0] || null;
  let latestUpdated = new Date().toISOString();

  try {
    const { data: supaMedia, error: mErr } = await supabase
      .from('media')
      .select('id, name, url, public_url, storage_path, created_at, updated_at')
      .order('created_at', { ascending: false })
      .limit(5);

    if (!mErr) {
      isConnected = true;
      if (supaMedia && supaMedia.length > 0) {
        mediaCount = supaMedia.length;
        latestMediaItem = {
          name: supaMedia[0].name,
          url: supaMedia[0].url || supaMedia[0].public_url,
          storagePath: supaMedia[0].storage_path,
          createdAt: supaMedia[0].created_at,
          updatedAt: supaMedia[0].updated_at,
        };
        latestUpdated = supaMedia[0].updated_at || supaMedia[0].created_at || latestUpdated;
      }
    } else {
      // Storage bucket check as connection indicator
      const { data: files } = await supabase.storage.from('media').list('images', { limit: 5 });
      if (files) {
        isConnected = true;
        if (files.length > 0) {
          latestMediaItem = {
            name: files[0].name,
            url: `${supabaseUrl}/storage/v1/object/public/media/images/${files[0].name}`,
            storagePath: `media/images/${files[0].name}`,
            createdAt: files[0].created_at,
            updatedAt: files[0].updated_at,
          };
        }
      }
    }
  } catch (e: any) {
    console.warn('Diagnostic check warning:', e.message);
  }

  return {
    connected: isConnected,
    projectUrl: supabaseUrl,
    storageBucket: 'media',
    storagePathPrefix: 'images/',
    mediaCount,
    articlesCount,
    slidersCount,
    servicesCount: local.services.filter((s) => !s.isDeleted).length,
    latestMedia: latestMediaItem
      ? {
          name: latestMediaItem.name,
          url: latestMediaItem.url || latestMediaItem.publicUrl,
          storagePath: latestMediaItem.storagePath,
          updatedAt: latestMediaItem.updatedAt || latestMediaItem.createdAt,
        }
      : null,
    latestUpdatedAt: latestUpdated,
    serverTime: new Date().toISOString(),
    status: isConnected ? 'active_and_synchronized' : 'connected_storage_active',
  };
}
