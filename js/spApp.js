// SalonHub Service Provider Application Logic

const SPState = {
  currentTab: 'sp_home',
  scheduleView: 'day',
  scheduleDate: new Date(),
  scheduleFilter: 'scheduled',
  activeApptDetailId: null,
  walkinForm: { name: '', phone: '', gender: 'Male', serviceId: '', timeSlot: '' }
};

// ----------------------------------------------------
// SP TAB NAVIGATION
// ----------------------------------------------------
function spNavigateToTab(tabId, isBack = false) {
  if (!isBack && typeof pushNavHistory === 'function') {
    pushNavHistory({ role: 'sp', tabId });
  }

  SPState.currentTab = tabId;

  const spScreens = document.querySelectorAll('.sp-screen');
  spScreens.forEach(s => s.classList.remove('active'));

  const target = document.getElementById(`screen_${tabId}`);
  if (target) target.classList.add('active');

  const navItems = document.querySelectorAll('.sp-nav-item');
  navItems.forEach(item => {
    item.classList.toggle('active', item.getAttribute('data-tab') === tabId);
  });

  if (tabId === 'sp_home') renderSPHomeScreen();
  else if (tabId === 'sp_schedule') renderSPScheduleScreen();
  else if (tabId === 'sp_walkin') renderSPWalkinScreen();
  else if (tabId === 'sp_profile') renderSPProfileScreen();
}

// ----------------------------------------------------
// HELPERS
// ----------------------------------------------------
function spTimeToMinutes(timeStr) {
  const [time, modifier] = timeStr.split(' ');
  let [hours, minutes] = time.split(':').map(Number);
  if (modifier === 'PM' && hours !== 12) hours += 12;
  if (modifier === 'AM' && hours === 12) hours = 0;
  return hours * 60 + minutes;
}

function spMinutesToTime(mins) {
  let hours = Math.floor(mins / 60);
  const minutes = mins % 60;
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12;
  return `${hours}:${minutes < 10 ? '0' + minutes : minutes} ${ampm}`;
}

function spGetStatusColor(status) {
  switch (status) {
    case 'completed': return { bg: 'var(--color-success-bg)', color: '#2E7D32' };
    case 'in_progress': return { bg: 'var(--color-warning-bg)', color: '#EF6C00' };
    case 'scheduled': return { bg: 'var(--color-info-bg)', color: '#1565C0' };
    case 'no_show': return { bg: 'var(--color-danger-bg)', color: '#C62828' };
    default: return { bg: 'var(--surface-color)', color: 'var(--text-body)' };
  }
}

function spGetStatusBadge(status) {
  const c = spGetStatusColor(status);
  const label = status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  return `<span style="background:${c.bg}; color:${c.color}; padding:3px 10px; border-radius:12px; font-size:11px; font-weight:700;">${label}</span>`;
}

function spGenderIcon(g) {
  if (g === 'Female') return 'venus';
  if (g === 'Male') return 'mars';
  return 'users';
}

function spGenderColor(g) {
  if (g === 'Female') return { bg: '#FCE4EC', color: '#C2185B' };
  if (g === 'Male') return { bg: 'var(--color-info-bg)', color: '#1565C0' };
  return { bg: 'var(--accent-soft)', color: '#9C54F2' };
}

