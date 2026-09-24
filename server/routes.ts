import express, { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { db, generateId, hashPassword } from './db';
import { requireAuth, requireRole, signToken, AuthenticatedRequest } from './auth';
import {
  UserRole,
  ClinicVideoItem,
  CareerItem,
  JobApplicationRecord,
  ConferenceItem,
  ResearchItem,
  SliderItem,
} from './types';
import { uploadMiddleware, handleUploadFile, saveBase64ImageToDisk } from './uploadHandler';
import {
  findMediaUsages,
  replaceMediaUrlGlobally,
  deleteUploadedFile,
  DATA_UPLOADS_DIR,
  UPLOADS_DIR,
  DIST_UPLOADS_DIR,
  syncFileToDist,
} from './storageUtils';
import { reconcileMediaSystem, checkFileExists } from './mediaReconciliation';

export const apiRouter = express.Router();

// IMPORTANT:
// Upload the original image file only.
// Never call Gemini, Imagen, or any AI image generation
// or image editing model from this function or route.
const handleMulterUpload = (req: Request, res: Response, next: any) => {
  uploadMiddleware.single('file')(req, res, (err: any) => {
    if (err) {
      return res.status(400).json({ error: err.message || 'فشل رفع الملف. تأكد من أنه صورة صالحة وأقل من 15 ميجابايت.' });
    }
    next();
  });
};

apiRouter.post('/upload', handleMulterUpload, handleUploadFile);
apiRouter.post('/admin/upload', handleMulterUpload, handleUploadFile);

/* ==========================================================================
   PUBLIC API ENDPOINTS (For Visitors & Website)
   ========================================================================== */

// Get all published website content in one fast request
apiRouter.get('/public/content', (req: Request, res: Response) => {
  const data = db.get();
  res.json({
    doctor: data.doctor,
    services: data.services.filter((s) => s.isActive && !s.isDeleted).sort((a, b) => a.order - b.order),
    conditions: data.conditions.filter((c) => c.isActive && !c.isDeleted).sort((a, b) => a.order - b.order),
    endoscopy: data.endoscopy.filter((e) => e.isActive && !e.isDeleted).sort((a, b) => a.order - b.order),
    articles: data.articles.filter((a) => a.status === 'published' && !a.isDeleted),
    pages: (data.pages || []).filter((p) => p.isActive && !p.isDeleted).sort((a, b) => a.order - b.order),
    faqs: data.faqs.filter((f) => f.isActive && !f.isDeleted).sort((a, b) => a.order - b.order),
    videos: (data.videos || []).filter((v) => v.isActive && !v.isDeleted).sort((a, b) => a.order - b.order),
    careers: (data.careers || []).filter((c) => c.isActive && !c.isDeleted && c.status === 'open').sort((a, b) => a.order - b.order),
    conferences: (data.conferences || []).filter((c) => c.isActive && !c.isDeleted).sort((a, b) => a.order - b.order),
    research: (data.research || []).filter((r) => r.isActive && !r.isDeleted).sort((a, b) => a.order - b.order),
    sliders: (data.sliders || []).filter((s) => s.isActive && !s.isDeleted).sort((a, b) => a.order - b.order),
    schedule: data.schedule,
    contact: data.contact,
    settings: data.settings,
    seo: data.seo,
  });
});

// Patient Booking Submission
apiRouter.post('/public/bookings', (req: Request, res: Response) => {
  const { patientName, phone, whatsapp, age, gender, visitType, serviceId, preferredDate, preferredShift, preferredTime, notes } = req.body;

  if (!patientName || !phone) {
    return res.status(400).json({ error: 'الاسم ورقم الهاتف حقول مطلوبة لإتمام الحجز' });
  }

  const data = db.get();
  const targetDate = preferredDate || new Date().toISOString().split('T')[0];
  const targetShift = preferredShift === 'evening' ? ('evening' as const) : ('morning' as const);

  // Check holiday/working days
  if (targetDate) {
    const d = new Date(targetDate);
    if (!isNaN(d.getTime())) {
      const daysAr = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
      const dayName = daysAr[d.getDay()];
      if (data.schedule && data.schedule.holidays && data.schedule.holidays.includes(dayName)) {
        return res.status(400).json({
          error: `العيادة في إجازة يوم (${dayName}). يرجى اختيار موعد بين السبت والخميس.`,
        });
      }
    }
  }

  // Check shift active
  if (data.schedule) {
    if (targetShift === 'morning' && data.schedule.morningActive === false) {
      return res.status(400).json({ error: 'الفترة الصباحية مغلقة حاليًا في جدول العيادة.' });
    }
    if (targetShift === 'evening' && data.schedule.eveningActive === false) {
      return res.status(400).json({ error: 'الفترة المسائية مغلقة حاليًا في جدول العيادة.' });
    }
  }

  // Check time slot conflict
  if (preferredTime) {
    const timeConflict = data.bookings.find(
      (b) =>
        !b.isDeleted &&
        b.status !== 'cancelled' &&
        b.preferredDate === targetDate &&
        b.preferredTime === String(preferredTime).trim()
    );

    if (timeConflict) {
      return res.status(409).json({
        success: false,
        error: 'يوجد تعارض في الموعد: هذا التوقيت محجوز مسبقًا. يرجى اختيار وقت آخر أو التواصل المباشر مع العيادة.',
        conflict: true,
      });
    }
  }

  // Check max appointments per shift capacity
  const activeCount = data.bookings.filter(
    (b) =>
      !b.isDeleted &&
      b.status !== 'cancelled' &&
      b.preferredDate === targetDate &&
      b.preferredShift === targetShift
  ).length;

  if (activeCount >= 30) {
    return res.status(409).json({
      success: false,
      error: 'اكتمل العدد الأقصى للحجوزات المتاحة لهذه الفترة. يرجى اختيار فترة أخرى أو يوم بديل.',
      conflict: true,
    });
  }

  const newBooking = {
    id: generateId('bkg'),
    patientName: String(patientName).trim(),
    phone: String(phone).trim(),
    whatsapp: whatsapp ? String(whatsapp).trim() : String(phone).trim(),
    age: age ? Number(age) : undefined,
    gender: gender === 'female' ? ('female' as const) : ('male' as const),
    visitType: visitType || 'كشف جديد',
    serviceId: serviceId || 'srv_digestive',
    preferredDate: targetDate,
    preferredShift: targetShift,
    preferredTime: preferredTime ? String(preferredTime).trim() : undefined,
    notes: String(notes || '').trim(),
    status: 'new' as const,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  data.bookings.unshift(newBooking);
  data.analytics.bookingFormSubmissions += 1;

  // Add notification to admin
  db.addNotification(
    'طلب حجز موعد جديد',
    `ورد طلب حجز جديد من المريض: ${newBooking.patientName} (${newBooking.phone})`,
    'booking',
    '/admin/bookings'
  );

  db.save();

  res.status(201).json({
    success: true,
    message: 'تم إرسال طلب الحجز بنجاح، سيتواصل معكم فريق العيادة لتأكيد الموعد.',
    bookingId: newBooking.id,
    item: newBooking,
  });
});

// Visitor Contact Form Submission
apiRouter.post('/public/messages', (req: Request, res: Response) => {
  const { name, phone, email, subject, message } = req.body;

  if (!name || !phone || !message) {
    return res.status(400).json({ error: 'الاسم، رقم الهاتف، والرسالة حقول إلزامية' });
  }

  const newMessage = {
    id: generateId('msg'),
    name: String(name).trim(),
    phone: String(phone).trim(),
    email: email ? String(email).trim() : undefined,
    subject: subject ? String(subject).trim() : 'استفسار من الموقع',
    message: String(message).trim(),
    status: 'new' as const,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const data = db.get();
  data.messages.unshift(newMessage);

  // Add notification to admin
  db.addNotification(
    'رسالة تواصل جديدة',
    `رسالة جديدة من: ${newMessage.name} بخصوص "${newMessage.subject}"`,
    'message',
    '/admin/messages'
  );

  db.save();

  res.status(201).json({
    success: true,
    message: 'تم استلام رسالتكم بنجاح، سنقوم بالرد عليكم في أقرب وقت.',
  });
});

// Visitor Job Application Submission
apiRouter.post('/public/careers/apply', (req: Request, res: Response) => {
  const { careerId, jobTitle, fullName, email, phone, experienceYears, notes, resumeUrl } = req.body;

  if (!fullName || !phone) {
    return res.status(400).json({ error: 'الاسم ورقم الهاتف حقول إلزامية للتقديم' });
  }

  const newApp = {
    id: generateId('app'),
    jobId: careerId || 'general',
    jobTitle: jobTitle || 'طلب توظيف عام',
    fullName: String(fullName).trim(),
    email: email ? String(email).trim() : '',
    phone: String(phone).trim(),
    qualification: req.body.qualification ? String(req.body.qualification).trim() : 'مؤهل تخصصي',
    specialization: req.body.specialization ? String(req.body.specialization).trim() : 'عام',
    experienceYears: experienceYears || '1-3 سنوات',
    message: String(notes || '').trim(),
    cvUrl: resumeUrl ? String(resumeUrl).trim() : '',
    status: 'new' as const,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const data = db.get();
  if (!data.jobApplications) data.jobApplications = [];
  data.jobApplications.unshift(newApp);

  // Add notification to admin
  db.addNotification(
    'طلب توظيف جديد',
    `ورد طلب توظيف جديد لوظيفة "${newApp.jobTitle}" من: ${newApp.fullName}`,
    'system',
    '/admin/careers'
  );

  db.save();

  res.status(201).json({
    success: true,
    message: 'تم استلام طلب التوظيف بنجاح، سيتم التواصل معكم عند مراجعة الطلب.',
    item: newApp,
  });
});

// Analytics Event Tracker
apiRouter.post('/public/analytics/event', (req: Request, res: Response) => {
  const { type, page, device } = req.body;
  const data = db.get();

  if (type === 'visit') {
    data.analytics.totalVisits += 1;
    const today = new Date().toISOString().split('T')[0];
    const dayEntry = data.analytics.dailyVisits.find((d) => d.date === today);
    if (dayEntry) {
      dayEntry.visits += 1;
    } else {
      data.analytics.dailyVisits.push({ date: today, visits: 1, bookings: 0 });
    }
  } else if (type === 'whatsapp') {
    data.analytics.whatsappClicks += 1;
  } else if (type === 'phone') {
    data.analytics.phoneClicks += 1;
  }

  if (page) {
    data.analytics.pageViews[page] = (data.analytics.pageViews[page] || 0) + 1;
  }

  if (device === 'mobile') data.analytics.devices.mobile += 1;
  else if (device === 'desktop') data.analytics.devices.desktop += 1;
  else if (device === 'tablet') data.analytics.devices.tablet += 1;

  db.save();
  res.json({ ok: true });
});

/* ==========================================================================
   AUTHENTICATION ENDPOINTS
   ========================================================================== */

// Admin Login
apiRouter.post('/auth/login', (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'البريد الإلكتروني وكلمة المرور مطلوبان' });
  }

  const data = db.get();
  const inputHash = hashPassword(password);
  const user = data.users.find(
    (u) => u.email.toLowerCase() === String(email).trim().toLowerCase() && u.passwordHash === inputHash
  );

  if (!user) {
    return res.status(401).json({ error: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' });
  }

  if (!user.isActive) {
    return res.status(403).json({ error: 'تم تعطيل هذا الحساب. يرجى مراجعة المسؤول العام.' });
  }

  user.lastLogin = new Date().toISOString();
  db.save();

  db.logActivity(user, 'تسجيل دخول', 'الأمان', `قام المستخدم ${user.name} بتسجيل الدخول للوحة التحكم`);

  const token = signToken({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  });

  res.json({
    success: true,
    token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      phone: user.phone,
    },
  });
});

// Get Current User Profile
apiRouter.get('/auth/me', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const data = db.get();
  const user = data.users.find((u) => u.id === req.user?.id);
  if (!user) {
    return res.status(404).json({ error: 'المستخدم غير موجود' });
  }

  res.json({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    phone: user.phone,
    createdAt: user.createdAt,
    lastLogin: user.lastLogin,
  });
});

// Change Password
apiRouter.post('/auth/change-password', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: 'يرجى تقديم كلمة المرور الحالية والجديدة' });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ error: 'يجب ألا تقل كلمة المرور الجديدة عن 6 خانات' });
  }

  const data = db.get();
  const user = data.users.find((u) => u.id === req.user?.id);
  if (!user) return res.status(404).json({ error: 'المستخدم غير موجود' });

  if (user.passwordHash !== hashPassword(currentPassword)) {
    return res.status(400).json({ error: 'كلمة المرور الحالية غير صحيحة' });
  }

  user.passwordHash = hashPassword(newPassword);
  db.save();
  db.logActivity(user, 'تغيير كلمة المرور', 'الأمان', 'تم تحديث كلمة المرور بنجاح');

  res.json({ success: true, message: 'تم تغيير كلمة المرور بنجاح' });
});

