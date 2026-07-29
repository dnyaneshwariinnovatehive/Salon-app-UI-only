// SalonHub Core Application Logic

// Global Application State Management
const AppState = {
  isAuthenticated: false,
  authMode: 'login', // 'login', 'signup', 'otp'
  currentTab: 'home',
  selectedRegisterRole: 'customer',
  selectedLocation: "Koregaon Park, Pune",
  homeGender: 'unisex', // 'unisex', 'male', 'female'
  homeSort: 'popular', // 'popular', 'top_rated', 'nearest'

  // Search & Filter Settings on Explore
  searchQuery: "",
  activeCategoryFilter: "all",
  activeQuickFilter: "all", // 'all', 'open', 'price500', 'top_rated', 'nearby'
  advancedFilters: {
    sort: 'rating', // 'rating', 'distance'
    gender: 'all', // 'all', 'men', 'women'
    price: 'all' // 'all', '500', 'premium'
  },

  // Map View Toggles
  isMapView: false,
  activeMapPinId: null,

  // Bookings Tab Active
  isUpcomingBookingsTab: true,

  // Favourites Tab Active
  isFavSalonsTab: true,

  // Active Detail Sheet State
  selectedSalonId: null,
  selectedDetailCategory: "all",
  selectedServices: [], // Array of service objects selected

  // Selected Slots checkout details
  selectedDateNum: null,
  selectedTimeSlot: null,
  selectedStylistId: null,

  // Service Provider Mode
  spMode: false,
  // Admin Mode
  adminMode: false,
  // SuperAdmin Mode
  saMode: false,
};

let isHandlingPopState = false;

// Initial Setup on Document Load
window.addEventListener('DOMContentLoaded', () => {
  // Setup system time clock in status bar
  updateSystemTime();
  setInterval(updateSystemTime, 60000);

  // Initialize display with Splash Screen
  showScreen('splash', true);
  document.getElementById('navigationBar').style.display = 'none';

  // Setup browser history back button navigation
  setupBrowserHistory();

  // Transition directly to Home screen after splash (no login required upfront)
  setTimeout(() => {
    const splashScreen = document.getElementById('screen_splash');
    if (splashScreen && splashScreen.classList.contains('active')) {
      if (AppState.saMode) {
        document.getElementById('saNavigationBar').style.display = 'flex';
        saNavigateToTab('sa_home', true);
      } else if (AppState.adminMode) {
        document.getElementById('adminNavigationBar').style.display = 'flex';
        adminNavigateToTab('admin_home', true);
      } else if (AppState.spMode) {
        document.getElementById('spNavigationBar').style.display = 'flex';
        spNavigateToTab('sp_home', true);
      } else {
        document.getElementById('navigationBar').style.display = 'flex';
        showScreen('home', true);
        renderHomeScreen();
      }
    }
  }, 2500);

  // Initialize Category Icons in Home screen
  renderHomeCategories();

  // Setup Pull to Refresh gesture mock listeners
  setupPullToRefresh();
});

// Browser History Back Button Navigation Handler
function setupBrowserHistory() {
  window.addEventListener('popstate', (event) => {
    isHandlingPopState = true;

    // 1. Check if any drawer/overlay is open - close top open drawer first
    const openOverlay = document.querySelector('.overlay.open');
    if (openOverlay) {
      if (openOverlay.id === 'drawerOverlay') closeAllDrawers();
      else if (openOverlay.id === 'cartOverlay') closeCartDrawer();
      else if (openOverlay.id === 'slotPickerOverlay') closeSlotPickerDrawer();
      else if (openOverlay.id === 'filterOverlay') closeFilterDrawer();
      else if (openOverlay.id === 'locationOverlay') closeLocationDrawer();
      else if (openOverlay.id === 'notificationsOverlay') closeNotificationsDrawer();
      else if (openOverlay.id === 'addCardOverlay') closeAddCardDrawer();
      else if (openOverlay.id === 'guestLoginPromptOverlay') closeGuestLoginPrompt();
      else if (openOverlay.id === 'successModalOverlay') closeSuccessModal();
      else if (AppState.saMode && openOverlay.id.endsWith('Overlay')) {
        const drawerName = openOverlay.id.replace('Overlay', '');
        if (typeof saCloseDrawer === 'function') saCloseDrawer(drawerName);
      }
      
      isHandlingPopState = false;
      return;
    }

    // 2. Tab & Screen navigation back handling
    if (AppState.saMode) {
      if (AppState.currentTab !== 'sa_home') {
        saNavigateToTab('sa_home', true);
      }
    } else if (AppState.adminMode) {
      if (AppState.currentTab !== 'admin_home') {
        adminNavigateToTab('admin_home', true);
      }
    } else if (AppState.spMode) {
      if (AppState.currentTab !== 'sp_home') {
        spNavigateToTab('sp_home', true);
      }
    } else {
      // Customer Mode
      const registerScreen = document.getElementById('screen_register');
      const notBuiltScreen = document.getElementById('screen_not_built');
      
      if (registerScreen && registerScreen.classList.contains('active')) {
        showScreen('login', true);
      } else if (notBuiltScreen && notBuiltScreen.classList.contains('active')) {
        showScreen('register', true);
      } else if (AppState.currentTab !== 'home') {
        navigateToTab('home', true);
      }
    }

    isHandlingPopState = false;
  });
}

function pushNavHistory(stateObj = {}) {
  if (!isHandlingPopState) {
    history.pushState({ ...stateObj, timestamp: Date.now() }, '');
  }
}

// Start application from onboarding splash
function startApp() {
  showScreen('login');
}

// Update status bar digital clock
function updateSystemTime() {
  const timeEl = document.getElementById('statusBarTime');
  const now = new Date();
  let hours = now.getHours();
  let minutes = now.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12; // 0 should be 12
  minutes = minutes < 10 ? '0' + minutes : minutes;
  timeEl.textContent = `${hours}:${minutes} ${ampm}`;
}

// ----------------------------------------------------
// SCREEN TRANSITIONS & NAV SYSTEM
// ----------------------------------------------------
function showScreen(screenId, isBack = false) {
  if (!isBack) {
    pushNavHistory({ screenId });
  }

  // Hide all screens
  const screens = document.querySelectorAll('.screen');
  screens.forEach(s => s.classList.remove('active'));

  // Show active screen
  const targetScreen = document.getElementById(`screen_${screenId}`);
  if (targetScreen) {
    targetScreen.classList.add('active');
  }

  // Set page scroll to top
  document.getElementById('mainContent').scrollTop = 0;
}

function navigateToTab(tabId, isBack = false) {
  if (!AppState.isAuthenticated && (tabId === 'bookings' || tabId === 'favourites' || tabId === 'profile')) {
    showGuestLoginPrompt();
    return;
  }

  AppState.currentTab = tabId;
  showScreen(tabId, isBack);

  // Update navbar items CSS active state
  const navItems = document.querySelectorAll('.nav-item');
  navItems.forEach(item => {
    if (item.getAttribute('data-tab') === tabId) {
      item.classList.add('active');
    } else {
      item.classList.remove('active');
    }
  });

  // Call render handlers for specific screens
  if (tabId === 'home') {
    renderHomeScreen();
  } else if (tabId === 'explore') {
    renderExploreScreen();
  } else if (tabId === 'bookings') {
    renderBookingsScreen();
  } else if (tabId === 'favourites') {
    renderFavouritesScreen();
  } else if (tabId === 'profile') {
    renderProfileScreen();
  }
}

// ----------------------------------------------------
// SCREEN 1: LOGIN / SIGNUP LOGIC
// ----------------------------------------------------
function toggleAuthTab(mode) {
  if (mode === 'signup') {
    showRegisterScreen();
    // Keep login tab active visually on login screen, in case they return
    const loginTab = document.getElementById('btnTabLogin');
    const signupTab = document.getElementById('btnTabSignup');
    if (loginTab && signupTab) {
      loginTab.classList.add('active');
      signupTab.classList.remove('active');
    }
    return;
  }

  AppState.authMode = mode;
  const loginTab = document.getElementById('btnTabLogin');
  const signupTab = document.getElementById('btnTabSignup');
  const loginFields = document.getElementById('loginFormFields');
  const signupFields = document.getElementById('signupFormFields');
  const otpFields = document.getElementById('otpFormFields');
  const btnAuthText = document.getElementById('btnAuthText');
  const authDivider = document.getElementById('authDivider');
  const authSocials = document.getElementById('authSocials');
  const authFooterLabel = document.getElementById('authFooterLabel');
  const authFooterLink = document.getElementById('authFooterLink');

  otpFields.style.display = 'none';
  authDivider.style.display = 'flex';
  authSocials.style.display = 'flex';

  if (mode === 'login') {
    loginTab.classList.add('active');
    signupTab.classList.remove('active');
    loginFields.style.display = 'block';
    signupFields.style.display = 'none';
    btnAuthText.innerText = 'Continue';
    authFooterLabel.innerText = "Don't have an account?";
    authFooterLink.innerText = "Continue with phone number";
  } else {
    loginTab.classList.remove('active');
    signupTab.classList.add('active');
    loginFields.style.display = 'none';
    signupFields.style.display = 'block';
    btnAuthText.innerText = 'Register & Continue';
    authFooterLabel.innerText = "Already have an account?";
    authFooterLink.innerText = "Login";
  }
}

function togglePhoneOrFields() {
  const linkText = document.getElementById('authFooterLink').innerText;

  if (linkText === "Continue with phone number") {
    // Show OTP screen
    document.getElementById('loginFormFields').style.display = 'none';
    document.getElementById('signupFormFields').style.display = 'none';
    document.getElementById('otpFormFields').style.display = 'block';
    document.getElementById('btnAuthText').innerText = 'Verify OTP';
    document.getElementById('authDivider').style.display = 'none';
    document.getElementById('authSocials').style.display = 'none';
    document.getElementById('authFooterLabel').innerText = "Wrong number?";
    document.getElementById('authFooterLink').innerText = "Back to Login";
  } else if (linkText === "Back to Login" || linkText === "Login") {
    toggleAuthTab('login');
  } else {
    toggleAuthTab('signup');
  }
}

function togglePasswordVisibility(fieldId) {
  const input = document.getElementById(fieldId);
  const icon = document.getElementById(`${fieldId}Eye`);
  if (input.type === "password") {
    input.type = "text";
    icon.setAttribute('data-lucide', 'eye-off');
  } else {
    input.type = "password";
    icon.setAttribute('data-lucide', 'eye');
  }
  lucide.createIcons();
}

function moveOtpFocus(current, nextFieldId) {
  if (current.value.length >= 1) {
    document.getElementById(nextFieldId).focus();
  }
}

function validateSystemCredentials(email, password) {
  const cleanEmail = (email || '').trim().toLowerCase();
  const cleanPass = (password || '').trim();

  if (cleanEmail === 'dnyaneshwari@gmail.com' && cleanPass === 'pune123') {
    return { valid: true, role: 'customer', name: 'Dnyaneshwari' };
  }
  if (cleanEmail === 'serviceprovider@gmail.com' && cleanPass === '123456') {
    return { valid: true, role: 'provider', name: 'Rahul (Provider)' };
  }
  if (cleanEmail === 'admin@gmail.com' && cleanPass === '123456') {
    return { valid: true, role: 'admin', name: 'System Admin' };
  }
  if (cleanEmail === 'rootadmin@gmail.com' && cleanPass === '123456') {
    return { valid: true, role: 'superadmin', name: 'Platform Owner' };
  }
  return { valid: false };
}

