/**
 * صالون المقص الذهبي - بن فريحة، وهران
 * Barber Portal Logic (barber.js)
 * متصل مباشرة مع Firebase Firestore (ykin-1241b)
 */

import { 
  subscribeAppointments, 
  updateAppointmentStatusCloud,
  subscribeBarbers,
  signInBarber,
  signOutFirebase,
  changeBarberPassword,
  saveBarberProfileCloud,
  uploadBarberPortfolioImage,
  uploadBarberProfileImage,
  deleteBarberPortfolioImage
} from "./firebase.js";

function safeGet(key, defaultVal) {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultVal;
  } catch (e) {
    return defaultVal;
  }
}

function safeSet(key, val) {
  try {
    localStorage.setItem(key, JSON.stringify(val));
    return true;
  } catch (e) {
    return false;
  }
}

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

let activeBarber = null;
let barberProfile = { portfolio: [], hairstyles: [] };
let knownAppointmentIds = new Set();
let appointmentsRealtimeReady = false;

function loadBarberProfile() {
  barberProfile = {
    displayName: activeBarber?.displayName || activeBarber?.name || "",
    displayRole: activeBarber?.displayRole || activeBarber?.role || "",
    profileImage: activeBarber?.profileImage || activeBarber?.image || "",
    portfolio: Array.isArray(activeBarber?.portfolio) ? activeBarber.portfolio : [],
    hairstyles: Array.isArray(activeBarber?.hairstyles) ? activeBarber.hairstyles : []
  };
  const nameInput = document.getElementById("barber-display-name");
  const roleInput = document.getElementById("barber-display-role");
  const preview = document.getElementById("barber-profile-preview");
  if (nameInput) nameInput.value = barberProfile.displayName;
  if (roleInput) roleInput.value = barberProfile.displayRole;
  if (preview && barberProfile.profileImage) {
    preview.src = barberProfile.profileImage;
    preview.style.display = "block";
  }
  renderBarberProfile();
}

function renderBarberProfile() {
  const grid = document.getElementById("barber-portfolio-grid");
  if (grid) {
    grid.innerHTML = barberProfile.portfolio.length ? barberProfile.portfolio.map((image, index) => `
      <div style="position:relative; background:#0c0e14; border:1px solid #2d3345; border-radius:10px; padding:5px;">
        <img src="${image.url}" alt="عمل حلاق" style="width:100%; aspect-ratio:1; object-fit:cover; border-radius:7px;">
        <button type="button" data-portfolio-index="${index}" class="delete-portfolio-image" style="position:absolute; top:8px; left:8px; width:26px; height:26px; border:0; border-radius:50%; background:#991b1b; color:#fff; cursor:pointer;">×</button>
      </div>
    `).join("") : `<p style="grid-column:1/-1; color:#6b7280; font-size:.82rem;">لم تضف صوراً إلى ألبومك بعد.</p>`;
    grid.querySelectorAll(".delete-portfolio-image").forEach((button) => {
      button.addEventListener("click", async () => {
        const index = Number(button.dataset.portfolioIndex);
        const image = barberProfile.portfolio[index];
        if (!image || !confirm("هل تريد حذف هذه الصورة من الألبوم؟")) return;
        try {
          await deleteBarberPortfolioImage(image.path);
          barberProfile.portfolio.splice(index, 1);
          await saveBarberProfileCloud(activeBarber.id, barberProfile);
          activeBarber.portfolio = barberProfile.portfolio;
          renderBarberProfile();
          showToast("تم حذف الصورة من ألبومك", "success");
        } catch (error) {
          showToast("تعذر حذف الصورة. تحقق من اتصال Firebase.", "error");
        }
      });
    });
  }

  const fields = document.getElementById("barber-hairstyles-fields");
  if (fields) {
    const hairstyles = Array.from({ length: 5 }, (_, index) => barberProfile.hairstyles[index] || {});
    fields.innerHTML = hairstyles.map((style, index) => `
      <div style="display:grid; grid-template-columns:70px 1fr 150px; gap:8px; align-items:center;">
        <span style="color:#fbbf24; font-size:.8rem;">${index + 1}</span>
        <input class="form-control hairstyle-name" data-index="${index}" value="${style.name || ""}" placeholder="اسم التسريحة" required style="width:100%;">
        <input class="form-control hairstyle-price" data-index="${index}" value="${style.price || ""}" type="number" min="0" placeholder="السعر بالدج" required style="width:100%;">
      </div>
    `).join("");
  }
}

