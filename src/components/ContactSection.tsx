import React, { useState } from 'react';
import { Phone, Mail, MapPin, MessageCircle, Clock, Send, CheckCircle, RefreshCw } from 'lucide-react';
import { useClinicData } from '../context/ClinicDataContext';
import { api } from '../services/api';

export const ContactSection: React.FC = () => {
  const { contact, schedule } = useClinicData();

  const [messageForm, setMessageForm] = useState({
    name: '',
    phone: '',
    email: '',
    subject: '',
    message: '',
  });

  const [isSending, setIsSending] = useState(false);
  const [sentSuccess, setSentSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageForm.name.trim() || !messageForm.phone.trim() || !messageForm.message.trim()) {
      setErrorMsg('يرجى تعبئة الاسم ورقم الهاتف ونص الرسالة');
      return;
    }

    setErrorMsg('');
    setIsSending(true);

    try {
      await api.createPublicMessage({
        name: messageForm.name.trim(),
        phone: messageForm.phone.trim(),
        email: messageForm.email.trim(),
        subject: messageForm.subject.trim() || 'استفسار من الموقع العام',
        message: messageForm.message.trim(),
      });

      setSentSuccess(true);
      setMessageForm({
        name: '',
        phone: '',
        email: '',
        subject: '',
        message: '',
      });
    } catch (err: any) {
      setErrorMsg(err.message || 'فشل إرسال الرسالة، يرجى المحاولة مرة أخرى أو الاتصال بنا.');
    } finally {
      setIsSending(false);
    }
  };

  const phones = contact?.phones?.length ? contact.phones : ['777554626', '777560603'];

  return (
    <section id="contact" className="py-16 md:py-20 bg-white border-b border-[#E2EAF0]">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#F0F7FC] border border-[#BED8EA] text-[#064B82] text-xs font-bold mb-3">
            <span>يسعدنا استقبال استفساراتكم</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-[#064B82] mb-2">
            تواصل معنا
          </h2>
          <div className="geometric-divider">
            <span className="geometric-divider-center" />
          </div>
          <p className="text-sm sm:text-base text-[#4B6375]">
            فريق العيادة متاح للإجابة عن تساؤلاتكم وحجز مواعيد الفحوصات والاستشارات الطبية
          </p>
        </div>

        {/* Contact Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          
          {/* Card 1: Phones */}
          <div className="geometric-card p-6 text-right flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-[#F0F7FC] border border-[#BED8EA] flex items-center justify-center text-[#0872B9] mb-4">
                <Phone className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#064B82] mb-1">
                أرقام الحجز والاستفسار
              </h3>
              <p className="text-xs text-[#64748B] mb-4">
                للحجز الهاتفي السريع والتنسيق
              </p>
            </div>
            <div className="space-y-1.5 pt-3 border-t border-[#E2EAF0] dir-ltr text-right">
              {phones.map((phone, idx) => (
                <a
                  key={idx}
                  href={`tel:${phone}`}
                  onClick={() => api.trackAnalyticsEvent({ type: 'phone_click' }).catch(() => {})}
                  className="block text-sm font-bold font-mono text-[#0872B9] hover:text-[#55A630] transition-colors"
                >
                  {phone}
                </a>
              ))}
            </div>
          </div>

          {/* Card 2: Email */}
          <div className="geometric-card p-6 text-right flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-[#F0F8EC] border border-[#C5E6B5] flex items-center justify-center text-[#55A630] mb-4">
                <Mail className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#064B82] mb-1">
                البريد الإلكتروني
              </h3>
              <p className="text-xs text-[#64748B] mb-4">
                للمراسلات والتقارير الطبية
              </p>
            </div>
            <div className="pt-3 border-t border-[#E2EAF0]">
              <a
                href={`mailto:${contact?.email || 'info@dr-abdulbasit.com'}`}
                className="text-xs sm:text-sm font-semibold text-[#0872B9] hover:underline break-all"
              >
                {contact?.email || 'info@dr-abdulbasit.com'}
              </a>
            </div>
          </div>

          {/* Card 3: Address */}
          <div className="geometric-card p-6 text-right flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-[#F0F7FC] border border-[#BED8EA] flex items-center justify-center text-[#0872B9] mb-4">
                <MapPin className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#064B82] mb-1">
                عنوان العيادة
              </h3>
              <p className="text-xs text-[#64748B] mb-4">
                موقع يسهل الوصول إليه في العاصمة
              </p>
            </div>
            <div className="pt-3 border-t border-[#E2EAF0]">
              <p className="text-xs font-semibold text-[#17354F] leading-snug">
                {contact?.address || 'صنعاء - شارع الزبيري'}
              </p>
            </div>
          </div>

          {/* Card 4: Working Hours */}
          <div className="geometric-card p-6 text-right flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-[#F0F8EC] border border-[#C5E6B5] flex items-center justify-center text-[#55A630] mb-4">
                <Clock className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#064B82] mb-1">
                أوقات العمل
              </h3>
              <p className="text-xs text-[#64748B] mb-4">
                {schedule?.workingDays || 'السبت – الخميس (فترتان)'}
              </p>
            </div>
            <div className="space-y-1 pt-3 border-t border-[#E2EAF0] text-xs text-[#17354F]">
              <div className="font-semibold text-[#0872B9]">
                الصباح: {schedule?.morningHours || '9:00 ص – 2:00 ظ'}
              </div>
              <div className="font-semibold text-[#55A630]">
                المساء: {schedule?.eveningHours || '5:00 ع – 9:00 م'}
              </div>
            </div>
          </div>

        </div>

        {/* Visitor Inquiry Message Form & Social Banner */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-6">
          {/* Quick Message Form (8 Cols) */}
          <div className="lg:col-span-8 geometric-card p-6 sm:p-8">
            <h3 className="text-base sm:text-lg font-bold text-[#064B82] mb-1">
              أرسل استفسارك أو تقريرك الطبي مباشرة
            </h3>
            <p className="text-xs sm:text-sm text-[#4B6375] mb-6">
              سيصل استفسارك مباشرة إلى الطاقم الطبي لإفادتك بالإجراء المناسب
            </p>

            {sentSuccess ? (
              <div className="bg-[#F0FDF4] border border-[#A5D56D] p-5 rounded-2xl text-center space-y-2">
                <CheckCircle className="w-8 h-8 text-[#55A630] mx-auto" />
                <h4 className="text-sm font-bold text-[#17354F]">تم إرسال استفسارك بنجاح</h4>
                <p className="text-xs text-[#64748B]">
                  شكرًا لتواصلكم، سيقوم فريق العيادة بالاطلاع على الرسالة والرد عليكم في أقرب وقت.
                </p>
                <button
                  onClick={() => setSentSuccess(false)}
                  className="mt-2 text-xs text-[#0872B9] underline font-bold cursor-pointer"
                >
                  إرسال استفسار آخر
                </button>
              </div>
            ) : (
              <form onSubmit={handleSendMessage} className="space-y-4">
                {errorMsg && (
                  <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl font-medium">
                    {errorMsg}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#17354F] mb-1">الاسم الكريم *</label>
                    <input
                      type="text"
                      required
                      placeholder="الاسم الثلاثي أو اللقب"
                      value={messageForm.name}
                      onChange={(e) => setMessageForm({ ...messageForm, name: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-[#F8FAFC] border border-[#E2EAF0] rounded-xl text-xs text-[#17354F] focus:outline-none focus:border-[#0872B9]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#17354F] mb-1">رقم الهاتف أو الواتساب *</label>
                    <input
                      type="tel"
                      required
                      placeholder="777XXXXXX"
                      value={messageForm.phone}
                      onChange={(e) => setMessageForm({ ...messageForm, phone: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-[#F8FAFC] border border-[#E2EAF0] rounded-xl text-xs text-[#17354F] focus:outline-none focus:border-[#0872B9]"
                      dir="ltr"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#17354F] mb-1">البريد الإلكتروني (اختياري)</label>
                    <input
                      type="email"
                      placeholder="yourname@domain.com"
                      value={messageForm.email}
                      onChange={(e) => setMessageForm({ ...messageForm, email: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-[#F8FAFC] border border-[#E2EAF0] rounded-xl text-xs text-[#17354F] focus:outline-none focus:border-[#0872B9]"
                      dir="ltr"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#17354F] mb-1">موضوع الاستفسار</label>
                    <input
                      type="text"
                      placeholder="مثال: استفسار عن تحضير منظار القولون"
                      value={messageForm.subject}
                      onChange={(e) => setMessageForm({ ...messageForm, subject: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-[#F8FAFC] border border-[#E2EAF0] rounded-xl text-xs text-[#17354F] focus:outline-none focus:border-[#0872B9]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#17354F] mb-1">نص الرسالة أو الاستفسار *</label>
                  <textarea
                    rows={4}
                    required
                    placeholder="اكتب استفسارك بالتفصيل..."
                    value={messageForm.message}
                    onChange={(e) => setMessageForm({ ...messageForm, message: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-[#F8FAFC] border border-[#E2EAF0] rounded-xl text-xs text-[#17354F] focus:outline-none focus:border-[#0872B9] leading-relaxed"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSending}
                  className="py-3 px-6 bg-[#064B82] hover:bg-[#0B70B7] text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  {isSending ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>جاري الإرسال...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>إرسال الاستفسار الآن</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>

          {/* Social Connection Banner (4 Cols) */}
          <div className="lg:col-span-4 geometric-card p-6 sm:p-8 flex flex-col justify-between h-full space-y-6">
            <div>
              <h3 className="text-base font-bold text-[#064B82] mb-1">
                تواصل معنا مباشرة عبر المنصات
              </h3>
              <p className="text-xs text-[#4B6375] leading-relaxed">
                يمكنكم التواصل السريع عبر واتساب العيادة المباشر أو متابعة أحدث النصائح والتوعية الطبية
              </p>
            </div>

            <div className="flex items-center gap-3">
              {/* WhatsApp */}
              {contact?.social?.whatsapp && (
                <a
                  href={contact.social.whatsapp}
                  onClick={() => api.trackAnalyticsEvent({ type: 'whatsapp_click' }).catch(() => {})}
                  target="_blank"
                  rel="noreferrer"
                  className="w-11 h-11 rounded-xl bg-[#25D366] text-white flex items-center justify-center shadow-2xs hover:scale-105 transition-transform"
                  aria-label="WhatsApp"
                >
                  <MessageCircle className="w-5 h-5" />
                </a>
              )}

              {/* Facebook */}
              {contact?.social?.facebook && (
                <a
                  href={contact.social.facebook}
                  target="_blank"
                  rel="noreferrer"
                  className="w-11 h-11 rounded-xl bg-[#1877F2] text-white flex items-center justify-center font-bold text-lg shadow-2xs hover:scale-105 transition-transform"
                  aria-label="Facebook"
                >
                  <span>f</span>
                </a>
              )}

              {/* Instagram */}
              {contact?.social?.instagram && (
                <a
                  href={contact.social.instagram}
                  target="_blank"
                  rel="noreferrer"
                  className="w-11 h-11 rounded-xl bg-gradient-to-tr from-[#FD1D1D] to-[#833AB4] text-white flex items-center justify-center font-bold text-xs shadow-2xs hover:scale-105 transition-transform"
                  aria-label="Instagram"
                >
                  <span>IG</span>
                </a>
              )}
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};