function performAuth() {
  const isSignupTab = AppState.authMode === 'signup';
  const email = (document.getElementById(isSignupTab ? 'signupEmail' : 'loginEmail')?.value || '').trim();
  const pass = (document.getElementById(isSignupTab ? 'signupPassword' : 'loginPassword')?.value || '').trim();

  if (!email) {
    triggerToast("Please enter your Email Address.");
    return;
  }
  if (!pass) {
    triggerToast("Please enter your Password.");
    return;
  }

  const auth = validateSystemCredentials(email, pass);
  if (!auth.valid) {
    triggerToast("Invalid credentials! Allowed accounts:\n• Customer: dnyaneshwari@gmail.com (pune123)\n• Provider: serviceprovider@gmail.com (123456)\n• Admin: admin@gmail.com (123456)\n• SuperAdmin: rootadmin@gmail.com (123456)");
    return;
  }

  AppState.isAuthenticated = true;

  if (auth.role === 'superadmin') {
    AppState.saMode = true;
    AppState.adminMode = false;
    AppState.spMode = false;
    AppState.currentTab = 'sa_home';
    document.getElementById('navigationBar').style.display = 'none';
    document.getElementById('spNavigationBar').style.display = 'none';
    document.getElementById('adminNavigationBar').style.display = 'none';
    document.getElementById('saNavigationBar').style.display = 'flex';
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById('screen_sa_home').classList.add('active');
    saInitPlatformData();
    saRenderHomeScreen();
    lucide.createIcons();
    triggerToast("Logged in as SuperAdmin");
    return;
  }

  if (auth.role === 'admin') {
    AppState.adminMode = true;
    AppState.saMode = false;
    AppState.spMode = false;
    AppState.currentTab = 'admin_home';
    document.getElementById('navigationBar').style.display = 'none';
    document.getElementById('spNavigationBar').style.display = 'none';
    document.getElementById('saNavigationBar').style.display = 'none';
    document.getElementById('adminNavigationBar').style.display = 'flex';
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById('screen_admin_home').classList.add('active');
    renderAdminHomeScreen();
    lucide.createIcons();
    triggerToast("Logged in as Admin");
    return;
  }

  if (auth.role === 'provider') {
    AppState.spMode = true;
    AppState.adminMode = false;
    AppState.saMode = false;
    AppState.currentTab = 'sp_home';
    document.getElementById('navigationBar').style.display = 'none';
    document.getElementById('adminNavigationBar').style.display = 'none';
    document.getElementById('saNavigationBar').style.display = 'none';
    document.getElementById('spNavigationBar').style.display = 'flex';
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById('screen_sp_home').classList.add('active');
    renderSPHomeScreen();
    lucide.createIcons();
    triggerToast("Logged in as Service Provider");
    return;
  }

  // Customer Login
  AppState.spMode = false;
  AppState.adminMode = false;
  AppState.saMode = false;
  document.getElementById('spNavigationBar').style.display = 'none';
  document.getElementById('adminNavigationBar').style.display = 'none';
  document.getElementById('saNavigationBar').style.display = 'none';
  document.getElementById('navigationBar').style.display = 'flex';

  const nameInput = document.getElementById('signupName')?.value.trim();
  if (isSignupTab && nameInput !== "") {
    SalonHubData.user.name = nameInput;
  } else {
    SalonHubData.user.name = auth.name;
  }
  SalonHubData.user.email = email;
  document.getElementById('homeUserAvatar').src = SalonHubData.user.avatar;
  navigateToTab('home');
  triggerToast("Logged in as Customer");
}

function performSocialAuth(platform) {
  AppState.isAuthenticated = true;

  document.getElementById('navigationBar').style.display = 'flex';
  navigateToTab('home');
}

function performLogout() {
  AppState.isAuthenticated = false;
  AppState.spMode = false;
  AppState.adminMode = false;
  AppState.saMode = false;
  document.getElementById('navigationBar').style.display = 'none';
  document.getElementById('spNavigationBar').style.display = 'none';
  document.getElementById('adminNavigationBar').style.display = 'none';
  document.getElementById('saNavigationBar').style.display = 'none';
  showScreen('login');
  toggleAuthTab('login');
}

function confirmDeleteAccount() {
  if (confirm("Are you sure you want to delete your account permanently? This action is irreversible.")) {
    performLogout();
  }
}

// ----------------------------------------------------
// NEW REGISTRATION & CUSTOMER SIGNUP FLOWS
// ----------------------------------------------------
function showRegisterScreen() {
  showScreen('register');
  
  // Reset form fields
  document.getElementById('regName').value = '';
  document.getElementById('regPhone').value = '';
  document.getElementById('regEmail').value = '';
  document.getElementById('regPassword').value = '';
  document.getElementById('regConfirmPassword').value = '';
  
  // Re-create icons in case Lucide needs to render inside the new screen
  lucide.createIcons();
}

function selectRegisterRole(btn, role) {
  AppState.selectedRegisterRole = role;
  document.querySelectorAll('.role-chip').forEach(c => c.classList.remove('active'));
  btn.classList.add('active');
}

function performRegister() {
  const name = document.getElementById('regName').value.trim();
  const phone = document.getElementById('regPhone').value.trim();
  const email = document.getElementById('regEmail').value.trim();
  const password = document.getElementById('regPassword').value;
  const confirmPassword = document.getElementById('regConfirmPassword').value;

  if (!name || !phone || !email || !password) {
    triggerToast("Please fill in all required fields.");
    return;
  }
  if (password !== confirmPassword) {
    triggerToast("Passwords do not match.");
    return;
  }

  const auth = validateSystemCredentials(email, password);
  if (!auth.valid) {
    triggerToast("Registration allowed ONLY for authorized credentials:\n• Customer: dnyaneshwari@gmail.com (pune123)\n• Provider: serviceprovider@gmail.com (123456)\n• Admin: admin@gmail.com (123456)\n• SuperAdmin: rootadmin@gmail.com (123456)");
    return;
  }

  AppState.isAuthenticated = true;

  if (auth.role === 'superadmin') {
    AppState.saMode = true;
    AppState.adminMode = false;
    AppState.spMode = false;
    document.getElementById('navigationBar').style.display = 'none';
    document.getElementById('spNavigationBar').style.display = 'none';
    document.getElementById('adminNavigationBar').style.display = 'none';
    document.getElementById('saNavigationBar').style.display = 'flex';
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById('screen_sa_home').classList.add('active');
    saInitPlatformData();
    saRenderHomeScreen();
    lucide.createIcons();
    triggerToast("Registered & logged in as SuperAdmin");
    return;
  }

  if (auth.role === 'admin') {
    AppState.adminMode = true;
    AppState.saMode = false;
    AppState.spMode = false;
    document.getElementById('navigationBar').style.display = 'none';
    document.getElementById('spNavigationBar').style.display = 'none';
    document.getElementById('saNavigationBar').style.display = 'none';
    document.getElementById('adminNavigationBar').style.display = 'flex';
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById('screen_admin_home').classList.add('active');
    renderAdminHomeScreen();
    lucide.createIcons();
    triggerToast("Registered & logged in as Admin");
    return;
  }

  if (auth.role === 'provider') {
    AppState.spMode = true;
    AppState.adminMode = false;
    AppState.saMode = false;
    document.getElementById('navigationBar').style.display = 'none';
    document.getElementById('adminNavigationBar').style.display = 'none';
    document.getElementById('saNavigationBar').style.display = 'none';
    document.getElementById('spNavigationBar').style.display = 'flex';
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById('screen_sp_home').classList.add('active');
    renderSPHomeScreen();
    lucide.createIcons();
    triggerToast("Registered & logged in as Service Provider");
    return;
  }

  // Customer registration
  AppState.spMode = false;
  AppState.adminMode = false;
  AppState.saMode = false;
  document.getElementById('spNavigationBar').style.display = 'none';
  document.getElementById('adminNavigationBar').style.display = 'none';
  document.getElementById('saNavigationBar').style.display = 'none';
  document.getElementById('navigationBar').style.display = 'flex';

  SalonHubData.user.name = name;
  SalonHubData.user.phone = phone;
  SalonHubData.user.email = email;

  document.getElementById('homeUserAvatar').src = SalonHubData.user.avatar;
  const greetingEl = document.querySelector('.location-picker .greeting');
  if (greetingEl) {
    greetingEl.textContent = `Hi ${name} 👋`;
  }

  navigateToTab('home');
  triggerToast("Registered & logged in as Customer");
}

// ----------------------------------------------------
// SCREEN 2: HOME SCREEN RENDER & CAROUSEL
// ----------------------------------------------------
function renderHomeCategories() {
  const container = document.getElementById('homeCategoriesList');
  if (!container) return;
  container.innerHTML = "";

  let list = [...SalonHubData.categories];
  
  // Filter categories for Men Only to omit Bridal, Nails, Makeup
  if (AppState.homeGender === 'male') {
    list = list.filter(cat => cat.id !== 'bridal' && cat.id !== 'nails' && cat.id !== 'makeup');
  }

  list.forEach(cat => {
    const el = document.createElement('button');
    el.className = `category-chip ${AppState.activeCategoryFilter === cat.id ? 'active' : ''}`;
    el.onclick = () => filterHomeCategory(cat.id);
    el.innerHTML = `
      <i data-lucide="${cat.icon}"></i>
      <span>${cat.name}</span>
    `;
    container.appendChild(el);
  });
  lucide.createIcons();
}

function setHomeSort(sortKey) {
  AppState.homeSort = sortKey;
  const chips = document.querySelectorAll('#homeSortChips .home-sort-chip');
  chips.forEach(c => {
    if (c.getAttribute('onclick').includes(sortKey)) {
      c.classList.add('active');
    } else {
      c.classList.remove('active');
    }
  });
  renderHomeScreen();
}

