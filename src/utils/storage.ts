import { Appointment, Barber, Service } from '../types/barber';
import { INITIAL_APPOINTMENTS, INITIAL_BARBERS, INITIAL_SERVICES } from '../data/mockData';

const APPOINTMENTS_KEY = 'golden_shears_appointments_v1';
const BARBERS_KEY = 'golden_shears_barbers_v1';
const SERVICES_KEY = 'golden_shears_services_v1';

// Safe in-memory fallbacks when localStorage / sessionStorage are restricted or throw
const memoryStorage = new Map<string, string>();
const memorySessionStorage = new Map<string, string>();

export const safeGet = (key: string): string | null => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage.getItem(key);
    }
  } catch {
    // Storage restricted or disabled
  }
  return memoryStorage.get(key) ?? null;
};

export const safeSet = (key: string, value: string): void => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(key, value);
    }
  } catch {
    // Storage restricted or disabled
  }
  memoryStorage.set(key, value);
};

export const safeRemove = (key: string): void => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.removeItem(key);
    }
  } catch {
    // Storage restricted or disabled
  }
  memoryStorage.delete(key);
};

export const safeSessionGet = (key: string): string | null => {
  try {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      return window.sessionStorage.getItem(key);
    }
  } catch {
    // Storage restricted or disabled
  }
  return memorySessionStorage.get(key) ?? null;
};

export const safeSessionSet = (key: string, value: string): void => {
  try {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      window.sessionStorage.setItem(key, value);
    }
  } catch {
    // Storage restricted or disabled
  }
  memorySessionStorage.set(key, value);
};

const dispatchStorageUpdate = () => {
  try {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('barbershop-storage-updated'));
    }
  } catch {
    // Ignore dispatch error in constrained iframe
  }
};

