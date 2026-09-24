import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { AdminTab } from '../../types/admin';
import {
  LayoutDashboard,
  CalendarClock,
  UserCheck,
  Activity,
  HeartPulse,
  Eye,
  BookOpen,
  FileText,
  HelpCircle,
  Mail,
  Clock,
  PhoneCall,
  Image as ImageIcon,
  Search,
  BarChart3,
  Users,
  Settings,
  ShieldAlert,
  Trash2,
  Database,
  X,
  Stethoscope,
  ExternalLink,
  LogOut,
  Home,
  FolderTree,
  Video,
  Briefcase,
  Award,
  GraduationCap,
  Layers,
  ShieldCheck,
} from 'lucide-react';

interface AdminSidebarProps {
  activeTab: AdminTab;
  onSelectTab: (tab: AdminTab) => void;
  isOpen: boolean;
  onClose: () => void;
  counts?: {
    newBookings: number;
    newMessages: number;
  };
  onOpenLivePreview?: () => void;
}

interface NavItem {
  id: AdminTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  roles: ('super_admin' | 'admin' | 'receptionist' | 'content_manager')[];
  badge?: number;
  badgeColor?: string;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  activeTab,
  onSelectTab,
  isOpen,
  onClose,
  counts,
  onOpenLivePreview,
}) => {
  const { user, logout, hasRole } = useAuth();

  const navItems: NavItem[] = [
    {
      id: 'dashboard',
      label: 'لوحة المتابعة العامة',
      icon: LayoutDashboard,
      roles: ['super_admin', 'admin', 'receptionist', 'content_manager'],
    },
    {
      id: 'homepage',
      label: 'إدارة الصفحة الرئيسية',
      icon: Home,
      roles: ['super_admin', 'admin', 'content_manager'],
    },
    {
      id: 'sliders',
      label: 'سلايدر وبنرات الواجهة',
      icon: Layers,
      roles: ['super_admin', 'admin', 'content_manager'],
    },
    {
      id: 'interface-images',
      label: 'إدارة صور واجهة الموقع',
      icon: ImageIcon,
      roles: ['super_admin', 'admin', 'content_manager'],
    },
    {
      id: 'bookings',
      label: 'الحجوزات والمواعيد',
      icon: CalendarClock,
      roles: ['super_admin', 'admin', 'receptionist'],
      badge: counts?.newBookings,
      badgeColor: 'bg-[#55A630]',
    },
    {
      id: 'categories',
      label: 'التصنيفات الطبية',
      icon: FolderTree,
      roles: ['super_admin', 'admin', 'content_manager'],
    },
    {
      id: 'messages',
      label: 'رسائل الزوار',
      icon: Mail,
      roles: ['super_admin', 'admin', 'receptionist'],
      badge: counts?.newMessages,
      badgeColor: 'bg-amber-500',
    },
    {
      id: 'doctor',
      label: 'بيانات الطبيب والمؤهلات',
      icon: UserCheck,
      roles: ['super_admin', 'admin', 'content_manager'],
    },
    {
      id: 'services',
      label: 'الخدمات الطبية',
      icon: Activity,
      roles: ['super_admin', 'admin', 'content_manager'],
    },
    {
      id: 'conditions',
      label: 'الحالات التي نعالجها',
      icon: HeartPulse,
      roles: ['super_admin', 'admin', 'content_manager'],
    },
    {
      id: 'endoscopy',
      label: 'مناظير الجهاز الهضمي',
      icon: Eye,
      roles: ['super_admin', 'admin', 'content_manager'],
    },
    {
      id: 'videos',
      label: 'مكتبة الفيديو والتوعية',
      icon: Video,
      roles: ['super_admin', 'admin', 'content_manager'],
    },
    {
      id: 'articles',
      label: 'المقالات الطبية (CMS)',
      icon: BookOpen,
      roles: ['super_admin', 'admin', 'content_manager'],
    },
    {
      id: 'pages',
      label: 'الصفحات الثابتة والمخصصة',
      icon: FileText,
      roles: ['super_admin', 'admin', 'content_manager'],
    },
    {
      id: 'conferences',
      label: 'المؤتمرات والمشاركات',
      icon: Award,
      roles: ['super_admin', 'admin', 'content_manager'],
    },
    {
      id: 'research',
      label: 'الأبحاث والدراسات العلمية',
      icon: GraduationCap,
      roles: ['super_admin', 'admin', 'content_manager'],
    },
    {
      id: 'careers',
      label: 'التوظيف وطلبات العمل',
      icon: Briefcase,
      roles: ['super_admin', 'admin'],
    },
    {
      id: 'faq',
      label: 'الأسئلة الشائعة',
      icon: HelpCircle,
      roles: ['super_admin', 'admin', 'content_manager'],
    },
    {
      id: 'schedule',
      label: 'أوقات الدوام والإجازات',
      icon: Clock,
      roles: ['super_admin', 'admin', 'receptionist'],
    },
    {
      id: 'contact',
      label: 'بيانات التواصل والخريطة',
      icon: PhoneCall,
      roles: ['super_admin', 'admin'],
    },
    {
      id: 'media',
      label: 'مكتبة الصور والوسائط',
      icon: ImageIcon,
      roles: ['super_admin', 'admin', 'content_manager'],
    },
    {
      id: 'system-check',
      label: 'فحص النظام والوسائط الدائمة',
      icon: ShieldCheck,
      roles: ['super_admin', 'admin'],
    },
    {
      id: 'seo',
      label: 'تهيئة محركات البحث (SEO)',
      icon: Search,
      roles: ['super_admin', 'admin', 'content_manager'],
    },
    {
      id: 'analytics',
      label: 'الإحصائيات والزيارات',
      icon: BarChart3,
      roles: ['super_admin', 'admin'],
    },
    {
      id: 'users',
      label: 'المستخدمون والصلاحيات',
      icon: Users,
      roles: ['super_admin'],
    },
    {
      id: 'settings',
      label: 'إعدادات الموقع العام',
      icon: Settings,
      roles: ['super_admin', 'admin'],
    },
    {
      id: 'recycle-bin',
      label: 'سلة المحذوفات',
      icon: Trash2,
      roles: ['super_admin', 'admin'],
    },
    {
      id: 'activity',
      label: 'سجل النشاط والأمان',
      icon: ShieldAlert,
      roles: ['super_admin', 'admin'],
    },
    {
      id: 'backup',
      label: 'النسخ الاحتياطي والاستعادة',
      icon: Database,
      roles: ['super_admin', 'admin'],
    },
  ];

  const visibleItems = navItems.filter((item) => hasRole(item.roles));

  const getRoleLabel = (role?: string) => {
    switch (role) {
      case 'super_admin':
        return 'المدير العام (Super Admin)';
      case 'admin':
        return 'إدارة العيادة (Admin)';
      case 'receptionist':
        return 'الاستقبال والمواعيد';
      case 'content_manager':
        return 'مسؤول المحتوى الطبي';
      default:
        return 'مستخدم مسجل';
    }
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 right-0 bottom-0 w-72 bg-white border-l border-[#E2EAF0] z-50 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Sidebar Header */}
        <div className="p-4 border-b border-[#E2EAF0] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#064B82] to-[#0B70B7] text-white flex items-center justify-center shadow-md shadow-blue-900/10">
              <Stethoscope className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#064B82] leading-tight line-clamp-1">
                د. عبدالباسط مقبل
              </h2>
              <p className="text-[11px] text-[#667788] font-medium">لوحة التحكم الطبية</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Card */}
        <div className="p-3 mx-3 mt-3 rounded-xl bg-[#F4F8FB] border border-[#E2EAF0]/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#0B70B7] text-white font-bold text-xs flex items-center justify-center flex-shrink-0">
              {user?.name?.charAt(0) || 'أ'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-[#17354F] truncate">{user?.name}</p>
              <p className="text-[10px] text-[#55A630] font-medium truncate">{getRoleLabel(user?.role)}</p>
            </div>
          </div>
        </div>

        {/* Navigation List */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-1 custom-scrollbar">
          {visibleItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectTab(item.id);
                  onClose();
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 text-right cursor-pointer ${
                  isActive
                    ? 'bg-[#064B82] text-white shadow-md shadow-blue-950/15'
                    : 'text-[#17354F] hover:bg-[#F4F8FB] hover:text-[#0B70B7]'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-white' : 'text-[#667788]'}`} />
                  <span className="truncate">{item.label}</span>
                </div>
                {item.badge && item.badge > 0 ? (
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full text-white ${
                      item.badgeColor || 'bg-[#55A630]'
                    }`}
                  >
                    {item.badge}
                  </span>
                ) : null}
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-[#E2EAF0] space-y-1.5 bg-[#F8FAFC]">
          {onOpenLivePreview ? (
            <button
              onClick={() => {
                onOpenLivePreview();
                onClose();
              }}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-[#064B82] to-[#0B70B7] hover:from-[#053d6a] hover:to-[#095b94] transition-colors cursor-pointer shadow-xs"
            >
              <span className="flex items-center gap-2">
                <Eye className="w-3.5 h-3.5" />
                معاينة الموقع المباشرة
              </span>
              <span className="text-[10px] bg-white/20 text-white px-1.5 py-0.5 rounded font-bold">
                حي
              </span>
            </button>
          ) : (
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-[#0B70B7] hover:bg-blue-50 transition-colors"
            >
              <span className="flex items-center gap-2">
                <ExternalLink className="w-3.5 h-3.5" />
                عرض الموقع المباشر
              </span>
              <span className="text-[10px] bg-blue-100/70 text-[#064B82] px-1.5 py-0.5 rounded">
                حي
              </span>
            </a>
          )}

          <button
            onClick={logout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            تسجيل الخروج
          </button>
        </div>
      </aside>
    </>
  );
};
