import React, { useState } from 'react';
import { useClinicData } from '../context/ClinicDataContext';
import { api } from '../services/api';
import {
  Briefcase,
  X,
  MapPin,
  Clock,
  Send,
  CheckCircle2,
  AlertCircle,
  FileText,
  ChevronLeft,
} from 'lucide-react';

interface CareersModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CareersModal: React.FC<CareersModalProps> = ({ isOpen, onClose }) => {
  const { careers = [] } = useClinicData();
  const [selectedJob, setSelectedJob] = useState<any | null>(null);
  const [isApplying, setIsApplying] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    experienceYears: '1-3 سنوات',
    notes: '',
    resumeUrl: '',
  });

  if (!isOpen) return null;

  const activeCareers = (careers || []).filter((c: any) => c.isActive !== false);

  const handleApply = (job: any) => {
    setSelectedJob(job);
    setIsApplying(true);
    setSubmittedSuccess(false);
    setErrorMessage('');
  };

  const handleSubmitApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName.trim() || !formData.phone.trim()) {
      setErrorMessage('يرجى ملء الاسم الكامل ورقم الهاتف للتواصل');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      await api.submitJobApplication({
        careerId: selectedJob?.id || 'general',
        jobTitle: selectedJob?.title || 'طلب توظيف عام',
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        experienceYears: formData.experienceYears,
        notes: formData.notes.trim(),
        resumeUrl: formData.resumeUrl.trim(),
      });
      setSubmittedSuccess(true);
    } catch (err: any) {
      setErrorMessage(err.message || 'فشل إرسال طلب التوظيف، يرجى المحاولة لاحقاً');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto"
      onClick={onClose}
      dir="rtl"
    >
      <div
        className="bg-white rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl border border-slate-100 my-8 flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 bg-[#0c3653] text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
              <Briefcase className="w-5 h-5 text-[#2fa84f]" />
            </div>
            <div>
              <h2 className="font-bold text-lg sm:text-xl">الوظائف والفرص المتاحة</h2>
              <p className="text-xs text-slate-300">
                انضم إلى فريق عمل عيادة ومناظير د. عبدالباسط عبده الحاج مقبل
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white p-2 rounded-xl hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1">
          {isApplying ? (
            <div>
              <button
                onClick={() => setIsApplying(false)}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0872B9] hover:underline mb-4"
              >
                <ChevronLeft className="w-4 h-4 rotate-180" />
                العودة لقائمة الوظائف
              </button>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 mb-6">
                <span className="text-[11px] font-bold text-[#2fa84f] bg-[#2fa84f]/10 px-2.5 py-0.5 rounded-md">
                  {selectedJob?.department || 'الكادر الطبي'}
                </span>
                <h3 className="font-bold text-base text-[#0c3653] mt-1.5">
                  التقديم لوظيفة: {selectedJob?.title}
                </h3>
              </div>

              {submittedSuccess ? (
                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-8 text-center space-y-3">
                  <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-600">
                    <CheckCircle2 className="w-7 h-7" />
                  </div>
                  <h4 className="font-bold text-lg text-emerald-900">تم إرسال طلب التوظيف بنجاح!</h4>
                  <p className="text-xs sm:text-sm text-emerald-700 max-w-md mx-auto leading-relaxed">
                    شكراً لاهتمامك بالانضمام إلى فريقنا. ستقوم إدارة الموارد البشرية بمراجعة ملفك والتواصل معك عبر الهاتف أو الواتساب في أقرب فرصة.
                  </p>
                  <button
                    onClick={() => {
                      setIsApplying(false);
                      setSubmittedSuccess(false);
                    }}
                    className="mt-4 px-6 py-2 rounded-xl bg-[#0c3653] text-white text-xs font-bold hover:bg-[#08283e] transition"
                  >
                    عرض باقي الوظائف
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmitApplication} className="space-y-4">
                  {errorMessage && (
                    <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{errorMessage}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        الاسم الرباعي <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        placeholder="أدخل اسمك الرباعي"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#2fa84f]/20 focus:border-[#2fa84f]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        رقم الهاتف / الواتساب <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="مثال: 777123456"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#2fa84f]/20 focus:border-[#2fa84f] font-mono"
                        dir="ltr"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        البريد الإلكتروني
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="example@mail.com"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#2fa84f]/20 focus:border-[#2fa84f] text-left"
                        dir="ltr"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        سنوات الخبرة في المجال
                      </label>
                      <select
                        value={formData.experienceYears}
                        onChange={(e) => setFormData({ ...formData, experienceYears: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#2fa84f]/20 focus:border-[#2fa84f] bg-white"
                      >
                        <option value="حديث تخرج">حديث تخرج / أقل من سنة</option>
                        <option value="1-3 سنوات">من سنة إلى 3 سنوات</option>
                        <option value="3-5 سنوات">من 3 إلى 5 سنوات</option>
                        <option value="أكثر من 5 سنوات">أكثر من 5 سنوات</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      رابط السيرة الذاتية (Google Drive / LinkedIn / Dropbox)
                    </label>
                    <input
                      type="url"
                      value={formData.resumeUrl}
                      onChange={(e) => setFormData({ ...formData, resumeUrl: e.target.value })}
                      placeholder="https://drive.google.com/..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#2fa84f]/20 focus:border-[#2fa84f] text-left"
                      dir="ltr"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      ملاحظات أو نبذة عن المؤهلات والخبرات السابقة
                    </label>
                    <textarea
                      rows={3}
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      placeholder="أخبرنا باختصار عن مؤهلاتك العلمية والمراكز أو المستشفيات التي عملت بها..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#2fa84f]/20 focus:border-[#2fa84f]"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setIsApplying(false)}
                      className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50"
                    >
                      إلغاء
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-6 py-2.5 rounded-xl bg-[#2fa84f] hover:bg-[#279144] disabled:bg-slate-400 text-white text-xs font-bold flex items-center gap-2 shadow-sm transition cursor-pointer"
                    >
                      {isSubmitting ? (
                        <span>جاري الإرسال...</span>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          <span>إرسال طلب التوظيف</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {activeCareers.length === 0 ? (
                <div className="text-center py-12">
                  <Briefcase className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <h4 className="font-bold text-slate-700 text-base">لا توجد وظائف شاغرة حالياً</h4>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                    يمكنك متابعة هذه الصفحة دورياً أو التواصل معنا عبر الهاتف للاستفسار عن أي شواغر مستقبلية.
                  </p>
                </div>
              ) : (
                activeCareers.map((job: any) => (
                  <div
                    key={job.id}
                    className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs hover:border-[#0c3653]/30 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[11px] font-bold text-[#2fa84f] bg-[#2fa84f]/10 px-2.5 py-0.5 rounded-md">
                          {job.department || 'العيادة'}
                        </span>
                        <span className="text-[11px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          {job.type || 'دوام كامل'}
                        </span>
                        <span className="text-[11px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          {job.location || 'صنعاء'}
                        </span>
                      </div>

                      <h3 className="font-bold text-base text-[#0c3653]">{job.title}</h3>

                      {job.description && (
                        <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                          {job.description}
                        </p>
                      )}

                      {job.requirements && job.requirements.length > 0 && (
                        <div className="pt-1">
                          <span className="text-[11px] font-bold text-slate-700">المتطلبات الأساسية: </span>
                          <span className="text-[11px] text-slate-500">
                            {job.requirements.join(' • ')}
                          </span>
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => handleApply(job)}
                      className="px-5 py-2.5 rounded-xl bg-[#0c3653] hover:bg-[#08283e] text-white text-xs font-bold shrink-0 transition flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Briefcase className="w-4 h-4 text-[#2fa84f]" />
                      التقديم الآن
                    </button>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
