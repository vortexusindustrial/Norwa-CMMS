// Single source of truth for project status. Every status-derived visual —
// list badges, the status tracker, and map marker/legend colors — reads
// from PROJECT_STATUS_META so they can never drift out of sync.
export const PROJECT_STATUSES = ['queued', 'assigned', 'in_progress', 'completed']

export const PROJECT_STATUS_META = {
  queued: {
    label: 'Queued',
    order: 0,
    badgeClass: 'bg-gray-100 text-gray-600',
    markerColor: '#9CA3AF',
  },
  assigned: {
    label: 'Assigned',
    order: 1,
    badgeClass: 'bg-violet-100 text-violet-700',
    markerColor: '#6846E3',
  },
  in_progress: {
    label: 'In Progress',
    order: 2,
    badgeClass: 'bg-amber-100 text-amber-700',
    markerColor: '#F59E0B',
  },
  completed: {
    label: 'Completed',
    order: 3,
    badgeClass: 'bg-green-100 text-green-700',
    markerColor: '#22C55E',
  },
}

export const projects = [
  {
    id: 'PRJ-2026-001',
    name: 'Two Rivers Mall HVAC Retrofit',
    status: 'in_progress',
    client: {
      name: 'Two Rivers Lifestyle Centre Ltd',
      contactPerson: 'Grace Wanjiru',
      email: 'grace.wanjiru@tworivers.co.ke',
      phone: '+254 712 345 678',
    },
    site: {
      address: 'Two Rivers Mall, Limuru Road, Ruaka',
      city: 'Nairobi',
      lat: -1.2136,
      lng: 36.7893,
    },
    technician: { name: 'Samuel Kiptoo', phone: '+254 733 210 456' },
    dates: { start: '2026-04-01', targetEnd: '2026-09-30' },
    scope:
      'Retrofit of existing HVAC plant across 3 floors of retail space, including chiller replacement, ductwork upgrade, and BMS integration for energy monitoring.',
  },
  {
    id: 'PRJ-2026-002',
    name: 'Tatu City Water Treatment Plant',
    status: 'assigned',
    client: {
      name: 'Tatu City Ltd',
      contactPerson: 'Peter Mwangi',
      email: 'peter.mwangi@tatucity.com',
      phone: '+254 720 112 233',
    },
    site: {
      address: 'Tatu City Industrial Park, Ruiru',
      city: 'Kiambu',
      lat: -1.15,
      lng: 36.9333,
    },
    technician: { name: 'Elijah Mutuku', phone: '+254 701 884 220' },
    dates: { start: '2026-09-01', targetEnd: '2027-02-28' },
    scope:
      'Installation of a new 500m3/day water treatment plant serving the industrial park, including filtration, chlorination, and pump house construction.',
  },
  {
    id: 'PRJ-2026-003',
    name: 'Garden City Backup Generator Install',
    status: 'completed',
    client: {
      name: 'Garden City Mall Kenya',
      contactPerson: 'Susan Achieng',
      email: 'susan.achieng@gardencity.co.ke',
      phone: '+254 733 998 271',
    },
    site: {
      address: 'Garden City Mall, Thika Road',
      city: 'Nairobi',
      lat: -1.2244,
      lng: 36.8886,
    },
    technician: { name: 'Faith Chebet', phone: '+254 712 903 771' },
    dates: { start: '2026-01-15', targetEnd: '2026-03-20' },
    scope:
      'Supply and installation of a 1000kVA standby generator with automatic transfer switch and acoustic enclosure for the mall backup power system.',
  },
  {
    id: 'PRJ-2026-004',
    name: 'Nairobi CBD Office Tower Fire Suppression Upgrade',
    status: 'in_progress',
    client: {
      name: 'Kenyatta Avenue Properties Ltd',
      contactPerson: 'Daniel Kiprotich',
      email: 'daniel.kiprotich@kap.co.ke',
      phone: '+254 700 445 812',
    },
    site: {
      address: 'Kenyatta Avenue, CBD',
      city: 'Nairobi',
      lat: -1.2864,
      lng: 36.8172,
    },
    technician: { name: 'Dennis Otieno', phone: '+254 720 556 812' },
    dates: { start: '2026-05-10', targetEnd: '2026-11-15' },
    scope:
      'Full replacement of the fire suppression and sprinkler system across a 22-floor office tower, including riser upgrades and fire pump commissioning.',
  },
  {
    id: 'PRJ-2026-005',
    name: 'Kilimani Residential Solar + Battery',
    status: 'queued',
    client: {
      name: 'Kilimani Heights Residents Association',
      contactPerson: 'Mercy Njeri',
      email: 'mercy.njeri@kilimaniheights.co.ke',
      phone: '+254 711 220 998',
    },
    site: {
      address: 'Kilimani Heights, Wood Avenue',
      city: 'Nairobi',
      lat: -1.2921,
      lng: 36.7833,
    },
    dates: { start: '2026-10-05', targetEnd: '2027-01-15' },
    scope:
      'Rooftop solar PV array with battery storage sized to cover common-area loads and provide backup power during outages for a 6-block residential complex.',
  },
  {
    id: 'PRJ-2026-006',
    name: 'JKIA Cargo Terminal Cold Storage Refit',
    status: 'assigned',
    client: {
      name: 'Kenya Airports Authority',
      contactPerson: 'James Odhiambo',
      email: 'james.odhiambo@kaa.go.ke',
      phone: '+254 722 664 501',
    },
    site: {
      address: 'JKIA Cargo Terminal, Embakasi',
      city: 'Nairobi',
      lat: -1.3192,
      lng: 36.9278,
    },
    technician: { name: 'Collins Barasa', phone: '+254 733 447 190' },
    dates: { start: '2026-03-01', targetEnd: '2026-08-31' },
    scope:
      'Refit of two cold storage chambers with new refrigeration units, insulated panelling, and continuous temperature monitoring for perishable cargo handling.',
  },
  {
    id: 'PRJ-2026-007',
    name: 'Karen Business Park Elevator Modernization',
    status: 'completed',
    client: {
      name: 'Karen Business Park Ltd',
      contactPerson: 'Alice Wambui',
      email: 'alice.wambui@karenbp.co.ke',
      phone: '+254 704 337 620',
    },
    site: {
      address: 'Karen Business Park, Langata Road',
      city: 'Nairobi',
      lat: -1.3197,
      lng: 36.7076,
    },
    technician: { name: 'Winnie Adhiambo', phone: '+254 700 928 315' },
    dates: { start: '2025-11-01', targetEnd: '2026-02-10' },
    scope:
      'Modernization of 4 passenger elevators including new controllers, machine-room-less drives, and cab interior refurbishment across the office park.',
  },
  {
    id: 'PRJ-2026-008',
    name: 'Westlands Data Center Cooling Expansion',
    status: 'queued',
    client: {
      name: 'Westlands Digital Hub Ltd',
      contactPerson: 'Brian Otieno',
      email: 'brian.otieno@wdh.co.ke',
      phone: '+254 728 556 903',
    },
    site: {
      address: 'Waiyaki Way, Westlands',
      city: 'Nairobi',
      lat: -1.2648,
      lng: 36.8028,
    },
    dates: { start: '2026-11-01', targetEnd: '2027-03-31' },
    scope:
      'Expansion of the precision cooling plant to support two additional server halls, including new CRAC units and hot/cold aisle containment.',
  },
]
