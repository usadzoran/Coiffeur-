/**
 * صالون المقص الذهبي - بن فريحة، وهران
 * ربط مباشر وحقيقي مع Firebase Realtime Database & Analytics
 * Project: ykin-1241b
 * Database URL: https://ykin-1241b.firebaseio.com
 */

import { initializeApp } from "firebase/app";
import { 
  getDatabase, 
  ref, 
  set, 
  get, 
  update, 
  remove, 
  onValue 
} from "firebase/database";
import { getAnalytics, isSupported } from "firebase/analytics";

// إعدادات Firebase الخاصة بالمستخدم الحقيقية
export const firebaseConfig = {
  apiKey: "AIzaSyB_NjKpEHk26YxI-syGN85Abfk7ch6OzVE",
  authDomain: "ykin-1241b.firebaseapp.com",
  databaseURL: "https://ykin-1241b.firebaseio.com",
  projectId: "ykin-1241b",
  storageBucket: "ykin-1241b.firebasestorage.app",
  messagingSenderId: "500494799376",
  appId: "1:500494799376:web:14bada44cb2453df2b3095",
  measurementId: "G-90P60ZZSBZ"
};

// Initialize Firebase App
export const app = initializeApp(firebaseConfig);

// Initialize Firebase Realtime Database
export const rtdb = getDatabase(app, firebaseConfig.databaseURL);

// Initialize Analytics conditionally (only supported in browser environments)
export let analytics = null;
if (typeof window !== "undefined") {
  isSupported().then((supported) => {
    if (supported) {
      try {
        analytics = getAnalytics(app);
        console.log("Firebase Analytics (G-90P60ZZSBZ) initialized.");
      } catch (e) {
        console.warn("Firebase Analytics skipped:", e);
      }
    }
  }).catch(() => {});
}

// ==========================================
// 1. إدارة المواعيد الحقيقية (Realtime Database /appointments)
// ==========================================

/**
 * الاشتراك اللحظي في جميع المواعيد من Realtime Database
 * @param {Function} callback يتم استدعاؤه فورياً عند أي حجز جديد أو تغيير حالة
 */
export function subscribeAppointments(callback) {
  try {
    const apptsRef = ref(rtdb, "appointments");
    return onValue(apptsRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const items = Object.keys(data).map(key => ({
          id: key,
          ...data[key]
        }));
        // ترتيب المواعيد: الأحدث أولاً
        items.sort((a, b) => {
          const timeA = new Date(a.createdAt || a.date).getTime() || 0;
          const timeB = new Date(b.createdAt || b.date).getTime() || 0;
          return timeB - timeA;
        });
        callback(items);
      } else {
        callback([]);
      }
    }, (error) => {
      console.warn("RTDB appointments warning:", error.message);
    });
  } catch (err) {
    console.warn("Error subscribing to RTDB appointments:", err);
    return () => {};
  }
}

/**
 * إضافة حجز جديد حقيقي إلى Firebase Realtime Database
 */
export async function saveAppointmentCloud(appt) {
  try {
    const apptRef = ref(rtdb, `appointments/${appt.id}`);
    await set(apptRef, {
      ...appt,
      updatedAt: new Date().toISOString()
    });
    console.log("Appointment saved to Firebase RTDB:", appt.id);
    return true;
  } catch (err) {
    console.warn("Failed to save appointment to Realtime Database:", err);
    return false;
  }
}

/**
 * تغيير حالة الموعد (قبول / رفض) من قبل الحلاق في Realtime Database
 */
export async function updateAppointmentStatusCloud(apptId, status) {
  try {
    const apptRef = ref(rtdb, `appointments/${apptId}`);
    await update(apptRef, {
      status: status,
      updatedAt: new Date().toISOString()
    });
    console.log(`Appointment ${apptId} status updated to ${status} in RTDB`);
    return true;
  } catch (err) {
    console.warn("Failed to update appointment status in Realtime Database:", err);
    return false;
  }
}

/**
 * حذف موعد من Realtime Database
 */
export async function deleteAppointmentCloud(apptId) {
  try {
    const apptRef = ref(rtdb, `appointments/${apptId}`);
    await remove(apptRef);
    console.log("Appointment deleted from RTDB:", apptId);
    return true;
  } catch (err) {
    console.warn("Failed to delete appointment from Realtime Database:", err);
    return false;
  }
}

// ==========================================
// 2. إدارة الحلاقين الحقيقية (Realtime Database /barbers)
// ==========================================

/**
 * الاشتراك اللحظي في قائمة الحلاقين
 */
