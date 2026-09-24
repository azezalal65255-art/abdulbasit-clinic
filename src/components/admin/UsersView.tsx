import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
  Users,
  Plus,
  Edit,
  Trash2,
  Shield,
  CheckCircle2,
  X,
  RefreshCw,
  Lock,
  Mail,
  User,
  Phone,
} from 'lucide-react';

interface UsersViewProps {
  showToast: (type: 'success' | 'error' | 'info', text: string) => void;
}

export const UsersView: React.FC<UsersViewProps> = ({ showToast }) => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'receptionist',
    phone: '',
    isActive: true,
  });

  const fetchUsers = async () => {
    try {
      const list = await api.getUsers();
      setUsers(list || []);
    } catch (err: any) {
      showToast('error', err.message || 'فشل تحميل قائمة المستخدمين');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const openNewModal = () => {
    setSelectedUser(null);
    setFormData({
      name: '',
      email: '',
      password: '',
      role: 'receptionist',
      phone: '',
      isActive: true,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (u: any) => {
    setSelectedUser(u);
    setFormData({
      name: u.name || '',
      email: u.email || '',
      password: '',
      role: u.role || 'receptionist',
      phone: u.phone || '',
      isActive: u.isActive !== false,
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email) {
      showToast('error', 'الاسم والبريد الإلكتروني مطلوبان');
      return;
    }

    if (!selectedUser && !formData.password) {
      showToast('error', 'كلمة المرور مطلوبة للمستخدم الجديد');
      return;
    }

    try {
      if (selectedUser) {
        await api.updateUser(selectedUser.id, formData);
        showToast('success', 'تم تعديل بيانات المستخدم بنجاح');
      } else {
        await api.createUser(formData);
        showToast('success', 'تم إنشاء حساب المستخدم بنجاح');
      }
      setIsModalOpen(false);
      fetchUsers();
    } catch (err: any) {
      showToast('error', err.message || 'فشل حفظ المستخدم');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (id === currentUser?.id) {
      showToast('error', 'لا يمكنك حذف حسابك الشخصي الحالي');
      return;
    }
    if (!window.confirm(`هل أنت متأكد من حذف حساب: "${name}"؟`)) return;

    try {
      await api.deleteUser(id);
      showToast('info', 'تم حذف حساب المستخدم بنجاح');
      fetchUsers();
    } catch (err: any) {
      showToast('error', err.message || 'فشل الحذف');
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'super_admin':
        return <span className="bg-rose-50 text-rose-700 px-2.5 py-0.5 rounded-full text-xs font-bold border border-rose-100">مدير عام (Super Admin)</span>;
      case 'admin':
        return <span className="bg-blue-50 text-[#064B82] px-2.5 py-0.5 rounded-full text-xs font-bold border border-blue-100">إدارة العيادة (Admin)</span>;
      case 'receptionist':
        return <span className="bg-emerald-50 text-emerald-800 px-2.5 py-0.5 rounded-full text-xs font-bold border border-emerald-100">الاستقبال والمواعيد</span>;
      case 'content_manager':
        return <span className="bg-purple-50 text-purple-800 px-2.5 py-0.5 rounded-full text-xs font-bold border border-purple-100">مسؤول المحتوى الطبي</span>;
      default:
        return <span className="bg-gray-100 text-gray-700 px-2.5 py-0.5 rounded-full text-xs">{role}</span>;
    }
  };

  return (
    <div className="space-y-5">
      {/* Top Header */}
      <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-[#E2EAF0] shadow-sm">
        <div>
          <h2 className="text-sm font-bold text-[#064B82]">إدارة المستخدمين وصلاحيات الأدوار (RBAC)</h2>
          <p className="text-xs text-[#667788] mt-0.5">
            تحديد من يمكنه الدخول وإدارة الحجوزات والمحتوى والإعدادات بصلاحيات محددة
          </p>
        </div>
        <button
          onClick={openNewModal}
          className="inline-flex items-center gap-1.5 py-2 px-4 bg-[#064B82] hover:bg-[#0B70B7] text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          إضافة مستخدم جديد
        </button>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-[#E2EAF0] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-[#F8FAFC] text-[#667788] border-b border-[#E2EAF0]">
              <tr>
                <th className="py-3 px-4 font-semibold">المستخدم</th>
                <th className="py-3 px-4 font-semibold">البريد الإلكتروني</th>
                <th className="py-3 px-4 font-semibold">الدور والصلاحية</th>
                <th className="py-3 px-4 font-semibold">رقم الهاتف</th>
                <th className="py-3 px-4 font-semibold">تاريخ الإنشاء</th>
                <th className="py-3 px-4 font-semibold text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2EAF0]">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-[#667788]">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto text-[#064B82] mb-2" />
                    جاري تحميل المستخدمين...
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id} className="hover:bg-blue-50/30 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-[#17354F] flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-[#064B82] text-white font-bold text-xs flex items-center justify-center">
                        {u.name?.charAt(0) || 'م'}
                      </div>
                      <span>{u.name}</span>
                      {u.id === currentUser?.id && (
                        <span className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">
                          (حسابك)
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-gray-700" dir="ltr">
                      {u.email}
                    </td>
                    <td className="py-3.5 px-4">
                      {getRoleBadge(u.role)}
                    </td>
                    <td className="py-3.5 px-4 text-gray-500" dir="ltr">
                      {u.phone || '—'}
                    </td>
                    <td className="py-3.5 px-4 text-gray-400">
                      {u.createdAt ? new Date(u.createdAt).toLocaleDateString('ar-YE') : '—'}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="inline-flex items-center gap-1">
                        <button
                          onClick={() => openEditModal(u)}
                          className="p-1.5 rounded-lg bg-blue-50 text-[#064B82] hover:bg-blue-100"
                          title="تعديل المستخدم"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        {u.id !== currentUser?.id && (
                          <button
                            onClick={() => handleDelete(u.id, u.name)}
                            className="p-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100"
                            title="حذف الحساب"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Add / Edit User */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-[#E2EAF0] max-w-md w-full p-5 space-y-4 animate-in fade-in zoom-in-95 text-right">
            <div className="flex items-center justify-between border-b border-[#E2EAF0] pb-3">
              <h3 className="text-sm font-bold text-[#064B82]">
                {selectedUser ? 'تعديل بيانات المستخدم والصلاحيات' : 'إضافة مستخدم جديد للنظام'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-[#17354F] mb-1">الاسم الكامل *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="مثال: منسق المواعيد"
                  className="w-full py-2 px-3 bg-[#F8FAFC] border border-[#E2EAF0] rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#17354F] mb-1">البريد الإلكتروني *</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="user@clinic.com"
                  className="w-full py-2 px-3 bg-[#F8FAFC] border border-[#E2EAF0] rounded-xl text-xs"
                  dir="ltr"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#17354F] mb-1">
                  {selectedUser ? 'تغيير كلمة المرور (اتركها فارغة للإبقاء على الحالية)' : 'كلمة المرور *'}
                </label>
                <input
                  type="password"
                  required={!selectedUser}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="••••••••"
                  className="w-full py-2 px-3 bg-[#F8FAFC] border border-[#E2EAF0] rounded-xl text-xs"
                  dir="ltr"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#17354F] mb-1">الدور والصلاحية (Role)</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full py-2 px-3 bg-[#F8FAFC] border border-[#E2EAF0] rounded-xl text-xs font-bold text-[#064B82]"
                >
                  <option value="super_admin">مدير عام (Super Admin) - صلاحيات كاملة</option>
                  <option value="admin">إدارة العيادة (Admin) - كل شيء عدا إدارة الحسابات</option>
                  <option value="receptionist">الاستقبال والمواعيد (الحجوزات، الرسائل، الجدول)</option>
                  <option value="content_manager">مسؤول المحتوى الطبي (المقالات، الخدمات، الأسئلة)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#17354F] mb-1">رقم الهاتف</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="777XXXXXX"
                  className="w-full py-2 px-3 bg-[#F8FAFC] border border-[#E2EAF0] rounded-xl text-xs"
                  dir="ltr"
                />
              </div>

              <div className="pt-3 border-t border-[#E2EAF0] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="py-2 px-4 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-100"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="py-2 px-5 rounded-xl bg-[#064B82] hover:bg-[#0B70B7] text-white text-xs font-bold"
                >
                  حفظ المستخدم
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
