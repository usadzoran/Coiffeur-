/**
 * صالون المقص الذهبي - بن فريحة، وهران
 * Golden Scissors - Dedicated Owner Portal (owner.js)
 * متصل مباشرة مع Firebase Cloud Firestore (ykin-1241b)
 */

import {
  subscribeAppointments,
  updateAppointmentStatusCloud,
  deleteAppointmentCloud,
  subscribeBarbers,
  saveBarberCloud,
  deleteBarberCloud,
  subscribeAds,
  saveAdsCloud,
  subscribeVisitors,
  updateVisitorsCloud,
  seedBarbersIfEmpty
} from "./firebase.js";

// Storage Helpers
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

// Default Seed Data
const DEFAULT_BARBERS = [
  {
    id: "barber-karim",
    name: "كريم بن عيسى",
    role: "خبير القصات الكلاسيكية وتصفيف اللحية الملكية",
    experience: "10 سنوات خبرة",
    phone: "0555 11 22 33",
    username: "karim",
    password: "karim123",
    image: "./public/images/barber_karim_1792939478110.jpg",
    available: true,
    workingHours: "09:00 ص - 21:00 م"
  },
  {
    id: "barber-youssef",
    name: "يوسف بلحاج",
    role: "متخصص تدريج الشعر الفيد (Fade) ونحت اللحية",
    experience: "7 سنوات خبرة",
    phone: "0555 22 33 44",
    username: "youssef",
    password: "youssef123",
    image: "./public/images/barber_youssef_1792939479092.jpg",
    available: true,
    workingHours: "10:00 ص - 22:00 م"
  },
  {
    id: "barber-sami",
    name: "سامي بوعلام",
    role: "مصفف كبار الشخصيات VIP ومساج وعلاجات البروتين",
    experience: "8 سنوات خبرة",
    phone: "0555 33 44 55",
    username: "sami",
    password: "sami123",
    image: "./public/images/barber_sami_1792939479036.jpg",
    available: true,
    workingHours: "09:00 ص - 20:00 م"
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

// State
let barbers = safeGet("barbershop_barbers", DEFAULT_BARBERS);
let appointments = safeGet("barbershop_appointments", []);
let ads = safeGet("barbershop_ads", DEFAULT_ADS);
let visitors = safeGet("barbershop_visitors", 486);

// Toast Notification
function showToast(message, type = "info") {
  const container = document.getElementById("toast-container");
  if (!container) return;
  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <span>${type === "success" ? "✅" : type === "error" ? "❌" : "ℹ️"}</span>
    <span>${message}</span>
  `;
  container.appendChild(toast);
  setTimeout(() => toast.classList.add("toast-show"), 10);
  setTimeout(() => {
    toast.classList.remove("toast-show");
    setTimeout(() => toast.remove(), 250);
  }, 3500);
}

// Modal Helper
window.openModal = function(selector) {
  const modal = document.querySelector(selector);
  if (modal) modal.classList.add("modal-open");
};

window.closeModal = function(selector) {
  const modal = document.querySelector(selector);
  if (modal) modal.classList.remove("modal-open");
};

// Check if authenticated
function isOwnerAuthenticated() {
  return sessionStorage.getItem("barbershop_owner_auth") === "true";
}

function updateAuthView() {
  const loginView = document.getElementById("owner-login-view");
  const dashboardView = document.getElementById("owner-dashboard-view");
  const logoutBtn = document.getElementById("owner-logout-btn");

  if (isOwnerAuthenticated()) {
    if (loginView) loginView.style.display = "none";
    if (dashboardView) dashboardView.style.display = "block";
    if (logoutBtn) logoutBtn.style.display = "inline-flex";
    initDashboard();
  } else {
    if (loginView) loginView.style.display = "block";
    if (dashboardView) dashboardView.style.display = "none";
    if (logoutBtn) logoutBtn.style.display = "none";
  }
}

// Initialize Dashboard
function initDashboard() {
  setupUrls();
  updateMetrics();
  renderBarbersCredentials();
  initAdsManager();
  renderAppointmentsTable();
  setupEventListeners();

  // Seed default barbers in Firestore if empty
  seedBarbersIfEmpty(DEFAULT_BARBERS);

  // Real-time Cloud Subscriptions
  subscribeAppointments((cloudAppts) => {
    if (cloudAppts && cloudAppts.length > 0) {
      appointments = cloudAppts;
      safeSet("barbershop_appointments", cloudAppts);
      renderAppointmentsTable();
      updateMetrics();
    }
  });

  subscribeBarbers((cloudBarbers) => {
    if (cloudBarbers && cloudBarbers.length > 0) {
      barbers = cloudBarbers;
      safeSet("barbershop_barbers", cloudBarbers);
      renderBarbersCredentials();
      updateMetrics();
    }
  });

  subscribeAds((cloudAds) => {
    if (cloudAds) {
      ads = { ...ads, ...cloudAds };
      safeSet("barbershop_ads", ads);
      initAdsManager();
    }
  });

  subscribeVisitors((cloudVisitors) => {
    if (typeof cloudVisitors === "number") {
      visitors = cloudVisitors;
      safeSet("barbershop_visitors", cloudVisitors);
      updateMetrics();
    }
  });
}

// Setup Clean Absolute URLs
function setupUrls() {
  const currentOrigin = window.location.origin;
  const currentPath = window.location.pathname;
  const dirPath = currentPath.substring(0, currentPath.lastIndexOf('/') + 1);

  const ownerUrl = `${currentOrigin}${dirPath}owner.html`;
  const barberUrl = `${currentOrigin}${dirPath}barber.html`;
  const clientUrl = `${currentOrigin}${dirPath}index.html`;

  const ownerEl = document.getElementById("owner-page-url");
  const barberEl = document.getElementById("barber-portal-url");
  const clientEl = document.getElementById("client-site-url");

  if (ownerEl) ownerEl.textContent = ownerUrl;
  if (barberEl) barberEl.textContent = barberUrl;
  if (clientEl) clientEl.textContent = clientUrl;
}

// Copy URL handler
window.copySpecificUrl = function(elementId) {
  const el = document.getElementById(elementId);
  if (!el) return;
  const text = el.textContent;
  if (!text) return;
  navigator.clipboard.writeText(text).then(() => {
    showToast("تم نسخ الرابط بنجاح إلى الحافظة! 📋", "success");
  }).catch(() => {
    prompt("انسخ الرابط يدوياً:", text);
  });
};

// Copy All Links
document.getElementById("copy-all-links-btn")?.addEventListener("click", () => {
  const ownerUrl = document.getElementById("owner-page-url")?.textContent || "";
  const barberUrl = document.getElementById("barber-portal-url")?.textContent || "";
  const clientUrl = document.getElementById("client-site-url")?.textContent || "";

  const fullText = `💈 روابط صالون المقص الذهبي - بن فريحة بوهران:
1️⃣ رابط موقع الزبائن لحجز المواعيد:
${clientUrl}

2️⃣ رابط بوابة الحلاقين لتسجيل الدخول وقبول المواعيد:
${barberUrl}

3️⃣ رابط لوحة صاحب الصالون الإدارية المستقلة:
${ownerUrl}`;

  navigator.clipboard.writeText(fullText).then(() => {
    showToast("تم نسخ جميع الروابط بنجاح! 📋", "success");
  }).catch(() => {
    prompt("انسخ الروابط:", fullText);
  });
});

// Update Metrics Bar
function updateMetrics() {
  barbers = safeGet("barbershop_barbers", DEFAULT_BARBERS);
  appointments = safeGet("barbershop_appointments", []);
  visitors = safeGet("barbershop_visitors", 486);

  const total = appointments.length;
  const accepted = appointments.filter(a => a.status === "accepted").length;
  const pending = appointments.filter(a => a.status === "pending").length;
  const revenue = appointments
    .filter(a => a.status === "accepted")
    .reduce((sum, a) => sum + (Number(a.servicePrice) || 0), 0);

  const visEl = document.getElementById("metric-visitors");
  const totEl = document.getElementById("metric-total-appts");
  const accEl = document.getElementById("metric-accepted-appts");
  const penEl = document.getElementById("metric-pending-appts");
  const revEl = document.getElementById("metric-revenue");

  if (visEl) visEl.textContent = Number(visitors).toLocaleString("ar-DZ");
  if (totEl) totEl.textContent = total;
  if (accEl) accEl.textContent = accepted;
  if (penEl) penEl.textContent = pending;
  if (revEl) revEl.textContent = `${revenue.toLocaleString("ar-DZ")} دج`;

  const manualInput = document.getElementById("manual-visitors-count");
  if (manualInput) manualInput.value = visitors;
}

// Render Barbers & Credentials
function renderBarbersCredentials() {
  const container = document.getElementById("barbers-credentials-list");
  if (!container) return;

  barbers = safeGet("barbershop_barbers", DEFAULT_BARBERS);
  const barberPortalUrl = document.getElementById("barber-portal-url")?.textContent || window.location.href.replace("owner.html", "barber.html");

  if (!barbers || barbers.length === 0) {
    container.innerHTML = `<div class="empty-state">لا يوجد حلاقين مسجلين حالياً. اضغط على "إضافة حلاق جديد" بالأعلى.</div>`;
    return;
  }

  container.innerHTML = barbers.map(barber => {
    return `
      <div class="barber-item-card">
        <div style="display: flex; gap: 14px; align-items: flex-start;">
          <img src="${barber.image || './public/images/barber_karim_1792939478110.jpg'}" alt="${barber.name}" class="barber-avatar" onerror="this.src='./public/images/barber_karim_1792939478110.jpg'">
          <div style="flex: 1;">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 8px;">
              <div>
                <h4 style="font-size: 1.1rem; font-weight: 800; color: #fff; margin: 0;">${barber.name}</h4>
                <div style="font-size: 0.8rem; color: #fbbf24; margin: 2px 0 6px;">${barber.role}</div>
                <div style="font-size: 0.75rem; color: #9ca3af;">📞 ${barber.phone} • ${barber.experience || 'حلاق محترف'}</div>
              </div>
              <div style="display: flex; gap: 6px;">
                <button type="button" class="action-pill-btn" style="color: #4ade80; border-color: rgba(74,222,128,0.3);" onclick="copyBarberCredentials('${barber.id}')">
                  📲 إرسال البيانات له
                </button>
                <button type="button" class="action-pill-btn" style="color: #f87171; border-color: rgba(239,68,68,0.3);" onclick="deleteBarber('${barber.id}')">
                  حذف 🗑️
                </button>
              </div>
            </div>

            <!-- Credentials Box -->
            <div class="credentials-badge">
              <div style="font-size: 0.75rem; color: #9ca3af; margin-bottom: 6px; font-weight: 700;">
                🔑 بيانات تسجيل الدخول الخاصة بالحلاق (Cloud Sync):
              </div>
              <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 8px;">
                <div class="cred-row">
                  <span class="cred-label">اسم المستخدم (Username):</span>
                  <span class="cred-val">${barber.username}</span>
                </div>
                <div class="cred-row">
                  <span class="cred-label">كلمة السر (Password):</span>
                  <span class="cred-val">${barber.password}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }).join("");

  // Update barber filter in appointments tab
  const barberFilter = document.getElementById("filter-appt-barber");
  if (barberFilter) {
    const currentVal = barberFilter.value;
    barberFilter.innerHTML = `<option value="all">كل الحلاقين</option>` + 
      barbers.map(b => `<option value="${b.id}">${b.name}</option>`).join("");
    barberFilter.value = currentVal;
  }
}