/* ==========================================================================
   DASHBOARD & STATS
   ========================================================================== */

apiRouter.get('/admin/dashboard-stats', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const data = db.get();

  const todayStr = new Date().toISOString().split('T')[0];
  const activeBookings = data.bookings.filter((b) => !b.isDeleted);
  const totalBookings = activeBookings.length;
  const newBookings = activeBookings.filter((b) => b.status === 'new').length;
  const todayBookings = activeBookings.filter((b) => b.preferredDate === todayStr).length;
  const confirmedBookings = activeBookings.filter((b) => b.status === 'confirmed').length;
  const cancelledBookings = activeBookings.filter((b) => b.status === 'cancelled').length;
  const newMessages = data.messages.filter((m) => m.status === 'new' && !m.isDeleted).length;
  const publishedArticles = data.articles.filter((a) => a.status === 'published' && !a.isDeleted).length;
  const activeServices = data.services.filter((s) => s.isActive && !s.isDeleted).length;
  const totalConditions = data.conditions.filter((c) => c.isActive && !c.isDeleted).length;
  const totalEndoscopy = data.endoscopy.filter((e) => e.isActive && !e.isDeleted).length;
  const unreadNotifications = data.notifications.filter((n) => !n.isRead).length;

  res.json({
    metrics: {
      totalBookings,
      newBookings,
      todayBookings,
      confirmedBookings,
      cancelledBookings,
      newMessages,
      publishedArticles,
      activeServices,
      totalConditions,
      totalEndoscopy,
      totalVisits: data.analytics.totalVisits,
      whatsappClicks: data.analytics.whatsappClicks,
      phoneClicks: data.analytics.phoneClicks,
      unreadNotifications,
    },
    recentBookings: activeBookings.slice(0, 6),
    recentMessages: data.messages.filter((m) => !m.isDeleted).slice(0, 6),
    recentArticles: data.articles.filter((a) => !a.isDeleted).slice(0, 4),
    recentActivity: data.activityLogs.slice(0, 8),
    schedule: data.schedule,
    dailyVisits: data.analytics.dailyVisits.slice(-7),
  });
});

// Global Search endpoint
apiRouter.get('/admin/global-search', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const q = String(req.query.q || '').trim().toLowerCase();
  if (!q) {
    return res.json({ bookings: [], services: [], articles: [], conditions: [], messages: [], users: [] });
  }

  const data = db.get();
  const bookings = data.bookings
    .filter((b) => !b.isDeleted && (b.patientName.toLowerCase().includes(q) || b.phone.includes(q) || (b.notes && b.notes.toLowerCase().includes(q))))
    .slice(0, 5);

  const services = data.services
    .filter((s) => !s.isDeleted && (s.title.toLowerCase().includes(q) || s.description.toLowerCase().includes(q)))
    .slice(0, 5);

  const articles = data.articles
    .filter((a) => !a.isDeleted && (a.title.toLowerCase().includes(q) || a.content.toLowerCase().includes(q) || a.excerpt.toLowerCase().includes(q)))
    .slice(0, 5);

  const conditions = data.conditions
    .filter((c) => !c.isDeleted && (c.name.toLowerCase().includes(q) || c.description.toLowerCase().includes(q)))
    .slice(0, 5);

  const messages = data.messages
    .filter((m) => !m.isDeleted && (m.name.toLowerCase().includes(q) || m.phone.includes(q) || m.message.toLowerCase().includes(q)))
    .slice(0, 5);

  const users = data.users
    .filter((u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q))
    .slice(0, 5)
    .map((u) => ({ id: u.id, name: u.name, email: u.email, role: u.role }));

  res.json({ bookings, services, articles, conditions, messages, users });
});

/* ==========================================================================
   BOOKINGS MANAGEMENT
   ========================================================================== */

// List Bookings with Filters, Search, Pagination
apiRouter.get('/admin/bookings', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const data = db.get();
  let list = data.bookings.filter((b) => !b.isDeleted);

  const { search, status, shift, serviceId, date, page = '1', limit = '10' } = req.query;

  if (search) {
    const q = String(search).toLowerCase();
    list = list.filter((b) => b.patientName.toLowerCase().includes(q) || b.phone.includes(q) || b.notes.toLowerCase().includes(q));
  }

  if (status && status !== 'all') {
    list = list.filter((b) => b.status === status);
  }

  if (shift && shift !== 'all') {
    list = list.filter((b) => b.preferredShift === shift);
  }

  if (serviceId && serviceId !== 'all') {
    list = list.filter((b) => b.serviceId === serviceId);
  }

  if (date) {
    list = list.filter((b) => b.preferredDate === date);
  }

  const total = list.length;
  const p = Math.max(1, parseInt(String(page), 10));
  const l = Math.max(1, parseInt(String(limit), 10));
  const startIndex = (p - 1) * l;
  const paginated = list.slice(startIndex, startIndex + l);

  res.json({
    items: paginated,
    total,
    page: p,
    limit: l,
    totalPages: Math.ceil(total / l),
  });
});

// Add Manual Booking
apiRouter.post('/admin/bookings', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const { patientName, phone, whatsapp, age, gender, visitType, serviceId, preferredDate, preferredShift, preferredTime, notes, status, adminNotes } = req.body;

  if (!patientName || !phone) {
    return res.status(400).json({ error: 'اسم المريض ورقم الهاتف مطلوبان' });
  }

  const newBooking = {
    id: generateId('bkg'),
    patientName: String(patientName).trim(),
    phone: String(phone).trim(),
    whatsapp: whatsapp ? String(whatsapp).trim() : String(phone).trim(),
    age: age ? Number(age) : undefined,
    gender: gender === 'female' ? ('female' as const) : ('male' as const),
    visitType: visitType || 'كشف جديد',
    serviceId: serviceId || 'srv_digestive',
    preferredDate: preferredDate || new Date().toISOString().split('T')[0],
    preferredShift: preferredShift || 'morning',
    preferredTime: preferredTime ? String(preferredTime).trim() : undefined,
    notes: String(notes || '').trim(),
    adminNotes: String(adminNotes || '').trim(),
    status: status || 'new',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const data = db.get();
  data.bookings.unshift(newBooking);
  db.logActivity(req.user!, 'إضافة حجز يدوي', 'الحجوزات', `تمت إضافة حجز يدوي للمريض: ${newBooking.patientName}`);
  db.save();

  res.status(201).json({ success: true, item: newBooking });
});

// Update Booking / Status
apiRouter.put('/admin/bookings/:id', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const data = db.get();
  const booking = data.bookings.find((b) => b.id === id);

  if (!booking) {
    return res.status(404).json({ error: 'الحجز غير موجود' });
  }

  const prevStatus = booking.status;
  Object.assign(booking, req.body, { updatedAt: new Date().toISOString() });

  db.logActivity(
    req.user!,
    'تعديل حجز',
    'الحجوزات',
    `تم تحديث حجز ${booking.patientName}${req.body.status && req.body.status !== prevStatus ? ` (الحالة: ${req.body.status})` : ''}`
  );
  db.save();

  res.json({ success: true, item: booking });
});

// Soft Delete Booking
apiRouter.delete('/admin/bookings/:id', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const success = db.softDelete('bookings', id, req.user!);
  if (!success) {
    return res.status(404).json({ error: 'الحجز غير موجود أو تم حذفه مسبقًا' });
  }
  res.json({ success: true, message: 'تم نقل الحجز إلى سلة المحذوفات' });
});

/* ==========================================================================
   DOCTOR PROFILE & QUALIFICATIONS
   ========================================================================== */

apiRouter.get('/admin/doctor', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  res.json(db.get().doctor);
});

apiRouter.put('/admin/doctor', requireAuth, requireRole(['admin']), (req: AuthenticatedRequest, res: Response) => {
  const data = db.get();
  data.doctor = { ...data.doctor, ...req.body };
  db.logActivity(req.user!, 'تعديل بيانات الطبيب', 'بيانات الطبيب', 'تم تحديث النبذة والمؤهلات والخبرات الطبية');
  db.save();
  res.json({ success: true, doctor: data.doctor });
});

/* ==========================================================================
   SERVICES MANAGEMENT
   ========================================================================== */

apiRouter.get('/admin/services', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const list = db.get().services.filter((s) => !s.isDeleted).sort((a, b) => a.order - b.order);
  res.json(list);
});

apiRouter.post('/admin/services', requireAuth, requireRole(['admin', 'content_manager']), (req: AuthenticatedRequest, res: Response) => {
  const { title, slug, description, fullDescription, iconName, image, features, metaTitle, metaDescription } = req.body;
  if (!title) return res.status(400).json({ error: 'عنوان الخدمة مطلوب' });

  const data = db.get();
  const newService = {
    id: generateId('srv'),
    title: String(title).trim(),
    slug: slug ? String(slug).trim() : `service-${Date.now()}`,
    description: String(description || '').trim(),
    fullDescription: String(fullDescription || '').trim(),
    iconName: iconName || 'Activity',
    image: image || '/images/clinic-logo.jpg',
    features: Array.isArray(features) ? features : [],
    metaTitle: metaTitle || `${title} | عيادة د. عبدالباسط مقبل`,
    metaDescription: metaDescription || description || '',
    isActive: true,
    order: data.services.length + 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  data.services.push(newService);
  db.logActivity(req.user!, 'إضافة خدمة', 'الخدمات الطبية', `تمت إضافة خدمة جديدة: ${newService.title}`);
  db.save();

  res.status(201).json({ success: true, item: newService });
});

apiRouter.put('/admin/services/:id', requireAuth, requireRole(['admin', 'content_manager']), (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const data = db.get();
  const service = data.services.find((s) => s.id === id);
  if (!service) return res.status(404).json({ error: 'الخدمة غير موجودة' });

  Object.assign(service, req.body, { updatedAt: new Date().toISOString() });
  db.logActivity(req.user!, 'تعديل خدمة', 'الخدمات الطبية', `تم تعديل الخدمة: ${service.title}`);
  db.save();

  res.json({ success: true, item: service });
});

apiRouter.delete('/admin/services/:id', requireAuth, requireRole(['admin']), (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const success = db.softDelete('services', id, req.user!);
  if (!success) return res.status(404).json({ error: 'الخدمة غير موجودة' });
  res.json({ success: true, message: 'تم نقل الخدمة إلى سلة المحذوفات' });
});

apiRouter.post('/admin/services/reorder', requireAuth, requireRole(['admin']), (req: AuthenticatedRequest, res: Response) => {
  const { orderedIds } = req.body;
  if (!Array.isArray(orderedIds)) return res.status(400).json({ error: 'بيانات الترتيب غير صحيحة' });

  const data = db.get();
  orderedIds.forEach((id: string, index: number) => {
    const s = data.services.find((srv) => srv.id === id);
    if (s) s.order = index + 1;
  });
  db.save();
  res.json({ success: true, message: 'تم حفظ الترتيب بنجاح' });
});

/* ==========================================================================
   CONDITIONS MANAGEMENT
   ========================================================================== */

apiRouter.get('/admin/conditions', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const list = db.get().conditions.filter((c) => !c.isDeleted).sort((a, b) => a.order - b.order);
  res.json(list);
});

