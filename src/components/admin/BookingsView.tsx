import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import {
  Search,
  Plus,
  Filter,
  Calendar,
  Phone,
  MessageSquare,
  Trash2,
  Edit,
  Eye,
  Download,
  Printer,
  X,
  CheckCircle2,
  Clock,
  User,
  FileText,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';

interface BookingsViewProps {
  showToast: (type: 'success' | 'error' | 'info', text: string) => void;
  openNewModalTrigger?: boolean;
}

export const BookingsView: React.FC<BookingsViewProps> = ({ showToast, openNewModalTrigger }) => {
  const [bookings, setBookings] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [shiftFilter, setShiftFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<any | null>(null);

  // Form State for Add / Edit
  const [formData, setFormData] = useState({
    patientName: '',
    phone: '',
    visitType: 'كشف جديد',
    serviceId: 'srv_digestive',
    preferredDate: new Date().toISOString().split('T')[0],
    preferredShift: 'morning',
    notes: '',
    adminNotes: '',
    status: 'new',
  });

  const fetchBookings = async () => {
    setIsLoading(true);
    try {
      const res = await api.getBookings({
        search,
        status: statusFilter,
        shift: shiftFilter,
        date: dateFilter,
        page: String(page),
        limit: '10',
      });
      setBookings(res.items || []);
      setTotal(res.total || 0);
      setTotalPages(res.totalPages || 1);
    } catch (err: any) {
      showToast('error', err.message || 'فشل تحميل قائمة الحجوزات');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [page, statusFilter, shiftFilter, dateFilter]);

  useEffect(() => {
    if (openNewModalTrigger) {
      setIsAddModalOpen(true);
    }
  }, [openNewModalTrigger]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchBookings();
  };

  const handleResetFilters = () => {
    setSearch('');
    setStatusFilter('all');
    setShiftFilter('all');
    setDateFilter('');
    setPage(1);
  };

  const handleSaveBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.patientName || !formData.phone) {
      showToast('error', 'اسم المريض ورقم الهاتف حقول مطلوبة');
      return;
    }

    try {
      if (selectedBooking) {
        await api.updateBooking(selectedBooking.id, formData);
        showToast('success', 'تم تعديل بيانات الحجز بنجاح');
      } else {
        await api.createBooking(formData);
        showToast('success', 'تمت إضافة الحجز الجديد بنجاح');
      }
      setIsAddModalOpen(false);
      setSelectedBooking(null);
      fetchBookings();
    } catch (err: any) {
      showToast('error', err.message || 'حدث خطأ أثناء حفظ الحجز');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`هل أنت متأكد من حذف حجز المريض: "${name}" ونقله إلى سلة المحذوفات؟`)) {
      return;
    }

    try {
      await api.deleteBooking(id);
      showToast('info', 'تم نقل الحجز إلى سلة المحذوفات، يمكنك استرجاعه لاحقًا');
      fetchBookings();
    } catch (err: any) {
      showToast('error', err.message || 'فشل حذف الحجز');
    }
  };

  const handleQuickStatus = async (id: string, newStatus: string) => {
    try {
      await api.updateBooking(id, { status: newStatus });
      showToast('success', 'تم تحديث حالة الحجز');
      fetchBookings();
    } catch (err: any) {
      showToast('error', err.message || 'فشل تحديث الحالة');
    }
  };

  const openEditModal = (booking: any) => {
    setSelectedBooking(booking);
    setFormData({
      patientName: booking.patientName || '',
      phone: booking.phone || '',
      visitType: booking.visitType || 'كشف جديد',
      serviceId: booking.serviceId || 'srv_digestive',
      preferredDate: booking.preferredDate || '',
      preferredShift: booking.preferredShift || 'morning',
      notes: booking.notes || '',
      adminNotes: booking.adminNotes || '',
      status: booking.status || 'new',
    });
    setIsAddModalOpen(true);
  };

  const openNewModal = () => {
    setSelectedBooking(null);
    setFormData({
      patientName: '',
      phone: '',
      visitType: 'كشف جديد',
      serviceId: 'srv_digestive',
      preferredDate: new Date().toISOString().split('T')[0],
      preferredShift: 'morning',
      notes: '',
      adminNotes: '',
      status: 'new',
    });
    setIsAddModalOpen(true);
  };

  const handleExportCSV = () => {
    if (bookings.length === 0) {
      showToast('info', 'لا توجد بيانات لتصديرها');
      return;
    }

    const headers = ['المعرف', 'اسم المريض', 'رقم الهاتف', 'نوع الزيارة', 'التاريخ', 'الفترة', 'الحالة', 'ملاحظات المريض', 'ملاحظات الإدارة'];
    const rows = bookings.map((b) => [
      b.id,
      `"${b.patientName}"`,
      `"${b.phone}"`,
      `"${b.visitType}"`,
      b.preferredDate,
      b.preferredShift === 'morning' ? 'صباحي' : 'مسائي',
      b.status,
      `"${(b.notes || '').replace(/"/g, '""')}"`,
      `"${(b.adminNotes || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `clinic-bookings-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('success', 'تم تصدير كشف الحجوزات بصيغة CSV بنجاح');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'new':
        return <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-emerald-100 text-emerald-800">جديد</span>;
      case 'contacted':
        return <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-blue-100 text-blue-800">تم التواصل</span>;
      case 'confirmed':
        return <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-indigo-100 text-indigo-800">مؤكد</span>;
      case 'completed':
        return <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-gray-100 text-gray-800">مكتمل</span>;
      case 'cancelled':
        return <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-rose-100 text-rose-800">ملغي</span>;
      case 'no_show':
        return <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-amber-100 text-amber-800">لم يحضر</span>;
      default:
        return <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-gray-100 text-gray-800">{status}</span>;
    }
  };

  return (
    <div className="space-y-5">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-[#E2EAF0] shadow-sm">
        <div>
          <h2 className="text-sm font-bold text-[#064B82]">إدارة حجوزات ومواعيد العيادة</h2>
          <p className="text-xs text-[#667788] mt-0.5">
            إجمالي الحجوزات المسجلة: <strong className="text-[#17354F] font-bold">{total}</strong> حجز
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={openNewModal}
            className="inline-flex items-center gap-1.5 py-2 px-3.5 bg-[#064B82] hover:bg-[#0B70B7] text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            إضافة حجز يدوي
          </button>

          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 py-2 px-3 bg-[#F4F8FB] hover:bg-[#E2EAF0] text-[#064B82] text-xs font-bold rounded-xl transition-colors cursor-pointer"
            title="تصدير كشف إكسل CSV"
          >
            <Download className="w-3.5 h-3.5" />
            تصدير CSV
          </button>

          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 py-2 px-3 bg-[#F4F8FB] hover:bg-[#E2EAF0] text-[#064B82] text-xs font-bold rounded-xl transition-colors cursor-pointer"
            title="طباعة"
          >
            <Printer className="w-3.5 h-3.5" />
            طباعة
          </button>

          <button
            onClick={fetchBookings}
            className="p-2 text-gray-500 hover:text-[#064B82] hover:bg-gray-100 rounded-xl transition-colors"
            title="تحديث القائمة"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-[#E2EAF0] shadow-sm space-y-3">
        <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ابحث باسم المريض، رقم الهاتف، أو تفاصيل الشكوى..."
              className="w-full pl-4 pr-10 py-2.5 bg-[#F8FAFC] border border-[#E2EAF0] rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#0B70B7] text-right"
            />
            <Search className="w-4 h-4 text-gray-400 absolute right-3.5 top-3 pointer-events-none" />
          </div>

          {/* Status Filter */}
          <div className="w-full md:w-44">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="w-full py-2.5 px-3 bg-[#F8FAFC] border border-[#E2EAF0] rounded-xl text-xs font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#0B70B7]"
            >
              <option value="all">كافة الحالات</option>
              <option value="new">جديد (بانتظار التواصل)</option>
              <option value="contacted">تم التواصل</option>
              <option value="confirmed">مؤكد</option>
              <option value="completed">مكتمل</option>
              <option value="cancelled">ملغي</option>
              <option value="no_show">لم يحضر</option>
            </select>
          </div>

          {/* Shift Filter */}
          <div className="w-full md:w-36">
            <select
              value={shiftFilter}
              onChange={(e) => {
                setShiftFilter(e.target.value);
                setPage(1);
              }}
              className="w-full py-2.5 px-3 bg-[#F8FAFC] border border-[#E2EAF0] rounded-xl text-xs font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#0B70B7]"
            >
              <option value="all">كافة الفترات</option>
              <option value="morning">صباحي (9ص - 2ظ)</option>
              <option value="evening">مسائي (5ع - 9م)</option>
            </select>
          </div>

          {/* Date Filter */}
          <div className="w-full md:w-40">
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => {
                setDateFilter(e.target.value);
                setPage(1);
              }}
              className="w-full py-2 px-3 bg-[#F8FAFC] border border-[#E2EAF0] rounded-xl text-xs font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#0B70B7]"
            />
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              className="py-2.5 px-4 bg-[#064B82] hover:bg-[#0B70B7] text-white text-xs font-bold rounded-xl transition-colors"
            >
              تصفية
            </button>
            {(search || statusFilter !== 'all' || shiftFilter !== 'all' || dateFilter) && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="py-2.5 px-3 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-xl transition-colors"
              >
                إعادة ضبط
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Bookings Table */}
      <div className="bg-white rounded-2xl border border-[#E2EAF0] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-[#F8FAFC] text-[#667788] border-b border-[#E2EAF0]">
              <tr>
                <th className="py-3 px-4 font-semibold">المريض</th>
                <th className="py-3 px-4 font-semibold">الهاتف</th>
                <th className="py-3 px-4 font-semibold">نوع الزيارة</th>
                <th className="py-3 px-4 font-semibold">تاريخ وفترة الموعد</th>
                <th className="py-3 px-4 font-semibold">الحالة</th>
                <th className="py-3 px-4 font-semibold">الملاحظات</th>
                <th className="py-3 px-4 font-semibold text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2EAF0]">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[#667788]">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto text-[#064B82] mb-2" />
                    جاري تحميل الحجوزات...
                  </td>
                </tr>
              ) : bookings.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[#667788]">
                    لا توجد أي نتائج مطابقة للشروط المحددة
                  </td>
                </tr>
              ) : (
                bookings.map((b) => (
                  <tr key={b.id} className="hover:bg-blue-50/30 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-[#17354F]">
                      {b.patientName}
                      <span className="block text-[10px] text-gray-400 font-normal">
                        سجل: {new Date(b.createdAt).toLocaleDateString('ar-YE')}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-gray-700" dir="ltr">
                      {b.phone}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-gray-800">{b.visitType}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-[#064B82] block">{b.preferredDate}</span>
                      <span className="text-[10px] text-gray-500">
                        {b.preferredShift === 'morning' ? 'صباحي (9:00 ص – 2:00 ظ)' : 'مسائي (5:00 ع – 9:00 م)'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <select
                        value={b.status}
                        onChange={(e) => handleQuickStatus(b.id, e.target.value)}
                        className="text-[11px] font-bold py-1 px-2 rounded-lg border border-gray-200 bg-white cursor-pointer focus:outline-none focus:ring-1 focus:ring-blue-500"
                      >
                        <option value="new">جديد</option>
                        <option value="contacted">تم التواصل</option>
                        <option value="confirmed">مؤكد</option>
                        <option value="completed">مكتمل</option>
                        <option value="cancelled">ملغي</option>
                        <option value="no_show">لم يحضر</option>
                      </select>
                    </td>
                    <td className="py-3.5 px-4 max-w-xs">
                      {b.notes ? (
                        <p className="text-[11px] text-gray-600 line-clamp-2">{b.notes}</p>
                      ) : (
                        <span className="text-[10px] text-gray-400">لا توجد ملاحظات</span>
                      )}
                      {b.adminNotes && (
                        <p className="text-[10px] text-blue-700 bg-blue-50 p-1 rounded mt-1 font-medium line-clamp-1">
                          إدارة: {b.adminNotes}
                        </p>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="inline-flex items-center gap-1">
                        {/* WhatsApp Contact */}
                        <a
                          href={`https://wa.me/967${b.phone}?text=${encodeURIComponent(
                            `مرحبًا أخي/أختي ${b.patientName}، نتواصل معكم من عيادة د. عبدالباسط عبده الحاج مقبل بخصوص موعدكم المحجوز يوم ${b.preferredDate}.`
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors"
                          title="مراسلة واتساب"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                        </a>

                        {/* Phone Call */}
                        <a
                          href={`tel:${b.phone}`}
                          className="p-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors"
                          title="اتصال هاتفي"
                        >
                          <Phone className="w-3.5 h-3.5" />
                        </a>

                        {/* Edit */}
                        <button
                          onClick={() => openEditModal(b)}
                          className="p-1.5 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                          title="تعديل الحجز"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>

                        {/* Delete */}
                        <button
                          onClick={() => handleDelete(b.id, b.patientName)}
                          className="p-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors"
                          title="حذف إلى سلة المحذوفات"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-[#E2EAF0] flex items-center justify-between text-xs text-[#667788]">
            <span>
              الصفحة {page} من أصل {totalPages} صفحات
            </span>
            <div className="flex gap-1.5">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="py-1 px-3 rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50"
              >
                السابق
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="py-1 px-3 rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50"
              >
                التالي
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal: Add / Edit Booking */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-[#E2EAF0] max-w-lg w-full max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-[#E2EAF0] flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#064B82]">
                {selectedBooking ? 'تعديل بيانات الحجز والموعد' : 'إضافة حجز يدوي جديد'}
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveBooking} className="p-5 overflow-y-auto space-y-4 flex-1 custom-scrollbar text-right">
              <div>
                <label className="block text-xs font-bold text-[#17354F] mb-1">اسم المريض *</label>
                <input
                  type="text"
                  required
                  value={formData.patientName}
                  onChange={(e) => setFormData({ ...formData, patientName: e.target.value })}
                  placeholder="الاسم الرباعي للمريض"
                  className="w-full py-2.5 px-3 bg-[#F8FAFC] border border-[#E2EAF0] rounded-xl text-xs focus:ring-2 focus:ring-[#0B70B7] text-right"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#17354F] mb-1">رقم الهاتف أو الواتساب *</label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="777XXXXXX"
                  className="w-full py-2.5 px-3 bg-[#F8FAFC] border border-[#E2EAF0] rounded-xl text-xs focus:ring-2 focus:ring-[#0B70B7] text-right"
                  dir="ltr"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#17354F] mb-1">نوع الزيارة</label>
                  <select
                    value={formData.visitType}
                    onChange={(e) => setFormData({ ...formData, visitType: e.target.value })}
                    className="w-full py-2 px-3 bg-[#F8FAFC] border border-[#E2EAF0] rounded-xl text-xs"
                  >
                    <option value="كشف جديد">كشف واستشارة جديدة</option>
                    <option value="متابعة نتائج وفحوصات">متابعة نتائج وفحوصات</option>
                    <option value="منظار تشخيصي">منظار معدة أو قولون</option>
                    <option value="مراجعة دورية">مراجعة دورية</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#17354F] mb-1">الحالة الحالية</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full py-2 px-3 bg-[#F8FAFC] border border-[#E2EAF0] rounded-xl text-xs font-bold text-[#064B82]"
                  >
                    <option value="new">جديد (غير مؤكد)</option>
                    <option value="contacted">تم التواصل هاتفيًا/واتساب</option>
                    <option value="confirmed">مؤكد ومثبت بالجدول</option>
                    <option value="completed">تم الكشف (مكتمل)</option>
                    <option value="cancelled">ملغي</option>
                    <option value="no_show">لم يحضر</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#17354F] mb-1">التاريخ المطلوب</label>
                  <input
                    type="date"
                    required
                    value={formData.preferredDate}
                    onChange={(e) => setFormData({ ...formData, preferredDate: e.target.value })}
                    className="w-full py-2 px-3 bg-[#F8FAFC] border border-[#E2EAF0] rounded-xl text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#17354F] mb-1">فترة الدوام</label>
                  <select
                    value={formData.preferredShift}
                    onChange={(e) => setFormData({ ...formData, preferredShift: e.target.value })}
                    className="w-full py-2 px-3 bg-[#F8FAFC] border border-[#E2EAF0] rounded-xl text-xs"
                  >
                    <option value="morning">صباحي (9:00 ص – 2:00 ظ)</option>
                    <option value="evening">مسائي (5:00 ع – 9:00 م)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#17354F] mb-1">وصف الحالة / شكوى المريض</label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="حرقة بالمعدة، حموضة، ألم، إمساك..."
                  className="w-full py-2 px-3 bg-[#F8FAFC] border border-[#E2EAF0] rounded-xl text-xs focus:ring-2 focus:ring-[#0B70B7]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#064B82] mb-1">ملاحظات داخلية لفريق العيادة</label>
                <textarea
                  rows={2}
                  value={formData.adminNotes}
                  onChange={(e) => setFormData({ ...formData, adminNotes: e.target.value })}
                  placeholder="ملاحظات الاستقبال (مثال: تم إرسال إرشادات الصيام، موعد مؤكد الساعة 10:30 صباحًا)..."
                  className="w-full py-2 px-3 bg-blue-50/50 border border-blue-200 rounded-xl text-xs focus:ring-2 focus:ring-[#0B70B7]"
                />
              </div>

              <div className="pt-3 border-t border-[#E2EAF0] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="py-2 px-4 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-100"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="py-2 px-5 rounded-xl bg-[#064B82] hover:bg-[#0B70B7] text-white text-xs font-bold shadow-xs cursor-pointer"
                >
                  حفظ الحجز
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