// Copy Barber Credentials formatted as WhatsApp invitation
window.copyBarberCredentials = function(barberId) {
  barbers = safeGet("barbershop_barbers", DEFAULT_BARBERS);
  const barber = barbers.find(b => b.id === barberId);
  if (!barber) return;

  const barberPortalUrl = document.getElementById("barber-portal-url")?.textContent || window.location.href.replace("owner.html", "barber.html");

  const message = `مرحباً يا ${barber.name} 💈
تم تجهيز حسابك في منظومة "صالون المقص الذهبي - بن فريحة بوهران":

🌐 رابط بوابة دخولك الخاصة:
${barberPortalUrl}

👤 اسم المستخدم: ${barber.username}
🔑 كلمة المرور: ${barber.password}

يرجى الدخول لمتابعة مواعيد زبائنك وقبول الحجوزات باليوم والوقت فوراً. بالتوفيق!`;

  navigator.clipboard.writeText(message).then(() => {
    showToast(`تم نسخ بيانات ${barber.name} بنجاح! يمكنك إرسالها له الآن على واتساب 📲`, "success");
  }).catch(() => {
    prompt("انسخ الرسالة:", message);
  });
};

// Delete Barber
window.deleteBarber = async function(barberId) {
  barbers = safeGet("barbershop_barbers", DEFAULT_BARBERS);
  const barber = barbers.find(b => b.id === barberId);
  if (!barber) return;

  if (confirm(`هل أنت متأكد من رغبتك في حذف الحلاق "${barber.name}"؟`)) {
    barbers = barbers.filter(b => b.id !== barberId);
    safeSet("barbershop_barbers", barbers);
    await deleteBarberCloud(barberId);
    showToast(`تم حذف الحلاق ${barber.name} من النظام وسحابة Firebase`, "info");
    renderBarbersCredentials();
    updateMetrics();
  }
};