apiRouter.post('/admin/conditions', requireAuth, requireRole(['admin', 'content_manager']), (req: AuthenticatedRequest, res: Response) => {
  const { name, slug, category, icon, description, symptoms, treatmentApproach, keywords, metaTitle, metaDescription } = req.body;
  if (!name) return res.status(400).json({ error: 'اسم الحالة مطلوب' });

  const data = db.get();
  const parsedKeywords = Array.isArray(keywords)
    ? keywords
    : typeof keywords === 'string'
    ? keywords.split(',').map((k: string) => k.trim()).filter(Boolean)
    : [];

  const newCond = {
    id: generateId('cond'),
    name: String(name).trim(),
    slug: slug ? String(slug).trim() : `cond-${Date.now()}`,
    category: category || 'digestive',
    icon: icon || 'Flame',
    description: String(description || '').trim(),
    symptoms: Array.isArray(symptoms) ? symptoms : [],
    treatmentApproach: String(treatmentApproach || '').trim(),
    keywords: parsedKeywords,
    metaTitle: metaTitle ? String(metaTitle).trim() : undefined,
    metaDescription: metaDescription ? String(metaDescription).trim() : undefined,
    isActive: true,
    order: data.conditions.length + 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  data.conditions.push(newCond);
  db.logActivity(req.user!, 'إضافة حالة مرضية', 'الحالات المرضية', `تمت إضافة حالة: ${newCond.name}`);
  db.save();

  res.status(201).json({ success: true, item: newCond });
});

apiRouter.put('/admin/conditions/:id', requireAuth, requireRole(['admin', 'content_manager']), (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const data = db.get();
  const cond = data.conditions.find((c) => c.id === id);
  if (!cond) return res.status(404).json({ error: 'الحالة غير موجودة' });

  Object.assign(cond, req.body, { updatedAt: new Date().toISOString() });
  db.logActivity(req.user!, 'تعديل حالة مرضية', 'الحالات المرضية', `تم تعديل الحالة: ${cond.name}`);
  db.save();

  res.json({ success: true, item: cond });
});

apiRouter.delete('/admin/conditions/:id', requireAuth, requireRole(['admin']), (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const success = db.softDelete('conditions', id, req.user!);
  if (!success) return res.status(404).json({ error: 'الحالة غير موجودة' });
  res.json({ success: true, message: 'تم نقل الحالة إلى سلة المحذوفات' });
});

/* ==========================================================================
   CATEGORIES MANAGEMENT
   ========================================================================== */

apiRouter.get('/admin/categories', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const data = db.get();
  const list = (data.categories || []).sort((a, b) => a.order - b.order);
  res.json(list);
});

apiRouter.post('/admin/categories', requireAuth, requireRole(['admin', 'content_manager']), (req: AuthenticatedRequest, res: Response) => {
  const { name, slug, description, order, isActive } = req.body;
  if (!name) return res.status(400).json({ error: 'اسم التصنيف مطلوب' });

  const data = db.get();
  if (!data.categories) data.categories = [];

  const newCat = {
    id: generateId('cat'),
    name: String(name).trim(),
    slug: slug ? String(slug).trim() : `cat-${Date.now()}`,
    description: String(description || '').trim(),
    order: Number(order) || data.categories.length + 1,
    isActive: isActive !== false,
  };

  data.categories.push(newCat);
  db.logActivity(req.user!, 'إضافة تصنيف', 'التصنيفات', `تمت إضافة التصنيف: ${newCat.name}`);
  db.save();

  res.status(201).json({ success: true, item: newCat });
});

apiRouter.put('/admin/categories/:id', requireAuth, requireRole(['admin', 'content_manager']), (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const data = db.get();
  if (!data.categories) data.categories = [];
  const cat = data.categories.find((c) => c.id === id);
  if (!cat) return res.status(404).json({ error: 'التصنيف غير موجود' });

  Object.assign(cat, req.body);
  db.logActivity(req.user!, 'تعديل تصنيف', 'التصنيفات', `تم تعديل التصنيف: ${cat.name}`);
  db.save();

  res.json({ success: true, item: cat });
});

apiRouter.delete('/admin/categories/:id', requireAuth, requireRole(['admin']), (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const data = db.get();
  if (!data.categories) data.categories = [];
  const idx = data.categories.findIndex((c) => c.id === id);
  if (idx === -1) return res.status(404).json({ error: 'التصنيف غير موجود' });

  const deleted = data.categories.splice(idx, 1)[0];
  db.logActivity(req.user!, 'حذف تصنيف', 'التصنيفات', `تم حذف التصنيف: ${deleted.name}`);
  db.save();

  res.json({ success: true, message: 'تم حذف التصنيف بنجاح' });
});

/* ==========================================================================
   ENDOSCOPY PROCEDURES
   ========================================================================== */

apiRouter.get('/admin/endoscopy', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const list = db.get().endoscopy.filter((e) => !e.isDeleted).sort((a, b) => a.order - b.order);
  res.json(list);
});

apiRouter.post('/admin/endoscopy', requireAuth, requireRole(['admin', 'content_manager']), (req: AuthenticatedRequest, res: Response) => {
  const { title, slug, description, image, indications, duration, prepSummary, preInstructions, postInstructions } = req.body;
  if (!title) return res.status(400).json({ error: 'عنوان المنظار مطلوب' });

  const data = db.get();
  const newEndo = {
    id: generateId('endo'),
    title: String(title).trim(),
    slug: slug ? String(slug).trim() : `endo-${Date.now()}`,
    description: String(description || '').trim(),
    image: image || '/images/endoscopy-gastro.jpg',
    indications: Array.isArray(indications) ? indications : [],
    duration: duration || '15 دقيقة',
    prepSummary: String(prepSummary || '').trim(),
    preInstructions: Array.isArray(preInstructions) ? preInstructions : [],
    postInstructions: Array.isArray(postInstructions) ? postInstructions : [],
    isActive: true,
    order: data.endoscopy.length + 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  data.endoscopy.push(newEndo);
  db.logActivity(req.user!, 'إضافة إجراء منظار', 'مناظير الجهاز الهضمي', `تمت إضافة منظار: ${newEndo.title}`);
  db.save();

  res.status(201).json({ success: true, item: newEndo });
});

apiRouter.put('/admin/endoscopy/:id', requireAuth, requireRole(['admin', 'content_manager']), (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const data = db.get();
  const endo = data.endoscopy.find((e) => e.id === id);
  if (!endo) return res.status(404).json({ error: 'إجراء المنظار غير موجود' });

  Object.assign(endo, req.body, { updatedAt: new Date().toISOString() });
  db.logActivity(req.user!, 'تعديل إجراء منظار', 'مناظير الجهاز الهضمي', `تم تعديل: ${endo.title}`);
  db.save();

  res.json({ success: true, item: endo });
});

apiRouter.delete('/admin/endoscopy/:id', requireAuth, requireRole(['admin']), (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const success = db.softDelete('endoscopy', id, req.user!);
  if (!success) return res.status(404).json({ error: 'العنصر غير موجود' });
  res.json({ success: true, message: 'تم نقل العنصر إلى سلة المحذوفات' });
});

/* ==========================================================================
   ARTICLES CMS
   ========================================================================== */

apiRouter.get('/admin/articles', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const { status, category, search } = req.query;
  const data = db.get();
  let list = data.articles || [];

  if (status === 'trash') {
    list = list.filter((a) => a.isDeleted);
  } else if (status === 'all') {
    list = list.filter((a) => !a.isDeleted);
  } else if (status === 'published' || status === 'draft' || status === 'archived') {
    list = list.filter((a) => !a.isDeleted && a.status === status);
  } else {
    // Default: return all non-deleted articles so no old articles disappear
    list = list.filter((a) => !a.isDeleted);
  }

  if (category && typeof category === 'string' && category !== 'all') {
    list = list.filter((a) => a.category === category);
  }

  if (search && typeof search === 'string') {
    const q = search.trim().toLowerCase();
    list = list.filter(
      (a) =>
        (a.title && a.title.toLowerCase().includes(q)) ||
        (a.excerpt && a.excerpt.toLowerCase().includes(q))
    );
  }

  res.json(list);
});

apiRouter.post('/admin/articles/:id/restore', requireAuth, requireRole(['admin', 'content_manager']), (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const data = db.get();
  const article = (data.articles || []).find((a) => a.id === id);
  if (!article) return res.status(404).json({ error: 'المقال غير موجود' });
  article.isDeleted = false;
  article.status = 'published';
  db.logActivity(req.user!, 'استعادة مقال طبي', 'المقالات الطبية', `تمت استعادة المقال: ${article.title}`);
  db.save();
  res.json({ success: true, item: article, message: 'تمت استعادة المقال ونشره بنجاح' });
});

apiRouter.post('/admin/articles', requireAuth, requireRole(['admin', 'content_manager']), (req: AuthenticatedRequest, res: Response) => {
  const { title, slug, excerpt, content, category, author, readTime, date, image, tags, keywords, metaTitle, metaDescription, status } = req.body;
  if (!title || !content) return res.status(400).json({ error: 'عنوان المقال والمحتوى حقول مطلوبة' });

  const data = db.get();
  const parsedKeywords = Array.isArray(keywords)
    ? keywords
    : typeof keywords === 'string'
    ? keywords.split(',').map((k: string) => k.trim()).filter(Boolean)
    : [];

  const parsedTags = Array.isArray(tags)
    ? tags
    : typeof tags === 'string'
    ? tags.split(',').map((t: string) => t.trim()).filter(Boolean)
    : [];

  const newArticle = {
    id: generateId('art'),
    title: String(title).trim(),
    slug: slug ? String(slug).trim() : `article-${Date.now()}`,
    excerpt: String(excerpt || '').trim(),
    content: String(content || '').trim(),
    category: category || 'أمراض الجهاز الهضمي',
    author: author || 'د. عبدالباسط عبده الحاج مقبل',
    readTime: readTime || '3 دقائق',
    date: date || new Date().toISOString().split('T')[0],
    image: image || '/images/endoscopy-gastro.jpg',
    tags: parsedTags,
    keywords: parsedKeywords,
    metaTitle: metaTitle ? String(metaTitle).trim() : undefined,
    metaDescription: metaDescription ? String(metaDescription).trim() : undefined,
    status: status || 'published',
    views: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  data.articles.unshift(newArticle);
  db.logActivity(req.user!, 'إضافة مقال طبي', 'المقالات الطبية', `تم نشر مقال جديد: ${newArticle.title}`);
  db.save();

  res.status(201).json({ success: true, item: newArticle });
});

apiRouter.put('/admin/articles/:id', requireAuth, requireRole(['admin', 'content_manager']), (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const data = db.get();
  const article = data.articles.find((a) => a.id === id);
  if (!article) return res.status(404).json({ error: 'المقال غير موجود' });

  Object.assign(article, req.body, { updatedAt: new Date().toISOString() });
  db.logActivity(req.user!, 'تعديل مقال طبي', 'المقالات الطبية', `تم تعديل المقال: ${article.title}`);
  db.save();

  res.json({ success: true, item: article });
});

apiRouter.delete('/admin/articles/:id', requireAuth, requireRole(['admin']), (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const success = db.softDelete('articles', id, req.user!);
  if (!success) return res.status(404).json({ error: 'المقال غير موجود' });
  res.json({ success: true, message: 'تم نقل المقال إلى سلة المحذوفات' });
});

/* ==========================================================================
   FAQ MANAGEMENT
   ========================================================================== */

apiRouter.get('/admin/faq', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const list = db.get().faqs.filter((f) => !f.isDeleted).sort((a, b) => a.order - b.order);
  res.json(list);
});

