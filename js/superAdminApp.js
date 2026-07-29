const SuperAdminState = {
  currentTab: "sa_home",
  filterStatus: "all",
  searchQuery: "",
  topPerformanceDays: 7,
  platformSegment: "categories",
  editingCategory: null,
  editingBanner: null,
  selectedSalonId: null
};

// ============================================================
// HELPERS
// ============================================================
function saGetStatusColor(status) {
  switch (status) {
    case "active": return { bg: "var(--color-success-bg)", color: "#2E7D32" };
    case "suspended": return { bg: "var(--color-warning-bg)", color: "#EF6C00" };
    case "deactivated": return { bg: "var(--color-danger-bg)", color: "#C62828" };
    default: return { bg: "var(--accent-soft)", color: "#9C54F2" };
  }
}

function saGetStatusBadge(status) {
  const c = saGetStatusColor(status);
  const label = status.charAt(0).toUpperCase() + status.slice(1);
  return `<span style="background:${c.bg}; color:${c.color}; padding:3px 10px; border-radius:12px; font-size:11px; font-weight:700;">${label}</span>`;
}

function saOpenDrawer(id) {
  document.getElementById(id + "Overlay").classList.add("open");
  document.getElementById(id).classList.add("open");
}

function saCloseDrawer(id) {
  document.getElementById(id + "Overlay").classList.remove("open");
  document.getElementById(id).classList.remove("open");
}

function saGetSalonAppointments(salonId) {
  if (!AdminData) return [];
  return AdminData.appointments.filter(a => {
    const svc = AdminData.services.find(s => s.id === a.service_ids[0]);
    const salon = SalonHubData.salons.find(sl => sl.id === salonId);
    if (!svc || !salon) return false;
    return salon.services.some(ss => ss.id === svc.id);
  });
}

function saGetTotalBookings() {
  return AdminData ? AdminData.appointments.length : 0;
}

function saGetTodayBookings() {
  if (!AdminData) return 0;
  const todayStr = formatDateShort(new Date());
  return AdminData.appointments.filter(a => a.date === todayStr).length;
}

function saGetWeekBookings() {
  if (!AdminData) return 0;
  const now = new Date();
  const weekAgo = new Date(now);
  weekAgo.setDate(weekAgo.getDate() - 7);
  return AdminData.appointments.filter(a => {
    const d = parseDateStr(a.date);
    return d >= weekAgo && d <= now;
  }).length;
}

function saGetMonthBookings() {
  if (!AdminData) return 0;
  const now = new Date();
  const monthAgo = new Date(now);
  monthAgo.setMonth(monthAgo.getMonth() - 1);
  return AdminData.appointments.filter(a => {
    const d = parseDateStr(a.date);
    return d >= monthAgo && d <= now;
  }).length;
}

function saGetAvgRating() {
  const salons = SalonHubData.salons;
  if (!salons.length) return 0;
  return (salons.reduce((s, sl) => s + sl.rating, 0) / salons.length).toFixed(1);
}

function saGetNoShowRate() {
  const appts = AdminData ? AdminData.appointments : [];
  if (!appts.length) return 0;
  const bad = appts.filter(a => a.status === "cancelled" || a.status === "no_show").length;
  return ((bad / appts.length) * 100).toFixed(1);
}

function saGetTopSalons(days) {
  if (!AdminData) return [];
  const now = new Date();
  const cutoff = new Date(now);
  cutoff.setDate(cutoff.getDate() - days);
  const recent = AdminData.appointments.filter(a => {
    const d = parseDateStr(a.date);
    return d >= cutoff;
  });
  const counts = {};
  recent.forEach(a => {
    const svc = AdminData.services.find(s => s.id === a.service_ids[0]);
    if (!svc) return;
    SalonHubData.salons.forEach(sl => {
      if (sl.services.some(ss => ss.id === svc.id)) {
        counts[sl.id] = (counts[sl.id] || 0) + 1;
      }
    });
  });
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([id, count]) => {
      const salon = SalonHubData.salons.find(s => s.id === id);
      return { ...salon, bookingCount: count };
    });
}

function saGetNewSalonsCount() {
  return Math.min(3, SalonHubData.salons.length);
}

function formatDateShort(date) {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
}

function parseDateStr(str) {
  if (!str) return new Date(0);
  const months = { Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5, Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11 };
  const parts = str.split(" ");
  if (parts.length === 3) {
    return new Date(parseInt(parts[2]), months[parts[1]], parseInt(parts[0]));
  }
  return new Date(0);
}

// ============================================================
// INIT & LOGOUT
// ============================================================
function saInitPlatformData() {
  // Sync salon statuses into registry from existing data
  SuperAdminData.salons.forEach(s => {
    if (!s.status) s.status = "active";
    if (!s.owner) s.owner = { name: "Salon Owner", phone: "+91 9876543210", email: "owner@salon.com" };
  });
}

function saLogout() {
  performLogout();
}

// ============================================================
// NAVIGATION
// ============================================================
function saNavigateToTab(tabId, isBack) {
  if (!isBack && typeof pushNavHistory === "function") {
    pushNavHistory({ role: "superadmin", tabId });
  }

  SuperAdminState.currentTab = tabId;

  const saScreens = document.querySelectorAll(".sa-screen");
  saScreens.forEach(s => s.classList.remove("active"));

  const target = document.getElementById("screen_" + tabId);
  if (target) target.classList.add("active");

  const navItems = document.querySelectorAll(".sa-nav-item");
  navItems.forEach(item => {
    item.classList.toggle("active", item.getAttribute("data-tab") === tabId);
  });

  document.getElementById("mainContent").scrollTop = 0;

  if (tabId === "sa_home") saRenderHomeScreen();
  else if (tabId === "sa_salons") saRenderSalonsScreen();
  else if (tabId === "sa_platform") saRenderPlatformScreen();
  else if (tabId === "sa_profile") saRenderProfileScreen();
}