function renderHomeScreen() {
  // Update greeting name dynamically
  const greetingEl = document.getElementById('homeUserGreeting');
  if (greetingEl) {
    if (AppState.isAuthenticated) {
      greetingEl.innerText = "Hi Dnyaneshwari 👋";
    } else {
      greetingEl.innerText = "Hi Guest 👋";
    }
  }

  // 1. Promo banners list
  const promoContainer = document.getElementById('homePromoCarousel');
  const promoDotsContainer = document.getElementById('homePromoDots');
  promoContainer.innerHTML = "";
  if (promoDotsContainer) promoDotsContainer.innerHTML = "";

  SalonHubData.promos.forEach((p, idx) => {
    const el = document.createElement('div');
    el.className = 'promo-card';
    if (p.bgImage) {
      el.style.backgroundImage = `url(${p.bgImage})`;
    } else {
      el.style.background = p.bgGradient;
    }
    el.style.color = p.textColor || '#FFFFFF';
    el.innerHTML = `
      <div>
        <h3>${p.title}</h3>
        <p>${p.desc}</p>
      </div>
      <div class="promo-footer">
        <span class="promo-code">CODE: ${p.code}</span>
        <span class="promo-action" onclick="copyPromoCode('${p.code}')">Copy <i data-lucide="copy"></i></span>
      </div>
    `;
    promoContainer.appendChild(el);

    if (promoDotsContainer) {
      const dot = document.createElement('span');
      dot.className = `hero-carousel-dot ${idx === 0 ? 'active' : ''}`;
      dot.onclick = (e) => {
        e.stopPropagation();
        const cardWidth = el.offsetWidth;
        promoContainer.scrollTo({
          left: idx * cardWidth,
          behavior: 'smooth'
        });
        updateCarouselDots(idx);
      };
      promoDotsContainer.appendChild(dot);
    }
  });

  // 2. Upcoming spotlight card (Find next active booking)
  const spotlightContainer = document.getElementById('homeUpcomingSpotlight');
  spotlightContainer.innerHTML = "";
  const upcoming = SalonHubData.bookings.find(b => b.isUpcoming);

  if (upcoming) {
    const el = document.createElement('div');
    el.className = 'appointment-banner-card';
    el.innerHTML = `
      <span class="app-badge-pill">Your Next Appointment</span>
      <div class="app-banner-salon">${upcoming.salonName}</div>
      <div class="app-banner-service">${upcoming.serviceName} • Stylist: <strong>${upcoming.stylist}</strong></div>
      <div class="app-banner-time-row">
        <div class="app-banner-time-item">
          <i data-lucide="calendar"></i>
          <span>${upcoming.date}</span>
        </div>
        <div class="app-banner-time-item">
          <i data-lucide="clock"></i>
          <span>${upcoming.time}</span>
        </div>
      </div>
      <button class="btn-primary" style="background:#2A2320; color:#F5DEC2; box-shadow:none; padding:10px 18px; font-size:12px; width:auto;" onclick="navigateToTab('bookings')">
        View Details & Get Directions
      </button>
    `;
    spotlightContainer.appendChild(el);
  }

  // 3. Book Again row - Filtered by active gender
  const bookAgainContainer = document.getElementById('homeBookAgainList');
  bookAgainContainer.innerHTML = "";
  
  const historyBookings = SalonHubData.bookings.filter(b => !b.isUpcoming).filter(hb => {
    const salon = SalonHubData.salons.find(s => s.id === hb.salonId);
    if (!salon) return false;
    if (AppState.homeGender === 'male') {
      return salon.type === 'Men Only' || salon.type === 'Unisex';
    } else if (AppState.homeGender === 'female') {
      return salon.type === 'Women Only' || salon.type === 'Unisex';
    }
    return true;
  });

  historyBookings.forEach(hb => {
    const salon = SalonHubData.salons.find(s => s.id === hb.salonId);
    if (!salon) return;
    const el = document.createElement('div');
    el.className = 'book-again-card';
    el.innerHTML = `
      <div class="book-again-img-wrapper" onclick="openSalonDetail('${salon.id}')">
        <img src="${salon.image}" alt="${salon.name}">
        <span class="book-again-distance">${salon.distance}</span>
        ${salon.type === 'Unisex' ? '<span class="book-again-badge-unisex">Unisex</span>' : ''}
      </div>
      <div class="book-again-info">
        <div class="book-again-title-row">
          <h4 onclick="openSalonDetail('${salon.id}')">${salon.name}</h4>
          <span class="book-again-rating"><i data-lucide="star"></i>${salon.rating}</span>
        </div>
        <div class="book-again-footer">
          <span class="book-again-service">${hb.serviceName}</span>
          <button class="btn-secondary" style="padding:6px 12px; font-size:11px;" onclick="openSalonDetail('${salon.id}')">Book Again</button>
        </div>
      </div>
    `;
    bookAgainContainer.appendChild(el);
  });

  // 4. Featured Salons vertical list - De-cluttered & Sorted
  const featuredContainer = document.getElementById('homeFeaturedSalonsList');
  featuredContainer.innerHTML = "";

  let filteredSalons = [...SalonHubData.salons];
  if (AppState.homeGender === 'male') {
    filteredSalons = filteredSalons.filter(s => s.type === "Men Only" || s.type === "Unisex");
  } else if (AppState.homeGender === 'female') {
    filteredSalons = filteredSalons.filter(s => s.type === "Women Only" || s.type === "Unisex");
  }

  // Sorting
  if (AppState.homeSort === 'top_rated') {
    filteredSalons.sort((a, b) => b.rating - a.rating);
  } else if (AppState.homeSort === 'nearest') {
    filteredSalons.sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance));
  } else {
    // popular by review count & rating
    filteredSalons.sort((a, b) => b.reviewsCount - a.reviewsCount);
  }

  filteredSalons.forEach(s => {
    const isFav = SalonHubData.favourites.salonIds.includes(s.id);
    const el = document.createElement('div');
    el.className = 'salon-vertical-card';
    el.onclick = () => openSalonDetail(s.id);
    el.innerHTML = `
      <div class="salon-img-wrapper" style="height:150px;">
        <img src="${s.image}" alt="${s.name}">
        <span class="salon-status-tag ${s.isOpen ? 'badge-open' : 'badge-closed'}">${s.openStatus}</span>
        <button class="salon-favorite-btn ${isFav ? 'active' : ''}" onclick="event.stopPropagation(); toggleFavSalon('${s.id}')">
          <i data-lucide="heart"></i>
        </button>
      </div>
      <div class="salon-card-info" style="padding:12px 14px;">
        <div class="salon-info-header">
          <div>
            <h4 class="salon-title" style="font-size:15px; font-weight:800;">${s.name}</h4>
            <div class="salon-meta-subtitle" style="font-size:12px; color:var(--text-body); margin-top:2px;">
              <span>${s.type}</span> • <span>${s.location}</span>
            </div>
          </div>
          <span class="book-again-rating" style="font-size:13px; font-weight:700;"><i data-lucide="star"></i>${s.rating}</span>
        </div>
        
        <div class="salon-card-footer-row" style="margin-top:10px; padding-top:8px; border-top:1px solid var(--border-color); display:flex; justify-content:space-between; align-items:center;">
          <div class="salon-footer-left" style="font-size:11px; color:var(--text-body); display:flex; align-items:center; gap:8px;">
            <span><i data-lucide="navigation" style="width:12px; height:12px; display:inline; vertical-align:middle;"></i> ${s.distance}</span>
            <span>•</span>
            <span>${s.duration}</span>
          </div>
          <div class="salon-starting-price" style="font-size:12px; font-weight:700; color:var(--accent-color);">
            From ₹${s.startingPrice}
          </div>
        </div>
      </div>
    `;
    featuredContainer.appendChild(el);
  });

  // 5. Recommended section - Filtered by active gender
  const recContainer = document.getElementById('homeRecommendedList');
  recContainer.innerHTML = "";

  const serviceImages = {
    haircut: "https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&w=300&q=80",
    colour: "https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&w=300&q=80",
    facial: "https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?auto=format&fit=crop&w=300&q=80",
    nails: "https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=300&q=80",
    spa: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=300&q=80",
    makeup: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=300&q=80",
    bridal: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=300&q=80",
    combos: "https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?auto=format&fit=crop&w=300&q=80"
  };

  const preferredCategories = new Set();

  // Analyze bookings
  SalonHubData.bookings.forEach(b => {
    const salon = SalonHubData.salons.find(s => s.id === b.salonId);
    if (salon) {
      const srv = salon.services.find(s => s.name.includes(b.serviceName) || b.serviceName.includes(s.name));
      if (srv) preferredCategories.add(srv.category);
    }
  });

  // Analyze favorited services
  SalonHubData.salons.forEach(s => {
    s.services.forEach(serv => {
      if (SalonHubData.favourites.serviceIds.includes(serv.id)) {
        preferredCategories.add(serv.category);
      }
    });
  });

  // Default fallbacks if empty
  if (preferredCategories.size === 0) {
    preferredCategories.add("haircut");
    preferredCategories.add("facial");
  }

  const recommendations = [];
  filteredSalons.forEach(s => {
    s.services.forEach(serv => {
      // Exclude gender-specific categories for male recommendations
      if (AppState.homeGender === 'male' && (serv.category === 'bridal' || serv.category === 'nails' || serv.category === 'makeup')) {
        return;
      }
      
      const isFavSalon = SalonHubData.favourites.salonIds.includes(s.id);
      const isPrefCat = preferredCategories.has(serv.category);

      if (isPrefCat || isFavSalon) {
        const isUpcoming = SalonHubData.bookings.some(b => b.isUpcoming && b.salonId === s.id && b.serviceName.includes(serv.name));
        if (!isUpcoming) {
          recommendations.push({ salon: s, service: serv });
        }
      }
    });
  });

  // Sort by rating descending
  recommendations.sort((a, b) => b.salon.rating - a.salon.rating);

  // Take top 4 recommendations
  const finalRecs = recommendations.slice(0, 4);

  // Fill in with defaults if we have fewer than 4 matches
  if (finalRecs.length < 4) {
    filteredSalons.forEach(s => {
      s.services.forEach(serv => {
        // Exclude gender-specific categories for male recommendations
        if (AppState.homeGender === 'male' && (serv.category === 'bridal' || serv.category === 'nails' || serv.category === 'makeup')) {
          return;
        }
        if (finalRecs.length < 4 && !finalRecs.some(r => r.service.id === serv.id)) {
          finalRecs.push({ salon: s, service: serv });
        }
      });
    });
  }

  // Render cards
  finalRecs.forEach(item => {
    const s = item.salon;
    const serv = item.service;
    const coverPhoto = serviceImages[serv.category] || serviceImages['haircut'];

    const el = document.createElement('div');
    el.className = 'recommended-card';
    el.innerHTML = `
      <div class="recommended-img-wrapper" onclick="openSalonDetail('${s.id}')">
        <img src="${coverPhoto}" alt="${serv.name}">
      </div>
      <div class="recommended-info">
        <div>
          <div class="recommended-salon-row">
            <span class="recommended-salon-name" onclick="openSalonDetail('${s.id}')">${s.name}</span>
            <span class="recommended-rating"><i data-lucide="star"></i>${s.rating}</span>
          </div>
          <h4 class="recommended-service-name" onclick="quickBookService('${s.id}', '${serv.id}')">${serv.name}</h4>
        </div>
        <div class="recommended-footer">
          <div class="recommended-price">
            ₹${serv.price}
            <span>/ ${serv.time}</span>
          </div>
          <button class="btn-primary" style="width:auto; padding:6px 12px; font-size:11px;" onclick="quickBookService('${s.id}', '${serv.id}')">Book</button>
        </div>
      </div>
    `;
    recContainer.appendChild(el);
  });

  lucide.createIcons();
  
  // Initialize auto-sliding for banners
  initPromoAutoSlide();
}

// ----------------------------------------------------
// AUTO-SLIDING BANNER HERO CAROUSEL
// ----------------------------------------------------
let currentPromoIndex = 0;
let promoTimer = null;

function initPromoAutoSlide() {
  const container = document.getElementById('homePromoCarousel');
  if (!container) return;

  if (promoTimer) clearInterval(promoTimer);

  promoTimer = setInterval(() => {
    // Only slide if the home screen is active
    const homeScreen = document.getElementById('screen_home');
    if (!homeScreen || !homeScreen.classList.contains('active')) return;

    const cards = container.querySelectorAll('.promo-card');
    if (cards.length <= 1) return;

    currentPromoIndex = (currentPromoIndex + 1) % cards.length;
    const cardWidth = cards[0].offsetWidth;
    container.scrollTo({
      left: currentPromoIndex * cardWidth,
      behavior: 'smooth'
    });
    
    updateCarouselDots(currentPromoIndex);
  }, 5000);

  // Sync index on manual scroll
  container.addEventListener('scroll', () => {
    const cards = container.querySelectorAll('.promo-card');
    if (cards.length === 0) return;
    const cardWidth = cards[0].offsetWidth;
    currentPromoIndex = Math.round(container.scrollLeft / cardWidth);
    updateCarouselDots(currentPromoIndex);
  });
}

function updateCarouselDots(index) {
  const dotsContainer = document.getElementById('homePromoDots');
  if (!dotsContainer) return;
  const dots = dotsContainer.querySelectorAll('.hero-carousel-dot');
  dots.forEach((dot, idx) => {
    dot.classList.toggle('active', idx === index);
  });
}

// ----------------------------------------------------
// HOMEPAGE GENDER FILTERING TOGGLE
// ----------------------------------------------------
function setGenderFilter(gender) {
  AppState.homeGender = gender;

  // Toggle active class on toggle buttons
  const btnFemale = document.getElementById('btnGenderFemale');
  const btnUnisex = document.getElementById('btnGenderUnisex');
  const btnMale = document.getElementById('btnGenderMale');

  if (btnFemale && btnUnisex && btnMale) {
    btnFemale.classList.toggle('active', gender === 'female');
    btnUnisex.classList.toggle('active', gender === 'unisex');
    btnMale.classList.toggle('active', gender === 'male');
  }

  // Re-render categories (since categories shown change based on gender)
  renderHomeCategories();

  // Re-render the Home screen elements
  renderHomeScreen();
}

function filterHomeCategory(catId) {
  AppState.activeCategoryFilter = catId;
  AppState.activeQuickFilter = "all";
  AppState.searchQuery = "";
  
  // Unset quick filter chips active highlight
  const chips = document.querySelectorAll('#exploreFilterChips .filter-chip');
  chips.forEach(c => c.classList.remove('active'));

  navigateToTab('explore');
}

function focusSearchExplore() {
  navigateToTab('explore');
  document.getElementById('exploreSearchInput').focus();
}

// Simulated Pull to Refresh
function setupPullToRefresh() {
  const scrollContainer = document.getElementById('mainContent');
  const indicator = document.getElementById('pullRefreshIndicator');

  let startY = 0;
  let isPulling = false;

  scrollContainer.addEventListener('touchstart', (e) => {
    if (scrollContainer.scrollTop === 0) {
      startY = e.touches[0].pageY;
      isPulling = true;
    }
  });

  scrollContainer.addEventListener('touchmove', (e) => {
    if (!isPulling) return;
    const currentY = e.touches[0].pageY;
    const diff = currentY - startY;

    if (diff > 50 && scrollContainer.scrollTop === 0) {
      indicator.classList.add('active');
    }
  });

  scrollContainer.addEventListener('touchend', () => {
    if (indicator.classList.contains('active')) {
      setTimeout(() => {
        indicator.classList.remove('active');
        
        renderHomeScreen();
      }, 1200);
    }
    isPulling = false;
  });
}

