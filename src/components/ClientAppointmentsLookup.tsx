import React, { useState } from 'react';
import { X, Search, Clock, Calendar, Scissors, AlertCircle, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { Appointment, Barber, Service } from '../types/barber';

interface ClientAppointmentsLookupProps {
  isOpen: boolean;
  onClose: () => void;
  appointments: Appointment[];
  barbers: Barber[];
  services: Service[];
  onOpenBooking: () => void;
}

export const ClientAppointmentsLookup: React.FC<ClientAppointmentsLookupProps> = ({
  isOpen,
  onClose,
  appointments,
  barbers,
  services,
  onOpenBooking,
}) => {
  const [phoneNumber, setPhoneNumber] = useState<string>('0501234567');

  if (!isOpen) return null;

  const matchedAppointments = appointments.filter((a) =>
    a.clientPhone.replace(/\s+/g, '').includes(phoneNumber.trim().replace(/\s+/g, ''))
  );

  const getStatusBadge = (status: Appointment['status'], reason?: string, altTime?: string) => {
    switch (status) {
      case 'pending':
        return (
          <div className="flex flex-col items-start gap-1">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <Clock className="w-3.5 h-3.5" />
              <span>قيد المراجعة - بانتظار موافقة الحلاق</span>
            </span>
            <span className="text-[11px] text-neutral-400">
              يراجع الحلاق جدول مواعيده لتأكيد الموعد أو الاعتذار
            </span>
          </div>
        );
      case 'confirmed':
        return (
          <div className="flex flex-col items-start gap-1">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <CheckCircle className="w-3.5 h-3.5" />
              <span>تم قبول الموعد وتأكيده بنجاح!</span>
            </span>
            <span className="text-[11px] text-neutral-400">
              مقعدك محجوز ومؤكد، نتطلع لحضورك في الموعد المحدد
            </span>
          </div>
        );
      case 'rejected':
        return (
          <div className="flex flex-col items-start gap-1">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-red-500/10 border border-red-500/30 text-red-400">
              <XCircle className="w-3.5 h-3.5" />
              <span>اعتذر الحلاق عن قبول هذا التوقيت</span>
            </span>
            {reason && (
              <span className="text-[11px] text-red-300/90 bg-red-950/40 p-1.5 rounded-lg border border-red-900/60 block mt-1">
                سبب الاعتذار من الحلاق: {reason}
              </span>
            )}
          </div>
        );
      case 'rescheduled':
        return (
          <div className="flex flex-col items-start gap-1">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-blue-500/10 border border-blue-500/30 text-blue-400">
              <RefreshCw className="w-3.5 h-3.5" />
              <span>اقترح الحلاق موعداً بديلاً</span>
            </span>
            {altTime && (
              <span className="text-[11px] text-blue-300">
                التوقيت الجديد المقترح: {altTime}
              </span>
            )}
          </div>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-neutral-800 text-neutral-300">
            <CheckCircle className="w-3.5 h-3.5 text-neutral-400" />
            <span>تمت الحلاقة بنجاح</span>
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-sm flex items-center justify-center p-2.5 sm:p-4">
      <div className="relative w-full max-w-2xl max-h-[92vh] flex flex-col bg-neutral-900 border border-neutral-800 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden my-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 sm:py-4 border-b border-neutral-800 bg-neutral-950/80 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white">متابعة حالة حجوزات الزبون</h3>
              <p className="text-[11px] sm:text-xs text-neutral-400">تحقق مما إذا كان الحلاق قد وافق على موعدك</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content with safe scroll */}
        <div className="overflow-y-auto flex-1 p-4 sm:p-6 space-y-5">
          {/* Phone Search Box */}
          <div>
            <label className="block text-xs font-bold text-neutral-300 mb-2">
              ابحث برقم هاتفك المسجل:
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="أدخل رقم الجوال مثلاً 0501234567"
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500 font-mono pr-9"
                />
                <Search className="w-4 h-4 text-neutral-500 absolute top-3 right-3" />
              </div>
            </div>

            {/* Quick Demo Shortcuts */}
            <div className="flex items-center gap-2 mt-2 text-xs text-neutral-400">
              <span>أرقام تجريبية سريعة:</span>
              <button
                type="button"
                onClick={() => setPhoneNumber('0501234567')}
                className="text-amber-400 hover:underline font-mono"
              >
                0501234567 (عبدالله)
              </button>
              <span>·</span>
              <button
                type="button"
                onClick={() => setPhoneNumber('0567788990')}
                className="text-amber-400 hover:underline font-mono"
              >
                0567788990 (ريان)
              </button>
            </div>
          </div>

          {/* Appointments List */}
          <div className="space-y-4 max-h-[420px] overflow-y-auto pr-1">
            {matchedAppointments.length === 0 ? (
              <div className="p-8 text-center bg-neutral-950/50 border border-neutral-800/80 rounded-2xl">
                <AlertCircle className="w-8 h-8 text-neutral-500 mx-auto mb-2" />
                <p className="text-sm font-semibold text-white">لا توجد حجوزات مسجلة بهذا الرقم</p>
                <p className="text-xs text-neutral-400 mt-1">تأكد من كتابة الرقم بدقة أو قم بحجز موعد جديد الآن</p>
                <button
                  onClick={() => {
                    onClose();
                    onOpenBooking();
                  }}
                  className="mt-4 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs font-bold rounded-xl transition-all inline-flex items-center gap-1.5 cursor-pointer"
                >
                  حجز موعد جديد
                </button>
              </div>
            ) : (
              matchedAppointments.map((appt) => {
                const barber = barbers.find((b) => b.id === appt.barberId);
                const service = services.find((s) => s.id === appt.serviceId);

                return (
                  <div
                    key={appt.id}
                    className="p-5 bg-neutral-950 border border-neutral-800 rounded-2xl space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-neutral-800/80 pb-3">
                      <div>
                        <span className="text-xs text-neutral-500 font-mono">رقم الحجز: {appt.id}</span>
                        <h4 className="text-sm font-bold text-white mt-0.5">
                          {service?.name || 'خدمة حلاقة'}
                        </h4>
                      </div>

                      <div className="text-left">
                        <span className="text-sm font-bold text-amber-400 tabular-nums">
                          {appt.totalPrice} د.ج
                        </span>
                        <span className="text-[11px] text-neutral-500 block">
                          المدة: {appt.durationMinutes} دقيقة
                        </span>
                      </div>
                    </div>

                    {/* Barber Info */}
                    <div className="flex items-center gap-3">
                      {barber?.image && (
                        <img
                          src={barber.image}
                          alt={barber.name}
                          className="w-10 h-10 rounded-xl object-cover border border-neutral-800"
                        />
                      )}
                      <div>
                        <span className="text-xs text-neutral-400 block">الحلاق المسؤول:</span>
                        <span className="text-sm font-bold text-white">
                          {barber?.name} (كرسي #{barber?.chairNumber})
                        </span>
                      </div>
                    </div>

                    {/* Date & Time */}
                    <div className="grid grid-cols-2 gap-3 text-xs bg-neutral-900/60 p-3 rounded-xl border border-neutral-800/60">
                      <div>
                        <span className="text-neutral-400 block">التاريخ:</span>
                        <span className="font-bold text-white tabular-nums">{appt.date}</span>
                      </div>
                      <div>
                        <span className="text-neutral-400 block">التوقيت:</span>
                        <span className="font-bold text-amber-400 tabular-nums">{appt.time}</span>
                      </div>
                    </div>

                    {/* Status Feedback */}
                    <div className="pt-2">
                      <span className="text-xs text-neutral-400 block mb-1">حالة قبول الموعد:</span>
                      {getStatusBadge(appt.status, appt.rejectionReason, appt.rescheduledTime)}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-neutral-800 bg-neutral-950/60 flex items-center justify-between">
          <span className="text-xs text-neutral-400">
            صالون المقص الذهبي · خدمة عملاء ٢٤/٧
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold rounded-xl transition-all cursor-pointer"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