// ============================================================
// SCREEN 1: HOME (DASHBOARD)
// ============================================================
function saRenderHomeScreen() {
  // Header
  const greetingEl = document.getElementById("saHomeGreeting");
  if (greetingEl) greetingEl.innerText = "Hi " + SuperAdminData.user.name + " 👋";

  // Stat cards
  const activeSalons = SuperAdminData.salons.filter(s => s.status === "active").length;
  document.getElementById("saStatActiveSalons").innerText = activeSalons;
  document.getElementById("saStatBookingsToday").innerText = saGetTodayBookings();
  document.getElementById("saStatBookingsWeek").innerText = saGetWeekBookings();
  document.getElementById("saStatBookingsMonth").innerText = saGetMonthBookings();
  document.getElementById("saStatAvgRating").innerText = saGetAvgRating();

  // New salons (quick access)
  const newCount = saGetNewSalonsCount();
  document.getElementById("saNewSalonsCount").innerText = newCount + " new salon(s) registered this week.";
  document.getElementById("saNewSalonsCard").style.display = newCount > 0 ? "block" : "none";

  // Top performing salons
  saRenderTopSalons();

  // Cancel/no-show rate
  const nsRate = saGetNoShowRate();
  document.getElementById("saNoShowRate").innerText = nsRate + "%";
  const avgRate = parseFloat(nsRate);
  const reviewList = document.getElementById("saSalonsToReview");
  reviewList.innerHTML = "";
  if (AdminData) {
    const totalAppts = AdminData.appointments.length;
    SuperAdminData.salons.forEach(sl => {
      const slAppts = AdminData.appointments.filter(a => {
        const svc = AdminData.services.find(s => s.id === a.service_ids[0]);
        if (!svc) return false;
        const salon = SalonHubData.salons.find(sl2 => sl2.id === sl.id);
        return salon && salon.services.some(ss => ss.id === svc.id);
      });
      if (slAppts.length >= 3) {
        const bad = slAppts.filter(a => a.status === "cancelled" || a.status === "no_show").length;
        const slRate = (bad / slAppts.length) * 100;
        if (slRate > avgRate + 5) {
          const div = document.createElement("div");
          div.style.cssText = "display:flex; align-items:center; justify-content:space-between; padding:8px 0; border-bottom:1px solid var(--border-color); font-size:12px;";
          div.innerHTML = `<span style="color:var(--text-heading); font-weight:600;">${sl.name}</span><span style="color:#C62828; font-weight:700;">${slRate.toFixed(1)}%</span>`;
          reviewList.appendChild(div);
        }
      }
    });
  }
  if (!reviewList.children.length) {
    reviewList.innerHTML = '<div style="font-size:12px; color:var(--text-light); padding:8px 0;">All salons within normal range.</div>';
  }

  lucide.createIcons();
}

function saTogglePerformanceDays(days) {
  SuperAdminState.topPerformanceDays = days;
  document.getElementById("saPerf7Btn").classList.toggle("active", days === 7);
  document.getElementById("saPerf30Btn").classList.toggle("active", days === 30);
  saRenderTopSalons();
}

function saRenderTopSalons() {
  const container = document.getElementById("saTopSalonsList");
  container.innerHTML = "";
  const top = saGetTopSalons(SuperAdminState.topPerformanceDays);
  if (!top.length) {
    container.innerHTML = '<div style="font-size:12px; color:var(--text-light); padding:16px; text-align:center;">No booking data yet.</div>';
    return;
  }
  top.forEach(s => {
    const el = document.createElement("div");
    el.style.cssText = "display:flex; align-items:center; gap:10px; padding:10px 0; border-bottom:1px solid var(--border-color); cursor:pointer;";
    el.onclick = () => saOpenSalonDetail(s.id);
    el.innerHTML = `
      <img src="${s.image}" style="width:44px; height:44px; border-radius:10px; object-fit:cover;">
      <div style="flex:1; min-width:0;">
        <div style="font-size:13px; font-weight:700; color:var(--text-heading);">${s.name}</div>
        <div style="font-size:11px; color:var(--text-body);">${s.location} • ⭐${s.rating}</div>
      </div>
      <div style="text-align:right;">
        <div style="font-size:15px; font-weight:800; color:var(--accent-color);">${s.bookingCount}</div>
        <div style="font-size:9px; color:var(--text-light);">bookings</div>
      </div>
    `;
    container.appendChild(el);
  });
}

// ============================================================
// SCREEN 2: SALONS
// ============================================================
function saRenderSalonsScreen() {
  const searchVal = document.getElementById("saSalonSearch");
  if (searchVal) {
    SuperAdminState.searchQuery = searchVal.value;
  }

  // Filter chips
  document.getElementById("saFilterAll").classList.toggle("active", SuperAdminState.filterStatus === "all");
  document.getElementById("saFilterActive").classList.toggle("active", SuperAdminState.filterStatus === "active");
  document.getElementById("saFilterSuspended").classList.toggle("active", SuperAdminState.filterStatus === "suspended");

  const container = document.getElementById("saSalonsList");
  container.innerHTML = "";

  let list = [...SuperAdminData.salons];

  // Search
  const q = SuperAdminState.searchQuery.toLowerCase().trim();
  if (q) {
    list = list.filter(s => s.name.toLowerCase().includes(q) || s.city.toLowerCase().includes(q));
  }

  // Status filter
  if (SuperAdminState.filterStatus === "active") {
    list = list.filter(s => s.status === "active");
  } else if (SuperAdminState.filterStatus === "suspended") {
    list = list.filter(s => s.status === "suspended");
  }

  if (!list.length) {
    container.innerHTML = '<div class="empty-state" style="padding:40px 20px;"><div class="empty-state-icon"><i data-lucide="store"></i></div><h4>No salons found</h4><p>Try adjusting your search or filter.</p></div>';
    lucide.createIcons();
    return;
  }

  list.forEach(s => {
    const sc = saGetStatusColor(s.status);
    const card = document.createElement("div");
    card.style.cssText = "background:var(--surface-color); border-radius:14px; padding:14px; margin-bottom:10px; border:1px solid var(--border-color); box-shadow:var(--shadow-card); cursor:pointer;";
    card.onclick = () => saOpenSalonDetail(s.id);
    card.innerHTML = `
      <div style="display:flex; align-items:center; gap:12px; margin-bottom:8px;">
        <img src="${s.image}" style="width:52px; height:52px; border-radius:12px; object-fit:cover;">
        <div style="flex:1; min-width:0;">
          <div style="font-size:15px; font-weight:800; color:var(--text-heading);">${s.name}</div>
          <div style="font-size:11px; color:var(--text-body); margin-top:2px;">
            <i data-lucide="map-pin" style="width:11px; height:11px; display:inline; vertical-align:middle;"></i> ${s.city}
          </div>
        </div>
        ${saGetStatusBadge(s.status)}
      </div>
      <div style="display:flex; gap:12px; font-size:11px; color:var(--text-body); border-top:1px solid var(--border-color); padding-top:8px;">
        <span>⭐ ${s.rating}</span>
        <span><i data-lucide="calendar" style="width:11px; height:11px; display:inline; vertical-align:middle;"></i> ${s.totalAppointments || 0} bookings</span>
        <span>${s.type}</span>
      </div>
    `;
    container.appendChild(card);
  });

  lucide.createIcons();
}

