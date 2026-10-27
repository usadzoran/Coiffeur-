import React, { useState } from 'react';
import { X, Key, Save, Copy, Check, Shield, RotateCcw, AlertCircle } from 'lucide-react';
import { BarberCredential } from '../types/barber';
import { getStoredCredentials, updateBarberCredential, DEFAULT_CREDENTIALS, saveCredentials } from '../utils/storage';

interface BarberCredentialsManagerProps {
  isOpen: boolean;
  onClose: () => void;
  onNotification: (msg: string, type: 'success' | 'warning' | 'info') => void;
}

export const BarberCredentialsManager: React.FC<BarberCredentialsManagerProps> = ({
  isOpen,
  onClose,
  onNotification,
}) => {
  const [credentials, setCredentials] = useState<BarberCredential[]>(getStoredCredentials());
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFieldChange = (barberId: string, field: 'username' | 'password', value: string) => {
    setCredentials((prev) =>
      prev.map((c) => (c.barberId === barberId ? { ...c, [field]: value } : c))
    );
  };

  const handleSave = (item: BarberCredential) => {
    if (!item.username.trim() || !item.password.trim()) {
      onNotification('لا يمكن ترك اسم الدخول أو كلمة السر فارغة', 'warning');
      return;
    }
    updateBarberCredential(item.barberId, item.username, item.password);
    onNotification(`تم حفظ وتحديث بيانات دخول الحلاق (${item.barberName}) بنجاح!`, 'success');
  };

  const handleCopyMessage = (item: BarberCredential) => {
    const text = `مرحباً ${item.barberName}، إليك بيانات حسابك في صالون المقص الذهبي لمراجعة وقبول مواعيد الزبائن:\nاسم المستخدم: ${item.username}\nكلمة السر: ${item.password}`;
    navigator.clipboard.writeText(text);
    setCopiedId(item.barberId);
    setTimeout(() => setCopiedId(null), 2500);
    onNotification(`تم نسخ رسالة بيانات الدخول لـ ${item.barberName} في الحافظة لإرسالها له عبر واتساب!`, 'info');
  };

  const handleResetDefaults = () => {
    saveCredentials(DEFAULT_CREDENTIALS);
    setCredentials(DEFAULT_CREDENTIALS);
    onNotification('تمت استعادة أسماء الدخول وكلمات المرور الافتراضية للحلاقين', 'info');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative w-full max-w-2xl bg-neutral-900 border border-neutral-800 rounded-3xl shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 bg-neutral-950/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500">
              <Key className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">إدارة وتوفير بيانات دخول الحلاقين</h3>
              <p className="text-xs text-neutral-400">بصفتك صاحب الصالون، يمكنك تعيين وتغيير كلمات السر وتزويد الحلاقين بها</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          <div className="p-3.5 bg-amber-950/20 border border-amber-800/40 rounded-2xl flex items-start gap-3">
            <Shield className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-200/90 leading-relaxed">
              <strong>تحكم كامل للمالك:</strong> يمكنك تعديل اسم الدخول أو كلمة السر لأي حلاق وحفظها في أي وقت، ثم نسخ بيانات الدخول لإرسالها إليهم مباشرة (عبر واتساب أو رسالة).
            </div>
          </div>

          {/* Credentials List */}
          <div className="space-y-4 max-h-[460px] overflow-y-auto pr-1">
            {credentials.map((cred) => (
              <div
                key={cred.barberId}
                className="p-5 bg-neutral-950 border border-neutral-800 rounded-2xl space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white">{cred.barberName}</span>
                    <span className="text-[11px] bg-neutral-800 text-neutral-300 px-2 py-0.5 rounded-md">
                      {cred.role === 'owner' ? 'صاحب الصالون / المدير' : 'حلاق معتمد'}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleCopyMessage(cred)}
                    className="px-2.5 py-1 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 hover:text-white rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    {copiedId === cred.barberId ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">تم النسخ</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-neutral-400" />
                        <span>نسخ للحلاق</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-neutral-400 mb-1 font-semibold">
                      اسم المستخدم (Username):
                    </label>
                    <input
                      type="text"
                      dir="ltr"
                      value={cred.username}
                      onChange={(e) => handleFieldChange(cred.barberId, 'username', e.target.value)}
                      className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-xs font-mono text-white text-left focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-neutral-400 mb-1 font-semibold">
                      كلمة المرور (Password):
                    </label>
                    <input
                      type="text"
                      dir="ltr"
                      value={cred.password}
                      onChange={(e) => handleFieldChange(cred.barberId, 'password', e.target.value)}
                      className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-xs font-mono text-amber-400 text-left focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    type="button"
                    onClick={() => handleSave(cred)}
                    className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>حفظ بيانات {cred.barberName.split(' ')[0]}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-neutral-800 bg-neutral-950/60 flex items-center justify-between">
          <button
            type="button"
            onClick={handleResetDefaults}
            className="text-xs text-neutral-400 hover:text-white flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>استعادة كلمات المرور الأولية</span>
          </button>

          <button
            onClick={onClose}
            className="px-5 py-2 bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-bold rounded-xl transition-all cursor-pointer"
          >
            تم وإغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