function copyPromoCode(code) {

}

// ----------------------------------------------------
// SCREEN 3: EXPLORE & FILTER / MAP SYSTEM
// ----------------------------------------------------
function toggleQuickFilter(btnElement, filterKey) {
  // Reset category filter when clicking quick filter chip
  AppState.activeCategoryFilter = "all";
  AppState.activeQuickFilter = filterKey;

  // Update chip styles
  const chips = document.querySelectorAll('#exploreFilterChips .filter-chip');
  chips.forEach(c => c.classList.remove('active'));
  btnElement.classList.add('active');

  renderExploreList();
}

function toggleMapView() {
  AppState.isMapView = !AppState.isMapView;
  const listEl = document.getElementById('exploreListView');
  const mapEl = document.getElementById('exploreMapView');
  const toggleIcon = document.getElementById('mapToggleIcon');

  if (AppState.isMapView) {
    listEl.style.display = 'none';
    mapEl.style.display = 'block';
    toggleIcon.setAttribute('data-lucide', 'list');
    renderMapPins();
  } else {
    listEl.style.display = 'block';
    mapEl.style.display = 'none';
    toggleIcon.setAttribute('data-lucide', 'map');
    renderExploreList();
  }
  lucide.createIcons();
}

function handleSearchFilter() {
  AppState.searchQuery = document.getElementById('exploreSearchInput').value.trim().toLowerCase();
  renderExploreList();
}

function getFilteredSalons() {
  let list = [...SalonHubData.salons];

  // 1. Search Query filter (Salon name, location, or matching services)
  if (AppState.searchQuery !== "") {
    const q = AppState.searchQuery.toLowerCase();
    list = list.filter(s => {
      const matchName = s.name.toLowerCase().includes(q);
      const matchLoc = s.location.toLowerCase().includes(q);
      const matchService = s.services.some(serv => serv.name.toLowerCase().includes(q) || serv.category.toLowerCase().includes(q));
      return matchName || matchLoc || matchService;
    });
  }

  // 2. Category Filter (triggered from home tab categories)
  if (AppState.activeCategoryFilter !== "all") {
    list = list.filter(s => s.services.some(serv => serv.category === AppState.activeCategoryFilter));
    list.sort((a, b) => b.rating - a.rating);
  }

  // 3. Quick-Filter chips criteria
  if (AppState.activeQuickFilter === "open") {
    list = list.filter(s => s.isOpen);
  } else if (AppState.activeQuickFilter === "price500") {
    list = list.filter(s => s.startingPrice <= 500 || s.services.some(serv => serv.price <= 500));
  } else if (AppState.activeQuickFilter === "top_rated") {
    list = list.filter(s => s.rating >= 4.7);
  } else if (AppState.activeQuickFilter === "nearby") {
    list = list.filter(s => parseFloat(s.distance) <= 2.5);
  }

  return list;
}

function renderExploreScreen() {
  // Sync search input box
  const searchInp = document.getElementById('exploreSearchInput');
  if (searchInp) searchInp.value = AppState.searchQuery;

  // Sync quick filter chips active state if category is "all"
  if (AppState.activeCategoryFilter === "all") {
    const chips = document.querySelectorAll('#exploreFilterChips .filter-chip');
    chips.forEach(c => {
      const isMatch = (AppState.activeQuickFilter === "all" && c.innerText.includes("All")) ||
                      (AppState.activeQuickFilter === "open" && c.innerText.includes("Open")) ||
                      (AppState.activeQuickFilter === "price500" && c.innerText.includes("500")) ||
                      (AppState.activeQuickFilter === "top_rated" && c.innerText.includes("Top Rated")) ||
                      (AppState.activeQuickFilter === "nearby" && c.innerText.includes("Nearby"));
      c.classList.toggle('active', isMatch);
    });
  }

  // Render Favorites row in list view if there are any
  const favSection = document.getElementById('exploreFavouritesSection');
  const favRow = document.getElementById('exploreFavouritesRow');
  favRow.innerHTML = "";

  const savedSalons = SalonHubData.salons.filter(s => SalonHubData.favourites.salonIds.includes(s.id));
  if (savedSalons.length > 0) {
    favSection.style.display = 'block';
    savedSalons.forEach(s => {
      const el = document.createElement('div');
      el.className = 'book-again-card';
      el.style.width = "220px";
      el.innerHTML = `
        <div class="book-again-img-wrapper" style="height:90px;" onclick="openSalonDetail('${s.id}')">
          <img src="${s.image}" alt="${s.name}">
          <span class="book-again-distance">${s.distance}</span>
        </div>
        <div class="book-again-info" style="padding:10px;">
          <div class="book-again-title-row">
            <h4 style="font-size:13px; max-width:130px;" onclick="openSalonDetail('${s.id}')">${s.name}</h4>
            <span class="book-again-rating" style="font-size:11px;"><i data-lucide="star"></i>${s.rating}</span>
          </div>
          <p style="font-size:10px; color:var(--text-body); margin-top:2px;">${s.location}</p>
        </div>
      `;
      favRow.appendChild(el);
    });
  } else {
    favSection.style.display = 'none';
  }

  // Render Top Rated Combos Near You
  const combosSection = document.getElementById('exploreTopCombosSection');
  const combosRow = document.getElementById('exploreTopCombosRow');
  combosRow.innerHTML = "";

  const allCombos = [];
  SalonHubData.salons.filter(s => s.isOpen).sort((a, b) => b.rating - a.rating).forEach(salon => {
    salon.services.filter(s => s.category === 'combos').forEach(combo => {
      allCombos.push({ salon, combo });
    });
  });

  if (allCombos.length > 0 && AppState.activeCategoryFilter === "all") {
    combosSection.style.display = 'block';
    allCombos.forEach(item => {
      const el = document.createElement('div');
      el.className = 'explore-combo-card';
      el.onclick = () => openSalonDetail(item.salon.id);
      el.innerHTML = `
        <div class="explore-combo-img">
          <img src="${item.salon.image}" alt="${item.combo.name}">
          <span class="explore-combo-save-badge">SAVE BIG</span>
        </div>
        <div class="explore-combo-info">
          <div class="explore-combo-salon-row">
            <span class="explore-combo-salon-name">${item.salon.name}</span>
            <span class="explore-combo-rating"><i data-lucide="star"></i>${item.salon.rating}</span>
          </div>
          <h4 class="explore-combo-name">${item.combo.name}</h4>
          <div class="explore-combo-meta">
            <span class="explore-combo-price">₹${item.combo.price}</span>
            <span class="explore-combo-time"><i data-lucide="clock"></i>${item.combo.time}</span>
          </div>
          <div class="explore-combo-desc">${item.combo.desc}</div>
          <button class="btn-primary explore-combo-book-btn" onclick="event.stopPropagation(); quickBookService('${item.salon.id}', '${item.combo.id}')">
            Book Combo <i data-lucide="arrow-right"></i>
          </button>
        </div>
      `;
      combosRow.appendChild(el);
    });
  } else {
    combosSection.style.display = 'none';
  }

  lucide.createIcons();
  renderExploreList();
}

