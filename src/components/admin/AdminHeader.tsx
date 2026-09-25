import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { AdminTab } from '../../types/admin';
import { api } from '../../services/api';
import {
  Menu,
  Bell,
  ExternalLink,
  CheckCircle2,
  Calendar,
  Mail,
  FileText,
  AlertTriangle,
  User,
  LogOut,
  ChevronDown,
  Eye,
} from 'lucide-react';
import { AutoSaveBadge } from './AutoSaveBadge';

interface AdminHeaderProps {
  activeTab: AdminTab;
  onOpenSidebar: () => void;
  onNavigateTab: (tab: AdminTab) => void;
  onOpenLivePreview?: () => void;
}

const tabTitles: Record<AdminTab, string> = {
  dashboard: 'لوحة المتابعة العامة والإحصائيات',
  bookings: 'إدارة الحجوزات ومواعيد المرضى',
  homepage: 'إدارة أقسام وتخطيط الصفحة الرئيسية',
  sliders: 'إدارة شرائح السلايدر والبنرات المتحركة',
  'interface-images': 'إدارة صور واجهة الموقع والبنرات',
  doctor: 'بيانات الطبيب والمؤهلات والخبرات',
  services: 'إدارة الخدمات الطبية المتخصصة',
  conditions: 'الحالات والأمراض التي تعالجها العيادة',
  endoscopy: 'مناظير الجهاز الهضمي والتحضير',
  videos: 'مكتبة الفيديو والتوعية الطبية',
  articles: 'المكتبة والمقالات الطبية (CMS)',
  conferences: 'المؤتمرات والمشاركات العلمية والدولية',
  research: 'الأبحاث والأوراق العلمية المنشورة',
  careers: 'إدارة الوظائف ومتابعة طلبات التوظيف',
  categories: 'إدارة التصنيفات الطبية',
  faq: 'الأسئلة الطبية الشائعة وإجاباتها',
  messages: 'رسائل واستفسارات الزوار الواردة',
  schedule: 'أوقات الدوام وفترات العمل وإعلانات الإجازة',
  contact: 'بيانات التواصل والعناوين وروابط الخريطة',
  media: 'مكتبة الصور والوسائط الطبية',
  'system-check': 'فحص النظام والتخزين الدائم والوسائط',
  seo: 'إعدادات محركات البحث وكلمات المفتاحية',
  analytics: 'إحصائيات الزيارات وتحليلات التفاعل',
  users: 'إدارة المستخدمين وصلاحيات الأدوار (RBAC)',
  settings: 'إعدادات الموقع العام والمظهر',
  activity: 'سجل نشاط العمليات والأمان',
  'recycle-bin': 'سلة المحذوفات واسترجاع العناصر',
  pages: 'إدارة الصفحات الثابتة والمحتوى',
  backup: 'النسخ الاحتياطي واستعادة البيانات',
};

