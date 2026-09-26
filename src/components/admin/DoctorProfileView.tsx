import { PROTECTED_SUPABASE_DOCTOR_PHOTO } from "../../constants/clinicAssets";
import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { ImageUploadField } from './ImageUploadField';
import { uploadOriginalImage } from '../../services/uploadService';
import { useClinicData } from '../../context/ClinicDataContext';
import {
  UserCheck,
  GraduationCap,
  Briefcase,
  Plus,
  Trash2,
  Save,
  CheckCircle2,
  Sparkles,
  RefreshCw,
  Image,
  Upload,
} from 'lucide-react';
import { useAutoSaveForm } from '../../hooks/useAutoSaveForm';
import { AutoSaveBadge } from './AutoSaveBadge';

interface DoctorProfileViewProps {
  showToast: (type: 'success' | 'error' | 'info', text: string) => void;
}

export const DoctorProfileView: React.FC<DoctorProfileViewProps> = ({ showToast }) => {
  const { refreshContent } = useClinicData();
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // New item draft states
  const [newExp, setNewExp] = useState('');
  const [newQual, setNewQual] = useState({
    degree: '',
    institution: '',
    year: '',
    notes: '',
  });

  const fetchProfile = async () => {
    try {
      const data = await api.getDoctorProfile();
      setProfile(data);
    } catch (err: any) {
      showToast('error', err.message || 'فشل تحميل بيانات الطبيب');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  // Real-time Auto Save to Database & Persistent Storage
  const { markSavedImmediately } = useAutoSaveForm({
    key: 'doctor-profile',
    data: profile,
    isReady: !isLoading && profile !== null,
    onSave: async (updated) => {
      await api.updateDoctorProfile(updated);
      await refreshContent();
    },
  });

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await api.updateDoctorProfile(profile);
      if (res) {
        setProfile(res);
      }
      markSavedImmediately(profile);
      await refreshContent();
      showToast('success', 'تم حفظ بيانات الطبيب والمؤهلات بنجاح، وتم تحديث الموقع مباشرة');
    } catch (err: any) {
      showToast('error', err.message || 'فشل حفظ التعديلات');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDoctorPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('error', 'يرجى اختيار ملف صورة صالح (JPG, PNG, WebP)');
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      showToast('error', 'حجم الصورة كبير جداً، يرجى اختيار صورة أقل من 15 ميغابايت');
      return;
    }

    try {
      // 1. Upload exact original file to Supabase persistent storage
      const uploadedUrl = await uploadOriginalImage(file);
      const updatedProfile = { ...profile, photo: uploadedUrl };
      setProfile(updatedProfile);
      await api.updateDoctorProfile(updatedProfile);
      await refreshContent();
      showToast('success', 'تم رفع وحفظ صورة الطبيب في Supabase Storage وتحديث الموقع مباشرة 100%');
    } catch (err: any) {
      showToast('error', err.message || 'تعذر رفع الصورة. يرجى المحاولة مرة أخرى.');
    }
  };

  const handleAddExperience = () => {
    if (!newExp.trim()) return;
    setProfile({
      ...profile,
      experiences: [...(profile.experiences || []), newExp.trim()],
    });
    setNewExp('');
  };

  const handleRemoveExperience = (index: number) => {
    setProfile({
      ...profile,
      experiences: profile.experiences.filter((_: any, i: number) => i !== index),
    });
  };

  const handleAddQualification = () => {
    if (!newQual.degree.trim() || !newQual.institution.trim()) {
      showToast('error', 'يرجى كتابة اسم الدرجة العلمية والجامعة أو المستشفى');
      return;
    }
    setProfile({
      ...profile,
      qualifications: [...(profile.qualifications || []), { ...newQual }],
    });
    setNewQual({ degree: '', institution: '', year: '', notes: '' });
  };

  const handleRemoveQualification = (index: number) => {
    setProfile({
      ...profile,
      qualifications: profile.qualifications.filter((_: any, i: number) => i !== index),
    });
  };

  if (isLoading) {
    return (
      <div className="p-12 text-center text-[#667788]">
        <RefreshCw className="w-6 h-6 animate-spin mx-auto text-[#064B82] mb-2" />
        جاري تحميل الملف الطبي...
      </div>
    );
  }

  return (
    <form onSubmit={handleSave} className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-[#E2EAF0] shadow-sm">
        <div>
          <h2 className="text-sm font-bold text-[#064B82]">الملف التعريفي للطبيب والمؤهلات الأكاديمية</h2>
          <p className="text-xs text-[#667788] mt-0.5">
            البيانات المعروضة هنا تظهر مباشرة في قسم "عن الطبيب" والبطاقة التعريفية للزوار
          </p>
        </div>
        <div className="flex items-center gap-3">
          <AutoSaveBadge />
          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex items-center gap-1.5 py-2 px-5 bg-[#064B82] hover:bg-[#0B70B7] text-white text-xs font-bold rounded-xl shadow-sm transition-colors cursor-pointer disabled:opacity-50"
          >
            {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            حفظ يدوي
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Form Inputs */}
        <div className="lg:col-span-2 space-y-6">
          {/* Main Info Card */}
          <div className="bg-white p-5 rounded-2xl border border-[#E2EAF0] shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-[#17354F] flex items-center gap-2 border-b border-[#E2EAF0] pb-2.5">
              <UserCheck className="w-4 h-4 text-[#064B82]" />
              البيانات الشخصية والمهنية
            </h3>

            <div>
              <label className="block text-xs font-bold text-[#17354F] mb-1">اسم الطبيب الكامل</label>
              <input
                type="text"
                required
                value={profile?.name || ''}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                className="w-full py-2 px-3 bg-[#F8FAFC] border border-[#E2EAF0] rounded-xl text-xs font-bold text-[#064B82] focus:ring-2 focus:ring-[#0B70B7]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-[#17354F] mb-1">اللقب والتخصص الرئيسي</label>
                <input
                  type="text"
                  required
                  value={profile?.title || ''}
                  onChange={(e) => setProfile({ ...profile, title: e.target.value })}
                  className="w-full py-2 px-3 bg-[#F8FAFC] border border-[#E2EAF0] rounded-xl text-xs focus:ring-2 focus:ring-[#0B70B7]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#17354F] mb-1">المسمى الوظيفي الإكلينيكي</label>
                <input
                  type="text"
                  value={profile?.jobTitle || ''}
                  onChange={(e) => setProfile({ ...profile, jobTitle: e.target.value })}
                  className="w-full py-2 px-3 bg-[#F8FAFC] border border-[#E2EAF0] rounded-xl text-xs focus:ring-2 focus:ring-[#0B70B7]"
                />
              </div>
            </div>

            <div>
              <ImageUploadField
                label="صورة الطبيب الرسمية المعتمدة بالموقع"
                sublabel="رفع مباشر من جهازك أو اختيار من وسائط العيادة بدقة كاملة دون أي تعديل على الملامح"
                value={profile?.photo || ''}
                onChange={(url) => {
                  setProfile({ ...profile, photo: url });
                  showToast('success', 'تم تحديث صورة الطبيب بنجاح');
                }}
                category="طبيب"
                aspectRatio="portrait"
              />

              {/* Quick Presets without needing URL input */}
              <div className="mt-2.5 flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-bold text-slate-500">صور سريعة جاهزة:</span>
                <button
                  type="button"
                  onClick={() => {
                    setProfile({ ...profile, photo: PROTECTED_SUPABASE_DOCTOR_PHOTO });
                    showToast('info', 'تم اختيار صورة د. عبدالباسط المعتمدة');
                  }}
                  className="inline-flex items-center gap-1 py-1 px-2.5 bg-slate-100 hover:bg-slate-200 border border-slate-300 text-[11px] font-bold text-slate-700 rounded-lg cursor-pointer transition-colors"
                >
                  <span>الصورة الرسمية</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setProfile({ ...profile, photo: PROTECTED_SUPABASE_DOCTOR_PHOTO });
                    showToast('info', 'تم اختيار الصورة الكاملة لد. عبدالباسط');
                  }}
                  className="inline-flex items-center gap-1 py-1 px-2.5 bg-slate-100 hover:bg-slate-200 border border-slate-300 text-[11px] font-bold text-slate-700 rounded-lg cursor-pointer transition-colors"
                >
                  <span>صورة العيادة والمجسم</span>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#17354F] mb-1">نبذة عن الطبيب (Bio)</label>
              <textarea
                rows={4}
                value={profile?.bio || ''}
                onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                className="w-full py-2 px-3 bg-[#F8FAFC] border border-[#E2EAF0] rounded-xl text-xs leading-relaxed focus:ring-2 focus:ring-[#0B70B7]"
              />
            </div>
          </div>

          {/* Qualifications Management */}
          <div className="bg-white p-5 rounded-2xl border border-[#E2EAF0] shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-[#17354F] flex items-center gap-2 border-b border-[#E2EAF0] pb-2.5">
              <GraduationCap className="w-4 h-4 text-[#064B82]" />
              المؤهلات العلمية والشهادات الأكاديمية
            </h3>

            {/* Existing Qualifications list */}
            <div className="space-y-2">
              {(profile?.qualifications || []).map((q: any, idx: number) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-[#F8FAFC] border border-[#E2EAF0] flex items-center justify-between gap-3"
                >
                  <div>
                    <h4 className="text-xs font-bold text-[#064B82]">{q.degree}</h4>
                    <p className="text-[11px] text-[#667788] mt-0.5">
                      {q.institution} {q.year && `(${q.year})`}
                    </p>
                    {q.notes && <p className="text-[10px] text-gray-500 mt-0.5">{q.notes}</p>}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveQualification(idx)}
                    className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                    title="حذف هذا المؤهل"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            {/* Add Qualification inline form */}
            <div className="p-3 rounded-xl border border-dashed border-blue-200 bg-blue-50/30 space-y-2">
              <p className="text-[11px] font-bold text-[#064B82]">إضافة مؤهل أكاديمي جديد:</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="الدرجة العلمية (مثال: دكتوراه في الأمراض الباطنة)"
                  value={newQual.degree}
                  onChange={(e) => setNewQual({ ...newQual, degree: e.target.value })}
                  className="py-1.5 px-2.5 bg-white border border-[#E2EAF0] rounded-lg text-xs"
                />
                <input
                  type="text"
                  placeholder="الجامعة / الكلية (مثال: جامعة القاهرة - قصر العيني)"
                  value={newQual.institution}
                  onChange={(e) => setNewQual({ ...newQual, institution: e.target.value })}
                  className="py-1.5 px-2.5 bg-white border border-[#E2EAF0] rounded-lg text-xs"
                />
                <input
                  type="text"
                  placeholder="سنة التخرج (اختياري)"
                  value={newQual.year}
                  onChange={(e) => setNewQual({ ...newQual, year: e.target.value })}
                  className="py-1.5 px-2.5 bg-white border border-[#E2EAF0] rounded-lg text-xs"
                />
                <input
                  type="text"
                  placeholder="ملاحظات إضافية (اختياري)"
                  value={newQual.notes}
                  onChange={(e) => setNewQual({ ...newQual, notes: e.target.value })}
                  className="py-1.5 px-2.5 bg-white border border-[#E2EAF0] rounded-lg text-xs"
                />
              </div>
              <button
                type="button"
                onClick={handleAddQualification}
                className="py-1.5 px-3 bg-[#064B82] text-white text-xs font-semibold rounded-lg hover:bg-[#0B70B7] cursor-pointer"
              >
                + إضافة المؤهل للقائمة
              </button>
            </div>
          </div>

          {/* Clinical Experiences */}
          <div className="bg-white p-5 rounded-2xl border border-[#E2EAF0] shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-[#17354F] flex items-center gap-2 border-b border-[#E2EAF0] pb-2.5">
              <Briefcase className="w-4 h-4 text-[#064B82]" />
              الخبرات السريرية والتخصصية
            </h3>

            <div className="space-y-2">
              {(profile?.experiences || []).map((exp: string, idx: number) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-xl bg-[#F8FAFC] border border-[#E2EAF0] flex items-center justify-between gap-3 text-xs"
                >
                  <span className="text-gray-800 leading-relaxed font-medium">{exp}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveExperience(idx)}
                    className="p-1 text-rose-500 hover:bg-rose-50 rounded-lg cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="اكتب خبرة سريرية جديدة..."
                value={newExp}
                onChange={(e) => setNewExp(e.target.value)}
                className="flex-1 py-2 px-3 bg-[#F8FAFC] border border-[#E2EAF0] rounded-xl text-xs"
              />
              <button
                type="button"
                onClick={handleAddExperience}
                className="py-2 px-4 bg-[#064B82] text-white text-xs font-bold rounded-xl hover:bg-[#0B70B7] cursor-pointer"
              >
                إضافة خبرة
              </button>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Live Preview Widget */}
        <div>
          <div className="sticky top-24 bg-white p-5 rounded-2xl border border-[#E2EAF0] shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold text-[#55A630]">
              <Sparkles className="w-4 h-4" />
              معاينة بطاقة الطبيب على الموقع:
            </div>

            <div className="text-center p-4 rounded-2xl bg-gradient-to-b from-[#F4F8FB] to-white border border-[#E2EAF0]">
              <div className="w-24 h-24 mx-auto rounded-2xl overflow-hidden border-2 border-[#0B70B7] shadow-md mb-3 bg-gray-100 flex items-center justify-center">
                {profile?.photo ? (
                  <img
                    src={profile.photo}
                    alt={profile.name}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <UserCheck className="w-10 h-10 text-gray-400" />
                )}
              </div>
              <h4 className="text-sm font-bold text-[#064B82]">{profile?.name}</h4>
              <p className="text-xs text-[#0B70B7] font-semibold mt-0.5">{profile?.title}</p>
              <p className="text-[10px] text-[#667788] mt-1">{profile?.jobTitle}</p>
            </div>

            <div className="text-xs text-[#667788] space-y-2 leading-relaxed">
              <p className="line-clamp-4">{profile?.bio}</p>
            </div>

            <div className="pt-3 border-t border-[#E2EAF0]">
              <p className="text-[11px] font-bold text-[#17354F] mb-1.5">أبرز المؤهلات المسجلة ({profile?.qualifications?.length || 0}):</p>
              <div className="space-y-1">
                {(profile?.qualifications || []).slice(0, 3).map((q: any, i: number) => (
                  <div key={i} className="text-[10px] text-[#064B82] flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-[#55A630] flex-shrink-0" />
                    <span className="truncate">{q.degree}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
};
