import React, { useState } from 'react';
import {
  ShieldCheck,
  Check,
  X,
  Clock,
  Calendar,
  User,
  Phone,
  AlertCircle,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Scissors,
  PlusCircle,
  RotateCcw,
  MessageSquare,
  Sparkles,
} from 'lucide-react';
import { Appointment, Barber, Service, AuthSession } from '../types/barber';
import { updateAppointmentStatus, addAppointment, resetToDefaults } from '../utils/storage';
import { Key, LogOut } from 'lucide-react';

interface BarberDashboardProps {
  barbers: Barber[];
  services: Service[];
  appointments: Appointment[];
  activeBarberId: string;
  onSelectBarber: (id: string) => void;
  onNotification: (msg: string, type: 'success' | 'warning' | 'info') => void;
  authSession: AuthSession;
  onOpenCredentialsManager: () => void;
  onLogout: () => void;
}

export const BarberDashboard: React.FC<BarberDashboardProps> = ({
  barbers,
  services,
  appointments,
  activeBarberId,
  onSelectBarber,
  onNotification,
  authSession,
  onOpenCredentialsManager,
  onLogout,
}) => {
  const [filterStatus, setFilterStatus] = useState<string>('pending');
  const [rejectingApptId, setRejectingApptId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState<string>('الوقت محجوز مسبقاً');
  const [customReason, setCustomReason] = useState<string>('');

  const [reschedulingApptId, setReschedulingApptId] = useState<string | null>(null);
  const [newSuggestedTime, setNewSuggestedTime] = useState<string>('18:00');

  const [viewMode, setViewMode] = useState<'cards' | 'calendar'>('cards');

  const isOwner = authSession.role === 'owner';
  const effectiveBarberId = isOwner ? activeBarberId : authSession.barberId;

  const activeBarber = barbers.find((b) => b.id === effectiveBarberId) || barbers[0];

  // Appointments for this specific barber (or all if selected by owner)
  const barberAppointments =
    effectiveBarberId === 'all'
      ? appointments
      : appointments.filter((a) => a.barberId === effectiveBarberId);

  const pendingAppointments = barberAppointments.filter((a) => a.status === 'pending');
  const confirmedAppointments = barberAppointments.filter((a) => a.status === 'confirmed');
  const rejectedAppointments = barberAppointments.filter((a) => a.status === 'rejected');
  const completedAppointments = barberAppointments.filter((a) => a.status === 'completed');

  // Filtered view
  const displayedAppointments =
    filterStatus === 'all'
      ? barberAppointments
      : barberAppointments.filter((a) => a.status === filterStatus);

  // Handle Accept Appointment
  const handleAccept = (appointment: Appointment) => {
    updateAppointmentStatus(appointment.id, 'confirmed');
    onNotification(
      `تم قبول وتأكيد موعد الزبون (${appointment.clientName}) في تمام الساعة ${appointment.time} بنجاح!`,
      'success'
    );
  };

  // Handle Reject Appointment
  const handleConfirmReject = (appointmentId: string) => {
    const finalReason = customReason.trim() ? customReason.trim() : rejectionReason;
    updateAppointmentStatus(appointmentId, 'rejected', { rejectionReason: finalReason });
    setRejectingApptId(null);
    setCustomReason('');
    onNotification('تم الاعتذار عن الموعد وإشعار الزبون بسبب الرفض.', 'warning');
  };

  // Handle Reschedule
  const handleConfirmReschedule = (appointmentId: string) => {
    updateAppointmentStatus(appointmentId, 'rescheduled', { rescheduledTime: newSuggestedTime });
    setReschedulingApptId(null);
    onNotification(`تم إرسال اقتراح التوقيت الجديد (${newSuggestedTime}) للزبون.`, 'info');
  };

  // Quick Action to inject a simulated new booking for this barber
  const handleAddSampleBooking = () => {
    const randomClients = [
      { name: 'محمد الدوسري', phone: '0551122334', notes: 'أرجو العناية بتدرج السوالف واللحية' },
      { name: 'عمر القحطاني', phone: '0509988776', notes: 'موعد سريع قبل صلاة المغرب' },
      { name: 'عبدالعزيز العسيري', phone: '0543322551', notes: 'أول زيارة للصالون بناءً على توصية' },
      { name: 'سلطان الشمري', phone: '0566677889', notes: 'باقة العناية الكاملة VIP' },
    ];
    const pickedClient = randomClients[Math.floor(Math.random() * randomClients.length)];
    const todayStr = new Date().toISOString().split('T')[0];
    const hours = ['14:00', '15:30', '16:30', '17:00', '19:30', '20:00'];
    const pickedHour = hours[Math.floor(Math.random() * hours.length)];
    const randomService = services[Math.floor(Math.random() * services.length)];

    addAppointment({
      barberId: activeBarber.id,
      serviceId: randomService.id,
      clientName: pickedClient.name,
      clientPhone: pickedClient.phone,
      clientNotes: pickedClient.notes,
      date: todayStr,
      time: pickedHour,
      durationMinutes: randomService.durationMinutes,
      totalPrice: randomService.price,
    });

    onNotification(`وصل طلب موعد حلاقة جديد من الزبون (${pickedClient.name})! بانتظار قرارك.`, 'info');
    setFilterStatus('pending');
  };

  // Calendar Day Hours Matrix
  const todayStr = new Date().toISOString().split('T')[0];
  const startHour = parseInt(activeBarber.workingHours.start.split(':')[0], 10) || 10;
  const endHour = parseInt(activeBarber.workingHours.end.split(':')[0], 10) || 22;

  const calendarSlots = [];
  for (let h = startHour; h < endHour; h++) {
    const t = `${String(h).padStart(2, '0')}:00`;
    const appt = barberAppointments.find((a) => a.time === t && a.date === todayStr);
    calendarSlots.push({ time: t, appointment: appt });
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* User Session Banner */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-white">
                  {authSession.barberName}
                </span>
                <span className="text-[11px] bg-neutral-800 text-amber-400 font-mono px-2 py-0.5 rounded-md">
                  @{authSession.username}
                </span>
                <span className="text-[11px] bg-neutral-800 text-neutral-300 px-2 py-0.5 rounded-md">
                  {isOwner ? 'صاحب الصالون (المدير)' : 'حساب حلاق'}
                </span>
              </div>
              <p className="text-xs text-neutral-400 mt-0.5">
                {isOwner
                  ? 'لديك صلاحية التحكم الكاملة: تعيين وتوفير كلمات المرور للحلاقين ومراجعة كافة المواعيد.'
                  : `أنت متصل بحسابك الخاص لمراجعة وقبول أو رفض طلبات مواعيدك.`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {isOwner && (
              <button
                onClick={onOpenCredentialsManager}
                className="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <Key className="w-3.5 h-3.5" />
                <span>إدارة كلمات سر الحلاقين</span>
              </button>
            )}

            <button
              onClick={onLogout}
              className="px-3 py-2 bg-neutral-800 hover:bg-red-950/60 hover:text-red-400 text-neutral-300 text-xs font-semibold rounded-xl border border-neutral-700 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>تسجيل الخروج</span>
            </button>
          </div>
        </div>

        {/* Top Management Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-neutral-800">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-500 uppercase tracking-wider mb-2">
              <ShieldCheck className="w-4 h-4" />
              <span>لوحة قرارات الحلاق المباشرة</span>
              <span aria-hidden="true">·</span>
              <span>قبول · رفض · جدولة المواعيد</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              {isOwner ? 'إدارة مواعيد الحلاقة وكافة الحلاقين' : `مواعيد الحلاق: ${activeBarber.name}`}
            </h1>
            <p className="text-neutral-400 text-sm mt-1">
              {isOwner
                ? 'يمكنك التبديل بين الحلاقين الثلاثة لمتابعة الأداء أو تعيين وتعديل كلمات السر الخاصة بهم.'
                : 'راجع طلبات الزبائن الواردة لكرسيك، وقرر قبول الموعد أو الاعتذار أو اقتراح توقيت بديل.'}
            </p>
          </div>

          {/* Quick Helper Actions */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleAddSampleBooking}
              className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs sm:text-sm font-bold rounded-xl transition-all shadow-md flex items-center gap-2 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>إرسال طلب موعد تجريبي جديد للمراجعة</span>
            </button>

            <button
              onClick={resetToDefaults}
              className="px-3 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white border border-neutral-800 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer"
              title="إعادة تعيين البيانات الافتراضية"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>استعادة البيانات</span>
            </button>
          </div>
        </div>

        {/* 3 Barbers Switcher Bar (Only if Owner, or info badge if Barber) */}
        {isOwner ? (
          <div className="bg-neutral-900/90 border border-neutral-800 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-neutral-400">
                اختر الحلاق لعرض مواعيده واتخاذ القرارات (صلاحية المالك):
              </span>
              <span className="text-xs text-amber-400">
                ٣ حلاقين مسجلين
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              {barbers.map((barber) => {
                const pendingCount = appointments.filter(
                  (a) => a.barberId === barber.id && a.status === 'pending'
                ).length;
                const isSelected = effectiveBarberId === barber.id;

                return (
                  <button
                    key={barber.id}
                    onClick={() => onSelectBarber(barber.id)}
                    className={`p-3 rounded-xl border text-right transition-all flex items-center gap-3 cursor-pointer ${
                      isSelected
                        ? 'border-amber-500 bg-amber-500/10 shadow-md ring-1 ring-amber-500/50'
                        : 'border-neutral-800 bg-neutral-950/40 hover:border-neutral-700'
                    }`}
                  >
                    <img
                      src={barber.image}
                      alt={barber.name}
                      referrerPolicy="no-referrer"
                      className="w-11 h-11 rounded-lg object-cover border border-neutral-700 shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <span className="text-xs font-bold text-white block truncate">
                        {barber.name}
                      </span>
                      <span className="text-[11px] text-neutral-400 block truncate">
                        الكرسي #{barber.chairNumber} · {barber.title.split('(')[0]}
                      </span>
                      {pendingCount > 0 ? (
                        <span className="text-[10px] text-amber-400 font-bold flex items-center gap-1 mt-0.5">
                          <Clock className="w-2.5 h-2.5" />
                          <span>{pendingCount} طلبات تنتظر قراره</span>
                        </span>
                      ) : (
                        <span className="text-[10px] text-emerald-400 font-medium block mt-0.5">
                          تم الرد على جميع الطلبات
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}

              {/* View All Barbers Option */}
              <button
                onClick={() => onSelectBarber('all')}
                className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center justify-center cursor-pointer ${
                  effectiveBarberId === 'all'
                    ? 'border-amber-500 bg-amber-500/10 shadow-md ring-1 ring-amber-500/50'
                    : 'border-neutral-800 bg-neutral-950/40 hover:border-neutral-700'
                }`}
              >
                <Scissors className="w-5 h-5 text-amber-500 mb-1" />
                <span className="text-xs font-bold text-white">إشراف عام</span>
                <span className="text-[10px] text-neutral-400">مواعيد كل الحلاقين الثلاثة</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-neutral-900/60 border border-neutral-800 rounded-2xl p-4 flex items-center justify-between text-xs">
            <span className="text-neutral-300">
              أنت تستعرض الكرسي رقم <strong>#{activeBarber.chairNumber}</strong> الخاص بك ({activeBarber.name}).
            </span>
            <span className="text-amber-400 font-medium">
              كلمة مرور حسابك مؤمنة ويديرها صاحب الصالون
            </span>
          </div>
        )}

        {/* Selected Barber Header Banner */}
        {effectiveBarberId !== 'all' && (
          <div className="bg-gradient-to-r from-neutral-900 to-neutral-900/60 border border-neutral-800 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <img
                src={activeBarber.image}
                alt={activeBarber.name}
                className="w-16 h-16 rounded-2xl object-cover border-2 border-amber-500/40 shadow-lg"
              />
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-white">{activeBarber.name}</h2>
                  <span className="text-xs bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-md font-medium">
                    الكرسي #{activeBarber.chairNumber}
                  </span>
                </div>
                <p className="text-xs text-neutral-400 mt-0.5">
                  {activeBarber.title} · ساعات العمل اليومية: {activeBarber.workingHours.start} إلى {activeBarber.workingHours.end}
                </p>
                <div className="flex items-center gap-3 text-xs text-neutral-400 mt-2">
                  <span>التقييم: <strong className="text-amber-400 tabular-nums">{activeBarber.rating} ★</strong></span>
                  <span>·</span>
                  <span>الخبرة: <strong className="text-white tabular-nums">{activeBarber.experienceYears} سنوات</strong></span>
                </div>
              </div>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center gap-2 bg-neutral-950 p-1 rounded-xl border border-neutral-800 self-stretch sm:self-auto justify-center">
              <button
                onClick={() => setViewMode('cards')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  viewMode === 'cards'
                    ? 'bg-amber-600 text-white'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                قائمة بطاقات المواعيد
              </button>
              <button
                onClick={() => setViewMode('calendar')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  viewMode === 'calendar'
                    ? 'bg-amber-600 text-white'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                جدول ساعات اليوم
              </button>
            </div>
          </div>
        )}

        {/* Metric Cards Bar */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-neutral-900/80 border border-neutral-800 rounded-2xl p-5">
            <div className="flex items-center justify-between text-neutral-400 mb-2">
              <span className="text-xs font-semibold">بانتظار قرارك</span>
              <Clock className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-3xl font-extrabold text-amber-400 tabular-nums">
              {pendingAppointments.length}
            </div>
            <span className="text-[11px] text-neutral-500 mt-1 block">
              {pendingAppointments.length > 0 ? 'يتطلب اتخاذ قرار قبول/رفض' : 'لا توجد طلبات معلقة'}
            </span>
          </div>

          <div className="bg-neutral-900/80 border border-neutral-800 rounded-2xl p-5">
            <div className="flex items-center justify-between text-neutral-400 mb-2">
              <span className="text-xs font-semibold">مواعيد مؤكدة ومقبولة</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="text-3xl font-extrabold text-emerald-400 tabular-nums">
              {confirmedAppointments.length}
            </div>
            <span className="text-[11px] text-neutral-500 mt-1 block">
              زبائن وافق الحلاق على حضورهم
            </span>
          </div>

          <div className="bg-neutral-900/80 border border-neutral-800 rounded-2xl p-5">
            <div className="flex items-center justify-between text-neutral-400 mb-2">
              <span className="text-xs font-semibold">طلبات اعتذر عنها الحلاق</span>
              <XCircle className="w-4 h-4 text-red-500" />
            </div>
            <div className="text-3xl font-extrabold text-neutral-300 tabular-nums">
              {rejectedAppointments.length}
            </div>
            <span className="text-[11px] text-neutral-500 mt-1 block">
              تم الرفض مع توضيح السبب
            </span>
          </div>

          <div className="bg-neutral-900/80 border border-neutral-800 rounded-2xl p-5">
            <div className="flex items-center justify-between text-neutral-400 mb-2">
              <span className="text-xs font-semibold">الإيراد المتوقع للمواعيد المؤكدة</span>
              <Sparkles className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-3xl font-extrabold text-white tabular-nums">
              {confirmedAppointments.reduce((sum, a) => sum + a.totalPrice, 0)} <span className="text-sm font-normal text-amber-400">د.ج</span>
            </div>
            <span className="text-[11px] text-neutral-500 mt-1 block">
              إجمالي قيمة الخدمات المقبولة
            </span>
          </div>
        </div>

        {/* View Mode: Calendar Timetable or Cards */}
        {viewMode === 'calendar' ? (
          <div className="bg-neutral-900/80 border border-neutral-800 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-neutral-800">
              <div>
                <h3 className="text-lg font-bold text-white">جدول ساعات العمل لليوم ({todayStr})</h3>
                <p className="text-xs text-neutral-400 mt-0.5">
                  توزيع المواعيد بالساعة للحلاق {activeBarber.name}
                </p>
              </div>
              <div className="flex items-center gap-3 text-xs text-neutral-400">
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-neutral-800 border border-neutral-700 inline-block" /> فارغ
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-amber-500/20 border border-amber-500 inline-block" /> بانتظار الموافقة
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-emerald-500/20 border border-emerald-500 inline-block" /> مؤكد ومقبول
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {calendarSlots.map((slot) => {
                const appt = slot.appointment;
                const service = appt ? services.find((s) => s.id === appt.serviceId) : null;

                return (
                  <div
                    key={slot.time}
                    className={`p-4 rounded-xl border transition-all ${
                      !appt
                        ? 'bg-neutral-950/40 border-neutral-800/80 text-neutral-500'
                        : appt.status === 'pending'
                        ? 'bg-amber-950/20 border-amber-500/60 shadow-md ring-1 ring-amber-500/30'
                        : appt.status === 'confirmed'
                        ? 'bg-emerald-950/20 border-emerald-500/60'
                        : 'bg-neutral-950/60 border-neutral-800'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-base font-bold font-mono text-white tabular-nums">
                        {slot.time}
                      </span>
                      {appt ? (
                        <span
                          className={`text-xs px-2 py-0.5 rounded-md font-bold ${
                            appt.status === 'pending'
                              ? 'bg-amber-500 text-neutral-950'
                              : appt.status === 'confirmed'
                              ? 'bg-emerald-500 text-neutral-950'
                              : 'bg-neutral-800 text-neutral-300'
                          }`}
                        >
                          {appt.status === 'pending'
                            ? 'طلب معلق'
                            : appt.status === 'confirmed'
                            ? 'مقبول'
                            : appt.status}
                        </span>
                      ) : (
                        <span className="text-xs text-neutral-600">توقيت متاح</span>
                      )}
                    </div>

                    {appt ? (
                      <div className="space-y-2">
                        <div>
                          <span className="text-xs font-bold text-white block">{appt.clientName}</span>
                          <span className="text-[11px] text-neutral-400 block font-mono">{appt.clientPhone}</span>
                          <span className="text-[11px] text-amber-400 block mt-1">{service?.name}</span>
                        </div>

                        {/* Inline actions if pending in calendar */}
                        {appt.status === 'pending' && (
                          <div className="pt-2 border-t border-amber-900/40 flex items-center gap-2">
                            <button
                              onClick={() => handleAccept(appt)}
                              className="flex-1 py-1 px-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer"
                            >
                              <Check className="w-3 h-3" />
                              <span>قبول</span>
                            </button>
                            <button
                              onClick={() => setRejectingApptId(appt.id)}
                              className="flex-1 py-1 px-2 bg-neutral-800 hover:bg-red-900/60 text-red-400 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer"
                            >
                              <X className="w-3 h-3" />
                              <span>رفض</span>
                            </button>
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-xs text-neutral-600">يمكن للزبائن طلب هذا الوقت</p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          /* Card View with Status Filter Tabs */
          <div className="space-y-6">
            {/* Filter Tabs */}
            <div className="flex flex-wrap items-center justify-between gap-4 bg-neutral-900/80 p-2 rounded-2xl border border-neutral-800">
              <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
                <button
                  onClick={() => setFilterStatus('pending')}
                  className={`px-4 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                    filterStatus === 'pending'
                      ? 'bg-amber-500 text-neutral-950 shadow-md'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  <Clock className="w-4 h-4" />
                  <span>بانتظار القرار</span>
                  {pendingAppointments.length > 0 && (
                    <span className="bg-neutral-950 text-amber-400 text-xs px-2 py-0.5 rounded-full font-bold">
                      {pendingAppointments.length}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => setFilterStatus('confirmed')}
                  className={`px-4 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                    filterStatus === 'confirmed'
                      ? 'bg-emerald-600 text-white shadow-md'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>مواعيد مؤكدة</span>
                  <span className="text-xs opacity-70">({confirmedAppointments.length})</span>
                </button>

                <button
                  onClick={() => setFilterStatus('rejected')}
                  className={`px-4 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                    filterStatus === 'rejected'
                      ? 'bg-red-600 text-white shadow-md'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  <XCircle className="w-4 h-4" />
                  <span>مرفوضة / معتذر عنها</span>
                  <span className="text-xs opacity-70">({rejectedAppointments.length})</span>
                </button>

                <button
                  onClick={() => setFilterStatus('all')}
                  className={`px-4 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                    filterStatus === 'all'
                      ? 'bg-neutral-800 text-white shadow-md'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  <span>الكل</span>
                  <span className="text-xs opacity-70">({barberAppointments.length})</span>
                </button>
              </div>

              <div className="text-xs text-neutral-400 px-3">
                {displayedAppointments.length} مواعيد معروضة
              </div>
            </div>

            {/* Empty State */}
            {displayedAppointments.length === 0 ? (
              <div className="p-12 text-center bg-neutral-900/40 border border-neutral-800 rounded-3xl space-y-3">
                <AlertCircle className="w-10 h-10 text-neutral-600 mx-auto" />
                <h3 className="text-base font-bold text-white">لا توجد مواعيد في هذا التصنيف</h3>
                <p className="text-xs text-neutral-400 max-w-sm mx-auto">
                  {filterStatus === 'pending'
                    ? 'لقد قمت بمراجعة كافة طلبات المواعيد المعلقة بنجاح! يمكنك إرسال طلب تجريبي لاختبار النظام.'
                    : 'لا توجد بيانات حالية لعرضها في هذا القسم.'}
                </p>
                {filterStatus === 'pending' && (
                  <button
                    onClick={handleAddSampleBooking}
                    className="mt-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs font-bold rounded-xl transition-all inline-flex items-center gap-2 cursor-pointer"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>إرسال طلب موعد تجريبي جديد للمراجعة</span>
                  </button>
                )}
              </div>
            ) : (
              /* Appointments Cards Grid */
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {displayedAppointments.map((appt) => {
                  const barber = barbers.find((b) => b.id === appt.barberId);
                  const service = services.find((s) => s.id === appt.serviceId);
                  const isRejectingThis = rejectingApptId === appt.id;
                  const isReschedulingThis = reschedulingApptId === appt.id;

                  return (
                    <div
                      key={appt.id}
                      className={`rounded-2xl border p-6 transition-all flex flex-col justify-between ${
                        appt.status === 'pending'
                          ? 'bg-neutral-900/90 border-amber-500/50 ring-1 ring-amber-500/20 shadow-xl'
                          : appt.status === 'confirmed'
                          ? 'bg-neutral-900/60 border-neutral-800'
                          : 'bg-neutral-950/80 border-neutral-800/80 opacity-90'
                      }`}
                    >
                      <div>
                        {/* Top row: Status & Reference */}
                        <div className="flex items-center justify-between pb-3 border-b border-neutral-800/80 mb-4">
                          <span className="text-xs font-mono text-neutral-500">
                            #{appt.id}
                          </span>

                          <div>
                            {appt.status === 'pending' && (
                              <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center gap-1.5 animate-pulse">
                                <Clock className="w-3.5 h-3.5" />
                                <span>بانتظار قرارك (قبول أو رفض)</span>
                              </span>
                            )}
                            {appt.status === 'confirmed' && (
                              <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>تم القبول والتأكيد</span>
                              </span>
                            )}
                            {appt.status === 'rejected' && (
                              <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-red-500/20 text-red-400 border border-red-500/30 flex items-center gap-1.5">
                                <XCircle className="w-3.5 h-3.5" />
                                <span>اعتذر الحلاق عن الموعد</span>
                              </span>
                            )}
                            {appt.status === 'rescheduled' && (
                              <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center gap-1.5">
                                <RefreshCw className="w-3.5 h-3.5" />
                                <span>تم اقتراح موعد بديل</span>
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Client details & Barber badge */}
                        <div className="flex items-start justify-between gap-4 mb-4">
                          <div>
                            <span className="text-xs text-neutral-400 block">الزبون:</span>
                            <h4 className="text-lg font-bold text-white flex items-center gap-2">
                              <span>{appt.clientName}</span>
                            </h4>
                            <a
                              href={`tel:${appt.clientPhone}`}
                              className="text-xs text-amber-400/90 font-mono flex items-center gap-1.5 mt-0.5 hover:underline"
                            >
                              <Phone className="w-3 h-3 text-neutral-500" />
                              <span>{appt.clientPhone}</span>
                            </a>
                          </div>

                          {activeBarberId === 'all' && barber && (
                            <div className="text-left shrink-0">
                              <span className="text-[11px] text-neutral-400 block">الحلاق:</span>
                              <span className="text-xs font-bold text-white">{barber.name}</span>
                              <span className="text-[10px] text-amber-500 block">كرسي #{barber.chairNumber}</span>
                            </div>
                          )}
                        </div>

                        {/* Requested Day & Time Banner */}
                        <div className="grid grid-cols-2 gap-3 bg-neutral-950 p-3.5 rounded-xl border border-neutral-800 mb-4">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-amber-500 shrink-0" />
                            <div>
                              <span className="text-[11px] text-neutral-400 block">اليوم والتاريخ:</span>
                              <span className="text-xs font-bold text-white tabular-nums">{appt.date}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-amber-500 shrink-0" />
                            <div>
                              <span className="text-[11px] text-neutral-400 block">الوقت المطلوب:</span>
                              <span className="text-sm font-bold text-amber-400 tabular-nums">{appt.time}</span>
                            </div>
                          </div>
                        </div>

                        {/* Service & Price */}
                        <div className="space-y-1 mb-4">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-neutral-400">الخدمة:</span>
                            <span className="font-bold text-white">{service?.name || 'حلاقة احترافية'}</span>
                          </div>
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-neutral-400">المدة والتكلفة:</span>
                            <span className="font-bold text-amber-400 tabular-nums">
                              {appt.durationMinutes} دقيقة · {appt.totalPrice} د.ج
                            </span>
                          </div>
                        </div>

                        {/* Client Notes if any */}
                        {appt.clientNotes && (
                          <div className="bg-neutral-950/60 p-2.5 rounded-xl border border-neutral-800/80 text-xs text-neutral-300 mb-4">
                            <span className="text-neutral-400 font-semibold block mb-0.5">ملاحظات الزبون:</span>
                            <p className="italic">"{appt.clientNotes}"</p>
                          </div>
                        )}

                        {/* Rejection / Reschedule Details */}
                        {appt.rejectionReason && (
                          <div className="p-2.5 bg-red-950/30 border border-red-900/50 rounded-xl text-xs text-red-300 mb-4">
                            <strong>سبب الاعتذار المسجل:</strong> {appt.rejectionReason}
                          </div>
                        )}
                        {appt.rescheduledTime && (
                          <div className="p-2.5 bg-blue-950/30 border border-blue-900/50 rounded-xl text-xs text-blue-300 mb-4">
                            <strong>التوقيت البديل المقترح:</strong> {appt.rescheduledTime}
                          </div>
                        )}
                      </div>

                      {/* ACTION CONTROLS: Accept / Reject / Reschedule */}
                      <div className="pt-4 border-t border-neutral-800/80">
                        {isRejectingThis ? (
                          /* Inline Reject Box */
                          <div className="space-y-3 bg-neutral-950 p-3 rounded-xl border border-red-900/60">
                            <span className="text-xs font-bold text-red-300 block">
                              سبب الاعتذار للزبون ({appt.clientName}):
                            </span>

                            <div className="grid grid-cols-2 gap-1.5 text-xs">
                              {['الوقت محجوز مسبقاً', 'خارج ساعات العمل', 'ظرف طارئ للحلاق', 'عطلة أسبوعية'].map((reason) => (
                                <button
                                  type="button"
                                  key={reason}
                                  onClick={() => setRejectionReason(reason)}
                                  className={`p-1.5 rounded-lg border text-right transition-all cursor-pointer ${
                                    rejectionReason === reason
                                      ? 'border-red-500 bg-red-950/50 text-white font-bold'
                                      : 'border-neutral-800 bg-neutral-900 text-neutral-400 hover:text-white'
                                  }`}
                                >
                                  {reason}
                                </button>
                              ))}
                            </div>

                            <input
                              type="text"
                              placeholder="أو اكتب سبباً مخصصاً..."
                              value={customReason}
                              onChange={(e) => setCustomReason(e.target.value)}
                              className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-1.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-red-500"
                            />

                            <div className="flex items-center justify-end gap-2 pt-1">
                              <button
                                type="button"
                                onClick={() => setRejectingApptId(null)}
                                className="px-3 py-1 text-xs text-neutral-400 hover:text-white cursor-pointer"
                              >
                                تراجع
                              </button>
                              <button
                                type="button"
                                onClick={() => handleConfirmReject(appt.id)}
                                className="px-4 py-1.5 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-lg cursor-pointer"
                              >
                                تأكيد رفض الموعد
                              </button>
                            </div>
                          </div>
                        ) : isReschedulingThis ? (
                          /* Inline Reschedule Box */
                          <div className="space-y-3 bg-neutral-950 p-3 rounded-xl border border-blue-900/60">
                            <span className="text-xs font-bold text-blue-300 block">
                              اختر توقيتاً بديلاً مناسباً لاقتراحه على الزبون:
                            </span>

                            <div className="flex items-center gap-2">
                              <input
                                type="time"
                                value={newSuggestedTime}
                                onChange={(e) => setNewSuggestedTime(e.target.value)}
                                className="bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-blue-500"
                              />
                              <span className="text-xs text-neutral-400">سيتم إشعار الزبون بالمقترح الجديد</span>
                            </div>

                            <div className="flex items-center justify-end gap-2 pt-1">
                              <button
                                type="button"
                                onClick={() => setReschedulingApptId(null)}
                                className="px-3 py-1 text-xs text-neutral-400 hover:text-white cursor-pointer"
                              >
                                تراجع
                              </button>
                              <button
                                type="button"
                                onClick={() => handleConfirmReschedule(appt.id)}
                                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg cursor-pointer"
                              >
                                إرسال المقترح للزبون
                              </button>
                            </div>
                          </div>
                        ) : (
                          /* Standard Action Buttons */
                          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                            {appt.status === 'pending' && (
                              <>
                                <button
                                  type="button"
                                  onClick={() => handleAccept(appt)}
                                  className="w-full sm:flex-1 py-2.5 px-3 bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                                >
                                  <Check className="w-4 h-4" />
                                  <span>قبول الموعد وتأكيده</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => setRejectingApptId(appt.id)}
                                  className="py-2.5 px-3 bg-neutral-800 hover:bg-red-950 hover:text-red-400 text-neutral-300 text-xs font-semibold rounded-xl border border-neutral-700 transition-all flex items-center justify-center gap-1 cursor-pointer"
                                  title="الاعتذار عن قبول هذا التوقيت"
                                >
                                  <X className="w-3.5 h-3.5" />
                                  <span>اعتذار / رفض</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => setReschedulingApptId(appt.id)}
                                  className="py-2.5 px-3 bg-neutral-800 hover:bg-blue-950 hover:text-blue-400 text-neutral-300 text-xs font-semibold rounded-xl border border-neutral-700 transition-all flex items-center justify-center gap-1 cursor-pointer"
                                  title="اقتراح موعد بديل"
                                >
                                  <RefreshCw className="w-3.5 h-3.5" />
                                  <span>توقيت بديل</span>
                                </button>
                              </>
                            )}

                            {appt.status === 'confirmed' && (
                              <>
                                <button
                                  type="button"
                                  onClick={() => {
                                    updateAppointmentStatus(appt.id, 'completed');
                                    onNotification(`تم إتمام حلاقة الزبون (${appt.clientName}) بنجاح!`, 'success');
                                  }}
                                  className="flex-1 py-2 px-3 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                                >
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                                  <span>تمت الحلاقة بنجاح (إنهاء الموعد)</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => setRejectingApptId(appt.id)}
                                  className="py-2 px-2.5 text-xs text-neutral-500 hover:text-red-400 transition-colors cursor-pointer"
                                  title="إلغاء الموعد"
                                >
                                  إلغاء
                                </button>
                              </>
                            )}

                            {(appt.status === 'rejected' || appt.status === 'completed' || appt.status === 'rescheduled') && (
                              <button
                                type="button"
                                onClick={() => handleAccept(appt)}
                                className="py-1.5 px-3 bg-neutral-800/80 hover:bg-neutral-800 text-xs text-neutral-400 hover:text-white rounded-lg transition-colors cursor-pointer"
                              >
                                إعادة قبول وتأكيد الموعد
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
