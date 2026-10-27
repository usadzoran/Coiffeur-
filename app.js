/**
 * صالون المقص الذهبي - بن فريحة، وهران
 * Golden Scissors Barbershop - Ben Freha, Oran
 * Vanilla JavaScript Core Application
 * متصل بـ Firebase Firestore (ykin-1241b)
 */

import {
  subscribeAppointments,
  subscribeBarbers,
  subscribeAds,
  subscribeVisitors,
  saveAppointmentCloud,
  seedBarbersIfEmpty,
  updateVisitorsCloud
} from "./firebase.js";

// Initial Seed Data
const DEFAULT_BARBERS = [
  {
    id: "barber-karim",
    name: "كريم بن عيسى",
    role: "خبير القصات الكلاسيكية وتصفيف اللحية الملكية",
    experience: "10 سنوات خبرة",
    rating: 4.9,
    reviewsCount: 142,
    phone: "0555 11 22 33",
    username: "karim",
    password: "karim123",
    image: "./public/images/barber_karim_1792939478110.jpg",
    fallbackImage: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=600&q=80",
    available: true,
    workingHours: "09:00 ص - 21:00 م"
  },
  {
    id: "barber-youssef",
    name: "يوسف بلحاج",
    role: "متخصص تدريج الشعر الفيد (Fade) ونحت اللحية",
    experience: "7 سنوات خبرة",
    rating: 4.9,
    reviewsCount: 118,
    phone: "0555 22 33 44",
    username: "youssef",
    password: "youssef123",
    image: "./public/images/barber_youssef_1792939479092.jpg",
    fallbackImage: "https://images.unsplash.com/photo-1622286342621-4bd786c2447c?auto=format&fit=crop&w=600&q=80",
    available: true,
    workingHours: "10:00 ص - 22:00 م"
  },
  {
    id: "barber-sami",
    name: "سامي بوعلام",
    role: "مصفف كبار الشخصيات VIP ومساج وعلاجات البروتين",
    experience: "8 سنوات خبرة",
    rating: 5.0,
    reviewsCount: 165,
    phone: "0555 33 44 55",
    username: "sami",
    password: "sami123",
    image: "./public/images/barber_sami_1792939479036.jpg",
    fallbackImage: "https://images.unsplash.com/photo-1517832606589-7629c3397143?auto=format&fit=crop&w=600&q=80",
    available: true,
    workingHours: "09:00 ص - 20:00 م"
  }
];

const DEFAULT_SERVICES = [
  {
    id: "srv-1",
    name: "قص شعر كلاسيكي أو عصري",
    price: 500,
    duration: 30,
    description: "قص متقن مع غسيل وسشوار ومستحضرات تصفيف فاخرة",
    icon: "✂️"
  },
  {
    id: "srv-2",
    name: "تدريج فيد (Fade) احترافي",
    price: 700,
    duration: 35,
    description: "تدريج عالي أو منخفض مع تصفيف الشعر الدقيق",
    icon: "💈"
  },
  {
    id: "srv-3",
    name: "حلاقة وتحديد اللحية بالشفرة",
    price: 400,
    duration: 25,
    description: "تحديد ملكي بالمنشفة الساخنة والزيوت الطبيعية",
    icon: "🪒"
  },
  {
    id: "srv-4",
    name: "باقة VIP المتكاملة الفاخرة",
    price: 1800,
    duration: 60,
    description: "قص شعر + لحية كاملة + قناع وجه بالكولاجين + مساج الرأس",
    icon: "👑"
  },
  {
    id: "srv-5",
    name: "صبغ الشعر واللحية الطبيعي",
    price: 1200,
    duration: 45,
    description: "إخفاء الشيب وتلوين احترافي بمواد إيطالية آمنة",
    icon: "🎨"
  },
  {
    id: "srv-6",
    name: "تنظيف البشرة العميق بالبخار",
    price: 1000,
    duration: 40,
    description: "إزالة الرؤوس السوداء وتقشير وماسك ترطيب منعش",
    icon: "✨"
  }
];

const DEFAULT_ADS = {
  header: {
    enabled: true,
    html: `<div style="background: linear-gradient(90deg, #92400e 0%, #d97706 50%, #b45309 100%); color: #fff; padding: 10px 16px; border-radius: 12px; display: flex; align-items: center; justify-content: space-between; gap: 12px; box-shadow: 0 4px 15px rgba(217, 119, 6, 0.25);">
      <div style="display: flex; align-items: center; gap: 10px; font-weight: 700; font-size: 0.95rem;">
        <span style="background: #fff; color: #b45309; padding: 2px 8px; border-radius: 6px; font-size: 0.8rem;">عرض خاص</span>
        <span>🎉 خصم 20% على باقة VIP الكاملة طيلة هذا الأسبوع لزبائن بن فريحة بوهران!</span>
      </div>
      <a href="#services" style="background: #111; color: #fef08a; padding: 6px 14px; border-radius: 8px; font-size: 0.85rem; font-weight: 700; text-decoration: none; white-space: nowrap;">استفد الآن</a>
    </div>`
  },
  middle: {
    enabled: true,
    html: `<div style="background: #17171d; border: 1px dashed #d97706; padding: 16px; border-radius: 14px; text-align: center;">
      <p style="color: #f59e0b; font-weight: 700; margin-bottom: 4px;">مساحة إعلانية مخصصة (وسط الموقع)</p>
      <p style="color: #a1a1aa; font-size: 0.85rem; margin-bottom: 8px;">يمكن لصاحب الصالون لصق أي كود إعلاني HTML (بنرات أو Google Ads) من لوحة الإدارة.</p>
      <span style="display: inline-block; background: #27272a; color: #e4e4e7; padding: 4px 12px; border-radius: 6px; font-size: 0.8rem;">رقم هاتف الصالون للاستفسار: 0555 12 34 56</span>
    </div>`
  },
  footer: {
    enabled: true,
    html: `<div style="background: linear-gradient(135deg, #18181b 0%, #27272a 100%); border: 1px solid #3f3f46; padding: 14px 20px; border-radius: 12px; display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 10px;">
      <div style="color: #f4f4f5; font-size: 0.9rem;">
        🌟 <strong>أفضل حلاقة في بن فريحة</strong> — موعدك محجوز باحترافية، بدون انتظار وبأعلى درجات التعقيم.
      </div>
      <a href="https://maps.app.goo.gl/ffo11T6RT3GXEPrj7" target="_blank" rel="noopener noreferrer" style="color: #f59e0b; font-weight: 700; font-size: 0.85rem; text-decoration: underline;">عرض الموقع في خرائط Google 📍</a>
    </div>`
  }
};

