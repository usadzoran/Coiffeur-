/**
 * صالون المقص الذهبي - بن فريحة، وهران
 * إعداد وربط فايربيس (Firebase Firestore & Analytics)
 * Project: ykin-1241b
 */

import { initializeApp } from "firebase/app";
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  onSnapshot,
  query,
  orderBy
} from "firebase/firestore";
import { getAnalytics, isSupported } from "firebase/analytics";

// Your web app's Firebase configuration (provided by user)
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

// Initialize Firestore
export const db = getFirestore(app);

// Initialize Analytics conditionally (only supported in browser environments)
export let analytics = null;
if (typeof window !== "undefined") {
  isSupported().then((supported) => {
    if (supported) {
      try {
        analytics = getAnalytics(app);
        console.log("Firebase Analytics initialized successfully (G-90P60ZZSBZ)");
      } catch (e) {
        console.warn("Firebase Analytics initialization skipped:", e);
      }
    }
  }).catch(() => {});
}

// Collections References
const APPOINTMENTS_COL = "appointments";
const BARBERS_COL = "barbers";
const SETTINGS_COL = "settings";

// --- Appointments Cloud Sync ---

/**
 * Real-time listener for appointments
 * @param {Function} callback (appointmentsList) => void
 * @returns {Function} unsubscribe function
 */
export function subscribeAppointments(callback) {
  try {
    const q = collection(db, APPOINTMENTS_COL);
    return onSnapshot(q, (snapshot) => {
      const items = [];
      snapshot.forEach((docSnap) => {
        items.push({ id: docSnap.id, ...docSnap.data() });
      });
      // Sort by createdAt or date descending if available
      items.sort((a, b) => {
        const timeA = new Date(a.createdAt || a.date).getTime() || 0;
        const timeB = new Date(b.createdAt || b.date).getTime() || 0;
        return timeB - timeA;
      });
      callback(items);
    }, (error) => {
      console.warn("Firestore appointments subscription warning (falling back to local):", error.message);
    });
  } catch (err) {
    console.warn("Failed to subscribe to appointments:", err);
    return () => {};
  }
}

/**
 * Save / create new appointment in Firestore
 */
export async function saveAppointmentCloud(appt) {
  try {
    const docRef = doc(db, APPOINTMENTS_COL, appt.id);
    await setDoc(docRef, {
      ...appt,
      updatedAt: new Date().toISOString()
    }, { merge: true });
    return true;
  } catch (err) {
    console.warn("Failed to save appointment to Firestore:", err);
    return false;
  }
}

/**
 * Update appointment status (accepted / rejected / pending)
 */
export async function updateAppointmentStatusCloud(apptId, status) {
  try {
    const docRef = doc(db, APPOINTMENTS_COL, apptId);
    await updateDoc(docRef, {
      status: status,
      updatedAt: new Date().toISOString()
    });
    return true;
  } catch (err) {
    console.warn("Failed to update appointment status in Firestore:", err);
    return false;
  }
}

/**
 * Delete appointment from Firestore
 */
export async function deleteAppointmentCloud(apptId) {
  try {
    const docRef = doc(db, APPOINTMENTS_COL, apptId);
    await deleteDoc(docRef);
    return true;
  } catch (err) {
    console.warn("Failed to delete appointment from Firestore:", err);
    return false;
  }
}

// --- Barbers Cloud Sync ---

/**
 * Real-time listener for barbers
 */
export function subscribeBarbers(callback) {
  try {
    const q = collection(db, BARBERS_COL);
    return onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const items = [];
        snapshot.forEach((docSnap) => {
          items.push({ id: docSnap.id, ...docSnap.data() });
        });
        callback(items);
      }
    }, (error) => {
      console.warn("Firestore barbers subscription warning:", error.message);
    });
  } catch (err) {
    console.warn("Failed to subscribe to barbers:", err);
    return () => {};
  }
}

/**
 * Seed initial barbers if the collection is empty
 */
export async function seedBarbersIfEmpty(defaultBarbers) {
  try {
    const snapshot = await getDocs(collection(db, BARBERS_COL));
    if (snapshot.empty && defaultBarbers && defaultBarbers.length > 0) {
      console.log("Seeding initial barbers to Firestore ykin-1241b...");
      for (const barber of defaultBarbers) {
        await setDoc(doc(db, BARBERS_COL, barber.id), barber);
      }
      console.log("Initial barbers seeded successfully!");
    }
  } catch (err) {
    console.warn("Barber seeding check failed or skipped:", err.message);
  }
}

/**
 * Save / Update barber in Firestore
 */
export async function saveBarberCloud(barber) {
  try {
    const docRef = doc(db, BARBERS_COL, barber.id);
    await setDoc(docRef, {
      ...barber,
      updatedAt: new Date().toISOString()
    }, { merge: true });
    return true;
  } catch (err) {
    console.warn("Failed to save barber to Firestore:", err);
    return false;
  }
}

/**
 * Delete barber from Firestore
 */
export async function deleteBarberCloud(barberId) {
  try {
    const docRef = doc(db, BARBERS_COL, barberId);
    await deleteDoc(docRef);
    return true;
  } catch (err) {
    console.warn("Failed to delete barber from Firestore:", err);
    return false;
  }
}

// --- Ads & Settings Cloud Sync ---

/**
 * Real-time listener for Ads configuration
 */
export function subscribeAds(callback) {
  try {
    const docRef = doc(db, SETTINGS_COL, "ads");
    return onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        callback(docSnap.data());
      }
    }, (err) => {
      console.warn("Firestore ads subscription warning:", err.message);
    });
  } catch (err) {
    console.warn("Failed to subscribe to ads:", err);
    return () => {};
  }
}

/**
 * Save Ads configuration in Firestore
 */
export async function saveAdsCloud(adsConfig) {
  try {
    const docRef = doc(db, SETTINGS_COL, "ads");
    await setDoc(docRef, adsConfig, { merge: true });
    return true;
  } catch (err) {
    console.warn("Failed to save ads to Firestore:", err);
    return false;
  }
}

// --- Visitors Counter Cloud Sync ---

/**
 * Real-time listener for visitors count
 */
export function subscribeVisitors(callback) {
  try {
    const docRef = doc(db, SETTINGS_COL, "analytics");
    return onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists() && typeof docSnap.data().visitors === "number") {
        callback(docSnap.data().visitors);
      }
    }, (err) => {
      console.warn("Firestore visitors subscription warning:", err.message);
    });
  } catch (err) {
    console.warn("Failed to subscribe to visitors:", err);
    return () => {};
  }
}

/**
 * Set or increment visitor count in Firestore
 */
export async function updateVisitorsCloud(count) {
  try {
    const docRef = doc(db, SETTINGS_COL, "analytics");
    await setDoc(docRef, { visitors: count, updatedAt: new Date().toISOString() }, { merge: true });
    return true;
  } catch (err) {
    console.warn("Failed to update visitors in Firestore:", err);
    return false;
  }
}