async function saveBarberProfile() {
  if (!activeBarber) return;
  const names = [...document.querySelectorAll(".hairstyle-name")];
  const prices = [...document.querySelectorAll(".hairstyle-price")];
  const hairstyles = names.map((input, index) => ({
    name: input.value.trim(),
    price: Number(prices[index]?.value || 0)
  }));
  if (hairstyles.some((style) => !style.name || style.price < 0)) {
    showToast("أدخل اسم وسعر الأنواع الخمسة كاملة", "warning");
    return;
  }
  barberProfile.hairstyles = hairstyles;
  await saveBarberProfileCloud(activeBarber.id, barberProfile);
  activeBarber.hairstyles = hairstyles;
  showToast("تم حفظ التسريحات والأسعار في Firebase", "success");
}

function notifyNewBarberAppointment(appointment) {
  showToast(`لديك حجز جديد من ${appointment.clientName} يوم ${appointment.date} الساعة ${appointment.time}`, "success");
  if (typeof Notification !== "undefined" && Notification.permission === "granted") {
    new Notification("حجز جديد في صالون المقص الذهبي", {
      body: `${appointment.clientName} — ${appointment.serviceName} — ${appointment.date} ${appointment.time}`,
      tag: appointment.id
    });
  }
}

function checkActiveSession() {
  const barberId = sessionStorage.getItem("barbershop_active_barber_id");
  if (!barberId) {
    showLoginView();
    return;
  }

  const barbers = safeGet("barbershop_barbers", []);
  const found = barbers.find(b => b.id === barberId);
  if (found) {
    activeBarber = found;
    showDashboardView();
  } else {
    showLoginView();
  }
}

function showLoginView() {
  const loginBox = document.getElementById("barber-login-box");
  const dashBox = document.getElementById("barber-dashboard-box");
  const logoutBtn = document.getElementById("barber-logout-btn");
  if (loginBox) loginBox.style.display = "block";
  if (dashBox) dashBox.style.display = "none";
  if (logoutBtn) logoutBtn.style.display = "none";
}

function showDashboardView() {
  const loginBox = document.getElementById("barber-login-box");
  const dashBox = document.getElementById("barber-dashboard-box");
  const logoutBtn = document.getElementById("barber-logout-btn");
  if (loginBox) loginBox.style.display = "none";
  if (dashBox) dashBox.style.display = "block";
  if (logoutBtn) logoutBtn.style.display = "inline-flex";

  // Fill Header
  const nameEl = document.getElementById("active-barber-name");
  const roleEl = document.getElementById("active-barber-role");
  const imgEl = document.getElementById("active-barber-img");
  const hoursEl = document.getElementById("active-barber-hours");

  if (nameEl) nameEl.textContent = activeBarber.name;
  if (roleEl) roleEl.textContent = activeBarber.role;
  if (imgEl) imgEl.src = activeBarber.image || "./public/images/barber_karim_1792939478110.jpg";
  if (hoursEl && activeBarber.workingHours) {
    hoursEl.textContent = `🕒 ساعات العمل: ${activeBarber.workingHours}`;
  }

  loadBarberProfile();
  renderBarberAppointments();
}

