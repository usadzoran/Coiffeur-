import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  UserPlus,
  Users,
  Megaphone,
  Eye,
  BarChart3,
  Copy,
  Check,
  Trash2,
  Save,
  Lock,
  ArrowRight,
  ExternalLink,
  Plus,
  Code,
  Sparkles,
  RefreshCw,
  Scissors,
  Calendar,
  DollarSign,
  Key,
} from 'lucide-react';
import { Barber, BarberCredential, AdSlot, VisitorStats, Appointment } from '../types/barber';
import {
  addNewBarber,
  deleteBarber,
  getStoredAds,
  updateAdSlot,
  getVisitorStats,
  getStoredCredentials,
  updateBarberCredential,
  safeSessionGet,
  safeSessionSet,
} from '../utils/storage';

interface OwnerPortalProps {
  barbers: Barber[];
  appointments: Appointment[];
  ads: AdSlot[];
  onNotification: (msg: string, type: 'success' | 'warning' | 'info') => void;
  onBackToMainSite: () => void;
}

export const OwnerPortal: React.FC<OwnerPortalProps> = ({
  barbers,
  appointments,
  ads,
  onNotification,
  onBackToMainSite,
}) => {
  const [activeTab, setActiveTab] = useState<'barbers' | 'ads' | 'analytics'>('barbers');
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [copiedBarberId, setCopiedBarberId] = useState<string | null>(null);

  // Security Gate Password for the Owner
  const [isUnlocked, setIsUnlocked] = useState<boolean>(() => {
    return safeSessionGet('owner_portal_unlocked') === 'true';
  });
  const [adminPasswordInput, setAdminPasswordInput] = useState<string>('');
  const [passwordError, setPasswordError] = useState<string>('');

  // Add Barber Form State
  const [name, setName] = useState<string>('');
  const [title, setTitle] = useState<string>('حلاق محترف وتصفيف عصري');
  const [experienceYears, setExperienceYears] = useState<number>(5);
  const [chairNumber, setChairNumber] = useState<number>(barbers.length + 1);
  const [bio, setBio] = useState<string>('');
  const [startTime, setStartTime] = useState<string>('10:00');
  const [endTime, setEndTime] = useState<string>('22:00');
  const [specialtiesText, setSpecialtiesText] = useState<string>('قصات حديثة, تحديد لحية, سشوار');
  const [imageUrl, setImageUrl] = useState<string>(barbers[0]?.image || '');
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');

  // Ads Editing State
  const [adList, setAdList] = useState<AdSlot[]>(ads);
  const [editingAdId, setEditingAdId] = useState<string>('ad-top');

  // Visitor Stats State
  const [visitorStats, setVisitorStats] = useState<VisitorStats>(getVisitorStats());
  const [credentials, setCredentials] = useState<BarberCredential[]>(getStoredCredentials());

  useEffect(() => {
    setAdList(getStoredAds());
    setVisitorStats(getVisitorStats());
    setCredentials(getStoredCredentials());
  }, [ads]);

  const privateUrl = `${window.location.origin}${window.location.pathname}#owner-portal`;

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    const ownerCred = credentials.find((c) => c.role === 'owner');
    if (ownerCred && adminPasswordInput.trim() === ownerCred.password) {
      setIsUnlocked(true);
      safeSessionSet('owner_portal_unlocked', 'true');
      setPasswordError('');
      onNotification('مرحباً بك في واجهة إدارة صاحب الصالون!', 'success');
    } else {
      setPasswordError('بيانات الدخول غير صحيحة. استخدم حساب Firebase الخاص بالمالك.');
    }
  };

  const handleCopyPrivateLink = () => {
    navigator.clipboard.writeText(privateUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
    onNotification('تم نسخ الرابط الخاص بصاحب الموقع! يمكنك حفظه في المفضلة.', 'success');
  };

  // Add Barber Submit
  const handleAddBarberSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      onNotification('يرجى إدخال اسم الحلاق الجديد', 'warning');
      return;
    }
    if (!username.trim() || !password.trim()) {
      onNotification('يرجى تزويد الحلاق باسم مستخدم وكلمة مرور للدخول', 'warning');
      return;
    }

    const specialties = specialtiesText
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    addNewBarber(
      {
        name: name.trim(),
        title: title.trim(),
        experienceYears: Number(experienceYears) || 3,
        chairNumber: Number(chairNumber) || barbers.length + 1,
        bio: bio.trim() || `حلاق محترف في صالون المقص الذهبي بخبرة ${experienceYears} سنوات.`,
        rating: 5.0,
        reviewsCount: 12,
        image: imageUrl.trim(),
        workingHours: {
          start: startTime,
          end: endTime,
          daysOff: [1],
        },
        specialties: specialties.length ? specialties : ['قص شعر كلاسيكي', 'تحديد لحية'],
      },
      {
        username: username.trim(),
        password: password.trim(),
      }
    );

    onNotification(`تمت إضافة الحلاق (${name}) بنجاح وتجهيز حسابه بمعلومات الدخول!`, 'success');
    // Reset Form
    setName('');
    setUsername('');
    setPassword('');
    setBio('');
    setChairNumber(barbers.length + 2);
  };

  const handleDeleteBarber = (barberId: string, barberName: string) => {
    if (window.confirm(`هل أنت متأكد من حذف الحلاق (${barberName}) وإلغاء حسابه؟`)) {
      deleteBarber(barberId);
      onNotification(`تم حذف الحلاق (${barberName}) وبيانات دخوله من النظام.`, 'info');
    }
  };

  const handleCopyBarberInvite = (barber: Barber, cred?: BarberCredential) => {
    const barberUsername = cred?.username || barber.name.split(' ')[0].toLowerCase();
    const barberPassword = cred?.password || '123456';
    const text = `مرحباً ${barber.name}، تم تسجيلك رسمياً كحلاق في صالون المقص الذهبي (كرسي #${barber.chairNumber}).\n\nإليك معلومات دخولك لمراجعة المواعيد وقبولها:\n🔗 رابط الصالون: ${window.location.origin}${window.location.pathname}\n👤 اسم المستخدم: ${barberUsername}\n🔑 كلمة السر: ${barberPassword}\n\nنتمنى لك التوفيق!`;
    navigator.clipboard.writeText(text);
    setCopiedBarberId(barber.id);
    setTimeout(() => setCopiedBarberId(null), 2500);
    onNotification(`تم نسخ رسالة معلومات الدخول لـ ${barber.name} لإرسالها له عبر واتساب!`, 'info');
  };

  // Ads Handlers
  const handleSaveAd = (ad: AdSlot) => {
    updateAdSlot(ad.id, ad.htmlContent, ad.enabled);
    onNotification(`تم تحديث وحفظ (${ad.title}) وسيظهر على الموقع فوراً!`, 'success');
  };

  const handleAdHtmlChange = (id: string, html: string) => {
    setAdList((prev) => prev.map((a) => (a.id === id ? { ...a, htmlContent: html } : a)));
  };

  const handleAdToggle = (id: string, enabled: boolean) => {
    setAdList((prev) => prev.map((a) => (a.id === id ? { ...a, enabled } : a)));
    const target = adList.find((a) => a.id === id);
    if (target) {
      updateAdSlot(id, target.htmlContent, enabled);
      onNotification(enabled ? 'تم تفعيل الإعلان في الموقع' : 'تم إيقاف عرض الإعلان', 'info');
    }
  };

  const currentEditingAd = adList.find((a) => a.id === editingAdId) || adList[0];

  // If locked, render lock gate
  if (!isUnlocked) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-3xl p-8 shadow-2xl space-y-6 text-center">
          <div className="w-16 h-16 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center justify-center text-amber-500 mx-auto">
            <Lock className="w-8 h-8" />
          </div>

          <div>
            <h2 className="text-2xl font-extrabold text-white">الرابط الخاص بصاحب الموقع</h2>
            <p className="text-xs text-neutral-400 mt-2">
              هذه الواجهة مخصصة لمالك الصالون فقط لإضافة الحلاقين، إعطائهم بيانات الدخول، إدارة الإعلانات ومتابعة الزوار.
            </p>
          </div>

          {passwordError && (
            <div className="p-3 bg-red-950/40 border border-red-800 text-red-300 text-xs rounded-xl">
              {passwordError}
            </div>
          )}

          <form onSubmit={handleUnlock} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-neutral-300 mb-1.5 text-right">
                كلمة سر المالك للدخول:
              </label>
              <input
                type="password"
                placeholder="أدخل كلمة مرور Firebase"
                value={adminPasswordInput}
                onChange={(e) => setAdminPasswordInput(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500 font-mono text-left"
                autoFocus
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-neutral-950 text-sm font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              <Lock className="w-4 h-4" />
              <span>فتح واجهة صاحب الصالون</span>
            </button>
          </form>

          <div className="pt-4 border-t border-neutral-800/80">
            <button
              onClick={onBackToMainSite}
              className="text-xs text-neutral-400 hover:text-white transition-colors inline-flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowRight className="w-3.5 h-3.5" />
              <span>العودة للموقع العام للصالون</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Private Route Notice & Secret URL Banner */}
        <div className="bg-gradient-to-r from-neutral-900 via-neutral-900 to-amber-950/20 border border-amber-500/30 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/40 flex items-center justify-center text-amber-500 shrink-0">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-extrabold text-white">
                    واجهة صاحب الموقع (الرابط الخاص المنفصل)
                  </h1>
                  <span className="text-[11px] bg-amber-500 text-neutral-950 font-bold px-2 py-0.5 rounded-md">
                    صلاحية المالك
                  </span>
                </div>
                <p className="text-xs text-neutral-400 mt-1">
                  لوحة تحكم حصرية لإضافة الحلاقين وتزويدهم ببيانات الدخول، إدارة إعلانات HTML، ومتابعة عداد الزوار.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyPrivateLink}
                className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 border border-amber-500/40 text-amber-300 text-xs font-semibold rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow-sm"
              >
                {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span>{copiedLink ? 'تم نسخ الرابط الخاص!' : 'نسخ الرابط الخاص للوصول المباشر'}</span>
              </button>

              <button
                onClick={onBackToMainSite}
                className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowRight className="w-4 h-4" />
                <span>زيارة الموقع العام</span>
              </button>
            </div>
          </div>

          {/* Direct URL Display Box */}
          <div className="bg-neutral-950/80 border border-neutral-800 rounded-xl p-3 flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 truncate">
              <span className="text-neutral-500 font-semibold shrink-0">الرابط الخاص بك:</span>
              <span className="font-mono text-amber-400/90 truncate dir-ltr">{privateUrl}</span>
            </div>
            <span className="text-[11px] text-neutral-400 shrink-0">
              احفظ هذا الرابط في المفضلة للرجوع إلى لوحتك في أي وقت
            </span>
          </div>
        </div>

        {/* 3 Main Sections Navigation Tabs */}
        <div className="flex items-center gap-2 bg-neutral-900/90 border border-neutral-800 p-1.5 rounded-2xl">
          <button
            onClick={() => setActiveTab('barbers')}
            className={`flex-1 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'barbers'
                ? 'bg-amber-500 text-neutral-950 shadow-md'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>إضافة وإدارة الحلاقين ({barbers.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('ads')}
            className={`flex-1 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'ads'
                ? 'bg-amber-500 text-neutral-950 shadow-md'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Megaphone className="w-4 h-4" />
            <span>مساحات الإعلانات (HTML)</span>
          </button>

          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex-1 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'analytics'
                ? 'bg-amber-500 text-neutral-950 shadow-md'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>عدد الزوار والإحصائيات ({visitorStats.totalVisits} زيارة)</span>
          </button>
        </div>

        {/* ============================================================== */}
        {/* TAB 1: BARBERS MANAGEMENT & CREDENTIALS PROVISIONING           */}
        {/* ============================================================== */}
        {activeTab === 'barbers' && (
          <div className="space-y-8">
            {/* Add New Barber Box */}
            <div className="bg-neutral-900/80 border border-neutral-800 rounded-3xl p-6 sm:p-8 space-y-6">
              <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500">
                    <UserPlus className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">إضافة حلاق جديد وتعيين حسابه</h3>
                    <p className="text-xs text-neutral-400">
                      أدخل بيانات الحلاق وحدد له اسم دخول وكلمة سر ليسجل بها دخوله
                    </p>
                  </div>
                </div>
              </div>

              <form onSubmit={handleAddBarberSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-neutral-300 mb-1.5">
                      اسم الحلاق الكامل *:
                    </label>
                    <input
                      type="text"
                      placeholder="مثلاً: ماجد الشريف"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-neutral-300 mb-1.5">
                      المسمى الوظيفي / التخصص *:
                    </label>
                    <input
                      type="text"
                      placeholder="مثلاً: خبير القصات الكلاسيكية وتصفيف اللحية"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-neutral-300 mb-1.5">
                      رقم الكرسي في الصالون *:
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={20}
                      value={chairNumber}
                      onChange={(e) => setChairNumber(Number(e.target.value))}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-neutral-300 mb-1.5">
                      سنوات الخبرة *:
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={35}
                      value={experienceYears}
                      onChange={(e) => setExperienceYears(Number(e.target.value))}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-neutral-300 mb-1.5">
                      ساعات العمل اليومية *:
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="time"
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white"
                      />
                      <span className="text-xs text-neutral-500">إلى</span>
                      <input
                        type="time"
                        value={endTime}
                        onChange={(e) => setEndTime(e.target.value)}
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-neutral-300 mb-1.5">
                      تخصصات ومهارات (مفصولة بفواصل):
                    </label>
                    <input
                      type="text"
                      placeholder="مثلاً: فيد عالي, شفرة مستقيمة, مساج فروة"
                      value={specialtiesText}
                      onChange={(e) => setSpecialtiesText(e.target.value)}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                {/* Login Credentials to Provide to the Barber */}
                <div className="bg-neutral-950 p-5 rounded-2xl border border-amber-500/30 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
                    <Key className="w-4 h-4" />
                    <span>معلومات تسجيل الدخول التي ستوفرها لهذا الحلاق:</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] text-neutral-400 mb-1">
                        اسم المستخدم للحلاق (Username) *:
                      </label>
                      <input
                        type="text"
                        dir="ltr"
                        placeholder="مثلاً: majed"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-2 text-xs sm:text-sm text-white text-left font-mono focus:outline-none focus:border-amber-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] text-neutral-400 mb-1">
                        كلمة السر (Password) *:
                      </label>
                      <input
                        type="text"
                        dir="ltr"
                        placeholder="مثلاً: majed123"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-2 text-xs sm:text-sm text-amber-400 text-left font-mono focus:outline-none focus:border-amber-500"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs sm:text-sm font-bold rounded-xl transition-all shadow-md flex items-center gap-2 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>إضافة الحلاق وتجهيز حسابه</span>
                  </button>
                </div>
              </form>
            </div>

            {/* Existing Barbers Cards & Give Credentials */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span>الحلاقون المسجلون حالياً في الصالون</span>
                  <span className="text-xs bg-neutral-800 text-amber-400 px-2 py-0.5 rounded-md font-mono">
                    {barbers.length} حلاقين
                  </span>
                </h3>
                <span className="text-xs text-neutral-400">
                  يمكنك نسخ معلومات الدخول لكل حلاق وإرسالها له عبر واتساب
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {barbers.map((barber) => {
                  const cred = credentials.find((c) => c.barberId === barber.id);
                  const barberAppts = appointments.filter((a) => a.barberId === barber.id);

                  return (
                    <div
                      key={barber.id}
                      className="bg-neutral-900/80 border border-neutral-800 rounded-2xl p-5 flex flex-col justify-between space-y-4 hover:border-amber-500/40 transition-all shadow-lg"
                    >
                      <div>
                        <div className="flex items-center gap-3 mb-3">
                          <img
                            src={barber.image}
                            alt={barber.name}
                            referrerPolicy="no-referrer"
                            className="w-14 h-14 rounded-xl object-cover border border-neutral-700 shrink-0"
                          />
                          <div className="min-w-0">
                            <h4 className="text-base font-bold text-white truncate">{barber.name}</h4>
                            <span className="text-xs text-amber-400 block font-medium">
                              الكرسي #{barber.chairNumber} · {barber.title}
                            </span>
                            <span className="text-[11px] text-neutral-400 block mt-0.5">
                              دوام: {barber.workingHours.start} - {barber.workingHours.end}
                            </span>
                          </div>
                        </div>

                        {/* Credentials Card */}
                        <div className="bg-neutral-950 p-3 rounded-xl border border-neutral-800 space-y-1.5 text-xs">
                          <span className="text-[10px] text-neutral-400 font-semibold block">
                            معلومات الدخول المعطاة للحلاق:
                          </span>
                          <div className="flex items-center justify-between font-mono">
                            <span className="text-neutral-400">المستخدم:</span>
                            <span className="text-white font-bold">{cred?.username || 'غير محدد'}</span>
                          </div>
                          <div className="flex items-center justify-between font-mono">
                            <span className="text-neutral-400">كلمة السر:</span>
                            <span className="text-amber-400 font-bold">{cred?.password || '••••••'}</span>
                          </div>
                        </div>

                        {/* Stats */}
                        <div className="mt-3 flex items-center justify-between text-xs text-neutral-400">
                          <span>{barberAppts.length} مواعيد مسجلة</span>
                          <span>تقييم: {barber.rating} ★</span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="pt-3 border-t border-neutral-800/80 flex items-center justify-between gap-2">
                        <button
                          type="button"
                          onClick={() => handleCopyBarberInvite(barber, cred)}
                          className="flex-1 py-2 px-3 bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                        >
                          {copiedBarberId === barber.id ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-neutral-950" />
                              <span>تم النسخ!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>نسخ معلومات الدخول</span>
                            </>
                          )}
                        </button>

                        {/* Only allow deletion for newly added barbers, keeping at least 1 barber */}
                        {barbers.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleDeleteBarber(barber.id, barber.name)}
                            className="p-2 bg-neutral-800 hover:bg-red-950/60 hover:text-red-400 text-neutral-400 rounded-xl transition-colors cursor-pointer"
                            title="حذف الحلاق"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 2: HTML ADS MANAGEMENT IN MULTIPLE LOCATIONS               */}
        {/* ============================================================== */}
        {activeTab === 'ads' && (
          <div className="space-y-8">
            <div className="bg-neutral-900/80 border border-neutral-800 rounded-3xl p-6 sm:p-8 space-y-6">
              <div>
                <div className="flex items-center gap-2 text-xs font-semibold text-amber-500 uppercase tracking-wider mb-1">
                  <Code className="w-4 h-4" />
                  <span>نظام إدارة الإعلانات المخصصة (Custom HTML Ads)</span>
                </div>
                <h3 className="text-xl font-extrabold text-white">
                  الصق كود HTML لإعلاناتك ليظهر في أماكن متعددة بالموقع
                </h3>
                <p className="text-xs sm:text-sm text-neutral-400 mt-1 max-w-3xl">
                  يمكنك لصق كود HTML خالص، بانرات إعلانية، روابط رعاية، أو إعلانات Google AdSense، وسيتم عرضها مباشرة في المكان المختار على واجهة الصالون للزبائن.
                </p>
              </div>

              {/* Location Selectors */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {adList.map((ad) => {
                  const isSelected = editingAdId === ad.id;
                  return (
                    <button
                      key={ad.id}
                      onClick={() => setEditingAdId(ad.id)}
                      className={`p-4 rounded-2xl border text-right transition-all flex flex-col justify-between cursor-pointer ${
                        isSelected
                          ? 'border-amber-500 bg-amber-500/10 shadow-md ring-1 ring-amber-500/40'
                          : 'border-neutral-800 bg-neutral-950/40 hover:border-neutral-700'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-xs font-bold text-white">{ad.title.split('(')[0]}</span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                              ad.enabled
                                ? 'bg-emerald-500/20 text-emerald-400'
                                : 'bg-neutral-800 text-neutral-500'
                            }`}
                          >
                            {ad.enabled ? 'نشط ومعروض' : 'معطل'}
                          </span>
                        </div>
                        <p className="text-[11px] text-neutral-400 leading-relaxed">{ad.description}</p>
                      </div>

                      <div className="mt-3 pt-2 border-t border-neutral-800/80 text-[10px] text-neutral-500">
                        الموضع: {ad.location}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Editor Box for Selected Ad */}
              <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-6 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-800 pb-3">
                  <div>
                    <h4 className="text-base font-bold text-white">{currentEditingAd.title}</h4>
                    <span className="text-xs text-neutral-400">{currentEditingAd.description}</span>
                  </div>

                  {/* Toggle On/Off */}
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-neutral-300 font-semibold">حالة الإعلان:</span>
                    <button
                      type="button"
                      onClick={() => handleAdToggle(currentEditingAd.id, !currentEditingAd.enabled)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        currentEditingAd.enabled
                          ? 'bg-emerald-500 text-neutral-950'
                          : 'bg-neutral-800 text-neutral-400'
                      }`}
                    >
                      {currentEditingAd.enabled ? 'مفعل (يظهر في الموقع)' : 'معطل (مخفي)'}
                    </button>
                  </div>
                </div>

                {/* HTML Textarea */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-bold text-neutral-300">
                      الصق كود الـ HTML الخاص بك هنا:
                    </label>
                    <span className="text-[11px] text-neutral-500 font-mono">
                      يدعم &lt;div&gt;, &lt;img&gt;, &lt;a&gt;, &lt;style&gt;, &lt;iframe&gt;
                    </span>
                  </div>

                  <textarea
                    rows={7}
                    dir="ltr"
                    value={currentEditingAd.htmlContent}
                    onChange={(e) => handleAdHtmlChange(currentEditingAd.id, e.target.value)}
                    placeholder="<div style='...'>أدخل كود الإعلان هنا</div>"
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl p-4 text-xs font-mono text-amber-300 focus:outline-none focus:border-amber-500 text-left leading-relaxed"
                  />
                </div>

                {/* Live Preview Box */}
                <div className="space-y-2 pt-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-neutral-400">
                    <Eye className="w-3.5 h-3.5 text-amber-500" />
                    <span>معاينة حية لشكل الإعلان كما سيظهر للزبائن:</span>
                  </div>

                  <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-xl min-h-[60px] flex items-center justify-center">
                    {currentEditingAd.htmlContent.trim() ? (
                      <div
                        className="w-full"
                        dangerouslySetInnerHTML={{ __html: currentEditingAd.htmlContent }}
                      />
                    ) : (
                      <span className="text-xs text-neutral-600">لا يوجد كود HTML لمعاينته</span>
                    )}
                  </div>
                </div>

                {/* Action Save */}
                <div className="flex justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => handleSaveAd(currentEditingAd)}
                    className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs sm:text-sm font-bold rounded-xl transition-all shadow-md flex items-center gap-2 cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    <span>حفظ وتطبيق الإعلان في الموقع فوراً</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 3: VISITOR METRICS & SALON ANALYTICS                       */}
        {/* ============================================================== */}
        {activeTab === 'analytics' && (
          <div className="space-y-8">
            {/* KPI Metrics */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-neutral-900/80 border border-neutral-800 rounded-2xl p-6">
                <span className="text-xs font-semibold text-neutral-400 block mb-2">إجمالي عدد الزوار</span>
                <div className="text-3xl sm:text-4xl font-extrabold text-amber-400 tabular-nums">
                  {visitorStats.totalVisits.toLocaleString('ar-SA')}
                </div>
                <span className="text-[11px] text-neutral-500 mt-1 block">إجمالي فتح صفحات الصالون</span>
              </div>

              <div className="bg-neutral-900/80 border border-neutral-800 rounded-2xl p-6">
                <span className="text-xs font-semibold text-neutral-400 block mb-2">زيارات اليوم</span>
                <div className="text-3xl sm:text-4xl font-extrabold text-white tabular-nums">
                  {visitorStats.todayVisits.toLocaleString('ar-SA')}
                </div>
                <span className="text-[11px] text-emerald-400 mt-1 block font-medium">نشاط متزايد اليوم</span>
              </div>

              <div className="bg-neutral-900/80 border border-neutral-800 rounded-2xl p-6">
                <span className="text-xs font-semibold text-neutral-400 block mb-2">الزوار الفريدون</span>
                <div className="text-3xl sm:text-4xl font-extrabold text-white tabular-nums">
                  {visitorStats.uniqueVisitors.toLocaleString('ar-SA')}
                </div>
                <span className="text-[11px] text-neutral-500 mt-1 block">أجهزة ومستخدمون مختلفون</span>
              </div>

              <div className="bg-neutral-900/80 border border-neutral-800 rounded-2xl p-6">
                <span className="text-xs font-semibold text-neutral-400 block mb-2">إجمالي طلبات الحجز</span>
                <div className="text-3xl sm:text-4xl font-extrabold text-amber-500 tabular-nums">
                  {appointments.length}
                </div>
                <span className="text-[11px] text-neutral-500 mt-1 block">موزعة على كافة الحلاقين</span>
              </div>
            </div>

            {/* Daily History Table */}
            <div className="bg-neutral-900/80 border border-neutral-800 rounded-3xl p-6 space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-amber-500" />
                <span>سجل عدد الزيارات في الأيام الأخيرة</span>
              </h3>

              <div className="space-y-3 pt-2">
                {visitorStats.history.map((item, idx) => {
                  const maxCount = Math.max(...visitorStats.history.map((h) => h.count), 1);
                  const percentage = Math.round((item.count / maxCount) * 100);

                  return (
                    <div key={idx} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-neutral-300 font-mono">{item.date}</span>
                        <span className="text-amber-400 font-bold tabular-nums">
                          {item.count} زيارة
                        </span>
                      </div>
                      <div className="w-full h-2.5 bg-neutral-950 rounded-full overflow-hidden border border-neutral-800">
                        <div
                          className="h-full bg-gradient-to-r from-amber-600 to-amber-400 rounded-full transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