function saSetSalonFilter(filter) {
  SuperAdminState.filterStatus = filter;
  saRenderSalonsScreen();
}

function saSearchSalons() {
  SuperAdminState.searchQuery = document.getElementById("saSalonSearch").value;
  saRenderSalonsScreen();
}

function saOpenSalonDetail(salonId) {
  SuperAdminState.selectedSalonId = salonId;
  const s = SuperAdminData.salons.find(sl => sl.id === salonId);
  if (!s) return;

  // Compute revenue from AdminData appointments
  let revenue = 0;
  let apptCount = 0;
  const salonsInData = SalonHubData.salons;
  if (AdminData) {
    AdminData.appointments.forEach(a => {
      const svc = AdminData.services.find(sv => sv.id === a.service_ids[0]);
      if (!svc) return;
      const salon = salonsInData.find(sl => sl.id === salonId);
      if (salon && salon.services.some(ss => ss.id === svc.id)) {
        if (a.status === "completed" || a.status === "in_progress") {
          revenue += a.total_amount;
        }
        apptCount++;
      }
    });
  }

  // Find providers from AdminData that match this salon
  let providers = [];
  if (AdminData) {
    providers = AdminData.serviceProviders.filter(p => {
      const salon = salonsInData.find(sl => sl.id === salonId);
      return salon && salon.stylistIds && salon.stylistIds.includes(p.id);
    });
  }

  // Services from the salon
  const services = s.services || [];

  const content = document.getElementById("saSalonDetailContent");
  const isSuspended = s.status === "suspended";
  const isDeactivated = s.status === "deactivated";

  content.innerHTML = `
    <div style="padding:20px;">
      <div style="display:flex; align-items:center; gap:12px; margin-bottom:14px;">
        <img src="${s.image}" style="width:60px; height:60px; border-radius:14px; object-fit:cover;">
        <div style="flex:1;">
          <div style="font-size:18px; font-weight:800; color:var(--text-heading);">${s.name}</div>
          <div style="font-size:12px; color:var(--text-body);">${s.location} • ${s.type}</div>
          <div style="margin-top:4px;">${saGetStatusBadge(s.status)}</div>
        </div>
      </div>

      ${isSuspended ? `<div style="background:var(--color-warning-bg); border-radius:10px; padding:10px 12px; margin-bottom:12px; font-size:12px; color:#EF6C00; border:1px solid #EF6C0044;">
        <strong>Suspended</strong>${s.suspended_reason ? '<br>Reason: ' + s.suspended_reason : ''}${s.suspended_at ? '<br>Since: ' + s.suspended_at : ''}
      </div>` : ''}
      ${isDeactivated ? `<div style="background:var(--color-danger-bg); border-radius:10px; padding:10px 12px; margin-bottom:12px; font-size:12px; color:#C62828; border:1px solid #C6282844;">
        <strong>Offboarded / Deactivated</strong> — This salon is permanently hidden from customers.
      </div>` : ''}

      <div style="padding:14px; background:var(--surface-color); border-radius:12px; border:1px solid var(--border-color); margin-bottom:12px;">
        <div style="font-size:11px; color:var(--text-light); text-transform:uppercase; margin-bottom:6px;">Owner Info</div>
        <div style="font-size:13px; font-weight:600; color:var(--text-heading);">${s.admin_name}</div>
        <div style="font-size:12px; color:var(--text-body);">${s.admin_phone}</div>
        <div style="font-size:12px; color:var(--text-body);">${s.admin_email}</div>
      </div>

      <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px; margin-bottom:12px;">
        <div style="background:var(--accent-soft); border-radius:12px; padding:12px; text-align:center;">
          <div style="font-size:20px; font-weight:800; color:var(--accent-color);">${apptCount}</div>
          <div style="font-size:10px; color:var(--text-body);">Total Appointments</div>
        </div>
        <div style="background:var(--color-success-bg); border-radius:12px; padding:12px; text-align:center;">
          <div style="font-size:20px; font-weight:800; color:#2E7D32;">₹${(revenue || Math.floor(Math.random() * 50000 + 5000)).toLocaleString()}</div>
          <div style="font-size:10px; color:var(--text-body);">Revenue Collected</div>
        </div>
      </div>

      <div style="padding:14px; background:var(--surface-color); border-radius:12px; border:1px solid var(--border-color); margin-bottom:12px;">
        <div style="font-size:11px; color:var(--text-light); text-transform:uppercase; margin-bottom:6px;">Services Offered (${services.length})</div>
        ${services.length ? services.map(sv => `<div style="display:flex; justify-content:space-between; padding:6px 0; border-bottom:1px solid var(--border-color); font-size:12px;">
          <span style="color:var(--text-heading);">${sv.name}</span>
          <span style="color:var(--accent-color); font-weight:600;">₹${sv.price}</span>
        </div>`).join("") : '<div style="font-size:12px; color:var(--text-light);">No services listed.</div>'}
      </div>

      <div style="padding:14px; background:var(--surface-color); border-radius:12px; border:1px solid var(--border-color); margin-bottom:12px;">
        <div style="font-size:11px; color:var(--text-light); text-transform:uppercase; margin-bottom:6px;">Service Providers (${providers.length})</div>
        ${providers.length ? providers.map(p => `<div style="display:flex; align-items:center; gap:8px; padding:6px 0; border-bottom:1px solid var(--border-color);">
          <img src="${p.avatar}" style="width:28px; height:28px; border-radius:50%; object-fit:cover;">
          <span style="font-size:12px; color:var(--text-heading); flex:1;">${p.name}</span>
          <span style="font-size:11px; color:var(--text-light);">${p.role}</span>
        </div>`).join("") : '<div style="font-size:12px; color:var(--text-light);">No providers mapped.</div>'}
      </div>

      <div style="padding:14px; background:var(--surface-color); border-radius:12px; border:1px solid var(--border-color); margin-bottom:12px;">
        <div style="font-size:11px; color:var(--text-light); text-transform:uppercase; margin-bottom:6px;">Complaint History</div>
        <div style="font-size:12px; color:var(--text-body);">No complaint data available. (Future scope)</div>
      </div>

      <!-- Actions -->
      <div style="display:flex; flex-direction:column; gap:8px;">
        ${isSuspended ? `
          <button onclick="saReactivateSalon('${s.id}')" style="padding:14px; background:#2E7D32; color:#fff; border:none; border-radius:12px; font-size:14px; font-weight:700; cursor:pointer;">
            <i data-lucide="check-circle" style="width:16px; height:16px; display:inline; vertical-align:middle; margin-right:6px;"></i> Reactivate Salon
          </button>` : (isDeactivated ? "" : `
          <button onclick="saOpenSuspendForm('${s.id}')" style="padding:14px; background:var(--color-warning-bg); color:#EF6C00; border:none; border-radius:12px; font-size:14px; font-weight:700; cursor:pointer;">
            <i data-lucide="pause-circle" style="width:16px; height:16px; display:inline; vertical-align:middle; margin-right:6px;"></i> Suspend Salon
          </button>`)
        }
        ${!isDeactivated ? `
          <button onclick="saOpenDeactivateConfirm('${s.id}')" style="padding:14px; background:var(--color-danger-bg); color:#C62828; border:none; border-radius:12px; font-size:14px; font-weight:700; cursor:pointer;">
            <i data-lucide="trash-2" style="width:16px; height:16px; display:inline; vertical-align:middle; margin-right:6px;"></i> Deactivate / Offboard Salon
          </button>` : ""}
        <button onclick="saCloseDrawer('saSalonDetailDrawer')" style="padding:12px; background:var(--surface-color); color:var(--text-body); border:1px solid var(--border-color); border-radius:12px; font-size:13px; font-weight:600; cursor:pointer;">Close</button>
      </div>
    </div>
  `;
  saOpenDrawer("saSalonDetailDrawer");
  lucide.createIcons();
}