// HTML Ads Management
function initAdsManager() {
  ads = safeGet("barbershop_ads", DEFAULT_ADS);

  // Header Ad
  const headerEn = document.getElementById("ad-header-enabled");
  const headerHtml = document.getElementById("ad-header-html");
  if (headerEn && headerHtml) {
    headerEn.checked = !!ads.header?.enabled;
    headerHtml.value = ads.header?.html || "";
    refreshAdPreview("header");
  }

  // Middle Ad
  const middleEn = document.getElementById("ad-middle-enabled");
  const middleHtml = document.getElementById("ad-middle-html");
  if (middleEn && middleHtml) {
    middleEn.checked = !!ads.middle?.enabled;
    middleHtml.value = ads.middle?.html || "";
    refreshAdPreview("middle");
  }

  // Footer Ad
  const footerEn = document.getElementById("ad-footer-enabled");
  const footerHtml = document.getElementById("ad-footer-html");
  if (footerEn && footerHtml) {
    footerEn.checked = !!ads.footer?.enabled;
    footerHtml.value = ads.footer?.html || "";
    refreshAdPreview("footer");
  }
}

// Live preview of ads
window.refreshAdPreview = function(slot) {
  const htmlInput = document.getElementById(`ad-${slot}-html`);
  const previewBox = document.getElementById(`preview-ad-${slot}`);
  if (!htmlInput || !previewBox) return;

  const code = htmlInput.value.trim();
  if (!code) {
    previewBox.innerHTML = `<span style="color:#6b7280; font-size:0.8rem;">(المعاينة فارغة - لم تقم بلصق أي كود)</span>`;
  } else {
    previewBox.innerHTML = code;
  }
};