const DEFAULT_APPOINTMENTS = [
  {
    id: "GOLD-101",
    barberId: "barber-karim",
    barberName: "كريم بن عيسى",
    serviceId: "srv-1",
    serviceName: "قص شعر كلاسيكي أو عصري",
    servicePrice: 500,
    date: new Date().toISOString().split("T")[0],
    time: "15:00",
    clientName: "أحمد بن علي",
    clientPhone: "0661223344",
    notes: "قص خفيف مع تحديد دقيق",
    status: "accepted",
    createdAt: new Date(Date.now() - 3600000).toISOString()
  },
  {
    id: "GOLD-102",
    barberId: "barber-youssef",
    barberName: "يوسف بلحاج",
    serviceId: "srv-2",
    serviceName: "تدريج فيد (Fade) احترافي",
    servicePrice: 700,
    date: new Date().toISOString().split("T")[0],
    time: "16:30",
    clientName: "رياض وهراني",
    clientPhone: "0770556677",
    notes: "ميد فيد مع تحديد اللحية",
    status: "pending",
    createdAt: new Date().toISOString()
  },
  {
    id: "GOLD-103",
    barberId: "barber-sami",
    barberName: "سامي بوعلام",
    serviceId: "srv-4",
    serviceName: "باقة VIP المتكاملة الفاخرة",
    servicePrice: 1800,
    date: new Date(Date.now() + 86400000).toISOString().split("T")[0],
    time: "18:00",
    clientName: "بلال حراشي",
    clientPhone: "0550114488",
    notes: "تحضير لمناسبة عائلية",
    status: "pending",
    createdAt: new Date().toISOString()
  }
];

// LocalStorage Safe Utilities
function safeGet(key, defaultVal) {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultVal;
  } catch (e) {
    console.warn("Storage read failed for", key, e);
    return defaultVal;
  }
}

function safeSet(key, val) {
  try {
    localStorage.setItem(key, JSON.stringify(val));
    return true;
  } catch (e) {
    console.warn("Storage write failed for", key, e);
    return false;
  }
}

// App State
const State = {
  barbers: safeGet("barbershop_barbers", DEFAULT_BARBERS),
  services: safeGet("barbershop_services", DEFAULT_SERVICES),
  appointments: safeGet("barbershop_appointments", DEFAULT_APPOINTMENTS),
  ads: safeGet("barbershop_ads", DEFAULT_ADS),
  ownerPin: safeGet("barbershop_owner_pin", "admin2026"),
  currentBarberSession: safeGet("barbershop_active_barber", null),
  isOwnerLoggedIn: false,
  visitors: safeGet("barbershop_visitors", 486),
  selectedBarberForBooking: "",
  selectedServiceForBooking: ""
};

// Track visitor count once per session
(function recordVisit() {
  try {
    const visited = sessionStorage.getItem("barbershop_visited");
    if (!visited) {
      State.visitors += 1;
      safeSet("barbershop_visitors", State.visitors);
      updateVisitorsCloud(State.visitors);
      sessionStorage.setItem("barbershop_visited", "true");
    }
  } catch (e) {}
})();

// DOM Helpers
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);

