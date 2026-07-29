const SalonHubData = {
  user: {
    name: "Dnyaneshwari",
    phone: "+91 98765 43210",
    email: "dnyaneshwari@gmail.com",
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80",
    membership: {
      tier: "Gold Tier Member",
      points: 1240,
      nextTierPoints: 2000,
      memberSince: "Nov 2024",
      benefits: [
        "Flat 10% extra cashback on all services",
        "Free green tea / premium coffee on every visit",
        "Priority slot booking (unlock 7 days in advance)",
        "Dedicated VIP relationship manager support"
      ]
    },
    savedCards: [
      { id: "card_1", brand: "visa", last4: "4321", exp: "12/29", holder: "DNYANESHWARI" },
      { id: "card_2", brand: "mastercard", last4: "8765", exp: "06/28", holder: "DNYANESHWARI" }
    ],
    addresses: [
      { label: "Home", text: "Flat 402, Royal Palms, Aundh, Pune - 411007" },
      { label: "Office", text: "Tower B, Cybercity IT Park, Magarpatta, Pune - 411028" }
    ]
  },

  promos: [
    {
      id: "promo_1",
      title: "Summer Glow Specials",
      desc: "Get up to 30% off on all Premium Facials",
      code: "GLOW30",
      bgImage: "https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?auto=format&fit=crop&w=600&q=80",
      textColor: "#FFFFFF"
    },
    {
      id: "promo_2",
      title: "Monsoon Hair Spa Combo",
      desc: "Flat ₹500 off on L'Oreal Hair Spa Treatments",
      code: "RAINSPA",
      bgImage: "https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&w=600&q=80",
      textColor: "#FFFFFF"
    },
    {
      id: "promo_3",
      title: "Wedding Preps & Makeovers",
      desc: "Book customized bridal or groom packages",
      code: "BRIDAL20",
      bgImage: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=600&q=80",
      textColor: "#FFFFFF"
    }
  ],

  categories: [
    { id: "combos", name: "Combos", icon: "gift" },
    { id: "haircut", name: "Haircut", icon: "scissors" },
    { id: "makeup", name: "Makeup", icon: "sparkles" },
    { id: "nails", name: "Nails", icon: "hand" },
    { id: "spa", name: "Spa", icon: "wind" },
    { id: "colour", name: "Hair Colour", icon: "palette" },
    { id: "facial", name: "Facial", icon: "face-smile" },
    { id: "bridal", name: "Bridal", icon: "award" }
  ],

  stylists: [
    { id: "st_1", name: "Rahul Sharma", role: "Master Hair Stylist", rating: 4.9, reviews: 142, avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80" },
    { id: "st_2", name: "Priya Nair", role: "Senior Skin Consultant", rating: 4.8, reviews: 98, avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80" },
    { id: "st_3", name: "Amit Patel", role: "Nail Art Specialist", rating: 4.7, reviews: 85, avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80" },
    { id: "st_4", name: "Neha Sen", role: "Bridal Makeup Lead", rating: 4.9, reviews: 210, avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&q=80" },
    { id: "st_5", name: "Vikram Singh", role: "Massage Therapist", rating: 4.8, reviews: 76, avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=150&q=80" }
  ],

  salons: [
    {
      id: "salon_1",
      name: "Luxe Studio Salon",
      type: "Unisex",
      rating: 4.8,
      reviewsCount: 382,
      distance: "1.2 km",
      duration: "10 mins",
      priceRange: "₹₹",
      startingPrice: 350,
      image: "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=600&q=80",
      location: "Koregaon Park, Pune",
      coordinates: { x: 45, y: 35 }, // map representation %
      openStatus: "Open now",
      isOpen: true,
      slotsLeft: 3,
      about: "Luxe Studio Salon is Koregaon Park's premier destination for high-end styling and body care. Offering state-of-the-art treatments with certified international products.",
      services: [
        { id: "s1_1", name: "Signature Haircut & Wash", category: "haircut", price: 499, time: "45 mins", desc: "Consultation, custom shampooing, cut, styling and product advice.", image: "https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&w=300&q=80" },
        { id: "s1_2", name: "Global Hair Colouring (L'Oreal)", category: "colour", price: 2499, time: "120 mins", desc: "All-over permanent colour matching your preference, includes conditioning.", image: "https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&w=300&q=80" },
        { id: "s1_3", name: "Detox Face Glow Treatment", category: "facial", price: 999, time: "60 mins", desc: "Hydrating deep cleanse exfoliation and face massage with active serums.", image: "https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?auto=format&fit=crop&w=300&q=80" },
        { id: "s1_4", name: "Luxury Pedicure & Foot Massage", category: "nails", price: 799, time: "50 mins", desc: "Relaxing warm water herbal soak, nail shaping, scrubbing, mask and massage.", image: "https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=300&q=80" },
        { id: "s1_5", name: "Bridal HD Makeup Trial", category: "bridal", price: 3999, time: "90 mins", desc: "HD makeup consultation and setup by senior artists for your special day.", image: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=300&q=80" },
        { id: "s1_6", name: "Haircut + Face Glow Combo", category: "combos", price: 1299, time: "90 mins", desc: "Premium haircut, wash, and detox facial combo.", image: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=300&q=80" }
      ],
      stylistIds: ["st_1", "st_2", "st_4"]
    },
    {
      id: "salon_2",
      name: "The Hair Loft",
      type: "Unisex",
      rating: 4.6,
      reviewsCount: 215,
      distance: "2.4 km",
      duration: "18 mins",
      priceRange: "₹",
      startingPrice: 200,
      image: "https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&w=600&q=80",
      location: "Aundh, Pune",
      coordinates: { x: 25, y: 40 },
      openStatus: "Open now",
      isOpen: true,
      slotsLeft: 5,
      about: "The Hair Loft offers trendy and affordable styling options in a warm, relaxed space. Perfect for regular grooming and modern haircuts.",
      services: [
        { id: "s2_1", name: "Classic Haircut & Beard Grooming", category: "haircut", price: 350, time: "40 mins", desc: "Standard haircut with personalized beard trim, hot towel massage.", image: "https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&w=300&q=80" },
        { id: "s2_2", name: "Beard Spa & Steam", category: "haircut", price: 200, time: "20 mins", desc: "Organic oils massage, hot steam, line trim and conditioning balm application.", image: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=300&q=80" },
        { id: "s2_3", name: "Deep Conditioning Hair Spa", category: "haircut", price: 899, time: "60 mins", desc: "Nourishing cream mask application, steam, massage and serum spray.", image: "https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&w=300&q=80" },
        { id: "s2_4", name: "Root Touch-up (No Ammonia)", category: "colour", price: 799, time: "60 mins", desc: "Precision grey coverage roots coloring for natural looking shine.", image: "https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&w=300&q=80" },
        { id: "s2_5", name: "Trend Haircut + Beard Spa Combo", category: "combos", price: 499, time: "60 mins", desc: "Trendy haircut, wash, and organic beard spa combo package.", image: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=300&q=80" }
      ],
      stylistIds: ["st_1", "st_3"]
    },
    {
      id: "salon_3",
      name: "Glow Beauty Bar",
      type: "Women Only",
      rating: 4.7,
      reviewsCount: 310,
      distance: "0.8 km",
      duration: "7 mins",
      priceRange: "₹₹",
      startingPrice: 400,
      image: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=600&q=80",
      location: "Kalyani Nagar, Pune",
      coordinates: { x: 55, y: 25 },
      openStatus: "Open now",
      isOpen: true,
      slotsLeft: 2,
      about: "Glow Beauty Bar specialize in premium skin therapies, nail extensions and customized makeup, created specifically for modern women.",
      services: [
        { id: "s3_1", name: "Gel Nail Extensions & Art", category: "nails", price: 1499, time: "80 mins", desc: "Full-set gel extensions with custom nail paint art, stones and top coat.", image: "https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=300&q=80" },
        { id: "s3_2", name: "O3+ Radiance D-Tan Facial", category: "facial", price: 1800, time: "75 mins", desc: "Multi-step premium facial for instant glow, tan removal and skin hydration.", image: "https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?auto=format&fit=crop&w=300&q=80" },
        { id: "s3_3", name: "Classic Party Makeup", category: "makeup", price: 2499, time: "60 mins", desc: "Glamorous party look including eyelashes, contour and high-definition products.", image: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=300&q=80" },
        { id: "s3_4", name: "Full Arms & Legs Fruit Waxing", category: "spa", price: 599, time: "45 mins", desc: "Gentle organic fruit wax application, standard soothing lotion massage.", image: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=300&q=80" }
      ],
      stylistIds: ["st_2", "st_3", "st_4"]
    },
    {
      id: "salon_4",
      name: "Royal Men's Grooming Lounge",
      type: "Men Only",
      rating: 4.9,
      reviewsCount: 520,
      distance: "3.1 km",
      duration: "22 mins",
      priceRange: "₹₹₹",
      startingPrice: 600,
      image: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=600&q=80",
      location: "FC Road, Pune",
      coordinates: { x: 20, y: 70 },
      openStatus: "Open now",
      isOpen: true,
      slotsLeft: 4,
      about: "A vintage-inspired club for modern gentlemen. Premium hair services, signature shaves, and executive facial massages.",
      services: [
        { id: "s4_1", name: "Signature Haircut & Scalp Scrub", category: "haircut", price: 600, time: "50 mins", desc: "Royal treatment with customized haircut, exfoliating scalp massage, and wash.", image: "https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&w=300&q=80" },
        { id: "s4_2", name: "Luxury Charcoal Face Mask", category: "facial", price: 799, time: "30 mins", desc: "Pore-clearing peel-off charcoal mask, ice massage and hydrating lotion.", image: "https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?auto=format&fit=crop&w=300&q=80" },
        { id: "s4_3", name: "Royal Beard Styling & Shave", category: "haircut", price: 450, time: "35 mins", desc: "Straight-razor clean shave or beard line styling with hot essential oil towels.", image: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=300&q=80" }
      ],
      stylistIds: ["st_1", "st_5"]
    },
    {
      id: "salon_5",
      name: "Nirvaan Spa & Wellness",
      type: "Unisex",
      rating: 4.5,
      reviewsCount: 180,
      distance: "4.5 km",
      duration: "30 mins",
      priceRange: "₹₹₹",
      startingPrice: 1200,
      image: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=600&q=80",
      location: "Baner, Pune",
      coordinates: { x: 10, y: 30 },
      openStatus: "Closed (Opens 9 AM)",
      isOpen: false,
      slotsLeft: 0,
      about: "An oasis of peace. Restorative therapy, Swedish oil massages and deep-tissue body treatments that wash your stress away.",
      services: [
        { id: "s5_1", name: "Swedish Full Body Massage", category: "spa", price: 1999, time: "60 mins", desc: "Traditional therapeutic massage using natural aroma oils to release muscle tension.", image: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=300&q=80" },
        { id: "s5_2", name: "Deep Tissue Muscle Therapy", category: "spa", price: 2499, time: "90 mins", desc: "Focuses on deeper muscle layers to target chronic stiffness. Includes hot therapy stones.", image: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=300&q=80" },
        { id: "s5_3", name: "Aroma Steam Bath & Body Polish", category: "spa", price: 1200, time: "40 mins", desc: "Full body sea-salt exfoliation scrub followed by detox steam cabin treatment.", image: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=300&q=80" }
      ],
      stylistIds: ["st_5"]
    },
    {
      id: "salon_6",
      name: "Elegance Bridal Studio",
      type: "Women Only",
      rating: 4.9,
      reviewsCount: 95,
      distance: "1.9 km",
      duration: "14 mins",
      priceRange: "₹₹₹",
      startingPrice: 1500,
      image: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=600&q=80",
      location: "Viman Nagar, Pune",
      coordinates: { x: 65, y: 30 },
      openStatus: "Open now",
      isOpen: true,
      slotsLeft: 1,
      about: "Specialized in luxury bridal treatments, pre-bridal grooming rituals and wedding ceremony makeup by celebrated professionals.",
      services: [
        { id: "s6_1", name: "Pre-Bridal Glow Package (Gold)", category: "bridal", price: 9999, time: "180 mins", desc: "Ultimate pre-wedding glow combo: facial, body polishing, hair spa, threading and manicure.", image: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=300&q=80" },
        { id: "s6_2", name: "Bridal Airbrush Makeup", category: "bridal", price: 15000, time: "120 mins", desc: "High-definition flawless airbrush bridal makeup application, includes hair styling.", image: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=300&q=80" },
        { id: "s6_3", name: "Mehendi & Sangeet Makeup Look", category: "makeup", price: 4999, time: "90 mins", desc: "Traditional luminous makeup matching your festival outfit theme.", image: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=300&q=80" }
      ],
      stylistIds: ["st_4", "st_2"]
    }
  ],

  bookings: [
    {
      id: "bk_1",
      salonId: "salon_1",
      salonName: "Luxe Studio Salon",
      salonImage: "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=600&q=80",
      serviceName: "Signature Haircut & Wash",
      price: 499,
      paid: 100, // advance amount
      remaining: 399,
      date: "Tomorrow, 25 July",
      time: "11:30 AM",
      stylist: "Rahul Sharma",
      status: "Confirmed",
      isUpcoming: true
    },
    {
      id: "bk_hist_1",
      salonId: "salon_2",
      salonName: "The Hair Loft",
      salonImage: "https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&w=600&q=80",
      serviceName: "Classic Haircut & Beard Grooming",
      price: 350,
      paid: 350,
      date: "12 July 2026",
      time: "04:00 PM",
      stylist: "Rahul Sharma",
      status: "Completed",
      isUpcoming: false,
      rating: 5,
      reviewed: true
    },
    {
      id: "bk_hist_2",
      salonId: "salon_3",
      salonName: "Glow Beauty Bar",
      salonImage: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=600&q=80",
      serviceName: "O3+ Radiance D-Tan Facial",
      price: 1800,
      paid: 1800,
      date: "28 June 2026",
      time: "02:30 PM",
      stylist: "Priya Nair",
      status: "Completed",
      isUpcoming: false,
      rating: null,
      reviewed: false
    }
  ],

  favourites: {
    salonIds: ["salon_1", "salon_3"],
    serviceIds: ["s2_1", "s3_1", "s4_3"]
  }
};