export const getStoredBarbers = (): Barber[] => {
  try {
    const raw = safeGet(BARBERS_KEY);
    if (!raw) {
      safeSet(BARBERS_KEY, JSON.stringify(INITIAL_BARBERS));
      return INITIAL_BARBERS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_BARBERS;
  } catch {
    return INITIAL_BARBERS;
  }
};

export const getStoredServices = (): Service[] => {
  try {
    const raw = safeGet(SERVICES_KEY);
    if (!raw) {
      safeSet(SERVICES_KEY, JSON.stringify(INITIAL_SERVICES));
      return INITIAL_SERVICES;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_SERVICES;
  } catch {
    return INITIAL_SERVICES;
  }
};

export const getStoredAppointments = (): Appointment[] => {
  try {
    const raw = safeGet(APPOINTMENTS_KEY);
    if (!raw) {
      safeSet(APPOINTMENTS_KEY, JSON.stringify(INITIAL_APPOINTMENTS));
      return INITIAL_APPOINTMENTS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : INITIAL_APPOINTMENTS;
  } catch {
    return INITIAL_APPOINTMENTS;
  }
};

export const saveAppointments = (appointments: Appointment[]) => {
  safeSet(APPOINTMENTS_KEY, JSON.stringify(appointments));
  dispatchStorageUpdate();
};

export const addAppointment = (newAppt: Omit<Appointment, 'id' | 'createdAt' | 'status'>): Appointment => {
  const current = getStoredAppointments();
  const appointment: Appointment = {
    ...newAppt,
    id: `apt-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    status: 'pending', // All new appointments start as pending barber's decision
    createdAt: new Date().toISOString(),
  };
  const updated = [appointment, ...current];
  saveAppointments(updated);
  return appointment;
};

export const updateAppointmentStatus = (
  id: string,
  status: Appointment['status'],
  extra?: { rejectionReason?: string; rescheduledTime?: string }
): Appointment | null => {
  const current = getStoredAppointments();
  let updatedAppt: Appointment | null = null;
  const updated = current.map((item) => {
    if (item.id === id) {
      updatedAppt = {
        ...item,
        status,
        rejectionReason: extra?.rejectionReason ?? item.rejectionReason,
        rescheduledTime: extra?.rescheduledTime ?? item.rescheduledTime,
        updatedAt: new Date().toISOString(),
      };
      return updatedAppt;
    }
    return item;
  });

  if (updatedAppt) {
    saveAppointments(updated);
  }
  return updatedAppt;
};

export const resetToDefaults = () => {
  safeSet(BARBERS_KEY, JSON.stringify(INITIAL_BARBERS));
  safeSet(SERVICES_KEY, JSON.stringify(INITIAL_SERVICES));
  safeSet(APPOINTMENTS_KEY, JSON.stringify(INITIAL_APPOINTMENTS));
  safeSet(CREDENTIALS_KEY, JSON.stringify(DEFAULT_CREDENTIALS));
  safeRemove(SESSION_KEY);
  dispatchStorageUpdate();
};

const CREDENTIALS_KEY = 'golden_shears_credentials_v1';
const SESSION_KEY = 'golden_shears_session_v1';

export const DEFAULT_CREDENTIALS: BarberCredential[] = [
  {
    barberId: 'barber-1',
    barberName: 'كريم الساحلي',
    username: 'karim',
    password: 'karim123',
    role: 'barber',
  },
  {
    barberId: 'barber-2',
    barberName: 'يوسف التميمي',
    username: 'youssef',
    password: 'youssef123',
    role: 'barber',
  },
  {
    barberId: 'barber-3',
    barberName: 'سامي الجابري',
    username: 'sami',
    password: 'sami123',
    role: 'barber',
  },
  {
    barberId: 'owner',
    barberName: 'صاحب الصالون (المدير)',
    username: 'admin',
    password: 'admin123',
    role: 'owner',
  },
];

import { BarberCredential, AuthSession } from '../types/barber';

export const getStoredCredentials = (): BarberCredential[] => {
  try {
    const raw = safeGet(CREDENTIALS_KEY);
    if (!raw) {
      safeSet(CREDENTIALS_KEY, JSON.stringify(DEFAULT_CREDENTIALS));
      return DEFAULT_CREDENTIALS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_CREDENTIALS;
  } catch {
    return DEFAULT_CREDENTIALS;
  }
};

export const saveCredentials = (credentials: BarberCredential[]) => {
  safeSet(CREDENTIALS_KEY, JSON.stringify(credentials));
  dispatchStorageUpdate();
};

export const updateBarberCredential = (
  barberId: string,
  newUsername: string,
  newPassword: string
): boolean => {
  const current = getStoredCredentials();
  const updated = current.map((c) => {
    if (c.barberId === barberId) {
      return {
        ...c,
        username: newUsername.trim(),
        password: newPassword.trim(),
      };
    }
    return c;
  });
  saveCredentials(updated);
  return true;
};

export const getCurrentSession = (): AuthSession | null => {
  try {
    const raw = safeGet(SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

export const setCurrentSession = (session: AuthSession | null) => {
  if (session) {
    safeSet(SESSION_KEY, JSON.stringify(session));
  } else {
    safeRemove(SESSION_KEY);
  }
  dispatchStorageUpdate();
};

export const loginBarber = (usernameInput: string, passwordInput: string): { success: boolean; session?: AuthSession; message?: string } => {
  const credentials = getStoredCredentials();
  const matched = credentials.find(
    (c) =>
      c.username.toLowerCase() === usernameInput.trim().toLowerCase() &&
      c.password === passwordInput.trim()
  );

  if (!matched) {
    return {
      success: false,
      message: 'اسم المستخدم أو كلمة المرور غير صحيحة. يرجى التحقق من البيانات المسندة لك.',
    };
  }

  const session: AuthSession = {
    barberId: matched.barberId,
    barberName: matched.barberName,
    role: matched.role,
    username: matched.username,
    token: `token-${Date.now()}-${Math.random()}`,
  };

  setCurrentSession(session);
  return { success: true, session };
};

export const logoutBarber = () => {
  setCurrentSession(null);
};

// ==========================================
// 1. Barber Creation & Deletion (Owner Portal)
// ==========================================
export const addNewBarber = (
  barberData: Omit<Barber, 'id'>,
  credentials: { username: string; password: string }
): { barber: Barber; credential: BarberCredential } => {
  const currentBarbers = getStoredBarbers();
  const newId = `barber-${Date.now()}`;
  const newBarber: Barber = {
    ...barberData,
    id: newId,
  };
  const updatedBarbers = [...currentBarbers, newBarber];
  safeSet(BARBERS_KEY, JSON.stringify(updatedBarbers));

  const currentCreds = getStoredCredentials();
  const newCred: BarberCredential = {
    barberId: newId,
    barberName: newBarber.name,
    username: credentials.username.trim(),
    password: credentials.password.trim(),
    role: 'barber',
  };
  const updatedCreds = [...currentCreds, newCred];
  saveCredentials(updatedCreds);

  dispatchStorageUpdate();
  return { barber: newBarber, credential: newCred };
};

export const deleteBarber = (barberId: string): boolean => {
  const currentBarbers = getStoredBarbers();
  const updatedBarbers = currentBarbers.filter((b) => b.id !== barberId);
  safeSet(BARBERS_KEY, JSON.stringify(updatedBarbers));

  const currentCreds = getStoredCredentials();
  const updatedCreds = currentCreds.filter((c) => c.barberId !== barberId);
  saveCredentials(updatedCreds);

  dispatchStorageUpdate();
  return true;
};

// ==========================================
// 2. Custom HTML Ad Slots Management
// ==========================================
const ADS_KEY = 'golden_shears_ads_v1';

import { AdSlot, VisitorStats } from '../types/barber';

export const DEFAULT_ADS: AdSlot[] = [
  {
    id: 'ad-top',
    location: 'top_banner',
    title: 'إعلان أعلى الصفحة (Top Header Banner)',
    description: 'يظهر أسفل القائمة الرئيسية مباشرة في كل صفحات الموقع',
    enabled: true,
    htmlContent: `<div style="background: linear-gradient(90deg, #1c1917, #292524, #1c1917); border: 1px solid #78350f; border-radius: 12px; padding: 10px 16px; text-align: center; color: #fef3c7; font-size: 13px; display: flex; align-items: center; justify-content: center; gap: 8px;">
  <span style="background: #f59e0b; color: #1c1917; padding: 2px 8px; border-radius: 6px; font-weight: bold; font-size: 11px;">عرض خاص</span>
  <span>احصل على خصم 20% على باقة VIP الكاملة عند الحجز أونلاين طوال هذا الأسبوع! كود: <strong>VIP2026</strong></span>
</div>`,
  },
  {
    id: 'ad-mid',
    location: 'mid_content',
    title: 'إعلان وسط الصفحة (Mid Page Banner)',
    description: 'يظهر بين قسم الحلاقين الثلاثة وقسم الخدمات والأسعار',
    enabled: true,
    htmlContent: `<div style="background: #171717; border: 1px dashed #444; border-radius: 14px; padding: 16px; text-align: center; color: #d4d4d4;">
  <h4 style="margin: 0 0 6px 0; color: #fbbf24; font-size: 15px; font-weight: bold;">مساحة إعلانية متاحة للشراكات والرعايات</h4>
  <p style="margin: 0; font-size: 12px; color: #a3a3a3;">يمكنك لصق كود HTML المخصص من لوحة صاحب الصالون للإعلان عن منتجات العناية باللحية أو العطور الرجالية.</p>
</div>`,
  },
  {
    id: 'ad-footer',
    location: 'footer_banner',
    title: 'إعلان أسفل الموقع (Footer Banner Slot)',
    description: 'يظهر قبل تذييل الموقع في أسفل الصفحة الرئيسية',
    enabled: true,
    htmlContent: `<div style="background: #0c0a09; border: 1px solid #292524; border-radius: 12px; padding: 14px 20px; display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 12px;">
  <div style="display: flex; align-items: center; gap: 10px;">
    <div style="width: 36px; height: 36px; background: rgba(245, 158, 11, 0.15); border-radius: 8px; display: flex; align-items: center; justify-content: center; color: #f59e0b; font-size: 18px;">✂️</div>
    <div>
      <div style="color: #fff; font-weight: bold; font-size: 13px;">مجموعة الزيوت الطبيعية الملكية للرجال</div>
      <div style="color: #78716c; font-size: 11px;">زيوت أرجان وخشب الصندل الإيطالي متوفرة الآن في الصالون</div>
    </div>
  </div>
  <a href="#services-section" style="background: #f59e0b; color: #000; text-decoration: none; padding: 6px 14px; border-radius: 8px; font-weight: bold; font-size: 12px;">احجز جلستك الآن</a>
</div>`,
  },
];

export const getStoredAds = (): AdSlot[] => {
  try {
    const raw = safeGet(ADS_KEY);
    if (!raw) {
      safeSet(ADS_KEY, JSON.stringify(DEFAULT_ADS));
      return DEFAULT_ADS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_ADS;
  } catch {
    return DEFAULT_ADS;
  }
};

export const saveAds = (ads: AdSlot[]) => {
  safeSet(ADS_KEY, JSON.stringify(ads));
  dispatchStorageUpdate();
};

export const updateAdSlot = (id: string, htmlContent: string, enabled: boolean): boolean => {
  const current = getStoredAds();
  const updated = current.map((ad) => {
    if (ad.id === id) {
      return {
        ...ad,
        htmlContent,
        enabled,
        updatedAt: new Date().toISOString(),
      };
    }
    return ad;
  });
  saveAds(updated);
  return true;
};

// ==========================================
// 3. Visitor Tracking System
// ==========================================
const VISITOR_KEY = 'golden_shears_visitors_v1';
const CLIENT_UUID_KEY = 'golden_shears_client_uuid_v1';

export const getVisitorStats = (): VisitorStats => {
  const todayStr = new Date().toISOString().split('T')[0];
  try {
    const raw = safeGet(VISITOR_KEY);
    if (!raw) {
      const initial: VisitorStats = {
        totalVisits: 1420,
        uniqueVisitors: 890,
        todayVisits: 47,
        lastVisitDate: todayStr,
        history: [
          { date: '2026-10-20', count: 35 },
          { date: '2026-10-21', count: 42 },
          { date: '2026-10-22', count: 58 },
          { date: '2026-10-23', count: 64 },
          { date: '2026-10-24', count: 71 },
          { date: '2026-10-25', count: 83 },
          { date: todayStr, count: 47 },
        ],
      };
      safeSet(VISITOR_KEY, JSON.stringify(initial));
      return initial;
    }
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed.totalVisits === 'number' ? parsed : {
      totalVisits: 1420,
      uniqueVisitors: 890,
      todayVisits: 47,
      lastVisitDate: todayStr,
      history: [],
    };
  } catch {
    return {
      totalVisits: 1420,
      uniqueVisitors: 890,
      todayVisits: 47,
      lastVisitDate: todayStr,
      history: [],
    };
  }
};

export const recordVisit = (): VisitorStats => {
  const stats = getVisitorStats();
  const todayStr = new Date().toISOString().split('T')[0];

  try {
    // Check if unique
    let isUnique = false;
    if (!safeGet(CLIENT_UUID_KEY)) {
      safeSet(CLIENT_UUID_KEY, `user-${Date.now()}-${Math.random()}`);
      isUnique = true;
    }

    // Session check to avoid overcounting on fast page refresh
    const lastRecorded = safeSessionGet('session_visited_recorded');
    if (lastRecorded) {
      return stats;
    }
    safeSessionSet('session_visited_recorded', 'true');

    const newTotal = (stats?.totalVisits || 1420) + 1;
    const newUnique = isUnique ? (stats?.uniqueVisitors || 890) + 1 : (stats?.uniqueVisitors || 890);
    const newToday = stats?.lastVisitDate === todayStr ? (stats?.todayVisits || 0) + 1 : 1;

    // Update history
    const history = [...(stats?.history || [])];
    const todayIndex = history.findIndex((h) => h.date === todayStr);
    if (todayIndex >= 0) {
      history[todayIndex].count = newToday;
    } else {
      history.push({ date: todayStr, count: newToday });
    }

    const updatedStats: VisitorStats = {
      totalVisits: newTotal,
      uniqueVisitors: newUnique,
      todayVisits: newToday,
      lastVisitDate: todayStr,
      history: history.slice(-7), // keep last 7 days
    };

    safeSet(VISITOR_KEY, JSON.stringify(updatedStats));
    dispatchStorageUpdate();
    return updatedStats;
  } catch {
    return stats;
  }
};