// Toast Notification
function showToast(message, type = "info") {
  const container = $("#toast-container");
  if (!container) return;

  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  
  let icon = "🔔";
  if (type === "success") icon = "✅";
  if (type === "error") icon = "❌";
  if (type === "warning") icon = "⚠️";

  toast.innerHTML = `
    <span class="toast-icon">${icon}</span>
    <span class="toast-msg">${message}</span>
  `;

  container.appendChild(toast);
  setTimeout(() => {
    toast.classList.add("toast-show");
  }, 10);

  setTimeout(() => {
    toast.classList.remove("toast-show");
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

// Modal Management
function openModal(modalId) {
  const modal = $(modalId);
  if (modal) {
    modal.classList.add("modal-open");
    document.body.style.overflow = "hidden";
  }
}

function closeModal(modalId) {
  const modal = $(modalId);
  if (modal) {
    modal.classList.remove("modal-open");
    document.body.style.overflow = "auto";
  }
}

// RENDER FUNCTIONS

// Render Barbers List
function renderBarbers() {
  const container = $("#barbers-grid");
  if (!container) return;

  container.innerHTML = State.barbers.map(barber => {
    return `
      <div class="barber-card" data-id="${barber.id}">
        <div class="barber-img-wrap">
          <img 
            src="${barber.image}" 
            alt="${barber.name}"
            class="barber-img"
            loading="lazy"
            onerror="this.onerror=null; this.src='${barber.fallbackImage || 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=600&q=80'}';"
          />
          <div class="barber-badge-status ${barber.available ? 'badge-available' : 'badge-busy'}">
            <span class="dot"></span>
            ${barber.available ? 'متاح للحجز' : 'غير متاح حالياً'}
          </div>
          <div class="barber-rating-badge">
            <span class="star">★</span>
            <span class="rate-num">${barber.rating}</span>
            <span class="reviews-num">(${barber.reviewsCount || 100}+)</span>
          </div>
        </div>

        <div class="barber-info">
          <h3 class="barber-name">${barber.name}</h3>
          <p class="barber-role">${barber.role}</p>

          <div class="barber-meta-pills">
            <span class="meta-pill">⏱️ ${barber.experience}</span>
            <span class="meta-pill">🕒 ${barber.workingHours}</span>
          </div>

          <div class="barber-actions">
            <button 
              type="button" 
              class="btn-primary w-full book-with-barber-btn"
              data-barber-id="${barber.id}"
              data-barber-name="${barber.name}"
            >
              <span>احجز مع ${barber.name.split(' ')[0]}</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </button>
          </div>
        </div>
      </div>
    `;
  }).join("");

  // Attach booking buttons
  $$(".book-with-barber-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const barberId = btn.getAttribute("data-barber-id");
      openBookingModal(barberId);
    });
  });
}

// Render Services List
function renderServices() {
  const container = $("#services-grid");
  if (!container) return;

  container.innerHTML = State.services.map(srv => {
    return `
      <div class="service-card">
        <div class="service-header">
          <span class="service-icon">${srv.icon || '✂️'}</span>
          <div class="service-price-tag">
            <span class="price-val">${srv.price}</span>
            <span class="price-curr">د.ج</span>
          </div>
        </div>
        <h3 class="service-title">${srv.name}</h3>
        <p class="service-desc">${srv.description}</p>
        <div class="service-footer">
          <span class="service-duration">⏱️ ${srv.duration} دقيقة</span>
          <button 
            type="button" 
            class="btn-secondary btn-sm book-service-btn"
            data-service-id="${srv.id}"
            data-service-name="${srv.name}"
          >
            حجز هذه الخدمة
          </button>
        </div>
      </div>
    `;
  }).join("");

  // Attach buttons
  $$(".book-service-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const srvId = btn.getAttribute("data-service-id");
      openBookingModal(null, srvId);
    });
  });
}

// Render HTML Ads
function renderAds() {
  // Top Header Ad
  const headerAd = $("#ad-slot-header");
  if (headerAd) {
    if (State.ads.header && State.ads.header.enabled && State.ads.header.html) {
      headerAd.innerHTML = State.ads.header.html;
      headerAd.style.display = "block";
    } else {
      headerAd.style.display = "none";
    }
  }

  // Middle Ad
  const midAd = $("#ad-slot-middle");
  if (midAd) {
    if (State.ads.middle && State.ads.middle.enabled && State.ads.middle.html) {
      midAd.innerHTML = State.ads.middle.html;
      midAd.style.display = "block";
    } else {
      midAd.style.display = "none";
    }
  }

  // Footer Ad
  const footerAd = $("#ad-slot-footer");
  if (footerAd) {
    if (State.ads.footer && State.ads.footer.enabled && State.ads.footer.html) {
      footerAd.innerHTML = State.ads.footer.html;
      footerAd.style.display = "block";
    } else {
      footerAd.style.display = "none";
    }
  }
}

// Render Barber Select in Booking Modal
function updateBookingSelects() {
  const barberSelect = $("#booking-barber-select");
  if (barberSelect) {
    barberSelect.innerHTML = `
      <option value="">أي حلاق متاح (الأسرع دوراً)</option>
      ${State.barbers.map(b => `<option value="${b.id}">${b.name} (${b.role})</option>`).join("")}
    `;
  }

  const srvSelect = $("#booking-service-select");
  if (srvSelect) {
    srvSelect.innerHTML = `
      <option value="">اختر الخدمة المطلوبة...</option>
      ${State.services.map(s => `<option value="${s.id}">${s.name} - ${s.price} د.ج (${s.duration} د)</option>`).join("")}
    `;
  }
}

// Open Booking Modal with Pre-selection
function openBookingModal(preselectedBarberId = null, preselectedServiceId = null) {
  updateBookingSelects();
  
  const barberSelect = $("#booking-barber-select");
  if (barberSelect && preselectedBarberId) {
    barberSelect.value = preselectedBarberId;
  }

  const srvSelect = $("#booking-service-select");
  if (srvSelect && preselectedServiceId) {
    srvSelect.value = preselectedServiceId;
  }

  // Set default date to today or tomorrow
  const dateInput = $("#booking-date-input");
  if (dateInput) {
    const today = new Date().toISOString().split("T")[0];
    dateInput.min = today;
    if (!dateInput.value) {
      dateInput.value = today;
    }
  }

  // Reset confirmation screen
  $("#booking-form-wrap").style.display = "block";
  $("#booking-success-wrap").style.display = "none";

  openModal("#modal-booking");
}

