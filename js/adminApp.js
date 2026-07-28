const AdminState = {
  currentTab: 'admin_home',
  appointmentsFilter: { date: 'today', provider: 'all', service: 'all', status: 'all', source: 'all' },
  staffSegment: 'all', // 'all' or 'leaves'
  servicesSegment: 'services', // 'services' or 'combos'
  selectedAppointmentId: null,
  selectedProviderId: null,
  selectedServiceId: null,
  editingService: null,
  editingCombo: null,
  editingProvider: null,
  closureCalendarMonth: new Date(),
  showClosureCalendar: false
};

function formatDate(date) {
  const d = date || new Date();
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${days[d.getDay()]}, ${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

function formatDateShort(date) {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
}

function getTodayDateStr() {
  return formatDateShort(new Date());
}

function parseDateStr(str) {
  const months = { Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5, Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11 };
  const parts = str.split(' ');
  if (parts.length === 3) {
    return new Date(parseInt(parts[2]), months[parts[1]], parseInt(parts[0]));
  }
  return new Date();
}

function getProviderName(id) {
  const p = AdminData.serviceProviders.find(sp => sp.id === id);
  return p ? p.name : 'Unknown';
}

function getProvider(id) {
  return AdminData.serviceProviders.find(sp => sp.id === id);
}

function getServiceName(id) {
  const s = AdminData.services.find(sv => sv.id === id);
  return s ? s.name : 'Unknown';
}

function getService(id) {
  return AdminData.services.find(sv => sv.id === id);
}

function getCategoryName(catId) {
  const c = AdminData.serviceCategories.find(cat => cat.id === catId);
  return c ? c.name : catId;
}

function getStatusColor(status) {
  switch (status) {
    case 'approved': case 'completed': case 'active': return { bg: 'var(--color-success-bg)', color: '#2E7D32' };
    case 'pending': case 'in_progress': return { bg: 'var(--color-warning-bg)', color: '#EF6C00' };
    case 'rejected': case 'cancelled': case 'no_show': case 'suspended': return { bg: 'var(--color-danger-bg)', color: '#C62828' };
    case 'scheduled': return { bg: 'var(--color-info-bg)', color: '#1565C0' };
    default: return { bg: 'var(--accent-soft)', color: '#9C54F2' };
  }
}

function getStatusBadge(status) {
  const c = getStatusColor(status);
  const label = status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  return `<span style="background:${c.bg}; color:${c.color}; padding:3px 10px; border-radius:12px; font-size:11px; font-weight:700;">${label}</span>`;
}

// ----------------------------------------------------
// ADMIN NAVIGATION
// ----------------------------------------------------
function adminNavigateToTab(tabId) {
  AdminState.currentTab = tabId;

  const adminScreens = document.querySelectorAll('.admin-screen');
  adminScreens.forEach(s => s.classList.remove('active'));

  const target = document.getElementById(`screen_${tabId}`);
  if (target) target.classList.add('active');

  const navItems = document.querySelectorAll('.admin-nav-item');
  navItems.forEach(item => {
    item.classList.toggle('active', item.getAttribute('data-tab') === tabId);
  });

  if (tabId === 'admin_home') renderAdminHomeScreen();
  else if (tabId === 'admin_appointments') renderAdminAppointmentsScreen();
  else if (tabId === 'admin_staff') renderAdminStaffScreen();
  else if (tabId === 'admin_services') renderAdminServicesScreen();
  else if (tabId === 'admin_profile') renderAdminProfileScreen();
}

// ----------------------------------------------------
// COMMON DRAWER FUNCTIONS
// ----------------------------------------------------
function openAdminDrawer(drawerId) {
  document.getElementById(drawerId + 'Overlay').classList.add('open');
  document.getElementById(drawerId).classList.add('open');
}

function closeAdminDrawer(drawerId) {
  document.getElementById(drawerId + 'Overlay').classList.remove('open');
  document.getElementById(drawerId).classList.remove('open');
}

// ----------------------------------------------------
// SCREEN 1: HOME (DASHBOARD)
// ----------------------------------------------------
function renderAdminHomeScreen() {
  const salon = AdminData.salon;
  const greetingEl = document.getElementById('adminHomeGreeting');
  if (greetingEl) greetingEl.innerText = `Hi ${salon.adminName} 👋`;

  const salonNameEl = document.getElementById('adminHomeSalonName');
  if (salonNameEl) salonNameEl.innerText = salon.name;

  // Today's stats
  const todayStr = getTodayDateStr();
  const todayAppts = AdminData.appointments.filter(a => a.date === todayStr);
  const todayCompleted = todayAppts.filter(a => a.status === 'completed');
  const todayPayments = AdminData.payments.filter(p => {
    const payDate = p.paid_at.split(' ')[0] + ' ' + p.paid_at.split(' ')[1] + ' ' + p.paid_at.split(' ')[2];
    return payDate === todayStr;
  });
  const todayRevenue = todayPayments.reduce((sum, p) => sum + p.amount, 0);

  document.getElementById('adminStatAppts').innerText = todayAppts.length;
  document.getElementById('adminStatRevenue').innerText = `₹${todayRevenue.toLocaleString()}`;

  // Staff on duty vs on leave
  const activeProviders = AdminData.serviceProviders.filter(p => p.is_active);
  const onLeaveToday = AdminData.providerLeaves.filter(l => l.date === todayStr && l.status === 'approved');
  document.getElementById('adminStatOnDuty').innerText = activeProviders.length - onLeaveToday.length;
  document.getElementById('adminStatOnLeave').innerText = onLeaveToday.length;

  // Pending leave requests (all)
  const pendingLeaves = AdminData.providerLeaves.filter(l => l.status === 'pending');
  document.getElementById('adminPendingLeaveCount').innerText = pendingLeaves.length;
  const pendingContainer = document.getElementById('adminPendingLeaveList');
  pendingContainer.innerHTML = '';
  pendingLeaves.forEach(lv => {
    const pName = getProviderName(lv.provider_id);
    const card = document.createElement('div');
    card.style.cssText = 'display:flex; align-items:center; justify-content:space-between; padding:12px; background:var(--color-warning-bg); border-radius:12px; margin-bottom:8px;';
    card.innerHTML = `
      <div>
        <div style="font-size:13px; font-weight:700; color:var(--text-heading);">${pName}</div>
        <div style="font-size:11px; color:var(--text-body);">${lv.date} • ${lv.type === 'full_day' ? 'Full Day' : lv.timeRange}</div>
        <div style="font-size:10px; color:var(--text-light);">${lv.reason}</div>
      </div>
      <div style="display:flex; gap:6px;">
        <button onclick="adminApproveLeave('${lv.id}')" style="padding:6px 12px; background:#2E7D32; color:#fff; border:none; border-radius:8px; font-size:11px; font-weight:700; cursor:pointer;">Approve</button>
        <button onclick="adminRejectLeave('${lv.id}')" style="padding:6px 12px; background:#C62828; color:#fff; border:none; border-radius:8px; font-size:11px; font-weight:700; cursor:pointer;">Reject</button>
      </div>
    `;
    pendingContainer.appendChild(card);
  });

  // Daily load per provider (grid 2 per row)
  const loadContainer = document.getElementById('adminProviderLoad');
  loadContainer.innerHTML = '';
  activeProviders.forEach(p => {
    const count = todayAppts.filter(a => a.provider_id === p.id).length;
    const card = document.createElement('div');
    card.style.cssText = 'background:var(--surface-color); border-radius:14px; padding:12px; border:1px solid var(--border-color); display:flex; align-items:center; gap:10px;';
    card.innerHTML = `
      <img src="${p.avatar}" style="width:40px; height:40px; border-radius:50%; object-fit:cover;">
      <div style="flex:1; min-width:0;">
        <div style="font-size:12px; font-weight:700; color:var(--text-heading);">${p.name}</div>
        <div style="font-size:10px; color:var(--text-light);">${p.role}</div>
      </div>
      <div style="text-align:center;">
        <div style="font-size:18px; font-weight:800; color:var(--accent-color);">${count}</div>
        <div style="font-size:9px; color:var(--text-body);">appts</div>
      </div>
    `;
    loadContainer.appendChild(card);
  });

  lucide.createIcons();
}

// ----------------------------------------------------
// LEAVE APPROVE / REJECT
// ----------------------------------------------------
function adminApproveLeave(leaveId) {
  const lv = AdminData.providerLeaves.find(l => l.id === leaveId);
  if (!lv) return;
  lv.status = 'approved';
  lv.reviewed_by = 'Admin';
  lv.reviewed_at = formatDateShort(new Date());
  triggerToast(`Leave approved for ${getProviderName(lv.provider_id)}`);
  renderAdminHomeScreen();
  if (AdminState.currentTab === 'admin_staff') renderAdminStaffScreen();
}

function adminRejectLeave(leaveId) {
  const lv = AdminData.providerLeaves.find(l => l.id === leaveId);
  if (!lv) return;
  lv.status = 'rejected';
  lv.reviewed_by = 'Admin';
  lv.reviewed_at = formatDateShort(new Date());
  triggerToast(`Leave rejected for ${getProviderName(lv.provider_id)}`);
  renderAdminHomeScreen();
  if (AdminState.currentTab === 'admin_staff') renderAdminStaffScreen();
}

// ----------------------------------------------------
// QUICK ACTIONS
// ----------------------------------------------------
function adminOpenAddProvider() {
  AdminState.editingProvider = null;
  openAdminDrawer('adminProviderFormDrawer');
  renderAdminProviderForm();
}

function adminEditProvider(providerId) {
  const p = getProvider(providerId);
  if (!p) return;
  AdminState.editingProvider = p;
  closeAdminDrawer('adminProviderProfileDrawer');
  openAdminDrawer('adminProviderFormDrawer');
  renderAdminProviderForm();
}

function adminOpenAddService() {
  AdminState.editingService = null;
  openAdminDrawer('adminServiceFormDrawer');
  renderAdminServiceForm();
}

function adminOpenMarkClosed() {
  const dateStr = prompt("Enter date to close (e.g. 30 Jul 2026):");
  if (!dateStr) return;
  AdminData.closureDates = AdminData.closureDates || [];
  if (AdminData.closureDates.includes(dateStr)) {
    triggerToast("This date is already marked closed.");
    return;
  }
  AdminData.closureDates.push(dateStr);
  triggerToast(`Salon marked closed on ${dateStr}. New bookings blocked.`);

  // Check if any appointments exist on that date
  const affected = AdminData.appointments.filter(a => a.date === dateStr);
  if (affected.length > 0) {
    triggerToast(`${affected.length} appointments exist on this date. Use "Cancel This Day" to handle them.`);
  }
  if (AdminState.currentTab === 'admin_home') renderAdminHomeScreen();
}

// ----------------------------------------------------
// SCREEN 2: APPOINTMENTS
// ----------------------------------------------------
function renderAdminAppointmentsScreen() {
  // Populate provider filter dropdown
  const providerFilter = document.getElementById('adminApptProviderFilter');
  if (providerFilter) {
    const currentVal = providerFilter.value;
    providerFilter.innerHTML = '<option value="all">All Providers</option>';
    AdminData.serviceProviders.filter(p => p.is_active).forEach(p => {
      const opt = document.createElement('option');
      opt.value = p.id;
      opt.textContent = p.name;
      providerFilter.appendChild(opt);
    });
    providerFilter.value = currentVal;
  }

  // Populate service filter dropdown
  const serviceFilter = document.getElementById('adminApptServiceFilter');
  if (serviceFilter) {
    const currentVal = serviceFilter.value;
    serviceFilter.innerHTML = '<option value="all">All Services</option>';
    AdminData.services.filter(s => s.active).forEach(s => {
      const opt = document.createElement('option');
      opt.value = s.id;
      opt.textContent = s.name;
      serviceFilter.appendChild(opt);
    });
    serviceFilter.value = currentVal;
  }

  renderAdminAppointmentList();
}

function applyAdminApptFilter() {
  const dateVal = document.getElementById('adminApptDateFilter').value;
  const customDateInput = document.getElementById('adminApptCustomDate');
  if (dateVal === 'custom') {
    customDateInput.style.display = 'block';
    if (customDateInput.value) {
      AdminState.appointmentsFilter.date = 'custom_' + customDateInput.value;
    } else {
      AdminState.appointmentsFilter.date = 'custom';
    }
  } else {
    customDateInput.style.display = 'none';
    AdminState.appointmentsFilter.date = dateVal;
  }
  AdminState.appointmentsFilter.provider = document.getElementById('adminApptProviderFilter').value;
  AdminState.appointmentsFilter.service = document.getElementById('adminApptServiceFilter').value;
  AdminState.appointmentsFilter.status = document.getElementById('adminApptStatusFilter').value;
  AdminState.appointmentsFilter.source = document.getElementById('adminApptSourceFilter').value;
  renderAdminAppointmentList();
}

function getFilterDateStr(filterDate) {
  const today = new Date();
  if (filterDate === 'today') return formatDateShort(today);
  if (filterDate === 'yesterday') {
    const d = new Date(today); d.setDate(d.getDate() - 1); return formatDateShort(d);
  }
  if (filterDate === 'tomorrow') {
    const d = new Date(today); d.setDate(d.getDate() + 1); return formatDateShort(d);
  }
  if (filterDate && filterDate.startsWith('custom_')) {
    const parts = filterDate.replace('custom_', '').split('-');
    if (parts.length === 3) return formatDateShort(new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2])));
  }
  return null;
}

