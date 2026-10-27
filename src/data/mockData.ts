import { Barber, Service, Appointment } from '../types/barber';
import heroImg from '../assets/images/hero_barbershop_1792939476848.jpg';
import karimImg from '../assets/images/barber_karim_1792939478110.jpg';
import youssefImg from '../assets/images/barber_youssef_1792939479092.jpg';
import samiImg from '../assets/images/barber_sami_1792939479036.jpg';

export const HERO_IMAGE = heroImg;

export const INITIAL_BARBERS: Barber[] = [
  {
    id: 'barber-1',
    name: 'كريم الساحلي',
    title: 'كبير الحلاقين (Master Barber)',
    bio: 'خبير التدرج الكلاسيكي وقصات اللحية الملكية بخبرة تتجاوز 8 سنوات في أرقى صالونات الحلاقة.',
    experienceYears: 8,
    rating: 4.9,
    reviewsCount: 184,
    image: karimImg,
    chairNumber: 1,
    workingHours: {
      start: '10:00',
      end: '22:00',
      daysOff: [0], // الأحد عطلة
    },
    specialties: ['التدرج الملكي Fade', 'تحديد اللحية بالخيط والشفرة', 'باقات الـ VIP'],
  },
  {
    id: 'barber-2',
    name: 'يوسف التميمي',
    title: 'أخصائي القصات العصرية والتصفيف',
    bio: 'شغوف بالتسريحات الشبابية الحديثة، التنعيم الكيراتيني، وقصات التدرج الإيطالي العصرية.',
    experienceYears: 6,
    rating: 4.8,
    reviewsCount: 142,
    image: youssefImg,
    chairNumber: 2,
    workingHours: {
      start: '11:00',
      end: '23:00',
      daysOff: [1], // الإثنين عطلة
    },
    specialties: ['القصات الحديثة Modern Cuts', 'علاجات التنعيم والتصفيف', 'تلوين وتمويه الشيب'],
  },
  {
    id: 'barber-3',
    name: 'سامي الجابري',
    title: 'خبير الشفرة التقليدية والفوطة الساخنة',
    bio: 'متخصص في الحلاقة التقليدية بالموس المستقيم، تقشير البشرة، والمساج الملكي للفروة والرقبة.',
    experienceYears: 5,
    rating: 4.9,
    reviewsCount: 119,
    image: samiImg,
    chairNumber: 3,
    workingHours: {
      start: '12:00',
      end: '23:30',
      daysOff: [2], // الثلاثاء عطلة
    },
    specialties: ['حلاقة الشفرة الإيطالية', 'الفوطة الساخنة والزيوت الطبيعية', 'تقشير وتنظيف البشرة'],
  },
];

export const INITIAL_SERVICES: Service[] = [
  {
    id: 'srv-1',
    name: 'قص شعر احترافي كلاسيكي / عصري',
    description: 'قص دقيق مع غسيل مائي منعش، تصفيف احترافي، ومساج سريع للرأس.',
    durationMinutes: 35,
    price: 90,
    category: 'hair',
  },
  {
    id: 'srv-2',
    name: 'تحديد وتنسيق اللحية مع الزيوت الملكية',
    description: 'تحديد حواف اللحية بالموس وشفرة خاصة، تشذيب الحجم وترطيب بزيوت الأرجان وخشب الصندل.',
    durationMinutes: 25,
    price: 60,
    category: 'beard',
  },
  {
    id: 'srv-3',
    name: 'باقة المقص الذهبي الكاملة (VIP Package)',
    description: 'قص وتصفيف الشعر + تحديد لحية ملكي + كمادات فوطة ساخنة عطرية + قناع طين كوري للوجه.',
    durationMinutes: 60,
    price: 150,
    category: 'combo',
  },
  {
    id: 'srv-4',
    name: 'حلاقة الذقن بالشفرة التقليدية والفوطة الساخنة',
    description: 'رغوة ساخنة غنية، حلاقة بالموس المستقيم الدقيق، كمادة باردة لمنع التحسس وعطر لافندر.',
    durationMinutes: 30,
    price: 70,
    category: 'spa',
  },
  {
    id: 'srv-5',
    name: 'تنظيف عميق للبشرة ومساج للرقبة والكتفين',
    description: 'إزالة الرؤوس السوداء، بخار عشبي، وماسك ترطيب لإعادة الحيوية والنشاط.',
    durationMinutes: 40,
    price: 100,
    category: 'spa',
  },
  {
    id: 'srv-6',
    name: 'تمويه شيب اللحية والشعر بمظهر طبيعي',
    description: 'صبغة رجالية بدون أمونيا تعطي تغطية ناعمة للشيب بدون أثر مصطنع تدوم لأسابيع.',
    durationMinutes: 30,
    price: 80,
    category: 'beard',
  },
];