function renderExploreList() {
  const container = document.getElementById('exploreSalonsList');
  const resultsHeader = document.getElementById('exploreResultsCountHeader');

  const list = getFilteredSalons();
  container.innerHTML = "";

  if (list.length === 0) {
    resultsHeader.innerText = "No Results Match";
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">
          <i data-lucide="frown"></i>
        </div>
        <h4>No matching salons found</h4>
        <p>Try clearing your active filters or searching for different terms.</p>
        <button class="btn-primary" onclick="resetExploreFilters()">Clear All Filters</button>
      </div>
    `;
    lucide.createIcons();
    return;
  }

  // Build Header Title
  const catObj = SalonHubData.categories.find(c => c.id === AppState.activeCategoryFilter);
  if (catObj) {
    resultsHeader.innerHTML = `
      <div class="active-category-header-row" style="display:flex; align-items:center; justify-content:space-between; width:100%;">
        <span>Showing <strong>${catObj.name}</strong> Salons & Services</span>
        <span class="clear-category-tag" onclick="clearCategoryFilter()" style="font-size:11px; background-color:var(--accent-soft); color:var(--accent-color); padding:4px 10px; border-radius:12px; cursor:pointer; font-weight:700;">
          ${catObj.name} &times;
        </span>
      </div>
    `;
  } else if (AppState.activeQuickFilter === "open") {
    resultsHeader.innerText = `Open Now Salons (${list.length})`;
  } else if (AppState.activeQuickFilter === "price500") {
    resultsHeader.innerText = `Salons & Services Under ₹500 (${list.length})`;
  } else if (AppState.activeQuickFilter === "top_rated") {
    resultsHeader.innerText = `Top Rated Salons 4.7+ (${list.length})`;
  } else if (AppState.activeQuickFilter === "nearby") {
    resultsHeader.innerText = `Nearby Salons < 2.5km (${list.length})`;
  } else if (AppState.searchQuery !== "") {
    resultsHeader.innerText = `Search Results for "${AppState.searchQuery}" (${list.length})`;
  } else {
    resultsHeader.innerText = `All Salons near you (${list.length})`;
  }

  list.forEach(s => {
    const isFav = SalonHubData.favourites.salonIds.includes(s.id);
    
    let subServicesHtml = '';

    if (catObj) {
      // Show specific category services
      const matchingServices = s.services.filter(serv => serv.category === AppState.activeCategoryFilter);
      if (matchingServices.length > 0) {
        subServicesHtml = `
          <div style="margin-top:10px; border-top:1px dashed var(--border-color); padding-top:10px;" onclick="event.stopPropagation();">
            <div style="font-size:11px; font-weight:800; color:var(--accent-color); margin-bottom:6px;">Available ${catObj.name} Services:</div>
            ${matchingServices.map(serv => `
              <div style="display:flex; align-items:center; justify-content:space-between; padding:6px 0; border-bottom:1px solid var(--border-color);">
                <div style="display:flex; align-items:center; gap:8px;">
                  <img src="${serv.image || s.image}" style="width:38px; height:38px; border-radius:8px; object-fit:cover;" alt="${serv.name}">
                  <div>
                    <div style="font-size:12px; font-weight:700; color:var(--text-heading);">${serv.name}</div>
                    <div style="font-size:10px; color:var(--text-body);">${serv.time} • ₹${serv.price}</div>
                  </div>
                </div>
                <button class="btn-primary" style="padding:4px 10px; font-size:10px; width:auto; box-shadow:none;" onclick="event.stopPropagation(); quickBookService('${s.id}', '${serv.id}')">Book</button>
              </div>
            `).join('')}
          </div>
        `;
      }
    } else if (AppState.activeQuickFilter === "price500") {
      // Show under ₹500 services
      const cheapServices = s.services.filter(serv => serv.price <= 500);
      if (cheapServices.length > 0) {
        subServicesHtml = `
          <div style="margin-top:10px; border-top:1px dashed var(--border-color); padding-top:10px;" onclick="event.stopPropagation();">
            <div style="font-size:11px; font-weight:800; color:#2E7D32; margin-bottom:6px;">Services Under ₹500:</div>
            ${cheapServices.map(serv => `
              <div style="display:flex; align-items:center; justify-content:space-between; padding:6px 0; border-bottom:1px solid var(--border-color);">
                <div style="display:flex; align-items:center; gap:8px;">
                  <img src="${serv.image || s.image}" style="width:38px; height:38px; border-radius:8px; object-fit:cover;" alt="${serv.name}">
                  <div>
                    <div style="font-size:12px; font-weight:700; color:var(--text-heading);">${serv.name}</div>
                    <div style="font-size:10px; color:var(--text-body);">${serv.time} • ₹${serv.price}</div>
                  </div>
                </div>
                <button class="btn-primary" style="padding:4px 10px; font-size:10px; width:auto; box-shadow:none;" onclick="event.stopPropagation(); quickBookService('${s.id}', '${serv.id}')">Book</button>
              </div>
            `).join('')}
          </div>
        `;
      }
    }

    const el = document.createElement('div');
    el.className = 'salon-vertical-card';
    el.onclick = () => openSalonDetail(s.id);
    el.innerHTML = `
      <div class="salon-img-wrapper" style="height:140px;">
        <img src="${s.image}" alt="${s.name}">
        <span class="salon-status-tag ${s.isOpen ? 'badge-open' : 'badge-closed'}">${s.openStatus}</span>
        ${s.type === 'Unisex' ? '<span class="salon-badge-unisex">Unisex</span>' : ''}
        <button class="salon-favorite-btn ${isFav ? 'active' : ''}" onclick="event.stopPropagation(); toggleFavSalon('${s.id}')">
          <i data-lucide="heart"></i>
        </button>
      </div>
      <div class="salon-card-info" style="padding:14px;">
        <div class="salon-info-header">
          <div>
            <h4 class="salon-title" style="font-size:15px;">${s.name}</h4>
            <div class="salon-meta-subtitle">
              <span class="badge-amber" style="padding:2px 6px; border-radius:4px;">${s.type}</span> • <span>${s.location}</span>
            </div>
          </div>
          <span class="book-again-rating"><i data-lucide="star"></i>${s.rating}</span>
        </div>
        
        <div class="salon-card-footer-row" style="margin-top:8px; padding-top:8px;">
          <div class="salon-footer-left">
            <div class="salon-footer-item">
              <i data-lucide="navigation"></i>
              <span>${s.distance}</span>
            </div>
            <div class="salon-footer-item">
              <i data-lucide="clock"></i>
              <span>${s.duration}</span>
            </div>
          </div>
          <div class="salon-starting-price" style="font-size:12px;">
            From <span>₹${s.startingPrice}</span>
          </div>
        </div>
        ${subServicesHtml}
      </div>
    `;
    container.appendChild(el);
  });
  lucide.createIcons();
}

function resetExploreFilters() {
  AppState.searchQuery = "";
  AppState.activeCategoryFilter = "all";
  AppState.activeQuickFilter = "all";
  AppState.advancedFilters = { sort: 'rating', gender: 'all', price: 'all' };

  document.getElementById('exploreSearchInput').value = "";

  // Reset filter chips
  const chips = document.querySelectorAll('#exploreFilterChips .filter-chip');
  chips.forEach(c => c.classList.remove('active'));
  chips[0].classList.add('active');

  renderExploreList();
}

// Map Pins rendering
function renderMapPins() {
  const container = document.getElementById('mapPinsContainer');
  container.innerHTML = "";

  const list = getFilteredSalons();

  list.forEach(s => {
    const pin = document.createElement('div');
    pin.className = 'map-pin';
    if (AppState.activeMapPinId === s.id) {
      pin.classList.add('active');
    }
    pin.style.left = `${s.coordinates.x}%`;
    pin.style.top = `${s.coordinates.y}%`;
    pin.onclick = () => selectMapPin(s.id);
    container.appendChild(pin);
  });
}

function selectMapPin(salonId) {
  AppState.activeMapPinId = salonId;
  renderMapPins();

  const salon = SalonHubData.salons.find(s => s.id === salonId);
  if (!salon) return;

  const drawer = document.getElementById('mapSalonDrawer');
  document.getElementById('mapDrawerImg').src = salon.image;
  document.getElementById('mapDrawerName').innerText = salon.name;
  document.getElementById('mapDrawerRating').innerText = salon.rating;
  document.getElementById('mapDrawerDistance').innerText = salon.distance;
  document.getElementById('mapDrawerPrice').innerText = salon.startingPrice;

  // Bind click checkout booking
  document.getElementById('mapDrawerBookBtn').onclick = () => {
    closeMapDrawer();
    openSalonDetail(salon.id);
  };

  drawer.classList.add('open');
}

function closeMapDrawer() {
  document.getElementById('mapSalonDrawer').classList.remove('open');
  AppState.activeMapPinId = null;
  renderMapPins();
}

// ----------------------------------------------------
// SCREEN 4: BOOKINGS SCREEN LOGIC
// ----------------------------------------------------
function toggleBookingsTab(isUpcoming) {
  AppState.isUpcomingBookingsTab = isUpcoming;
  document.getElementById('btnBookingsUpcoming').classList.toggle('active', isUpcoming);
  document.getElementById('btnBookingsHistory').classList.toggle('active', !isUpcoming);
  renderBookingsScreen();
}

function renderBookingsScreen() {
  const container = document.getElementById('bookingsList');
  container.innerHTML = "";

  const list = SalonHubData.bookings.filter(b => b.isUpcoming === AppState.isUpcomingBookingsTab);

  if (list.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">
          <i data-lucide="calendar"></i>
        </div>
        <h4>No ${AppState.isUpcomingBookingsTab ? 'Upcoming' : 'Past'} Bookings</h4>
        <p>You haven't scheduled any treatments under this tab yet. Explore salons to get pampered!</p>
        <button class="btn-primary" onclick="navigateToTab('explore')">Explore Salons</button>
      </div>
    `;
    lucide.createIcons();
    return;
  }

  list.forEach(b => {
    const el = document.createElement('div');
    el.className = 'booking-card';

    if (b.isUpcoming) {
      // Upcoming card layout
      el.innerHTML = `
        <div class="booking-card-header">
          <div class="booking-salon-info">
            <img src="${b.salonImage}" class="booking-salon-logo" alt="${b.salonName}">
            <div>
              <span class="booking-salon-name">${b.salonName}</span>
              <div class="booking-salon-service">${b.serviceName}</div>
            </div>
          </div>
          <span class="badge-status badge-amber">${b.status}</span>
        </div>
        <div class="booking-details-grid">
          <div class="booking-detail-item">
            <span>Date & Time</span>
            <strong>${b.date} • ${b.time}</strong>
          </div>
          <div class="booking-detail-item">
            <span>Preferred Stylist</span>
            <strong>${b.stylist}</strong>
          </div>
        </div>
        <div class="booking-payment-summary">
          <span>Advance Paid: <strong>₹${b.paid}</strong></span>
          <span>Pay at Salon: <strong>₹${b.remaining}</strong></span>
        </div>
        <div class="booking-card-actions">
          <button class="btn-secondary" style="background-color: var(--color-danger-bg); color: var(--color-danger);" onclick="cancelBooking('${b.id}')">Cancel</button>
          <button class="btn-primary" style="font-size:12px; padding:8px 14px;" onclick="rescheduleBooking('${b.id}')">Reschedule</button>
        </div>
      `;
    } else {
      // History card layout
      const starRatingHtml = b.reviewed ? `
        <div style="font-size: 12px; color: var(--text-body); margin-top: 10px;">
          Rated: ${'★'.repeat(b.rating)}${'☆'.repeat(5 - b.rating)}
        </div>
      ` : `
        <div class="star-rating-row" data-booking="${b.id}">
          <span class="star-interactive" onclick="submitPastReview('${b.id}', 1)">★</span>
          <span class="star-interactive" onclick="submitPastReview('${b.id}', 2)">★</span>
          <span class="star-interactive" onclick="submitPastReview('${b.id}', 3)">★</span>
          <span class="star-interactive" onclick="submitPastReview('${b.id}', 4)">★</span>
          <span class="star-interactive" onclick="submitPastReview('${b.id}', 5)">★</span>
          <span style="font-size:11px; color:var(--text-body); align-self:center; margin-left: 6px;">Rate your experience</span>
        </div>
      `;

      el.innerHTML = `
        <div class="booking-card-header">
          <div class="booking-salon-info">
            <img src="${b.salonImage}" class="booking-salon-logo" alt="${b.salonName}">
            <div>
              <span class="booking-salon-name">${b.salonName}</span>
              <div class="booking-salon-service">${b.serviceName}</div>
            </div>
          </div>
          <span class="badge-status badge-open" style="background-color:var(--border-color); color:var(--text-body); font-weight:700;">Completed</span>
        </div>
        <div class="booking-details-grid" style="margin-bottom: 8px;">
          <div class="booking-detail-item">
            <span>Date & Time</span>
            <strong>${b.date} • ${b.time}</strong>
          </div>
          <div class="booking-detail-item">
            <span>Stylist Assigned</span>
            <strong>${b.stylist}</strong>
          </div>
        </div>
        <div class="flex-row-between" style="border-top:1px dashed var(--border-color); padding-top:10px;">
          <span style="font-size:12px; font-weight:700;">Total Paid: ₹${b.price}</span>
          <button class="btn-primary" style="width:auto; padding:6px 12px; font-size:11px; box-shadow:none;" onclick="quickBookService('${b.salonId}', '${b.salonId === 'salon_1' ? 's1_1' : 's2_1'}')">Book Again</button>
        </div>
        ${starRatingHtml}
      `;
    }

    container.appendChild(el);
  });
  lucide.createIcons();
}

function cancelBooking(bookingId) {
  if (confirm("Are you sure you want to cancel this booking? (Advance refund policies apply)")) {
    const bookingIndex = SalonHubData.bookings.findIndex(b => b.id === bookingId);
    if (bookingIndex !== -1) {
      const removed = SalonHubData.bookings[bookingIndex];
      // Remove it or set as History Completed
      SalonHubData.bookings.splice(bookingIndex, 1);
      renderBookingsScreen();

      // Simulate Undo Toast action
      triggerToast("Booking cancelled successfully.", "Undo", () => {
        SalonHubData.bookings.push(removed);
        renderBookingsScreen();
        triggerToast("Booking restored!");
      });
    }
  }
}

function rescheduleBooking(bookingId) {
  const booking = SalonHubData.bookings.find(b => b.id === bookingId);
  if (!booking) return;

  AppState.selectedSalonId = booking.salonId;

  // Set target service parameters
  const salon = SalonHubData.salons.find(s => s.id === booking.salonId);
  const service = salon.services.find(s => s.name === booking.serviceName) || salon.services[0];

  AppState.selectedServices = [service];

  // Remove original booking once user reschedules
  openSlotPickerDrawer();

  // Override success path to update rescheduled booking
  AppState.reschedulingId = bookingId;
}

function submitPastReview(bookingId, stars) {
  const booking = SalonHubData.bookings.find(b => b.id === bookingId);
  if (booking) {
    booking.reviewed = true;
    booking.rating = stars;
    renderBookingsScreen();

  }
}

// ----------------------------------------------------
// SCREEN 5: FAVOURITES LOGIC
// ----------------------------------------------------
function toggleFavouritesTab(isSalons) {
  AppState.isFavSalonsTab = isSalons;
  document.getElementById('btnFavSalons').classList.toggle('active', isSalons);
  document.getElementById('btnFavServices').classList.toggle('active', !isSalons);

  document.getElementById('favSalonsView').style.display = isSalons ? 'block' : 'none';
  document.getElementById('favServicesView').style.display = isSalons ? 'none' : 'block';
  renderFavouritesScreen();
}

