const AdminData = {
  salon: {
    id: "salon_1",
    name: "Luxe Studio Salon",
    address: "Shop 4, Royal Avenue, Koregaon Park, Pune - 411001",
    phone: "+91 98765 43210",
    email: "admin@luxestudio.com",
    coverPhoto: "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=600&q=80",
    logo: "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=150&q=80",
    type: "Unisex",
    location: "Koregaon Park, Pune",
    rating: 4.8,
    reviewsCount: 382,
    adminName: "Admin",
    galleryPhotos: [
      "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=600&q=80"
    ]
  },

  serviceCategories: [
    { id: "haircut", name: "Haircut", icon: "scissors" },
    { id: "colour", name: "Hair Colour", icon: "palette" },
    { id: "facial", name: "Facial", icon: "face-smile" },
    { id: "nails", name: "Nails", icon: "hand" },
    { id: "spa", name: "Spa", icon: "wind" },
    { id: "makeup", name: "Makeup", icon: "sparkles" },
    { id: "bridal", name: "Bridal", icon: "award" }
  ],

  services: [
    { id: "adm_svc_1", name: "Signature Haircut & Wash", category: "haircut", price: 499, duration_minutes: 45, min_advance_percentage: 20, will_refund_advance: true, gender_focus: "unisex", active: true, provider_ids: ["st_1"] },
    { id: "adm_svc_2", name: "Global Hair Colouring (L'Oreal)", category: "colour", price: 2499, duration_minutes: 120, min_advance_percentage: 20, will_refund_advance: true, gender_focus: "unisex", active: true, provider_ids: ["st_1"] },
    { id: "adm_svc_3", name: "Detox Face Glow Treatment", category: "facial", price: 999, duration_minutes: 60, min_advance_percentage: 20, will_refund_advance: true, gender_focus: "female", active: true, provider_ids: ["st_2"] },
    { id: "adm_svc_4", name: "Luxury Pedicure & Foot Massage", category: "nails", price: 799, duration_minutes: 50, min_advance_percentage: 20, will_refund_advance: true, gender_focus: "female", active: true, provider_ids: ["st_2", "st_3"] },
    { id: "adm_svc_5", name: "Bridal HD Makeup Trial", category: "bridal", price: 3999, duration_minutes: 90, min_advance_percentage: 30, will_refund_advance: false, gender_focus: "female", active: true, provider_ids: ["st_4"] },
    { id: "adm_svc_6", name: "Classic Haircut & Beard Grooming", category: "haircut", price: 350, duration_minutes: 40, min_advance_percentage: 0, will_refund_advance: true, gender_focus: "male", active: true, provider_ids: ["st_1", "st_3"] },
    { id: "adm_svc_7", name: "Beard Spa & Steam", category: "haircut", price: 200, duration_minutes: 20, min_advance_percentage: 0, will_refund_advance: true, gender_focus: "male", active: true, provider_ids: ["st_1", "st_5"] },
    { id: "adm_svc_8", name: "Deep Conditioning Hair Spa", category: "haircut", price: 899, duration_minutes: 60, min_advance_percentage: 20, will_refund_advance: true, gender_focus: "unisex", active: true, provider_ids: ["st_1"] },
    { id: "adm_svc_9", name: "Root Touch-up (No Ammonia)", category: "colour", price: 799, duration_minutes: 60, min_advance_percentage: 20, will_refund_advance: true, gender_focus: "unisex", active: true, provider_ids: ["st_1", "st_2"] },
    { id: "adm_svc_10", name: "Swedish Full Body Massage", category: "spa", price: 1999, duration_minutes: 60, min_advance_percentage: 20, will_refund_advance: true, gender_focus: "unisex", active: true, provider_ids: ["st_5"] },
    { id: "adm_svc_11", name: "Gel Nail Extensions & Art", category: "nails", price: 1499, duration_minutes: 80, min_advance_percentage: 20, will_refund_advance: true, gender_focus: "female", active: true, provider_ids: ["st_3"] },
    { id: "adm_svc_12", name: "Classic Party Makeup", category: "makeup", price: 2499, duration_minutes: 60, min_advance_percentage: 30, will_refund_advance: false, gender_focus: "female", active: true, provider_ids: ["st_4"] }
  ],

  combos: [
    { id: "adm_combo_1", name: "Haircut + Face Glow Combo", service_ids: ["adm_svc_1", "adm_svc_3"], combined_price: 1299, advance_percentage: 20, active: true },
    { id: "adm_combo_2", name: "Trend Haircut + Beard Spa Combo", service_ids: ["adm_svc_6", "adm_svc_7"], combined_price: 499, advance_percentage: 0, active: true }
  ],

  serviceProviders: [
    {
      id: "st_1", name: "Rahul Sharma", phone: "+91 98765 11111", email: "rahul.sharma@salonhub.com",
      role: "Master Hair Stylist", rating: 4.9, reviews: 142, is_active: true,
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80",
      specialization_ids: ["haircut", "colour", "combos"],
      workingHours: {
        mon: { start: "09:00 AM", end: "07:00 PM", break: "01:00 PM - 02:00 PM" },
        tue: { start: "09:00 AM", end: "07:00 PM", break: "01:00 PM - 02:00 PM" },
        wed: { start: "09:00 AM", end: "07:00 PM", break: "01:00 PM - 02:00 PM" },
        thu: { start: "09:00 AM", end: "07:00 PM", break: "01:00 PM - 02:00 PM" },
        fri: { start: "09:00 AM", end: "07:00 PM", break: "01:00 PM - 02:00 PM" },
        sat: { start: "10:00 AM", end: "05:00 PM", break: "01:00 PM - 01:30 PM" },
        sun: { off: true }
      },
      weekly_off: "Sunday"
    },
    {
      id: "st_2", name: "Priya Nair", phone: "+91 98765 22222", email: "priya.nair@salonhub.com",
      role: "Senior Skin Consultant", rating: 4.8, reviews: 98, is_active: true,
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80",
      specialization_ids: ["facial", "spa"],
      workingHours: {
        mon: { start: "10:00 AM", end: "07:00 PM", break: "02:00 PM - 03:00 PM" },
        tue: { start: "10:00 AM", end: "07:00 PM", break: "02:00 PM - 03:00 PM" },
        wed: { start: "10:00 AM", end: "07:00 PM", break: "02:00 PM - 03:00 PM" },
        thu: { start: "10:00 AM", end: "07:00 PM", break: "02:00 PM - 03:00 PM" },
        fri: { start: "10:00 AM", end: "07:00 PM", break: "02:00 PM - 03:00 PM" },
        sat: { start: "10:00 AM", end: "05:00 PM", break: "02:00 PM - 02:30 PM" },
        sun: { off: true }
      },
      weekly_off: "Sunday"
    },
    {
      id: "st_3", name: "Amit Patel", phone: "+91 98765 33333", email: "amit.patel@salonhub.com",
      role: "Nail Art Specialist", rating: 4.7, reviews: 85, is_active: true,
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80",
      specialization_ids: ["nails"],
      workingHours: {
        mon: { start: "10:00 AM", end: "07:00 PM", break: "01:00 PM - 02:00 PM" },
        tue: { start: "10:00 AM", end: "07:00 PM", break: "01:00 PM - 02:00 PM" },
        wed: { start: "10:00 AM", end: "07:00 PM", break: "01:00 PM - 02:00 PM" },
        thu: { start: "10:00 AM", end: "07:00 PM", break: "01:00 PM - 02:00 PM" },
        fri: { start: "10:00 AM", end: "07:00 PM", break: "01:00 PM - 02:00 PM" },
        sat: { start: "09:00 AM", end: "05:00 PM", break: "01:00 PM - 01:30 PM" },
        sun: { off: true }
      },
      weekly_off: "Sunday"
    },
    {
      id: "st_4", name: "Neha Sen", phone: "+91 98765 44444", email: "neha.sen@salonhub.com",
      role: "Bridal Makeup Lead", rating: 4.9, reviews: 210, is_active: true,
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&q=80",
      specialization_ids: ["makeup", "bridal"],
      workingHours: {
        mon: { start: "10:00 AM", end: "07:00 PM", break: "01:00 PM - 02:00 PM" },
        tue: { start: "10:00 AM", end: "07:00 PM", break: "01:00 PM - 02:00 PM" },
        wed: { start: "10:00 AM", end: "07:00 PM", break: "01:00 PM - 02:00 PM" },
        thu: { start: "10:00 AM", end: "07:00 PM", break: "01:00 PM - 02:00 PM" },
        fri: { start: "10:00 AM", end: "07:00 PM", break: "01:00 PM - 02:00 PM" },
        sat: { start: "09:00 AM", end: "06:00 PM", break: "01:00 PM - 01:30 PM" },
        sun: { off: true }
      },
      weekly_off: "Sunday"
    },
    {
      id: "st_5", name: "Vikram Singh", phone: "+91 98765 55555", email: "vikram.singh@salonhub.com",
      role: "Massage Therapist", rating: 4.8, reviews: 76, is_active: true,
      avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=150&q=80",
      specialization_ids: ["spa"],
      workingHours: {
        mon: { start: "09:00 AM", end: "06:00 PM", break: "01:00 PM - 02:00 PM" },
        tue: { start: "09:00 AM", end: "06:00 PM", break: "01:00 PM - 02:00 PM" },
        wed: { start: "09:00 AM", end: "06:00 PM", break: "01:00 PM - 02:00 PM" },
        thu: { start: "09:00 AM", end: "06:00 PM", break: "01:00 PM - 02:00 PM" },
        fri: { start: "09:00 AM", end: "06:00 PM", break: "01:00 PM - 02:00 PM" },
        sat: { start: "09:00 AM", end: "03:00 PM", break: "12:00 PM - 12:30 PM" },
        sun: { off: true }
      },
      weekly_off: "Sunday"
    }
  ],

  providerLeaves: [
    { id: "adm_leave_1", provider_id: "st_1", date: "15 Jul 2026", type: "full_day", reason: "Personal work", status: "approved", reviewed_by: "Admin", reviewed_at: "10 Jul 2026" },
    { id: "adm_leave_2", provider_id: "st_2", date: "20 Jul 2026", type: "half_day", timeRange: "09:00 AM - 01:00 PM", reason: "Doctor appointment", status: "pending", reviewed_by: null, reviewed_at: null },
    { id: "adm_leave_3", provider_id: "st_3", date: "25 Jul 2026", type: "full_day", reason: "Family function", status: "rejected", reviewed_by: "Admin", reviewed_at: "18 Jul 2026" },
    { id: "adm_leave_4", provider_id: "st_1", date: "28 Jul 2026", type: "full_day", reason: "Medical leave", status: "pending", reviewed_by: null, reviewed_at: null },
    { id: "adm_leave_5", provider_id: "st_5", date: "30 Jul 2026", type: "half_day", timeRange: "09:00 AM - 01:00 PM", reason: "Personal appointment", status: "pending", reviewed_by: null, reviewed_at: null }
  ],

  appointments: [
    { id: "adm_appt_1", customer_name: "Priya Deshmukh", customer_phone: "+91 98765 11111", customer_gender: "Female", provider_id: "st_1", service_ids: ["adm_svc_1"], date: "28 Jul 2026", time: "09:30 AM", duration: 45, status: "completed", type: "online", advance_paid: 100, total_amount: 499, balance_due: 399, booking_source: "App" },
    { id: "adm_appt_2", customer_name: "Amit Kumar", customer_phone: "+91 98765 22222", customer_gender: "Male", provider_id: "st_1", service_ids: ["adm_svc_2"], date: "28 Jul 2026", time: "10:30 AM", duration: 120, status: "in_progress", type: "offline", advance_paid: 500, total_amount: 2499, balance_due: 1999, booking_source: "Walk-in" },
    { id: "adm_appt_3", customer_name: "Sneha Patil", customer_phone: "+91 98765 33333", customer_gender: "Female", provider_id: "st_1", service_ids: ["adm_combo_1"], date: "28 Jul 2026", time: "12:00 PM", duration: 90, status: "scheduled", type: "online", advance_paid: 200, total_amount: 1299, balance_due: 1099, booking_source: "App" },
    { id: "adm_appt_4", customer_name: "Vikram Joshi", customer_phone: "+91 98765 44444", customer_gender: "Male", provider_id: "st_1", service_ids: ["adm_svc_6"], date: "28 Jul 2026", time: "02:00 PM", duration: 50, status: "scheduled", type: "offline", advance_paid: 0, total_amount: 350, balance_due: 350, booking_source: "Walk-in" },
    { id: "adm_appt_5", customer_name: "Neha Gupta", customer_phone: "+91 98765 55555", customer_gender: "Female", provider_id: "st_1", service_ids: ["adm_svc_9"], date: "28 Jul 2026", time: "03:30 PM", duration: 60, status: "scheduled", type: "online", advance_paid: 100, total_amount: 799, balance_due: 699, booking_source: "App" },
    { id: "adm_appt_6", customer_name: "Rohan Mehta", customer_phone: "+91 98765 66666", customer_gender: "Male", provider_id: "st_1", service_ids: ["adm_svc_6"], date: "28 Jul 2026", time: "05:00 PM", duration: 40, status: "no_show", type: "offline", advance_paid: 0, total_amount: 350, balance_due: 350, booking_source: "Phone" },
    { id: "adm_appt_7", customer_name: "Ananya Reddy", customer_phone: "+91 98765 77777", customer_gender: "Female", provider_id: "st_2", service_ids: ["adm_svc_3"], date: "28 Jul 2026", time: "11:00 AM", duration: 60, status: "scheduled", type: "online", advance_paid: 200, total_amount: 999, balance_due: 799, booking_source: "App" },
    { id: "adm_appt_8", customer_name: "Karan Mehta", customer_phone: "+91 98765 88888", customer_gender: "Male", provider_id: "st_5", service_ids: ["adm_svc_10"], date: "28 Jul 2026", time: "02:00 PM", duration: 60, status: "scheduled", type: "online", advance_paid: 400, total_amount: 1999, balance_due: 1599, booking_source: "App" }
  ],

  payments: [
    { id: "adm_pay_1", appointment_id: "adm_appt_1", amount: 100, type: "advance", paid_at: "28 Jul 2026 09:00 AM", method: "UPI" },
    { id: "adm_pay_2", appointment_id: "adm_appt_2", amount: 500, type: "advance", paid_at: "27 Jul 2026 06:00 PM", method: "Cash" },
    { id: "adm_pay_3", appointment_id: "adm_appt_1", amount: 399, type: "balance", paid_at: "28 Jul 2026 10:15 AM", method: "UPI" },
    { id: "adm_pay_4", appointment_id: "adm_appt_3", amount: 200, type: "advance", paid_at: "27 Jul 2026 02:00 PM", method: "Card" },
    { id: "adm_pay_5", appointment_id: "adm_appt_5", amount: 100, type: "advance", paid_at: "26 Jul 2026 11:00 AM", method: "UPI" },
    { id: "adm_pay_6", appointment_id: "adm_appt_7", amount: 200, type: "advance", paid_at: "28 Jul 2026 08:30 AM", method: "UPI" },
    { id: "adm_pay_7", appointment_id: "adm_appt_8", amount: 400, type: "advance", paid_at: "27 Jul 2026 07:00 PM", method: "Card" }
  ],

  closureDates: []
};