export const AdminHeader: React.FC<AdminHeaderProps> = ({
  activeTab,
  onOpenSidebar,
  onNavigateTab,
  onOpenLivePreview,
}) => {
  const { user, logout } = useAuth();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = async () => {
    try {
      const list = await api.getNotifications();
      setNotifications(Array.isArray(list) ? list : []);
    } catch {
      setNotifications([]);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000); // Poll every 15s
    return () => clearInterval(interval);
  }, []);

  // Close menus on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setIsNotifOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const safeNotifications = Array.isArray(notifications) ? notifications : [];
  const unreadCount = safeNotifications.filter((n) => !n.isRead).length;

  const handleMarkAllRead = async () => {
    try {
      await api.markAllNotificationsRead();
      setNotifications((prev) => (Array.isArray(prev) ? prev : []).map((n) => ({ ...n, isRead: true })));
    } catch (e) {
      console.error(e);
    }
  };

  const handleNotificationClick = async (notif: any) => {
    if (!notif.isRead) {
      await api.markNotificationRead(notif.id).catch(() => {});
      setNotifications((prev) =>
        (Array.isArray(prev) ? prev : []).map((n) => (n.id === notif.id ? { ...n, isRead: true } : n))
      );
    }
    setIsNotifOpen(false);
    if (notif.type === 'booking') onNavigateTab('bookings');
    else if (notif.type === 'message') onNavigateTab('messages');
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-[#E2EAF0] px-4 lg:px-8 py-3.5 flex items-center justify-between">
      {/* Right: Hamburger & Section Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenSidebar}
          className="p-2 text-gray-600 hover:text-[#064B82] hover:bg-gray-100 rounded-xl lg:hidden"
          title="القائمة"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-base sm:text-lg font-bold text-[#064B82] tracking-tight">
            {tabTitles[activeTab] || 'لوحة التحكم'}
          </h1>
          <p className="text-xs text-[#667788] hidden sm:block">
            عيادة د. عبدالباسط عبده الحاج مقبل – صنعاء
          </p>
        </div>
      </div>

      {/* Left: Actions (AutoSave indicator, Live site, Notifications, User) */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Global AutoSave Real-time Status Badge */}
        <AutoSaveBadge />

        {/* Live Site Preview Modal Trigger Button */}
        {onOpenLivePreview ? (
          <button
            onClick={onOpenLivePreview}
            className="inline-flex items-center gap-1.5 py-1.5 px-3 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-[#064B82] to-[#0B70B7] hover:from-[#053d6a] hover:to-[#095b94] shadow-xs transition-all cursor-pointer"
            title="معاينة حية للموقع المباشر مع دعم الشاشات المختلفة"
          >
            <Eye className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">معاينة الموقع المباشرة</span>
            <span className="sm:hidden">معاينة</span>
          </button>
        ) : (
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-semibold text-[#0B70B7] bg-blue-50/70 hover:bg-blue-100 border border-blue-100 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">معاينة الموقع</span>
            <span className="sm:hidden">معاينة</span>
          </a>
        )}

        {/* Notifications Popover */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className="relative p-2 text-gray-600 hover:text-[#064B82] hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
            title="الإشعارات"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-[#55A630] text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {isNotifOpen && (
            <div className="absolute left-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-[#E2EAF0] p-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#E2EAF0]">
                <div className="flex items-center gap-2">
                  <h3 className="text-xs font-bold text-[#17354F]">الإشعارات والتنبيهات</h3>
                  {unreadCount > 0 && (
                    <span className="text-[10px] bg-green-100 text-green-800 font-bold px-2 py-0.5 rounded-full">
                      {unreadCount} جديد
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="text-[11px] font-semibold text-[#0B70B7] hover:underline cursor-pointer"
                  >
                    تحديد الكل كمقروء
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto space-y-1.5 custom-scrollbar">
                {safeNotifications.length === 0 ? (
                  <p className="text-xs text-[#667788] text-center py-6">لا توجد إشعارات حالياً</p>
                ) : (
                  safeNotifications.map((notif) => (
                    <div
                      key={notif.id}
                      onClick={() => handleNotificationClick(notif)}
                      className={`p-2.5 rounded-xl cursor-pointer transition-colors text-right flex items-start gap-2.5 ${
                        notif.isRead ? 'bg-transparent hover:bg-gray-50' : 'bg-blue-50/60 hover:bg-blue-50'
                      }`}
                    >
                      <div className="mt-0.5 p-1.5 rounded-lg bg-white shadow-xs text-[#064B82]">
                        {notif.type === 'booking' && <Calendar className="w-3.5 h-3.5 text-[#55A630]" />}
                        {notif.type === 'message' && <Mail className="w-3.5 h-3.5 text-blue-600" />}
                        {notif.type === 'system' && <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-[#17354F] leading-tight truncate">
                          {notif.title}
                        </p>
                        <p className="text-[11px] text-[#667788] mt-0.5 line-clamp-2 leading-relaxed">
                          {notif.message}
                        </p>
                        <span className="text-[9px] text-gray-400 mt-1 block">
                          {new Date(notif.createdAt).toLocaleTimeString('ar-YE', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                      {!notif.isRead && <div className="w-2 h-2 rounded-full bg-[#55A630] mt-1.5 flex-shrink-0" />}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Dropdown */}
        <div className="relative" ref={userMenuRef}>
          <button
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer border border-transparent hover:border-gray-200"
          >
            <div className="w-8 h-8 rounded-full bg-[#064B82] text-white text-xs font-bold flex items-center justify-center">
              {user?.name?.charAt(0) || 'أ'}
            </div>
            <div className="hidden md:block text-right">
              <p className="text-xs font-bold text-[#17354F] leading-tight">{user?.name}</p>
              <p className="text-[10px] text-[#667788]">{user?.role}</p>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-gray-400 hidden sm:block" />
          </button>

          {isUserMenuOpen && (
            <div className="absolute left-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-[#E2EAF0] p-2 z-50 animate-in fade-in duration-150">
              <div className="px-3 py-2 border-b border-[#E2EAF0] mb-1">
                <p className="text-xs font-bold text-[#17354F]">{user?.name}</p>
                <p className="text-[10px] text-[#667788] truncate">{user?.email}</p>
              </div>

              <button
                onClick={() => {
                  setIsUserMenuOpen(false);
                  onNavigateTab('settings');
                }}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-[#17354F] hover:bg-[#F4F8FB] transition-colors"
              >
                <User className="w-3.5 h-3.5 text-gray-500" />
                الملف والإعدادات
              </button>

              <button
                onClick={logout}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5 text-rose-500" />
                تسجيل الخروج
              </button>
            </div>
          )}
        </div>

      </div>
    </header>
  );
};