apiRouter.post('/admin/faq', requireAuth, requireRole(['admin', 'content_manager']), (req: AuthenticatedRequest, res: Response) => {
  const { question, answer, category } = req.body;
  if (!question || !answer) return res.status(400).json({ error: 'السؤال والإجابة مطلوبان' });

  const data = db.get();
  const newFaq = {
    id: generateId('faq'),
    question: String(question).trim(),
    answer: String(answer).trim(),
    category: category || 'عام',
    order: data.faqs.length + 1,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  data.faqs.push(newFaq);
  db.logActivity(req.user!, 'إضافة سؤال شائع', 'الأسئلة الشائعة', `تمت إضافة سؤال: ${newFaq.question}`);
  db.save();

  res.status(201).json({ success: true, item: newFaq });
});

apiRouter.put('/admin/faq/:id', requireAuth, requireRole(['admin', 'content_manager']), (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const data = db.get();
  const faq = data.faqs.find((f) => f.id === id);
  if (!faq) return res.status(404).json({ error: 'السؤال غير موجود' });

  Object.assign(faq, req.body, { updatedAt: new Date().toISOString() });
  db.logActivity(req.user!, 'تعديل سؤال شائع', 'الأسئلة الشائعة', `تم تعديل السؤال: ${faq.question}`);
  db.save();

  res.json({ success: true, item: faq });
});

apiRouter.delete('/admin/faq/:id', requireAuth, requireRole(['admin']), (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const success = db.softDelete('faqs', id, req.user!);
  if (!success) return res.status(404).json({ error: 'السؤال غير موجود' });
  res.json({ success: true, message: 'تم نقل السؤال إلى سلة المحذوفات' });
});

/* ==========================================================================
   MESSAGES MANAGEMENT
   ========================================================================== */

apiRouter.get('/admin/messages', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const list = db.get().messages.filter((m) => !m.isDeleted);
  res.json(list);
});

apiRouter.put('/admin/messages/:id', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const data = db.get();
  const msg = data.messages.find((m) => m.id === id);
  if (!msg) return res.status(404).json({ error: 'الرسالة غير موجودة' });

  Object.assign(msg, req.body, { updatedAt: new Date().toISOString() });
  db.save();
  res.json({ success: true, item: msg });
});

apiRouter.delete('/admin/messages/:id', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const success = db.softDelete('messages', id, req.user!);
  if (!success) return res.status(404).json({ error: 'الرسالة غير موجودة' });
  res.json({ success: true, message: 'تم حذف الرسالة' });
});

/* ==========================================================================
   SCHEDULE & CONTACT SETTINGS
   ========================================================================== */

apiRouter.get('/admin/schedule', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  res.json(db.get().schedule);
});

apiRouter.put('/admin/schedule', requireAuth, requireRole(['admin']), (req: AuthenticatedRequest, res: Response) => {
  const data = db.get();
  data.schedule = { ...data.schedule, ...req.body };
  db.logActivity(req.user!, 'تعديل أوقات الدوام', 'أوقات الدوام', 'تم تحديث فترات الدوام أو رسالة الإجازة');
  db.save();
  res.json({ success: true, schedule: data.schedule });
});

apiRouter.get('/admin/contact', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  res.json(db.get().contact);
});

apiRouter.put('/admin/contact', requireAuth, requireRole(['admin']), (req: AuthenticatedRequest, res: Response) => {
  const data = db.get();
  data.contact = { ...data.contact, ...req.body };
  db.logActivity(req.user!, 'تعديل بيانات التواصل', 'بيانات التواصل', 'تم تحديث أرقام الهواتف أو العنوان أو روابط التواصل');
  db.save();
  res.json({ success: true, contact: data.contact });
});

/* ==========================================================================
   MEDIA LIBRARY
   ========================================================================== */

apiRouter.get('/admin/media', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const { status = 'active', category, type, search } = req.query;
  const data = db.get();

  let mediaItems = (data.media || []).map((m) => {
    const usages = findMediaUsages(m.url, data);
    const fileExistsCheck = checkFileExists(m.url);
    const baseName = m.url ? path.basename(m.url) : '';
    return {
      ...m,
      title: m.title || m.name || 'ملف وسائط طبي',
      usages,
      inUse: usages.length > 0,
      fileExists: fileExistsCheck.exists || Boolean(m.isVideo),
      storage_path: m.storage_path || `data/uploads/${baseName}`,
      public_url: m.public_url || m.url,
      status: m.status || 'active',
      file_name: m.file_name || baseName,
      file_type: m.file_type || m.fileType || 'image/jpeg',
      file_size: m.file_size || m.fileSize || '350 KB',
      created_at: m.created_at || m.createdAt || m.uploadedAt,
      uploaded_by: m.uploaded_by || m.uploadedBy || 'د. عبدالباسط مقبل',
    };
  });

  // Filter by status
  if (status === 'trash') {
    mediaItems = mediaItems.filter((m) => m.status === 'trash');
  } else if (status === 'active') {
    mediaItems = mediaItems.filter((m) => m.status !== 'trash');
  } // 'all' returns all

  // Filter by type
  if (type === 'image') {
    mediaItems = mediaItems.filter((m) => !m.isVideo);
  } else if (type === 'video') {
    mediaItems = mediaItems.filter((m) => m.isVideo);
  }

  // Filter by category
  if (category && typeof category === 'string' && category !== 'all') {
    mediaItems = mediaItems.filter((m) => m.category === category);
  }

  // Filter by search
  if (search && typeof search === 'string') {
    const q = search.trim().toLowerCase();
    mediaItems = mediaItems.filter(
      (m) =>
        (m.title && m.title.toLowerCase().includes(q)) ||
        (m.name && m.name.toLowerCase().includes(q)) ||
        (m.altText && m.altText.toLowerCase().includes(q))
    );
  }

  res.json(mediaItems);
});

// Update media details (name, title, category, altText)
apiRouter.put('/admin/media/:id', requireAuth, requireRole(['admin', 'content_manager']), (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { title, name, category, altText } = req.body;
  const data = db.get();
  const item = (data.media || []).find((m) => m.id === id);
  if (!item) return res.status(404).json({ error: 'ملف الوسائط غير موجود' });

  if (title) item.title = String(title).trim();
  if (name) item.name = String(name).trim();
  if (category) item.category = String(category).trim();
  if (altText) item.altText = String(altText).trim();
  item.updatedAt = new Date().toISOString();
  item.updated_at = item.updatedAt;

  db.logActivity(req.user!, 'تعديل بيانات وسائط', 'الصور والوسائط', `تم تعديل بيانات: ${item.title || item.name}`);
  db.save();

  res.json({ success: true, item });
});

// Soft-delete: Move to trash
apiRouter.post('/admin/media/:id/trash', requireAuth, requireRole(['admin', 'content_manager']), (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const data = db.get();
  const item = (data.media || []).find((m) => m.id === id);
  if (!item) return res.status(404).json({ error: 'ملف الوسائط غير موجود' });

  item.status = 'trash';
  item.deleted_at = new Date().toISOString();
  item.deletedAt = item.deleted_at;

  db.logActivity(req.user!, 'نقل وسائط إلى سلة المحذوفات', 'الصور والوسائط', `تم نقل الوسائط إلى سلة المحذوفات: ${item.name || id}`);
  db.save();

  res.json({ success: true, message: 'تم نقل الملف إلى سلة المحذوفات بنجاح', item });
});

// Restore from trash
apiRouter.post('/admin/media/:id/restore', requireAuth, requireRole(['admin', 'content_manager']), (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const data = db.get();
  const item = (data.media || []).find((m) => m.id === id);
  if (!item) return res.status(404).json({ error: 'ملف الوسائط غير موجود' });

  item.status = 'active';
  item.deleted_at = null;
  item.deletedAt = null;

  db.logActivity(req.user!, 'استرجاع وسائط من سلة المحذوفات', 'الصور والوسائط', `تمت استعادة الوسائط: ${item.name || id}`);
  db.save();

  res.json({ success: true, message: 'تم استرجاع الملف بنجاح إلى مكتبة الوسائط', item });
});

// Empty trash
apiRouter.post('/admin/media/empty-trash', requireAuth, requireRole(['admin']), (req: AuthenticatedRequest, res: Response) => {
  const data = db.get();
  const trashed = (data.media || []).filter((m) => m.status === 'trash');
  let deletedCount = 0;

  trashed.forEach((item) => {
    if (typeof item.url === 'string' && item.url.startsWith('/uploads/')) {
      const baseName = path.basename(item.url);
      deleteUploadedFile(baseName);
    }
    deletedCount++;
  });

  data.media = (data.media || []).filter((m) => m.status !== 'trash');
  db.logActivity(req.user!, 'إفراغ سلة محذوفات الوسائط', 'الصور والوسائط', `تم تفريغ سلة المحذوفات وحذف ${deletedCount} ملف نهائياً`);
  db.save();

  res.json({ success: true, count: deletedCount, message: `تم إفراغ سلة المحذوفات وحذف ${deletedCount} ملف نهائياً` });
});

// System Reconciliation Engine: Matches Storage <-> Database, auto-recovers missing files
apiRouter.post('/admin/system/reconcile', requireAuth, requireRole(['admin']), (req: AuthenticatedRequest, res: Response) => {
  const data = db.get();
  const report = reconcileMediaSystem(data);
  db.logActivity(
    req.user!,
    'فحص ومطابقة الوسائط',
    'النظام والتخزين',
    `تمت مطابقة ${report.totalPhysicalFiles} ملف فعلي، واكتشاف ${report.orphanedFilesDiscovered} ملف، ومزامنة ${report.videosSynchronized} فيديو`
  );
  db.save();

  res.json({
    success: true,
    report,
    message: 'اكتمل فحص ومطابقة الوسائط والتخزين الدائم بنجاح وتحديث كافة السجلات',
  });
});

// System Audit / Health Check
apiRouter.get('/admin/system/audit', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const data = db.get();
  const report = reconcileMediaSystem(data);
  db.save();
  res.json({ success: true, report });
});

// On-demand instant backup
apiRouter.post('/admin/system/backup', requireAuth, requireRole(['admin']), (req: AuthenticatedRequest, res: Response) => {
  const result = db.createManualSnapshot(req.user!, 'manual_audit_backup');
  res.json({
    success: true,
    fileName: result.fileName,
    message: 'تم أخذ نسخة احتياطية فورية وحفظها بنجاح في مجلد النسخ الاحتياطي الدائم',
  });
});

// Audit and health check of all media files in database (legacy endpoint)
apiRouter.get('/admin/media/health', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const data = db.get();
  const report = reconcileMediaSystem(data);
  db.save();
  res.json({
    status: 'healthy',
    totalMedia: (data.media || []).length,
    verifiedCount: report.totalPhysicalFiles,
    repairedCount: report.brokenLinksRepaired,
    issues: report.issues,
    message: 'تم فحص جميع ملفات الوسائط ومطابقتها بالتخزين الدائم',
  });
});

