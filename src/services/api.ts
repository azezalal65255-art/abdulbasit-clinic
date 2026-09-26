import { AdminUser } from '../types/admin';

const TOKEN_KEY = 'clinic_admin_token';
const USER_KEY = 'clinic_admin_user';

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token: string, user: AdminUser): void {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearStoredToken(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function getStoredUser(): AdminUser | null {
  const u = localStorage.getItem(USER_KEY);
  if (!u) return null;
  try {
    return JSON.parse(u);
  } catch {
    return null;
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredToken();
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };

  // Only set application/json if not FormData
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(endpoint, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    clearStoredToken();
    // Do not redirect forcefully if not in admin
    if (window.location.pathname.startsWith('/admin') && window.location.pathname !== '/admin/login') {
      window.location.href = '/admin/login';
    }
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || 'حدث خطأ في الاتصال بالخادم');
  }

  return data as T;
}

export const api = {
  // Public
  getPublicContent: () => request<any>('/api/public/content'),
  searchGlobal: (query: string) =>
    request<{ query: string; results: any[] }>(`/api/public/search?q=${encodeURIComponent(query)}`),
  submitBooking: (bookingData: any) =>
    request<{ success: boolean; message: string; bookingId: string }>('/api/public/bookings', {
      method: 'POST',
      body: JSON.stringify(bookingData),
    }),
  createPublicBooking: (bookingData: any) =>
    request<{ success: boolean; message: string; bookingId: string }>('/api/public/bookings', {
      method: 'POST',
      body: JSON.stringify(bookingData),
    }),
  submitContactMessage: (msgData: any) =>
    request<{ success: boolean; message: string }>('/api/public/messages', {
      method: 'POST',
      body: JSON.stringify(msgData),
    }),
  submitJobApplication: (appData: any) =>
    request<{ success: boolean; message: string; applicationId: string }>('/api/public/careers/apply', {
      method: 'POST',
      body: JSON.stringify(appData),
    }),
  createPublicMessage: (msgData: any) =>
    request<{ success: boolean; message: string }>('/api/public/messages', {
      method: 'POST',
      body: JSON.stringify(msgData),
    }),
  trackAnalyticsEvent: (eventData: any) =>
    request<{ ok: boolean }>('/api/public/analytics/event', {
      method: 'POST',
      body: JSON.stringify(eventData),
    }),

  // Auth
  login: (credentials: { email: string; password: string }) =>
    request<{ success: boolean; token: string; user: AdminUser }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),
  getMe: () => request<AdminUser>('/api/auth/me'),
  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    request<{ success: boolean; message: string }>('/api/auth/change-password', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Admin Dashboard
  getDashboardStats: () => request<any>('/api/admin/dashboard-stats'),

  // Bookings
  getBookings: (params: Record<string, string> = {}) => {
    const query = new URLSearchParams(params).toString();
    return request<any>(`/api/admin/bookings?${query}`);
  },
  createBooking: (data: any) =>
    request<any>('/api/admin/bookings', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateBooking: (id: string, data: any) =>
    request<any>(`/api/admin/bookings/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deleteBooking: (id: string) =>
    request<any>(`/api/admin/bookings/${id}`, {
      method: 'DELETE',
    }),

  // Doctor
  getDoctorProfile: () => request<any>('/api/admin/doctor'),
  updateDoctorProfile: (data: any) =>
    request<any>('/api/admin/doctor', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  // Services
  getServices: () => request<any[]>('/api/admin/services'),
  createService: (data: any) =>
    request<any>('/api/admin/services', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateService: (id: string, data: any) =>
    request<any>(`/api/admin/services/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deleteService: (id: string) =>
    request<any>(`/api/admin/services/${id}`, {
      method: 'DELETE',
    }),
  reorderServices: (orderedIds: string[]) =>
    request<any>('/api/admin/services/reorder', {
      method: 'POST',
      body: JSON.stringify({ orderedIds }),
    }),

  // Conditions
  getConditions: () => request<any[]>('/api/admin/conditions'),
  createCondition: (data: any) =>
    request<any>('/api/admin/conditions', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateCondition: (id: string, data: any) =>
    request<any>(`/api/admin/conditions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deleteCondition: (id: string) =>
    request<any>(`/api/admin/conditions/${id}`, {
      method: 'DELETE',
    }),

  // Endoscopy
  getEndoscopy: () => request<any[]>('/api/admin/endoscopy'),
  createEndoscopy: (data: any) =>
    request<any>('/api/admin/endoscopy', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateEndoscopy: (id: string, data: any) =>
    request<any>(`/api/admin/endoscopy/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deleteEndoscopy: (id: string) =>
    request<any>(`/api/admin/endoscopy/${id}`, {
      method: 'DELETE',
    }),

  // Articles
  getArticles: (params?: { status?: string; category?: string; search?: string }) => {
    const q = new URLSearchParams();
    if (params?.status) q.append('status', params.status);
    if (params?.category) q.append('category', params.category);
    if (params?.search) q.append('search', params.search);
    const qs = q.toString();
    return request<any[]>(`/api/admin/articles${qs ? `?${qs}` : ''}`);
  },
  createArticle: (data: any) =>
    request<any>('/api/admin/articles', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateArticle: (id: string, data: any) =>
    request<any>(`/api/admin/articles/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deleteArticle: (id: string) =>
    request<any>(`/api/admin/articles/${id}`, {
      method: 'DELETE',
    }),
  restoreArticle: (id: string) =>
    request<any>(`/api/admin/articles/${id}/restore`, {
      method: 'POST',
    }),

  // FAQ
  getFaqs: () => request<any[]>('/api/admin/faq'),
  createFaq: (data: any) =>
    request<any>('/api/admin/faq', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateFaq: (id: string, data: any) =>
    request<any>(`/api/admin/faq/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deleteFaq: (id: string) =>
    request<any>(`/api/admin/faq/${id}`, {
      method: 'DELETE',
    }),

  // Messages
  getMessages: () => request<any[]>('/api/admin/messages'),
  updateMessage: (id: string, data: any) =>
    request<any>(`/api/admin/messages/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deleteMessage: (id: string) =>
    request<any>(`/api/admin/messages/${id}`, {
      method: 'DELETE',
    }),

  // Schedule
  getSchedule: () => request<any>('/api/admin/schedule'),
  updateSchedule: (data: any) =>
    request<any>('/api/admin/schedule', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  // Contact
  getContact: () => request<any>('/api/admin/contact'),
  updateContact: (data: any) =>
    request<any>('/api/admin/contact', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  // Media
  getMedia: (params?: { status?: string; category?: string; type?: string; search?: string }) => {
    const q = new URLSearchParams();
    if (params?.status) q.append('status', params.status);
    if (params?.category) q.append('category', params.category);
    if (params?.type) q.append('type', params.type);
    if (params?.search) q.append('search', params.search);
    const qs = q.toString();
    return request<any[]>(`/api/admin/media${qs ? `?${qs}` : ''}`);
  },
  uploadMedia: (data: any) =>
    request<any>('/api/admin/media', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateMedia: (id: string, data: any) =>
    request<any>(`/api/admin/media/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  trashMedia: (id: string) =>
    request<any>(`/api/admin/media/${id}/trash`, {
      method: 'POST',
    }),
  restoreMedia: (id: string) =>
    request<any>(`/api/admin/media/${id}/restore`, {
      method: 'POST',
    }),
  deleteMedia: (id: string, force = false, permanent = false) =>
    request<any>(`/api/admin/media/${id}?force=${force}&permanent=${permanent}`, {
      method: 'DELETE',
    }),
  batchSaveMedia: (items: any[]) =>
    request<any>('/api/admin/media/batch-save', {
      method: 'POST',
      body: JSON.stringify({ items }),
    }),
  bulkMediaAction: (action: string, ids: string[], category?: string) =>
    request<any>('/api/admin/media/bulk-action', {
      method: 'POST',
      body: JSON.stringify({ action, ids, category }),
    }),
  emptyMediaTrash: () =>
    request<any>('/api/admin/media/empty-trash', {
      method: 'POST',
    }),
  replaceMedia: (id: string, payload: FormData | { newUrl: string }) => {
    const isFormData = payload instanceof FormData;
    return request<any>(`/api/admin/media/${id}/replace`, {
      method: 'POST',
      body: isFormData ? payload : JSON.stringify(payload),
    });
  },
  checkMediaHealth: () => request<any>('/api/admin/media/health'),
  reconcileSystem: () =>
    request<any>('/api/admin/system/reconcile', {
      method: 'POST',
    }),
  getSystemAudit: () => request<any>('/api/admin/system/audit'),
  createSystemBackup: () =>
    request<any>('/api/admin/system/backup', {
      method: 'POST',
    }),

  // Custom Pages (CMS)
  getPages: () => request<any[]>('/api/admin/pages'),
  createPage: (data: any) =>
    request<any>('/api/admin/pages', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updatePage: (id: string, data: any) =>
    request<any>(`/api/admin/pages/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deletePage: (id: string) =>
    request<any>(`/api/admin/pages/${id}`, {
      method: 'DELETE',
    }),

  // SEO & Settings
  getSeo: () => request<any>('/api/admin/seo'),
  updateSeo: (data: any) =>
    request<any>('/api/admin/seo', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  getSettings: () => request<any>('/api/admin/settings'),
  updateSettings: (data: any) =>
    request<any>('/api/admin/settings', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  // Categories
  getCategories: () => request<any[]>('/api/admin/categories'),
  createCategory: (data: any) =>
    request<any>('/api/admin/categories', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateCategory: (id: string, data: any) =>
    request<any>(`/api/admin/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deleteCategory: (id: string) =>
    request<any>(`/api/admin/categories/${id}`, {
      method: 'DELETE',
    }),

  // Homepage Manager
  getHomePageSettings: () => request<any>('/api/admin/homepage'),
  updateHomePageSettings: (data: any) =>
    request<any>('/api/admin/homepage', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  // Global Search
  globalSearch: (q: string) => request<any>(`/api/admin/global-search?q=${encodeURIComponent(q)}`),

  // Users (Super Admin)
  getUsers: () => request<any[]>('/api/admin/users'),
  createUser: (data: any) =>
    request<any>('/api/admin/users', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateUser: (id: string, data: any) =>
    request<any>(`/api/admin/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deleteUser: (id: string) =>
    request<any>(`/api/admin/users/${id}`, {
      method: 'DELETE',
    }),

  // Notifications
  getNotifications: () => request<any[]>('/api/admin/notifications'),
  markNotificationRead: (id: string) =>
    request<any>(`/api/admin/notifications/${id}/read`, {
      method: 'PUT',
    }),
  markAllNotificationsRead: () =>
    request<any>('/api/admin/notifications/mark-all-read', {
      method: 'PUT',
    }),

  // Activity Logs
  getActivityLogs: () => request<any[]>('/api/admin/activity'),

  // Recycle Bin
  getRecycleBin: () => request<any[]>('/api/admin/recycle-bin'),
  restoreRecycleItem: (id: string, type?: string) =>
    request<any>(`/api/admin/recycle-bin/${id}/restore`, {
      method: 'POST',
      body: type ? JSON.stringify({ type }) : undefined,
    }),
  restoreItem: (id: string, type?: string) =>
    request<any>(`/api/admin/recycle-bin/${id}/restore`, {
      method: 'POST',
      body: type ? JSON.stringify({ type }) : undefined,
    }),
  purgeRecycleItem: (id: string) =>
    request<any>(`/api/admin/recycle-bin/${id}`, {
      method: 'DELETE',
    }),

  // Backup & Restore
  exportBackupUrl: '/api/admin/backup/export',
  exportBackup: () => request<any>('/api/admin/backup/export'),
  importBackup: (backupData: any) =>
    request<any>('/api/admin/backup/import', {
      method: 'POST',
      body: JSON.stringify({ data: backupData }),
    }),
  restoreBackup: (backupData: any) =>
    request<any>('/api/admin/backup/import', {
      method: 'POST',
      body: JSON.stringify({ data: backupData }),
    }),
  getSystemStatus: () => request<any>('/api/admin/system/status'),
  getSnapshots: () => request<any[]>('/api/admin/backup/snapshots'),
  createSnapshot: (note?: string) =>
    request<any>('/api/admin/backup/snapshots', {
      method: 'POST',
      body: JSON.stringify({ note }),
    }),
  restoreSnapshot: (filename: string) =>
    request<any>(`/api/admin/backup/snapshots/${encodeURIComponent(filename)}/restore`, {
      method: 'POST',
    }),

  // Videos
  getVideos: () => request<any[]>('/api/admin/videos'),
  createVideo: (data: any) =>
    request<any>('/api/admin/videos', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateVideo: (id: string, data: any) =>
    request<any>(`/api/admin/videos/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deleteVideo: (id: string) =>
    request<any>(`/api/admin/videos/${id}`, {
      method: 'DELETE',
    }),
  reorderVideos: (orderedIds: string[]) =>
    request<any>('/api/admin/videos/reorder', {
      method: 'POST',
      body: JSON.stringify({ orderedIds }),
    }),

  // Careers & Job Applications
  getCareers: () => request<any[]>('/api/admin/careers'),
  createCareer: (data: any) =>
    request<any>('/api/admin/careers', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateCareer: (id: string, data: any) =>
    request<any>(`/api/admin/careers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deleteCareer: (id: string) =>
    request<any>(`/api/admin/careers/${id}`, {
      method: 'DELETE',
    }),
  reorderCareers: (orderedIds: string[]) =>
    request<any>('/api/admin/careers/reorder', {
      method: 'POST',
      body: JSON.stringify({ orderedIds }),
    }),
  getJobApplications: () => request<any[]>('/api/admin/job-applications'),
  updateJobApplication: (id: string, data: any) =>
    request<any>(`/api/admin/job-applications/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deleteJobApplication: (id: string) =>
    request<any>(`/api/admin/job-applications/${id}`, {
      method: 'DELETE',
    }),

  // Conferences
  getConferences: () => request<any[]>('/api/admin/conferences'),
  createConference: (data: any) =>
    request<any>('/api/admin/conferences', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateConference: (id: string, data: any) =>
    request<any>(`/api/admin/conferences/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deleteConference: (id: string) =>
    request<any>(`/api/admin/conferences/${id}`, {
      method: 'DELETE',
    }),
  reorderConferences: (orderedIds: string[]) =>
    request<any>('/api/admin/conferences/reorder', {
      method: 'POST',
      body: JSON.stringify({ orderedIds }),
    }),

  // Research
  getResearch: () => request<any[]>('/api/admin/research'),
  createResearch: (data: any) =>
    request<any>('/api/admin/research', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateResearch: (id: string, data: any) =>
    request<any>(`/api/admin/research/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deleteResearch: (id: string) =>
    request<any>(`/api/admin/research/${id}`, {
      method: 'DELETE',
    }),
  reorderResearch: (orderedIds: string[]) =>
    request<any>('/api/admin/research/reorder', {
      method: 'POST',
      body: JSON.stringify({ orderedIds }),
    }),

  // Sliders
  getSliders: () => request<any[]>('/api/admin/sliders'),
  createSlider: (data: any) =>
    request<any>('/api/admin/sliders', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateSlider: (id: string, data: any) =>
    request<any>(`/api/admin/sliders/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deleteSlider: (id: string) =>
    request<any>(`/api/admin/sliders/${id}`, {
      method: 'DELETE',
    }),
  reorderSliders: (orderedIds: string[]) =>
    request<any>('/api/admin/sliders/reorder', {
      method: 'POST',
      body: JSON.stringify({ orderedIds }),
    }),
};
