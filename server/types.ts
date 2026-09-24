export type UserRole = 'super_admin' | 'admin' | 'receptionist' | 'content_manager';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  passwordHash: string;
  phone?: string;
  isActive: boolean;
  createdAt: string;
  lastLogin?: string;
}

export interface DoctorProfile {
  name: string;
  title: string;
  jobTitle: string;
  bio: string;
  photo: string;
  experiences: string[];
  qualifications: {
    id: string;
    degree: string;
    institution: string;
    description: string;
    iconType: string;
    order: number;
  }[];
}

export interface MedicalServiceItem {
  id: string;
  title: string;
  slug: string;
  description: string;
  fullDescription: string;
  iconName: string;
  image: string;
  features: string[];
  metaTitle: string;
  metaDescription: string;
  isActive: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
  isDeleted?: boolean;
}

export interface ConditionCategoryItem {
  id: string;
  slug: string;
  name: string;
  description: string;
  type?: string;
  order: number;
  isActive: boolean;
}

export interface MedicalConditionItem {
  id: string;
  name: string;
  slug: string;
  category: 'gastroenterology' | 'liver' | 'internal-medicine' | 'endoscopy' | 'digestive' | 'internal' | 'general';
  categoryId?: string;
  icon: string;
  description: string;
  shortDescription?: string;
  definition?: string;
  symptoms: string[];
  commonSymptoms?: string[];
  causes?: string[];
  riskFactors?: string[];
  whenToSeeDoctor?: string[];
  diagnosis?: string;
  tests?: string[];
  needsEndoscopy?: string;
  treatmentApproach: string;
  treatmentOverview?: string;
  generalTips?: string[];
  faqs?: { question: string; answer: string }[];
  relatedConditions?: string[];
  relatedServices?: string[];
  relatedArticles?: string[];
  keywords?: string[];
  image?: string;
  metaTitle?: string;
  metaDescription?: string;
  isActive: boolean;
  isFeatured?: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
  isDeleted?: boolean;
}

export interface EndoscopyItem {
  id: string;
  title: string;
  slug: string;
  description: string;
  image: string;
  indications: string[];
  duration: string;
  prepSummary: string;
  preInstructions: string[];
  postInstructions: string[];
  metaTitle?: string;
  metaDescription?: string;
  isActive: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
  isDeleted?: boolean;
}

export interface ArticleCategoryItem {
  id: string;
  slug: string;
  name: string;
  description?: string;
}

export interface ArticleItem {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  categoryId?: string;
  author: string;
  readTime: string;
  date: string;
  image: string;
  tags: string[];
  keywords?: string[];
  metaTitle?: string;
  metaDescription?: string;
  status: 'published' | 'draft' | 'scheduled';
  scheduledDate?: string;
  views: number;
  createdAt: string;
  updatedAt: string;
  isDeleted?: boolean;
}

export interface FaqItemRecord {
  id: string;
  question: string;
  answer: string;
  category: string;
  order: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  isDeleted?: boolean;
}

export type BookingStatus = 'new' | 'contacted' | 'under_review' | 'confirmed' | 'completed' | 'cancelled' | 'no_show';

export interface BookingRecord {
  id: string;
  patientName: string;
  phone: string;
  whatsapp?: string;
  age?: number | string;
  gender?: 'male' | 'female';
  visitType: string;
  serviceId: string;
  preferredDate: string;
  preferredShift: 'morning' | 'evening';
  preferredTime?: string;
  notes: string;
  status: BookingStatus;
  adminNotes?: string;
  createdAt: string;
  updatedAt: string;
  isDeleted?: boolean;
}

export type MessageStatus = 'new' | 'read' | 'contacted' | 'closed';

export interface MessageRecord {
  id: string;
  name: string;
  phone: string;
  email?: string;
  subject: string;
  message: string;
  status: MessageStatus;
  adminReply?: string;
  createdAt: string;
  updatedAt: string;
  isDeleted?: boolean;
}

export interface ScheduleSettings {
  morningHours: string;
  eveningHours: string;
  workingDays: string;
  morningActive: boolean;
  eveningActive: boolean;
  emergencyNotice: string;
  isNoticeActive: boolean;
  holidays: string[];
}

export interface ContactSettings {
  phone1: string;
  phone2: string;
  whatsapp: string;
  email: string;
  address: string;
  addressShort: string;
  building: string;
  city: string;
  country: string;
  googleMapsUrl: string;
  googleMapsEmbed: string;
  latitude?: number | string;
  longitude?: number | string;
  directionsUrl?: string;
  facebook: string;
  instagram: string;
  youtube: string;
  tiktok?: string;
  twitter?: string;
  telegram?: string;
  linkedin?: string;
  snapchat?: string;
}

export interface ClinicVideoItem {
  id: string;
  title: string;
  description?: string;
  youtubeUrl: string;
  youtubeId: string;
  thumbnailUrl: string;
  duration?: string;
  order: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  isDeleted?: boolean;
}

export interface CareerItem {
  id: string;
  title: string;
  department: string;
  description: string;
  requirements: string[];
  experience: string;
  location: string;
  employmentType: 'full-time' | 'part-time' | 'contract';
  deadline: string;
  postedDate: string;
  status: 'open' | 'closed';
  order: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  isDeleted?: boolean;
}