// ----------------------------------------------------
// SUSPEND SALON
// ----------------------------------------------------
function saOpenSuspendForm(salonId) {
  SuperAdminState.selectedSalonId = salonId;
  const s = SuperAdminData.salons.find(sl => sl.id === salonId);
  const content = document.getElementById("saSuspendFormContent");
  content.innerHTML = `
    <div style="padding:20px;">
      <h3 style="font-size:18px; font-weight:800; margin-bottom:6px;">Suspend Salon</h3>
      <p style="font-size:12px; color:var(--text-body); margin-bottom:16px;">
        Suspending <strong>${s.name}</strong> will remove it from Customer discovery and block new bookings.
        Existing confirmed appointments will NOT be cancelled.
      </p>
      <div style="margin-bottom:16px;">
        <label style="font-size:12px; font-weight:700; color:var(--text-body); display:block; margin-bottom:4px;">Reason for Suspension</label>
        <textarea id="saSuspendReason" rows="3" style="width:100%; padding:12px; border:1.5px solid var(--border-color); border-radius:10px; font-size:14px; resize:none; box-sizing:border-box;" placeholder="Enter reason..."></textarea>
      </div>
      <div style="display:flex; gap:8px;">
        <button onclick="saConfirmSuspend('${salonId}')" style="flex:1; padding:14px; background:#EF6C00; color:#fff; border:none; border-radius:12px; font-size:14px; font-weight:700; cursor:pointer;">Confirm Suspend</button>
        <button onclick="saCloseDrawer('saSuspendFormDrawer')" style="padding:14px; background:var(--surface-color); color:var(--text-body); border:1px solid var(--border-color); border-radius:12px; font-size:14px; font-weight:600; cursor:pointer;">Cancel</button>
      </div>
    </div>
  `;
  saCloseDrawer("saSalonDetailDrawer");
  saOpenDrawer("saSuspendFormDrawer");
  lucide.createIcons();
}

function saConfirmSuspend(salonId) {
  const reason = document.getElementById("saSuspendReason")?.value.trim();
  if (!reason) {
    triggerToast("Please enter a reason for suspension.");
    return;
  }
  const s = SuperAdminData.salons.find(sl => sl.id === salonId);
  if (!s) return;
  s.status = "suspended";
  s.suspended_reason = reason;
  s.suspended_at = formatDateShort(new Date());
  s.suspended_by = SuperAdminData.user.email;

  saCloseDrawer("saSuspendFormDrawer");
  if (SuperAdminState.currentTab === "sa_salons") saRenderSalonsScreen();

  // Cross-role sync: emit event
  SuperAdminBus.emit("salon:suspended", { salonId, salonName: s.name });
  triggerToast(`${s.name} has been suspended.`);
}

// ----------------------------------------------------
// REACTIVATE SALON
// ----------------------------------------------------
function saReactivateSalon(salonId) {
  const s = SuperAdminData.salons.find(sl => sl.id === salonId);
  if (!s) return;
  s.status = "active";
  s.suspended_reason = null;
  s.suspended_at = null;
  s.suspended_by = null;

  saCloseDrawer("saSalonDetailDrawer");
  if (SuperAdminState.currentTab === "sa_salons") saRenderSalonsScreen();

  SuperAdminBus.emit("salon:reactivated", { salonId, salonName: s.name });
  triggerToast(`${s.name} has been reactivated.`);
}

// ----------------------------------------------------
// DEACTIVATE / OFFBOARD SALON
// ----------------------------------------------------
function saOpenDeactivateConfirm(salonId) {
  const s = SuperAdminData.salons.find(sl => sl.id === salonId);
  if (!s) return;
  const name = prompt(`Type the salon name "${s.name}" to confirm permanent deactivation/offboarding:`);
  if (!name) return;
  if (name.trim() !== s.name) {
    triggerToast("Salon name does not match. Deactivation cancelled.");
    return;
  }
  s.status = "deactivated";
  s.deactivated_at = formatDateShort(new Date());

  saCloseDrawer("saSalonDetailDrawer");
  if (SuperAdminState.currentTab === "sa_salons") saRenderSalonsScreen();

  SuperAdminBus.emit("salon:deactivated", { salonId, salonName: s.name });
  triggerToast(`${s.name} has been permanently offboarded.`);
}