// Template Presets
window.insertAdTemplate = function(slot, type) {
  const textarea = document.getElementById(`ad-${slot}-html`);
  const checkbox = document.getElementById(`ad-${slot}-enabled`);
  if (!textarea) return;

  let template = "";
  if (type === "discount") {
    template = `<div style="background: linear-gradient(90deg, #92400e 0%, #d97706 50%, #b45309 100%); color: #fff; padding: 12px 18px; border-radius: 12px; display: flex; align-items: center; justify-content: space-between; gap: 12px; box-shadow: 0 4px 15px rgba(217, 119, 6, 0.25);">
  <div style="display: flex; align-items: center; gap: 10px; font-weight: 700; font-size: 0.95rem;">
    <span style="background: #fff; color: #b45309; padding: 3px 8px; border-radius: 6px; font-size: 0.8rem;">عرض حصري</span>
    <span>🔥 تخفيض خاص بمناسبة الافتتاح في بن فريحة بوهران! خصم 20% لكافة الباقات.</span>
  </div>
  <a href="#services" style="background: #111; color: #fef08a; padding: 8px 16px; border-radius: 8px; font-size: 0.85rem; font-weight: 800; text-decoration: none;">احجز واستفد</a>
</div>`;
  } else if (type === "sponsor") {
    template = `<div style="background: #151821; border: 1.5px dashed #f59e0b; padding: 18px; border-radius: 14px; text-align: center;">
  <span style="background: rgba(245,158,11,0.15); color: #fbbf24; font-size: 0.78rem; font-weight: 700; padding: 3px 10px; border-radius: 6px; display: inline-block; margin-bottom: 6px;">شريك الصالون الرسمي</span>
  <h4 style="color: #fff; font-size: 1.05rem; margin: 4px 0;">منتجات تصفيف الشعر الإيطالية الأصلية</h4>
  <p style="color: #a1a1aa; font-size: 0.85rem; margin-bottom: 10px;">متوفرة الآن حصرياً لدى صالون المقص الذهبي في بن فريحة بوهران.</p>
  <a href="tel:0555123456" style="background: #232838; color: #e4e4e7; padding: 6px 14px; border-radius: 8px; font-size: 0.82rem; font-weight: 700; display: inline-block;">لطلب المنتجات: 0555 12 34 56 📞</a>
</div>`;
  } else if (type === "location") {
    template = `<div style="background: linear-gradient(135deg, #18181b 0%, #27272a 100%); border: 1px solid #3f3f46; padding: 14px 20px; border-radius: 12px; display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 10px;">
  <div style="color: #f4f4f5; font-size: 0.9rem;">
    📍 <strong>عنوان المحل:</strong> بن فريحة، ولاية وهران — دقة في الموعد وأرقى عناية رجالية.
  </div>
  <a href="https://maps.app.goo.gl/ffo11T6RT3GXEPrj7" target="_blank" rel="noopener noreferrer" style="background: #f59e0b; color: #111; padding: 6px 14px; border-radius: 8px; font-weight: 800; font-size: 0.85rem; text-decoration: none;">فتح الموقع على خريطة Google 🗺️</a>
</div>`;
  }

  textarea.value = template;
  if (checkbox) checkbox.checked = true;
  refreshAdPreview(slot);
  showToast("تم إدراج النموذج بنجاح! اضغط على حفظ الإعلانات لتثبيته.", "success");
};

