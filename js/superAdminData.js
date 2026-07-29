const SuperAdminData = {
  user: {
    name: "Platform Owner",
    email: "rootadmin@gmail.com",
    role: "superadmin",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80"
  },

  // Extended salon registry — builds from SalonHubData.salons + SuperAdmin-only fields
  salons: [],

  // Master service categories (source of truth — SuperAdmin manages these)
  categories: [
    { id: "haircut", name: "Haircut", icon: "scissors", display_order: 1, active: true },
    { id: "colour", name: "Hair Colour", icon: "palette", display_order: 2, active: true },
    { id: "facial", name: "Facial", icon: "face-smile", display_order: 3, active: true },
    { id: "nails", name: "Nails", icon: "hand", display_order: 4, active: true },
    { id: "spa", name: "Spa", icon: "wind", display_order: 5, active: true },
    { id: "makeup", name: "Makeup", icon: "sparkles", display_order: 6, active: true },
    { id: "bridal", name: "Bridal", icon: "award", display_order: 7, active: true }
  ],

  // Platform-wide banners (displayed in Customer home carousel)
  banners: [
    {
      id: "sa_banner_1",
      title: "Summer Glow Specials",
      image: "https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?auto=format&fit=crop&w=600&q=80",
      link: "salon/salon_1",
      target_scope: "platform",
      start_date: "01 Jul 2026",
      end_date: "31 Aug 2026",
      active: true
    },
    {
      id: "sa_banner_2",
      title: "Monsoon Hair Spa Offer",
      image: "https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&w=600&q=80",
      link: "url",
      target_scope: "platform",
      start_date: "15 Jul 2026",
      end_date: "15 Sep 2026",
      active: true
    }
  ],

  // Active filter state for salons list
  filterStatus: "all", // "all" | "active" | "suspended"
  searchQuery: "",

  // Top-performing time range toggle
  topPerformanceDays: 7, // 7 or 30

  _lastCategoryId: 7
};

// Build salon registry from existing mock data
function saBuildSalonRegistry() {
  SuperAdminData.salons = SalonHubData.salons.map((s, idx) => ({
    id: s.id,
    name: s.name,
    type: s.type,
    city: s.location.split(",")[0].trim(),
    location: s.location,
    rating: s.rating,
    reviewsCount: s.reviewsCount,
    image: s.image,
    isOpen: s.isOpen,
    status: "active",
    deactivated_at: null,
    suspended_reason: null,
    suspended_at: null,
    suspended_by: null,
    admin_name: "Salon Admin",
    admin_phone: "+91 98765 43210",
    admin_email: "admin@" + s.name.toLowerCase().replace(/\s+/g, "") + ".com",
    services: s.services,
    stylistIds: s.stylistIds || [],
    totalAppointments: AdminData ? AdminData.appointments.filter(a => {
      const svc = AdminData.services.find(sv => s.id === a.service_ids[0]);
      return svc && s.services.some(ss => ss.id === svc.id);
    }).length : Math.floor(Math.random() * 80) + 20,
    totalRevenue: (AdminData ? AdminData.appointments.filter(a => a.status === "completed" || a.status === "in_progress").reduce((sum, a) => sum + a.total_amount, 0) : 0) || Math.floor(Math.random() * 50000) + 5000
  }));
}

saBuildSalonRegistry();

// ============================================================
// CROSS-ROLE EVENT BUS (simulates Socket.io real-time sync)
// ============================================================
const SuperAdminBus = {
  listeners: {},

  on(event, callback) {
    if (!this.listeners[event]) this.listeners[event] = [];
    this.listeners[event].push(callback);
  },

  off(event, callback) {
    if (!this.listeners[event]) return;
    this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
  },

  emit(event, data) {
    if (!this.listeners[event]) return;
    this.listeners[event].forEach(cb => cb(data));
  }
};
