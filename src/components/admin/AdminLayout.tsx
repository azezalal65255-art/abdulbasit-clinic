import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { AdminTab } from '../../types/admin';
import { AdminSidebar } from './AdminSidebar';
import { AdminHeader } from './AdminHeader';
import { AdminToast } from './AdminToast';

// Views
import { DashboardOverview } from './DashboardOverview';
import { BookingsView } from './BookingsView';
import { DoctorProfileView } from './DoctorProfileView';
import { ServicesView } from './ServicesView';
import { ConditionsView } from './ConditionsView';
import { EndoscopyView } from './EndoscopyView';
import { ArticlesView } from './ArticlesView';
import { PagesManagerView } from './PagesManagerView';
import { FaqView } from './FaqView';
import { MessagesView } from './MessagesView';
import { ScheduleView } from './ScheduleView';
import { ContactSettingsView } from './ContactSettingsView';
import { MediaLibraryView } from './MediaLibraryView';
import { SeoSettingsView } from './SeoSettingsView';
import { AnalyticsView } from './AnalyticsView';
import { UsersView } from './UsersView';
import { SiteSettingsView } from './SiteSettingsView';
import { ActivityLogView } from './ActivityLogView';
import { RecycleBinView } from './RecycleBinView';
import { BackupView } from './BackupView';
import { HomePageManagerView } from './HomePageManagerView';
import { CategoriesView } from './CategoriesView';
import { VideosView } from './VideosView';
import { CareersView } from './CareersView';
import { ConferencesView } from './ConferencesView';
import { ResearchView } from './ResearchView';
import { SlidersView } from './SlidersView';
import { SystemCheckView } from './SystemCheckView';
import { AutoSaveProvider } from '../../context/AutoSaveContext';
import { LivePreviewModal } from './LivePreviewModal';

interface ToastState {
  id: string;
  type: 'success' | 'error' | 'info';
  text: string;
}

export const AdminLayout: React.FC = () => {
  const { user } = useAuth();
  const [currentTab, setCurrentTab] = useState<AdminTab>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLivePreviewOpen, setIsLivePreviewOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastState[]>([]);

  React.useEffect(() => {
    const handlePath = () => {
      const p = window.location.pathname;
      if (p === '/admin/system-diagnostics') {
        setCurrentTab('system-check');
      } else if (p.startsWith('/admin/')) {
        const tab = p.replace('/admin/', '') as AdminTab;
        setCurrentTab(tab);
      } else {
        setCurrentTab('dashboard');
      }
    };
    handlePath();
    window.addEventListener('popstate', handlePath);
    return () => window.removeEventListener('popstate', handlePath);
  }, []);

  const handleSetTab = (tab: AdminTab) => {
    setCurrentTab(tab);
    const targetPath = tab === 'system-check' ? '/admin/system-diagnostics' : `/admin/${tab}`;
    if (window.location.pathname !== targetPath) {
      window.history.pushState({}, '', targetPath);
    }
  };

  const showToast = (type: 'success' | 'error' | 'info', text: string) => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, type, text }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const renderActiveView = () => {
    switch (currentTab) {
      case 'dashboard':
        return (
          <DashboardOverview
            onNavigateTab={handleSetTab}
            onOpenNewBookingModal={() => handleSetTab('bookings')}
            showToast={showToast}
          />
        );
      case 'bookings':
        return <BookingsView showToast={showToast} />;
      case 'homepage':
        return <HomePageManagerView showToast={showToast} />;
      case 'sliders':
        return <SlidersView showToast={showToast} />;
      case 'doctor':
        return <DoctorProfileView showToast={showToast} />;
      case 'services':
        return <ServicesView showToast={showToast} />;
      case 'conditions':
        return <ConditionsView showToast={showToast} />;
      case 'endoscopy':
        return <EndoscopyView showToast={showToast} />;
      case 'videos':
        return <VideosView showToast={showToast} />;
      case 'articles':
        return <ArticlesView showToast={showToast} />;
      case 'pages':
        return <PagesManagerView showToast={showToast} />;
      case 'conferences':
        return <ConferencesView showToast={showToast} />;
      case 'research':
        return <ResearchView showToast={showToast} />;
      case 'careers':
        return <CareersView showToast={showToast} />;
      case 'categories':
        return <CategoriesView showToast={showToast} />;
      case 'faq':
        return <FaqView showToast={showToast} />;
      case 'messages':
        return <MessagesView showToast={showToast} />;
      case 'schedule':
        return <ScheduleView showToast={showToast} />;
      case 'contact':
        return <ContactSettingsView showToast={showToast} />;
      case 'media':
        return <MediaLibraryView showToast={showToast} />;
      case 'system-check':
        return <SystemCheckView showToast={showToast} />;
      case 'seo':
        return <SeoSettingsView showToast={showToast} />;
      case 'analytics':
        return <AnalyticsView showToast={showToast} />;
      case 'users':
        return <UsersView showToast={showToast} />;
      case 'settings':
        return <SiteSettingsView showToast={showToast} />;
      case 'activity':
        return <ActivityLogView showToast={showToast} />;
      case 'recycle-bin':
        return <RecycleBinView showToast={showToast} />;
      case 'backup':
        return <BackupView showToast={showToast} />;
      default:
        return (
          <DashboardOverview
            onNavigateTab={handleSetTab}
            onOpenNewBookingModal={() => handleSetTab('bookings')}
            showToast={showToast}
          />
        );
    }
  };

  return (
    <AutoSaveProvider>
      <div className="min-h-screen bg-[#F8FAFC] text-[#17354F] font-sans flex flex-col md:flex-row" dir="rtl">
        {/* Toast Notification Container */}
        <AdminToast toasts={toasts} removeToast={removeToast} />

        {/* Sidebar */}
        <AdminSidebar
          activeTab={currentTab}
          onSelectTab={handleSetTab}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          onOpenLivePreview={() => setIsLivePreviewOpen(true)}
        />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 md:mr-64 transition-all">
          {/* Header */}
          <AdminHeader
            activeTab={currentTab}
            onOpenSidebar={() => setIsSidebarOpen(true)}
            onNavigateTab={handleSetTab}
            onOpenLivePreview={() => setIsLivePreviewOpen(true)}
          />

          {/* Page Content Body */}
          <main className="p-4 sm:p-6 lg:p-8 flex-1 max-w-7xl w-full mx-auto">
            {renderActiveView()}
          </main>
        </div>

        {/* Live Site Preview Modal */}
        <LivePreviewModal
          isOpen={isLivePreviewOpen}
          onClose={() => setIsLivePreviewOpen(false)}
        />
      </div>
    </AutoSaveProvider>
  );
};