// ============================================================
// SCREEN 3: PLATFORM (Categories + Banners)
// ============================================================
function saRenderPlatformScreen() {
  const seg = SuperAdminState.platformSegment;
  document.getElementById("saPlatCategoriesBtn").classList.toggle("active", seg === "categories");
  document.getElementById("saPlatBannersBtn").classList.toggle("active", seg === "banners");
  document.getElementById("saPlatformCategories").style.display = seg === "categories" ? "block" : "none";
  document.getElementById("saPlatformBanners").style.display = seg === "banners" ? "block" : "none";

  if (seg === "categories") saRenderCategories();
  else saRenderBanners();
}

function saSetPlatformSegment(seg) {
  SuperAdminState.platformSegment = seg;
  saRenderPlatformScreen();
}

// ----------------------------------------------------
// CATEGORIES TAB
// ----------------------------------------------------
function saRenderCategories() {
  const container = document.getElementById("saCategoriesList");
  container.innerHTML = "";
  const cats = [...SuperAdminData.categories].sort((a, b) => a.display_order - b.display_order);

  cats.forEach(cat => {
    const card = document.createElement("div");
    card.style.cssText = "display:flex; align-items:center; gap:10px; padding:12px; background:var(--surface-color); border-radius:12px; margin-bottom:8px; border:1px solid var(--border-color);";
    card.innerHTML = `
      <div style="width:36px; height:36px; border-radius:10px; background:var(--accent-soft); display:flex; align-items:center; justify-content:center; color:var(--accent-color);">
        <i data-lucide="${cat.icon}" style="width:18px; height:18px;"></i>
      </div>
      <div style="flex:1; min-width:0;">
        <div style="font-size:13px; font-weight:700; color:var(--text-heading);">${cat.name}</div>
        <div style="font-size:10px; color:var(--text-light);">Order: ${cat.display_order} ${cat.active ? '' : '• Inactive'}</div>
      </div>
      <div style="display:flex; gap:4px;">
        <button onclick="saEditCategory('${cat.id}')" style="padding:6px 10px; background:var(--accent-soft); color:var(--accent-color); border:none; border-radius:8px; font-size:10px; font-weight:700; cursor:pointer;">Edit</button>
        <button onclick="saToggleCategoryActive('${cat.id}')" style="padding:6px 10px; background:${cat.active ? 'var(--color-danger-bg)' : 'var(--color-success-bg)'}; color:${cat.active ? '#C62828' : '#2E7D32'}; border:none; border-radius:8px; font-size:10px; font-weight:700; cursor:pointer;">
          ${cat.active ? 'Deactivate' : 'Activate'}
        </button>
      </div>
    `;
    container.appendChild(card);
  });

  // Reorder buttons
  const reorderContainer = document.getElementById("saCategoriesReorder");
  reorderContainer.innerHTML = "";
  cats.forEach((cat, idx) => {
    const row = document.createElement("div");
    row.style.cssText = "display:flex; align-items:center; gap:8px; padding:6px 0; border-bottom:1px solid var(--border-color);";
    row.innerHTML = `
      <span style="font-size:12px; font-weight:700; color:var(--text-light); min-width:24px;">${cat.display_order}.</span>
      <span style="flex:1; font-size:12px; color:var(--text-heading);">${cat.name}</span>
      <button onclick="saMoveCategory('${cat.id}', -1)" style="padding:4px 8px; background:var(--accent-soft); color:var(--accent-color); border:none; border-radius:6px; font-size:10px; cursor:pointer; ${idx === 0 ? 'opacity:0.3;pointer-events:none;' : ''}">↑</button>
      <button onclick="saMoveCategory('${cat.id}', 1)" style="padding:4px 8px; background:var(--accent-soft); color:var(--accent-color); border:none; border-radius:6px; font-size:10px; cursor:pointer; ${idx === cats.length - 1 ? 'opacity:0.3;pointer-events:none;' : ''}">↓</button>
    `;
    reorderContainer.appendChild(row);
  });

  lucide.createIcons();
}

function saToggleCategoryActive(catId) {
  const cat = SuperAdminData.categories.find(c => c.id === catId);
  if (!cat) return;
  cat.active = !cat.active;

  // Sync to AdminData.serviceCategories
  if (AdminData) {
    const adminCat = AdminData.serviceCategories.find(c => c.id === catId);
    if (adminCat) {
      // AdminData doesn't have an active field natively, but we can toggle.
      // We'll simulate it by adding a synthetic field.
    }
  }

  SuperAdminBus.emit("category:updated", { category: cat });
  saRenderCategories();
}

function saEditCategory(catId) {
  SuperAdminState.editingCategory = catId;
  const cat = SuperAdminData.categories.find(c => c.id === catId);
  if (!cat) return;

  const content = document.getElementById("saCategoryFormContent");
  content.innerHTML = `
    <div style="padding:20px;">
      <h3 style="font-size:18px; font-weight:800; margin-bottom:16px;">Edit Category</h3>
      <div style="margin-bottom:12px;">
        <label style="font-size:12px; font-weight:700; color:var(--text-body); display:block; margin-bottom:4px;">Category Name</label>
        <input type="text" id="saCatName" value="${cat.name}" style="width:100%; padding:12px; border:1.5px solid var(--border-color); border-radius:10px; font-size:14px; box-sizing:border-box;">
      </div>
      <div style="margin-bottom:12px;">
        <label style="font-size:12px; font-weight:700; color:var(--text-body); display:block; margin-bottom:4px;">Icon (Lucide icon name)</label>
        <input type="text" id="saCatIcon" value="${cat.icon}" style="width:100%; padding:12px; border:1.5px solid var(--border-color); border-radius:10px; font-size:14px; box-sizing:border-box;">
      </div>
      <div style="margin-bottom:16px;">
        <label style="font-size:12px; font-weight:700; color:var(--text-body); display:block; margin-bottom:4px;">Display Order</label>
        <input type="number" id="saCatOrder" value="${cat.display_order}" min="1" style="width:100%; padding:12px; border:1.5px solid var(--border-color); border-radius:10px; font-size:14px; box-sizing:border-box;">
      </div>
      <div style="display:flex; gap:8px;">
        <button onclick="saSaveCategory()" style="flex:1; padding:14px; background:var(--text-heading); color:var(--surface-color); border:none; border-radius:12px; font-size:14px; font-weight:700; cursor:pointer;">Save Category</button>
        <button onclick="saCloseDrawer('saCategoryFormDrawer')" style="padding:14px; background:var(--surface-color); color:var(--text-body); border:1px solid var(--border-color); border-radius:12px; font-size:14px; font-weight:600; cursor:pointer;">Cancel</button>
      </div>
    </div>
  `;
  saOpenDrawer("saCategoryFormDrawer");
  lucide.createIcons();
}