// Render Appointments Table
function renderAppointmentsTable() {
  const tbody = document.getElementById("all-appointments-tbody");
  if (!tbody) return;

  appointments = safeGet("barbershop_appointments", []);
  const barberFilter = document.getElementById("filter-appt-barber")?.value || "all";
  const statusFilter = document.getElementById("filter-appt-status")?.value || "all";

  let filtered = [...appointments];

  if (barberFilter !== "all") {
    filtered = filtered.filter(a => a.barberId === barberFilter);
  }

  if (statusFilter !== "all") {
    filtered = filtered.filter(a => a.status === statusFilter);
  }

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" class="empty-state">لا توجد مواعيد مطابقة لخيارات البحث.</td></tr>`;
    return;
  }

  tbody.innerHTML = filtered.map(item => {
    let statusBadge = "";
    if (item.status === "accepted") {
      statusBadge = `<span style="background:rgba(16,185,129,0.15); color:#34d399; padding:3px 8px; border-radius:6px; font-size:0.75rem; font-weight:700;">مقبول ومؤكد ✅</span>`;
    } else if (item.status === "rejected") {
      statusBadge = `<span style="background:rgba(239,68,68,0.15); color:#f87171; padding:3px 8px; border-radius:6px; font-size:0.75rem; font-weight:700;">معتذر عنه ❌</span>`;
    } else {
      statusBadge = `<span style="background:rgba(245,158,11,0.15); color:#fbbf24; padding:3px 8px; border-radius:6px; font-size:0.75rem; font-weight:700;">قيد الانتظار ⏳</span>`;
    }

    return `
      <tr>
        <td>
          <div style="font-weight:700; color:#fff;">${item.clientName}</div>
          <div style="font-size:0.75rem; color:#9ca3af; font-family:monospace;">${item.id}</div>
        </td>
        <td><strong style="color:#fbbf24;">${item.barberName}</strong></td>
        <td><a href="tel:${item.clientPhone}" style="color: #38bdf8; text-decoration: underline;">${item.clientPhone}</a></td>
        <td>${item.serviceName}</td>
        <td>${item.date} <span style="color:#f59e0b;font-weight:700;">${item.time}</span></td>
        <td style="font-weight: 700; color: #fcd34d;">${item.servicePrice || 0} دج</td>
        <td>${statusBadge}</td>
        <td>
          <div style="display: flex; gap: 6px;">
            ${item.status !== "accepted" ? `
              <button type="button" class="action-pill-btn" style="color:#4ade80; border-color:rgba(74,222,128,0.3); padding:3px 8px; font-size:0.75rem;" onclick="updateAppointmentStatus('${item.id}', 'accepted')">قبول</button>
            ` : ''}
            ${item.status !== "rejected" ? `
              <button type="button" class="action-pill-btn" style="color:#f87171; border-color:rgba(248,113,113,0.3); padding:3px 8px; font-size:0.75rem;" onclick="updateAppointmentStatus('${item.id}', 'rejected')">إلغاء</button>
            ` : ''}
            <button type="button" class="action-pill-btn" style="color:#ef4444; border-color:rgba(239,68,68,0.3); padding:3px 8px; font-size:0.75rem;" onclick="deleteAppointment('${item.id}')" title="حذف نهائياً">🗑️</button>
          </div>
        </td>
      </tr>
    `;
  }).join("");
}