function renderAdminAppointmentList() {
  const container = document.getElementById('adminApptList');
  container.innerHTML = '';

  let list = [...AdminData.appointments];

  const f = AdminState.appointmentsFilter;

  // Date filter
  if (f.date && f.date !== 'all') {
    const filterDateStr = getFilterDateStr(f.date);
    if (filterDateStr) list = list.filter(a => a.date === filterDateStr);
  }

  if (f.provider !== 'all') list = list.filter(a => a.provider_id === f.provider);
  if (f.service !== 'all') list = list.filter(a => a.service_ids.includes(f.service));
  if (f.status !== 'all') list = list.filter(a => a.status === f.status);
  if (f.source !== 'all') list = list.filter(a => a.booking_source.toLowerCase() === f.source);

  // Sort by time, completed to bottom
  list.sort((a, b) => {
    if (a.status === 'completed' && b.status !== 'completed') return 1;
    if (a.status !== 'completed' && b.status === 'completed') return -1;
    const timeA = a.time.split(' ')[0];
    const timeB = b.time.split(' ')[0];
    return timeA.localeCompare(timeB);
  });

  if (list.length === 0) {
    container.innerHTML = `
      <div class="empty-state" style="padding:40px 20px;">
        <div class="empty-state-icon"><i data-lucide="calendar-x"></i></div>
        <h4>No appointments found</h4>
        <p>Try adjusting your filters.</p>
      </div>
    `;
    lucide.createIcons();
    return;
  }

  list.forEach(appt => {
    const pName = getProviderName(appt.provider_id);
    const svcNames = appt.service_ids.map(id => getServiceName(id)).join(', ');
    const sc = getStatusColor(appt.status);
    const card = document.createElement('div');
    card.style.cssText = 'background:var(--surface-color); border-radius:14px; padding:14px; margin-bottom:10px; border:1px solid var(--border-color); box-shadow:var(--shadow-card);';
    card.innerHTML = `
      <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:8px;">
        <div style="display:flex; align-items:center; gap:8px; cursor:pointer;" onclick="event.stopPropagation(); openAdminCustomerInfo('${appt.id}')">
          <div style="width:32px; height:32px; border-radius:50%; background:var(--accent-soft); display:flex; align-items:center; justify-content:center; font-size:13px; font-weight:700; color:var(--accent-color);">
            ${appt.customer_name.charAt(0).toUpperCase()}
          </div>
          <div>
            <div style="font-size:14px; font-weight:700; color:var(--text-heading);">${appt.customer_name}</div>
            <div style="font-size:10px; color:var(--text-light);">${appt.customer_phone}</div>
          </div>
        </div>
        ${getStatusBadge(appt.status)}
      </div>
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:6px; font-size:12px; color:var(--text-body); margin-bottom:8px; cursor:pointer;" onclick="openAdminAppointmentDetail(appt.id)">
        <div><span style="color:var(--text-light);">Provider:</span> <strong style="color:var(--text-heading);">${pName}</strong></div>
        <div><span style="color:var(--text-light);">Time:</span> <strong style="color:var(--text-heading);">${appt.time} (${appt.duration}m)</strong></div>
        <div style="grid-column:1/-1;"><span style="color:var(--text-light);">Service:</span> <strong style="color:var(--text-heading);">${svcNames}</strong></div>
      </div>
      <div style="display:flex; align-items:center; justify-content:space-between; border-top:1px dashed var(--border-color); padding-top:8px;">
        <span style="font-size:11px; color:var(--text-light);"><i data-lucide="${appt.type === 'online' ? 'wifi' : 'store'}" style="width:12px; height:12px; display:inline;"></i> ${appt.booking_source}</span>
        <span style="font-size:13px; font-weight:700; color:var(--accent-color);">₹${appt.total_amount}</span>
      </div>
    `;
    container.appendChild(card);
  });

  lucide.createIcons();
}