// BOOKING SUBMISSION
function handleBookingSubmit(e) {
  e.preventDefault();

  const barberId = $("#booking-barber-select").value;
  const serviceId = $("#booking-service-select").value;
  const date = $("#booking-date-input").value;
  const time = $("#booking-time-select").value;
  const name = $("#booking-name-input").value.trim();
  const phone = $("#booking-phone-input").value.trim();
  const notes = $("#booking-notes-input").value.trim();

  if (!serviceId) {
    showToast("يرجى اختيار الخدمة المطلوبة", "warning");
    return;
  }
  if (!date) {
    showToast("يرجى اختيار تاريخ الموعد", "warning");
    return;
  }
  if (!time) {
    showToast("يرجى اختيار توقيت الموعد", "warning");
    return;
  }
  if (!name || name.length < 3) {
    showToast("يرجى كتابة اسمك الكامل بشكل صحيح", "warning");
    return;
  }
  if (!phone || phone.length < 9) {
    showToast("يرجى إدخال رقم هاتف صالح (مثال: 0555123456)", "warning");
    return;
  }

  // Find Barber and Service objects
  let assignedBarber = State.barbers.find(b => b.id === barberId);
  if (!assignedBarber) {
    // If "Any", pick first available
    assignedBarber = State.barbers[0];
  }

  const service = State.services.find(s => s.id === serviceId) || {
    name: "حلاقة مخصصة",
    price: 500
  };

  const bookingCode = "GOLD-" + Math.floor(1000 + Math.random() * 9000);

  const newAppointment = {
    id: bookingCode,
    barberId: assignedBarber.id,
    barberName: assignedBarber.name,
    serviceId: service.id,
    serviceName: service.name,
    servicePrice: service.price,
    date: date,
    time: time,
    clientName: name,
    clientPhone: phone,
    notes: notes,
    status: "pending", // Waiting for barber confirmation!
    createdAt: new Date().toISOString()
  };

  State.appointments.unshift(newAppointment);
  safeSet("barbershop_appointments", State.appointments);

  // Sync to Firebase Cloud Firestore (ykin-1241b)
  saveAppointmentCloud(newAppointment);

  // Render Confirmation details
  $("#success-booking-id").textContent = bookingCode;
  $("#success-barber-name").textContent = assignedBarber.name;
  $("#success-service-name").textContent = service.name;
  $("#success-date-time").textContent = `${date} في الساعة ${time}`;
  $("#success-client-name").textContent = name;
  $("#success-client-phone").textContent = phone;

  $("#booking-form-wrap").style.display = "none";
  $("#booking-success-wrap").style.display = "block";

  showToast(`تم حجز موعدك بنجاح برقم ${bookingCode}! في انتظار تأكيد الحلاق.`, "success");

  // Reset form fields
  $("#booking-form").reset();
}

// CLIENT APPOINTMENTS LOOKUP ("حجوزاتي")
function handleAppointmentsLookup(phoneOrCode) {
  const query = phoneOrCode.trim().toLowerCase();
  const resultsContainer = $("#lookup-results-list");
  if (!resultsContainer) return;

  if (!query) {
    resultsContainer.innerHTML = `<div class="empty-state">يرجى كتابة رقم هاتفك أو رقم الحجز أعلاه للبحث.</div>`;
    return;
  }

  const matches = State.appointments.filter(app => {
    return (
      (app.clientPhone && app.clientPhone.includes(query)) ||
      (app.id && app.id.toLowerCase() === query)
    );
  });

  if (matches.length === 0) {
    resultsContainer.innerHTML = `
      <div class="empty-state">
        <p>لم يتم العثور على أي موعد مسجل بهذا الرقم (${query})</p>
        <span style="font-size:0.85rem; color:#a1a1aa;">تأكد من كتابة نفس رقم الهاتف الذي استعملته أثناء الحجز.</span>
      </div>
    `;
    return;
  }

  resultsContainer.innerHTML = matches.map(app => {
    let statusBadge = "";
    let actionExtra = "";

    if (app.status === "accepted") {
      statusBadge = `<span class="badge-status status-accepted">✅ تم قبول وتأكيد الموعد</span>`;
      actionExtra = `<div class="status-note note-accepted">الحلاق ${app.barberName} بانتظارك في الوقت المحدد. يرجى الحضور قبل الموعد بـ 5 دقائق.</div>`;
    } else if (app.status === "rejected") {
      statusBadge = `<span class="badge-status status-rejected">❌ تم رفض الموعد</span>`;
      actionExtra = `<div class="status-note note-rejected">سبب الاعتذار: ${app.rejectReason || 'انشغال الحلاق أو امتلاء الجدول. يرجى اختيار موعد آخر.'}</div>`;
    } else if (app.status === "rescheduled") {
      statusBadge = `<span class="badge-status status-rescheduled">🕒 تم اقتراح وقت بديل</span>`;
      actionExtra = `
        <div class="status-note note-rescheduled">
          اقترح عليك الحلاق الوقت التالي: <strong>${app.proposedTime || 'وقت آخر'}</strong>.
          <button class="btn-xs btn-accept-reschedule" data-id="${app.id}" data-time="${app.proposedTime}">موافق على الوقت المقترح</button>
        </div>
      `;
    } else {
      statusBadge = `<span class="badge-status status-pending">⏳ قيد المراجعة والانتظار</span>`;
      actionExtra = `<div class="status-note note-pending">الحلاق ${app.barberName} سيقوم بتأكيد موعدك خلال دقائق قليلة. تفقد هذه الصفحة مجدداً.</div>`;
    }

    return `
      <div class="lookup-card">
        <div class="lookup-card-top">
          <span class="booking-ref-tag">${app.id}</span>
          ${statusBadge}
        </div>
        <div class="lookup-card-body">
          <div class="lookup-row"><span>الحلاق:</span> <strong>${app.barberName}</strong></div>
          <div class="lookup-row"><span>الخدمة:</span> <span>${app.serviceName} (${app.servicePrice} د.ج)</span></div>
          <div class="lookup-row"><span>الموعد:</span> <strong>📅 ${app.date} | ⏰ ${app.time}</strong></div>
        </div>
        ${actionExtra}
        <div class="lookup-card-actions">
          <a href="tel:0555123456" class="btn-outline-sm">📞 اتصال بالصالون</a>
          <button type="button" class="btn-danger-sm cancel-client-app-btn" data-id="${app.id}">إلغاء الموعد</button>
        </div>
      </div>
    `;
  }).join("");

  // Cancel action
  $$(".cancel-client-app-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-id");
      if (confirm("هل أنت متأكد من رغبتك في إلغاء هذا الموعد؟")) {
        State.appointments = State.appointments.filter(a => a.id !== id);
        safeSet("barbershop_appointments", State.appointments);
        showToast("تم إلغاء الموعد بنجاح", "info");
        handleAppointmentsLookup(query);
      }
    });
  });

  // Accept proposed time
  $$(".btn-accept-reschedule").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-id");
      const newTime = btn.getAttribute("data-time");
      const app = State.appointments.find(a => a.id === id);
      if (app) {
        app.time = newTime;
        app.status = "accepted";
        safeSet("barbershop_appointments", State.appointments);
        showToast("تم قبول الوقت المقترح وتأكيد موعدك!", "success");
        handleAppointmentsLookup(query);
      }
    });
  });
}

