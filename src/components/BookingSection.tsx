import React, { useState } from 'react';
import { Calendar, Phone, Clock, MessageSquare, CheckCircle, AlertCircle, MessageCircle, RefreshCw } from 'lucide-react';
import { useClinicData } from '../context/ClinicDataContext';
import { api } from '../services/api';
import { BookingFormData } from '../types';

export const BookingSection: React.FC = () => {
  const { contact } = useClinicData();
  const [formData, setFormData] = useState<BookingFormData>({
    fullName: '',
    phone: '',
    visitType: 'جهاز هضمي',
    preferredDate: '',
    preferredPeriod: 'morning',
    notes: '',
  });

  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const visitTypes = [
    'استشارة باطنة',
    'جهاز هضمي',
    'كبد',
    'مناظير',
    'متابعة',
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName.trim() || !formData.phone.trim()) {
      setErrorMessage('يرجى كتابة الاسم الكامل ورقم الهاتف لتأكيد حجزك.');
      return;
    }

    setErrorMessage('');
    setIsSubmitting(true);

    try {
      await api.createPublicBooking({
        patientName: formData.fullName.trim(),
        phone: formData.phone.trim(),
        serviceType: formData.visitType,
        preferredDate: formData.preferredDate || new Date().toISOString().split('T')[0],
        preferredPeriod: formData.preferredPeriod,
        notes: formData.notes?.trim() || '',
      });

      setSubmitted(true);
    } catch (err: any) {
      setErrorMessage(err.message || 'فشل إرسال طلب الحجز، يرجى المحاولة مرة أخرى أو الحجز هاتفياً.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleWhatsAppDirect = () => {
    const periodArabic = formData.preferredPeriod === 'morning' ? 'الفترة الصباحية (9:00 ص - 2:00 ظ)' : 'الفترة المسائية (5:00 ع - 9:00 م)';
    const text = `السلام عليكم، أود حجز موعد في عيادة د. عبدالباسط عبده الحاج مقبل:
• الاسم: ${formData.fullName || 'غير محدد'}
• الهاتف: ${formData.phone || 'غير محدد'}
• نوع الزيارة: ${formData.visitType}
• التاريخ المطلوب: ${formData.preferredDate || 'أقرب موعد متاح'}
• الفترة: ${periodArabic}
• ملاحظات: ${formData.notes || 'لا يوجد'}`;

    api.trackAnalyticsEvent({ type: 'whatsapp_click' }).catch(() => {});
    const whatsappNum = contact?.whatsapp || '777554626';
    const url = `https://wa.me/967${whatsappNum}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };


  return (
    <section id="booking" className="py-16 md:py-20 bg-[#F6FAFC] border-b border-[#E2EAF0]">
      <div className="w-full max-w-4xl mx-auto px-4 sm:px-6">
        
        {/* Section Header */}
        <div className="text-center max-w-xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#F0F7FC] border border-[#BED8EA] text-[#064B82] text-xs font-bold mb-3">
            <span>خدمة المواعيد</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-[#064B82] mb-2">
            احجز موعدك الآن
          </h2>
          <div className="geometric-divider">
            <span className="geometric-divider-center" />
          </div>
          <p className="text-xs sm:text-sm text-[#4B6375]">
            املأ النموذج أدناه لحجز موعد استشاري، وسيتم التواصل معك هاتفيًا أو عبر الواتساب لتأكيد الموعد المناسب
          </p>
        </div>

        {/* Card Form */}
        <div className="geometric-card p-6 sm:p-10">
          
          {submitted ? (
            <div className="text-center py-8 animate-in fade-in duration-300">
              <div className="w-16 h-16 rounded-full bg-[#F0F8EC] text-[#55A630] flex items-center justify-center mx-auto mb-4 border border-[#C5E6B5]">
                <CheckCircle className="w-10 h-10" />
              </div>

              <h3 className="text-xl sm:text-2xl font-bold text-[#064B82] mb-2">
                تم إرسال طلب الحجز بنجاح
              </h3>

              <div className="bg-[#F0FDF4] border border-[#A5D56D] rounded-xl p-4 max-w-md mx-auto mb-6 text-sm text-[#17354F] font-semibold leading-relaxed">
                تم إرسال طلب الحجز بنجاح، وسيتم التواصل معكم لتأكيد الموعد.
              </div>

              <p className="text-xs text-[#64748B] max-w-md mx-auto mb-8">
                * ملاحظة هامة: هذا طلب مبدئي للموعد، وسيتم تأكيده نهائيًا بعد مراجعة جدول العيادة والتواصل معكم عبر الهاتف أو رسالة واتساب.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5">
                <button
                  onClick={handleWhatsAppDirect}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#55A630] hover:bg-[#489228] text-white font-bold px-6 py-3 rounded-xl transition-all shadow-xs cursor-pointer text-sm active:scale-[0.99]"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>تأكيد الموعد فورًا عبر واتساب العيادة</span>
                </button>

                <button
                  onClick={() => {
                    setSubmitted(false);
                    setFormData({
                      fullName: '',
                      phone: '',
                      visitType: 'جهاز هضمي',
                      preferredDate: '',
                      preferredPeriod: 'morning',
                      notes: '',
                    });
                  }}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#F6FAFC] hover:bg-slate-100 text-[#064B82] font-bold px-5 py-3 rounded-xl border border-[#E2EAF0] transition-colors cursor-pointer text-sm active:scale-[0.99]"
                >
                  <span>حجز موعد آخر</span>
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {errorMessage && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-xs sm:text-sm flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Grid 1: Name and Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs sm:text-sm font-bold text-[#17354F] mb-1.5 text-right">
                    الاسم الكامل <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="اكتب اسمك الثلاثي أو الرباعي"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full px-4 py-3 bg-[#F8FAFC] border border-[#E2EAF0] rounded-xl text-sm text-[#17354F] focus:outline-none focus:border-[#0872B9] focus:bg-white transition-all text-right shadow-2xs"
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-bold text-[#17354F] mb-1.5 text-right">
                    رقم الهاتف <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    dir="ltr"
                    placeholder="777XXXXXX"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-3 bg-[#F8FAFC] border border-[#E2EAF0] rounded-xl text-sm text-[#17354F] focus:outline-none focus:border-[#0872B9] focus:bg-white transition-all text-right font-mono shadow-2xs"
                  />
                </div>
              </div>

              {/* Grid 2: Visit Type and Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs sm:text-sm font-bold text-[#17354F] mb-1.5 text-right">
                    نوع الزيارة <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.visitType}
                    onChange={(e) => setFormData({ ...formData, visitType: e.target.value })}
                    className="w-full px-4 py-3 bg-[#F8FAFC] border border-[#E2EAF0] rounded-xl text-sm text-[#17354F] focus:outline-none focus:border-[#0872B9] focus:bg-white transition-all text-right cursor-pointer shadow-2xs"
                  >
                    {visitTypes.map((type, idx) => (
                      <option key={idx} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-bold text-[#17354F] mb-1.5 text-right">
                    التاريخ المطلوب
                  </label>
                  <input
                    type="date"
                    value={formData.preferredDate}
                    onChange={(e) => setFormData({ ...formData, preferredDate: e.target.value })}
                    className="w-full px-4 py-3 bg-[#F8FAFC] border border-[#E2EAF0] rounded-xl text-sm text-[#17354F] focus:outline-none focus:border-[#0872B9] focus:bg-white transition-all text-right cursor-pointer font-sans shadow-2xs"
                  />
                </div>
              </div>

              {/* Grid 3: Preferred Period (Morning / Evening) */}
              <div>
                <label className="block text-xs sm:text-sm font-bold text-[#17354F] mb-2 text-right">
                  الفترة المطلوبة <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <label
                    className={`border rounded-xl p-3.5 flex items-center gap-3 cursor-pointer transition-all ${
                      formData.preferredPeriod === 'morning'
                        ? 'bg-[#F0F7FA] border-[#0872B9] ring-1 ring-[#0872B9]'
                        : 'bg-[#F8FAFC] border-[#E2EAF0] hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="period"
                      value="morning"
                      checked={formData.preferredPeriod === 'morning'}
                      onChange={() => setFormData({ ...formData, preferredPeriod: 'morning' })}
                      className="sr-only"
                    />
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${formData.preferredPeriod === 'morning' ? 'border-[#0872B9]' : 'border-slate-300'}`}>
                      {formData.preferredPeriod === 'morning' && <div className="w-2 h-2 rounded-full bg-[#0872B9]" />}
                    </div>
                    <div className="text-right">
                      <div className="text-xs sm:text-sm font-bold text-[#064B82]">
                        الفترة الصباحية
                      </div>
                      <div className="text-[11px] text-[#64748B]">
                        9:00 ص – 2:00 ظ
                      </div>
                    </div>
                  </label>

                  <label
                    className={`border rounded-xl p-3.5 flex items-center gap-3 cursor-pointer transition-all ${
                      formData.preferredPeriod === 'evening'
                        ? 'bg-[#F0FDF4] border-[#55A630] ring-1 ring-[#55A630]'
                        : 'bg-[#F8FAFC] border-[#E2EAF0] hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="period"
                      value="evening"
                      checked={formData.preferredPeriod === 'evening'}
                      onChange={() => setFormData({ ...formData, preferredPeriod: 'evening' })}
                      className="sr-only"
                    />
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${formData.preferredPeriod === 'evening' ? 'border-[#55A630]' : 'border-slate-300'}`}>
                      {formData.preferredPeriod === 'evening' && <div className="w-2 h-2 rounded-full bg-[#55A630]" />}
                    </div>
                    <div className="text-right">
                      <div className="text-xs sm:text-sm font-bold text-[#55A630]">
                        الفترة المسائية
                      </div>
                      <div className="text-[11px] text-[#64748B]">
                        5:00 ع – 9:00 م
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs sm:text-sm font-bold text-[#17354F] mb-1.5 text-right">
                  ملاحظات أو وصف مبسط للأعراض
                </label>
                <textarea
                  rows={3}
                  placeholder="أدخل أي ملاحظات ترغب في إبلاغ الطبيب بها مسبقًا..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-4 py-3 bg-[#F8FAFC] border border-[#E2EAF0] rounded-xl text-sm text-[#17354F] focus:outline-none focus:border-[#0872B9] focus:bg-white transition-all text-right resize-none shadow-2xs"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                id="submit-booking-form"
                disabled={isSubmitting}
                className="w-full inline-flex items-center justify-center gap-2 bg-[#55A630] hover:bg-[#489228] text-white font-bold py-3.5 px-6 rounded-xl shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer text-base active:scale-[0.99] disabled:opacity-60"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    <span>جاري إرسال طلب الحجز...</span>
                  </>
                ) : (
                  <>
                    <Calendar className="w-5 h-5" />
                    <span>احجز الآن</span>
                  </>
                )}
              </button>

              <p className="text-[11px] text-[#64748B] text-center">
                * ملاحظة: إرسال الطلب يعني طلب موعد وسيتم التواصل معكم لتأكيد الوقت النهائي.
              </p>

            </form>
          )}

        </div>

      </div>
    </section>
  );
};
