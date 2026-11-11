const MUNICIPALITIES = [
  "Maasin City", "Sogod", "Padre Burgos", "Limasawa", "Malitbog", "Macrohon",
  "Bontoc", "Tomas Oppus", "Saint Bernard", "San Juan", "Anahawan", "Hinunangan",
  "Hinundayan", "Silago", "Libagon", "Liloan", "San Francisco", "Pintuyan", "San Ricardo"
];

// Attractions named in the project brief. Fees, hours and contacts stay null
// until they are verified from an official source.
const DESTINATIONS = [
  { id: 1, name: "Limasawa Island", municipality: "Limasawa", icon: "🏝️",
    description: "Island municipality of Southern Leyte.", fee: null, hours: null, verified: false },
  { id: 2, name: "Monte Cueva Shrine", municipality: null, icon: "⛪",
    description: "Shrine listed in the project brief. Location to be verified.", fee: null, hours: null, verified: false },
  { id: 3, name: "Agas-Agas Bridge", municipality: "Sogod", icon: "🌉",
    description: "Well-known bridge in Sogod.", fee: null, hours: null, verified: false },
  { id: 4, name: "Sogod Bay", municipality: "Sogod", icon: "🌊",
    description: "Bay in Southern Leyte, popular for marine tourism.", fee: null, hours: null, verified: false }
];

const HOTELS = [ { id: 1, name: "DEMO Seaside Resort", municipality: "Padre Burgos", description: "Sample resort for testing bookings.",
    facilities: ["Wi-Fi", "Pool", "Parking"], checkIn: "2:00 PM", checkOut: "12:00 PM",
    rooms: [{ type: "Standard Room", price: 1500, sleeps: 2, units: 2 }, { type: "Family Room", price: 2800, sleeps: 5, units: 1 }] },
  { id: 2, name: "DEMO Town Center Inn", municipality: "Maasin City", description: "Sample inn for testing bookings.",
    facilities: ["Wi-Fi", "Air-conditioning"], checkIn: "1:00 PM", checkOut: "11:00 AM",
    rooms: [{ type: "Single Room", price: 900, sleeps: 1, units: 3 }, { type: "Double Room", price: 1400, sleeps: 2, units: 2 }] },
  { id: 3, name: "DEMO Hillview Lodge", municipality: "Sogod", description: "Sample lodge for testing bookings.",
    facilities: ["Wi-Fi", "Breakfast"], checkIn: "2:00 PM", checkOut: "12:00 PM",
    rooms: [{ type: "Standard Room", price: 1200, sleeps: 2, units: 2 }] }];     
const RESTAURANTS = [{ id: 1, name: "DEMO Kusina Corner", municipality: "Maasin City", hours: "8:00 AM - 8:00 PM",
    menu: [{ name: "Chicken Adobo", desc: "Sample dish", price: 120 }, { name: "Sinigang na Baboy", desc: "Sample dish", price: 140 },
           { name: "Steamed Rice", desc: "Sample side", price: 20 }, { name: "Iced Tea", desc: "Sample drink", price: 35 }] },
  { id: 2, name: "DEMO Bay Cafe", municipality: "Sogod", hours: "9:00 AM - 9:00 PM",
    menu: [{ name: "Grilled Fish", desc: "Sample dish", price: 180 }, { name: "Pancit Canton", desc: "Sample dish", price: 100 },
           { name: "Halo-Halo", desc: "Sample dessert", price: 75 }] }];  
const SCHOOLS = [];      // filled in a later step

// Map categories. "selectors" are OpenStreetMap tags used to fetch REAL places.
const CATEGORIES = [
  { key: "hotel", label: "Hotels & Resorts", icon: "🏨", color: "#0077b6",
    selectors: ['["tourism"~"hotel|resort|guest_house|hostel|motel"]'] },
  { key: "food", label: "Restaurants & Cafes", icon: "🍽️", color: "#e76f51",
    selectors: ['["amenity"~"restaurant|cafe|fast_food"]'] },
  { key: "attraction", label: "Tourist Attractions", icon: "📸", color: "#9b5de5",
    selectors: ['["tourism"~"attraction|viewpoint|museum"]'] },
  { key: "school", label: "Schools & Universities", icon: "🎓", color: "#f4a261",
    selectors: ['["amenity"~"school|college|university"]'] },
  { key: "hospital", label: "Hospitals", icon: "🏥", color: "#d62828",
    selectors: ['["amenity"~"hospital|clinic"]'] },
  { key: "shopping", label: "Shopping Centers", icon: "🛍️", color: "#e5989b",
    selectors: ['["shop"~"mall|supermarket|department_store"]'] },
  { key: "transport", label: "Transport Terminals", icon: "🚌", color: "#457b9d",
    selectors: ['["amenity"~"bus_station|ferry_terminal"]'] },
  { key: "nature", label: "Beaches & Nature", icon: "🏖️", color: "#2a9d8f",
    selectors: ['["natural"~"beach|cave_entrance"]', '["waterway"="waterfall"]'] }
  ]