// BARBER LOGIN & DASHBOARD
function handleBarberLogin(e) {
  e.preventDefault();
  const usernameInput = $("#barber-username-input").value.trim().toLowerCase();
  const passwordInput = $("#barber-password-input").value.trim();

  const foundBarber = State.barbers.find(b => 
    b.username.toLowerCase() === usernameInput && b.password === passwordInput
  );

  if (!foundBarber) {
    showToast("اسم المستخدم أو كلمة المرور غير صحيحة", "error");
    return;
  }

  State.currentBarberSession = foundBarber;
  safeSet("barbershop_active_barber", foundBarber);

  closeModal("#modal-barber-login");
  $("#barber-login-form").reset();
  showToast(`أهلاً بك يا ${foundBarber.name}! تم تسجيل الدخول بنجاح.`, "success");

  openBarberDashboard();
}

function openBarberDashboard() {
  const barber = State.currentBarberSession;
  if (!barber) {
    openModal("#modal-barber-login");
    return;
  }

  $("#dash-barber-name").textContent = barber.name;
  $("#dash-barber-role").textContent = barber.role;
  $("#dash-barber-avatar").src = barber.image;
  $("#dash-barber-avatar").onerror = () => {
    $("#dash-barber-avatar").src = barber.fallbackImage;
  };

  renderBarberAppointments("all");
  openModal("#modal-barber-dashboard");
}

