import React, { useState, useId } from 'react';
import { X, Check, Calendar, Clock, User, Phone, Scissors, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { Barber, Service, Appointment } from '../types/barber';
import { addAppointment } from '../utils/storage';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  barbers: Barber[];
  services: Service[];
  initialBarber?: Barber | null;
  initialService?: Service | null;
  appointments: Appointment[];
  onBookingSuccess: (appointment: Appointment) => void;
  onOpenBarberDashboard: (barberId: string) => void;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  isOpen,
  onClose,
  barbers,
  services,
  initialBarber,
  initialService,
  appointments,
  onBookingSuccess,
  onOpenBarberDashboard,
}) => {
  const [selectedBarberId, setSelectedBarberId] = useState<string>(
    initialBarber?.id || barbers[0]?.id || 'barber-1'
  );
  const [selectedServiceId, setSelectedServiceId] = useState<string>(
    initialService?.id || services[0]?.id || 'srv-1'
  );

  // Helper for generating upcoming dates (Today + next 7 days)
  const availableDates = Array.from({ length: 8 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const dateStr = `${y}-${m}-${day}`;

    const arabicDays = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
    const arabicMonths = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];

    let label = '';
    if (i === 0) label = 'اليوم';
    else if (i === 1) label = 'غداً';
    else label = arabicDays[d.getDay()];

    return {
      dateStr,
      dayName: label,
      dayNumber: d.getDate(),
      monthName: arabicMonths[d.getMonth()],
    };
  });

  const [selectedDate, setSelectedDate] = useState<string>(availableDates[0].dateStr);
  const [selectedTime, setSelectedTime] = useState<string>('16:00');
  const [clientName, setClientName] = useState<string>('');
  const [clientPhone, setClientPhone] = useState<string>('');
  const [clientNotes, setClientNotes] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [createdAppointment, setCreatedAppointment] = useState<Appointment | null>(null);

  if (!isOpen) return null;

  const currentBarber = barbers.find((b) => b.id === selectedBarberId) || barbers[0];
  const currentService = services.find((s) => s.id === selectedServiceId) || services[0];

  // Generate available time slots based on barber's hours
  const startHour = parseInt(currentBarber.workingHours.start.split(':')[0], 10) || 10;
  const endHour = parseInt(currentBarber.workingHours.end.split(':')[0], 10) || 22;

  const generatedTimeSlots: { time: string; status: 'free' | 'pending' | 'booked' }[] = [];
  for (let h = startHour; h < endHour; h++) {
    const timeA = `${String(h).padStart(2, '0')}:00`;
    const timeB = `${String(h).padStart(2, '0')}:30`;

    // Check if slot conflicts with existing appointments for this barber on this date
    const checkSlot = (slotTime: string) => {
      const match = appointments.find(
        (a) =>
          a.barberId === currentBarber.id &&
          a.date === selectedDate &&
          a.time === slotTime &&
          a.status !== 'rejected'
      );
      if (!match) return 'free';
      return match.status === 'confirmed' ? 'booked' : 'pending';
    };

    generatedTimeSlots.push({ time: timeA, status: checkSlot(timeA) });
    generatedTimeSlots.push({ time: timeB, status: checkSlot(timeB) });
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim()) {
      setErrorMsg('يرجى إدخال اسم العميل');
      return;
    }
    if (!clientPhone.trim() || clientPhone.length < 8) {
      setErrorMsg('يرجى إدخال رقم هاتف صحيح للتواصل وتأكيد الحجز');
      return;
    }
    if (!selectedTime) {
      setErrorMsg('يرجى اختيار وقت الموعد');
      return;
    }

    const appt = addAppointment({
      barberId: selectedBarberId,
      serviceId: selectedServiceId,
      clientName: clientName.trim(),
      clientPhone: clientPhone.trim(),
      clientNotes: clientNotes.trim(),
      date: selectedDate,
      time: selectedTime,
      durationMinutes: currentService.durationMinutes,
      totalPrice: currentService.price,
    });

    setCreatedAppointment(appt);
    onBookingSuccess(appt);
  };

  const handleResetAndClose = () => {
    setCreatedAppointment(null);
    setClientName('');
    setClientPhone('');
    setClientNotes('');
    setErrorMsg('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative w-full max-w-2xl bg-neutral-900 border border-neutral-800 rounded-3xl shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 bg-neutral-950/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">حجز موعد حلاقة جديد</h3>
              <p className="text-xs text-neutral-400">يخضع الموعد لمراجعة وقبول الحلاق المباشر</p>
            </div>
          </div>

          <button
            onClick={handleResetAndClose}
            className="w-8 h-8 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        {createdAppointment ? (
          /* Confirmation Screen */
          <div className="p-8 text-center space-y-6">
            <div className="w-16 h-16 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center justify-center text-amber-500 mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <span className="text-xs font-semibold text-amber-500 uppercase tracking-wider block mb-1">
                تم إرسال طلب الموعد بنجاح!
              </span>
              <h4 className="text-2xl font-extrabold text-white">
                طلبك الآن قيد مراجعة {currentBarber.name}
              </h4>
              <p className="text-neutral-400 text-sm mt-2 max-w-md mx-auto">
                وفق نظام الصالون، يقرر الحلاق قبول الوقت المحدد أو اقتراح موعد بديل. ستتلقى التحديث هنا وفوراً عبر المنظومة.
              </p>
            </div>

            {/* Ticket Card */}
            <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-5 text-right max-w-md mx-auto space-y-3">
              <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                <span className="text-xs text-neutral-400">رقم تذكرة الحجز:</span>
                <span className="text-xs font-mono font-bold text-amber-400">{createdAppointment.id}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-neutral-400">الحلاق المختار:</span>
                <span className="text-xs font-bold text-white">{currentBarber.name} (كرسي #{currentBarber.chairNumber})</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-neutral-400">الخدمة المطلوبة:</span>
                <span className="text-xs font-bold text-white">{currentService.name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-neutral-400">اليوم والتاريخ:</span>
                <span className="text-xs font-bold text-white tabular-nums">{createdAppointment.date}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-neutral-400">الوقت المطلوب:</span>
                <span className="text-xs font-bold text-amber-400 tabular-nums">{createdAppointment.time}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-neutral-400">موقع الصالون:</span>
                <a
                  href="https://maps.app.goo.gl/ffo11T6RT3GXEPrj7"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-bold text-amber-400 hover:underline flex items-center gap-1"
                >
                  <span>بن فريحة، وهران (خرائط Google ↗)</span>
                </a>
              </div>
              <div className="flex items-center justify-between border-t border-neutral-800 pt-3">
                <span className="text-xs text-neutral-400">حالة الطلب الحالية:</span>
                <span className="text-xs font-bold text-amber-400 bg-amber-950/60 border border-amber-800/60 px-2.5 py-0.5 rounded-md">
                  بانتظار موافقة الحلاق
                </span>
              </div>
            </div>

            {/* Actions for User */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4 border-t border-neutral-800">
              <button
                onClick={() => {
                  handleResetAndClose();
                  onOpenBarberDashboard(currentBarber.id);
                }}
                className="w-full sm:w-auto px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs sm:text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>فتح لوحة تحكم {currentBarber.name.split(' ')[0]} للموافقة عليه الآن</span>
              </button>

              <button
                onClick={handleResetAndClose}
                className="w-full sm:w-auto px-5 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs sm:text-sm font-semibold rounded-xl transition-all cursor-pointer"
              >
                تم، إغلاق
              </button>
            </div>
          </div>
        ) : (
          /* Booking Form */
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {errorMsg && (
              <div className="p-3 bg-red-950/40 border border-red-800 text-red-300 text-xs rounded-xl">
                {errorMsg}
              </div>
            )}

            {/* Step 1: Choose Barber */}
            <div>
              <label className="block text-xs font-bold text-neutral-300 mb-2">
                1. اختر الحلاق المسؤول (٣ حلاقين):
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {barbers.map((b) => (
                  <button
                    type="button"
                    key={b.id}
                    onClick={() => setSelectedBarberId(b.id)}
                    className={`p-3 rounded-2xl border text-right transition-all flex items-center gap-3 cursor-pointer ${
                      selectedBarberId === b.id
                        ? 'border-amber-500 bg-amber-500/10 shadow-sm'
                        : 'border-neutral-800 bg-neutral-950/40 hover:border-neutral-700'
                    }`}
                  >
                    <img
                      src={b.image}
                      alt={b.name}
                      referrerPolicy="no-referrer"
                      className="w-12 h-12 rounded-xl object-cover shrink-0 border border-neutral-700"
                    />
                    <div className="min-w-0">
                      <span className="text-sm font-bold text-white block truncate">
                        {b.name}
                      </span>
                      <span className="text-[11px] text-amber-400/90 block">
                        كرسي #{b.chairNumber}
                      </span>
                      <span className="text-[10px] text-neutral-400 block truncate">
                        {b.workingHours.start} - {b.workingHours.end}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Step 2: Choose Service */}
            <div>
              <label className="block text-xs font-bold text-neutral-300 mb-2">
                2. اختر الخدمة:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-44 overflow-y-auto p-1">
                {services.map((s) => (
                  <button
                    type="button"
                    key={s.id}
                    onClick={() => setSelectedServiceId(s.id)}
                    className={`p-3 rounded-xl border text-right transition-all flex items-start justify-between gap-2 cursor-pointer ${
                      selectedServiceId === s.id
                        ? 'border-amber-500 bg-amber-500/10'
                        : 'border-neutral-800 bg-neutral-950/40 hover:border-neutral-700'
                    }`}
                  >
                    <div>
                      <span className="text-xs font-bold text-white block">
                        {s.name}
                      </span>
                      <span className="text-[11px] text-neutral-400 block mt-0.5">
                        المدة: {s.durationMinutes} دقيقة
                      </span>
                    </div>
                    <span className="text-xs font-bold text-amber-400 tabular-nums shrink-0">
                      {s.price} د.ج
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Step 3: Choose Date */}
            <div>
              <label className="block text-xs font-bold text-neutral-300 mb-2">
                3. اختر اليوم:
              </label>
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
                {availableDates.map((item) => (
                  <button
                    type="button"
                    key={item.dateStr}
                    onClick={() => setSelectedDate(item.dateStr)}
                    className={`px-3 py-2 rounded-xl border text-center shrink-0 min-w-18 transition-all cursor-pointer ${
                      selectedDate === item.dateStr
                        ? 'border-amber-500 bg-amber-500 text-neutral-950 font-bold shadow-md'
                        : 'border-neutral-800 bg-neutral-950/40 text-neutral-300 hover:border-neutral-700'
                    }`}
                  >
                    <span className="text-[11px] block">{item.dayName}</span>
                    <span className="text-base font-extrabold tabular-nums block">
                      {item.dayNumber}
                    </span>
                    <span className="text-[10px] opacity-80 block">{item.monthName}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Step 4: Choose Time Slot */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-neutral-300">
                  4. اختر التوقيت المفضل:
                </label>
                <div className="flex items-center gap-3 text-[11px] text-neutral-400">
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-neutral-700 inline-block" /> متاح
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" /> معلق
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-red-600 inline-block" /> محجوز
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 max-h-36 overflow-y-auto p-1">
                {generatedTimeSlots.map((slot) => {
                  const isSelected = selectedTime === slot.time;
                  const isBooked = slot.status === 'booked';
                  const isPending = slot.status === 'pending';

                  return (
                    <button
                      type="button"
                      key={slot.time}
                      disabled={isBooked}
                      onClick={() => setSelectedTime(slot.time)}
                      className={`py-2 px-1 text-center text-xs font-mono rounded-lg border transition-all cursor-pointer ${
                        isSelected
                          ? 'border-amber-500 bg-amber-500 text-neutral-950 font-bold'
                          : isBooked
                          ? 'border-neutral-800/40 bg-neutral-950/20 text-neutral-600 cursor-not-allowed line-through'
                          : isPending
                          ? 'border-amber-800/50 bg-amber-950/20 text-amber-300 hover:border-amber-600'
                          : 'border-neutral-800 bg-neutral-950/40 text-neutral-300 hover:border-neutral-700'
                      }`}
                    >
                      {slot.time}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 5: Client Information */}
            <div className="pt-2 border-t border-neutral-800 space-y-3">
              <label className="block text-xs font-bold text-neutral-300">
                5. بيانات التواصل مع الزبون:
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="الاسم الكامل للزبون *"
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500 pr-9"
                    />
                    <User className="w-4 h-4 text-neutral-500 absolute top-3 right-3" />
                  </div>
                </div>

                <div>
                  <div className="relative">
                    <input
                      type="tel"
                      placeholder="رقم الجوال (05xxxxxxxx) *"
                      value={clientPhone}
                      onChange={(e) => setClientPhone(e.target.value)}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500 pr-9 font-mono"
                    />
                    <Phone className="w-4 h-4 text-neutral-500 absolute top-3 right-3" />
                  </div>
                </div>
              </div>

              <div>
                <input
                  type="text"
                  placeholder="ملاحظات خاصة للحلاق (اختياري، مثلاً: نوع القصة، مناسبة زواج...)"
                  value={clientNotes}
                  onChange={(e) => setClientNotes(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            {/* Footer Summary & Submit */}
            <div className="pt-4 border-t border-neutral-800 flex items-center justify-between gap-4">
              <div>
                <span className="text-xs text-neutral-400 block">إجمالي الخدمة:</span>
                <span className="text-lg font-bold text-amber-400 tabular-nums">
                  {currentService.price} د.ج
                </span>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleResetAndClose}
                  className="px-4 py-2 text-xs font-semibold text-neutral-400 hover:text-white transition-colors cursor-pointer"
                >
                  إلغاء
                </button>

                <button
                  type="submit"
                  className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs sm:text-sm font-bold rounded-xl transition-all shadow-md flex items-center gap-2 cursor-pointer"
                >
                  <span>إرسال طلب الموعد للحلاق</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