export function subscribeBarbers(callback) {
  try {
    const barbersRef = ref(rtdb, "barbers");
    return onValue(barbersRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const items = Object.keys(data).map(key => ({
          id: key,
          ...data[key]
        }));
        callback(items);
      }
    }, (error) => {
      console.warn("RTDB barbers warning:", error.message);
    });
  } catch (err) {
    console.warn("Error subscribing to RTDB barbers:", err);
    return () => {};
  }
}

/**
 * تهيئة الحلاقين الـ ٣ الأساسيين في Realtime Database إذا كانت القاعدة جديدة
 */
export async function seedBarbersIfEmpty(defaultBarbers) {
  try {
    const barbersRef = ref(rtdb, "barbers");
    const snapshot = await get(barbersRef);
    if (!snapshot.exists() && defaultBarbers && defaultBarbers.length > 0) {
      console.log("Seeding initial barbers to Firebase Realtime Database (ykin-1241b)...");
      const seedObj = {};
      defaultBarbers.forEach(b => {
        seedObj[b.id] = b;
      });
      await set(barbersRef, seedObj);
      console.log("Barbers seeded to Realtime Database successfully!");
    }
  } catch (err) {
    console.warn("Barbers seeding in RTDB skipped or pending:", err.message);
  }
}

/**
 * حفظ / تعديل بيانات حلاق في Realtime Database
 */
export async function saveBarberCloud(barber) {
  try {
    const barberRef = ref(rtdb, `barbers/${barber.id}`);
    await set(barberRef, {
      ...barber,
      updatedAt: new Date().toISOString()
    });
    console.log("Barber saved to Firebase RTDB:", barber.name);
    return true;
  } catch (err) {
    console.warn("Failed to save barber to Realtime Database:", err);
    return false;
  }
}

/**
 * حذف حلاق من Realtime Database
 */
export async function deleteBarberCloud(barberId) {
  try {
    const barberRef = ref(rtdb, `barbers/${barberId}`);
    await remove(barberRef);
    console.log("Barber removed from RTDB:", barberId);
    return true;
  } catch (err) {
    console.warn("Failed to delete barber from Realtime Database:", err);
    return false;
  }
}

// ==========================================
// 3. إدارة الإعلانات الحقيقية (Realtime Database /ads)
// ==========================================

/**
 * الاشتراك اللحظي في أكواد الإعلانات HTML
 */
export function subscribeAds(callback) {
  try {
    const adsRef = ref(rtdb, "ads");
    return onValue(adsRef, (snapshot) => {
      if (snapshot.exists()) {
        callback(snapshot.val());
      }
    }, (error) => {
      console.warn("RTDB ads warning:", error.message);
    });
  } catch (err) {
    console.warn("Error subscribing to RTDB ads:", err);
    return () => {};
  }
}

/**
 * حفظ كود الإعلانات HTML في Realtime Database
 */
export async function saveAdsCloud(adsConfig) {
  try {
    const adsRef = ref(rtdb, "ads");
    await set(adsRef, adsConfig);
    console.log("Ads published to Firebase RTDB!");
    return true;
  } catch (err) {
    console.warn("Failed to save ads to Realtime Database:", err);
    return false;
  }
}

// ==========================================
// 4. عداد الزوار الحقيقي (Realtime Database /visitors)
// ==========================================

/**
 * الاشتراك اللحظي في عداد زوار الموقع
 */
export function subscribeVisitors(callback) {
  try {
    const visitorsRef = ref(rtdb, "visitors");
    return onValue(visitorsRef, (snapshot) => {
      if (snapshot.exists() && typeof snapshot.val() === "number") {
        callback(snapshot.val());
      }
    }, (error) => {
      console.warn("RTDB visitors warning:", error.message);
    });
  } catch (err) {
    console.warn("Error subscribing to RTDB visitors:", err);
    return () => {};
  }
}

/**
 * تحديث أو تصفير عداد الزوار في Realtime Database
 */
export async function updateVisitorsCloud(count) {
  try {
    const visitorsRef = ref(rtdb, "visitors");
    await set(visitorsRef, count);
    return true;
  } catch (err) {
    console.warn("Failed to update visitors in Realtime Database:", err);
    return false;
  }
}

/**
 * زيادة عداد الزوار بمقدار 1 في Realtime Database
 */
export async function incrementVisitorCounter() {
  try {
    const visitorsRef = ref(rtdb, "visitors");
    const snapshot = await get(visitorsRef);
    let cur = 0;
    if (snapshot.exists() && typeof snapshot.val() === "number") {
      cur = snapshot.val();
    }
    const next = cur + 1;
    await set(visitorsRef, next);
    return next;
  } catch (err) {
    console.warn("Failed to increment visitor counter in RTDB:", err);
    return null;
  }
}