function renderBarberAppointments(filter = "all") {
  const barber = State.currentBarberSession;
  if (!barber) return;

  const container = $("#barber-appointments-list");
  if (!container) return;

  let barberApps = State.appointments.filter(a => a.barberId === barber.id);
  const todayStr = new Date().toISOString().split("T")[0];

  // Stats calculation
  const todayCount = barberApps.filter(a => a.date === todayStr).length;
  const pendingCount = barberApps.filter(a => a.status === "pending").length;
  const acceptedCount = barberApps.filter(a => a.status === "accepted").length;

  $("#dash-stat-today").textContent = todayCount;
  $("#dash-stat-pending").textContent = pendingCount;
  $("#dash-stat-accepted").textContent = acceptedCount;

  // Filter
  if (filter === "today") {
    barberApps = barberApps.filter(a => a.date === todayStr);
  } else if (filter === "pending") {
    barberApps = barberApps.filter(a => a.status === "pending");
  } else if (filter === "accepted") {
    barberApps = barberApps.filter(a => a.status === "accepted");
  }

  if (barberApps.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <p>لا توجد أي مواعيد في هذا القسم حالياً.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = barberApps.map(app => {
    let statusClass = "status-pending";
    let statusText = "قيد المراجعة ⏳";
    if (app.status === "accepted") {
      statusClass = "status-accepted";
      statusText = "مقبول ✅";
    } else if (app.status === "rejected") {
      statusClass = "status-rejected";
      statusText = "مرفوض ❌";
    } else if (app.status === "rescheduled") {
      statusClass = "status-rescheduled";
      statusText = "مقترح وقت 🕒";
    }

    return `
      <div class="barber-app-card ${app.status}">
        <div class="app-card-header">
          <div class="client-meta">
            <h4 class="client-name">${app.clientName}</h4>
            <a href="tel:${app.clientPhone}" class="client-phone">📞 ${app.clientPhone}</a>
          </div>
          <span class="badge-status ${statusClass}">${statusText}</span>
        </div>

        <div class="app-card-body">
          <div class="app-detail"><span>الخدمة:</span> <strong>${app.serviceName}</strong> (${app.servicePrice} د.ج)</div>
          <div class="app-detail"><span>اليوم والتاريخ:</span> <strong>📅 ${app.date}</strong></div>
          <div class="app-detail"><span>الوقت المطلوب:</span> <strong class="text-gold">⏰ ${app.time}</strong></div>
          ${app.notes ? `<div class="app-notes"><span>ملاحظة الزبون:</span> "${app.notes}"</div>` : ''}
          ${app.rejectReason ? `<div class="app-reject-reason"><span>سبب الرفض:</span> ${app.rejectReason}</div>` : ''}
          ${app.proposedTime ? `<div class="app-proposed-time"><span>الوقت المقترح:</span> ${app.proposedTime}</div>` : ''}
        </div>

        <div class="app-card-actions">
          ${app.status !== 'accepted' ? `
            <button type="button" class="btn-success-sm barber-accept-btn" data-id="${app.id}">
              ✓ قبول الموعد
            </button>
          ` : `
            <span class="text-success-msg">تم تأكيد الموعد مع الزبون</span>
          `}

          ${app.status !== 'rejected' ? `
            <button type="button" class="btn-danger-sm barber-reject-prompt-btn" data-id="${app.id}">
              ✕ اعتذار / رفض
            </button>
          ` : ''}

          <button type="button" class="btn-warning-sm barber-propose-btn" data-id="${app.id}">
            🕒 اقتراح وقت آخر
          </button>

          <a href="https://wa.me/213${app.clientPhone.replace(/^0/, '')}" target="_blank" rel="noopener noreferrer" class="btn-whatsapp-sm">
            واتساب 💬
          </a>
        </div>
      </div>
    `;
  }).join("");

  // Attach Barber Action Buttons
  $$(".barber-accept-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-id");
      const app = State.appointments.find(a => a.id === id);
      if (app) {
        app.status = "accepted";
        safeSet("barbershop_appointments", State.appointments);
        showToast(`تم قبول موعد الزبون ${app.clientName}!`, "success");
        renderBarberAppointments(filter);
      }
    });
  });

  $$(".barber-reject-prompt-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-id");
      const reason = prompt("يرجى كتابة سبب الاعتذار أو الرفض للزبون (اختياري):", "نعتذر، الحلاق مشغول في هذا الوقت");
      if (reason !== null) {
        const app = State.appointments.find(a => a.id === id);
        if (app) {
          app.status = "rejected";
          app.rejectReason = reason.trim() || "غير متاح في هذا الوقت";
          safeSet("barbershop_appointments", State.appointments);
          showToast(`تم رفض الموعد وإشعار الزبون بالسبب`, "info");
          renderBarberAppointments(filter);
        }
      }
    });
  });

  $$(".barber-propose-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-id");
      const newTime = prompt("أدخل التوقيت البديل الذي تقترحه على الزبون (مثال: 17:30 أو غداً 11:00):", "18:00");
      if (newTime && newTime.trim()) {
        const app = State.appointments.find(a => a.id === id);
        if (app) {
          app.status = "rescheduled";
          app.proposedTime = newTime.trim();
          safeSet("barbershop_appointments", State.appointments);
          showToast(`تم اقتراح التوقيت الجديد (${newTime.trim()}) على الزبون`, "warning");
          renderBarberAppointments(filter);
        }
      }
    });
  });
}

// OWNER PORTAL LOGIC
function checkOwnerAccess() {
  if (State.isOwnerLoggedIn) {
    openOwnerModal();
  } else {
    const pin = prompt("🔐 أدخل كلمة مرور صاحب الصالون (الافتراضية: admin2026):");
    if (pin === State.ownerPin || pin === "admin2026") {
      State.isOwnerLoggedIn = true;
      openOwnerModal();
    } else if (pin !== null) {
      showToast("كلمة المرور غير صحيحة!", "error");
    }
  }
}

function openOwnerModal() {
  renderOwnerStats();
  renderOwnerBarbersList();
  loadOwnerAdsForm();
  openModal("#modal-owner-portal");
}

function renderOwnerStats() {
  $("#owner-stat-visitors").textContent = State.visitors;
  $("#owner-stat-total-apps").textContent = State.appointments.length;
  const accepted = State.appointments.filter(a => a.status === "accepted").length;
  $("#owner-stat-accepted").textContent = accepted;
  
  const estimatedRevenue = State.appointments
    .filter(a => a.status === "accepted")
    .reduce((sum, a) => sum + (Number(a.servicePrice) || 0), 0);
  $("#owner-stat-revenue").textContent = `${estimatedRevenue} د.ج`;
}