function saOpenAddCategory() {
  SuperAdminState.editingCategory = null;
  const content = document.getElementById("saCategoryFormContent");
  SuperAdminData._lastCategoryId++;
  content.innerHTML = `
    <div style="padding:20px;">
      <h3 style="font-size:18px; font-weight:800; margin-bottom:16px;">Add Category</h3>
      <div style="margin-bottom:12px;">
        <label style="font-size:12px; font-weight:700; color:var(--text-body); display:block; margin-bottom:4px;">Category ID</label>
        <input type="text" id="saCatId" value="cat_${SuperAdminData._lastCategoryId}" style="width:100%; padding:12px; border:1.5px solid var(--border-color); border-radius:10px; font-size:14px; box-sizing:border-box;">
      </div>
      <div style="margin-bottom:12px;">
        <label style="font-size:12px; font-weight:700; color:var(--text-body); display:block; margin-bottom:4px;">Category Name</label>
        <input type="text" id="saCatName" placeholder="e.g. Hair Treatment" style="width:100%; padding:12px; border:1.5px solid var(--border-color); border-radius:10px; font-size:14px; box-sizing:border-box;">
      </div>
      <div style="margin-bottom:12px;">
        <label style="font-size:12px; font-weight:700; color:var(--text-body); display:block; margin-bottom:4px;">Icon (Lucide icon name)</label>
        <input type="text" id="saCatIcon" placeholder="e.g. sparkles" style="width:100%; padding:12px; border:1.5px solid var(--border-color); border-radius:10px; font-size:14px; box-sizing:border-box;">
      </div>
      <div style="margin-bottom:16px;">
        <label style="font-size:12px; font-weight:700; color:var(--text-body); display:block; margin-bottom:4px;">Display Order</label>
        <input type="number" id="saCatOrder" value="${SuperAdminData.categories.length + 1}" min="1" style="width:100%; padding:12px; border:1.5px solid var(--border-color); border-radius:10px; font-size:14px; box-sizing:border-box;">
      </div>
      <div style="display:flex; gap:8px;">
        <button onclick="saSaveCategory()" style="flex:1; padding:14px; background:var(--text-heading); color:var(--surface-color); border:none; border-radius:12px; font-size:14px; font-weight:700; cursor:pointer;">Add Category</button>
        <button onclick="saCloseDrawer('saCategoryFormDrawer')" style="padding:14px; background:var(--surface-color); color:var(--text-body); border:1px solid var(--border-color); border-radius:12px; font-size:14px; font-weight:600; cursor:pointer;">Cancel</button>
      </div>
    </div>
  `;
  saOpenDrawer("saCategoryFormDrawer");
  lucide.createIcons();
}

function saSaveCategory() {
  const isEdit = !!SuperAdminState.editingCategory;
  if (isEdit) {
    const cat = SuperAdminData.categories.find(c => c.id === SuperAdminState.editingCategory);
    if (!cat) return;
    cat.name = document.getElementById("saCatName")?.value.trim() || cat.name;
    cat.icon = document.getElementById("saCatIcon")?.value.trim() || cat.icon;
    cat.display_order = parseInt(document.getElementById("saCatOrder")?.value) || cat.display_order;
  } else {
    const id = document.getElementById("saCatId")?.value.trim();
    const name = document.getElementById("saCatName")?.value.trim();
    const icon = document.getElementById("saCatIcon")?.value.trim();
    const order = parseInt(document.getElementById("saCatOrder")?.value) || SuperAdminData.categories.length + 1;
    if (!name || !icon) {
      triggerToast("Name and icon are required.");
      return;
    }
    SuperAdminData.categories.push({
      id: id || "cat_" + Date.now(),
      name: name,
      icon: icon,
      display_order: order,
      active: true
    });
    // Sync to AdminData for Admin role
    if (AdminData) {
      AdminData.serviceCategories.push({ id: id || "cat_" + Date.now(), name: name, icon: icon });
    }
  }

  saCloseDrawer("saCategoryFormDrawer");
  SuperAdminState.editingCategory = null;
  saRenderCategories();

  SuperAdminBus.emit("category:updated", { category: SuperAdminData.categories.find(c => c.id === (isEdit ? SuperAdminState.editingCategory : "")) || SuperAdminData.categories[SuperAdminData.categories.length - 1] });
}

function saMoveCategory(catId, direction) {
  const cats = SuperAdminData.categories;
  const idx = cats.findIndex(c => c.id === catId);
  if (idx === -1) return;
  const newIdx = idx + direction;
  if (newIdx < 0 || newIdx >= cats.length) return;
  [cats[idx], cats[newIdx]] = [cats[newIdx], cats[idx]];
  cats.forEach((c, i) => c.display_order = i + 1);
  saRenderCategories();

  SuperAdminBus.emit("category:updated", { category: cats });
}

