/**
 * صالون المقص الذهبي - بن فريحة، وهران
 * طبقة التزامن الموحدة مع قواعد البيانات الحقيقية
 * - Supabase (vmhhriytxjeikorzoqcs)
 * - Firebase Realtime Database (ykin-1241b)
 */

import * as SupabaseDB from "./supabase.js";
import * as FirebaseDB from "./firebase.js";

export const SQL_SETUP_SCRIPT = SupabaseDB.SQL_SETUP_SCRIPT;

/**
 * الاشتراك اللحظي في المواعيد الحقيقية
 */
export function subscribeAppointments(callback) {
  // Listen on Supabase
  const unsubSupabase = SupabaseDB.subscribeAppointmentsSupabase((items) => {
    if (items && items.length >= 0) {
      callback(items);
    }
  });

  // Listen on Firebase Realtime Database
  const unsubFirebase = FirebaseDB.subscribeAppointments((items) => {
    if (items && items.length >= 0) {
      callback(items);
    }
  });

  return () => {
    unsubSupabase();
    if (typeof unsubFirebase === "function") unsubFirebase();
  };
}

/**
 * حفظ موعد جديد في قواعد البيانات الحقيقية (Supabase + Firebase)
 */
export async function saveAppointment(appt) {
  const [resSupabase, resFirebase] = await Promise.allSettled([
    SupabaseDB.saveAppointmentSupabase(appt),
    FirebaseDB.saveAppointmentCloud(appt)
  ]);

  return resSupabase.status === "fulfilled" || resFirebase.status === "fulfilled";
}

/**
 * تحديث حالة الموعد (قبول / رفض) في قواعد البيانات
 */
export async function updateAppointmentStatus(apptId, status) {
  const [resSupabase, resFirebase] = await Promise.allSettled([
    SupabaseDB.updateAppointmentStatusSupabase(apptId, status),
    FirebaseDB.updateAppointmentStatusCloud(apptId, status)
  ]);

  return resSupabase.status === "fulfilled" || resFirebase.status === "fulfilled";
}

/**
 * حذف موعد من قواعد البيانات
 */
export async function deleteAppointment(apptId) {
  const [resSupabase, resFirebase] = await Promise.allSettled([
    SupabaseDB.deleteAppointmentSupabase(apptId),
    FirebaseDB.deleteAppointmentCloud(apptId)
  ]);

  return resSupabase.status === "fulfilled" || resFirebase.status === "fulfilled";
}

/**
 * الاشتراك في الحلاقين
 */
export function subscribeBarbers(callback) {
  const unsubSupabase = SupabaseDB.subscribeBarbersSupabase((items) => {
    if (items && items.length > 0) callback(items);
  });

  const unsubFirebase = FirebaseDB.subscribeBarbers((items) => {
    if (items && items.length > 0) callback(items);
  });

  return () => {
    unsubSupabase();
    if (typeof unsubFirebase === "function") unsubFirebase();
  };
}

/**
 * تهيئة الحلاقين
 */
export async function seedBarbersIfEmpty(defaultBarbers) {
  await Promise.allSettled([
    SupabaseDB.seedBarbersSupabaseIfEmpty(defaultBarbers),
    FirebaseDB.seedBarbersIfEmpty(defaultBarbers)
  ]);
}

/**
 * حفظ حلاق جديد أو تعديله
 */
export async function saveBarber(barber) {
  const [resSupabase, resFirebase] = await Promise.allSettled([
    SupabaseDB.saveBarberSupabase(barber),
    FirebaseDB.saveBarberCloud(barber)
  ]);

  return resSupabase.status === "fulfilled" || resFirebase.status === "fulfilled";
}

/**
 * حذف حلاق
 */
export async function deleteBarber(barberId) {
  const [resSupabase, resFirebase] = await Promise.allSettled([
    SupabaseDB.deleteBarberSupabase(barberId),
    FirebaseDB.deleteBarberCloud(barberId)
  ]);

  return resSupabase.status === "fulfilled" || resFirebase.status === "fulfilled";
}

/**
 * الإعلانات
 */
export function subscribeAds(callback) {
  return FirebaseDB.subscribeAds(callback);
}

export async function saveAds(adsConfig) {
  await Promise.allSettled([
    SupabaseDB.saveSettingsSupabase("ads", adsConfig),
    FirebaseDB.saveAdsCloud(adsConfig)
  ]);
}

/**
 * الزوار
 */
export function subscribeVisitors(callback) {
  return FirebaseDB.subscribeVisitors(callback);
}

export async function updateVisitors(count) {
  await Promise.allSettled([
    SupabaseDB.saveSettingsSupabase("visitors", { count }),
    FirebaseDB.updateVisitorsCloud(count)
  ]);
}

export async function incrementVisitorCounter() {
  return await FirebaseDB.incrementVisitorCounter();
}

// Aliases for compatibility
export const saveAppointmentCloud = saveAppointment;
export const updateAppointmentStatusCloud = updateAppointmentStatus;
export const deleteAppointmentCloud = deleteAppointment;
export const saveBarberCloud = saveBarber;
export const deleteBarberCloud = deleteBarber;
export const saveAdsCloud = saveAds;
export const updateVisitorsCloud = updateVisitors;

