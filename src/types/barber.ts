export type AppointmentStatus = 'pending' | 'confirmed' | 'rejected' | 'completed' | 'rescheduled';

export interface Barber {
  id: string;
  name: string;
  title: string;
  bio: string;
  experienceYears: number;
  rating: number;
  reviewsCount: number;
  image: string;
  chairNumber: number;
  workingHours: {
    start: string; // e.g. "10:00"
    end: string;   // e.g. "22:00"
    daysOff: number[]; // 0: Sunday, 5: Friday, etc.
  };
  specialties: string[];
}

export interface Service {
  id: string;
  name: string;
  description: string;
  durationMinutes: number;
  price: number; // in USD or SAR
  category: 'hair' | 'beard' | 'combo' | 'spa';
}

export interface Appointment {
  id: string;
  barberId: string;
  serviceId: string;
  clientName: string;
  clientPhone: string;
  clientNotes?: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm e.g. "15:00"
  durationMinutes: number;
  totalPrice: number;
  status: AppointmentStatus;
  rejectionReason?: string;
  rescheduledTime?: string;
  createdAt: string; // ISO date
  updatedAt?: string;
}

export interface TimeSlot {
  time: string;
  available: boolean;
  appointmentId?: string;
}

export interface BarberCredential {
  barberId: string; // 'barber-1', 'barber-2', 'barber-3', or 'owner'
  barberName: string;
  username: string;
  password: string; // provided and managed by owner
  role: 'barber' | 'owner';
  lastLogin?: string;
}

export interface AuthSession {
  barberId: string;
  barberName: string;
  role: 'barber' | 'owner';
  username: string;
  token: string;
}

export type AdLocation = 'top_banner' | 'mid_content' | 'footer_banner';

export interface AdSlot {
  id: string;
  location: AdLocation;
  title: string;
  description: string;
  htmlContent: string;
  enabled: boolean;
  updatedAt?: string;
}

export interface VisitorStats {
  totalVisits: number;
  uniqueVisitors: number;
  todayVisits: number;
  lastVisitDate: string;
  history: { date: string; count: number }[];
}