export interface JobApplicationRecord {
  id: string;
  jobId?: string;
  jobTitle: string;
  fullName: string;
  phone: string;
  email: string;
  qualification: string;
  specialization: string;
  experienceYears: string | number;
  message?: string;
  cvUrl: string;
  cvFileName?: string;
  status: 'new' | 'under_review' | 'contacted' | 'accepted' | 'rejected';
  adminNotes?: string;
  createdAt: string;
  updatedAt: string;
  isDeleted?: boolean;
}

export interface ConferenceItem {
  id: string;
  title: string;
  image: string;
  date: string;
  location: string;
  shortDescription: string;
  details: string;
  gallery?: string[];
  videoUrl?: string;
  order: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  isDeleted?: boolean;
}

export interface ResearchItem {
  id: string;
  title: string;
  authors: string;
  year: string;
  institution: string;
  journal?: string;
  abstract: string;
  image?: string;
  pdfUrl?: string;
  externalUrl?: string;
  doi?: string;
  order: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  isDeleted?: boolean;
}

export interface SliderItem {
  id: string;
  title: string;
  subtitle: string;
  description?: string;
  imageUrl: string;
  buttonText?: string;
  buttonLink?: string;
  order: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  isDeleted?: boolean;
}

export interface MediaItem {
  id: string;
  name: string;
  file_name?: string;
  title?: string;
  storage_path?: string;
  public_url?: string;
  url: string;
  file_type?: string;
  fileType: string;
  mime_type?: string;
  file_size?: string;
  fileSize: string;
  category?: string;
  altText: string;
  status?: 'active' | 'trash';
  deleted_at?: string | null;
  deletedAt?: string | null;
  uploadedAt: string;
  createdAt?: string;
  created_at?: string;
  updatedAt?: string;
  updated_at?: string;
  uploaded_by?: string;
  uploadedBy?: string;
  usages?: string[];
  inUse?: boolean;
  fileExists?: boolean;
  isVideo?: boolean;
  videoDuration?: string;
  thumbnailUrl?: string;
  youtubeUrl?: string;
  youtubeId?: string;
}

export interface SeoSettings {
  defaultMetaTitle: string;
  defaultMetaDescription: string;
  siteKeywords: string[];
  canonicalUrl: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  robotsTxt: string;
  sitemapEnabled: boolean;
  schemas: {
    medicalClinic: boolean;
    physician: boolean;
    faq: boolean;
    breadcrumb: boolean;
  };
}

export interface CustomPageItem {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  coverImage?: string;
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string[];
  showInHeader?: boolean;
  showInFooter?: boolean;
  order: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  isDeleted?: boolean;
}

export interface HomeBanner {
  id: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  buttonText?: string;
  buttonLink?: string;
  isActive: boolean;
}

export interface SiteSettings {
  siteName: string;
  clinicName: string;
  doctorName: string;
  doctorSpecialty: string;
  logoUrl: string;
  faviconUrl: string;
  heroBadge: string;
  heroHeadline: string;
  heroSubheadline: string;
  heroDoctorPhoto?: string;
  bookButtonText: string;
  contactButtonText: string;
  whatsappNumber?: string;
  defaultWhatsAppText: string;
  maintenanceMode: boolean;
  footerCopyright: string;
  gaMeasurementId?: string;
  searchConsoleVerification?: string;
  banners?: HomeBanner[];
  sectionsConfig?: Record<string, boolean>;
  sectionsOrder?: string[];
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'booking' | 'message' | 'article' | 'system';
  isRead: boolean;
  createdAt: string;
  link?: string;
}

export interface ActivityLogItem {
  id: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: string;
  module: string;
  details: string;
  timestamp: string;
}

export interface AnalyticsData {
  totalVisits: number;
  whatsappClicks: number;
  phoneClicks: number;
  bookingFormSubmissions: number;
  pageViews: Record<string, number>;
  devices: {
    mobile: number;
    desktop: number;
    tablet: number;
  };
  dailyVisits: { date: string; visits: number; bookings: number }[];
}

export interface DatabaseSchema {
  users: User[];
  doctor: DoctorProfile;
  services: MedicalServiceItem[];
  categories: ConditionCategoryItem[];
  conditions: MedicalConditionItem[];
  endoscopy: EndoscopyItem[];
  articles: ArticleItem[];
  articleCategories?: ArticleCategoryItem[];
  pages?: CustomPageItem[];
  faqs: FaqItemRecord[];
  bookings: BookingRecord[];
  messages: MessageRecord[];
  schedule: ScheduleSettings;
  contact: ContactSettings;
  media: MediaItem[];
  seo: SeoSettings;
  settings: SiteSettings;
  videos: ClinicVideoItem[];
  careers: CareerItem[];
  jobApplications: JobApplicationRecord[];
  conferences: ConferenceItem[];
  research: ResearchItem[];
  sliders: SliderItem[];
  notifications: NotificationItem[];
  activityLogs: ActivityLogItem[];
  analytics: AnalyticsData;
  recycleBin: {
    id: string;
    collection: string;
    data: any;
    deletedAt: string;
    deletedBy: string;
  }[];
}