apiRouter.post('/admin/media', requireAuth, requireRole(['admin', 'content_manager']), (req: AuthenticatedRequest, res: Response) => {
  let { name, title, url, altText, fileSize, fileType, category, isVideo, youtubeUrl, youtubeId, duration } = req.body;
  const finalName = String(name || title || (isVideo ? 'فيديو طبي' : 'صورة طبية')).trim();
  if (!finalName || !url) return res.status(400).json({ error: 'اسم الملف ورابطه مطلوبان' });

  // If incoming url is base64, save exact original file to disk and use permanent static URL
  if (typeof url === 'string' && url.startsWith('data:image/')) {
    const saved = saveBase64ImageToDisk(url, finalName);
    if (saved) {
      url = saved.url;
      fileSize = `${Math.round(saved.size / 1024)} KB`;
    }
  }

  const baseName = url ? path.basename(url) : '';
  const newMedia = {
    id: generateId('med'),
    name: finalName,
    file_name: baseName,
    title: finalName,
    storage_path: `data/uploads/${baseName}`,
    public_url: String(url).trim(),
    url: String(url).trim(),
    altText: String(altText || finalName).trim(),
    category: category || (isVideo ? 'فيديوهات طبية' : 'عيادة'),
    file_size: fileSize || (isVideo ? duration || '05:00' : '250 KB'),
    fileSize: fileSize || (isVideo ? duration || '05:00' : '250 KB'),
    file_type: fileType || (isVideo ? 'video/youtube' : 'image/jpeg'),
    fileType: fileType || (isVideo ? 'video/youtube' : 'image/jpeg'),
    mime_type: fileType || (isVideo ? 'video/youtube' : 'image/jpeg'),
    status: 'active' as const,
    deleted_at: null,
    deletedAt: null,
    uploadedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    uploaded_by: req.user?.name || 'د. عبدالباسط مقبل',
    uploadedBy: req.user?.name || 'د. عبدالباسط مقبل',
    isVideo: Boolean(isVideo),
    youtubeUrl: youtubeUrl || undefined,
    youtubeId: youtubeId || undefined,
    videoDuration: duration || undefined,
  };

  const data = db.get();
  data.media.unshift(newMedia);
  db.logActivity(req.user!, 'رفع وسائط', 'الصور والوسائط', `تمت إضافة وسائط جديدة: ${newMedia.name}`);
  db.save();

  res.status(201).json({ success: true, item: newMedia });
});

// Delete or Soft-Delete media item with in-use verification
apiRouter.delete('/admin/media/:id', requireAuth, requireRole(['admin']), (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const force = req.query.force === 'true';
  const permanent = req.query.permanent === 'true';
  const data = db.get();
  const idx = data.media.findIndex((m) => m.id === id);
  if (idx === -1) return res.status(404).json({ error: 'الملف غير موجود' });

  const targetMedia = data.media[idx];

  // If permanent delete requested or file is already in trash
  if (permanent || targetMedia.status === 'trash') {
    // 1. Verify if the image is in use elsewhere
    const usages = findMediaUsages(targetMedia.url, data);
    if (usages.length > 0 && !force) {
      return res.status(400).json({
        error: 'image_in_use',
        warning: true,
        inUse: true,
        usages,
        message: `هذا الملف مستخدم حاليًا في: ${usages.join('، ')}. لحذفه نهائيًا يرجى تأكيد الحذف الإجباري.`,
      });
    }

    // 2. Remove record from DB
    const [removedMedia] = data.media.splice(idx, 1);

    // 3. Delete physical file from all persistent directories
    if (removedMedia && typeof removedMedia.url === 'string' && removedMedia.url.startsWith('/uploads/')) {
      const baseName = path.basename(removedMedia.url);
      deleteUploadedFile(baseName);
    }

    db.logActivity(req.user!, 'حذف وسائط نهائي', 'الصور والوسائط', `تم حذف الوسائط نهائيًا: ${removedMedia?.name || id}`);
    db.save();

    return res.json({ success: true, message: 'تم حذف الملف نهائيًا من المكتبة والقرص التخزيني بنجاح' });
  }

  // Otherwise: Soft Delete (move to trash)
  targetMedia.status = 'trash';
  targetMedia.deleted_at = new Date().toISOString();
  targetMedia.deletedAt = targetMedia.deleted_at;
  db.logActivity(req.user!, 'نقل وسائط إلى سلة المحذوفات', 'الصور والوسائط', `تم نقل الوسائط إلى سلة المحذوفات: ${targetMedia.name || id}`);
  db.save();

  res.json({ success: true, message: 'تم نقل الملف إلى سلة المحذوفات بنجاح (يمكن استعادته في أي وقت)' });
});

// Delete media item directly by its URL/path
apiRouter.post('/admin/media/delete-by-url', requireAuth, requireRole(['admin', 'content_manager']), (req: AuthenticatedRequest, res: Response) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: 'الرابط مطلوب لحذف الملف' });

  const data = db.get();
  const baseName = path.basename(url);
  const idx = data.media.findIndex((m) => m.url === url || m.public_url === url || m.file_name === baseName);

  if (idx !== -1) {
    const [removedMedia] = data.media.splice(idx, 1);
    deleteUploadedFile(baseName);
    db.logActivity(req.user!, 'حذف وسائط نهائي بالرابط', 'الصور والوسائط', `تم حذف ملف الوسائط نهائيًا بالرابط: ${baseName}`);
    db.save();
    return res.json({ success: true, message: 'تم حذف الملف وسجله بنجاح' });
  }

  // If file doesn't have a DB record but is physically there
  if (url.includes('/uploads/')) {
    deleteUploadedFile(baseName);
    db.logActivity(req.user!, 'حذف ملف تخزين معزول بالرابط', 'الصور والوسائط', `تم حذف ملف تخزين معزول بالرابط: ${baseName}`);
    return res.json({ success: true, message: 'تم حذف ملف التخزين المعزول بنجاح' });
  }

  res.status(404).json({ error: 'لم يتم العثور على سجل أو ملف للمسار المحدد' });
});

// Replace existing media item and globally update all references
apiRouter.post('/admin/media/:id/replace', requireAuth, requireRole(['admin', 'content_manager']), handleMulterUpload, async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const data = db.get();
  const mediaItem = data.media.find((m) => m.id === id);
  if (!mediaItem) return res.status(404).json({ error: 'الصورة المراد استبدالها غير موجودة' });

  const oldUrl = mediaItem.url;
  let newUrl = '';
  let newName = mediaItem.name;
  let newSize = mediaItem.fileSize;
  let newMime = mediaItem.fileType;

  if (req.file) {
    const isVideo = req.file.mimetype.startsWith('video/');
    const folder = isVideo ? 'videos' : 'images';
    const timestamp = Date.now();
    const randomSuffix = Math.random().toString(36).substring(2, 7);
    const cleanName = req.file.originalname.replace(/[^a-zA-Z0-9_\-\.]/g, '_');
    const uniqueFileName = `${timestamp}-${randomSuffix}-${cleanName}`;
    const storageKey = `${folder}/${uniqueFileName}`;

    try {
      const { createClient } = await import('@supabase/supabase-js');
      const sUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || 'https://rmvhgoewsegyohdbsjsd.supabase.co';
      const sKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_yROJ40jpb1d5RdyfJ3zeRQ_hfN_VmPu';
      const supa = createClient(sUrl, sKey);

      const { data: supaData, error: supaError } = await supa.storage
        .from('media')
        .upload(storageKey, req.file.buffer, {
          contentType: req.file.mimetype,
          cacheControl: '31536000',
          upsert: false,
        });

      if (supaError || !supaData) {
        throw new Error(supaError?.message || 'فشل رفع الملف إلى Supabase Storage');
      }

      const { data: pubData } = supa.storage.from('media').getPublicUrl(storageKey);
      newUrl = pubData.publicUrl;
      newName = req.file.originalname || uniqueFileName;
      try {
        const decoded = Buffer.from(newName, 'latin1').toString('utf8');
        if (/[\u0600-\u06FF]/.test(decoded)) {
          newName = decoded;
        }
      } catch {}
      newSize = `${Math.round(req.file.size / 1024)} KB`;
      newMime = req.file.mimetype;
    } catch (err: any) {
      return res.status(500).json({ error: `فشل استبدال الملف في Supabase Storage: ${err.message}` });
    }
  } else if (req.body?.newUrl) {
    newUrl = String(req.body.newUrl).trim();
  }

  if (!newUrl) {
    return res.status(400).json({ error: 'يرجى تقديم ملف صورة جديد أو رابط صالح للاستبدال' });
  }

  // Update media item record
  mediaItem.url = newUrl;
  mediaItem.name = newName;
  mediaItem.title = newName;
  mediaItem.fileSize = newSize;
  mediaItem.fileType = newMime;
  mediaItem.uploadedAt = new Date().toISOString();

  // Replace across all models in database
  const replaceResult = replaceMediaUrlGlobally(oldUrl, newUrl, data);

  db.logActivity(
    req.user!,
    'استبدال صورة',
    'الصور والوسائط',
    `تم استبدال الصورة "${oldUrl}" بالرابط الجديد "${newUrl}" في ${replaceResult.count} مواضع`
  );
  db.save();

  res.json({
    success: true,
    message: `تم استبدال الصورة بنجاح وتحديثها في ${replaceResult.count} مواضع في الموقع`,
    newUrl,
    updatedCount: replaceResult.count,
    places: replaceResult.places,
    media: mediaItem,
  });
});

/* ==========================================================================
   CUSTOM PAGES MANAGEMENT (CMS)
   ========================================================================== */

apiRouter.get('/admin/pages', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const data = db.get();
  const pages = (data.pages || []).filter((p) => !p.isDeleted).sort((a, b) => a.order - b.order);
  res.json(pages);
});

apiRouter.post('/admin/pages', requireAuth, requireRole(['admin', 'content_manager']), (req: AuthenticatedRequest, res: Response) => {
  const { title, slug, content, excerpt, coverImage, metaTitle, metaDescription, keywords, showInHeader, showInFooter, isActive } = req.body;

  if (!title || !slug) {
    return res.status(400).json({ error: 'عنوان الصفحة والرابط المخصص (Slug) حقول مطلوبة' });
  }

  const cleanSlug = String(slug)
    .trim()
    .toLowerCase()
    .replace(/[^a-zA-Z0-9-_\u0600-\u06FF]/g, '-')
    .replace(/-+/g, '-');

  const data = db.get();
  if (!data.pages) data.pages = [];

  const existing = data.pages.find((p) => !p.isDeleted && p.slug === cleanSlug);
  if (existing) {
    return res.status(400).json({ error: 'هذا الرابط المخصص (Slug) مستخدم بالفعل لصفحة أخرى' });
  }

  const newPage = {
    id: generateId('pag'),
    title: String(title).trim(),
    slug: cleanSlug,
    content: String(content || '').trim(),
    excerpt: excerpt ? String(excerpt).trim() : '',
    coverImage: coverImage ? String(coverImage).trim() : '',
    metaTitle: metaTitle ? String(metaTitle).trim() : `${title} | عيادة د. عبدالباسط مقبل`,
    metaDescription: metaDescription ? String(metaDescription).trim() : '',
    keywords: Array.isArray(keywords) ? keywords : typeof keywords === 'string' ? (keywords as string).split(',').map((k: string) => k.trim()).filter(Boolean) : [],
    showInHeader: Boolean(showInHeader),
    showInFooter: showInFooter !== undefined ? Boolean(showInFooter) : true,
    order: data.pages.length + 1,
    isActive: isActive !== undefined ? Boolean(isActive) : true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  data.pages.push(newPage);
  db.logActivity(req.user!, 'إنشاء صفحة جديدة', 'إدارة الصفحات', `تم إنشاء صفحة: ${newPage.title} (${newPage.slug})`);
  db.save();

  res.status(201).json({ success: true, item: newPage });
});

apiRouter.put('/admin/pages/:id', requireAuth, requireRole(['admin', 'content_manager']), (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const data = db.get();
  if (!data.pages) data.pages = [];

  const page = data.pages.find((p) => p.id === id);
  if (!page) return res.status(404).json({ error: 'الصفحة غير موجودة' });

  if (req.body.slug && req.body.slug !== page.slug) {
    const cleanSlug = String(req.body.slug)
      .trim()
      .toLowerCase()
      .replace(/[^a-zA-Z0-9-_\u0600-\u06FF]/g, '-')
      .replace(/-+/g, '-');
    const existing = data.pages.find((p) => !p.isDeleted && p.slug === cleanSlug && p.id !== id);
    if (existing) {
      return res.status(400).json({ error: 'هذا الرابط المخصص (Slug) مستخدم بالفعل لصفحة أخرى' });
    }
    req.body.slug = cleanSlug;
  }

  if (req.body.keywords && typeof req.body.keywords === 'string') {
    req.body.keywords = req.body.keywords.split(',').map((k: string) => k.trim()).filter(Boolean);
  }

  Object.assign(page, req.body, { updatedAt: new Date().toISOString() });
  db.logActivity(req.user!, 'تعديل صفحة', 'إدارة الصفحات', `تم تحديث صفحة: ${page.title}`);
  db.save();

  res.json({ success: true, item: page });
});

apiRouter.delete('/admin/pages/:id', requireAuth, requireRole(['admin']), (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const success = db.softDelete('pages' as any, id, req.user!);
  if (!success) return res.status(404).json({ error: 'الصفحة غير موجودة' });
  res.json({ success: true, message: 'تم نقل الصفحة إلى سلة المحذوفات' });
});

/* ==========================================================================
   SEO & SITE SETTINGS
   ========================================================================== */

apiRouter.get('/admin/seo', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  res.json(db.get().seo);
});

