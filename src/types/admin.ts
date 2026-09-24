export type UserRole = 'super_admin' | 'admin' | 'receptionist' | 'content_manager';

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  phone?: string;
  createdAt?: string;
  lastLogin?: string;
}

export type AdminTab =
  | 'dashboard'
  | 'bookings'
  | 'homepage'
  | 'sliders'
  | 'interface-images'
  | 'doctor'
  | 'services'
  | 'conditions'
  | 'endoscopy'
  | 'videos'
  | 'articles'
  | 'pages'
  | 'conferences'
  | 'research'
  | 'careers'
  | 'categories'
  | 'faq'
  | 'messages'
  | 'schedule'
  | 'contact'
  | 'media'
  | 'seo'
  | 'analytics'
  | 'users'
  | 'settings'
  | 'activity'
  | 'recycle-bin'
  | 'backup'
  | 'system-check';