// Update Appointment Status
window.updateAppointmentStatus = async function(apptId, newStatus) {
  appointments = safeGet("barbershop_appointments", []);
  const target = appointments.find(a => a.id === apptId);
  if (!target) return;

  target.status = newStatus;
  safeSet("barbershop_appointments", appointments);
  await updateAppointmentStatusCloud(apptId, newStatus);
  showToast(`تم تحديث حالة الموعد ${apptId} في Firebase إلى ${newStatus === "accepted" ? "مقبول ✅" : "ملغي ❌"}`, "success");
  renderAppointmentsTable();
  updateMetrics();
};

// Delete Appointment
window.deleteAppointment = async function(apptId) {
  if (!confirm(`هل أنت متأكد من حذف الحجز ${apptId} نهائياً؟`)) return;
  appointments = safeGet("barbershop_appointments", []);
  appointments = appointments.filter(a => a.id !== apptId);
  safeSet("barbershop_appointments", appointments);
  await deleteAppointmentCloud(apptId);
  showToast(`تم حذف الحجز ${apptId} من السحابة`, "info");
  renderAppointmentsTable();
  updateMetrics();
};

// Setup Event Listeners
function setupEventListeners() {
  // Tabs Switcher
  document.querySelectorAll(".owner-tab-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".owner-tab-btn").forEach(b => b.classList.remove("active"));
      document.querySelectorAll(".owner-tab-panel").forEach(p => p.style.display = "none");

      btn.classList.add("active");
      const targetId = btn.getAttribute("data-tab");
      const panel = document.getElementById(targetId);
      if (panel) panel.style.display = "block";
    });
  });

  // PIN Form Submission
  const pinForm = document.getElementById("owner-pin-form");
  if (pinForm) {
    pinForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const enteredPin = document.getElementById("owner-pin-input").value.trim();
      const actualPin = safeGet("barbershop_owner_pin", "admin2026");

      if (enteredPin === actualPin) {
        sessionStorage.setItem("barbershop_owner_auth", "true");
        showToast("مرحباً بك! تم التحقق من هويتك بنجاح 👑", "success");
        updateAuthView();
      } else {
        showToast("الرمز السري غير صحيح! حاول مرة أخرى.", "error");
      }
    });
  }

  // Toggle PIN visibility
  document.getElementById("toggle-pin-visibility")?.addEventListener("click", () => {
    const input = document.getElementById("owner-pin-input");
    if (input) {
      input.type = input.type === "password" ? "text" : "password";
    }
  });

  // Logout
  document.getElementById("owner-logout-btn")?.addEventListener("click", () => {
    sessionStorage.removeItem("barbershop_owner_auth");
    showToast("تم تسجيل الخروج بنجاح", "info");
    updateAuthView();
  });

  // Save Ads Form
  const adsForm = document.getElementById("owner-ads-form");
  if (adsForm) {
    adsForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const updatedAds = {
        header: {
          enabled: document.getElementById("ad-header-enabled").checked,
          html: document.getElementById("ad-header-html").value
        },
        middle: {
          enabled: document.getElementById("ad-middle-enabled").checked,
          html: document.getElementById("ad-middle-html").value
        },
        footer: {
          enabled: document.getElementById("ad-footer-enabled").checked,
          html: document.getElementById("ad-footer-html").value
        }
      };

      safeSet("barbershop_ads", updatedAds);
      await saveAdsCloud(updatedAds);
      showToast("تم حفظ ونشر جميع المساحات الإعلانية في Firebase! ستظهر فوراً في موقع الزبائن 📢", "success");
      refreshAdPreview("header");
      refreshAdPreview("middle");
      refreshAdPreview("footer");
    });
  }

  // Real-time input preview listeners
  ["header", "middle", "footer"].forEach(slot => {
    document.getElementById(`ad-${slot}-html`)?.addEventListener("input", () => {
      refreshAdPreview(slot);
    });
  });

  // Filter dropdown listeners
  document.getElementById("filter-appt-barber")?.addEventListener("change", renderAppointmentsTable);
  document.getElementById("filter-appt-status")?.addEventListener("change", renderAppointmentsTable);

  // Add Barber Modal Opener
  document.getElementById("btn-add-barber-modal")?.addEventListener("click", () => {
    window.openModal("#modal-add-barber");
  });

  // Add Barber Form Submission
  const addBarberForm = document.getElementById("form-add-barber");
  if (addBarberForm) {
    addBarberForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      barbers = safeGet("barbershop_barbers", DEFAULT_BARBERS);

      const username = document.getElementById("add-barber-username").value.trim().toLowerCase();
      // Check if username taken
      if (barbers.some(b => b.username?.toLowerCase() === username)) {
        showToast("اسم الدخول هذا مستخدم مسبقاً، يرجى اختيار اسم مستخدم آخر", "error");
        return;
      }

      const newBarber = {
        id: `barber-${Date.now()}`,
        name: document.getElementById("add-barber-name").value.trim(),
        role: document.getElementById("add-barber-role").value.trim(),
        phone: document.getElementById("add-barber-phone").value.trim(),
        experience: document.getElementById("add-barber-exp").value.trim() || "5 سنوات خبرة",
        username: username,
        password: document.getElementById("add-barber-password").value.trim(),
        image: document.getElementById("add-barber-image").value.trim() || "./public/images/barber_karim_1792939478110.jpg",
        available: true,
        workingHours: "09:00 ص - 21:00 م"
      };

      barbers.push(newBarber);
      safeSet("barbershop_barbers", barbers);
      await saveBarberCloud(newBarber);
      showToast(`تمت إضافة الحلاق "${newBarber.name}" وتخزينه في Firebase بنجاح!`, "success");
      window.closeModal("#modal-add-barber");
      addBarberForm.reset();
      renderBarbersCredentials();
    });
  }

  // Change PIN Form
  const changePinForm = document.getElementById("change-pin-form");
  if (changePinForm) {
    changePinForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const cur = document.getElementById("current-pin-input").value.trim();
      const next = document.getElementById("new-pin-input").value.trim();
      const actualPin = safeGet("barbershop_owner_pin", "admin2026");

      if (cur !== actualPin) {
        showToast("الرمز السري الحالي غير صحيح!", "error");
        return;
      }

      safeSet("barbershop_owner_pin", next);
      showToast("تم تحديث الرمز السري بنجاح! احفظه جيداً.", "success");
      changePinForm.reset();
    });
  }

  // Visitor edit/save
  document.getElementById("btn-edit-visitors")?.addEventListener("click", () => {
    const settingsBtn = document.querySelector(".owner-tab-btn[data-tab='tab-settings']");
    if (settingsBtn) settingsBtn.click();
  });

  document.getElementById("save-visitors-btn")?.addEventListener("click", async () => {
    const val = parseInt(document.getElementById("manual-visitors-count").value, 10);
    if (isNaN(val) || val < 0) {
      showToast("يرجى إدخال رقم صحيح للزوار", "error");
      return;
    }
    safeSet("barbershop_visitors", val);
    await updateVisitorsCloud(val);
    showToast(`تم تحديث عداد الزوار في Firebase إلى: ${val.toLocaleString("ar-DZ")}`, "success");
    updateMetrics();
  });

  document.getElementById("reset-visitors-btn")?.addEventListener("click", async () => {
    if (confirm("هل تريد تصفير عداد زوار الموقع إلى 0؟")) {
      safeSet("barbershop_visitors", 0);
      await updateVisitorsCloud(0);
      showToast("تم تصفير عداد الزوار بنجاح في Firebase", "info");
      updateMetrics();
    }
  });

  // Reset defaults
  document.getElementById("btn-reset-defaults")?.addEventListener("click", async () => {
    if (confirm("تحذير: سيتم إعادة ضبط قائمة الحلاقين الثلاثة والإعلانات الافتراضية. هل تود المتابعة؟")) {
      safeSet("barbershop_barbers", DEFAULT_BARBERS);
      safeSet("barbershop_ads", DEFAULT_ADS);
      safeSet("barbershop_owner_pin", "admin2026");
      for (const b of DEFAULT_BARBERS) {
        await saveBarberCloud(b);
      }
      await saveAdsCloud(DEFAULT_ADS);
      showToast("تمت استعادة البيانات الافتراضية وتحديث Firebase بنجاح!", "success");
      initDashboard();
    }
  });
}

// Initial Boot
document.addEventListener("DOMContentLoaded", () => {
  updateAuthView();
});
