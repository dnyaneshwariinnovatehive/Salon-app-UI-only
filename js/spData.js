const SPData = {
  providerId: "st_1",
  salonId: "salon_1",
  status: "available",

  appointments: [
    {
      id: "sp_appt_1",
      customerName: "Priya Deshmukh",
      customerPhone: "+91 98765 11111",
      services: [{ name: "Signature Haircut & Wash", price: 499, duration: 45 }],
      time: "09:30 AM",
      duration: 45,
      status: "completed",
      type: "online",
      advancePaid: 100,
      totalAmount: 499,
      finalBilledAmount: 499,
      date: "today"
    },
    {
      id: "sp_appt_2",
      customerName: "Amit Kumar",
      customerPhone: "+91 98765 22222",
      services: [{ name: "Global Hair Colouring (L'Oreal)", price: 2499, duration: 120 }],
      time: "10:30 AM",
      duration: 120,
      status: "in_progress",
      type: "offline",
      advancePaid: 500,
      totalAmount: 2499,
      finalBilledAmount: 2499,
      date: "today"
    },
    {
      id: "sp_appt_3",
      customerName: "Sneha Patil",
      customerPhone: "+91 98765 33333",
      services: [{ name: "Haircut + Face Glow Combo", price: 1299, duration: 90 }],
      time: "12:00 PM",
      duration: 90,
      status: "scheduled",
      type: "online",
      advancePaid: 200,
      totalAmount: 1299,
      finalBilledAmount: 1299,
      date: "today"
    },
    {
      id: "sp_appt_4",
      customerName: "Vikram Joshi",
      customerPhone: "+91 98765 44444",
      services: [{ name: "Signature Haircut & Scalp Scrub", price: 600, duration: 50 }],
      time: "02:00 PM",
      duration: 50,
      status: "scheduled",
      type: "offline",
      advancePaid: 0,
      totalAmount: 600,
      finalBilledAmount: 600,
      date: "today"
    },
    {
      id: "sp_appt_5",
      customerName: "Neha Gupta",
      customerPhone: "+91 98765 55555",
      services: [{ name: "Root Touch-up (No Ammonia)", price: 799, duration: 60 }],
      time: "03:30 PM",
      duration: 60,
      status: "scheduled",
      type: "online",
      advancePaid: 100,
      totalAmount: 799,
      finalBilledAmount: 799,
      date: "today"
    },
    {
      id: "sp_appt_6",
      customerName: "Rohan Mehta",
      customerPhone: "+91 98765 66666",
      services: [{ name: "Classic Haircut & Beard Grooming", price: 350, duration: 40 }],
      time: "05:00 PM",
      duration: 40,
      status: "no_show",
      type: "offline",
      advancePaid: 0,
      totalAmount: 350,
      finalBilledAmount: 350,
      date: "today"
    }
  ],

  earnings: {
    today: { advance: 400, balance: 4346, total: 4746 },
    thisWeek: { advance: 2800, balance: 18500, total: 21300 },
    thisMonth: { advance: 12000, balance: 78000, total: 90000 }
  },

  leaveRequests: [
    { id: "leave_1", date: "15 Jul 2026", type: "full_day", reason: "Personal work", status: "approved" },
    { id: "leave_2", date: "20 Jul 2026", type: "half_day", timeRange: "09:00 AM - 01:00 PM", reason: "Doctor appointment", status: "pending" },
    { id: "leave_3", date: "25 Jul 2026", type: "full_day", reason: "Family function", status: "rejected" }
  ],

  workingHours: {
    mon: { start: "09:00 AM", end: "07:00 PM", break: "01:00 PM - 02:00 PM", off: false },
    tue: { start: "09:00 AM", end: "07:00 PM", break: "01:00 PM - 02:00 PM", off: false },
    wed: { start: "09:00 AM", end: "07:00 PM", break: "01:00 PM - 02:00 PM", off: false },
    thu: { start: "09:00 AM", end: "07:00 PM", break: "01:00 PM - 02:00 PM", off: false },
    fri: { start: "09:00 AM", end: "07:00 PM", break: "01:00 PM - 02:00 PM", off: false },
    sat: { start: "10:00 AM", end: "05:00 PM", break: "01:00 PM - 01:30 PM", off: false },
    sun: { start: null, end: null, break: null, off: true }
  }
};