// ----------------------------------------------------
// APPOINTMENT DETAIL (READ-ONLY)
// ----------------------------------------------------
function openAdminAppointmentDetail(apptId) {
  const appt = AdminData.appointments.find(a => a.id === apptId);
  if (!appt) return;
  AdminState.selectedAppointmentId = apptId;

  const pName = getProviderName(appt.provider_id);
  const svcNames = appt.service_ids.map(id => getServiceName(id)).join(', ');
  const sc = getStatusColor(appt.status);

  const content = document.getElementById('adminApptDetailContent');
  content.innerHTML = `
    <div style="padding:20px;">
      <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:14px;">
        <h3 style="font-size:18px; font-weight:800; color:var(--text-heading); margin:0;">Appointment Details</h3>
      </div>
      <div style="display:flex; align-items:center; gap:8px; margin-bottom:16px;">
        ${getStatusBadge(appt.status)}
        <span style="font-size:11px; padding:4px 10px; border-radius:12px; background:${appt.type === 'online' ? 'var(--color-info-bg)' : 'var(--color-warning-bg)'}; color:${appt.type === 'online' ? '#1565C0' : '#EF6C00'}; font-weight:600; text-transform:capitalize;">${appt.type === 'online' ? 'Online Booking' : 'Walk-in'}</span>
      </div>
      <div style="padding:16px; background:var(--surface-color); border-radius:14px; border:1px solid var(--border-color);">
        <div style="font-size:16px; font-weight:700; color:var(--text-heading); margin-bottom:4px;">${appt.customer_name}</div>
        <div style="font-size:12px; color:var(--text-body); margin-bottom:8px;">${appt.customer_phone}</div>
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
          <div><span style="font-size:11px; color:var(--text-light);">Date</span><div style="font-size:13px; font-weight:600; color:var(--text-heading);">${appt.date}</div></div>
          <div><span style="font-size:11px; color:var(--text-light);">Time</span><div style="font-size:13px; font-weight:600; color:var(--text-heading);">${appt.time}</div></div>
          <div><span style="font-size:11px; color:var(--text-light);">Provider</span><div style="font-size:13px; font-weight:600; color:var(--text-heading);">${pName}</div></div>
          <div><span style="font-size:11px; color:var(--text-light);">Source</span><div style="font-size:13px; font-weight:600; color:var(--text-heading);">${appt.booking_source}</div></div>
        </div>
      </div>
      <div style="margin-top:12px; padding:12px; background:var(--accent-soft); border-radius:12px;">
        <div style="font-size:11px; color:var(--text-light); text-transform:uppercase; margin-bottom:4px;">Services</div>
        <div style="font-size:13px; font-weight:600; color:var(--text-heading);">${svcNames}</div>
      </div>
      <div style="margin-top:12px; padding:14px; background:var(--surface-color); border-radius:12px; border:1px solid var(--border-color);">
        <div style="display:flex; justify-content:space-between; margin-bottom:6px;">
          <span style="font-size:13px; color:var(--text-body);">Total Amount</span>
          <span style="font-size:13px; font-weight:700; color:var(--text-heading);">₹${appt.total_amount}</span>
        </div>
        <div style="display:flex; justify-content:space-between; margin-bottom:6px;">
          <span style="font-size:13px; color:var(--text-body);">Advance Paid</span>
          <span style="font-size:13px; font-weight:700; color:#2E7D32;">₹${appt.advance_paid}</span>
        </div>
        <div style="display:flex; justify-content:space-between; border-top:1px dashed var(--border-color); padding-top:6px;">
          <span style="font-size:13px; font-weight:700; color:var(--text-heading);">Balance Due</span>
          <span style="font-size:13px; font-weight:700; color:${appt.balance_due > 0 ? '#C62828' : '#2E7D32'};">₹${appt.balance_due}</span>
        </div>
      </div>
      <div style="margin-top:16px; padding:12px; background:var(--color-info-bg); border-radius:12px; font-size:12px; color:var(--text-body); text-align:center;">
        <i data-lucide="info" style="width:14px; height:14px; display:inline; vertical-align:middle; margin-right:4px;"></i>
        Appointment status changes are handled by the Service Provider.
      </div>
    </div>
  `;
  openAdminDrawer('adminApptDetailDrawer');
  lucide.createIcons();
}

// ----------------------------------------------------
// CUSTOMER INFO POPUP
// ----------------------------------------------------
function openAdminCustomerInfo(apptId) {
  const appt = AdminData.appointments.find(a => a.id === apptId);
  if (!appt) return;

  // Compute customer stats
  const allCustomerAppts = AdminData.appointments.filter(a => a.customer_phone === appt.customer_phone);
  const totalAppts = allCustomerAppts.length;
  const totalSpent = allCustomerAppts.reduce((s, a) => s + a.total_amount, 0);
  const completedAppts = allCustomerAppts.filter(a => a.status === 'completed').length;

  const content = document.getElementById('adminCustomerInfoContent');
  content.innerHTML = `
    <div style="padding:20px;">
      <div style="text-align:center; margin-bottom:16px;">
        <div style="width:64px; height:64px; border-radius:50%; background:var(--accent-soft); display:flex; align-items:center; justify-content:center; margin:0 auto 10px; font-size:28px; font-weight:800; color:var(--accent-color);">
          ${appt.customer_name.charAt(0).toUpperCase()}
        </div>
        <div style="font-size:18px; font-weight:800; color:var(--text-heading);">${appt.customer_name}</div>
        <div style="font-size:12px; color:var(--text-body);">${appt.customer_phone}</div>
        <div style="margin-top:4px; font-size:11px; color:var(--text-body);">
          ${appt.customer_gender === 'Female' ? '<i data-lucide="venus" style="width:12px; height:12px; display:inline; color:#C2185B;"></i> Female' : '<i data-lucide="mars" style="width:12px; height:12px; display:inline; color:#1565C0;"></i> Male'}
        </div>
      </div>
      <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:8px; margin-bottom:14px;">
        <div style="background:var(--surface-color); border-radius:12px; padding:10px; text-align:center; border:1px solid var(--border-color);">
          <div style="font-size:18px; font-weight:800; color:var(--accent-color);">${totalAppts}</div>
          <div style="font-size:10px; color:var(--text-light);">Total Appts</div>
        </div>
        <div style="background:var(--surface-color); border-radius:12px; padding:10px; text-align:center; border:1px solid var(--border-color);">
          <div style="font-size:18px; font-weight:800; color:#2E7D32;">${completedAppts}</div>
          <div style="font-size:10px; color:var(--text-light);">Completed</div>
        </div>
        <div style="background:var(--surface-color); border-radius:12px; padding:10px; text-align:center; border:1px solid var(--border-color);">
          <div style="font-size:18px; font-weight:800; color:var(--text-heading);">₹${totalSpent.toLocaleString()}</div>
          <div style="font-size:10px; color:var(--text-light);">Total Spent</div>
        </div>
      </div>
      <div style="padding:12px; background:var(--surface-color); border-radius:12px; border:1px solid var(--border-color);">
        <div style="font-size:11px; color:var(--text-light); text-transform:uppercase; margin-bottom:8px;">Recent Appointments</div>
        ${allCustomerAppts.slice(0, 3).map(a => {
          const pName = getProviderName(a.provider_id);
          return `<div style="display:flex; justify-content:space-between; padding:6px 0; border-bottom:1px solid var(--border-color); font-size:12px;">
            <span style="color:var(--text-heading);">${a.date} • ${a.time}</span>
            <span style="color:var(--text-body);">${pName}</span>
          </div>`;
        }).join('')}
      </div>
    </div>
  `;
  openAdminDrawer('adminCustomerInfoDrawer');
  lucide.createIcons();
}