// ----------------------------------------------------
// 1. RENDER SP HOME SCREEN (Compact - fits viewport)
// ----------------------------------------------------
function renderSPHomeScreen() {
  const salon = SalonHubData.salons.find(s => s.id === SPData.salonId);
  const stylist = SalonHubData.stylists.find(s => s.id === SPData.providerId);

  const greetingEl = document.getElementById('spHomeGreeting');
  if (greetingEl) greetingEl.innerText = "Hi Rahul 👋";

  const salonInfoEl = document.getElementById('spHomeSalonInfo');
  if (salonInfoEl) salonInfoEl.innerText = salon ? `${salon.name} • ${salon.location}` : 'Luxe Studio Salon • Koregaon Park, Pune';

  const avatarEl = document.getElementById('spHomeAvatar');
  if (avatarEl && stylist) avatarEl.src = stylist.avatar;

  const statusContainer = document.getElementById('spStatusPills');
  if (statusContainer) {
    if (!SPData._manualStatus) autoFetchProviderStatus();
    SPData._manualStatus = false;
    const statuses = [
      { key: 'available', label: 'Available', icon: 'check-circle', color: '#16A34A' },
      { key: 'on_break', label: 'On Break', icon: 'coffee', color: '#F59E0B' },
      { key: 'busy', label: 'Busy', icon: 'minus-circle', color: '#DC2626' }
    ];
    statusContainer.innerHTML = "";
    statuses.forEach(s => {
      const btn = document.createElement('button');
      const isActive = SPData.status === s.key;
      btn.style.cssText = `flex:1; display:flex; align-items:center; justify-content:center; gap:6px; padding:14px 8px; border-radius:16px; border:none; font-size:13px; font-weight:700; cursor:pointer; transition:all 0.2s; ${
        isActive ? `background:${s.color}; color:#fff; box-shadow:0 3px 12px ${s.color}44;` : 'background:var(--accent-soft); color:var(--accent-color);'
      }`;
      btn.onclick = () => setProviderStatus(s.key);
      btn.innerHTML = `<i data-lucide="${s.icon}" style="width:16px; height:16px;"></i>${s.label}`;
      statusContainer.appendChild(btn);
    });
  }

  const nextApptContainer = document.getElementById('spNextApptCard');
  if (nextApptContainer) {
    const nextAppt = SPData.appointments.find(a => a.status === 'scheduled');
    if (nextAppt) {
      const servicesText = nextAppt.services.map(s => s.name).join(', ');
      nextApptContainer.innerHTML = `
        <div style="background:linear-gradient(135deg, #9C54F2 0%, #7B3FD4 100%); border-radius:14px; padding:14px 16px; color:#fff; cursor:pointer;" onclick="openSPAppointmentDetail('${nextAppt.id}')">
          <div style="display:flex; align-items:center; justify-content:space-between;">
            <div>
              <div style="display:flex; align-items:center; gap:6px; margin-bottom:4px;">
                <i data-lucide="clock" style="width:12px; height:12px; opacity:0.8;"></i>
                <span style="font-size:9px; opacity:0.8; text-transform:uppercase; letter-spacing:0.5px;">Next</span>
              </div>
              <div style="font-size:15px; font-weight:800;">${nextAppt.customerName}</div>
              <div style="font-size:11px; opacity:0.85; margin-top:1px;">${servicesText}</div>
            </div>
            <div style="text-align:right;">
              <div style="font-size:15px; font-weight:800;">${nextAppt.time}</div>
              <div style="font-size:11px; opacity:0.8;">${nextAppt.duration}m • ₹${nextAppt.totalAmount}</div>
              <div style="margin-top:6px; display:flex; align-items:center; gap:4px; justify-content:flex-end;">
                <i data-lucide="${nextAppt.type === 'online' ? 'wifi' : 'store'}" style="width:10px; height:10px;"></i>
                <span style="font-size:10px; text-transform:capitalize;">${nextAppt.type}</span>
              </div>
            </div>
          </div>
        </div>
      `;
    } else {
      nextApptContainer.innerHTML = `
        <div style="background:var(--accent-soft); border-radius:14px; padding:16px; text-align:center;">
          <i data-lucide="calendar-check" style="width:30px; height:30px; color:#9C54F2; margin-bottom:4px;"></i>
          <div style="font-size:13px; font-weight:700; color:var(--text-heading);">No upcoming appointments</div>
        </div>
      `;
    }
  }

  const statsContainer = document.getElementById('spStatsRow');
  if (statsContainer) {
    const todayAppts = SPData.appointments.filter(a => a.date === 'today');
    const completedCount = todayAppts.filter(a => a.status === 'completed').length;
    const remainingCount = todayAppts.filter(a => a.status === 'scheduled' || a.status === 'in_progress').length;
    const totalToday = SPData.earnings.today.total;
    const stats = [
      { label: 'Total', value: todayAppts.length, icon: 'calendar', bg: 'var(--accent-soft)', color: '#9C54F2' },
      { label: 'Done', value: completedCount, icon: 'check-circle', bg: 'var(--color-success-bg)', color: '#2E7D32' },
      { label: 'Left', value: remainingCount, icon: 'clock', bg: 'var(--color-warning-bg)', color: '#EF6C00' },
      { label: 'Earned', value: `₹${totalToday.toLocaleString()}`, icon: 'indian-rupee', bg: 'var(--color-info-bg)', color: '#1565C0' }
    ];
    statsContainer.innerHTML = "";
    stats.forEach(s => {
      const el = document.createElement('div');
      el.style.cssText = `background:${s.bg}; border-radius:10px; padding:8px 4px; flex:1; min-width:0; text-align:center;`;
      el.innerHTML = `
        <i data-lucide="${s.icon}" style="width:16px; height:16px; color:${s.color};"></i>
        <div style="font-size:14px; font-weight:800; color:${s.color}; margin-top:1px;">${s.value}</div>
        <div style="font-size:8px; color:var(--text-body); white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${s.label}</div>
      `;
      statsContainer.appendChild(el);
    });
  }

  const shiftText = document.getElementById('spShiftInfoText');
  if (shiftText) shiftText.innerText = 'Shift: 09:00 AM - 07:00 PM • Break: 01:00 - 02:00 PM';

  const apptCount = document.getElementById('spApptCount');
  const sorted = [...SPData.appointments].sort((a, b) => spTimeToMinutes(a.time) - spTimeToMinutes(b.time));
  if (apptCount) apptCount.textContent = `${sorted.length} appointments`;

  const timelineContainer = document.getElementById('spTimeline');
  if (timelineContainer) {
    timelineContainer.innerHTML = "";
    sorted.forEach((appt) => {
      const sc = spGetStatusColor(appt.status);
      const servicesText = appt.services.map(s => s.name).join(', ');
      const gc = spGenderColor(appt.customerGender);
      const balance = appt.finalBilledAmount - appt.advancePaid;
      const card = document.createElement('div');
      card.style.cssText = `background:var(--surface-color); border-radius:12px; padding:12px; cursor:pointer; border-left:3px solid ${sc.color}; box-shadow:var(--shadow-card);`;
      card.onclick = () => openSPAppointmentDetail(appt.id);
      card.innerHTML = `
        <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:4px;">
          <span style="font-size:12px; font-weight:700; color:${sc.color};">${appt.time}</span>
          ${spGetStatusBadge(appt.status)}
        </div>
        <div style="font-size:13px; font-weight:700; color:var(--text-heading); margin-bottom:2px;">${appt.customerName}</div>
        <div style="display:inline-flex; align-items:center; gap:2px; background:${gc.bg}; color:${gc.color}; padding:1px 6px; border-radius:6px; font-size:9px; font-weight:600; margin-bottom:4px;">
          <i data-lucide="${spGenderIcon(appt.customerGender)}" style="width:8px; height:8px;"></i>${appt.customerGender}
        </div>
        <div style="font-size:10px; color:var(--text-body); white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${servicesText}</div>
        <div style="display:flex; align-items:center; gap:6px; margin-top:4px; font-size:10px; color:var(--text-light);">
          <span>${appt.duration}m</span>
          <span>₹${appt.totalAmount}</span>
          ${balance > 0 ? `<span style="color:var(--color-danger);">Due ₹${balance}</span>` : ''}
        </div>
      `;
      timelineContainer.appendChild(card);
    });
  }

  lucide.createIcons();
}

// ----------------------------------------------------
// 2. RENDER SP SCHEDULE SCREEN
// ----------------------------------------------------
function renderSPScheduleScreen() {
  const dayBtn = document.getElementById('spScheduleDayBtn');
  const tomorrowBtn = document.getElementById('spScheduleTomorrowBtn');
  if (dayBtn && tomorrowBtn) {
    const isDay = SPState.scheduleView === 'day';
    dayBtn.style.cssText = isDay
      ? 'background:var(--accent-color); color:#fff; border:none; padding:8px 20px; border-radius:20px; font-size:12px; font-weight:700; cursor:pointer;'
      : 'background:var(--accent-soft); color:var(--accent-color); border:none; padding:8px 20px; border-radius:20px; font-size:12px; font-weight:700; cursor:pointer;';
    tomorrowBtn.style.cssText = !isDay
      ? 'background:var(--accent-color); color:#fff; border:none; padding:8px 20px; border-radius:20px; font-size:12px; font-weight:700; cursor:pointer;'
      : 'background:var(--accent-soft); color:var(--accent-color); border:none; padding:8px 20px; border-radius:20px; font-size:12px; font-weight:700; cursor:pointer;';
  }

  const dateLabel = document.getElementById('spScheduleDateLabel');
  if (dateLabel) {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const d = SPState.scheduleDate;
    const today = new Date();
    const isToday = d.toDateString() === today.toDateString();
    dateLabel.innerText = isToday
      ? `Today, ${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`
      : `${days[d.getDay()]}, ${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
  }

  const filterContainer = document.getElementById('spScheduleFilters');
  if (filterContainer) {
    const filters = [
      { key: 'all', label: 'All' },
      { key: 'scheduled', label: 'Scheduled' },
      { key: 'completed', label: 'Completed' }
    ];
    filterContainer.innerHTML = "";
    filters.forEach(f => {
      const btn = document.createElement('button');
      const isActive = SPState.scheduleFilter === f.key;
      btn.style.cssText = `padding:6px 14px; border-radius:16px; border:1px solid ${isActive ? 'var(--accent-color)' : 'var(--border-color)'}; background:${isActive ? 'var(--accent-color)' : 'var(--surface-color)'}; color:${isActive ? '#fff' : 'var(--text-body)'}; font-size:11px; font-weight:600; cursor:pointer; white-space:nowrap;`;
      btn.onclick = () => {
        SPState.scheduleFilter = f.key;
        renderSPScheduleScreen();
      };
      btn.innerText = f.label;
      filterContainer.appendChild(btn);
    });
  }

  const listContainer = document.getElementById('spScheduleList');
  if (listContainer) {
    const today = new Date();
    const navDate = SPState.scheduleDate;
    const isToday = navDate.toDateString() === today.toDateString();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const isTomorrow = navDate.toDateString() === tomorrow.toDateString();

    let filtered = [...SPData.appointments];

    if (isToday) {
      filtered = filtered.filter(a => a.date === 'today');
    } else if (isTomorrow) {
      filtered = filtered.filter(a => a.date === 'tomorrow');
    } else {
      filtered = [];
    }

    if (SPState.scheduleFilter === 'scheduled') filtered = filtered.filter(a => a.status === 'scheduled' || a.status === 'in_progress');
    else if (SPState.scheduleFilter === 'completed') filtered = filtered.filter(a => a.status === 'completed' || a.status === 'no_show');

    filtered.sort((a, b) => spTimeToMinutes(a.time) - spTimeToMinutes(b.time));

    listContainer.innerHTML = "";

    if (filtered.length === 0) {
      listContainer.innerHTML = `
        <div style="text-align:center; padding:40px 20px;">
          <i data-lucide="calendar-x" style="width:40px; height:40px; color:#CCC; margin-bottom:8px;"></i>
          <div style="font-size:14px; font-weight:600; color:var(--text-light);">No appointments found</div>
          <div style="font-size:12px; color:#BBB; margin-top:4px;">Try changing the date or filter</div>
        </div>
      `;
      lucide.createIcons();
      return;
    }

    filtered.forEach((appt, idx) => {
      const sc = spGetStatusColor(appt.status);
      const servicesText = appt.services.map(s => s.name).join(', ');
      const gc = spGenderColor(appt.customerGender);
      const balance = appt.finalBilledAmount - appt.advancePaid;
      const el = document.createElement('div');
      el.style.cssText = `display:flex; gap:12px; padding:12px; margin-bottom:8px; background:var(--surface-color); border-radius:12px; border-left:4px solid ${sc.color}; box-shadow:var(--shadow-card); cursor:pointer;`;
      el.onclick = () => openSPAppointmentDetail(appt.id);
      el.innerHTML = `
        <div style="min-width:52px; text-align:center;">
          <div style="font-size:14px; font-weight:700; color:${sc.color};">${appt.time.split(' ')[0]}</div>
          <div style="font-size:10px; color:var(--text-light);">${appt.time.split(' ')[1]}</div>
        </div>
        <div style="flex:1; min-width:0;">
          <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:2px;">
            <span style="font-size:13px; font-weight:700; color:var(--text-heading); white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${appt.customerName}</span>
            <span style="display:inline-flex; align-items:center; gap:2px; background:${gc.bg}; color:${gc.color}; padding:1px 6px; border-radius:6px; font-size:9px; font-weight:600; flex-shrink:0; margin-left:6px;">
              <i data-lucide="${spGenderIcon(appt.customerGender)}" style="width:8px; height:8px;"></i>${appt.customerGender.charAt(0)}
            </span>
          </div>
          <div style="font-size:11px; color:var(--text-body); white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${servicesText}</div>
          <div style="display:flex; align-items:center; gap:8px; margin-top:4px; flex-wrap:wrap;">
            ${spGetStatusBadge(appt.status)}
            <span style="font-size:10px; color:var(--text-light);">${appt.duration}m</span>
            <span style="font-size:10px; color:var(--text-light); text-transform:capitalize;">${appt.type}</span>
            ${balance > 0 ? `<span style="font-size:10px; color:#C62828; font-weight:600;">Due ₹${balance}</span>` : ''}
          </div>
        </div>
        <div style="display:flex; align-items:center;">
          <i data-lucide="chevron-right" style="width:16px; height:16px; color:#CCC;"></i>
        </div>
      `;
      listContainer.appendChild(el);
    });
  }

  lucide.createIcons();
}

function spScheduleNav(dir) {
  const d = SPState.scheduleDate;
  d.setDate(d.getDate() + dir);
  SPState.scheduleDate = d;
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  if (d.toDateString() === today.toDateString()) SPState.scheduleView = 'day';
  else if (d.toDateString() === tomorrow.toDateString()) SPState.scheduleView = 'tomorrow';
  renderSPScheduleScreen();
}

function spToggleScheduleView(view) {
  SPState.scheduleView = view;
  const today = new Date();
  if (view === 'day') {
    SPState.scheduleDate = today;
  } else if (view === 'tomorrow') {
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    SPState.scheduleDate = tomorrow;
  }
  renderSPScheduleScreen();
}

// ----------------------------------------------------
// 3. RENDER SP WALK-IN SCREEN
// ----------------------------------------------------
function renderSPWalkinScreen() {
  const slotsContainer = document.getElementById('spWalkinSlots');
  if (slotsContainer) {
    const allSlots = [];
    for (let m = 540; m <= 1110; m += 30) {
      allSlots.push(spMinutesToTime(m));
    }

    slotsContainer.innerHTML = "";
    allSlots.forEach(slot => {
      const isTaken = SPData.appointments.some(a => {
        const apptMins = spTimeToMinutes(a.time);
        const slotMins = spTimeToMinutes(slot);
        const apptEnd = apptMins + (a.duration || 30);
        return slotMins >= apptMins && slotMins < apptEnd;
      });

      const isSelected = SPState.walkinForm.timeSlot === slot;
      const btn = document.createElement('button');
      btn.style.cssText = `padding:8px 12px; border-radius:10px; font-size:12px; font-weight:600; cursor:pointer; white-space:nowrap; border:1.5px solid ${isSelected ? 'var(--accent-color)' : isTaken ? 'var(--color-danger-bg)' : 'var(--border-color)'}; background:${isSelected ? 'var(--accent-color)' : isTaken ? 'var(--color-danger-bg)' : 'var(--surface-color)'}; color:${isSelected ? '#fff' : isTaken ? 'var(--color-danger)' : 'var(--text-body)'}; flex-shrink:0;`;
      btn.disabled = isTaken;
      btn.innerHTML = isTaken ? `${slot} <span style="font-size:9px;">Busy</span>` : slot;
      if (!isTaken) {
        btn.onclick = () => {
          SPState.walkinForm.timeSlot = slot;
          renderSPWalkinScreen();
        };
      }
      slotsContainer.appendChild(btn);
    });
  }

  const serviceSelect = document.getElementById('spWalkinService');
  if (serviceSelect) {
    const salon = SalonHubData.salons.find(s => s.id === SPData.salonId);
    const specialCats = StylistSpecialties[SPData.providerId] || ['haircut', 'colour', 'combos'];
    const services = salon ? salon.services.filter(s => specialCats.includes(s.category)) : [];
    serviceSelect.innerHTML = '<option value="">Select service...</option>';
    services.forEach(s => {
      const opt = document.createElement('option');
      opt.value = s.id;
      opt.textContent = `${s.name} - ₹${s.price}`;
      if (SPState.walkinForm.serviceId === s.id) opt.selected = true;
      serviceSelect.appendChild(opt);
    });
  }

  const nameInput = document.getElementById('spWalkinName');
  const phoneInput = document.getElementById('spWalkinPhone');
  if (nameInput) nameInput.value = SPState.walkinForm.name;
  if (phoneInput) phoneInput.value = SPState.walkinForm.phone;
}

function spUpdateWalkinField(field, value) {
  SPState.walkinForm[field] = value;
}

function spUpdateWalkinGenderBtn(el) {
  document.querySelectorAll('.sp-walkin-gender-btn').forEach(b => {
    b.style.cssText = 'flex:1; padding:10px; border:1.5px solid var(--border-color); border-radius:10px; background:var(--surface-color); color:var(--text-body); font-size:12px; font-weight:700; cursor:pointer;';
  });
  el.style.cssText = 'flex:1; padding:10px; border:1.5px solid #9C54F2; border-radius:10px; background:#9C54F2; color:#fff; font-size:12px; font-weight:700; cursor:pointer;';
}

function submitWalkinForm() {
  const name = SPState.walkinForm.name.trim();
  const phone = SPState.walkinForm.phone.trim();
  const gender = SPState.walkinForm.gender || 'Male';
  const serviceId = SPState.walkinForm.serviceId;
  const timeSlot = SPState.walkinForm.timeSlot;

  if (!name) { triggerToast("Please enter customer name."); return; }
  if (!timeSlot) { triggerToast("Please select a time slot."); return; }
  if (!serviceId) { triggerToast("Please select a service."); return; }

  const slotMins = spTimeToMinutes(timeSlot);
  const conflict = SPData.appointments.some(a => {
    const apptMins = spTimeToMinutes(a.time);
    const apptEnd = apptMins + (a.duration || 30);
    return slotMins >= apptMins && slotMins < apptEnd;
  });

  if (conflict) { triggerToast("This slot conflicts with an existing appointment."); return; }

  const salon = SalonHubData.salons.find(s => s.id === SPData.salonId);
  const specialCats = StylistSpecialties[SPData.providerId] || ['haircut', 'colour', 'combos'];
  const services = salon ? salon.services.filter(s => specialCats.includes(s.category)) : [];
  const selectedService = services.find(s => s.id === serviceId);

  if (!selectedService) { triggerToast("Invalid service selected."); return; }

  const durationMatch = selectedService.time.match(/(\d+)/);
  const duration = durationMatch ? parseInt(durationMatch[1]) : 45;

  const newAppt = {
    id: `sp_appt_${Date.now()}`,
    customerName: name,
    customerPhone: phone || 'N/A',
    customerGender: gender,
    customerAge: 25,
    customerEmail: '',
    services: [{ name: selectedService.name, price: selectedService.price, duration: duration }],
    time: timeSlot,
    duration: duration,
    status: "scheduled",
    type: "offline",
    paymentMethod: "Cash",
    advancePaid: 0,
    totalAmount: selectedService.price,
    finalBilledAmount: selectedService.price,
    balanceDue: selectedService.price,
    bookingSource: "Walk-in",
    notes: "",
    date: "today"
  };

  SPData.appointments.push(newAppt);
  SPState.walkinForm = { name: '', phone: '', gender: 'Male', serviceId: '', timeSlot: '' };


  if (SPState.currentTab === 'sp_walkin') renderSPWalkinScreen();
  else if (SPState.currentTab === 'sp_home') renderSPHomeScreen();
  else if (SPState.currentTab === 'sp_schedule') renderSPScheduleScreen();
}

// ----------------------------------------------------
// 4. RENDER SP PROFILE SCREEN
// ----------------------------------------------------
function renderSPProfileScreen() {
  const stylist = SalonHubData.stylists.find(s => s.id === SPData.providerId);
  const salon = SalonHubData.salons.find(s => s.id === SPData.salonId);

  const profileCard = document.getElementById('spProfileCard');
  if (profileCard && stylist) {
    profileCard.innerHTML = `
      <div style="display:flex; align-items:center; gap:14px; padding:20px;">
        <img src="${stylist.avatar}" alt="Rahul Sharma" style="width:64px; height:64px; border-radius:50%; object-fit:cover; border:3px solid #9C54F2;">
        <div style="flex:1;">
          <div style="font-size:18px; font-weight:800; color:var(--text-heading);">${stylist.name}</div>
          <div style="display:inline-block; background:var(--accent-soft); color:#9C54F2; padding:3px 10px; border-radius:12px; font-size:11px; font-weight:700; margin-top:4px;">Service Provider</div>
          <div style="font-size:12px; color:var(--text-body); margin-top:4px;">${salon ? salon.name : 'Luxe Studio Salon'}</div>
        </div>
      </div>
    `;
  }

  const specContainer = document.getElementById('spProfileSpecializations');
  if (specContainer) {
    const specs = ['Haircut', 'Hair Colour', 'Combos'];
    specContainer.innerHTML = `
      <div style="display:flex; flex-wrap:wrap; gap:8px; margin-bottom:4px;">
        ${specs.map(s => `<span style="background:var(--accent-soft); color:#9C54F2; padding:6px 14px; border-radius:16px; font-size:12px; font-weight:600;">${s}</span>`).join('')}
      </div>
      <div style="font-size:10px; color:var(--text-light);">Set by salon admin</div>
    `;
  }

  const infoContainer = document.getElementById('spProfileInfo');
  if (infoContainer) {
    infoContainer.innerHTML = `
      <div style="padding:16px 20px; border-bottom:1px solid #F0F0F0;">
        <div style="font-size:11px; color:var(--text-light); text-transform:uppercase; letter-spacing:0.5px; margin-bottom:6px;">Full Name</div>
        <div style="display:flex; align-items:center; justify-content:space-between;">
          <span style="font-size:14px; font-weight:600; color:var(--text-heading);">Rahul Sharma</span>
          <i data-lucide="lock" style="width:14px; height:14px; color:#CCC;"></i>
        </div>
      </div>
      <div style="padding:16px 20px; border-bottom:1px solid #F0F0F0;">
        <div style="font-size:11px; color:var(--text-light); text-transform:uppercase; letter-spacing:0.5px; margin-bottom:6px;">Phone Number</div>
        <div style="display:flex; align-items:center; justify-content:space-between;">
          <span style="font-size:14px; font-weight:600; color:var(--text-heading);">+91 98765 12345</span>
          <button style="background:none; border:none; color:#9C54F2; font-size:12px; font-weight:700; cursor:pointer;">Edit</button>
        </div>
      </div>
      <div style="padding:16px 20px; border-bottom:1px solid #F0F0F0;">
        <div style="font-size:11px; color:var(--text-light); text-transform:uppercase; letter-spacing:0.5px; margin-bottom:6px;">Email Address</div>
        <div style="display:flex; align-items:center; justify-content:space-between;">
          <span style="font-size:14px; font-weight:600; color:var(--text-heading);">rahul.sharma@salonhub.com</span>
          <i data-lucide="lock" style="width:14px; height:14px; color:#CCC;"></i>
        </div>
      </div>
      <div style="padding:16px 20px;">
        <div style="font-size:11px; color:var(--text-light); text-transform:uppercase; letter-spacing:0.5px; margin-bottom:6px;">Photo</div>
        <div style="display:flex; align-items:center; justify-content:space-between;">
          <div style="display:flex; align-items:center; gap:10px;">
            <img src="${stylist ? stylist.avatar : ''}" style="width:40px; height:40px; border-radius:10px; object-fit:cover;">
            <span style="font-size:12px; color:var(--text-light);">Tap to change photo</span>
          </div>
          <button style="background:none; border:none; color:#9C54F2; font-size:12px; font-weight:700; cursor:pointer;">Upload</button>
        </div>
      </div>
    `;
  }

  const hoursContainer = document.getElementById('spProfileWorkingHours');
  if (hoursContainer) {
    const dayLabels = { mon: 'Mon', tue: 'Tue', wed: 'Wed', thu: 'Thu', fri: 'Fri', sat: 'Sat', sun: 'Sun' };
    let html = '';
    Object.keys(SPData.workingHours).forEach(day => {
      const h = SPData.workingHours[day];
      const label = dayLabels[day];
      if (h.off) {
        html += `<div style="display:flex; align-items:center; justify-content:space-between; padding:10px 0; border-bottom:1px solid var(--border-color);">
          <span style="font-size:13px; font-weight:600; color:var(--text-heading); width:40px;">${label}</span>
          <span style="font-size:12px; color:#C62828; font-weight:600;">Off</span>
        </div>`;
      } else {
        html += `<div style="display:flex; align-items:center; justify-content:space-between; padding:10px 0; border-bottom:1px solid var(--border-color);">
          <span style="font-size:13px; font-weight:600; color:var(--text-heading); width:40px;">${label}</span>
          <div style="flex:1; text-align:right;">
            <div style="font-size:12px; color:var(--text-body);">${h.start} - ${h.end}</div>
            <div style="font-size:10px; color:var(--text-light);">Break: ${h.break}</div>
          </div>
          <i data-lucide="lock" style="width:12px; height:12px; color:#CCC; margin-left:8px;"></i>
        </div>`;
      }
    });
    hoursContainer.innerHTML = html;
  }

  const leaveContainer = document.getElementById('spProfileLeaveRequests');
  if (leaveContainer) {
    let html = '';
    SPData.leaveRequests.forEach(lr => {
      const badgeColor = lr.status === 'approved' ? { bg: 'var(--color-success-bg)', fg: '#2E7D32' }
        : lr.status === 'pending' ? { bg: 'var(--color-warning-bg)', fg: '#EF6C00' }
        : { bg: 'var(--color-danger-bg)', fg: '#C62828' };
      const statusLabel = lr.status.charAt(0).toUpperCase() + lr.status.slice(1);
      html += `<div style="display:flex; align-items:center; justify-content:space-between; padding:12px 0; border-bottom:1px solid var(--border-color);">
        <div>
          <div style="font-size:13px; font-weight:600; color:var(--text-heading);">${lr.date}</div>
          <div style="font-size:11px; color:var(--text-body); margin-top:2px;">${lr.type === 'full_day' ? 'Full Day' : lr.timeRange}</div>
          <div style="font-size:11px; color:var(--text-light); margin-top:2px;">${lr.reason}</div>
        </div>
        <span style="background:${badgeColor.bg}; color:${badgeColor.fg}; padding:4px 10px; border-radius:12px; font-size:11px; font-weight:700;">${statusLabel}</span>
      </div>`;
    });
    leaveContainer.innerHTML = html;
    const btnRow = document.createElement('div');
    btnRow.style.cssText = 'padding-top:12px;';
    btnRow.innerHTML = `<button onclick="openSPLeaveRequestForm()" style="width:100%; padding:12px; border:2px dashed #9C54F2; border-radius:12px; background:var(--accent-soft); color:#9C54F2; font-size:13px; font-weight:700; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:6px;">
      <i data-lucide="plus-circle" style="width:16px; height:16px;"></i> Request Leave
    </button>`;
    leaveContainer.appendChild(btnRow);
  }

  const settingsContainer = document.getElementById('spProfileSettings');
  if (settingsContainer) {
    settingsContainer.innerHTML = `
      <div style="display:flex; align-items:center; justify-content:space-between; padding:14px 0; border-bottom:1px solid var(--border-color);">
        <div style="display:flex; align-items:center; gap:10px;">
          <i data-lucide="bell" style="width:18px; height:18px; color:var(--text-body);"></i>
          <span style="font-size:13px; font-weight:600; color:var(--text-heading);">Notifications</span>
        </div>
        <label style="position:relative; display:inline-block; width:44px; height:24px;">
          <input type="checkbox" checked style="opacity:0; width:0; height:0;">
          <span style="position:absolute; cursor:pointer; top:0; left:0; right:0; bottom:0; background-color:#9C54F2; border-radius:24px; transition:.3s;">
            <span style="position:absolute; content:''; height:18px; width:18px; left:22px; bottom:3px; background-color:white; border-radius:50%; transition:.3s;"></span>
          </span>
        </label>
      </div>
      <div style="display:flex; align-items:center; justify-content:space-between; padding:14px 0; border-bottom:1px solid var(--border-color);">
        <div style="display:flex; align-items:center; gap:10px;">
          <i data-lucide="moon" style="width:18px; height:18px; color:var(--text-body);"></i>
          <span style="font-size:13px; font-weight:600; color:var(--text-heading);">Dark Mode</span>
        </div>
        <label style="position:relative; display:inline-block; width:44px; height:24px;">
          <input type="checkbox" onchange="toggleDarkModeSetting(this)" style="opacity:0; width:0; height:0;">
          <span style="position:absolute; cursor:pointer; top:0; left:0; right:0; bottom:0; background-color:#CCC; border-radius:24px; transition:.3s;">
            <span style="position:absolute; content:''; height:18px; width:18px; left:3px; bottom:3px; background-color:white; border-radius:50%; transition:.3s;"></span>
          </span>
        </label>
      </div>
      <div style="padding:14px 0;">
        <button onclick="performLogout()" style="width:100%; padding:14px; border:none; border-radius:12px; background:var(--color-danger-bg); color:#C62828; font-size:14px; font-weight:700; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:8px;">
          <i data-lucide="log-out" style="width:18px; height:18px;"></i> Logout
        </button>
      </div>
    `;
  }

  lucide.createIcons();
}

// ----------------------------------------------------
// 5. OPEN SP APPOINTMENT DETAIL OVERLAY
// ----------------------------------------------------
function openSPAppointmentDetail(apptId) {
  const appt = SPData.appointments.find(a => a.id === apptId);
  if (!appt) return;
  SPState.activeApptDetailId = apptId;

  const balanceDue = appt.finalBilledAmount - appt.advancePaid;
  const gc = spGenderColor(appt.customerGender);
  const sc = spGetStatusColor(appt.status);

  const servicesHtml = appt.services.map(s => `
    <div style="display:flex; justify-content:space-between; align-items:center; padding:10px 0; border-bottom:1px solid var(--border-color);">
      <div>
        <div style="font-size:14px; font-weight:600; color:var(--text-heading);">${s.name}</div>
        <div style="font-size:11px; color:var(--text-light); margin-top:2px;">${s.duration} mins</div>
      </div>
      <span style="font-size:14px; font-weight:700; color:var(--text-heading);">₹${s.price}</span>
    </div>
  `).join('');

  let actionButtons = '';
  if (appt.status === 'scheduled') {
    actionButtons = `
      <div style="display:flex; gap:10px; margin-top:16px;">
        <button onclick="openSPQRScan('${appt.id}')" style="flex:1; padding:12px; background:#9C54F2; color:#fff; border:none; border-radius:12px; font-size:13px; font-weight:700; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:6px;">
          <i data-lucide="scan-line" style="width:16px; height:16px;"></i> Scan QR to Start
        </button>
        <button onclick="markAppointmentStatus('${appt.id}', 'no_show')" style="padding:12px 16px; background:var(--color-danger-bg); color:#C62828; border:none; border-radius:12px; font-size:13px; font-weight:700; cursor:pointer;">
          <i data-lucide="x-circle" style="width:16px; height:16px;"></i>
        </button>
      </div>
    `;
  } else if (appt.status === 'in_progress') {
    actionButtons = `
      <div style="display:flex; gap:10px; margin-top:16px;">
        <button onclick="markAppointmentStatus('${appt.id}', 'completed')" style="flex:1; padding:12px; background:#2E7D32; color:#fff; border:none; border-radius:12px; font-size:13px; font-weight:700; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:6px;">
          <i data-lucide="check-circle" style="width:16px; height:16px;"></i> Mark Completed
        </button>
      </div>
    `;
  }

  const overlay = document.getElementById('spDetailOverlay');
  const content = document.getElementById('spDetailContent');
  if (overlay && content) {
    content.innerHTML = `
      <div style="padding:20px;">
        <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:14px;">
          <h3 style="font-size:18px; font-weight:800; color:var(--text-heading); margin:0;">Appointment Details</h3>
          <button onclick="closeSPOverlay('spDetailOverlay')" style="background:var(--surface-color); border:none; width:32px; height:32px; border-radius:50%; display:flex; align-items:center; justify-content:center; cursor:pointer;">
            <i data-lucide="x" style="width:18px; height:18px; color:var(--text-body);"></i>
          </button>
        </div>

        <div style="display:flex; align-items:center; gap:8px; margin-bottom:16px;">
          ${spGetStatusBadge(appt.status)}
          <span style="font-size:11px; padding:4px 10px; border-radius:12px; background:${appt.type === 'online' ? 'var(--color-info-bg)' : 'var(--color-warning-bg)'}; color:${appt.type === 'online' ? '#1565C0' : '#EF6C00'}; font-weight:600; text-transform:capitalize;">${appt.type === 'online' ? 'Online Booking' : 'Walk-in'}</span>
        </div>

        <div style="padding:16px; background:var(--surface-color); border-radius:14px;">
          <div style="display:flex; align-items:center; gap:12px; margin-bottom:12px;">
            <div style="width:44px; height:44px; border-radius:50%; background:${gc.bg}; display:flex; align-items:center; justify-content:center;">
              <i data-lucide="${spGenderIcon(appt.customerGender)}" style="width:22px; height:22px; color:${gc.color};"></i>
            </div>
            <div style="flex:1;">
              <div style="font-size:16px; font-weight:700; color:var(--text-heading);">${appt.customerName}</div>
              <div style="display:flex; align-items:center; gap:8px; margin-top:2px;">
                <span style="display:inline-flex; align-items:center; gap:3px; background:${gc.bg}; color:${gc.color}; padding:2px 8px; border-radius:6px; font-size:10px; font-weight:600;">
                  <i data-lucide="${spGenderIcon(appt.customerGender)}" style="width:9px; height:9px;"></i>${appt.customerGender}
                </span>
                ${appt.customerAge ? `<span style="font-size:11px; color:var(--text-light);">Age ${appt.customerAge}</span>` : ''}
                <span style="font-size:11px; color:var(--text-light);">${appt.bookingSource || 'Direct'}</span>
              </div>
            </div>
          </div>
          <div style="display:flex; align-items:center; gap:6px; margin-bottom:6px;">
            <i data-lucide="phone" style="width:14px; height:14px; color:#9C54F2;"></i>
            <button onclick="spCallCustomer('${appt.customerPhone}')" style="background:none; border:none; color:#9C54F2; font-size:13px; font-weight:600; cursor:pointer; padding:0;">${appt.customerPhone}</button>
          </div>
          ${appt.customerEmail ? `<div style="display:flex; align-items:center; gap:6px;">
            <i data-lucide="mail" style="width:14px; height:14px; color:var(--text-light);"></i>
            <span style="font-size:12px; color:var(--text-body);">${appt.customerEmail}</span>
          </div>` : ''}
        </div>

        <div style="margin-top:16px;">
          <div style="font-size:12px; font-weight:700; color:var(--text-body); text-transform:uppercase; letter-spacing:0.5px; margin-bottom:8px;">Services</div>
          ${servicesHtml}
        </div>

        <div style="margin-top:14px; padding:14px; background:var(--surface-color); border-radius:12px;">
          <div style="display:flex; justify-content:space-between; margin-bottom:8px;">
            <span style="font-size:13px; color:var(--text-body);">Time Slot</span>
            <span style="font-size:13px; font-weight:600; color:var(--text-heading);">${appt.time} (${appt.duration} mins)</span>
          </div>
          <div style="display:flex; justify-content:space-between; margin-bottom:8px;">
            <span style="font-size:13px; color:var(--text-body);">Payment Method</span>
            <span style="font-size:13px; font-weight:600; color:var(--text-heading);">${appt.paymentMethod || 'Cash'}</span>
          </div>
          <div style="display:flex; justify-content:space-between; margin-bottom:8px;">
            <span style="font-size:13px; color:var(--text-body);">Total Amount</span>
            <span style="font-size:13px; font-weight:600; color:var(--text-heading);">₹${appt.finalBilledAmount}</span>
          </div>
          <div style="display:flex; justify-content:space-between; margin-bottom:8px;">
            <span style="font-size:13px; color:var(--text-body);">Advance Paid</span>
            <span style="font-size:13px; font-weight:600; color:#2E7D32;">₹${appt.advancePaid}</span>
          </div>
          <div style="display:flex; justify-content:space-between; border-top:1px dashed var(--border-color); padding-top:8px;">
            <span style="font-size:13px; font-weight:700; color:var(--text-heading);">Balance Due</span>
            <span style="font-size:13px; font-weight:700; color:${balanceDue > 0 ? '#C62828' : '#2E7D32'};">₹${balanceDue}</span>
          </div>
        </div>

        ${appt.notes ? `
        <div style="margin-top:12px; padding:12px; background:var(--color-notes-bg); border-radius:10px; display:flex; align-items:flex-start; gap:8px;">
          <i data-lucide="message-square" style="width:14px; height:14px; color:#EF6C00; margin-top:2px; flex-shrink:0;"></i>
          <span style="font-size:12px; color:var(--text-body); line-height:1.4;">${appt.notes}</span>
        </div>
        ` : ''}

        ${appt.status === 'in_progress' || appt.status === 'completed' ? `
        <div style="margin-top:14px; padding:14px; background:var(--accent-soft); border-radius:12px;">
          <div style="font-size:11px; color:var(--text-light); text-transform:uppercase; letter-spacing:0.5px;">Final Billed Amount</div>
          <div style="font-size:20px; font-weight:800; color:var(--text-heading); margin-top:2px;">₹${appt.finalBilledAmount}</div>
        </div>
        ` : ''}

        ${actionButtons}
      </div>
    `;
    overlay.classList.add('open');
    const drawer = document.getElementById('spDetailDrawer');
    if (drawer) drawer.classList.add('open');
    lucide.createIcons();
  }
}

// ----------------------------------------------------
// 6. OPEN SP QR SCAN (Simulate)
// ----------------------------------------------------
function openSPQRScan(apptId) {
  const overlay = document.getElementById('spScanOverlay');
  if (!overlay) return;

  overlay.innerHTML = `
    <div style="position:fixed; top:0; left:0; width:100%; height:100%; background:#000; display:flex; flex-direction:column; align-items:center; justify-content:center; z-index:10000;">
      <div style="color:#fff; font-size:16px; font-weight:700; margin-bottom:30px;">Scan Customer QR Code</div>
      <div style="width:240px; height:240px; border:3px solid #9C54F2; border-radius:16px; position:relative; overflow:hidden;">
        <div style="position:absolute; top:0; left:0; right:0; height:3px; background:#9C54F2; animation:scanLine 2s ease-in-out;"></div>
        <div style="width:100%; height:100%; background:rgba(156,84,242,0.05); display:flex; align-items:center; justify-content:center;">
          <i data-lucide="scan-line" style="width:80px; height:80px; color:rgba(156,84,242,0.3);"></i>
        </div>
        <div style="position:absolute; top:0; left:0; width:40px; height:40px; border-top:4px solid #9C54F2; border-left:4px solid #9C54F2; border-radius:12px 0 0 0;"></div>
        <div style="position:absolute; top:0; right:0; width:40px; height:40px; border-top:4px solid #9C54F2; border-right:4px solid #9C54F2; border-radius:0 12px 0 0;"></div>
        <div style="position:absolute; bottom:0; left:0; width:40px; height:40px; border-bottom:4px solid #9C54F2; border-left:4px solid #9C54F2; border-radius:0 0 0 12px;"></div>
        <div style="position:absolute; bottom:0; right:0; width:40px; height:40px; border-bottom:4px solid #9C54F2; border-right:4px solid #9C54F2; border-radius:0 0 12px 0;"></div>
      </div>
      <div style="color:rgba(255,255,255,0.6); font-size:12px; margin-top:20px;">Position QR code within the frame</div>
      <button onclick="closeSPOverlay('spScanOverlay')" style="margin-top:30px; background:rgba(255,255,255,0.15); color:#fff; border:1px solid rgba(255,255,255,0.3); padding:10px 24px; border-radius:20px; font-size:13px; font-weight:600; cursor:pointer;">Cancel</button>
    </div>
    <style>@keyframes scanLine { 0% { top: 0; } 50% { top: calc(100% - 3px); } 100% { top: 0; } }</style>
  `;
  overlay.classList.add('open');
  lucide.createIcons();

  setTimeout(() => {
    markAppointmentStatus(apptId, 'in_progress');
    closeSPOverlay('spScanOverlay');
    overlay.innerHTML = `
      <div style="position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.85); display:flex; flex-direction:column; align-items:center; justify-content:center; z-index:10000;">
        <div style="width:100px; height:100px; border-radius:50%; background:var(--color-success-bg); display:flex; align-items:center; justify-content:center; margin-bottom:20px;">
          <i data-lucide="check" style="width:50px; height:50px; color:#2E7D32;"></i>
        </div>
        <div style="color:#fff; font-size:20px; font-weight:800; margin-bottom:6px;">QR Verified!</div>
        <div style="color:rgba(255,255,255,0.6); font-size:13px;">Appointment marked as In Progress</div>
      </div>
    `;
    lucide.createIcons();
    setTimeout(() => { closeSPOverlay('spScanOverlay'); }, 1500);
  }, 2000);
}

// ----------------------------------------------------
// 7. MARK APPOINTMENT STATUS
// ----------------------------------------------------
function markAppointmentStatus(apptId, newStatus) {
  const appt = SPData.appointments.find(a => a.id === apptId);
  if (!appt) return;
  appt.status = newStatus;

  if (newStatus === 'completed') {
    SPData.earnings.today.balance += (appt.finalBilledAmount - appt.advancePaid);
    SPData.earnings.today.total += appt.finalBilledAmount;
    SPData.earnings.thisWeek.balance += (appt.finalBilledAmount - appt.advancePaid);
    SPData.earnings.thisWeek.total += appt.finalBilledAmount;
    SPData.earnings.thisMonth.balance += (appt.finalBilledAmount - appt.advancePaid);
    SPData.earnings.thisMonth.total += appt.finalBilledAmount;
  }

  const statusLabel = newStatus.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  triggerToast(`Appointment with ${appt.customerName} marked as ${statusLabel}`);

  if (SPState.activeApptDetailId === apptId) {
    closeSPOverlay('spDetailOverlay');
  }

  if (SPState.currentTab === 'sp_home') renderSPHomeScreen();
  else if (SPState.currentTab === 'sp_schedule') renderSPScheduleScreen();
}

// ----------------------------------------------------
// 8. OPEN SP EARNINGS DETAIL
// ----------------------------------------------------
function openSPEarningsDetail() {
  const overlay = document.getElementById('spEarningsOverlay');
  const content = document.getElementById('spEarningsContent');
  if (!overlay || !content) return;

  const e = SPData.earnings;
  const maxVal = Math.max(e.today.total, e.thisWeek.total, e.thisMonth.total);

  const barHtml = (label, data, max) => {
    const pct = max > 0 ? (data.total / max * 100) : 0;
    return `
      <div style="margin-bottom:20px;">
        <div style="display:flex; justify-content:space-between; margin-bottom:6px;">
          <span style="font-size:14px; font-weight:700; color:var(--text-heading);">${label}</span>
          <span style="font-size:14px; font-weight:800; color:#2E7D32;">₹${data.total.toLocaleString()}</span>
        </div>
        <div style="width:100%; height:8px; background:#F0F0F0; border-radius:4px; overflow:hidden; margin-bottom:8px;">
          <div style="width:${pct}%; height:100%; background:linear-gradient(90deg, #9C54F2, #7B3FD4); border-radius:4px; transition:width 0.5s;"></div>
        </div>
        <div style="display:flex; gap:16px;">
          <div style="flex:1;">
            <div style="font-size:10px; color:var(--text-light);">Advance Collected</div>
            <div style="font-size:13px; font-weight:700; color:var(--text-heading);">₹${data.advance.toLocaleString()}</div>
          </div>
          <div style="flex:1;">
            <div style="font-size:10px; color:var(--text-light);">Balance Collected</div>
            <div style="font-size:13px; font-weight:700; color:var(--text-heading);">₹${data.balance.toLocaleString()}</div>
          </div>
        </div>
      </div>
    `;
  };

  content.innerHTML = `
    <div style="padding:20px;">
      <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:20px;">
        <h3 style="font-size:18px; font-weight:800; color:var(--text-heading); margin:0;">Earnings</h3>
        <button onclick="closeSPOverlay('spEarningsOverlay')" style="background:var(--surface-color); border:none; width:32px; height:32px; border-radius:50%; display:flex; align-items:center; justify-content:center; cursor:pointer;">
          <i data-lucide="x" style="width:18px; height:18px; color:var(--text-body);"></i>
        </button>
      </div>
      ${barHtml("Today", e.today, maxVal)}
      <div style="border-top:1px solid #F0F0F0; padding-top:14px;">
        ${barHtml("This Week", e.thisWeek, maxVal)}
      </div>
      <div style="border-top:1px solid #F0F0F0; padding-top:14px;">
        ${barHtml("This Month", e.thisMonth, maxVal)}
      </div>
    </div>
  `;
  overlay.classList.add('open');
  const eDrawer = document.getElementById('spEarningsDrawer');
  if (eDrawer) eDrawer.classList.add('open');
  lucide.createIcons();
}

// ----------------------------------------------------
// 9. OPEN SP LEAVE REQUEST FORM
// ----------------------------------------------------
function openSPLeaveRequestForm() {
  const overlay = document.getElementById('spLeaveOverlay');
  const content = document.getElementById('spLeaveContent');
  if (!overlay || !content) return;

  content.innerHTML = `
    <div style="padding:20px;">
      <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:20px;">
        <h3 style="font-size:18px; font-weight:800; color:var(--text-heading); margin:0;">Request Leave</h3>
        <button onclick="closeSPOverlay('spLeaveOverlay')" style="background:var(--surface-color); border:none; width:32px; height:32px; border-radius:50%; display:flex; align-items:center; justify-content:center; cursor:pointer;">
          <i data-lucide="x" style="width:18px; height:18px; color:var(--text-body);"></i>
        </button>
      </div>
      <div style="margin-bottom:16px;">
        <label style="font-size:12px; font-weight:700; color:var(--text-body); display:block; margin-bottom:6px;">Date</label>
        <input type="text" id="spLeaveDate" placeholder="e.g. 28 Jul 2026" style="width:100%; padding:12px; border:1.5px solid var(--border-color); border-radius:10px; font-size:14px; box-sizing:border-box;">
      </div>
      <div style="margin-bottom:16px;">
        <label style="font-size:12px; font-weight:700; color:var(--text-body); display:block; margin-bottom:6px;">Leave Type</label>
        <div style="display:flex; gap:10px;">
          <button id="spLeaveTypeFull" onclick="spSelectLeaveType('full_day')" style="flex:1; padding:10px; border:1.5px solid #9C54F2; border-radius:10px; background:#9C54F2; color:#fff; font-size:12px; font-weight:700; cursor:pointer;">Full Day</button>
          <button id="spLeaveTypeHalf" onclick="spSelectLeaveType('half_day')" style="flex:1; padding:10px; border:1.5px solid var(--border-color); border-radius:10px; background:var(--surface-color); color:var(--text-body); font-size:12px; font-weight:700; cursor:pointer;">Half Day</button>
        </div>
      </div>
      <div id="spLeaveTimeRangeWrap" style="margin-bottom:16px; display:none;">
        <label style="font-size:12px; font-weight:700; color:var(--text-body); display:block; margin-bottom:6px;">Time Range</label>
        <input type="text" id="spLeaveTimeRange" placeholder="e.g. 09:00 AM - 01:00 PM" style="width:100%; padding:12px; border:1.5px solid var(--border-color); border-radius:10px; font-size:14px; box-sizing:border-box;">
      </div>
      <div style="margin-bottom:20px;">
        <label style="font-size:12px; font-weight:700; color:var(--text-body); display:block; margin-bottom:6px;">Reason</label>
        <textarea id="spLeaveReason" rows="3" placeholder="Enter reason for leave..." style="width:100%; padding:12px; border:1.5px solid var(--border-color); border-radius:10px; font-size:14px; resize:none; box-sizing:border-box; font-family:inherit;"></textarea>
      </div>
      <button onclick="submitLeaveRequest()" style="width:100%; padding:14px; background:var(--text-heading); color:var(--surface-color); border:none; border-radius:12px; font-size:14px; font-weight:700; cursor:pointer;">Submit Request</button>
    </div>
  `;
  SPState._leaveType = 'full_day';
  overlay.classList.add('open');
  const lDrawer = document.getElementById('spLeaveDrawer');
  if (lDrawer) lDrawer.classList.add('open');
  lucide.createIcons();
}

function spSelectLeaveType(type) {
  SPState._leaveType = type;
  const fullBtn = document.getElementById('spLeaveTypeFull');
  const halfBtn = document.getElementById('spLeaveTypeHalf');
  const timeWrap = document.getElementById('spLeaveTimeRangeWrap');
  if (fullBtn && halfBtn) {
    if (type === 'full_day') {
      fullBtn.style.cssText = 'flex:1; padding:10px; border:1.5px solid #9C54F2; border-radius:10px; background:#9C54F2; color:#fff; font-size:12px; font-weight:700; cursor:pointer;';
      halfBtn.style.cssText = 'flex:1; padding:10px; border:1.5px solid var(--border-color); border-radius:10px; background:var(--surface-color); color:var(--text-body); font-size:12px; font-weight:700; cursor:pointer;';
      if (timeWrap) timeWrap.style.display = 'none';
    } else {
      halfBtn.style.cssText = 'flex:1; padding:10px; border:1.5px solid #9C54F2; border-radius:10px; background:#9C54F2; color:#fff; font-size:12px; font-weight:700; cursor:pointer;';
      fullBtn.style.cssText = 'flex:1; padding:10px; border:1.5px solid var(--border-color); border-radius:10px; background:var(--surface-color); color:var(--text-body); font-size:12px; font-weight:700; cursor:pointer;';
      if (timeWrap) timeWrap.style.display = 'block';
    }
  }
}

function submitLeaveRequest() {
  const date = document.getElementById('spLeaveDate')?.value.trim();
  const reason = document.getElementById('spLeaveReason')?.value.trim();
  const timeRange = document.getElementById('spLeaveTimeRange')?.value.trim();
  if (!date) { triggerToast("Please enter a date."); return; }
  if (!reason) { triggerToast("Please provide a reason."); return; }

  SPData.leaveRequests.push({
    id: `leave_${Date.now()}`,
    date: date,
    type: SPState._leaveType || 'full_day',
    timeRange: SPState._leaveType === 'half_day' ? (timeRange || '09:00 AM - 01:00 PM') : undefined,
    reason: reason,
    status: 'pending'
  });
  closeSPOverlay('spLeaveOverlay');
  triggerToast("Leave request submitted!");
  renderSPProfileScreen();
}

// ----------------------------------------------------
// 9b. AUTO-FETCH PROVIDER STATUS FROM APPOINTMENTS
// ----------------------------------------------------
function autoFetchProviderStatus() {
  const now = new Date();
  const currentHour = now.getHours();
  const currentMin = now.getMinutes();
  const currentTimeMin = currentHour * 60 + currentMin;

  const todayAppts = SPData.appointments.filter(a => a.date === 'today');
  const inProgress = todayAppts.find(a => a.status === 'in_progress');
  if (inProgress) {
    SPData.status = 'busy';
    return;
  }

  let nextStart = Infinity;
  let prevEnd = 0;
  todayAppts.forEach(a => {
    if (a.status === 'scheduled' || a.status === 'in_progress') {
      const parts = a.time.match(/(\d+):(\d+)/);
      if (parts) {
        let hrs = parseInt(parts[1]);
        const mins = parseInt(parts[2]);
        if (a.time.includes('PM') && hrs !== 12) hrs += 12;
        if (a.time.includes('AM') && hrs === 12) hrs = 0;
        const start = hrs * 60 + mins;
        const end = start + a.duration;
        if (start > currentTimeMin && start < nextStart) nextStart = start;
        if (end <= currentTimeMin && end > prevEnd) prevEnd = end;
      }
    }
  });

  const breakBuffer = 15;
  if (nextStart < Infinity && nextStart - currentTimeMin <= breakBuffer && nextStart > currentTimeMin) {
    SPData.status = 'busy';
    return;
  }

  SPData.status = 'available';
}

// ----------------------------------------------------
// 10. SET PROVIDER STATUS
// ----------------------------------------------------
function setProviderStatus(status) {
  SPData.status = status;
  SPData._manualStatus = true;
  renderSPHomeScreen();
}

// ----------------------------------------------------
// 11. SP CALL CUSTOMER
// ----------------------------------------------------
function spCallCustomer(phone) {
  // Call functionality
}

// ----------------------------------------------------
// 12. SP EDIT FINAL AMOUNT
// ----------------------------------------------------
function spEditFinalAmount(apptId) {
  const appt = SPData.appointments.find(a => a.id === apptId);
  if (!appt) return;
  const newAmount = prompt("Enter final billed amount:", appt.finalBilledAmount);
  if (newAmount === null) return;
  const parsed = parseInt(newAmount);
  if (isNaN(parsed) || parsed < 0) { triggerToast("Please enter a valid amount."); return; }
  appt.finalBilledAmount = parsed;
  appt.balanceDue = parsed - appt.advancePaid;
  closeSPOverlay('spDetailOverlay');
  openSPAppointmentDetail(apptId);
}

// ----------------------------------------------------
// 13. CLOSE SP OVERLAY
// ----------------------------------------------------
function closeSPOverlay(overlayId) {
  const overlay = document.getElementById(overlayId);
  if (overlay) {
    overlay.classList.remove('open');
  }
  const drawerId = overlayId.replace('Overlay', 'Drawer');
  const drawer = document.getElementById(drawerId);
  if (drawer) drawer.classList.remove('open');
}