apiRouter.put('/admin/seo', requireAuth, requireRole(['admin']), (req: AuthenticatedRequest, res: Response) => {
  const data = db.get();
  data.seo = { ...data.seo, ...req.body };
  db.logActivity(req.user!, 'تعديل إعدادات SEO', 'SEO', 'تم تحديث الكلمات الدلالية وعناوين محركات البحث');
  db.save();
  res.json({ success: true, seo: data.seo });
});

apiRouter.get('/admin/settings', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  res.json(db.get().settings);
});

apiRouter.put('/admin/settings', requireAuth, requireRole(['super_admin', 'admin']), (req: AuthenticatedRequest, res: Response) => {
  const data = db.get();
  data.settings = { ...data.settings, ...req.body };
  db.logActivity(req.user!, 'تعديل إعدادات الموقع', 'إعدادات الموقع', 'تم تحديث اسم الموقع أو الهيدر أو وضع الصيانة');
  db.save();
  res.json({ success: true, settings: data.settings });
});

/* ==========================================================================
   HOMEPAGE CONTENT & SECTIONS MANAGER
   ========================================================================== */

apiRouter.get('/admin/homepage', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const data = db.get();
  res.json({
    settings: data.settings,
    doctor: data.doctor,
    services: data.services.filter((s) => !s.isDeleted),
  });
});

apiRouter.put('/admin/homepage', requireAuth, requireRole(['admin']), (req: AuthenticatedRequest, res: Response) => {
  const data = db.get();
  if (req.body.settings) {
    data.settings = { ...data.settings, ...req.body.settings };
  }
  if (req.body.doctor) {
    data.doctor = { ...data.doctor, ...req.body.doctor };
  }
  db.logActivity(req.user!, 'تعديل الصفحة الرئيسية', 'إدارة الصفحة الرئيسية', 'تم تحديث عناصر الصفحة الرئيسية والأقسام والبانرات');
  db.save();
  res.json({ success: true, settings: data.settings, doctor: data.doctor });
});

/* ==========================================================================
   USERS & ROLE BASED ACCESS CONTROL (SUPER ADMIN ONLY)
   ========================================================================== */

apiRouter.get('/admin/users', requireAuth, requireRole(['super_admin']), (req: AuthenticatedRequest, res: Response) => {
  const users = db.get().users.map((u) => ({
    id: u.id,
    email: u.email,
    name: u.name,
    role: u.role,
    phone: u.phone,
    isActive: u.isActive,
    createdAt: u.createdAt,
    lastLogin: u.lastLogin,
  }));
  res.json(users);
});

apiRouter.post('/admin/users', requireAuth, requireRole(['super_admin']), (req: AuthenticatedRequest, res: Response) => {
  const { email, password, name, role, phone } = req.body;

  if (!email || !password || !name) {
    return res.status(400).json({ error: 'الاسم، البريد الإلكتروني، وكلمة المرور حقول مطلوبة' });
  }

  const data = db.get();
  if (data.users.some((u) => u.email.toLowerCase() === String(email).trim().toLowerCase())) {
    return res.status(400).json({ error: 'هذا البريد الإلكتروني مسجل بالفعل لمستخدم آخر' });
  }

  const newUser = {
    id: generateId('usr'),
    email: String(email).trim().toLowerCase(),
    name: String(name).trim(),
    role: (role as UserRole) || 'receptionist',
    passwordHash: hashPassword(password),
    phone: phone ? String(phone).trim() : '',
    isActive: true,
    createdAt: new Date().toISOString(),
  };

  data.users.push(newUser);
  db.logActivity(req.user!, 'إضافة مستخدم جديد', 'المستخدمون والصلاحيات', `تم إنشاء حساب: ${newUser.name} بصلاحية ${newUser.role}`);
  db.save();

  res.status(201).json({
    success: true,
    user: {
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      role: newUser.role,
      phone: newUser.phone,
      isActive: newUser.isActive,
    },
  });
});

apiRouter.put('/admin/users/:id', requireAuth, requireRole(['super_admin']), (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { name, role, isActive, password, phone } = req.body;
  const data = db.get();
  const user = data.users.find((u) => u.id === id);

  if (!user) return res.status(404).json({ error: 'المستخدم غير موجود' });

  if (name) user.name = String(name).trim();
  if (role) user.role = role as UserRole;
  if (typeof isActive === 'boolean') user.isActive = isActive;
  if (phone !== undefined) user.phone = String(phone);
  if (password && String(password).length >= 6) {
    user.passwordHash = hashPassword(password);
  }

  db.logActivity(req.user!, 'تعديل مستخدم', 'المستخدمون والصلاحيات', `تم تحديث بيانات المستخدم: ${user.name}`);
  db.save();

  res.json({
    success: true,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      phone: user.phone,
      isActive: user.isActive,
    },
  });
});

apiRouter.delete('/admin/users/:id', requireAuth, requireRole(['super_admin']), (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const data = db.get();

  if (id === req.user?.id) {
    return res.status(400).json({ error: 'لا يمكنك حذف حسابك الحالي أثناء تسجيل الدخول به' });
  }

  const idx = data.users.findIndex((u) => u.id === id);
  if (idx === -1) return res.status(404).json({ error: 'المستخدم غير موجود' });

  const deletedUser = data.users.splice(idx, 1)[0];
  db.logActivity(req.user!, 'حذف مستخدم', 'المستخدمون والصلاحيات', `تم حذف المستخدم: ${deletedUser.name}`);
  db.save();

  res.json({ success: true, message: 'تم حذف المستخدم بنجاح' });
});

/* ==========================================================================
   NOTIFICATIONS, ACTIVITY LOGS, RECYCLE BIN, BACKUP
   ========================================================================== */

// Notifications
apiRouter.get('/admin/notifications', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  res.json(db.get().notifications);
});

apiRouter.put('/admin/notifications/:id/read', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const notif = db.get().notifications.find((n) => n.id === req.params.id);
  if (notif) notif.isRead = true;
  db.save();
  res.json({ success: true });
});

apiRouter.put('/admin/notifications/mark-all-read', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  db.get().notifications.forEach((n) => (n.isRead = true));
  db.save();
  res.json({ success: true });
});

// Activity Logs
apiRouter.get('/admin/activity', requireAuth, requireRole(['admin']), (req: AuthenticatedRequest, res: Response) => {
  res.json(db.get().activityLogs);
});

// Recycle Bin
apiRouter.get('/admin/recycle-bin', requireAuth, requireRole(['admin']), (req: AuthenticatedRequest, res: Response) => {
  res.json(db.get().recycleBin);
});

apiRouter.post('/admin/recycle-bin/:id/restore', requireAuth, requireRole(['admin']), (req: AuthenticatedRequest, res: Response) => {
  const success = db.restoreFromRecycleBin(req.params.id, req.user!);
  if (!success) return res.status(404).json({ error: 'العنصر غير موجود في سلة المحذوفات' });
  res.json({ success: true, message: 'تم استرجاع العنصر بنجاح' });
});

apiRouter.delete('/admin/recycle-bin/:id', requireAuth, requireRole(['super_admin', 'admin']), (req: AuthenticatedRequest, res: Response) => {
  const success = db.purgeRecycleBinItem(req.params.id, req.user!);
  if (!success) return res.status(404).json({ error: 'العنصر غير موجود' });
  res.json({ success: true, message: 'تم الحذف النهائي للعنصر' });
});

// Backup & Restore
apiRouter.get('/admin/backup/export', requireAuth, requireRole(['super_admin', 'admin']), (req: AuthenticatedRequest, res: Response) => {
  const backupJson = db.exportBackup();
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', `attachment; filename="dr-abdulbasit-clinic-backup-${Date.now()}.json"`);
  res.send(backupJson);
});

apiRouter.post('/admin/backup/import', requireAuth, requireRole(['super_admin']), (req: AuthenticatedRequest, res: Response) => {
  const { data } = req.body;
  if (!data) return res.status(400).json({ error: 'بيانات النسخة الاحتياطية فارغة' });

  const success = db.importBackup(typeof data === 'string' ? data : JSON.stringify(data), req.user!);
  if (!success) return res.status(400).json({ error: 'فشلت استعادة النسخة الاحتياطية، تأكد من صحة الملف' });

  res.json({ success: true, message: 'تم استرجاع النسخة الاحتياطية بنجاح' });
});

// System & Storage Health Status
apiRouter.get('/admin/system/status', requireAuth, (_req: AuthenticatedRequest, res: Response) => {
  res.json(db.getStats());
});

// Automated & Manual Snapshot listing and management
apiRouter.get('/admin/backup/snapshots', requireAuth, requireRole(['super_admin', 'admin']), (_req: AuthenticatedRequest, res: Response) => {
  res.json(db.listSnapshots());
});

apiRouter.post('/admin/backup/snapshots', requireAuth, requireRole(['super_admin', 'admin']), (req: AuthenticatedRequest, res: Response) => {
  const note = req.body?.note ? String(req.body.note) : undefined;
  const snapshot = db.createManualSnapshot(req.user!, note);
  res.status(201).json({ success: true, snapshot });
});

apiRouter.post('/admin/backup/snapshots/:filename/restore', requireAuth, requireRole(['super_admin']), (req: AuthenticatedRequest, res: Response) => {
  const success = db.restoreSnapshot(req.params.filename, req.user!);
  if (!success) return res.status(400).json({ error: 'تعذر استعادة اللقطة الاحتياطية المحددة' });
  res.json({ success: true, message: `تمت استعادة اللقطة الاحتياطية بنجاح: ${req.params.filename}` });
});

/* ==========================================================================
   PUBLIC SEARCH & JOB APPLICATION ROUTES
   ========================================================================== */

function extractYouTubeId(url: string): string {
  if (!url) return '';
  const clean = String(url).trim();
  const match = clean.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([\w-]{11})/);
  if (match && match[1]) return match[1];
  if (/^[\w-]{11}$/.test(clean)) return clean;
  return '';
}

