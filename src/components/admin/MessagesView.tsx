import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import {
  Mail,
  Trash2,
  Eye,
  MessageSquare,
  Phone,
  RefreshCw,
  X,
  Clock,
  User,
  CheckCircle2,
} from 'lucide-react';

interface MessagesViewProps {
  showToast: (type: 'success' | 'error' | 'info', text: string) => void;
}

export const MessagesView: React.FC<MessagesViewProps> = ({ showToast }) => {
  const [messages, setMessages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState<any | null>(null);
  const [filter, setFilter] = useState('all');

  const fetchMessages = async () => {
    try {
      const data = await api.getMessages();
      setMessages(data || []);
    } catch (err: any) {
      showToast('error', err.message || 'فشل تحميل الرسائل');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const filtered = messages.filter((m) => {
    if (filter === 'all') return true;
    if (filter === 'unread') return m.status === 'unread';
    if (filter === 'read') return m.status === 'read';
    if (filter === 'replied') return m.status === 'replied';
    return true;
  });

  const handleOpenMessage = async (m: any) => {
    setSelectedMessage(m);
    if (m.status === 'unread') {
      try {
        await api.updateMessage(m.id, { status: 'read' });
        setMessages((prev) => prev.map((item) => (item.id === m.id ? { ...item, status: 'read' } : item)));
      } catch {
        // ignore
      }
    }
  };

  const handleMarkReplied = async (id: string) => {
    try {
      await api.updateMessage(id, { status: 'replied' });
      showToast('success', 'تم تحديد الرسالة بأنه تم الرد عليها');
      fetchMessages();
      if (selectedMessage?.id === id) {
        setSelectedMessage((prev: any) => (prev ? { ...prev, status: 'replied' } : null));
      }
    } catch (err: any) {
      showToast('error', err.message || 'فشل تحديث الحالة');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`هل أنت متأكد من حذف رسالة: "${name}"؟`)) return;
    try {
      await api.deleteMessage(id);
      showToast('info', 'تم نقل الرسالة إلى سلة المحذوفات');
      if (selectedMessage?.id === id) setSelectedMessage(null);
      fetchMessages();
    } catch (err: any) {
      showToast('error', err.message || 'فشل الحذف');
    }
  };

  return (
    <div className="space-y-5">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-[#E2EAF0] shadow-sm">
        <div>
          <h2 className="text-sm font-bold text-[#064B82]">رسائل واستفسارات الزوار الواردة</h2>
          <p className="text-xs text-[#667788] mt-0.5">
            الرسائل المرسلة عبر نموذج "تواصل معنا" على الموقع العام
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="py-2 px-3 bg-[#F8FAFC] border border-[#E2EAF0] rounded-xl text-xs font-semibold text-gray-700"
          >
            <option value="all">كافة الرسائل</option>
            <option value="unread">غير مقروءة (جديدة)</option>
            <option value="read">مقروءة</option>
            <option value="replied">تم الرد</option>
          </select>

          <button
            onClick={fetchMessages}
            className="p-2 text-gray-500 hover:text-[#064B82] hover:bg-gray-100 rounded-xl transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Messages List */}
      {isLoading ? (
        <div className="p-12 text-center text-[#667788]">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto text-[#064B82] mb-2" />
          جاري تحميل الرسائل...
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-12 text-center text-[#667788] bg-white rounded-2xl border border-[#E2EAF0]">
          لا توجد رسائل مطابقة لهذا التصنيف
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((m) => (
            <div
              key={m.id}
              onClick={() => handleOpenMessage(m)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start justify-between gap-4 ${
                m.status === 'unread'
                  ? 'bg-blue-50/40 border-blue-200 hover:border-blue-300'
                  : 'bg-white border-[#E2EAF0] hover:border-gray-300'
              }`}
            >
              <div className="space-y-1 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[#17354F]">{m.name}</span>
                  {m.status === 'unread' && (
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                      جديدة
                    </span>
                  )}
                  {m.status === 'replied' && (
                    <span className="text-[10px] bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded-full">
                      تم الرد
                    </span>
                  )}
                  <span className="text-[10px] text-gray-400 mr-auto" dir="ltr">
                    {m.phone}
                  </span>
                </div>

                <p className="text-xs font-semibold text-[#064B82]">{m.subject}</p>
                <p className="text-xs text-[#667788] line-clamp-2 leading-relaxed">{m.message}</p>

                <span className="text-[10px] text-gray-400 block pt-1">
                  {new Date(m.createdAt).toLocaleString('ar-YE')}
                </span>
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(m.id, m.name);
                  }}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50"
                  title="حذف الرسالة"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Message Reader Modal */}
      {selectedMessage && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-[#E2EAF0] max-w-lg w-full p-5 space-y-4 animate-in fade-in zoom-in-95 text-right">
            <div className="flex items-center justify-between border-b border-[#E2EAF0] pb-3">
              <div>
                <h3 className="text-sm font-bold text-[#064B82]">{selectedMessage.subject}</h3>
                <span className="text-[10px] text-gray-400">
                  {new Date(selectedMessage.createdAt).toLocaleString('ar-YE')}
                </span>
              </div>
              <button
                onClick={() => setSelectedMessage(null)}
                className="p-1 text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-[#F8FAFC] p-3 rounded-xl space-y-1 text-xs text-gray-700">
              <div className="flex justify-between">
                <span className="font-bold text-[#17354F]">المرسل:</span>
                <span>{selectedMessage.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-bold text-[#17354F]">الهاتف:</span>
                <span dir="ltr">{selectedMessage.phone}</span>
              </div>
              {selectedMessage.email && (
                <div className="flex justify-between">
                  <span className="font-bold text-[#17354F]">البريد:</span>
                  <span dir="ltr">{selectedMessage.email}</span>
                </div>
              )}
            </div>

            <div>
              <p className="text-xs font-bold text-[#17354F] mb-1.5">نص الرسالة والاستفسار:</p>
              <div className="p-3 rounded-xl bg-gray-50 border border-gray-100 text-xs leading-relaxed text-gray-800 whitespace-pre-wrap">
                {selectedMessage.message}
              </div>
            </div>

            <div className="pt-3 border-t border-[#E2EAF0] flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <a
                  href={`https://wa.me/967${selectedMessage.phone}?text=${encodeURIComponent(
                    `مرحبًا أخي/أختي ${selectedMessage.name}، نتواصل معكم من عيادة د. عبدالباسط مقبل بخصوص استفساركم: "${selectedMessage.subject}".`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-1.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  رد عبر واتساب
                </a>

                <a
                  href={`tel:${selectedMessage.phone}`}
                  className="py-1.5 px-3 bg-[#064B82] hover:bg-[#0B70B7] text-white rounded-xl text-xs font-bold flex items-center gap-1.5"
                >
                  <Phone className="w-3.5 h-3.5" />
                  اتصال
                </a>
              </div>

              {selectedMessage.status !== 'replied' && (
                <button
                  type="button"
                  onClick={() => handleMarkReplied(selectedMessage.id)}
                  className="text-xs text-blue-700 hover:underline font-semibold"
                >
                  تحديد كـ "تم الرد"
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
