import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  ShieldCheck,
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  Stethoscope,
  AlertCircle,
  Loader2,
} from 'lucide-react';

interface AdminLoginProps {
  onBackToSite: () => void;
  onLoginSuccess: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onBackToSite, onLoginSuccess }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('يرجى كتابة البريد الإلكتروني وكلمة المرور');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await login(email, password);
      onLoginSuccess();
    } catch (err: any) {
      setError(err.message || 'فشل تسجيل الدخول، يرجى التأكد من البريد الإلكتروني وكلمة المرور');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F8FB] flex flex-col justify-center items-center p-4 sm:p-6 text-[#17354F] font-sans antialiased selection:bg-[#55A630] selection:text-white" dir="rtl">
      
      {/* Back button */}
      <div className="w-full max-w-md mb-4 flex justify-between items-center">
        <button
          onClick={onBackToSite}
          className="inline-flex items-center gap-2 text-sm font-semibold text-[#0B70B7] hover:text-[#064B82] transition-colors py-2 px-3 rounded-lg hover:bg-white/60 cursor-pointer"
        >
          <ArrowRight className="w-4 h-4" />
          العودة إلى الموقع العام للعيادة
        </button>
        <span className="text-xs text-[#667788] bg-white/80 px-2.5 py-1 rounded-full border border-[#E2EAF0]">
          بوابة الإدارة الطبية
        </span>
      </div>

      {/* Main Login Card */}
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl shadow-blue-950/5 border border-[#E2EAF0] p-6 sm:p-8">
        
        {/* Header Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#064B82] to-[#0B70B7] text-white shadow-lg shadow-blue-900/20 mb-4">
            <Stethoscope className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-[#064B82] tracking-tight">
            لوحة التحكم الإدارية
          </h1>
          <p className="text-sm text-[#667788] mt-1.5">
            عيادة د. عبدالباسط عبده الحاج مقبل
          </p>
          <p className="text-xs text-[#55A630] font-medium mt-1 flex items-center justify-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            نظام إدارة محمي ومشفر بصلاحيات الأدوار (RBAC)
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-start gap-3 animate-in fade-in duration-200">
            <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-600 mt-0.5" />
            <p className="leading-relaxed">{error}</p>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#17354F] mb-1.5">
              البريد الإلكتروني المهني
            </label>
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="doctor@clinic.com"
                required
                className="w-full pr-10 pl-4 py-3 rounded-xl border border-[#E2EAF0] bg-[#F8FAFC] text-sm text-[#17354F] focus:outline-none focus:ring-2 focus:ring-[#0B70B7] focus:border-transparent transition-all"
                dir="ltr"
              />
              <Mail className="w-4 h-4 text-[#667788] absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#17354F] mb-1.5">
              كلمة المرور
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                required
                className="w-full pr-10 pl-10 py-3 rounded-xl border border-[#E2EAF0] bg-[#F8FAFC] text-sm text-[#17354F] focus:outline-none focus:ring-2 focus:ring-[#0B70B7] focus:border-transparent transition-all"
                dir="ltr"
              />
              <Lock className="w-4 h-4 text-[#667788] absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#667788] hover:text-[#17354F] transition-colors cursor-pointer"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 py-3.5 px-4 rounded-xl bg-[#064B82] hover:bg-[#0B70B7] text-white font-semibold text-sm shadow-lg shadow-blue-900/15 flex items-center justify-center gap-2 transition-all duration-200 disabled:opacity-70 cursor-pointer"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                جاري التحقق والدخول...
              </>
            ) : (
              <>
                <Lock className="w-4 h-4" />
                تسجيل الدخول إلى لوحة التحكم
              </>
            )}
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-[#E2EAF0]">
          <p className="text-xs text-[#064B82] font-semibold mb-2 text-center">
            بيانات الدخول الإدارية المعتمدة:
          </p>
          <div className="space-y-1.5 text-xs text-[#526b83] bg-[#F4F8FB] p-3 rounded-xl border border-[#E2EAF0]">
            <div className="flex items-center justify-between">
              <span className="font-medium text-[#17354F]">المدير العام (Super Admin):</span>
              <button
                type="button"
                onClick={() => {
                  setEmail('admin@clinic.com');
                  setPassword('admin123456');
                }}
                className="text-[#0B70B7] hover:underline font-semibold cursor-pointer"
              >
                تعبئة تلقائية
              </button>
            </div>
            <p className="font-mono text-[11px] text-slate-600 dir-ltr text-left">
              admin@clinic.com / admin123456
            </p>
            <div className="pt-2 border-t border-[#E2EAF0] flex items-center justify-between">
              <span className="font-medium text-[#17354F]">إدارة العيادة (Admin):</span>
              <button
                type="button"
                onClick={() => {
                  setEmail('manager@clinic.com');
                  setPassword('manager123456');
                }}
                className="text-[#0B70B7] hover:underline font-semibold cursor-pointer"
              >
                تعبئة تلقائية
              </button>
            </div>
            <p className="font-mono text-[11px] text-slate-600 dir-ltr text-left">
              manager@clinic.com / manager123456
            </p>
          </div>
          <p className="text-[11px] text-[#8899A6] mt-3 text-center leading-relaxed">
            يتم تسجيل كافة محاولات الدخول وحمايتها بنظام تشفير كلمات المرور ومنع الهجمات التخمينية.
          </p>
        </div>

      </div>

      {/* Footer info */}
      <p className="text-xs text-[#667788] mt-6 text-center">
        نظام إدارة عيادة د. عبدالباسط مقبل © 2026 — مصادقة وحماية قاعدة البيانات
      </p>
    </div>
  );
};