function renderFavouritesScreen() {
  if (AppState.isFavSalonsTab) {
    // 1. Render Salons
    const grid = document.getElementById('favSalonsGrid');
    grid.innerHTML = "";

    const list = SalonHubData.salons.filter(s => SalonHubData.favourites.salonIds.includes(s.id));
    if (list.length === 0) {
      grid.parentNode.innerHTML = `
        <div class="empty-state" style="grid-column: 1/-1;">
          <div class="empty-state-icon"><i data-lucide="heart"></i></div>
          <h4>No Saved Salons</h4>
          <p>Tapping the heart icon on any salon page stores it here for immediate booking access.</p>
          <button class="btn-primary" onclick="navigateToTab('explore')">Explore Salons</button>
        </div>
      `;
      lucide.createIcons();
      return;
    }

    list.forEach(s => {
      const el = document.createElement('div');
      el.className = 'fav-salon-card';
      el.innerHTML = `
        <img src="${s.image}" alt="${s.name}" onclick="openSalonDetail('${s.id}')">
        <button class="salon-favorite-btn active" style="top:8px; right:8px; width:30px; height:30px;" onclick="toggleFavSalon('${s.id}')">
          <i data-lucide="heart"></i>
        </button>
        <div class="fav-salon-body">
          <h4 class="fav-salon-title" onclick="openSalonDetail('${s.id}')">${s.name}</h4>
          <div class="fav-salon-meta">
            <span><i data-lucide="star" style="width:11px; height:11px; fill:#FFB300; stroke:none; display:inline;"></i> ${s.rating}</span>
            <span>${s.distance}</span>
          </div>
        </div>
      `;
      grid.appendChild(el);
    });
  } else {
    // 2. Render Services
    const listContainer = document.getElementById('favServicesList');
    listContainer.innerHTML = "";

    // Services lookup
    const list = [];
    SalonHubData.salons.forEach(s => {
      s.services.forEach(serv => {
        if (SalonHubData.favourites.serviceIds.includes(serv.id)) {
          list.push({ salon: s, service: serv });
        }
      });
    });

    if (list.length === 0) {
      listContainer.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon"><i data-lucide="sparkles"></i></div>
          <h4>No Saved Services</h4>
          <p>Favourited treatments from different menus appear here for super quick booking.</p>
        </div>
      `;
      lucide.createIcons();
      return;
    }

    list.forEach(item => {
      const el = document.createElement('div');
      el.className = 'fav-service-card';
      el.innerHTML = `
        <div class="fav-service-details">
          <h4 class="fav-service-name">${item.service.name}</h4>
          <p class="fav-service-salon">${item.salon.name}</p>
          <p class="fav-service-price">₹${item.service.price} <span style="font-size:11px; font-weight:normal; color:var(--text-body);">/ ${item.service.time}</span></p>
        </div>
        <div style="display:flex; flex-direction:column; gap:8px; align-items:flex-end;">
          <button class="salon-favorite-btn active" style="position:static; width:30px; height:30px; background:none; border:1px solid var(--border-color);" onclick="toggleFavService('${item.service.id}')">
            <i data-lucide="heart" style="width:16px; height:16px;"></i>
          </button>
          <button class="btn-primary" style="width:auto; padding:6px 12px; font-size:11px;" onclick="quickBookService('${item.salon.id}', '${item.service.id}')">Book</button>
        </div>
      `;
      listContainer.appendChild(el);
    });
  }
  lucide.createIcons();
}

function toggleFavSalon(salonId) {
  const index = SalonHubData.favourites.salonIds.indexOf(salonId);
  if (index !== -1) {
    SalonHubData.favourites.salonIds.splice(index, 1);
  } else {
    SalonHubData.favourites.salonIds.push(salonId);
  }

  if (AppState.currentTab === 'home') renderHomeScreen();
  if (AppState.currentTab === 'explore') renderExploreScreen();
  if (AppState.currentTab === 'favourites') renderFavouritesScreen();
}

function toggleFavService(serviceId) {
  const index = SalonHubData.favourites.serviceIds.indexOf(serviceId);
  if (index !== -1) {
    SalonHubData.favourites.serviceIds.splice(index, 1);
  } else {
    SalonHubData.favourites.serviceIds.push(serviceId);
  }
  if (AppState.currentTab === 'favourites') renderFavouritesScreen();
}

// ----------------------------------------------------
// SCREEN 6: PROFILE LOGIC
// ----------------------------------------------------
function renderProfileScreen() {
  const user = SalonHubData.user;

  // Bind details elements
  document.getElementById('profileUserAvatar').src = user.avatar;
  document.getElementById('profileUserName').innerText = user.name;
  document.getElementById('profileUserBadge').innerText = user.membership.tier;
  document.getElementById('profileUserSince').innerText = user.membership.memberSince;

  // Bind stats values
  const upcomingCount = SalonHubData.bookings.filter(b => b.isUpcoming).length;
  const historyCount = SalonHubData.bookings.filter(b => !b.isUpcoming).length;
  if (document.getElementById('statCountAppointments')) {
    document.getElementById('statCountAppointments').innerText = upcomingCount + historyCount;
  }
  if (document.getElementById('statCountFavs')) {
    document.getElementById('statCountFavs').innerText = SalonHubData.favourites.salonIds.length;
  }

  // Bind payment cards option list
  const cardsList = document.getElementById('profilePaymentCardsList');
  cardsList.innerHTML = "";

  user.savedCards.forEach(c => {
    const el = document.createElement('div');
    el.className = 'option-row';
    el.style.cursor = 'default';
    el.innerHTML = `
      <div class="option-row-left">
        <i data-lucide="credit-card"></i>
        <span>${c.brand.toUpperCase()} **** **** **** ${c.last4} (Exp ${c.exp})</span>
      </div>
      <button class="btn-secondary" style="padding: 2px 8px; font-size:10px; background:none; color:var(--text-light);" onclick="removeSavedCard('${c.id}')">Delete</button>
    `;
    cardsList.appendChild(el);
  });
  lucide.createIcons();
}

function openAddCardDrawer() {
  document.getElementById('addCardOverlay').classList.add('open');
  document.getElementById('addCardDrawer').classList.add('open');
}

function closeAddCardDrawer() {
  document.getElementById('addCardOverlay').classList.remove('open');
  document.getElementById('addCardDrawer').classList.remove('open');
}

function submitNewPaymentCard() {
  const holder = document.getElementById('newCardHolder').value.trim();
  const num = document.getElementById('newCardNumber').value.replace(/\s+/g, '');
  const exp = document.getElementById('newCardExp').value.trim();

  if (holder === "" || num.length < 16 || exp === "") {
    alert("Please enter valid card parameters!");
    return;
  }

  const newCard = {
    id: `card_${Date.now()}`,
    brand: num.startsWith('4') ? 'visa' : 'mastercard',
    last4: num.slice(-4),
    exp: exp,
    holder: holder.toUpperCase()
  };

  SalonHubData.user.savedCards.push(newCard);
  closeAddCardDrawer();
  renderProfileScreen();

}

function removeSavedCard(cardId) {
  if (confirm("Delete this payment card details?")) {
    const idx = SalonHubData.user.savedCards.findIndex(c => c.id === cardId);
    if (idx !== -1) {
      SalonHubData.user.savedCards.splice(idx, 1);
      renderProfileScreen();
      
    }
  }
}

function toggleDarkModeSetting(checkbox) {
  const body = document.body;
  if (checkbox.checked) {
    body.classList.add('dark');
  } else {
    body.classList.remove('dark');
  }
}

// ----------------------------------------------------
// INTERACTIVE DETAILED FLOW: SALON DETAILS OVERLAY
// ----------------------------------------------------
function openSalonDetail(salonId, preserveSelection) {
  pushNavHistory({ drawer: 'salonDetail', salonId });

  AppState.selectedSalonId = salonId;
  AppState.selectedDetailCategory = "all";
  if (!preserveSelection) {
    AppState.selectedServices = []; // reset selection only if not coming from cart
  }

  const salon = SalonHubData.salons.find(s => s.id === salonId);
  if (!salon) return;

  // Bind info details
  document.getElementById('detailSalonName').innerText = salon.name;
  document.getElementById('detailCoverImage').src = salon.image;
  document.getElementById('detailSalonType').innerText = salon.type;
  document.getElementById('detailSalonRating').innerText = salon.rating;
  document.getElementById('detailReviewsCount').innerText = salon.reviewsCount;
  document.getElementById('detailSalonAbout').innerText = salon.about;

  // Render Services Category Tabs
  renderDetailServicesTabs(salon);

  // Render Category Services menu
  renderDetailServicesList(salon);

  // Render Recommended Combos
  renderRecommendedCombos();

  // Update sticky bottom checkout bar
  updateStickyFooterBar();

  // Slide Open overlay drawers
  document.getElementById('drawerOverlay').classList.add('open');
  document.getElementById('salonDetailDrawer').classList.add('open');
}

function closeAllDrawers() {
  document.getElementById('drawerOverlay').classList.remove('open');
  document.getElementById('salonDetailDrawer').classList.remove('open');
}

function renderDetailServicesTabs(salon) {
  const container = document.getElementById('detailServicesTabs');
  container.innerHTML = "";

  // Collect distinct categories available in this salon services
  const categories = ['all', ...new Set(salon.services.map(s => s.category))];

  categories.forEach(cat => {
    const displayName = cat === 'all' ? 'All Services' : cat.charAt(0).toUpperCase() + cat.slice(1);
    const btn = document.createElement('button');
    btn.className = `salon-detail-tab-btn ${AppState.selectedDetailCategory === cat ? 'active' : ''}`;
    btn.onclick = () => selectDetailCategory(cat);
    btn.innerText = displayName;
    container.appendChild(btn);
  });
}

function selectDetailCategory(catKey) {
  AppState.selectedDetailCategory = catKey;

  // update tabs highlight
  const tabs = document.querySelectorAll('#detailServicesTabs .salon-detail-tab-btn');
  tabs.forEach(t => {
    if (t.innerText.toLowerCase() === catKey || (catKey === 'all' && t.innerText === 'All Services')) {
      t.classList.add('active');
    } else {
      t.classList.remove('active');
    }
  });

  const salon = SalonHubData.salons.find(s => s.id === AppState.selectedSalonId);
  renderDetailServicesList(salon);
}

function renderDetailServicesList(salon) {
  const container = document.getElementById('detailServicesList');
  container.innerHTML = "";

  let services = salon.services;
  if (AppState.selectedDetailCategory !== 'all') {
    services = services.filter(s => s.category === AppState.selectedDetailCategory);
  }

  const categoryThumbnails = {
    haircut: "https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&w=200&q=80",
    colour: "https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&w=200&q=80",
    facial: "https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?auto=format&fit=crop&w=200&q=80",
    nails: "https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=200&q=80",
    spa: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=200&q=80",
    makeup: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=200&q=80",
    bridal: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=200&q=80",
    combos: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=200&q=80"
  };

  services.forEach(s => {
    const isSelected = AppState.selectedServices.some(selected => selected.id === s.id);
    const isFavourited = SalonHubData.favourites.serviceIds.includes(s.id);
    const serviceThumb = s.image || categoryThumbnails[s.category] || categoryThumbnails['haircut'];

    const el = document.createElement('div');
    el.className = 'drawer-service-item';
    el.onclick = () => toggleServiceSelection(s.id);
    el.innerHTML = `
      <div class="service-item-wrapper">
        <img src="${serviceThumb}" class="service-item-thumb" alt="${s.name}">
        <div class="service-item-details-body">
          <div class="service-item-title-row">
            <div class="service-item-info">
              <h4>${s.name}</h4>
              <span class="service-item-time"><i data-lucide="clock"></i>${s.time}</span>
            </div>
            <button class="salon-favorite-btn ${isFavourited ? 'active' : ''}" style="position:static; border:1px solid var(--border-color);" onclick="event.stopPropagation(); toggleDetailServiceFav('${s.id}')">
              <i data-lucide="heart" style="width:15px; height:15px;"></i>
            </button>
          </div>
          <p class="service-item-desc">${s.desc}</p>
          <div class="service-item-price-btn">
            <span class="service-item-price">₹${s.price}</span>
            <button class="service-select-btn ${isSelected ? 'selected' : ''}" onclick="event.stopPropagation(); toggleServiceSelection('${s.id}')">
              <i data-lucide="${isSelected ? 'check' : 'plus'}"></i>
              <span>${isSelected ? 'Added' : 'Add'}</span>
            </button>
          </div>
        </div>
      </div>
    `;
    container.appendChild(el);
  });
  lucide.createIcons();
}

function toggleDetailServiceFav(serviceId) {
  const index = SalonHubData.favourites.serviceIds.indexOf(serviceId);
  if (index !== -1) {
    SalonHubData.favourites.serviceIds.splice(index, 1);
  } else {
    SalonHubData.favourites.serviceIds.push(serviceId);
  }

  const salon = SalonHubData.salons.find(s => s.id === AppState.selectedSalonId);
  renderDetailServicesList(salon);
}

function toggleServiceSelection(serviceId) {
  const salon = SalonHubData.salons.find(s => s.id === AppState.selectedSalonId);
  const service = salon.services.find(s => s.id === serviceId);

  const idx = AppState.selectedServices.findIndex(s => s.id === serviceId);
  if (idx !== -1) {
    AppState.selectedServices.splice(idx, 1);
  } else {
    AppState.selectedServices.push(service);
  }

  renderDetailServicesList(salon);
  renderRecommendedCombos();
  updateStickyFooterBar();
}

// ----------------------------------------------------
// DYNAMIC RECOMMENDED COMBOS UPGRADE PANEL
// ----------------------------------------------------
function renderRecommendedCombos() {
  const container = document.getElementById('detailRecommendedCombosContainer');
  const listContainer = document.getElementById('detailRecommendedCombosList');
  if (!container || !listContainer) return;

  if (AppState.selectedServices.length === 0) {
    container.style.display = 'none';
    return;
  }

  const salon = SalonHubData.salons.find(s => s.id === AppState.selectedSalonId);
  if (!salon) {
    container.style.display = 'none';
    return;
  }

  // Find combos that aren't already selected
  const comboServices = salon.services.filter(s => s.category === 'combos' && !AppState.selectedServices.some(sel => sel.id === s.id));

  if (comboServices.length === 0) {
    container.style.display = 'none';
    return;
  }

  container.style.display = 'block';
  listContainer.innerHTML = "";

  comboServices.forEach(s => {
    const isFavourited = SalonHubData.favourites.serviceIds.includes(s.id);
    const el = document.createElement('div');
    el.className = 'drawer-service-item';
    el.style.border = '1px solid var(--accent-soft)';
    el.style.backgroundColor = 'rgba(156, 84, 242, 0.03)';
    el.onclick = () => addComboToCart(s.id);
    el.innerHTML = `
      <div class="service-item-title-row">
        <div class="service-item-info">
          <span style="background-color: var(--accent-color); color: #fff; font-size: 8px; padding: 2px 6px; border-radius: 4px; font-weight: 700; text-transform: uppercase; display: inline-block; margin-bottom: 4px;">Save Big Combo!</span>
          <h4>${s.name}</h4>
          <span class="service-item-time"><i data-lucide="clock"></i>${s.time}</span>
        </div>
        <button class="salon-favorite-btn ${isFavourited ? 'active' : ''}" style="position:static; border:1px solid var(--border-color);" onclick="event.stopPropagation(); toggleDetailServiceFav('${s.id}')">
          <i data-lucide="heart" style="width:15px; height:15px;"></i>
        </button>
      </div>
      <p class="service-item-desc">${s.desc}</p>
      <div class="service-item-price-btn">
        <span class="service-item-price" style="color:var(--accent-color); font-weight:800;">₹${s.price}</span>
        <button class="btn-primary" style="padding: 6px 12px; font-size: 11px; width: auto; box-shadow: none;" onclick="event.stopPropagation(); addComboToCart('${s.id}')">
          Upgrade to Combo
        </button>
      </div>
    `;
    listContainer.appendChild(el);
  });

  lucide.createIcons();
}

function addComboToCart(comboId) {
  const salon = SalonHubData.salons.find(s => s.id === AppState.selectedSalonId);
  const service = salon.services.find(s => s.id === comboId);
  if (!service) return;

  // Swap similar category/name services with the combo service (e.g. if we have a haircut selected, remove it when upgrading to Haircut Combo)
  const comboWords = service.name.toLowerCase().split(/[\s+\&]+/).filter(w => w.length > 3);
  AppState.selectedServices = AppState.selectedServices.filter(sel => {
    if (sel.category === 'combos') return true;
    const sharesWord = comboWords.some(w => sel.name.toLowerCase().includes(w) || sel.category.toLowerCase().includes(w));
    return !sharesWord;
  });
  AppState.selectedServices.push(service);

  renderDetailServicesList(salon);
  renderRecommendedCombos();
  updateStickyFooterBar();
}

function updateStickyFooterBar() {
  const bar = document.getElementById('detailStickyFooter');

  if (AppState.selectedServices.length === 0) {
    bar.style.display = 'none';
    return;
  }

  bar.style.display = 'flex';
  const countText = document.getElementById('stickyFooterSelectedCount');
  const priceText = document.getElementById('stickyFooterPrice');

  const count = AppState.selectedServices.length;
  const totalPrice = AppState.selectedServices.reduce((sum, s) => sum + s.price, 0);

  countText.innerText = `${count} service${count > 1 ? 's' : ''} selected`;
  priceText.innerText = `₹${totalPrice}`;
}

// ----------------------------------------------------
// TIME SLOT SELECTION & CHECKOUT CONFIRMATION
// ----------------------------------------------------
// ----------------------------------------------------
// CART DRAWER & BOOKING FLOW
// ----------------------------------------------------
function openSlotPickerDrawer() {
  if (!AppState.isAuthenticated) {
    showGuestLoginPrompt();
    return;
  }
  if (AppState.selectedServices.length === 0) {
    triggerToast("Please select at least one service first!");
    return;
  }
  closeAllDrawers();
  openCartDrawer();
}

function openCartDrawer() {
  document.getElementById('cartOverlay').classList.add('open');
  document.getElementById('cartDrawer').classList.add('open');
  renderCart();
}

function closeCartDrawer() {
  document.getElementById('cartOverlay').classList.remove('open');
  document.getElementById('cartDrawer').classList.remove('open');
}

function renderCart() {
  const container = document.getElementById('cartContent');
  container.innerHTML = "";

  if (AppState.selectedServices.length === 0) {
    container.innerHTML = `
      <div class="empty-state" style="padding: 40px 20px;">
        <div class="empty-state-icon"><i data-lucide="shopping-cart"></i></div>
        <h4>Your cart is empty</h4>
        <p>Add services from the salon menu to get started.</p>
        <button class="btn-primary" style="max-width:220px;" onclick="closeCartDrawer(); openSalonDetail('${AppState.selectedSalonId}', true);">Browse Services</button>
      </div>
    `;
    lucide.createIcons();
    return;
  }

  const salon = SalonHubData.salons.find(s => s.id === AppState.selectedSalonId);

  // Salon info header
  if (salon) {
    const salonHeader = document.createElement('div');
    salonHeader.className = 'cart-salon-header';
    salonHeader.innerHTML = `
      <img src="${salon.image}" class="cart-salon-img" alt="${salon.name}">
      <div class="cart-salon-info">
        <h4>${salon.name}</h4>
        <span>${salon.location} • <i data-lucide="star" style="width:11px; height:11px; fill:#FFB300; stroke:none; display:inline; vertical-align:middle;"></i> ${salon.rating}</span>
      </div>
    `;
    container.appendChild(salonHeader);
  }

  // Service items
  const itemsWrapper = document.createElement('div');
  itemsWrapper.className = 'cart-items-wrapper';

  AppState.selectedServices.forEach(service => {
    const el = document.createElement('div');
    el.className = 'cart-item';
    el.innerHTML = `
      <div class="cart-item-details">
        <h4 class="cart-item-name">${service.name}</h4>
        <span class="cart-item-time"><i data-lucide="clock"></i>${service.time}</span>
      </div>
      <div class="cart-item-right">
        <span class="cart-item-price">₹${service.price}</span>
        <button class="cart-item-remove-btn" onclick="removeFromCart('${service.id}')">
          <i data-lucide="trash-2"></i>
        </button>
      </div>
    `;
    itemsWrapper.appendChild(el);
  });

  // Add more services button
  const addMoreBtn = document.createElement('button');
  addMoreBtn.className = 'cart-add-more-btn';
  addMoreBtn.onclick = () => { closeCartDrawer(); openSalonDetail(AppState.selectedSalonId, true); };
  addMoreBtn.innerHTML = `<i data-lucide="plus-circle"></i> Add More Services`;
  itemsWrapper.appendChild(addMoreBtn);

  container.appendChild(itemsWrapper);

  // Update footer totals
  const total = AppState.selectedServices.reduce((sum, s) => sum + s.price, 0);
  const count = AppState.selectedServices.length;
  document.getElementById('cartServiceCount').textContent = `${count} service${count > 1 ? 's' : ''}`;
  document.getElementById('cartTotalPrice').textContent = `₹${total}`;

  lucide.createIcons();
}

function removeFromCart(serviceId) {
  AppState.selectedServices = AppState.selectedServices.filter(s => s.id !== serviceId);
  if (AppState.selectedServices.length === 0) {
    closeCartDrawer();
    updateStickyFooterBar();
    return;
  }
  renderCart();
  updateStickyFooterBar();
}

function proceedToSchedule() {
  if (AppState.selectedServices.length === 0) {
    triggerToast("Please add at least one service!");
    return;
  }
  closeCartDrawer();

  const overlay = document.getElementById('slotPickerOverlay');
  const drawer = document.getElementById('slotPickerDrawer');

  overlay.classList.add('open');
  drawer.classList.add('open');

  renderDateSlots();
  renderTimeSlots();
  renderStylistsPicker();
  updateSlotConfirmDetails();
}

function closeSlotPickerDrawer() {
  document.getElementById('slotPickerOverlay').classList.remove('open');
  document.getElementById('slotPickerDrawer').classList.remove('open');
}

function renderDateSlots() {
  const container = document.getElementById('slotDatePickerList');
  container.innerHTML = "";

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  // Only render Today and Tomorrow
  const today = new Date();

  if (!AppState.selectedDateNum) {
    AppState.selectedDateNum = today.getDate();
  }

  for (let i = 0; i < 2; i++) {
    const futureDate = new Date(today);
    futureDate.setDate(today.getDate() + i);

    const dayNum = futureDate.getDate();
    const dayName = i === 0 ? 'Today' : 'Tomorrow';
    const isActive = AppState.selectedDateNum === dayNum;

    const btn = document.createElement('button');
    btn.className = `calendar-day-btn ${isActive ? 'active' : ''}`;
    btn.onclick = () => selectDateSlot(dayNum, `${dayName}, ${dayNum} ${months[futureDate.getMonth()]}`);
    btn.innerHTML = `
      <span class="calendar-day-name">${dayName}</span>
      <span class="calendar-day-num">${dayNum}</span>
    `;
    container.appendChild(btn);
  }
}

function selectDateSlot(dateNum, formattedDate) {
  AppState.selectedDateNum = dateNum;
  AppState.formattedBookingDate = formattedDate;
  renderDateSlots();
  updateSlotConfirmDetails();
}

function timeToMinutes(timeStr) {
  if (!timeStr) return 0;
  const [time, modifier] = timeStr.split(' ');
  let [hours, minutes] = time.split(':').map(Number);
  if (modifier === 'PM' && hours !== 12) {
    hours += 12;
  }
  if (modifier === 'AM' && hours === 12) {
    hours = 0;
  }
  return hours * 60 + minutes;
}

function minutesToTime(mins) {
  let hours = Math.floor(mins / 60);
  let minutes = mins % 60;
  let modifier = 'AM';
  if (hours >= 12) {
    modifier = 'PM';
    if (hours > 12) hours -= 12;
  }
  if (hours === 0) hours = 12;
  const minsStr = minutes < 10 ? `0${minutes}` : `${minutes}`;
  const hoursStr = hours < 10 ? `0${hours}` : `${hours}`;
  return `${hoursStr}:${minsStr} ${modifier}`;
}

function renderTimeSlots() {
  const container = document.getElementById('slotTimePickerList');
  if (!container) return;
  container.innerHTML = "";

  // Contiguous 30-minute intervals
  const slots = [
    "09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM", 
    "12:00 PM", "12:30 PM", "01:00 PM", "01:30 PM", "02:00 PM", "02:30 PM", 
    "03:00 PM", "03:30 PM", "04:00 PM", "04:30 PM", "05:00 PM", "05:30 PM", 
    "06:00 PM", "06:30 PM", "07:00 PM", "07:30 PM"
  ];

  const totalDuration = AppState.selectedServices.reduce((sum, s) => {
    const mins = parseInt(s.time) || 30;
    return sum + mins;
  }, 0);

  // Calculate required 30-min slots
  const requiredSlots = Math.max(1, Math.ceil(totalDuration / 30));

  // Update visual requirement badge and notice in drawer
  const reqBadge = document.getElementById('slotRequirementBadge');
  const reqInfo = document.getElementById('slotRequirementInfo');
  if (reqBadge) {
    reqBadge.innerText = `${requiredSlots} Slot${requiredSlots > 1 ? 's' : ''} (${totalDuration}m)`;
  }
  if (reqInfo) {
    if (requiredSlots > 1) {
      reqInfo.innerHTML = `<i data-lucide="clock" style="width:12px; height:12px; display:inline-block; vertical-align:middle; margin-right:4px;"></i> Service requires <strong>${requiredSlots} consecutive slots</strong> (${totalDuration} mins).`;
    } else {
      reqInfo.innerHTML = `<i data-lucide="clock" style="width:12px; height:12px; display:inline-block; vertical-align:middle; margin-right:4px;"></i> Service duration: <strong>${totalDuration} mins</strong> (1 slot).`;
    }
    if (window.lucide) lucide.createIcons();
  }

  // A slot is valid if there are enough remaining consecutive slots before closing time
  const isSlotValid = (idx) => (slots.length - idx) >= requiredSlots;

  // If current selectedTimeSlot is invalid or missing, pick the first valid slot
  const currentIdx = slots.indexOf(AppState.selectedTimeSlot);
  if (!AppState.selectedTimeSlot || currentIdx === -1 || !isSlotValid(currentIdx)) {
    const firstValid = slots.find((_, idx) => isSlotValid(idx));
    AppState.selectedTimeSlot = firstValid || slots[0];
  }

  let selectedMins = null;
  if (AppState.selectedTimeSlot) {
    selectedMins = timeToMinutes(AppState.selectedTimeSlot);
  }

  slots.forEach((time, index) => {
    const slotMins = timeToMinutes(time);
    const isActive = AppState.selectedTimeSlot === time;
    const hasEnoughSlots = isSlotValid(index);
    
    // Check overlap with active selection block
    let isFrozen = false;
    if (selectedMins !== null && !isActive) {
      isFrozen = slotMins > selectedMins && slotMins < (selectedMins + (requiredSlots * 30));
    }

    const btn = document.createElement('button');
    
    if (!hasEnoughSlots) {
      btn.className = 'time-slot-btn unavailable';
      btn.disabled = true;
      btn.innerHTML = `${time} <span style="font-size:8px; display:block; opacity:0.75; color:#e11d48; font-weight:700;">N/A (${requiredSlots} slots req)</span>`;
    } else if (isFrozen) {
      btn.className = 'time-slot-btn frozen';
      btn.disabled = true;
      btn.innerHTML = `${time} <span style="font-size:8px; display:block; opacity:0.7;">Reserved</span>`;
    } else {
      btn.className = `time-slot-btn ${isActive ? 'active' : ''}`;
      btn.onclick = () => {
        AppState.selectedTimeSlot = time;
        renderTimeSlots();
        updateSlotConfirmDetails();
      };
      btn.innerText = time;
    }
    container.appendChild(btn);
  });
}

const StylistSpecialties = {
  st_1: ['haircut', 'colour', 'combos'], // Master Hair Stylist
  st_2: ['facial', 'spa'],              // Senior Skin Consultant
  st_3: ['nails'],                       // Nail Art Specialist
  st_4: ['makeup', 'bridal'],            // Bridal Makeup Lead
  st_5: ['spa']                          // Massage Therapist
};

function renderStylistsPicker() {
  const container = document.getElementById('slotStylistPickerList');
  container.innerHTML = "";

  // Add any stylist option first
  const anyStylist = { id: 'any', name: 'Any Stylist', role: 'Allocated on arrival', avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=150&q=80' };

  const salon = SalonHubData.salons.find(s => s.id === AppState.selectedSalonId);
  const stylists = [anyStylist, ...SalonHubData.stylists.filter(st => salon.stylistIds.includes(st.id))];

  if (!AppState.selectedStylistId) {
    AppState.selectedStylistId = 'any';
  }

  stylists.forEach(st => {
    const isActive = AppState.selectedStylistId === st.id;
    
    // Check specialties
    let isSpecialist = false;
    if (st.id !== 'any') {
      const specialties = StylistSpecialties[st.id] || [];
      isSpecialist = AppState.selectedServices.some(s => specialties.includes(s.category));
    }

    const card = document.createElement('div');
    card.className = `stylist-picker-card ${isActive ? 'active' : ''}`;
    card.onclick = () => {
      AppState.selectedStylistId = st.id;
      renderStylistsPicker();
      updateSlotConfirmDetails();
    };
    card.innerHTML = `
      <img src="${st.avatar}" class="stylist-picker-avatar" alt="${st.name}">
      <div class="stylist-picker-info" style="flex:1;">
        <div style="display:flex; align-items:center; justify-content:space-between; width:100%; gap:4px;">
          <h4 class="stylist-picker-name" style="margin:0;">${st.name}</h4>
          ${isSpecialist ? '<span class="specialist-badge">Specialist</span>' : st.id !== 'any' ? '<span class="free-badge">Free</span>' : ''}
        </div>
        <span class="stylist-picker-role">${st.role}</span>
      </div>
    `;
    container.appendChild(card);
  });
}

function updateSlotConfirmDetails() {
  const dateText = AppState.formattedBookingDate || "Tomorrow, 25 July";
  const timeText = AppState.selectedTimeSlot || "11:30 AM";

  const totalDuration = AppState.selectedServices.reduce((sum, s) => {
    const mins = parseInt(s.time) || 30;
    return sum + mins;
  }, 0);
  const requiredSlots = Math.max(1, Math.ceil(totalDuration / 30));

  let timeRangeText = timeText;
  if (AppState.selectedTimeSlot) {
    const startMins = timeToMinutes(AppState.selectedTimeSlot);
    const endMins = startMins + (requiredSlots * 30);
    const endTimeText = minutesToTime(endMins);
    timeRangeText = `${timeText} - ${endTimeText}`;
  }

  const labelText = `${dateText} • ${timeRangeText} (${requiredSlots} slot${requiredSlots > 1 ? 's' : ''})`;

  const detailsEl = document.getElementById('slotConfirmTimeDetails');
  if (detailsEl) detailsEl.innerText = labelText;

  const totalPrice = AppState.selectedServices.reduce((sum, s) => sum + s.price, 0);
  const priceEl = document.getElementById('slotConfirmPrice');
  if (priceEl) priceEl.innerText = `₹${totalPrice}`;
}

function confirmAppointmentCheckout() {
  closeSlotPickerDrawer();

  // Create mock invoice & save booking object
  const salon = SalonHubData.salons.find(s => s.id === AppState.selectedSalonId);
  const servicesText = AppState.selectedServices.map(s => s.name).join(", ");
  const totalPrice = AppState.selectedServices.reduce((sum, s) => sum + s.price, 0);

  let stylistName = "Any Stylist";
  if (AppState.selectedStylistId !== 'any') {
    stylistName = SalonHubData.stylists.find(st => st.id === AppState.selectedStylistId).name;
  }

  const dateText = AppState.formattedBookingDate || "Tomorrow, 25 July";
  const timeText = AppState.selectedTimeSlot || "11:30 AM";
  const paidAdvance = 100; // Flat advance checkout amount

  // Save upcoming booking object details
  const newBooking = {
    id: `bk_${Date.now()}`,
    salonId: salon.id,
    salonName: salon.name,
    salonImage: salon.image,
    serviceName: servicesText,
    price: totalPrice,
    paid: paidAdvance,
    remaining: totalPrice - paidAdvance,
    date: dateText,
    time: timeText,
    stylist: stylistName,
    status: "Confirmed",
    isUpcoming: true
  };

  // If rescheduling, remove old booking entry
  if (AppState.reschedulingId) {
    const idx = SalonHubData.bookings.findIndex(b => b.id === AppState.reschedulingId);
    if (idx !== -1) SalonHubData.bookings.splice(idx, 1);
    AppState.reschedulingId = null;
  }

  SalonHubData.bookings.unshift(newBooking);

  // Modify slots today count slightly to simulate vacancy urgency
  if (salon.slotsLeft > 0) salon.slotsLeft--;

  // Open booking confirmation invoice success modal
  const invoiceSalon = document.getElementById('invoiceSalonName');
  const invoiceStylist = document.getElementById('invoiceStylistName');
  const invoiceDateTime = document.getElementById('invoiceDateTime');
  const invoicePaidAmount = document.getElementById('invoicePaidAmount');

  invoiceSalon.innerText = salon.name;
  invoiceStylist.innerText = stylistName;
  invoiceDateTime.innerText = `${dateText} at ${timeText}`;
  invoicePaidAmount.innerText = `₹${paidAdvance}`;

  document.getElementById('successModalOverlay').classList.add('open');
  lucide.createIcons();
}

function closeSuccessModal() {
  document.getElementById('successModalOverlay').classList.remove('open');
  // clear selections
  AppState.selectedServices = [];
  AppState.selectedDateNum = null;
  AppState.selectedTimeSlot = null;
  AppState.selectedStylistId = null;
}

function closeSuccessModalAndNavigate() {
  closeSuccessModal();
  navigateToTab('bookings');
}

// Quick helper to book direct from favourites or suggestions
function quickBookService(salonId, serviceId) {
  if (!AppState.isAuthenticated) {
    showGuestLoginPrompt();
    return;
  }
  const salon = SalonHubData.salons.find(s => s.id === salonId);
  const service = salon.services.find(s => s.id === serviceId);

  AppState.selectedSalonId = salonId;
  AppState.selectedServices = [service];

  openSlotPickerDrawer();
}

// ----------------------------------------------------
// MOCK POPUP DIALOGS INTERACTIVE STATE
// ----------------------------------------------------
function openLocationDrawer() {
  document.getElementById('locationOverlay').classList.add('open');
  document.getElementById('locationDrawer').classList.add('open');
}

function closeLocationDrawer() {
  document.getElementById('locationOverlay').classList.remove('open');
  document.getElementById('locationDrawer').classList.remove('open');
}

function selectNewLocation(locName) {
  AppState.selectedLocation = locName;
  document.getElementById('currentLocationText').innerText = locName;
  closeLocationDrawer();
  

  // Filter or reload lists matching distance if necessary
  renderHomeScreen();
}

function filterLocationResults() {
  const input = document.getElementById('locationSearchBox').value.toLowerCase();
  const rows = document.querySelectorAll('#locationResultsList .option-row');

  rows.forEach(r => {
    const text = r.innerText.toLowerCase();
    if (text.includes(input)) {
      r.style.display = 'flex';
    } else {
      r.style.display = 'none';
    }
  });
}

function openFilterDrawer() {
  document.getElementById('filterOverlay').classList.add('open');
  document.getElementById('filterDrawer').classList.add('open');
}

function closeFilterDrawer() {
  document.getElementById('filterOverlay').classList.remove('open');
  document.getElementById('filterDrawer').classList.remove('open');
}

function openNotificationsDrawer() {
  document.getElementById('notificationsOverlay').classList.add('open');
  document.getElementById('notificationsDrawer').classList.add('open');
}

function closeNotificationsDrawer() {
  document.getElementById('notificationsOverlay').classList.remove('open');
  document.getElementById('notificationsDrawer').classList.remove('open');
}

// Notification alerts helper Toast
function triggerToast(message, actionLabel = "", actionCallback = null) {
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  toast.className = 'toast';

  let actionHtml = "";
  if (actionLabel !== "" && actionCallback) {
    actionHtml = `<span style="color:var(--accent-color); font-weight:700; margin-left: 10px; text-decoration: underline; cursor:pointer;" class="toast-action">${actionLabel}</span>`;
  }

  toast.innerHTML = `
    <i data-lucide="info"></i>
    <span style="flex:1;">${message}</span>
    ${actionHtml}
  `;

  // Bind toast actions if applicable
  if (actionCallback) {
    toast.querySelector('.toast-action').onclick = (e) => {
      e.stopPropagation();
      actionCallback();
      toast.classList.add('fade-out');
      setTimeout(() => toast.remove(), 300);
    };
  }

  container.appendChild(toast);
  lucide.createIcons();

  // Slide Out after 3.5 seconds
  setTimeout(() => {
    if (toast && toast.parentNode) {
      toast.classList.add('fade-out');
      setTimeout(() => toast.remove(), 300);
    }
  }, 3500);
}

// ----------------------------------------------------
// GUEST MODE CONTROLLERS & EVENT LISTENERS
// ----------------------------------------------------
function continueAsGuest() {
  AppState.isAuthenticated = false;
  document.getElementById('navigationBar').style.display = 'flex';
  navigateToTab('home');
}

function showGuestLoginPrompt() {
  document.getElementById('guestLoginPromptOverlay').classList.add('open');
}

function closeGuestLoginPrompt() {
  document.getElementById('guestLoginPromptOverlay').classList.remove('open');
}

function goToAuthFromGuest() {
  closeGuestLoginPrompt();
  closeAllDrawers(); // also close any open details drawer
  
  // Reset active state for redirection
  AppState.isAuthenticated = false;
  document.getElementById('navigationBar').style.display = 'none';
  showScreen('login');
}

function clearCategoryFilter() {
  AppState.activeCategoryFilter = "all";
  renderExploreList();
}