// ----------------------------------------------------
// CANCEL THIS DAY
// ----------------------------------------------------
function adminCancelThisDay() {
  const dateStr = prompt("Enter date to cancel all appointments (e.g. 30 Jul 2026):");
  if (!dateStr) return;

  const affected = AdminData.appointments.filter(a => a.date === dateStr && a.status !== 'completed' && a.status !== 'no_show' && a.status !== 'cancelled');
  if (affected.length === 0) {
    triggerToast("No active appointments found on that date.");
    return;
  }

  if (!confirm(`Cancel all ${affected.length} appointment(s) on ${dateStr}? Advance will be carried forward, NOT forfeited.`)) return;

  affected.forEach(appt => {
    appt.status = 'cancelled';
    const rescheduleReq = {
      id: `resched_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      appointment_id: appt.id,
      initiated_by: 'admin',
      customer_name: appt.customer_name,
      date: dateStr,
      created_at: formatDateShort(new Date())
    };
    AdminData.rescheduleRequests = AdminData.rescheduleRequests || [];
    AdminData.rescheduleRequests.push(rescheduleReq);
  });

  triggerToast(`${affected.length} appointments cancelled on ${dateStr}. Advances carried forward.`);
  triggerToast(`Reschedule notifications sent to ${affected.length} customer(s).`);
  renderAdminAppointmentList();
}

// ----------------------------------------------------
// SCREEN 3: STAFF
// ----------------------------------------------------
function renderAdminStaffScreen() {
  const segment = AdminState.staffSegment;
  document.getElementById('adminStaffAllBtn').classList.toggle('active', segment === 'all');
  document.getElementById('adminStaffLeavesBtn').classList.toggle('active', segment === 'leaves');
  document.getElementById('adminStaffAllView').style.display = segment === 'all' ? 'block' : 'none';
  document.getElementById('adminStaffLeavesView').style.display = segment === 'leaves' ? 'block' : 'none';

  if (segment === 'all') renderAdminStaffAll();
  else renderAdminStaffLeaves();
}

function adminSetStaffSegment(seg) {
  AdminState.staffSegment = seg;
  renderAdminStaffScreen();
}

function renderAdminStaffAll() {
  const container = document.getElementById('adminStaffList');
  container.innerHTML = '';

  AdminData.serviceProviders.forEach(p => {
    const specs = p.specialization_ids.map(catId => {
      const cat = AdminData.serviceCategories.find(c => c.id === catId);
      return cat ? cat.name : catId;
    }).join(', ');

    const sc = p.is_active ? getStatusColor('active') : getStatusColor('suspended');
    const statusLabel = p.is_active ? 'Active' : 'Inactive';

    const card = document.createElement('div');
    card.style.cssText = 'display:flex; align-items:center; gap:12px; padding:14px; background:var(--surface-color); border-radius:14px; margin-bottom:10px; border:1px solid var(--border-color); box-shadow:var(--shadow-card); cursor:pointer;';
    card.onclick = () => openAdminProviderProfile(p.id);
    card.innerHTML = `
      <img src="${p.avatar}" style="width:48px; height:48px; border-radius:50%; object-fit:cover;">
      <div style="flex:1; min-width:0;">
        <div style="display:flex; align-items:center; gap:6px;">
          <span style="font-size:14px; font-weight:700; color:var(--text-heading);">${p.name}</span>
          <span style="background:${sc.bg}; color:${sc.color}; padding:2px 8px; border-radius:8px; font-size:9px; font-weight:700;">${statusLabel}</span>
        </div>
        <div style="font-size:11px; color:var(--text-body); margin-top:2px;">${p.role}</div>
        <div style="display:flex; flex-wrap:wrap; gap:4px; margin-top:4px;">
          ${p.specialization_ids.map(catId => `<span style="background:var(--accent-soft); color:var(--accent-color); padding:2px 8px; border-radius:8px; font-size:9px; font-weight:600;">${getCategoryName(catId)}</span>`).join('')}
        </div>
      </div>
      <i data-lucide="chevron-right" style="width:16px; height:16px; color:var(--text-light);"></i>
    `;
    container.appendChild(card);
  });

  lucide.createIcons();
}

function renderAdminStaffLeaves() {
  const container = document.getElementById('adminLeaveList');
  container.innerHTML = '';

  const allLeaves = [...AdminData.providerLeaves].sort((a, b) => {
    const order = { pending: 0, approved: 1, rejected: 2 };
    return order[a.status] - order[b.status];
  });

  if (allLeaves.length === 0) {
    container.innerHTML = '<div style="text-align:center; padding:40px; color:var(--text-light);">No leave requests found.</div>';
    return;
  }

  // Mini leave calendar
  const calContainer = document.getElementById('adminLeaveCalendar');
  calContainer.innerHTML = '';
  const leaveDates = allLeaves.map(l => ({ date: parseDateStr(l.date), status: l.status, provider: l.provider_id }));
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const today = new Date();
  const calHtml = `<div style="font-size:12px; font-weight:700; color:var(--text-heading); margin-bottom:8px;">Leave Calendar — ${months[today.getMonth()]} ${today.getFullYear()}</div>
    <div style="display:grid; grid-template-columns:repeat(7,1fr); gap:2px; font-size:10px; text-align:center;">
      <span style="color:var(--text-light);">Mo</span><span style="color:var(--text-light);">Tu</span><span style="color:var(--text-light);">We</span><span style="color:var(--text-light);">Th</span><span style="color:var(--text-light);">Fr</span><span style="color:var(--text-light);">Sa</span><span style="color:var(--text-light);">Su</span>
    </div>`;
  calContainer.innerHTML = calHtml;

  allLeaves.forEach(lv => {
    const pName = getProviderName(lv.provider_id);
    const sc = getStatusColor(lv.status);
    const card = document.createElement('div');
    card.style.cssText = 'display:flex; align-items:center; gap:10px; padding:12px; background:var(--surface-color); border-radius:12px; margin-bottom:8px; border:1px solid var(--border-color);';
    card.innerHTML = `
      <div style="width:40px; height:40px; border-radius:50%; background:${sc.bg}; display:flex; align-items:center; justify-content:center;">
        <i data-lucide="user" style="width:18px; height:18px; color:${sc.color};"></i>
      </div>
      <div style="flex:1;">
        <div style="font-size:13px; font-weight:700; color:var(--text-heading);">${pName}</div>
        <div style="font-size:11px; color:var(--text-body);">${lv.date} • ${lv.type === 'full_day' ? 'Full Day' : lv.timeRange}</div>
        <div style="font-size:10px; color:var(--text-light);">${lv.reason}</div>
      </div>
      <div style="text-align:right;">
        ${getStatusBadge(lv.status)}
        ${lv.status === 'pending' ? `
        <div style="display:flex; gap:4px; margin-top:6px;">
          <button onclick="adminApproveLeave('${lv.id}')" style="padding:4px 10px; background:#2E7D32; color:#fff; border:none; border-radius:6px; font-size:10px; font-weight:700; cursor:pointer;">✓</button>
          <button onclick="adminRejectLeave('${lv.id}')" style="padding:4px 10px; background:#C62828; color:#fff; border:none; border-radius:6px; font-size:10px; font-weight:700; cursor:pointer;">✗</button>
        </div>` : ''}
      </div>
    `;
    container.appendChild(card);
  });

  lucide.createIcons();
}

// ----------------------------------------------------
// PROVIDER PROFILE (READ-ONLY + DEACTIVATE)
// ----------------------------------------------------
function openAdminProviderProfile(providerId) {
  const p = getProvider(providerId);
  if (!p) return;
  AdminState.selectedProviderId = providerId;

  const content = document.getElementById('adminProviderProfileContent');
  const specs = p.specialization_ids.map(catId => getCategoryName(catId)).join(', ');
  const dayLabels = { mon: 'Mon', tue: 'Tue', wed: 'Wed', thu: 'Thu', fri: 'Fri', sat: 'Sat', sun: 'Sun' };
  let hoursHtml = '';
  Object.keys(p.workingHours).forEach(day => {
    const h = p.workingHours[day];
    const label = dayLabels[day];
    if (h.off) {
      hoursHtml += `<div style="display:flex; justify-content:space-between; padding:6px 0; border-bottom:1px solid var(--border-color);">
        <span style="font-size:12px; font-weight:600;">${label}</span>
        <span style="font-size:11px; color:#C62828; font-weight:600;">Off</span>
      </div>`;
    } else {
      hoursHtml += `<div style="display:flex; justify-content:space-between; padding:6px 0; border-bottom:1px solid var(--border-color);">
        <span style="font-size:12px; font-weight:600;">${label}</span>
        <span style="font-size:11px; color:var(--text-body);">${h.start} - ${h.end}</span>
      </div>`;
    }
  });

  content.innerHTML = `
    <div style="padding:20px;">
      <div style="text-align:center; margin-bottom:16px;">
        <img src="${p.avatar}" style="width:72px; height:72px; border-radius:50%; object-fit:cover; border:3px solid var(--accent-color);">
        <div style="font-size:18px; font-weight:800; color:var(--text-heading); margin-top:8px;">${p.name}</div>
        <div style="font-size:12px; color:var(--text-body);">${p.role}</div>
        <div style="margin-top:6px;">${p.is_active ? getStatusBadge('active') : getStatusBadge('suspended')}</div>
      </div>
      <div style="padding:14px; background:var(--surface-color); border-radius:12px; border:1px solid var(--border-color); margin-bottom:12px;">
        <div style="font-size:11px; color:var(--text-light); text-transform:uppercase; margin-bottom:6px;">Contact</div>
        <div style="font-size:13px; font-weight:600; color:var(--text-heading);">${p.phone}</div>
        <div style="font-size:12px; color:var(--text-body);">${p.email}</div>
      </div>
      <div style="padding:14px; background:var(--surface-color); border-radius:12px; border:1px solid var(--border-color); margin-bottom:12px;">
        <div style="font-size:11px; color:var(--text-light); text-transform:uppercase; margin-bottom:6px;">Specializations</div>
        <div style="display:flex; flex-wrap:wrap; gap:6px;">
          ${p.specialization_ids.map(catId => `<span style="background:var(--accent-soft); color:var(--accent-color); padding:4px 12px; border-radius:12px; font-size:11px; font-weight:600;">${getCategoryName(catId)}</span>`).join('')}
        </div>
      </div>
      <div style="padding:14px; background:var(--surface-color); border-radius:12px; border:1px solid var(--border-color); margin-bottom:12px;">
        <div style="font-size:11px; color:var(--text-light); text-transform:uppercase; margin-bottom:6px;">Working Hours</div>
        ${hoursHtml}
      </div>
      <div style="display:flex; gap:8px;">
        <button onclick="adminEditProvider('${p.id}')" style="flex:1; padding:12px; background:var(--accent-color); color:#fff; border:none; border-radius:12px; font-size:13px; font-weight:700; cursor:pointer;">
          <i data-lucide="edit" style="width:14px; height:14px; display:inline; vertical-align:middle; margin-right:4px;"></i> Edit Profile
        </button>
        ${p.is_active ? `
        <button onclick="adminDeactivateProvider('${p.id}')" style="padding:12px; background:var(--color-danger-bg); color:#C62828; border:none; border-radius:12px; font-size:13px; font-weight:700; cursor:pointer;">
          Deactivate
        </button>` : `
        <button onclick="adminActivateProvider('${p.id}')" style="padding:12px; background:var(--color-success-bg); color:#2E7D32; border:none; border-radius:12px; font-size:13px; font-weight:700; cursor:pointer;">
          Activate
        </button>`}
      </div>
    </div>
  `;
  openAdminDrawer('adminProviderProfileDrawer');
  lucide.createIcons();
}

function adminDeactivateProvider(providerId) {
  if (!confirm("Deactivate this provider? They will be removed from customer-facing selection.")) return;
  const p = getProvider(providerId);
  if (p) {
    p.is_active = false;
    triggerToast(`${p.name} deactivated.`);
    closeAdminDrawer('adminProviderProfileDrawer');
    renderAdminStaffScreen();
    if (AdminState.currentTab === 'admin_home') renderAdminHomeScreen();
  }
}

function adminActivateProvider(providerId) {
  const p = getProvider(providerId);
  if (p) {
    p.is_active = true;
    triggerToast(`${p.name} activated.`);
    closeAdminDrawer('adminProviderProfileDrawer');
    renderAdminStaffScreen();
    if (AdminState.currentTab === 'admin_home') renderAdminHomeScreen();
  }
}

// ----------------------------------------------------
// ADD / EDIT PROVIDER FORM
// ----------------------------------------------------
function renderAdminProviderForm() {
  const p = AdminState.editingProvider;
  const isEdit = !!p;

  // Initialize selected specs
  _selectedSpecs.clear();
  if (isEdit && p.specialization_ids) {
    p.specialization_ids.forEach(id => _selectedSpecs.add(id));
  }

  const form = document.getElementById('adminProviderFormContent');
  form.innerHTML = `
    <div style="padding:20px;">
      <h3 style="font-size:18px; font-weight:800; margin-bottom:16px;">${isEdit ? 'Edit' : 'Add'} Service Provider</h3>
      <div style="margin-bottom:12px;">
        <label style="font-size:12px; font-weight:700; color:var(--text-body); display:block; margin-bottom:4px;">Full Name</label>
        <input type="text" id="admProviderName" value="${isEdit ? p.name : ''}" style="width:100%; padding:12px; border:1.5px solid var(--border-color); border-radius:10px; font-size:14px;">
      </div>
      <div style="margin-bottom:12px;">
        <label style="font-size:12px; font-weight:700; color:var(--text-body); display:block; margin-bottom:4px;">Phone</label>
        <input type="text" id="admProviderPhone" value="${isEdit ? p.phone : ''}" style="width:100%; padding:12px; border:1.5px solid var(--border-color); border-radius:10px; font-size:14px;">
      </div>
      <div style="margin-bottom:12px;">
        <label style="font-size:12px; font-weight:700; color:var(--text-body); display:block; margin-bottom:4px;">Email</label>
        <input type="email" id="admProviderEmail" value="${isEdit ? p.email : ''}" style="width:100%; padding:12px; border:1.5px solid var(--border-color); border-radius:10px; font-size:14px;">
      </div>
      <div style="margin-bottom:12px;">
        <label style="font-size:12px; font-weight:700; color:var(--text-body); display:block; margin-bottom:4px;">Role/Title</label>
        <input type="text" id="admProviderRole" value="${isEdit ? p.role : ''}" placeholder="e.g. Hair Stylist" style="width:100%; padding:12px; border:1.5px solid var(--border-color); border-radius:10px; font-size:14px;">
      </div>
      <div style="margin-bottom:12px;">
        <label style="font-size:12px; font-weight:700; color:var(--text-body); display:block; margin-bottom:4px;">Specializations</label>
        <div style="display:flex; flex-wrap:wrap; gap:6px;" id="admProviderSpecs">
          ${AdminData.serviceCategories.map(cat => {
            const selected = _selectedSpecs.has(cat.id);
            return `<button onclick="toggleSpec(this, '${cat.id}')" style="padding:6px 12px; border-radius:12px; font-size:11px; font-weight:600; cursor:pointer; background:${selected ? 'var(--accent-color)' : 'var(--accent-soft)'}; color:${selected ? '#fff' : 'var(--accent-color)'}; border:1px solid var(--accent-color);">${cat.name}</button>`;
          }).join('')}
        </div>
      </div>
      <div style="margin-bottom:12px;">
        <label style="font-size:12px; font-weight:700; color:var(--text-body); display:block; margin-bottom:4px;">Weekly Off</label>
        <select id="admProviderWeeklyOff" style="width:100%; padding:12px; border:1.5px solid var(--border-color); border-radius:10px; font-size:14px; background:var(--surface-color); color:var(--text-heading);">
          ${['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'None'].map(d =>
            `<option value="${d}" ${isEdit && p.weekly_off === d ? 'selected' : ''}>${d}</option>`
          ).join('')}
        </select>
      </div>
      <button onclick="saveAdminProvider()" style="width:100%; padding:14px; background:var(--text-heading); color:var(--surface-color); border:none; border-radius:12px; font-size:14px; font-weight:700; cursor:pointer;">
        ${isEdit ? 'Save Changes' : 'Add Provider'}
      </button>
    </div>
  `;
  lucide.createIcons();
}

const _selectedSpecs = new Set();
function toggleSpec(btn, catId) {
  if (_selectedSpecs.has(catId)) {
    _selectedSpecs.delete(catId);
    btn.style.background = 'var(--accent-soft)';
    btn.style.color = 'var(--accent-color)';
  } else {
    _selectedSpecs.add(catId);
    btn.style.background = 'var(--accent-color)';
    btn.style.color = '#fff';
  }
}

function saveAdminProvider() {
  const name = document.getElementById('admProviderName')?.value.trim();
  const phone = document.getElementById('admProviderPhone')?.value.trim();
  const email = document.getElementById('admProviderEmail')?.value.trim();
  const role = document.getElementById('admProviderRole')?.value.trim();
  const weeklyOff = document.getElementById('admProviderWeeklyOff')?.value || 'Sunday';

  if (!name || !phone) { triggerToast("Name and phone are required."); return; }

  const specs = Array.from(_selectedSpecs);
  if (specs.length === 0) { triggerToast("Select at least one specialization."); return; }

  if (AdminState.editingProvider) {
    const p = AdminState.editingProvider;
    p.name = name;
    p.phone = phone;
    p.email = email || p.email;
    p.role = role || p.role;
    p.specialization_ids = specs;
    p.weekly_off = weeklyOff;
    triggerToast(`${name} updated.`);
  } else {
    const newProvider = {
      id: `st_${Date.now()}`,
      name: name,
      phone: phone,
      email: email || '',
      role: role || 'Service Provider',
      rating: 0, reviews: 0, is_active: true,
      avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=150&q=80',
      specialization_ids: specs,
      workingHours: {
        mon: { start: "09:00 AM", end: "07:00 PM", break: "01:00 PM - 02:00 PM" },
        tue: { start: "09:00 AM", end: "07:00 PM", break: "01:00 PM - 02:00 PM" },
        wed: { start: "09:00 AM", end: "07:00 PM", break: "01:00 PM - 02:00 PM" },
        thu: { start: "09:00 AM", end: "07:00 PM", break: "01:00 PM - 02:00 PM" },
        fri: { start: "09:00 AM", end: "07:00 PM", break: "01:00 PM - 02:00 PM" },
        sat: { start: "10:00 AM", end: "05:00 PM", break: "01:00 PM - 01:30 PM" },
        sun: weeklyOff !== 'None' ? { off: true } : { start: "09:00 AM", end: "07:00 PM", break: "01:00 PM - 02:00 PM" }
      },
      weekly_off: weeklyOff
    };
    AdminData.serviceProviders.push(newProvider);
    triggerToast(`${name} added as provider! They can now login.`);
  }

  closeAdminDrawer('adminProviderFormDrawer');
  renderAdminStaffScreen();
  if (AdminState.currentTab === 'admin_home') renderAdminHomeScreen();
}

// ----------------------------------------------------
// SCREEN 4: SERVICES
// ----------------------------------------------------
function renderAdminServicesScreen() {
  const segment = AdminState.servicesSegment;
  document.getElementById('adminSvcServicesBtn').classList.toggle('active', segment === 'services');
  document.getElementById('adminSvcCombosBtn').classList.toggle('active', segment === 'combos');
  document.getElementById('adminServicesView').style.display = segment === 'services' ? 'block' : 'none';
  document.getElementById('adminCombosView').style.display = segment === 'combos' ? 'block' : 'none';

  if (segment === 'services') renderAdminServicesList();
  else renderAdminCombosList();
}

function adminSetServicesSegment(seg) {
  AdminState.servicesSegment = seg;
  renderAdminServicesScreen();
}

function renderAdminServicesList() {
  const container = document.getElementById('adminServicesList');
  container.innerHTML = '';

  AdminData.services.forEach(s => {
    const pNames = s.provider_ids.map(id => getProviderName(id)).join(', ');
    const card = document.createElement('div');
    card.style.cssText = 'background:var(--surface-color); border-radius:14px; padding:14px; margin-bottom:10px; border:1px solid var(--border-color); box-shadow:var(--shadow-card); cursor:pointer;';
    card.onclick = () => openAdminServiceDetail(s.id);
    card.innerHTML = `
      <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:8px;">
        <div style="font-size:14px; font-weight:700; color:var(--text-heading);">${s.name}</div>
        ${s.active ? getStatusBadge('active') : getStatusBadge('suspended')}
      </div>
      <div style="display:flex; align-items:center; gap:12px; font-size:12px; color:var(--text-body);">
        <span style="background:var(--accent-soft); color:var(--accent-color); padding:2px 8px; border-radius:6px; font-size:10px; font-weight:600;">${getCategoryName(s.category)}</span>
        <span>₹${s.price}</span>
        <span>${s.duration_minutes} min</span>
        <span>Adv: ${s.min_advance_percentage}%</span>
      </div>
      <div style="font-size:10px; color:var(--text-light); margin-top:4px;">Providers: ${pNames || 'None'}</div>
    `;
    container.appendChild(card);
  });
}

function openAdminServiceDetail(serviceId) {
  const s = getService(serviceId);
  if (!s) return;
  AdminState.selectedServiceId = serviceId;

  const content = document.getElementById('adminServiceDetailContent');
  const allProviders = AdminData.serviceProviders.filter(p => p.is_active);
  const mappedProviders = allProviders.map(p => `
    <label style="display:flex; align-items:center; gap:8px; padding:6px 0; cursor:pointer;">
      <input type="checkbox" ${s.provider_ids.includes(p.id) ? 'checked' : ''} onchange="adminToggleProviderMapping('${s.id}', '${p.id}', this.checked)" style="accent-color:#9C54F2;">
      <span style="font-size:13px; color:var(--text-heading);">${p.name}</span>
    </label>
  `).join('');

  content.innerHTML = `
    <div style="padding:20px;">
      <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:14px;">
        <h3 style="font-size:18px; font-weight:800; color:var(--text-heading); margin:0;">${s.name}</h3>
        ${s.active ? getStatusBadge('active') : getStatusBadge('suspended')}
      </div>
      <div style="padding:14px; background:var(--surface-color); border-radius:12px; border:1px solid var(--border-color); margin-bottom:12px;">
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
          <div><span style="font-size:11px; color:var(--text-light);">Price</span><div style="font-size:16px; font-weight:800; color:var(--accent-color);">₹${s.price}</div></div>
          <div><span style="font-size:11px; color:var(--text-light);">Duration</span><div style="font-size:14px; font-weight:600; color:var(--text-heading);">${s.duration_minutes} mins</div></div>
          <div><span style="font-size:11px; color:var(--text-light);">Category</span><div style="font-size:13px; font-weight:600; color:var(--text-heading);">${getCategoryName(s.category)}</div></div>
          <div><span style="font-size:11px; color:var(--text-light);">Min Advance</span><div style="font-size:13px; font-weight:600; color:var(--text-heading);">${s.min_advance_percentage}%</div></div>
          <div style="grid-column:1/-1;"><span style="font-size:11px; color:var(--text-light);">Refund on Cancel</span><div style="font-size:13px; font-weight:600; color:var(--text-heading);">${s.will_refund_advance ? 'Yes, refundable' : 'Non-refundable'}</div></div>
        </div>
      </div>
      <div style="padding:14px; background:var(--surface-color); border-radius:12px; border:1px solid var(--border-color); margin-bottom:12px;">
        <div style="font-size:11px; color:var(--text-light); text-transform:uppercase; margin-bottom:8px;">Provider Mapping</div>
        ${mappedProviders}
      </div>
      <div style="display:flex; gap:8px;">
        <button onclick="adminEditService('${s.id}')" style="flex:1; padding:12px; background:var(--accent-color); color:#fff; border:none; border-radius:12px; font-size:13px; font-weight:700; cursor:pointer;">Edit Service</button>
        <button onclick="adminToggleServiceActive('${s.id}')" style="flex:1; padding:12px; background:${s.active ? 'var(--color-danger-bg)' : 'var(--color-success-bg)'}; color:${s.active ? '#C62828' : '#2E7D32'}; border:none; border-radius:12px; font-size:13px; font-weight:700; cursor:pointer;">
          ${s.active ? 'Deactivate' : 'Activate'}
        </button>
      </div>
    </div>
  `;
  openAdminDrawer('adminServiceDetailDrawer');
  lucide.createIcons();
}

function adminToggleProviderMapping(serviceId, providerId, checked) {
  const s = getService(serviceId);
  if (!s) return;
  if (checked) {
    if (!s.provider_ids.includes(providerId)) s.provider_ids.push(providerId);
  } else {
    s.provider_ids = s.provider_ids.filter(id => id !== providerId);
  }
  triggerToast(`Provider mapping updated for ${s.name}`);
}

function adminToggleServiceActive(serviceId) {
  const s = getService(serviceId);
  if (!s) return;
  s.active = !s.active;
  triggerToast(`${s.name} ${s.active ? 'activated' : 'deactivated'}.`);
  closeAdminDrawer('adminServiceDetailDrawer');
  renderAdminServicesScreen();
}

function adminEditService(serviceId) {
  const s = getService(serviceId);
  if (!s) return;
  AdminState.editingService = s;
  closeAdminDrawer('adminServiceDetailDrawer');
  openAdminDrawer('adminServiceFormDrawer');
  renderAdminServiceForm();
}

function renderAdminServiceForm() {
  const s = AdminState.editingService;
  const isEdit = !!s;
  const form = document.getElementById('adminServiceFormContent');
  const cats = AdminData.serviceCategories.map(c =>
    `<option value="${c.id}" ${isEdit && s.category === c.id ? 'selected' : ''}>${c.name}</option>`
  ).join('');

  form.innerHTML = `
    <div style="padding:20px;">
      <h3 style="font-size:18px; font-weight:800; margin-bottom:16px;">${isEdit ? 'Edit' : 'Add'} Service</h3>
      <div style="margin-bottom:12px;">
        <label style="font-size:12px; font-weight:700; color:var(--text-body); display:block; margin-bottom:4px;">Name</label>
        <input type="text" id="admSvcName" value="${isEdit ? s.name : ''}" style="width:100%; padding:12px; border:1.5px solid var(--border-color); border-radius:10px; font-size:14px;">
      </div>
      <div style="margin-bottom:12px;">
        <label style="font-size:12px; font-weight:700; color:var(--text-body); display:block; margin-bottom:4px;">Description</label>
        <textarea id="admSvcDesc" rows="2" style="width:100%; padding:12px; border:1.5px solid var(--border-color); border-radius:10px; font-size:14px; resize:none;">${isEdit ? '' : ''}</textarea>
      </div>
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
        <div style="margin-bottom:12px;">
          <label style="font-size:12px; font-weight:700; color:var(--text-body); display:block; margin-bottom:4px;">Price (₹)</label>
          <input type="number" id="admSvcPrice" value="${isEdit ? s.price : ''}" style="width:100%; padding:12px; border:1.5px solid var(--border-color); border-radius:10px; font-size:14px;">
        </div>
        <div style="margin-bottom:12px;">
          <label style="font-size:12px; font-weight:700; color:var(--text-body); display:block; margin-bottom:4px;">Duration (min)</label>
          <div style="display:flex; align-items:center; gap:6px;">
            <button onclick="adjustDuration(-30)" style="padding:8px 12px; border:1px solid var(--border-color); border-radius:8px; background:var(--surface-color); cursor:pointer;">−</button>
            <span id="admSvcDuration" style="font-size:16px; font-weight:700; min-width:40px; text-align:center;">${isEdit ? s.duration_minutes : 30}</span>
            <button onclick="adjustDuration(30)" style="padding:8px 12px; border:1px solid var(--border-color); border-radius:8px; background:var(--surface-color); cursor:pointer;">+</button>
          </div>
        </div>
      </div>
      <div style="margin-bottom:12px;">
        <label style="font-size:12px; font-weight:700; color:var(--text-body); display:block; margin-bottom:4px;">Min Advance %</label>
        <input type="number" id="admSvcAdvPct" value="${isEdit ? s.min_advance_percentage : 20}" min="0" max="100" style="width:100%; padding:12px; border:1.5px solid var(--border-color); border-radius:10px; font-size:14px;">
      </div>
      <div style="margin-bottom:12px;">
        <label style="font-size:12px; font-weight:700; color:var(--text-body); display:block; margin-bottom:4px;">Category</label>
        <select id="admSvcCategory" style="width:100%; padding:12px; border:1.5px solid var(--border-color); border-radius:10px; font-size:14px; background:var(--surface-color); color:var(--text-heading);">${cats}</select>
      </div>
      <div style="margin-bottom:12px;">
        <label style="font-size:12px; font-weight:700; color:var(--text-body); display:block; margin-bottom:4px;">Gender Focus</label>
        <select id="admSvcGender" style="width:100%; padding:12px; border:1.5px solid var(--border-color); border-radius:10px; font-size:14px; background:var(--surface-color); color:var(--text-heading);">
          <option value="unisex" ${isEdit && s.gender_focus === 'unisex' ? 'selected' : ''}>Unisex</option>
          <option value="male" ${isEdit && s.gender_focus === 'male' ? 'selected' : ''}>Male</option>
          <option value="female" ${isEdit && s.gender_focus === 'female' ? 'selected' : ''}>Female</option>
        </select>
      </div>
      <div style="margin-bottom:16px; display:flex; align-items:center; gap:8px;">
        <input type="checkbox" id="admSvcRefund" ${isEdit && s.will_refund_advance ? 'checked' : ''} style="accent-color:#9C54F2; width:18px; height:18px;">
        <label for="admSvcRefund" style="font-size:13px; color:var(--text-heading);">Refund advance if cancelled</label>
      </div>
      <button onclick="saveAdminService()" style="width:100%; padding:14px; background:var(--text-heading); color:var(--surface-color); border:none; border-radius:12px; font-size:14px; font-weight:700; cursor:pointer;">
        ${isEdit ? 'Save Changes' : 'Add Service'}
      </button>
    </div>
  `;
}

let _adminSvcDuration = 30;
function adjustDuration(delta) {
  _adminSvcDuration = Math.max(30, Math.min(480, (_adminSvcDuration || 30) + delta));
  const el = document.getElementById('admSvcDuration');
  if (el) el.innerText = _adminSvcDuration;
}

function saveAdminService() {
  const name = document.getElementById('admSvcName')?.value.trim();
  const price = parseInt(document.getElementById('admSvcPrice')?.value);
  const advPct = parseInt(document.getElementById('admSvcAdvPct')?.value) || 0;
  const category = document.getElementById('admSvcCategory')?.value;
  const gender = document.getElementById('admSvcGender')?.value;
  const refund = document.getElementById('admSvcRefund')?.checked || false;

  if (!name || !price) { triggerToast("Name and price are required."); return; }

  const s = AdminState.editingService;
  if (s) {
    s.name = name;
    s.price = price;
    s.duration_minutes = _adminSvcDuration || s.duration_minutes;
    s.min_advance_percentage = advPct;
    s.category = category;
    s.gender_focus = gender;
    s.will_refund_advance = refund;
    triggerToast(`${name} updated.`);
  } else {
    const newId = `adm_svc_${Date.now()}`;
    AdminData.services.push({
      id: newId, name: name, category: category, price: price,
      duration_minutes: _adminSvcDuration || 30, min_advance_percentage: advPct,
      will_refund_advance: refund, gender_focus: gender, active: true, provider_ids: []
    });
    triggerToast(`${name} added and visible in Customer app immediately.`);
  }

  _adminSvcDuration = 30;
  AdminState.editingService = null;
  closeAdminDrawer('adminServiceFormDrawer');
  renderAdminServicesScreen();
}

// ----------------------------------------------------
// COMBOS
// ----------------------------------------------------
function renderAdminCombosList() {
  const container = document.getElementById('adminCombosList');
  container.innerHTML = '';

  AdminData.combos.forEach(c => {
    const svcNames = c.service_ids.map(id => getServiceName(id)).join(', ');
    const combined = c.service_ids.reduce((sum, id) => {
      const s = getService(id);
      return sum + (s ? s.price : 0);
    }, 0);
    const savings = combined - c.combined_price;

    const card = document.createElement('div');
    card.style.cssText = 'background:var(--surface-color); border-radius:14px; padding:14px; margin-bottom:10px; border:1px solid var(--border-color); box-shadow:var(--shadow-card); cursor:pointer;';
    card.onclick = () => openAdminComboDetail(c.id);
    card.innerHTML = `
      <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:6px;">
        <div style="font-size:14px; font-weight:700; color:var(--text-heading);">${c.name}</div>
        ${c.active ? getStatusBadge('active') : getStatusBadge('suspended')}
      </div>
      <div style="font-size:11px; color:var(--text-body); margin-bottom:4px;">${svcNames}</div>
      <div style="display:flex; align-items:center; gap:10px; font-size:12px;">
        <span style="font-size:15px; font-weight:800; color:var(--accent-color);">₹${c.combined_price}</span>
        ${savings > 0 ? `<span style="color:#2E7D32; font-weight:600;">Save ₹${savings}</span>` : ''}
        <span style="font-size:11px; color:var(--text-light);">Adv: ${c.advance_percentage}%</span>
      </div>
    `;
    container.appendChild(card);
  });
}

function openAdminComboDetail(comboId) {
  const c = AdminData.combos.find(co => co.id === comboId);
  if (!c) return;

  const svcNames = c.service_ids.map(id => getServiceName(id)).join(', ');
  const combined = c.service_ids.reduce((sum, id) => {
    const s = getService(id);
    return sum + (s ? s.price : 0);
  }, 0);
  const savings = combined - c.combined_price;

  AdminState.editingCombo = c;
  closeAdminDrawer('adminCombosDetailDrawer');

  const content = document.getElementById('adminComboFormContent');
  const allSvcs = AdminData.services.filter(s => s.active).map(s =>
    `<label style="display:flex; align-items:center; gap:8px; padding:6px 0; cursor:pointer;">
      <input type="checkbox" value="${s.id}" ${c.service_ids.includes(s.id) ? 'checked' : ''} onchange="adminComboToggleSvc('${s.id}')" style="accent-color:#9C54F2;">
      <span style="font-size:13px; color:var(--text-heading);">${s.name} — ₹${s.price}</span>
    </label>`
  ).join('');

  content.innerHTML = `
    <div style="padding:20px;">
      <h3 style="font-size:18px; font-weight:800; margin-bottom:16px;">Edit Combo</h3>
      <div style="margin-bottom:12px;">
        <label style="font-size:12px; font-weight:700; color:var(--text-body); display:block; margin-bottom:4px;">Combo Name</label>
        <input type="text" id="admComboName" value="${c.name}" style="width:100%; padding:12px; border:1.5px solid var(--border-color); border-radius:10px; font-size:14px;">
      </div>
      <div style="margin-bottom:12px;">
        <label style="font-size:12px; font-weight:700; color:var(--text-body); display:block; margin-bottom:4px;">Combined Price (₹)</label>
        <input type="number" id="admComboPrice" value="${c.combined_price}" style="width:100%; padding:12px; border:1.5px solid var(--border-color); border-radius:10px; font-size:14px;">
        ${savings > 0 ? `<div style="font-size:11px; color:#2E7D32; margin-top:4px;">Savings: ₹${savings} (vs ₹${combined} separately)</div>` : ''}
      </div>
      <div style="margin-bottom:12px;">
        <label style="font-size:12px; font-weight:700; color:var(--text-body); display:block; margin-bottom:4px;">Advance %</label>
        <input type="number" id="admComboAdvPct" value="${c.advance_percentage}" min="0" max="100" style="width:100%; padding:12px; border:1.5px solid var(--border-color); border-radius:10px; font-size:14px;">
      </div>
      <div style="margin-bottom:12px;">
        <label style="font-size:12px; font-weight:700; color:var(--text-body); display:block; margin-bottom:4px;">Services in Combo</label>
        ${allSvcs}
      </div>
      <div style="display:flex; gap:8px;">
        <button onclick="saveAdminCombo(true)" style="flex:1; padding:12px; background:var(--text-heading); color:var(--surface-color); border:none; border-radius:12px; font-size:13px; font-weight:700; cursor:pointer;">Save Changes</button>
        <button onclick="adminToggleComboActive('${c.id}')" style="padding:12px; background:${c.active ? 'var(--color-danger-bg)' : 'var(--color-success-bg)'}; color:${c.active ? '#C62828' : '#2E7D32'}; border:none; border-radius:12px; font-size:13px; font-weight:700; cursor:pointer;">
          ${c.active ? 'Deactivate' : 'Activate'}
        </button>
      </div>
    </div>
  `;
  openAdminDrawer('adminComboFormDrawer');
}

const _comboSelectedSvcs = new Set();
function adminComboToggleSvc(svcId) {
  if (_comboSelectedSvcs.has(svcId)) _comboSelectedSvcs.delete(svcId);
  else _comboSelectedSvcs.add(svcId);
}

function saveAdminCombo(isEdit) {
  const name = document.getElementById('admComboName')?.value.trim();
  const price = parseInt(document.getElementById('admComboPrice')?.value);
  const advPct = parseInt(document.getElementById('admComboAdvPct')?.value) || 0;

  if (!name || !price) { triggerToast("Name and price are required."); return; }

  if (isEdit && AdminState.editingCombo) {
    const c = AdminState.editingCombo;
    c.name = name;
    c.combined_price = price;
    c.advance_percentage = advPct;
    c.service_ids = Array.from(_comboSelectedSvcs).length > 0 ? Array.from(_comboSelectedSvcs) : c.service_ids;
    triggerToast(`${name} updated.`);
  } else {
    const svcs = Array.from(_comboSelectedSvcs);
    if (svcs.length < 2) { triggerToast("Select at least 2 services for a combo."); return; }
    AdminData.combos.push({
      id: `adm_combo_${Date.now()}`,
      name: name,
      service_ids: svcs,
      combined_price: price,
      advance_percentage: advPct,
      active: true
    });
    triggerToast(`${name} combo created and visible in Customer app.`);
  }

  _comboSelectedSvcs.clear();
  AdminState.editingCombo = null;
  closeAdminDrawer('adminComboFormDrawer');
  renderAdminCombosList();
}

function adminToggleComboActive(comboId) {
  const c = AdminData.combos.find(co => co.id === comboId);
  if (!c) return;
  c.active = !c.active;
  triggerToast(`${c.name} ${c.active ? 'activated' : 'deactivated'}.`);
  closeAdminDrawer('adminComboFormDrawer');
  renderAdminCombosList();
}

function adminOpenCreateCombo() {
  AdminState.editingCombo = null;
  _comboSelectedSvcs.clear();
  const allSvcs = AdminData.services.filter(s => s.active).map(s =>
    `<label style="display:flex; align-items:center; gap:8px; padding:6px 0; cursor:pointer;">
      <input type="checkbox" value="${s.id}" onchange="adminComboToggleSvc('${s.id}')" style="accent-color:#9C54F2;">
      <span style="font-size:13px; color:var(--text-heading);">${s.name} — ₹${s.price}</span>
    </label>`
  ).join('');

  const content = document.getElementById('adminComboFormContent');
  content.innerHTML = `
    <div style="padding:20px;">
      <h3 style="font-size:18px; font-weight:800; margin-bottom:16px;">Create Combo</h3>
      <div style="margin-bottom:12px;">
        <label style="font-size:12px; font-weight:700; color:var(--text-body); display:block; margin-bottom:4px;">Combo Name</label>
        <input type="text" id="admComboName" placeholder="e.g. Haircut + Facial Combo" style="width:100%; padding:12px; border:1.5px solid var(--border-color); border-radius:10px; font-size:14px;">
      </div>
      <div style="margin-bottom:12px;">
        <label style="font-size:12px; font-weight:700; color:var(--text-body); display:block; margin-bottom:4px;">Combined Price (₹)</label>
        <input type="number" id="admComboPrice" placeholder="1299" style="width:100%; padding:12px; border:1.5px solid var(--border-color); border-radius:10px; font-size:14px;">
      </div>
      <div style="margin-bottom:12px;">
        <label style="font-size:12px; font-weight:700; color:var(--text-body); display:block; margin-bottom:4px;">Advance %</label>
        <input type="number" id="admComboAdvPct" value="20" min="0" max="100" style="width:100%; padding:12px; border:1.5px solid var(--border-color); border-radius:10px; font-size:14px;">
      </div>
      <div style="margin-bottom:16px;">
        <label style="font-size:12px; font-weight:700; color:var(--text-body); display:block; margin-bottom:4px;">Select Services (min 2)</label>
        ${allSvcs}
      </div>
      <button onclick="saveAdminCombo(false)" style="width:100%; padding:14px; background:var(--text-heading); color:var(--surface-color); border:none; border-radius:12px; font-size:14px; font-weight:700; cursor:pointer;">Create Combo</button>
    </div>
  `;
  openAdminDrawer('adminComboFormDrawer');
  lucide.createIcons();
}

// ----------------------------------------------------
// SCREEN 5: PROFILE / MORE
// ----------------------------------------------------
function renderAdminProfileScreen() {
  const salon = AdminData.salon;

  document.getElementById('adminProfileName').innerText = salon.name;
  document.getElementById('adminProfileAddress').innerText = salon.address;
  document.getElementById('adminProfileCover').src = salon.coverPhoto;

  // Financial oversight
  renderAdminFinancials();
  renderAdminClosureCalendar();
}

function renderAdminFinancials() {
  const totalAdvance = AdminData.payments.filter(p => p.type === 'advance').reduce((s, p) => s + p.amount, 0);
  const totalBalance = AdminData.payments.filter(p => p.type === 'balance').reduce((s, p) => s + p.amount, 0);
  const totalRevenue = totalAdvance + totalBalance;

  document.getElementById('adminFinAdvance').innerText = `₹${totalAdvance.toLocaleString()}`;
  document.getElementById('adminFinBalance').innerText = `₹${totalBalance.toLocaleString()}`;
  document.getElementById('adminFinTotal').innerText = `₹${totalRevenue.toLocaleString()}`;

  // Cancellations / forfeited amounts
  const cancelledAppts = AdminData.appointments.filter(a => a.status === 'cancelled' || a.status === 'no_show');
  const forfeitedAdvance = cancelledAppts.reduce((s, a) => {
    const isRefundable = AdminData.services.find(sv => sv.id === a.service_ids[0])?.will_refund_advance;
    return s + (isRefundable ? 0 : a.advance_paid);
  }, 0);
  document.getElementById('adminFinForfeited').innerText = `₹${forfeitedAdvance.toLocaleString()}`;

  // Per-service breakdown
  const svcRevenue = document.getElementById('adminFinPerService');
  svcRevenue.innerHTML = '';
  AdminData.services.filter(s => s.active).slice(0, 6).forEach(s => {
    const appts = AdminData.appointments.filter(a => a.service_ids.includes(s.id) && (a.status === 'completed' || a.status === 'in_progress'));
    const rev = appts.reduce((sum, a) => sum + a.total_amount, 0);
    const div = document.createElement('div');
    div.style.cssText = 'display:flex; justify-content:space-between; padding:8px 0; border-bottom:1px solid var(--border-color); font-size:12px;';
    div.innerHTML = `<span>${s.name}</span><span style="font-weight:700;">₹${rev.toLocaleString()}</span>`;
    svcRevenue.appendChild(div);
  });
}

function renderAdminClosureCalendar() {
  const container = document.getElementById('adminClosureCalendar');
  container.innerHTML = '';

  const now = AdminState.closureCalendarMonth || new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const monthLabel = document.getElementById('adminClosureMonthLabel');
  if (monthLabel) monthLabel.innerText = `${months[month]} ${year}`;

  container.innerHTML = `
    <div style="display:grid; grid-template-columns:repeat(7,1fr); gap:4px; text-align:center; font-size:11px; color:var(--text-light); margin-bottom:4px;">
      <span>Sun</span><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span>
    </div>
    <div style="display:grid; grid-template-columns:repeat(7,1fr); gap:4px;">
      ${Array(firstDay).fill('<div></div>').join('')}
      ${Array.from({ length: daysInMonth }, (_, i) => {
        const day = i + 1;
        const dateObj = new Date(year, month, day);
        const dateStr = formatDateShort(dateObj);
        const isClosed = (AdminData.closureDates || []).includes(dateStr);
        const isPast = dateObj < new Date(new Date().toDateString());
        return `<button onclick="adminToggleClosureDate('${dateStr}', this)" style="padding:8px 4px; border-radius:8px; border:1px solid ${isClosed ? '#C62828' : isPast ? 'var(--border-color)' : 'var(--border-color)'}; background:${isClosed ? '#FFEBEE' : 'var(--surface-color)'}; color:${isClosed ? '#C62828' : isPast ? 'var(--text-light)' : 'var(--text-heading)'}; font-size:12px; font-weight:${isClosed ? '700' : '500'}; cursor:pointer;">${day}</button>`;
      }).join('')}
    </div>
  `;
}

function adminToggleClosureDate(dateStr, btn) {
  AdminData.closureDates = AdminData.closureDates || [];
  const idx = AdminData.closureDates.indexOf(dateStr);
  if (idx !== -1) {
    AdminData.closureDates.splice(idx, 1);
    triggerToast(`${dateStr} removed from closures.`);
  } else {
    AdminData.closureDates.push(dateStr);
    triggerToast(`${dateStr} marked as closed. New bookings blocked.`);
    const affected = AdminData.appointments.filter(a => a.date === dateStr && a.status !== 'cancelled' && a.status !== 'completed');
    if (affected.length > 0) {
      triggerToast(`${affected.length} appointments exist. Use "Cancel This Day" from Appointments tab.`);
    }
  }
  renderAdminClosureCalendar();
}

function adminClosureNav(dir) {
  const d = AdminState.closureCalendarMonth || new Date();
  d.setMonth(d.getMonth() + dir);
  AdminState.closureCalendarMonth = d;
  renderAdminClosureCalendar();
}

function adminOpenEditSalon() {
  const salon = AdminData.salon;
  const content = document.getElementById('adminEditSalonContent');
  content.innerHTML = `
    <div style="padding:20px;">
      <h3 style="font-size:18px; font-weight:800; margin-bottom:16px;">Edit Salon Profile</h3>
      <div style="margin-bottom:12px;">
        <label style="font-size:12px; font-weight:700; color:var(--text-body); display:block; margin-bottom:4px;">Salon Name</label>
        <input type="text" id="admSalonName" value="${salon.name}" style="width:100%; padding:12px; border:1.5px solid var(--border-color); border-radius:10px; font-size:14px;">
      </div>
      <div style="margin-bottom:12px;">
        <label style="font-size:12px; font-weight:700; color:var(--text-body); display:block; margin-bottom:4px;">Address</label>
        <textarea id="admSalonAddress" rows="2" style="width:100%; padding:12px; border:1.5px solid var(--border-color); border-radius:10px; font-size:14px; resize:none;">${salon.address}</textarea>
      </div>
      <div style="margin-bottom:12px;">
        <label style="font-size:12px; font-weight:700; color:var(--text-body); display:block; margin-bottom:4px;">Phone</label>
        <input type="text" id="admSalonPhone" value="${salon.phone}" style="width:100%; padding:12px; border:1.5px solid var(--border-color); border-radius:10px; font-size:14px;">
      </div>
      <button onclick="saveAdminSalonProfile()" style="width:100%; padding:14px; background:var(--text-heading); color:var(--surface-color); border:none; border-radius:12px; font-size:14px; font-weight:700; cursor:pointer;">Save Changes</button>
    </div>
  `;
  openAdminDrawer('adminEditSalonDrawer');
}

function saveAdminSalonProfile() {
  const salon = AdminData.salon;
  salon.name = document.getElementById('admSalonName')?.value.trim() || salon.name;
  salon.address = document.getElementById('admSalonAddress')?.value.trim() || salon.address;
  salon.phone = document.getElementById('admSalonPhone')?.value.trim() || salon.phone;
  triggerToast("Salon profile updated.");
  closeAdminDrawer('adminEditSalonDrawer');
  renderAdminProfileScreen();
}

// ----------------------------------------------------
// ADMIN LOGOUT
// ----------------------------------------------------
function adminLogout() {
  if (confirm("Logout of admin account?")) {
    performLogout();
  }
}