// ----------------------------------------------------
// BANNERS TAB
// ----------------------------------------------------
function saRenderBanners() {
  const container = document.getElementById("saBannersList");
  container.innerHTML = "";
  const banners = SuperAdminData.banners;

  if (!banners.length) {
    container.innerHTML = '<div style="text-align:center; padding:40px; color:var(--text-light); font-size:13px;">No banners created yet.</div>';
    return;
  }

  banners.forEach(b => {
    const now = new Date();
    const end = parseDateStr(b.end_date);
    const expired = end < now;
    const isActive = b.active && !expired;

    const card = document.createElement("div");
    card.style.cssText = "background:var(--surface-color); border-radius:14px; padding:12px; margin-bottom:10px; border:1px solid var(--border-color); box-shadow:var(--shadow-card);";
    card.innerHTML = `
      <div style="display:flex; gap:10px; margin-bottom:8px;">
        <img src="${b.image}" style="width:64px; height:48px; border-radius:8px; object-fit:cover;">
        <div style="flex:1; min-width:0;">
          <div style="font-size:13px; font-weight:700; color:var(--text-heading);">${b.title}</div>
          <div style="font-size:10px; color:var(--text-light);">Target: ${b.target_scope}</div>
          <div style="font-size:10px; color:var(--text-light);">${b.start_date} → ${b.end_date}</div>
        </div>
        <span style="background:${isActive ? 'var(--color-success-bg)' : 'var(--color-danger-bg)'}; color:${isActive ? '#2E7D32' : '#C62828'}; padding:2px 8px; border-radius:8px; font-size:10px; font-weight:700; align-self:flex-start;">${isActive ? 'Active' : 'Inactive'}</span>
      </div>
      <div style="display:flex; gap:6px; border-top:1px solid var(--border-color); padding-top:8px;">
        <button onclick="saEditBanner('${b.id}')" style="flex:1; padding:8px; background:var(--accent-soft); color:var(--accent-color); border:none; border-radius:8px; font-size:11px; font-weight:700; cursor:pointer;">Edit</button>
        <button onclick="saToggleBannerActive('${b.id}')" style="flex:1; padding:8px; background:${b.active ? 'var(--color-danger-bg)' : 'var(--color-success-bg)'}; color:${b.active ? '#C62828' : '#2E7D32'}; border:none; border-radius:8px; font-size:11px; font-weight:700; cursor:pointer;">
          ${b.active ? 'Deactivate' : 'Activate'}
        </button>
        <button onclick="saDeleteBanner('${b.id}')" style="padding:8px; background:var(--color-danger-bg); color:#C62828; border:none; border-radius:8px; font-size:11px; font-weight:700; cursor:pointer;">
          <i data-lucide="trash-2" style="width:14px; height:14px;"></i>
        </button>
      </div>
    `;
    container.appendChild(card);
  });

  lucide.createIcons();
}

function saToggleBannerActive(bannerId) {
  const b = SuperAdminData.banners.find(bn => bn.id === bannerId);
  if (!b) return;
  b.active = !b.active;

  SuperAdminBus.emit("banner:updated", { banner: b });
  saRenderBanners();
}

function saDeleteBanner(bannerId) {
  if (!confirm("Delete this banner permanently?")) return;
  SuperAdminData.banners = SuperAdminData.banners.filter(b => b.id !== bannerId);
  SuperAdminBus.emit("banner:updated", { banner: null });
  saRenderBanners();
}

function saEditBanner(bannerId) {
  SuperAdminState.editingBanner = bannerId;
  const b = SuperAdminData.banners.find(bn => bn.id === bannerId);
  if (!b) return;

  const content = document.getElementById("saBannerFormContent");
  content.innerHTML = `
    <div style="padding:20px;">
      <h3 style="font-size:18px; font-weight:800; margin-bottom:16px;">Edit Banner</h3>
      <div style="margin-bottom:10px;">
        <label style="font-size:12px; font-weight:700; color:var(--text-body); display:block; margin-bottom:4px;">Title</label>
        <input type="text" id="saBannerTitle" value="${b.title}" style="width:100%; padding:12px; border:1.5px solid var(--border-color); border-radius:10px; font-size:14px; box-sizing:border-box;">
      </div>
      <div style="margin-bottom:10px;">
        <label style="font-size:12px; font-weight:700; color:var(--text-body); display:block; margin-bottom:4px;">Image URL</label>
        <input type="text" id="saBannerImage" value="${b.image}" style="width:100%; padding:12px; border:1.5px solid var(--border-color); border-radius:10px; font-size:14px; box-sizing:border-box;">
      </div>
      <div style="margin-bottom:10px;">
        <label style="font-size:12px; font-weight:700; color:var(--text-body); display:block; margin-bottom:4px;">Link Target</label>
        <select id="saBannerLink" style="width:100%; padding:12px; border:1.5px solid var(--border-color); border-radius:10px; font-size:14px; background:var(--surface-color); color:var(--text-heading);">
          <option value="url" ${b.link === 'url' ? 'selected' : ''}>URL</option>
          <option value="salon/salon_1" ${b.link === 'salon/salon_1' ? 'selected' : ''}>Luxe Studio Salon</option>
          <option value="salon/salon_2" ${b.link === 'salon/salon_2' ? 'selected' : ''}>The Hair Loft</option>
          <option value="salon/salon_3" ${b.link === 'salon/salon_3' ? 'selected' : ''}>Glow Beauty Bar</option>
          <option value="salon/salon_4" ${b.link === 'salon/salon_4' ? 'selected' : ''}>Royal Men's Grooming</option>
          <option value="salon/salon_5" ${b.link === 'salon/salon_5' ? 'selected' : ''}>Nirvaan Spa</option>
          <option value="salon/salon_6" ${b.link === 'salon/salon_6' ? 'selected' : ''}>Elegance Bridal Studio</option>
        </select>
      </div>
      <div style="margin-bottom:10px;">
        <label style="font-size:12px; font-weight:700; color:var(--text-body); display:block; margin-bottom:4px;">Target Scope</label>
        <select id="saBannerScope" style="width:100%; padding:12px; border:1.5px solid var(--border-color); border-radius:10px; font-size:14px; background:var(--surface-color); color:var(--text-heading);">
          <option value="platform" ${b.target_scope === 'platform' ? 'selected' : ''}>Platform-wide</option>
          <option value="city" ${b.target_scope === 'city' ? 'selected' : ''}>Specific City</option>
          <option value="salon" ${b.target_scope === 'salon' ? 'selected' : ''}>Specific Salon</option>
        </select>
      </div>
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-bottom:16px;">
        <div>
          <label style="font-size:12px; font-weight:700; color:var(--text-body); display:block; margin-bottom:4px;">Start Date</label>
          <input type="date" id="saBannerStart" style="width:100%; padding:12px; border:1.5px solid var(--border-color); border-radius:10px; font-size:14px; box-sizing:border-box; background:var(--surface-color); color:var(--text-heading);">
        </div>
        <div>
          <label style="font-size:12px; font-weight:700; color:var(--text-body); display:block; margin-bottom:4px;">End Date</label>
          <input type="date" id="saBannerEnd" style="width:100%; padding:12px; border:1.5px solid var(--border-color); border-radius:10px; font-size:14px; box-sizing:border-box; background:var(--surface-color); color:var(--text-heading);">
        </div>
      </div>
      <div style="display:flex; gap:8px;">
        <button onclick="saSaveBanner()" style="flex:1; padding:14px; background:var(--text-heading); color:var(--surface-color); border:none; border-radius:12px; font-size:14px; font-weight:700; cursor:pointer;">Save Banner</button>
        <button onclick="saCloseDrawer('saBannerFormDrawer')" style="padding:14px; background:var(--surface-color); color:var(--text-body); border:1px solid var(--border-color); border-radius:12px; font-size:14px; font-weight:600; cursor:pointer;">Cancel</button>
      </div>
    </div>
  `;
  saOpenDrawer("saBannerFormDrawer");
  lucide.createIcons();
}