// Global Search API (Public)
apiRouter.get('/public/search', (req: Request, res: Response) => {
  const query = String(req.query.q || '').trim().toLowerCase();
  if (!query || query.length < 2) {
    return res.json({ results: [] });
  }

  const data = db.get();
  const results: any[] = [];

  // 1. Articles
  (data.articles || [])
    .filter((a) => !a.isDeleted && a.status === 'published')
    .forEach((a) => {
      const matchTitle = a.title.toLowerCase().includes(query);
      const matchExcerpt = a.excerpt?.toLowerCase().includes(query);
      const matchCat = a.category?.toLowerCase().includes(query);
      if (matchTitle || matchExcerpt || matchCat) {
        results.push({
          id: a.id,
          type: 'article',
          typeName: 'مقال طبي',
          title: a.title,
          description: a.excerpt || '',
          url: `/page/article-${a.slug || a.id}`,
          actionType: 'article',
          rawItem: a,
        });
      }
    });

  // 2. Services
  (data.services || [])
    .filter((s) => !s.isDeleted && s.isActive)
    .forEach((s) => {
      if (s.title.toLowerCase().includes(query) || s.description.toLowerCase().includes(query)) {
        results.push({
          id: s.id,
          type: 'service',
          typeName: 'خدمة طبية',
          title: s.title,
          description: s.description,
          url: '#medical-services',
          actionType: 'scroll',
          targetSection: 'medical-services',
        });
      }
    });

  // 3. Conditions
  (data.conditions || [])
    .filter((c) => !c.isDeleted && c.isActive)
    .forEach((c) => {
      if (c.name.toLowerCase().includes(query) || c.description.toLowerCase().includes(query)) {
        results.push({
          id: c.id,
          type: 'condition',
          typeName: 'حالة مرضية',
          title: c.name,
          description: c.description,
          url: `/condition/${c.slug || c.id}`,
          actionType: 'condition',
          rawItem: c,
        });
      }
    });

  // 4. Endoscopy Procedures
  (data.endoscopy || [])
    .filter((e) => !e.isDeleted && e.isActive)
    .forEach((e) => {
      if (e.title.toLowerCase().includes(query) || e.description.toLowerCase().includes(query)) {
        results.push({
          id: e.id,
          type: 'endoscopy',
          typeName: 'منظار طبي',
          title: e.title,
          description: e.description,
          url: '#endoscopy',
          actionType: 'scroll',
          targetSection: 'endoscopy',
        });
      }
    });

  // 5. Videos
  (data.videos || [])
    .filter((v) => !v.isDeleted && v.isActive)
    .forEach((v) => {
      if (v.title.toLowerCase().includes(query) || v.description?.toLowerCase().includes(query)) {
        results.push({
          id: v.id,
          type: 'video',
          typeName: 'فيديو توعوي',
          title: v.title,
          description: v.description || '',
          url: '#videos',
          actionType: 'video',
          rawItem: v,
        });
      }
    });

  // 6. Conferences
  (data.conferences || [])
    .filter((c) => !c.isDeleted && c.isActive)
    .forEach((c) => {
      if (c.title.toLowerCase().includes(query) || c.shortDescription?.toLowerCase().includes(query)) {
        results.push({
          id: c.id,
          type: 'conference',
          typeName: 'مؤتمر ومشاركة',
          title: c.title,
          description: c.shortDescription || '',
          url: '/conferences',
          actionType: 'page',
          path: '/conferences',
        });
      }
    });

  // 7. Research
  (data.research || [])
    .filter((r) => !r.isDeleted && r.isActive)
    .forEach((r) => {
      if (r.title.toLowerCase().includes(query) || r.abstract?.toLowerCase().includes(query)) {
        results.push({
          id: r.id,
          type: 'research',
          typeName: 'بحث ودراسة',
          title: r.title,
          description: r.abstract || '',
          url: '/research',
          actionType: 'page',
          path: '/research',
        });
      }
    });

  // 8. Custom Pages
  (data.pages || [])
    .filter((p) => !p.isDeleted && p.isActive)
    .forEach((p) => {
      if (p.title.toLowerCase().includes(query) || p.content?.toLowerCase().includes(query)) {
        results.push({
          id: p.id,
          type: 'page',
          typeName: 'صفحة طبية',
          title: p.title,
          description: p.excerpt || p.title,
          url: `/page/${p.slug}`,
          actionType: 'page',
          path: `/page/${p.slug}`,
        });
      }
    });

  res.json({ query, results });
});

// Job Application Submission (Public)
apiRouter.post('/public/careers/apply', (req: Request, res: Response) => {
  const {
    jobId,
    jobTitle,
    fullName,
    phone,
    email,
    qualification,
    specialization,
    experienceYears,
    message,
    cvUrl,
    cvFileName,
  } = req.body;

  if (!fullName || !phone || !qualification) {
    return res.status(400).json({ error: 'الاسم، رقم الهاتف، والمؤهل حقول مطلوبة لتقديم الطلب.' });
  }

  const data = db.get();
  if (!data.jobApplications) data.jobApplications = [];

  const application: JobApplicationRecord = {
    id: generateId('app'),
    jobId: jobId ? String(jobId).trim() : undefined,
    jobTitle: jobTitle ? String(jobTitle).trim() : 'طلب توظيف عام',
    fullName: String(fullName).trim(),
    phone: String(phone).trim(),
    email: String(email || '').trim(),
    qualification: String(qualification).trim(),
    specialization: String(specialization || '').trim(),
    experienceYears: experienceYears || '0',
    message: message ? String(message).trim() : undefined,
    cvUrl: cvUrl ? String(cvUrl).trim() : '',
    cvFileName: cvFileName ? String(cvFileName).trim() : undefined,
    status: 'new',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  data.jobApplications.unshift(application);

  db.addNotification(
    'طلب توظيف جديد',
    `قدم ${application.fullName} على وظيفة: ${application.jobTitle}`,
    'system',
    '/admin'
  );

  db.save();

  res.status(201).json({
    success: true,
    message: 'تم استلام طلب التوظيف بنجاح. سيقوم فريق الموارد البشرية والتوظيف بالتواصل معك.',
    applicationId: application.id,
  });
});

/* ==========================================================================
   CLINIC VIDEOS MANAGEMENT (ADMIN)
   ========================================================================== */

apiRouter.get('/admin/videos', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const data = db.get();
  const list = (data.videos || []).filter((v) => !v.isDeleted).sort((a, b) => a.order - b.order);
  res.json(list);
});

apiRouter.post('/admin/videos', requireAuth, requireRole(['admin', 'content_manager']), (req: AuthenticatedRequest, res: Response) => {
  const { title, description, youtubeUrl, duration, order, isActive, customThumbnail } = req.body;
  if (!title || !youtubeUrl) {
    return res.status(400).json({ error: 'عنوان الفيديو ورابط اليوتيوب حقول مطلوبة' });
  }

  const youtubeId = extractYouTubeId(youtubeUrl);
  const data = db.get();
  if (!data.videos) data.videos = [];

  const newVideo: ClinicVideoItem = {
    id: generateId('vid'),
    title: String(title).trim(),
    description: description ? String(description).trim() : '',
    youtubeUrl: String(youtubeUrl).trim(),
    youtubeId: youtubeId || '',
    thumbnailUrl: customThumbnail || (youtubeId ? `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg` : '/images/hero-doctor.png'),
    duration: duration ? String(duration).trim() : undefined,
    order: Number(order) || data.videos.length + 1,
    isActive: isActive !== false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  data.videos.push(newVideo);
  db.logActivity(req.user!, 'إضافة فيديو', 'فيديوهات العيادة', `تمت إضافة فيديو: ${newVideo.title}`);
  db.save();

  res.status(201).json({ success: true, item: newVideo });
});

apiRouter.put('/admin/videos/:id', requireAuth, requireRole(['admin', 'content_manager']), (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const data = db.get();
  const video = (data.videos || []).find((v) => v.id === id);
  if (!video) return res.status(404).json({ error: 'الفيديو غير موجود' });

  if (req.body.youtubeUrl && req.body.youtubeUrl !== video.youtubeUrl) {
    const yId = extractYouTubeId(req.body.youtubeUrl);
    if (yId) {
      video.youtubeId = yId;
      if (!req.body.thumbnailUrl) {
        video.thumbnailUrl = `https://img.youtube.com/vi/${yId}/hqdefault.jpg`;
      }
    }
  }

  Object.assign(video, req.body, { updatedAt: new Date().toISOString() });
  db.logActivity(req.user!, 'تعديل فيديو', 'فيديوهات العيادة', `تم تعديل فيديو: ${video.title}`);
  db.save();

  res.json({ success: true, item: video });
});

apiRouter.delete('/admin/videos/:id', requireAuth, requireRole(['admin']), (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const success = db.softDelete('videos', id, req.user!);
  if (!success) return res.status(404).json({ error: 'الفيديو غير موجود' });
  res.json({ success: true, message: 'تم نقل الفيديو إلى سلة المحذوفات' });
});

apiRouter.post('/admin/videos/reorder', requireAuth, requireRole(['admin']), (req: AuthenticatedRequest, res: Response) => {
  const { orderedIds } = req.body;
  if (!Array.isArray(orderedIds)) return res.status(400).json({ error: 'قائمة المعرفات مطلوبة' });

  const data = db.get();
  orderedIds.forEach((id: string, index: number) => {
    const v = (data.videos || []).find((item) => item.id === id);
    if (v) v.order = index + 1;
  });
  db.save();
  res.json({ success: true });
});

/* ==========================================================================
   CAREERS & JOB APPLICATIONS (ADMIN)
   ========================================================================== */

apiRouter.get('/admin/careers', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const data = db.get();
  const list = (data.careers || []).filter((c) => !c.isDeleted).sort((a, b) => a.order - b.order);
  res.json(list);
});

apiRouter.post('/admin/careers', requireAuth, requireRole(['admin', 'content_manager']), (req: AuthenticatedRequest, res: Response) => {
  const {
    title,
    department,
    description,
    requirements,
    experience,
    location,
    employmentType,
    deadline,
    status,
    order,
    isActive,
  } = req.body;

  if (!title || !description) {
    return res.status(400).json({ error: 'عنوان الوظيفة والوصف حقول مطلوبة' });
  }

  const data = db.get();
  if (!data.careers) data.careers = [];

  const newCareer: CareerItem = {
    id: generateId('job'),
    title: String(title).trim(),
    department: department ? String(department).trim() : 'عام',
    description: String(description).trim(),
    requirements: Array.isArray(requirements)
      ? requirements.map((r: any) => String(r).trim()).filter(Boolean)
      : String(requirements || '')
          .split('\n')
          .map((r) => r.trim())
          .filter(Boolean),
    experience: experience ? String(experience).trim() : 'خبرة سنة واحدة على الأقل',
    location: location ? String(location).trim() : 'صنعاء - شارع تعز',
    employmentType: employmentType || 'full-time',
    deadline: deadline ? String(deadline).trim() : '',
    postedDate: new Date().toISOString().split('T')[0],
    status: status || 'open',
    order: Number(order) || data.careers.length + 1,
    isActive: isActive !== false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  data.careers.push(newCareer);
  db.logActivity(req.user!, 'إضافة فرصة وظيفية', 'التوظيف', `تمت إضافة وظيفة: ${newCareer.title}`);
  db.save();

  res.status(201).json({ success: true, item: newCareer });
});

apiRouter.put('/admin/careers/:id', requireAuth, requireRole(['admin', 'content_manager']), (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const data = db.get();
  const career = (data.careers || []).find((c) => c.id === id);
  if (!career) return res.status(404).json({ error: 'الوظيفة غير موجودة' });

  if (req.body.requirements && typeof req.body.requirements === 'string') {
    req.body.requirements = req.body.requirements
      .split('\n')
      .map((r: string) => r.trim())
      .filter(Boolean);
  }

  Object.assign(career, req.body, { updatedAt: new Date().toISOString() });
  db.logActivity(req.user!, 'تعديل فرصة وظيفية', 'التوظيف', `تم تعديل وظيفة: ${career.title}`);
  db.save();

  res.json({ success: true, item: career });
});

apiRouter.delete('/admin/careers/:id', requireAuth, requireRole(['admin']), (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const success = db.softDelete('careers', id, req.user!);
  if (!success) return res.status(404).json({ error: 'الوظيفة غير موجودة' });
  res.json({ success: true, message: 'تم نقل الوظيفة إلى سلة المحذوفات' });
});

apiRouter.post('/admin/careers/reorder', requireAuth, requireRole(['admin']), (req: AuthenticatedRequest, res: Response) => {
  const { orderedIds } = req.body;
  if (!Array.isArray(orderedIds)) return res.status(400).json({ error: 'قائمة المعرفات مطلوبة' });

  const data = db.get();
  orderedIds.forEach((id: string, index: number) => {
    const c = (data.careers || []).find((item) => item.id === id);
    if (c) c.order = index + 1;
  });
  db.save();
  res.json({ success: true });
});

// Job Applications
apiRouter.get('/admin/job-applications', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const data = db.get();
  const list = (data.jobApplications || []).filter((a) => !a.isDeleted);
  res.json(list);
});