function renderBarberAppointments() {
  if (!activeBarber) return;
  const appointments = safeGet("barbershop_appointments", []);
  const myAppts = appointments.filter(a => a.barberId === activeBarber.id);

  // Update counters
  const accepted = myAppts.filter(a => a.status === "accepted").length;
  const pending = myAppts.filter(a => a.status === "pending").length;

  const accEl = document.getElementById("barber-accepted-count");
  const pendEl = document.getElementById("barber-pending-count");
  if (accEl) accEl.textContent = accepted;
  if (pendEl) pendEl.textContent = pending;

  const container = document.getElementById("barber-appointments-cards");
  if (!container) return;

  if (myAppts.length === 0) {
    container.innerHTML = `
      <div style="background: #13151f; border: 1px dashed #282d3e; border-radius: 14px; padding: 40px 20px; text-align: center; color: #9ca3af;">
        <span style="font-size: 2.2rem; display: block; margin-bottom: 10px;">📅</span>
        <h4 style="color: #fff; margin-bottom: 6px;">لا توجد أي حجوزات مسجلة لك حالياً</h4>
        <p style="font-size: 0.85rem; color: #6b7280;">عندما يقوم الزبائن بحجز موعد معك من الموقع، ستظهر طلباتهم هنا فوراً من فايربيس لتقرر قبولها أو الاعتذار عنها.</p>
      </div>
    `;
    return;
  }

  // Sort: pending first, then by date/time
  myAppts.sort((a, b) => {
    if (a.status === "pending" && b.status !== "pending") return -1;
    if (a.status !== "pending" && b.status === "pending") return 1;
    return new Date(b.date + ' ' + (b.time || '00:00')) - new Date(a.date + ' ' + (a.time || '00:00'));
  });

  container.innerHTML = myAppts.map(appt => {
    let statusBanner = "";
    if (appt.status === "accepted") {
      statusBanner = `<div style="background: rgba(16,185,129,0.15); border: 1px solid rgba(16,185,129,0.3); color: #34d399; font-size: 0.82rem; font-weight: 700; padding: 6px 12px; border-radius: 8px; display: inline-flex; align-items: center; gap: 6px;">✅ تم قبول الموعد وتأكيده</div>`;
    } else if (appt.status === "rejected") {
      statusBanner = `<div style="background: rgba(239,68,68,0.15); border: 1px solid rgba(239,68,68,0.3); color: #f87171; font-size: 0.82rem; font-weight: 700; padding: 6px 12px; border-radius: 8px; display: inline-flex; align-items: center; gap: 6px;">❌ تم الاعتذار عن هذا الموعد</div>`;
    } else {
      statusBanner = `<div style="background: rgba(245,158,11,0.15); border: 1px solid rgba(245,158,11,0.4); color: #fbbf24; font-size: 0.82rem; font-weight: 700; padding: 6px 12px; border-radius: 8px; display: inline-flex; align-items: center; gap: 6px;">⏳ بانتظار قرارك (قبول أو رفض)</div>`;
    }

    const cleanPhone = (appt.clientPhone || "").replace(/\s+/g, "");
    const waText = encodeURIComponent(`مرحباً يا ${appt.clientName}، معك الحلاق ${activeBarber.name} من صالون المقص الذهبي بن فريحة بوهران بخصوص موعدك (${appt.date} الساعة ${appt.time}).`);

    return `
      <div style="background: #141722; border: 1.5px solid ${appt.status === 'pending' ? '#f59e0b' : '#272c3d'}; border-radius: 16px; padding: 20px; transition: all 0.2s;">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 10px; margin-bottom: 12px;">
          <div>
            <span style="font-size: 0.75rem; color: #9ca3af;">رقم الحجز: <code style="color: #38bdf8;">${appt.id}</code></span>
            <h4 style="font-size: 1.15rem; font-weight: 800; color: #fff; margin: 4px 0;">الزبون: ${appt.clientName}</h4>
          </div>
          <div>${statusBanner}</div>
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 10px; background: #0c0e14; border: 1px solid #232736; border-radius: 12px; padding: 14px; margin-bottom: 16px;">
          <div>
            <span style="font-size: 0.75rem; color: #6b7280;">الخدمة المطلوبة:</span>
            <div style="font-weight: 700; color: #fff; font-size: 0.95rem;">${appt.serviceName}</div>
          </div>
          <div>
            <span style="font-size: 0.75rem; color: #6b7280;">السعر المحدد:</span>
            <div style="font-weight: 800; color: #fcd34d; font-size: 0.95rem;">${appt.servicePrice} دج</div>
          </div>
          <div>
            <span style="font-size: 0.75rem; color: #6b7280;">تاريخ ويوم الحجز:</span>
            <div style="font-weight: 700; color: #38bdf8; font-size: 0.95rem;">${appt.date}</div>
          </div>
          <div>
            <span style="font-size: 0.75rem; color: #6b7280;">الوقت المحدد:</span>
            <div style="font-weight: 800; color: #fbbf24; font-size: 1.05rem;">🕒 ${appt.time}</div>
          </div>
        </div>

        ${appt.notes ? `
          <div style="font-size: 0.82rem; color: #d4d4d8; background: #1a1e2a; padding: 8px 12px; border-radius: 8px; margin-bottom: 14px;">
            📝 <strong>ملاحظات الزبون:</strong> ${appt.notes}
          </div>
        ` : ''}

        <!-- Actions -->
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
          <div style="display: flex; gap: 8px;">
            <a href="tel:${cleanPhone}" style="background: #1e2230; color: #38bdf8; border: 1px solid #2d3345; padding: 8px 14px; border-radius: 8px; font-size: 0.82rem; font-weight: 700; display: inline-flex; align-items: center; gap: 6px; text-decoration: none;">
              📞 اتصال: ${appt.clientPhone}
            </a>
            <a href="https://wa.me/213${cleanPhone.replace(/^0/, '')}?text=${waText}" target="_blank" style="background: #0f291e; color: #4ade80; border: 1px solid rgba(74,222,128,0.3); padding: 8px 14px; border-radius: 8px; font-size: 0.82rem; font-weight: 700; display: inline-flex; align-items: center; gap: 6px; text-decoration: none;">
              💬 واتساب
            </a>
          </div>

          <div style="display: flex; gap: 8px;">
            ${appt.status !== 'accepted' ? `
              <button type="button" class="btn-primary" style="padding: 8px 18px; font-size: 0.85rem; font-weight: 800; border-radius: 8px; cursor: pointer;" onclick="barberDecide('${appt.id}', 'accepted')">
                ✅ قبول وتثبيت الموعد
              </button>
            ` : ''}
            ${appt.status !== 'rejected' ? `
              <button type="button" style="background: #2b181b; color: #f87171; border: 1px solid rgba(239,68,68,0.3); padding: 8px 14px; font-size: 0.85rem; font-weight: 700; border-radius: 8px; cursor: pointer;" onclick="barberDecide('${appt.id}', 'rejected')">
                ❌ اعتذار / رفض
              </button>
            ` : ''}
          </div>
        </div>
      </div>
    `;
  }).join("");
}