function renderOwnerBarbersList() {
  const container = $("#owner-barbers-table-body");
  if (!container) return;

  container.innerHTML = State.barbers.map((b, idx) => {
    return `
      <tr>
        <td><strong>${b.name}</strong></td>
        <td><code>${b.username}</code></td>
        <td><code>${b.password}</code></td>
        <td>${b.phone}</td>
        <td>
          <button type="button" class="btn-xs btn-copy-cred" data-user="${b.username}" data-pass="${b.password}" data-name="${b.name}">
            📋 نسخ بيانات الدخول
          </button>
          <button type="button" class="btn-xs btn-edit-barber" data-id="${b.id}">
            ✏️ تعديل
          </button>
          ${State.barbers.length > 1 ? `
            <button type="button" class="btn-xs btn-danger-xs btn-del-barber" data-id="${b.id}">
              🗑️ حذف
            </button>
          ` : ''}
        </td>
      </tr>
    `;
  }).join("");

  // Attach copy credentials
  $$(".btn-copy-cred").forEach(btn => {
    btn.addEventListener("click", () => {
      const u = btn.getAttribute("data-user");
      const p = btn.getAttribute("data-pass");
      const n = btn.getAttribute("data-name");
      const textToCopy = `صالون المقص الذهبي - بن فريحة وهران\nمعلومات دخول الحلاق (${n}):\nاسم المستخدم: ${u}\nكلمة المرور: ${p}\nرابط الدخول: ${window.location.origin}${window.location.pathname}`;
      
      navigator.clipboard.writeText(textToCopy).then(() => {
        showToast(`تم نسخ بيانات دخول ${n} بنجاح! يمكنك إرسالها له عبر واتساب.`, "success");
      }).catch(() => {
        prompt("انسخ معلومات الدخول أدناه:", textToCopy);
      });
    });
  });

  // Edit Barber
  $$(".btn-edit-barber").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-id");
      const barber = State.barbers.find(b => b.id === id);
      if (!barber) return;

      const newPass = prompt(`تعديل كلمة سر الحلاق (${barber.name}):`, barber.password);
      if (newPass && newPass.trim()) {
        barber.password = newPass.trim();
        safeSet("barbershop_barbers", State.barbers);
        showToast("تم تحديث كلمة المرور للحلاق بنجاح", "success");
        renderOwnerBarbersList();
      }
    });
  });

  // Delete Barber
  $$(".btn-del-barber").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-id");
      if (confirm("هل أنت متأكد من حذف هذا الحلاق؟")) {
        State.barbers = State.barbers.filter(b => b.id !== id);
        safeSet("barbershop_barbers", State.barbers);
        showToast("تم حذف الحلاق بنجاح", "info");
        renderOwnerBarbersList();
        renderBarbers();
      }
    });
  });
}

// Add New Barber Form
function handleAddNewBarber(e) {
  e.preventDefault();
  const name = $("#new-barber-name").value.trim();
  const role = $("#new-barber-role").value.trim() || "حلاق محترف";
  const experience = $("#new-barber-exp").value.trim() || "5 سنوات خبرة";
  const phone = $("#new-barber-phone").value.trim() || "0555000000";
  const username = $("#new-barber-user").value.trim().toLowerCase();
  const password = $("#new-barber-pass").value.trim();

  if (!name || !username || !password) {
    showToast("يرجى ملء جميع الحقول المطلوبة (الاسم، اسم المستخدم، كلمة السر)", "warning");
    return;
  }

  // Check unique username
  if (State.barbers.some(b => b.username.toLowerCase() === username)) {
    showToast("اسم المستخدم هذا مستعمل من قبل، اختر اسماً آخر", "error");
    return;
  }

  const newBarber = {
    id: "barber-" + Date.now(),
    name: name,
    role: role,
    experience: experience,
    rating: 5.0,
    reviewsCount: 1,
    phone: phone,
    username: username,
    password: password,
    image: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=600&q=80",
    fallbackImage: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=600&q=80",
    available: true,
    workingHours: "09:00 ص - 21:00 م"
  };

  State.barbers.push(newBarber);
  safeSet("barbershop_barbers", State.barbers);

  showToast(`تمت إضافة الحلاق الجديد (${name}) بنجاح!`, "success");
  $("#add-barber-form").reset();
  renderOwnerBarbersList();
  renderBarbers();
}

// Load and Save Owner Ads Form
function loadOwnerAdsForm() {
  $("#ad-top-html").value = State.ads.header?.html || "";
  $("#ad-top-enabled").checked = !!State.ads.header?.enabled;

  $("#ad-mid-html").value = State.ads.middle?.html || "";
  $("#ad-mid-enabled").checked = !!State.ads.middle?.enabled;

  $("#ad-footer-html").value = State.ads.footer?.html || "";
  $("#ad-footer-enabled").checked = !!State.ads.footer?.enabled;
}

function handleSaveAds(e) {
  e.preventDefault();

  State.ads = {
    header: {
      enabled: $("#ad-top-enabled").checked,
      html: $("#ad-top-html").value
    },
    middle: {
      enabled: $("#ad-mid-enabled").checked,
      html: $("#ad-mid-html").value
    },
    footer: {
      enabled: $("#ad-footer-enabled").checked,
      html: $("#ad-footer-html").value
    }
  };

  safeSet("barbershop_ads", State.ads);
  renderAds();
  showToast("تم حفظ الإعلانات وتحديثها مباشرة في الموقع! 🎯", "success");
}