apiRouter.put('/admin/job-applications/:id', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const data = db.get();
  const app = (data.jobApplications || []).find((a) => a.id === id);
  if (!app) return res.status(404).json({ error: 'طلب التوظيف غير موجود' });

  Object.assign(app, req.body, { updatedAt: new Date().toISOString() });
  db.logActivity(req.user!, 'تحديث طلب توظيف', 'طلبات التوظيف', `تم تحديث حالة طلب: ${app.fullName} إلى ${app.status}`);
  db.save();

  res.json({ success: true, item: app });
});

apiRouter.delete('/admin/job-applications/:id', requireAuth, requireRole(['admin']), (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const success = db.softDelete('jobApplications', id, req.user!);
  if (!success) return res.status(404).json({ error: 'الطلب غير موجود' });
  res.json({ success: true, message: 'تم نقل الطلب إلى سلة المحذوفات' });
});

/* ==========================================================================
   CONFERENCES & PARTICIPATION MANAGEMENT (ADMIN)
   ========================================================================== */

apiRouter.get('/admin/conferences', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const data = db.get();
  const list = (data.conferences || []).filter((c) => !c.isDeleted).sort((a, b) => a.order - b.order);
  res.json(list);
});

apiRouter.post('/admin/conferences', requireAuth, requireRole(['admin', 'content_manager']), (req: AuthenticatedRequest, res: Response) => {
  const { title, image, date, location, shortDescription, details, gallery, videoUrl, order, isActive } = req.body;
  if (!title) return res.status(400).json({ error: 'عنوان المؤتمر أو المشاركة مطلوب' });

  const data = db.get();
  if (!data.conferences) data.conferences = [];

  const newConf: ConferenceItem = {
    id: generateId('conf'),
    title: String(title).trim(),
    image: image || '/images/hero-doctor.png',
    date: date ? String(date).trim() : new Date().toLocaleDateString('ar-YE'),
    location: location ? String(location).trim() : 'صنعاء، اليمن',
    shortDescription: shortDescription ? String(shortDescription).trim() : '',
    details: details ? String(details).trim() : '',
    gallery: Array.isArray(gallery) ? gallery : [],
    videoUrl: videoUrl ? String(videoUrl).trim() : undefined,
    order: Number(order) || data.conferences.length + 1,
    isActive: isActive !== false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  data.conferences.push(newConf);
  db.logActivity(req.user!, 'إضافة مؤتمر ومشاركة', 'المؤتمرات', `تمت إضافة مؤتمر: ${newConf.title}`);
  db.save();

  res.status(201).json({ success: true, item: newConf });
});

apiRouter.put('/admin/conferences/:id', requireAuth, requireRole(['admin', 'content_manager']), (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const data = db.get();
  const conf = (data.conferences || []).find((c) => c.id === id);
  if (!conf) return res.status(404).json({ error: 'المؤتمر غير موجود' });

  Object.assign(conf, req.body, { updatedAt: new Date().toISOString() });
  db.logActivity(req.user!, 'تعديل مؤتمر ومشاركة', 'المؤتمرات', `تم تعديل مؤتمر: ${conf.title}`);
  db.save();

  res.json({ success: true, item: conf });
});

apiRouter.delete('/admin/conferences/:id', requireAuth, requireRole(['admin']), (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const success = db.softDelete('conferences', id, req.user!);
  if (!success) return res.status(404).json({ error: 'المؤتمر غير موجود' });
  res.json({ success: true, message: 'تم نقل المؤتمر إلى سلة المحذوفات' });
});

apiRouter.post('/admin/conferences/reorder', requireAuth, requireRole(['admin']), (req: AuthenticatedRequest, res: Response) => {
  const { orderedIds } = req.body;
  if (!Array.isArray(orderedIds)) return res.status(400).json({ error: 'قائمة المعرفات مطلوبة' });

  const data = db.get();
  orderedIds.forEach((id: string, index: number) => {
    const c = (data.conferences || []).find((item) => item.id === id);
    if (c) c.order = index + 1;
  });
  db.save();
  res.json({ success: true });
});

/* ==========================================================================
   RESEARCH & STUDIES MANAGEMENT (ADMIN)
   ========================================================================== */

apiRouter.get('/admin/research', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const data = db.get();
  const list = (data.research || []).filter((r) => !r.isDeleted).sort((a, b) => a.order - b.order);
  res.json(list);
});

apiRouter.post('/admin/research', requireAuth, requireRole(['admin', 'content_manager']), (req: AuthenticatedRequest, res: Response) => {
  const {
    title,
    authors,
    year,
    institution,
    journal,
    abstract,
    image,
    pdfUrl,
    externalUrl,
    doi,
    order,
    isActive,
  } = req.body;

  if (!title || !abstract) {
    return res.status(400).json({ error: 'عنوان البحث وملخص الدراسة حقول مطلوبة' });
  }

  const data = db.get();
  if (!data.research) data.research = [];

  const newRes: ResearchItem = {
    id: generateId('res'),
    title: String(title).trim(),
    authors: authors ? String(authors).trim() : 'د. عبدالباسط عبده الحاج مقبل',
    year: year ? String(year).trim() : String(new Date().getFullYear()),
    institution: institution ? String(institution).trim() : 'جامعة القاهرة / قصر العيني',
    journal: journal ? String(journal).trim() : undefined,
    abstract: String(abstract).trim(),
    image: image || undefined,
    pdfUrl: pdfUrl ? String(pdfUrl).trim() : undefined,
    externalUrl: externalUrl ? String(externalUrl).trim() : undefined,
    doi: doi ? String(doi).trim() : undefined,
    order: Number(order) || data.research.length + 1,
    isActive: isActive !== false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  data.research.push(newRes);
  db.logActivity(req.user!, 'إضافة بحث علمي', 'الدراسات والأبحاث', `تمت إضافة بحث: ${newRes.title}`);
  db.save();

  res.status(201).json({ success: true, item: newRes });
});

apiRouter.put('/admin/research/:id', requireAuth, requireRole(['admin', 'content_manager']), (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const data = db.get();
  const rItem = (data.research || []).find((r) => r.id === id);
  if (!rItem) return res.status(404).json({ error: 'البحث غير موجود' });

  Object.assign(rItem, req.body, { updatedAt: new Date().toISOString() });
  db.logActivity(req.user!, 'تعديل بحث علمي', 'الدراسات والأبحاث', `تم تعديل بحث: ${rItem.title}`);
  db.save();

  res.json({ success: true, item: rItem });
});

apiRouter.delete('/admin/research/:id', requireAuth, requireRole(['admin']), (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const success = db.softDelete('research', id, req.user!);
  if (!success) return res.status(404).json({ error: 'البحث غير موجود' });
  res.json({ success: true, message: 'تم نقل البحث إلى سلة المحذوفات' });
});

apiRouter.post('/admin/research/reorder', requireAuth, requireRole(['admin']), (req: AuthenticatedRequest, res: Response) => {
  const { orderedIds } = req.body;
  if (!Array.isArray(orderedIds)) return res.status(400).json({ error: 'قائمة المعرفات مطلوبة' });

  const data = db.get();
  orderedIds.forEach((id: string, index: number) => {
    const r = (data.research || []).find((item) => item.id === id);
    if (r) r.order = index + 1;
  });
  db.save();
  res.json({ success: true });
});

/* ==========================================================================
   SLIDERS MANAGEMENT (ADMIN)
   ========================================================================== */

apiRouter.get('/admin/sliders', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const data = db.get();
  const list = (data.sliders || []).filter((s) => !s.isDeleted).sort((a, b) => a.order - b.order);
  res.json(list);
});

apiRouter.post('/admin/sliders', requireAuth, requireRole(['admin', 'content_manager']), (req: AuthenticatedRequest, res: Response) => {
  const { title, subtitle, description, imageUrl, buttonText, buttonLink, order, isActive } = req.body;
  if (!title || !imageUrl) {
    return res.status(400).json({ error: 'عنوان الشريحة ورابط الصورة مطلوبان' });
  }

  const data = db.get();
  if (!data.sliders) data.sliders = [];

  const newSlide: SliderItem = {
    id: generateId('sld'),
    title: String(title).trim(),
    subtitle: String(subtitle || '').trim(),
    description: description ? String(description).trim() : undefined,
    imageUrl: String(imageUrl).trim(),
    buttonText: buttonText ? String(buttonText).trim() : 'احجز موعدك',
    buttonLink: buttonLink ? String(buttonLink).trim() : '#booking',
    order: Number(order) || data.sliders.length + 1,
    isActive: isActive !== false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  data.sliders.push(newSlide);
  db.logActivity(req.user!, 'إضافة شريحة سلايدر', 'السلايدر', `تمت إضافة شريحة: ${newSlide.title}`);
  db.save();

  res.status(201).json({ success: true, item: newSlide });
});

apiRouter.put('/admin/sliders/:id', requireAuth, requireRole(['admin', 'content_manager']), (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const data = db.get();
  const slide = (data.sliders || []).find((s) => s.id === id);
  if (!slide) return res.status(404).json({ error: 'شريحة السلايدر غير موجودة' });

  Object.assign(slide, req.body, { updatedAt: new Date().toISOString() });
  db.logActivity(req.user!, 'تعديل شريحة سلايدر', 'السلايدر', `تم تعديل شريحة: ${slide.title}`);
  db.save();

  res.json({ success: true, item: slide });
});

apiRouter.delete('/admin/sliders/:id', requireAuth, requireRole(['admin']), (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const success = db.softDelete('sliders', id, req.user!);
  if (!success) return res.status(404).json({ error: 'الشريحة غير موجودة' });
  res.json({ success: true, message: 'تم نقل الشريحة إلى سلة المحذوفات' });
});

apiRouter.post('/admin/sliders/reorder', requireAuth, requireRole(['admin']), (req: AuthenticatedRequest, res: Response) => {
  const { orderedIds } = req.body;
  if (!Array.isArray(orderedIds)) return res.status(400).json({ error: 'قائمة المعرفات مطلوبة' });

  const data = db.get();
  orderedIds.forEach((id: string, index: number) => {
    const s = (data.sliders || []).find((item) => item.id === id);
    if (s) s.order = index + 1;
  });
  db.save();
  res.json({ success: true });
});