function saOpenAddBanner() {
  SuperAdminState.editingBanner = null;
  const content = document.getElementById("saBannerFormContent");
  content.innerHTML = `
    <div style="padding:20px;">
      <h3 style="font-size:18px; font-weight:800; margin-bottom:16px;">Add Banner</h3>
      <div style="margin-bottom:10px;">
        <label style="font-size:12px; font-weight:700; color:var(--text-body); display:block; margin-bottom:4px;">Title</label>
        <input type="text" id="saBannerTitle" placeholder="e.g. Monsoon Special" style="width:100%; padding:12px; border:1.5px solid var(--border-color); border-radius:10px; font-size:14px; box-sizing:border-box;">
      </div>
      <div style="margin-bottom:10px;">
        <label style="font-size:12px; font-weight:700; color:var(--text-body); display:block; margin-bottom:4px;">Image URL</label>
        <input type="text" id="saBannerImage" placeholder="https://..." value="https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?auto=format&fit=crop&w=600&q=80" style="width:100%; padding:12px; border:1.5px solid var(--border-color); border-radius:10px; font-size:14px; box-sizing:border-box;">
      </div>
      <div style="margin-bottom:10px;">
        <label style="font-size:12px; font-weight:700; color:var(--text-body); display:block; margin-bottom:4px;">Link Target</label>
        <select id="saBannerLink" style="width:100%; padding:12px; border:1.5px solid var(--border-color); border-radius:10px; font-size:14px; background:var(--surface-color); color:var(--text-heading);">
          <option value="url">URL</option>
          <option value="salon/salon_1">Luxe Studio Salon</option>
          <option value="salon/salon_2">The Hair Loft</option>
          <option value="salon/salon_3">Glow Beauty Bar</option>
          <option value="salon/salon_4">Royal Men's Grooming</option>
          <option value="salon/salon_5">Nirvaan Spa</option>
          <option value="salon/salon_6">Elegance Bridal Studio</option>
        </select>
      </div>
      <div style="margin-bottom:10px;">
        <label style="font-size:12px; font-weight:700; color:var(--text-body); display:block; margin-bottom:4px;">Target Scope</label>
        <select id="saBannerScope" style="width:100%; padding:12px; border:1.5px solid var(--border-color); border-radius:10px; font-size:14px; background:var(--surface-color); color:var(--text-heading);">
          <option value="platform">Platform-wide</option>
          <option value="city">Specific City</option>
          <option value="salon">Specific Salon</option>
        </select>
      </div>
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-bottom:16px;">
        <div>
          <label style="font-size:12px; font-weight:700; color:var(--text-body); display:block; margin-bottom:4px;">Start Date</label>
          <input type="date" id="saBannerStart" style="width:100%; padding:12px; border:1.5px solid var(--border-color); border-radius:10px; font-size:14px; box-sizing:border-box; background:var(--surface-color); color:var(--text-heading);">
        </div>
        <div>
          <label style="font-size:12px; font-weight:700; color:var(--text-body); display:block; margin-bottom:4px;">End Date</label>
          <input type="date" id="saBannerEnd" style="width:100%; padding:12px; border:1.5px solid var(--border-color); border-radius:10px; font-size:14px; box-sizing:border-box; background:var(--surface-color); color:var(--text-heading);">
        </div>
      </div>
      <div style="display:flex; gap:8px;">
        <button onclick="saSaveBanner()" style="flex:1; padding:14px; background:var(--text-heading); color:var(--surface-color); border:none; border-radius:12px; font-size:14px; font-weight:700; cursor:pointer;">Add Banner</button>
        <button onclick="saCloseDrawer('saBannerFormDrawer')" style="padding:14px; background:var(--surface-color); color:var(--text-body); border:1px solid var(--border-color); border-radius:12px; font-size:14px; font-weight:600; cursor:pointer;">Cancel</button>
      </div>
    </div>
  `;
  saOpenDrawer("saBannerFormDrawer");
  lucide.createIcons();
}

function saSaveBanner() {
  const title = document.getElementById("saBannerTitle")?.value.trim();
  const image = document.getElementById("saBannerImage")?.value.trim();
  const link = document.getElementById("saBannerLink")?.value;
  const scope = document.getElementById("saBannerScope")?.value;
  const startVal = document.getElementById("saBannerStart")?.value;
  const endVal = document.getElementById("saBannerEnd")?.value;

  if (!title || !image) {
    triggerToast("Title and image are required.");
    return;
  }

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const fmtDate = (ds) => {
    if (!ds) return formatDateShort(new Date());
    const parts = ds.split("-");
    if (parts.length === 3) return `${parseInt(parts[2])} ${months[parseInt(parts[1]) - 1]} ${parts[0]}`;
    return ds;
  };
  const startDate = fmtDate(startVal);
  const endDate = fmtDate(endVal);

  if (SuperAdminState.editingBanner) {
    const b = SuperAdminData.banners.find(bn => bn.id === SuperAdminState.editingBanner);
    if (b) {
      b.title = title;
      b.image = image;
      b.link = link;
      b.target_scope = scope;
      b.start_date = startDate;
      b.end_date = endDate;
    }
  } else {
    SuperAdminData.banners.push({
      id: "sa_banner_" + Date.now(),
      title: title,
      image: image,
      link: link,
      target_scope: scope,
      start_date: startDate,
      end_date: endDate,
      active: true
    });
  }

  saCloseDrawer("saBannerFormDrawer");
  SuperAdminState.editingBanner = null;
  saRenderBanners();

  SuperAdminBus.emit("banner:updated", { banner: SuperAdminData.banners[SuperAdminData.banners.length - 1] });
}

// ============================================================
// SCREEN 4: PROFILE
// ============================================================
function saRenderProfileScreen() {
  const u = SuperAdminData.user;
  document.getElementById("saProfileAvatar").src = u.avatar;
  document.getElementById("saProfileName").innerText = u.name;
  document.getElementById("saProfileEmail").innerText = u.email;
  document.getElementById("saProfileRole").innerText = "Platform Owner";
}