// INIT APPLICATION
function initApp() {
  // Seed initial barbers if empty
  seedBarbersIfEmpty(DEFAULT_BARBERS);

  // Real-time Cloud Firestore Subscriptions (ykin-1241b)
  subscribeBarbers((cloudBarbers) => {
    if (cloudBarbers && cloudBarbers.length > 0) {
      State.barbers = cloudBarbers;
      safeSet("barbershop_barbers", cloudBarbers);
      renderBarbers();
      updateBookingSelects();
    }
  });

  subscribeAds((cloudAds) => {
    if (cloudAds) {
      State.ads = { ...State.ads, ...cloudAds };
      safeSet("barbershop_ads", State.ads);
      renderAds();
    }
  });

  subscribeVisitors((cloudVisitors) => {
    if (typeof cloudVisitors === "number") {
      State.visitors = cloudVisitors;
      safeSet("barbershop_visitors", cloudVisitors);
      const visitorEl = $("#visitor-counter-val");
      if (visitorEl) visitorEl.textContent = Number(cloudVisitors).toLocaleString("ar-DZ");
    }
  });

  subscribeAppointments((cloudAppts) => {
    if (cloudAppts && cloudAppts.length > 0) {
      State.appointments = cloudAppts;
      safeSet("barbershop_appointments", cloudAppts);
      const lookupInput = $("#lookup-phone-input");
      if (lookupInput && lookupInput.value.trim()) {
        handleAppointmentsLookup(lookupInput.value.trim());
      }
    }
  });

  // Render main page components
  renderBarbers();
  renderServices();
  renderAds();

  // Booking Form Submit
  const bookingForm = $("#booking-form");
  if (bookingForm) {
    bookingForm.addEventListener("submit", handleBookingSubmit);
  }

  // Lookup Form Submit
  const lookupForm = $("#lookup-form");
  if (lookupForm) {
    lookupForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const input = $("#lookup-phone-input").value;
      handleAppointmentsLookup(input);
    });
  }

  // Barber Login Form
  const barberLoginForm = $("#barber-login-form");
  if (barberLoginForm) {
    barberLoginForm.addEventListener("submit", handleBarberLogin);
  }

  // Barber Dash Filters
  $$(".dash-filter-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      $$(".dash-filter-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      const filter = btn.getAttribute("data-filter");
      renderBarberAppointments(filter);
    });
  });

  // Barber Logout
  const barberLogoutBtn = $("#barber-logout-btn");
  if (barberLogoutBtn) {
    barberLogoutBtn.addEventListener("click", () => {
      State.currentBarberSession = null;
      safeSet("barbershop_active_barber", null);
      closeModal("#modal-barber-dashboard");
      showToast("تم تسجيل الخروج بنجاح", "info");
    });
  }

  // Owner Tabs
  $$(".owner-tab-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      $$(".owner-tab-btn").forEach(b => b.classList.remove("active"));
      $$(".owner-tab-content").forEach(c => c.classList.remove("active"));
      btn.classList.add("active");
      const targetId = btn.getAttribute("data-target");
      $(targetId)?.classList.add("active");
    });
  });

  // Owner Add Barber Form
  const addBarberForm = $("#add-barber-form");
  if (addBarberForm) {
    addBarberForm.addEventListener("submit", handleAddNewBarber);
  }

  // Owner Ads Form
  const ownerAdsForm = $("#owner-ads-form");
  if (ownerAdsForm) {
    ownerAdsForm.addEventListener("submit", handleSaveAds);
  }

  // Reset Visitors Counter
  const resetVisBtn = $("#reset-visitors-btn");
  if (resetVisBtn) {
    resetVisBtn.addEventListener("click", () => {
      const newCount = prompt("أدخل قيمة عدد الزوار الجديدة:", State.visitors);
      if (newCount !== null && !isNaN(newCount)) {
        State.visitors = parseInt(newCount, 10);
        safeSet("barbershop_visitors", State.visitors);
        renderOwnerStats();
        showToast("تم تحديث عداد الزوار بنجاح", "success");
      }
    });
  }

  // Modal Close Buttons
  $$(".modal-close-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const modal = btn.closest(".modal-backdrop");
      if (modal) {
        modal.classList.remove("modal-open");
        document.body.style.overflow = "auto";
      }
    });
  });

  // Click outside modal backdrop to close
  $$(".modal-backdrop").forEach(backdrop => {
    backdrop.addEventListener("click", (e) => {
      if (e.target === backdrop) {
        backdrop.classList.remove("modal-open");
        document.body.style.overflow = "auto";
      }
    });
  });

  // Quick Action Buttons
  $("#open-booking-hero-btn")?.addEventListener("click", () => openBookingModal());
  $("#nav-book-btn")?.addEventListener("click", () => openBookingModal());
  $("#nav-lookup-btn")?.addEventListener("click", () => openModal("#modal-lookup"));
  $("#nav-barber-login-btn")?.addEventListener("click", () => {
    if (State.currentBarberSession) {
      openBarberDashboard();
    } else {
      openModal("#modal-barber-login");
    }
  });
  // Direct link to owner.html handled by href
  $("#footer-owner-btn")?.addEventListener("click", () => {
    window.location.href = "./owner.html";
  });

  // Bottom Navigation Mobile
  $("#mob-nav-home")?.addEventListener("click", () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  $("#mob-nav-barbers")?.addEventListener("click", () => $("#barbers")?.scrollIntoView({ behavior: 'smooth' }));
  $("#mob-nav-book")?.addEventListener("click", () => openBookingModal());
  $("#mob-nav-lookup")?.addEventListener("click", () => openModal("#modal-lookup"));
  $("#mob-nav-barber")?.addEventListener("click", () => {
    if (State.currentBarberSession) {
      openBarberDashboard();
    } else {
      openModal("#modal-barber-login");
    }
  });

  // Check Hash for direct owner URL: `#owner` or `#admin`
  if (window.location.hash === "#owner" || window.location.hash === "#admin") {
    setTimeout(checkOwnerAccess, 500);
  }

  // Mobile Menu Toggle
  const mobMenuBtn = $("#mobile-menu-toggle");
  const mobMenu = $("#mobile-nav-drawer");
  if (mobMenuBtn && mobMenu) {
    mobMenuBtn.addEventListener("click", () => {
      mobMenu.classList.toggle("open");
    });
    $$(".drawer-link").forEach(link => {
      link.addEventListener("click", () => mobMenu.classList.remove("open"));
    });
  }
}

// Run when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initApp);
} else {
  initApp();
}