window.barberDecide = async function(apptId, decision) {
  const appointments = safeGet("barbershop_appointments", []);
  const appt = appointments.find(a => a.id === apptId);
  if (!appt) return;

  appt.status = decision;
  safeSet("barbershop_appointments", appointments);

  // Sync with Firebase Firestore
  await updateAppointmentStatusCloud(apptId, decision);

  if (decision === "accepted") {
    showToast(`تم قبول موعد الزبون (${appt.clientName}) بنجاح! تم تحديث Firebase ✅`, "success");
  } else {
    showToast(`تم رفض الموعد (${appt.clientName}) في Firebase ❌`, "info");
  }

  renderBarberAppointments();
};

document.addEventListener("DOMContentLoaded", () => {
  checkActiveSession();

  // Subscribe to real-time appointments from Firebase
  subscribeAppointments((cloudAppts) => {
    const nextAppointments = cloudAppts || [];
    if (appointmentsRealtimeReady && activeBarber) {
      nextAppointments
        .filter((appointment) => appointment.barberId === activeBarber.id && appointment.status === "pending" && !knownAppointmentIds.has(appointment.id))
        .forEach(notifyNewBarberAppointment);
    }
    knownAppointmentIds = new Set(nextAppointments.map((appointment) => appointment.id));
    appointmentsRealtimeReady = true;
    safeSet("barbershop_appointments", nextAppointments);
    renderBarberAppointments();
  });

  // Subscribe to barbers in case credentials updated
  subscribeBarbers((cloudBarbers) => {
    if (cloudBarbers && cloudBarbers.length > 0) {
      safeSet("barbershop_barbers", cloudBarbers);
      const currentId = sessionStorage.getItem("barbershop_active_barber_id");
      if (currentId) {
        const found = cloudBarbers.find(b => b.id === currentId);
        if (found) {
          activeBarber = found;
          loadBarberProfile();
          showDashboardView();
        }
      }
    }
  });

  // Login form
  const loginForm = document.getElementById("barber-login-form");
  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const user = document.getElementById("barber-input-username").value.trim().toLowerCase();
      const pass = document.getElementById("barber-input-password").value;
      try {
        const match = await signInBarber(user, pass);
        sessionStorage.setItem("barbershop_active_barber_id", match.id);
        activeBarber = match;
        if (typeof Notification !== "undefined" && Notification.permission === "default") {
          Notification.requestPermission().catch(() => {});
        }
        showToast(`أهلاً بك يا ${match.name}! تم تسجيل الدخول عبر Firebase 💈`, "success");
        showDashboardView();
      } catch (error) {
        showToast("اسم المستخدم أو كلمة المرور غير صحيحة، أو لم يجهز المالك الحساب بعد.", "error");
      }
    });
  }

  // Logout
  document.getElementById("barber-logout-btn")?.addEventListener("click", async () => {
    await signOutFirebase();
    sessionStorage.removeItem("barbershop_active_barber_id");
    activeBarber = null;
    showToast("تم تسجيل الخروج", "info");
    showLoginView();
  });

  // Refresh
  document.getElementById("refresh-barber-appts")?.addEventListener("click", () => {
    renderBarberAppointments();
    showToast("تم تحديث المواعيد 🔄", "info");
  });

  document.getElementById("barber-profile-file")?.addEventListener("change", (event) => {
    const file = event.target.files?.[0];
    const preview = document.getElementById("barber-profile-preview");
    if (file && preview) {
      preview.src = URL.createObjectURL(file);
      preview.style.display = "block";
    }
  });

  document.getElementById("barber-public-profile-form")?.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!activeBarber) return;
    const name = document.getElementById("barber-display-name").value.trim();
    const role = document.getElementById("barber-display-role").value.trim();
    const file = document.getElementById("barber-profile-file").files?.[0];
    if (!name || !role) {
      showToast("أدخل الاسم والتخصص اللذين سيظهران للزبائن", "warning");
      return;
    }
    try {
      barberProfile.displayName = name;
      barberProfile.displayRole = role;
      if (file) {
        const image = await uploadBarberProfileImage(activeBarber.id, file);
        barberProfile.profileImage = image.url;
      }
      await saveBarberProfileCloud(activeBarber.id, barberProfile);
      activeBarber.displayName = name;
      activeBarber.displayRole = role;
      activeBarber.profileImage = barberProfile.profileImage;
      const profilePreview = document.getElementById("barber-profile-preview");
      if (profilePreview && barberProfile.profileImage) profilePreview.src = barberProfile.profileImage;
      showToast("تم تحديث الملف العام وسيظهر للزبائن من Firebase", "success");
    } catch (error) {
      showToast(error.message || "تعذر حفظ الملف العام في Firebase", "error");
    }
  });

  document.getElementById("barber-password-form")?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const password = document.getElementById("barber-new-password").value;
    const confirmation = document.getElementById("barber-confirm-password").value;
    if (password !== confirmation) {
      showToast("كلمتا المرور غير متطابقتين", "warning");
      return;
    }
    try {
      await changeBarberPassword(password);
      event.target.reset();
      showToast("تم تغيير كلمة المرور بنجاح", "success");
    } catch (error) {
      showToast(error.code === "auth/requires-recent-login" ? "لأسباب أمنية، سجّل الخروج ثم ادخل مجدداً قبل تغيير كلمة المرور." : (error.message || "تعذر تغيير كلمة المرور"), "error");
    }
  });

  document.getElementById("save-barber-portfolio-btn")?.addEventListener("click", async () => {
    if (!activeBarber) return;
    const input = document.getElementById("barber-portfolio-files");
    const files = [...(input.files || [])];
    if (!files.length) {
      showToast("اختر صورة واحدة على الأقل لرفعها", "warning");
      return;
    }
    if (barberProfile.portfolio.length + files.length > 20) {
      showToast("الحد الأقصى للألبوم هو 20 صورة", "warning");
      return;
    }
    try {
      for (const file of files) {
        const image = await uploadBarberPortfolioImage(activeBarber.id, file);
        barberProfile.portfolio.push(image);
      }
      await saveBarberProfileCloud(activeBarber.id, barberProfile);
      activeBarber.portfolio = barberProfile.portfolio;
      input.value = "";
      renderBarberProfile();
      showToast("تم رفع الصور وحفظ الألبوم في Firebase", "success");
    } catch (error) {
      showToast(error.message || "تعذر رفع الصور إلى Firebase Storage", "error");
    }
  });

  document.getElementById("barber-hairstyles-form")?.addEventListener("submit", async (event) => {
    event.preventDefault();
    try {
      await saveBarberProfile();
    } catch (error) {
      showToast("تعذر حفظ التسريحات. تحقق من صلاحيات Firebase.", "error");
    }
  });
});
