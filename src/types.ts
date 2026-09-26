export interface Specialty {
  id: string;
  title: string;
  description: string;
  iconName: 'liver' | 'digestive' | 'internal';
  features: string[];
}

export interface MedicalCondition {
  id: string;
  name: string;
  category: 'digestive' | 'liver' | 'internal' | 'general' | 'endoscopy';
  icon: string;
  description: string;
  shortSummary?: string;
  image?: string;
  imageUrl?: string;
  altText?: string;
  symptoms: string[];
  treatmentApproach: string;
}

export interface EndoscopyProcedure {
  id: string;
  title: string;
  description: string;
  image: string;
  imageUrl?: string;
  altText?: string;
  indications: string[];
  duration: string;
  prepSummary: string;
}

export interface MedicalArticle {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string[];
  category: string;
  readTime: string;
  date: string;
  image: string;
  keywords?: string[];
  tags?: string[];
  metaTitle?: string;
  metaDescription?: string;
}

export interface Qualification {
  degree: string;
  institution: string;
  description: string;
  year?: string;
  iconType: 'academic' | 'specialist' | 'doctorate' | 'advanced';
}

export interface BookingFormData {
  fullName: string;
  phone: string;
  visitType: string;
  preferredDate: string;
  preferredPeriod: 'morning' | 'evening';
  notes: string;
}

export interface FaqItem {
  question: string;
  answer: string;
  category: string;
}

export interface MedicalService {
  id: string;
  title: string;
  shortDescription: string;
  detailedDescription: string;
  category: 'digestive' | 'liver' | 'endoscopy' | 'internal' | 'diagnostics' | 'second-opinion';
  categoryName: string;
  iconName: string;
  targetCases: string[];
  keyProcedures: string[];
  preparation?: string;
  benefits: string[];
  badge?: string;
}

export interface ClinicVideo {
  id: string;
  title: string;
  description?: string;
  youtubeUrl: string;
  youtubeId?: string;
  thumbnailUrl?: string;
  duration?: string;
  order: number;
  isActive: boolean;
  createdAt?: string;
}

export interface Career {
  id: string;
  title: string;
  department: string;
  description: string;
  requirements: string[];
  experience: string;
  location: string;
  employmentType: 'full-time' | 'part-time' | 'contract';
  deadline?: string;
  postedDate: string;
  status: 'open' | 'closed';
  order: number;
  isActive: boolean;
}

export interface JobApplication {
  id: string;
  jobId?: string;
  jobTitle?: string;
  fullName: string;
  phone: string;
  email?: string;
  qualification: string;
  specialization?: string;
  experienceYears: string;
  message?: string;
  cvUrl?: string;
  cvFileName?: string;
  status: 'new' | 'reviewed' | 'interviewed' | 'rejected' | 'accepted';
  createdAt: string;
}

export interface Conference {
  id: string;
  title: string;
  image?: string;
  imageUrl?: string;
  date: string;
  location: string;
  shortDescription?: string;
  details?: string;
  gallery?: string[];
  videoUrl?: string;
  order: number;
  isActive: boolean;
}

export interface Research {
  id: string;
  title: string;
  authors?: string;
  year: string;
  institution?: string;
  journal?: string;
  abstract: string;
  image?: string;
  imageUrl?: string;
  pdfUrl?: string;
  externalUrl?: string;
  doi?: string;
  order: number;
  isActive: boolean;
}

export interface Slider {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  imageUrl: string;
  buttonText?: string;
  buttonLink?: string;
  order: number;
  isActive: boolean;
}

export interface SearchResult {
  id: string;
  type: 'article' | 'service' | 'condition' | 'endoscopy' | 'video' | 'conference' | 'research' | 'page';
  typeName: string;
  title: string;
  description: string;
  url: string;
  actionType: string;
  targetSection?: string;
  rawItem?: any;
  path?: string;
}

