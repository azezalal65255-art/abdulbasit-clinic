import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import {
  Briefcase,
  Plus,
  Edit,
  Trash2,
  X,
  RefreshCw,
  Clock,
  MapPin,
  Calendar,
  Users,
  FileText,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ChevronDown,
  Mail,
  Phone,
} from 'lucide-react';

interface CareersViewProps {
  showToast: (type: 'success' | 'error' | 'info', text: string) => void;
}

export const CareersView: React.FC<CareersViewProps> = ({ showToast }) => {
  const [activeSubTab, setActiveSubTab] = useState<'openings' | 'applications'>('openings');
  const [careers, setCareers] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal for Job Opening
  const [isJobModalOpen, setIsJobModalOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<any | null>(null);
  const [jobFormData, setJobFormData] = useState({
    title: '',
    department: 'قسم التمريض والمناظير',
    location: 'صنعاء، اليمن',
    type: 'دوام كامل',
    description: '',
    requirementsText: '',
    responsibilitiesText: '',
    deadline: '',
    isActive: true,
  });

  // Modal for Application Details
  const [selectedApp, setSelectedApp] = useState<any | null>(null);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [careersData, appsData] = await Promise.all([
        api.getCareers(),
        api.getJobApplications(),
      ]);
      setCareers(careersData || []);
      setApplications(appsData || []);
    } catch (err: any) {
      showToast('error', err.message || 'فشل تحميل بيانات التوظيف');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openNewJobModal = () => {
    setSelectedJob(null);
    setJobFormData({
      title: '',
      department: 'قسم التمريض والمناظير',
      location: 'صنعاء، اليمن',
      type: 'دوام كامل',
      description: '',
      requirementsText: '',
      responsibilitiesText: '',
      deadline: '',
      isActive: true,
    });
    setIsJobModalOpen(true);
  };

  const openEditJobModal = (job: any) => {
    setSelectedJob(job);
    setJobFormData({
      title: job.title || '',
      department: job.department || 'قسم التمريض والمناظير',
      location: job.location || 'صنعاء، اليمن',
      type: job.type || 'دوام كامل',
      description: job.description || '',
      requirementsText: Array.isArray(job.requirements) ? job.requirements.join('\n') : '',
      responsibilitiesText: Array.isArray(job.responsibilities) ? job.responsibilities.join('\n') : '',
      deadline: job.deadline || '',
      isActive: job.isActive !== false,
    });
    setIsJobModalOpen(true);
  };

  const handleSaveJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobFormData.title.trim()) {
      showToast('error', 'المسمى الوظيفي مطلوب');
      return;
    }

    const payload = {
      ...jobFormData,
      requirements: jobFormData.requirementsText
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean),
      responsibilities: jobFormData.responsibilitiesText
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean),
    };

    try {
      if (selectedJob) {
        await api.updateCareer(selectedJob.id, payload);
        showToast('success', 'تم تعديل إعلان الوظيفة بنجاح');
      } else {
        await api.createCareer(payload);
        showToast('success', 'تم نشر إعلان الوظيفة بنجاح');
      }
      setIsJobModalOpen(false);
      fetchData();
    } catch (err: any) {
      showToast('error', err.message || 'فشل حفظ إعلان الوظيفة');
    }
  };

  const handleDeleteJob = async (id: string, title: string) => {
    if (!window.confirm(`هل أنت متأكد من حذف إعلان الوظيفة: "${title}"؟`)) return;

    try {
      await api.deleteCareer(id);
      showToast('success', 'تم حذف الوظيفة بنجاح');
      fetchData();
    } catch (err: any) {
      showToast('error', err.message || 'فشل حذف الوظيفة');
    }
  };

  const handleToggleJobStatus = async (job: any) => {
    try {
      await api.updateCareer(job.id, { isActive: !job.isActive });
      showToast('info', job.isActive ? 'تم إيقاف استقبال الطلبات' : 'تم تفعيل إعلان الوظيفة');
      fetchData();
    } catch (err: any) {
      showToast('error', err.message || 'فشل تحديث الحالة');
    }
  };

  const handleUpdateAppStatus = async (appId: string, status: string) => {
    try {
      await api.updateJobApplication(appId, { status });
      showToast('success', 'تم تحديث حالة طلب التوظيف');
      fetchData();
      if (selectedApp && selectedApp.id === appId) {
        setSelectedApp({ ...selectedApp, status });
      }
    } catch (err: any) {
      showToast('error', err.message || 'فشل تحديث حالة الطلب');
    }
  };

  const handleDeleteApp = async (id: string, name: string) => {
    if (!window.confirm(`هل أنت متأكد من حذف طلب التوظيف المقدم من: "${name}"؟`)) return;

    try {
      await api.deleteJobApplication(id);
      showToast('success', 'تم حذف الطلب بنجاح');
      if (selectedApp?.id === id) setSelectedApp(null);
      fetchData();
    } catch (err: any) {
      showToast('error', err.message || 'فشل حذف طلب التوظيف');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#17354F] flex items-center gap-2">
            <Briefcase className="w-6 h-6 text-[#2D6A4F]" />
            إدارة الوظائف وطلبات التوظيف
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            إدارة الشواغر الطبية والإدارية واستقبال ومراجعة السير الذاتية للمتقدمين
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchData}
            className="p-2.5 text-slate-500 hover:text-[#2D6A4F] hover:bg-slate-50 rounded-xl transition border border-slate-200"
            title="تحديث البيانات"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
          {activeSubTab === 'openings' && (
            <button
              onClick={openNewJobModal}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#2D6A4F] hover:bg-[#1f4a37] text-white rounded-xl font-medium shadow-sm transition"
            >
              <Plus className="w-5 h-5" />
              إضافة شاغر وظيفي
            </button>
          )}
        </div>
      </div>

      {/* Sub tabs switch */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        <button
          onClick={() => setActiveSubTab('openings')}
          className={`px-5 py-3 font-semibold text-sm border-b-2 transition flex items-center gap-2 ${
            activeSubTab === 'openings'
              ? 'border-[#2D6A4F] text-[#2D6A4F]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Briefcase className="w-4 h-4" />
          الوظائف الشاغرة ({careers.length})
        </button>
        <button
          onClick={() => setActiveSubTab('applications')}
          className={`px-5 py-3 font-semibold text-sm border-b-2 transition flex items-center gap-2 ${
            activeSubTab === 'applications'
              ? 'border-[#2D6A4F] text-[#2D6A4F]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          طلبات التوظيف المستلمة ({applications.length})
        </button>
      </div>

      {/* Content depending on sub-tab */}
      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <RefreshCw className="w-8 h-8 text-[#2D6A4F] animate-spin" />
        </div>
      ) : activeSubTab === 'openings' ? (
        /* Openings view */
        careers.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 shadow-sm">
            <Briefcase className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-slate-700">لا توجد وظائف معلنة حالياً</h3>
            <p className="text-slate-500 text-sm mt-1 max-w-md mx-auto">
              أضف شواغر التمريض والمساعدين الطبيين وفنيي المناظير لاستقبال طلبات العمل.
            </p>
            <button
              onClick={openNewJobModal}
              className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 bg-[#2D6A4F] text-white rounded-xl font-medium shadow-sm hover:bg-[#1f4a37] transition"
            >
              <Plus className="w-5 h-5" />
              إضافة وظيفة الآن
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {careers.map((job) => (
              <div
                key={job.id}
                className={`bg-white rounded-2xl p-6 border shadow-sm transition hover:shadow-md flex flex-col justify-between ${
                  job.isActive ? 'border-slate-100' : 'border-slate-200 bg-slate-50/70 opacity-80'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <span className="text-xs font-semibold text-[#2D6A4F] bg-[#2D6A4F]/10 px-2.5 py-1 rounded-full">
                        {job.department}
                      </span>
                      <h3 className="font-bold text-[#17354F] text-lg mt-2">{job.title}</h3>
                    </div>
                    <span
                      className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                        job.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {job.isActive ? 'متاحة للتقديم' : 'مغلقة'}
                    </span>
                  </div>

                  <p className="text-sm text-slate-600 line-clamp-3 mb-4 leading-relaxed">
                    {job.description}
                  </p>

                  <div className="flex flex-wrap gap-4 text-xs text-slate-500 mb-4 pt-3 border-t border-slate-100">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {job.type}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      {job.location}
                    </span>
                    {job.deadline && (
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        آخر موعد: {job.deadline}
                      </span>
                    )}
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <button
                    onClick={() => handleToggleJobStatus(job)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg transition ${
                      job.isActive
                        ? 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                        : 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                    }`}
                  >
                    {job.isActive ? 'إيقاف التقديم' : 'إعادة فتح التقديم'}
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openEditJobModal(job)}
                      className="p-2 text-slate-600 hover:text-[#2D6A4F] hover:bg-slate-50 rounded-lg transition"
                      title="تعديل"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteJob(job.id, job.title)}
                      className="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition"
                      title="حذف"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        /* Applications view */
        applications.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 shadow-sm">
            <Users className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-slate-700">لا توجد طلبات توظيف مستلمة حتى الآن</h3>
            <p className="text-slate-500 text-sm mt-1 max-w-md mx-auto">
              عند تقديم المتقدمين لطلبات العمل عبر صفحة التوظيف، ستظهر بياناتهم وسيرهم الذاتية هنا.
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-right text-sm">
                <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold">
                  <tr>
                    <th className="py-3.5 px-4">اسم المتقدم</th>
                    <th className="py-3.5 px-4">الوظيفة</th>
                    <th className="py-3.5 px-4">معلومات الاتصال</th>
                    <th className="py-3.5 px-4">السيرة الذاتية</th>
                    <th className="py-3.5 px-4">حالة الطلب</th>
                    <th className="py-3.5 px-4">تاريخ التقديم</th>
                    <th className="py-3.5 px-4 text-center">إجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {applications.map((app) => (
                    <tr key={app.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-3.5 px-4 font-semibold text-[#17354F]">
                        {app.fullName}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">
                        {app.jobTitle || 'طلب عام'}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">
                        <div className="flex flex-col text-xs gap-1">
                          <span className="flex items-center gap-1">
                            <Phone className="w-3 h-3 text-slate-400" />
                            <span dir="ltr">{app.phone}</span>
                          </span>
                          {app.email && (
                            <span className="flex items-center gap-1">
                              <Mail className="w-3 h-3 text-slate-400" />
                              <span>{app.email}</span>
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        {app.resumeUrl ? (
                          <a
                            href={app.resumeUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-[#2D6A4F] hover:underline font-semibold bg-[#2D6A4F]/10 px-2.5 py-1 rounded-lg"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            فتح الـ CV
                          </a>
                        ) : (
                          <span className="text-xs text-slate-400">غير مرفق</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <select
                          value={app.status || 'pending'}
                          onChange={(e) => handleUpdateAppStatus(app.id, e.target.value)}
                          className={`text-xs font-semibold px-2.5 py-1 rounded-lg border border-slate-200 outline-none ${
                            app.status === 'shortlisted'
                              ? 'bg-emerald-50 text-emerald-700'
                              : app.status === 'rejected'
                              ? 'bg-rose-50 text-rose-700'
                              : app.status === 'reviewed'
                              ? 'bg-blue-50 text-blue-700'
                              : 'bg-amber-50 text-amber-700'
                          }`}
                        >
                          <option value="pending">قيد الانتظار</option>
                          <option value="reviewed">تمت المراجعة</option>
                          <option value="shortlisted">مرشح للمقابلة</option>
                          <option value="rejected">مرفوض</option>
                        </select>
                      </td>
                      <td className="py-3.5 px-4 text-xs text-slate-500">
                        {app.createdAt ? new Date(app.createdAt).toLocaleDateString('ar-YE') : '-'}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => setSelectedApp(app)}
                            className="p-1.5 text-slate-500 hover:text-[#2D6A4F] rounded-lg hover:bg-slate-100"
                            title="تفاصيل المتقدم"
                          >
                            <FileText className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteApp(app.id, app.fullName)}
                            className="p-1.5 text-rose-500 hover:text-rose-700 rounded-lg hover:bg-rose-50"
                            title="حذف"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )
      )}

      {/* Modal: Job Opening Form */}
      {isJobModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl border border-slate-100 my-8">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="font-bold text-lg text-[#17354F] flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-[#2D6A4F]" />
                {selectedJob ? 'تعديل شاغر وظيفي' : 'إضافة شاغر وظيفي جديد'}
              </h3>
              <button
                onClick={() => setIsJobModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveJob} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  المسمى الوظيفي <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={jobFormData.title}
                  onChange={(e) => setJobFormData({ ...jobFormData, title: e.target.value })}
                  placeholder="مثال: ممرض / ممرضة وحدة مناظير الجهاز الهضمي"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]/20 focus:border-[#2D6A4F] text-sm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    القسم الطبي / الإداري
                  </label>
                  <input
                    type="text"
                    value={jobFormData.department}
                    onChange={(e) => setJobFormData({ ...jobFormData, department: e.target.value })}
                    placeholder="مثال: وحدة المناظير"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]/20 focus:border-[#2D6A4F] text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    نوع الدوام
                  </label>
                  <select
                    value={jobFormData.type}
                    onChange={(e) => setJobFormData({ ...jobFormData, type: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]/20 focus:border-[#2D6A4F] text-sm bg-white"
                  >
                    <option value="دوام كامل">دوام كامل (Full-time)</option>
                    <option value="دوام جزئي">دوام جزئي (Part-time)</option>
                    <option value="فترة صباحية">فترة صباحية</option>
                    <option value="فترة مسائية">فترة مسائية</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    الموقع ومقر العمل
                  </label>
                  <input
                    type="text"
                    value={jobFormData.location}
                    onChange={(e) => setJobFormData({ ...jobFormData, location: e.target.value })}
                    placeholder="صنعاء، اليمن"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]/20 focus:border-[#2D6A4F] text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    آخر موعد للتقديم
                  </label>
                  <input
                    type="date"
                    value={jobFormData.deadline}
                    onChange={(e) => setJobFormData({ ...jobFormData, deadline: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]/20 focus:border-[#2D6A4F] text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  الوصف الوظيفي العام
                </label>
                <textarea
                  rows={3}
                  value={jobFormData.description}
                  onChange={(e) => setJobFormData({ ...jobFormData, description: e.target.value })}
                  placeholder="نبذة عن طبيعة العمل والبيئة والمهام العامة..."
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]/20 focus:border-[#2D6A4F] text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  المتطلبات والشروط (شرط في كل سطر)
                </label>
                <textarea
                  rows={3}
                  value={jobFormData.requirementsText}
                  onChange={(e) => setJobFormData({ ...jobFormData, requirementsText: e.target.value })}
                  placeholder="بكالوريوس تمريض أو دبلوم عالي&#10;خبرة لا تقل عن سنتين في وحدات المناظير&#10;إتقان بروتوكولات التعقيم والسلامة"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]/20 focus:border-[#2D6A4F] text-sm font-mono"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  المهام والمسؤوليات (مهمة في كل سطر)
                </label>
                <textarea
                  rows={3}
                  value={jobFormData.responsibilitiesText}
                  onChange={(e) => setJobFormData({ ...jobFormData, responsibilitiesText: e.target.value })}
                  placeholder="تحضير المرضى وتجهيز غرف المناظير&#10;مساعدة الطبيب أثناء الإجراءات التشخيصية والعلاجية&#10;مراقبة العلامات الحيوية للمريض بعد الإجراء"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]/20 focus:border-[#2D6A4F] text-sm font-mono"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  حالة الشاغر
                </label>
                <select
                  value={jobFormData.isActive ? 'active' : 'inactive'}
                  onChange={(e) => setJobFormData({ ...jobFormData, isActive: e.target.value === 'active' })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]/20 focus:border-[#2D6A4F] text-sm bg-white"
                >
                  <option value="active">متاح ومفتوح لاستقبال الطلبات</option>
                  <option value="inactive">مغلق ومخفي مؤقتًا</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsJobModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-medium text-sm transition"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-[#2D6A4F] hover:bg-[#1f4a37] text-white font-medium text-sm shadow-sm transition"
                >
                  {selectedJob ? 'حفظ التعديلات' : 'نشر الوظيفة'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Application View Details */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl border border-slate-100 my-8">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="font-bold text-lg text-[#17354F] flex items-center gap-2">
                <Users className="w-5 h-5 text-[#2D6A4F]" />
                تفاصيل طلب التوظيف
              </h3>
              <button
                onClick={() => setSelectedApp(null)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-sm">
              <div className="bg-slate-50 rounded-xl p-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">الاسم الكامل:</span>
                  <span className="font-bold text-[#17354F]">{selectedApp.fullName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">الوظيفة المتقدم لها:</span>
                  <span className="font-semibold text-[#2D6A4F]">{selectedApp.jobTitle || 'عام'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">رقم الهاتف:</span>
                  <span dir="ltr" className="font-mono text-slate-700">{selectedApp.phone}</span>
                </div>
                {selectedApp.email && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">البريد الإلكتروني:</span>
                    <span className="text-slate-700">{selectedApp.email}</span>
                  </div>
                )}
                {selectedApp.experienceYears !== undefined && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">سنوات الخبرة:</span>
                    <span className="font-medium text-slate-700">{selectedApp.experienceYears} سنوات</span>
                  </div>
                )}
              </div>

              {selectedApp.coverLetter && (
                <div>
                  <h4 className="font-bold text-slate-700 mb-1">خطاب التقديم / نبذة:</h4>
                  <p className="p-3 bg-slate-50 rounded-xl text-slate-600 text-xs leading-relaxed whitespace-pre-line">
                    {selectedApp.coverLetter}
                  </p>
                </div>
              )}

              {selectedApp.resumeUrl && (
                <div className="pt-2">
                  <a
                    href={selectedApp.resumeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[#2D6A4F] text-white rounded-xl font-medium hover:bg-[#1f4a37] transition"
                  >
                    <FileText className="w-4 h-4" />
                    عرض السيرة الذاتية (CV)
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              )}

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-slate-500 text-xs">تغيير حالة الطلب:</span>
                <select
                  value={selectedApp.status || 'pending'}
                  onChange={(e) => handleUpdateAppStatus(selectedApp.id, e.target.value)}
                  className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-200 outline-none"
                >
                  <option value="pending">قيد الانتظار</option>
                  <option value="reviewed">تمت المراجعة</option>
                  <option value="shortlisted">مرشح للمقابلة</option>
                  <option value="rejected">مرفوض</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