// Generate dynamic dates (today, tomorrow, next day)
const today = new Date();
const formatDate = (date: Date): string => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const getFutureDate = (daysAhead: number): string => {
  const d = new Date();
  d.setDate(today.getDate() + daysAhead);
  return formatDate(d);
};

export const INITIAL_APPOINTMENTS: Appointment[] = [
  // Appointments for Barber 1 (كريم)
  {
    id: 'apt-101',
    barberId: 'barber-1',
    serviceId: 'srv-3',
    clientName: 'عبدالله المنصور',
    clientPhone: '0501234567',
    clientNotes: 'عندي مناسبة زواج مساءً، أرجو الاهتمام بتنسيق اللحية والقصة الكلاسيكية.',
    date: getFutureDate(0), // Today
    time: '16:00',
    durationMinutes: 60,
    totalPrice: 150,
    status: 'pending', // Pending Karim's approval!
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: 'apt-102',
    barberId: 'barber-1',
    serviceId: 'srv-1',
    clientName: 'طارق الزهراني',
    clientPhone: '0559876543',
    clientNotes: 'تدرج متوسط Fade مع تخفيف خفيف من الأعلى.',
    date: getFutureDate(0), // Today
    time: '18:00',
    durationMinutes: 35,
    totalPrice: 90,
    status: 'confirmed', // Already accepted by Karim
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
  },
  {
    id: 'apt-103',
    barberId: 'barber-1',
    serviceId: 'srv-2',
    clientName: 'فيصل الغامدي',
    clientPhone: '0543322110',
    clientNotes: 'تحديد دقيق للحية فقط، بدون حلاقة الشعر.',
    date: getFutureDate(1), // Tomorrow
    time: '17:30',
    durationMinutes: 25,
    totalPrice: 60,
    status: 'pending', // Waiting for Karim's review
    createdAt: new Date(Date.now() - 3600000 * 1).toISOString(),
  },

  // Appointments for Barber 2 (يوسف)
  {
    id: 'apt-201',
    barberId: 'barber-2',
    serviceId: 'srv-1',
    clientName: 'ريان الحربي',
    clientPhone: '0567788990',
    clientNotes: 'قصة عصرية تكستشر (Textured crop) مع تدرج حاد.',
    date: getFutureDate(0), // Today
    time: '15:00',
    durationMinutes: 35,
    totalPrice: 90,
    status: 'pending', // Waiting for Youssef
    createdAt: new Date(Date.now() - 3600000 * 3).toISOString(),
  },
  {
    id: 'apt-202',
    barberId: 'barber-2',
    serviceId: 'srv-6',
    clientName: 'ماجد العتيبي',
    clientPhone: '0591122334',
    clientNotes: 'تمويه شيب اللحية فقط بلون بني طبيعي.',
    date: getFutureDate(0), // Today
    time: '19:00',
    durationMinutes: 30,
    totalPrice: 80,
    status: 'confirmed',
    createdAt: new Date(Date.now() - 3600000 * 8).toISOString(),
  },
  {
    id: 'apt-203',
    barberId: 'barber-2',
    serviceId: 'srv-3',
    clientName: 'أحمد الصالح',
    clientPhone: '0534455667',
    clientNotes: 'حجز موعد مسائي يوم غد بعد صلاة العشاء.',
    date: getFutureDate(1),
    time: '20:30',
    durationMinutes: 60,
    totalPrice: 150,
    status: 'pending',
    createdAt: new Date(Date.now() - 3600000 * 0.5).toISOString(),
  },

  // Appointments for Barber 3 (سامي)
  {
    id: 'apt-301',
    barberId: 'barber-3',
    serviceId: 'srv-4',
    clientName: 'خالد السبيعي',
    clientPhone: '0505544332',
    clientNotes: 'بشرة حساسة، يفضل استخدام مرهم قبل الشفرة وفوطة دافئة معتدلة.',
    date: getFutureDate(0), // Today
    time: '17:00',
    durationMinutes: 30,
    totalPrice: 70,
    status: 'pending', // Waiting for Sami
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
  },
  {
    id: 'apt-302',
    barberId: 'barber-3',
    serviceId: 'srv-5',
    clientName: 'سعود الشهري',
    clientPhone: '0589988776',
    clientNotes: 'جلسة تنظيف عميق ومساج رقبة بعد يوم عمل شاق.',
    date: getFutureDate(0), // Today
    time: '21:00',
    durationMinutes: 40,
    totalPrice: 100,
    status: 'confirmed',
    createdAt: new Date(Date.now() - 3600000 * 7).toISOString(),
  },
];
