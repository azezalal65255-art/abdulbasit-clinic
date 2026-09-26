import React, { useState } from 'react';
import { Calendar, Clock, ChevronDown, CheckCircle, AlertCircle, MessageCircle, Send } from 'lucide-react';
import { MedicalArticle } from '../types';
import { api } from '../services/api';
import { useClinicData } from '../context/ClinicDataContext';

interface MedicalLibraryBookingSectionProps {
  onSelectArticle: (article: MedicalArticle) => void;
  prefill?: { visitType?: string; notes?: string } | null;
}

export const MedicalLibraryBookingSection: React.FC<MedicalLibraryBookingSectionProps> = ({
  onSelectArticle,
  prefill,
}) => {
  const { articles: contextArticles = [] } = useClinicData();

  // Exact 4 articles in reference-model-1.png (Right-to-Left order) as fallback:
  const fallbackArticles: MedicalArticle[] = [
    {
      id: 'art-4',
      title: 'متى تكون الحموضة بحاجة إلى زيارة الطبيب؟',
      slug: 'heartburn-when-to-see-doctor',
      excerpt: 'علامات الخطورة المصاحبة للحموضة وارتجاع المريء التي تستدعي الفحص السريري العاجل.',
      category: 'الجهاز الهضمي',
      readTime: '3 دقائق',
      date: '2024',
      image: '/images/real_heartburn_care_1790357521162.jpg',
      content: [
        'الحموضة العارضة شائعة، ولكن عندما تتكرر أكثر من مرتين أسبوعياً أو تصاحبها صعوبة في البلع فإنها تتطلب استشارة الطبيب.',
        'التشخيص المبكر يحمي بطانة المريء من التآكل أو المضاعفات طويلة الأمد.',
      ],
    },
    {
      id: 'art-3',
      title: 'ما أعراض جرثومة المعدة وكيف يتم تشخيصها؟',
      slug: 'h-pylori-symptoms-diagnosis',
      excerpt: 'تعرف على ميكروب هيليكوباكتر بيلوري الحلزوني، وطرق الكشف المخبري والبروتوكول العلاجي المعتمد.',
      category: 'الجهاز الهضمي',
      readTime: '4 دقائق',
      date: '2024',
      image: '/images/h_pylori_2026_1790363517478.jpg',
      content: [
        'جرثومة المعدة هي بكتيريا حلزونية تستوطن بطانة المعدة وتسبب التهابات متكررة وقرحات هضمية.',
        'يتم تشخيصها عبر فحوصات النفس أو البراز أو الخزعة أثناء المنظار، ويتم علاجها ببروتوكول دوائي منضبط.',
      ],
    },
    {
      id: 'art-2',
      title: 'الكبد الدهني: الأسباب والأعراض وطرق الوقاية',
      slug: 'fatty-liver-causes-symptoms',
      excerpt: 'دليل توعوي شامل حول تراكم الدهون في الكبد، مؤشراته وأفضل سبل العلاج والوقاية الغذائية.',
      category: 'أمراض الكبد',
      readTime: '4 دقائق',
      date: '2024',
      image: '/images/fatty_liver_2026_1790363451530.jpg',
      content: [
        'يحدث الكبد الدهني نتيجة تراكم الدهون الزائدة في خلايا الكبد، وغالباً ما يتطور بصمت دون أعراض حادة.',
        'يعد تعديل النظام الغذائي وممارسة الرياضة والمتابعة الدورية حجر الزاوية لعكس الحالة وحماية وظائف الكبد.',
      ],
    },
    {
      id: 'art-1',
      title: 'متى يحتاج المريض إلى منظار المعدة؟',
      slug: 'when-gastroscopy-needed',
      excerpt: 'الحالات والأعراض التي تستوجب إجراء فحص منظار المعدة التشخيصي لتقييم صحة المريء والمعدة.',
      category: 'مناظير',
      readTime: '3 دقائق',
      date: '2024',
      image: '/images/real_endoscopy_suite_1790357440526.jpg',
      content: [
        'منظار المعدة هو إجراء دقيق يساعد في تقييم بطانة المريء، المعدة، والاثني عشر.',
        'يُنصح بإجرائه في حالات حرقة الفؤاد المزمنة المقاومة للأدوية، صعوبة البلع، القيء المتكرر، أو فقر الدم غير المفسر.',
      ],
    },
  ];

  const articles = contextArticles && contextArticles.length > 0 ? contextArticles : fallbackArticles;

  // Booking Form State
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    visitType: 'كشف واستشارة طبية',
    preferredDate: '',
    preferredTime: 'الفترة الصباحية (8:00 ص - 2:00 ظ)',
    notes: '',
  });

  // Apply prefill if passed from disease or service page
  React.useEffect(() => {
    if (prefill) {
      setFormData((prev) => ({
        ...prev,
        ...(prefill.visitType ? { visitType: prefill.visitType } : {}),
        ...(prefill.notes ? { notes: prefill.notes } : {}),
      }));
    }
  }, [prefill]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const visitTypeOptions = [
    'كشف واستشارة طبية عامة',
    'أمراض الجهاز الهضمي والقولون العصبي',
    'أمراض الكبد والكبد الدهني والفيروسات',
    'مناظير الجهاز الهضمي التشخيصية والتداخلية',
    'فحص جرثومة المعدة بالنفخ (UBT)',
    'سونار البطن والحوض التلفزيوني',
    'متابعة الأمراض الباطنية المزمنة (سكر / ضغط)',
    'استشارة ثانية ومراجعة تقارير وأشعة',
    'متابعة حالة سابقة',
  ];

  const timeOptions = [
    'الفترة الصباحية (8:00 ص - 2:00 ظ)',
    'الفترة المسائية (4:30 ع - 9:00 م)',
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName.trim() || !formData.phone.trim()) {
      setErrorMessage('يرجى إدخال الاسم ورقم الهاتف.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      await api.createPublicBooking({
        patientName: formData.fullName.trim(),
        phone: formData.phone.trim(),
        serviceType: formData.visitType,
        preferredDate: formData.preferredDate || new Date().toISOString().split('T')[0],
        preferredPeriod: formData.preferredTime.includes('الصباحية') ? 'morning' : 'evening',
        notes: formData.notes?.trim() || '',
      });

      setSubmitted(true);
    } catch (err: any) {
      setErrorMessage(err.message || 'فشل إرسال الحجز، يرجى المحاولة مرة أخرى.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="library-booking" className="py-12 md:py-16 bg-white border-b border-[#e2eaf0]" dir="rtl">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* ================= RIGHT COLUMN (in RTL): MEDICAL LIBRARY (approx 68% width) ================= */}
          <div className="lg:col-span-8 flex flex-col">
            
            {/* Title */}
            <div className="text-center mb-8">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-[#0c3653] mb-2">
                المكتبة الطبية
              </h2>
              <div className="w-10 h-1 bg-[#0872B9] rounded-full mx-auto" />
            </div>

            {/* 4 Article Cards in a Row / Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
              {articles.map((art) => (
                <div
                  key={art.id}
                  className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-2xs hover:shadow-md transition-shadow flex flex-col justify-between text-center group"
                >
                  <div>
                    {/* Article Image */}
                    <div className="aspect-4/3 w-full overflow-hidden bg-slate-100">
                      <img
                        src={art.image}
                        alt={art.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        referrerPolicy="no-referrer"
                      />
                    </div>

                    {/* Article Title */}
                    <div className="p-3.5">
                      <h3 className="text-xs sm:text-[13px] font-bold text-[#0c3653] leading-snug line-clamp-2">
                        {art.title}
                      </h3>
                    </div>
                  </div>

                  {/* Read More Button */}
                  <div className="p-3.5 pt-0">
                    <button
                      onClick={() => onSelectArticle(art)}
                      className="w-full py-1.5 rounded-lg border border-[#0872B9] text-[#0872B9] hover:bg-[#0872B9] hover:text-white text-xs font-bold transition-colors cursor-pointer"
                    >
                      اقرأ المزيد
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* View All Articles Green Button */}
            <div className="text-center">
              <button
                onClick={() => onSelectArticle(articles[0])}
                className="px-6 py-2.5 rounded-lg bg-[#2fa84f] hover:bg-[#279144] text-white text-xs sm:text-sm font-bold shadow-xs hover:shadow transition-all cursor-pointer active:scale-98"
              >
                عرض جميع المقالات
              </button>
            </div>

          </div>

          {/* ================= LEFT COLUMN (in RTL): BOOKING FORM (approx 32% width) ================= */}
          <div className="lg:col-span-4" id="booking">
            <div className="bg-[#08324f] text-white rounded-3xl p-6 sm:p-7 shadow-xl border border-[#0d476f] text-right">
              
              {/* Card Header */}
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-white/15">
                <Calendar className="w-5 h-5 text-[#2fa84f]" />
                <h3 className="text-lg font-black text-white">
                  احجز موعدك الآن
                </h3>
              </div>

              {submitted ? (
                <div className="py-6 text-center space-y-4 animate-in fade-in duration-300">
                  <div className="w-14 h-14 rounded-full bg-[#2fa84f]/20 border border-[#2fa84f]/40 text-[#2fa84f] flex items-center justify-center mx-auto">
                    <CheckCircle className="w-8 h-8" />
                  </div>
                  <h4 className="text-base font-bold text-white">
                    تم استلام طلب حجزك بنجاح!
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    سيقوم فريق العيادة بالتواصل معك لتأكيد الموعد النهائي عبر الهاتف أو الواتساب.
                  </p>

                  <a
                    href={`https://wa.me/967777554626?text=${encodeURIComponent(
                      `مرحباً دكتور، أود تأكيد حجزي باسم: ${formData.fullName} - تاريخ: ${formData.preferredDate || 'أقرب وقت'} (${formData.preferredTime})`
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full py-2.5 rounded-xl bg-[#25D366] hover:bg-[#1EBE5D] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>تأكيد الحجز فوراً عبر واتساب</span>
                  </a>

                  <button
                    onClick={() => {
                      setSubmitted(false);
                      setFormData({
                        fullName: '',
                        phone: '',
                        visitType: 'كشف واستشارة طبية',
                        preferredDate: '',
                        preferredTime: 'الفترة الصباحية (8:00 ص - 2:00 ظ)',
                        notes: '',
                      });
                    }}
                    className="text-xs text-slate-300 hover:text-white underline mt-2 block mx-auto cursor-pointer"
                  >
                    حجز موعد آخر
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-3 text-xs">
                  {errorMessage && (
                    <div className="p-2.5 rounded-xl bg-red-500/20 border border-red-500/40 text-red-200 text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{errorMessage}</span>
                    </div>
                  )}

                  {/* Full Name */}
                  <div>
                    <label className="block text-slate-200 font-bold mb-1 text-[11px]">
                      الاسم الكامل *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="أدخل اسم المريض الرباعي"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      className="w-full bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-white placeholder-slate-400 focus:outline-none focus:border-[#2fa84f] text-xs"
                    />
                  </div>

                  {/* Phone Number */}
                  <div>
                    <label className="block text-slate-200 font-bold mb-1 text-[11px]">
                      رقم الهاتف / الواتساب *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="مثال: 777123456"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-white placeholder-slate-400 focus:outline-none focus:border-[#2fa84f] text-xs font-mono"
                    />
                  </div>

                  {/* Service Type */}
                  <div>
                    <label className="block text-slate-200 font-bold mb-1 text-[11px]">
                      نوع الزيارة / الخدمة المطلوبة
                    </label>
                    <div className="relative">
                      <select
                        value={formData.visitType}
                        onChange={(e) => setFormData({ ...formData, visitType: e.target.value })}
                        className="w-full bg-[#0c3f64] border border-white/20 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#2fa84f] text-xs appearance-none cursor-pointer"
                      >
                        {visitTypeOptions.map((opt) => (
                          <option key={opt} value={opt} className="bg-[#08324f] text-white">
                            {opt}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="w-4 h-4 text-slate-300 absolute left-3 top-2.5 pointer-events-none" />
                    </div>
                  </div>

                  {/* Date & Period Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="block text-slate-200 font-bold mb-1 text-[11px]">
                        التاريخ المفضل
                      </label>
                      <input
                        type="date"
                        value={formData.preferredDate}
                        onChange={(e) => setFormData({ ...formData, preferredDate: e.target.value })}
                        className="w-full bg-white/10 border border-white/20 rounded-xl px-2.5 py-1.5 text-white focus:outline-none focus:border-[#2fa84f] text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-200 font-bold mb-1 text-[11px]">
                        الفترة المفضلة
                      </label>
                      <select
                        value={formData.preferredTime}
                        onChange={(e) => setFormData({ ...formData, preferredTime: e.target.value })}
                        className="w-full bg-[#0c3f64] border border-white/20 rounded-xl px-2 py-2 text-white focus:outline-none focus:border-[#2fa84f] text-[11px] appearance-none cursor-pointer"
                      >
                        {timeOptions.map((opt) => (
                          <option key={opt} value={opt} className="bg-[#08324f] text-white">
                            {opt}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="block text-slate-200 font-bold mb-1 text-[11px]">
                      ملاحظات أو شكوى طبية (اختياري)
                    </label>
                    <textarea
                      rows={2}
                      placeholder="صف الأعراض باختصار..."
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      className="w-full bg-white/10 border border-white/20 rounded-xl px-3 py-1.5 text-white placeholder-slate-400 focus:outline-none focus:border-[#2fa84f] text-xs resize-none"
                    />
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-2.5 rounded-xl bg-[#2fa84f] hover:bg-[#279144] disabled:bg-slate-600 text-white font-bold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-98 mt-2"
                  >
                    {isSubmitting ? (
                      <span>جاري إرسال الحجز...</span>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>تأكيد الحجز</span>
                      </>
                    )}
                  </button>

                  <div className="pt-2 text-center text-[10px] text-slate-300">
                    <p>مركز المأمون الطبي – صنعاء – شارع تعز (جولة تعز)</p>
                    <p className="mt-0.5 font-mono text-[#2fa84f]">777560603 | 777554626</p>
                  </div>
                </form>
              )}

            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
