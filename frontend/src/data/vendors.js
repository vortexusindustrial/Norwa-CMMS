// Vendor master records. Purchase orders still reference vendors by
// free-text vendorName (see procurement.js) — linking POs to these records
// is a separate follow-up, not part of this data set.

export const VENDOR_STATUS_META = {
  active: { label: 'Active', badgeClass: 'bg-green-100 text-green-700' },
  inactive: { label: 'Inactive', badgeClass: 'bg-gray-100 text-gray-500' },
}

export const vendors = [
  {
    id: 'VND-001',
    name: 'Kentherm Industrial Supplies',
    contactName: 'Josephine Mumo',
    email: 'josephine.mumo@kentherm.co.ke',
    phone: '+254 722 445 108',
    address: 'Enterprise Road, Industrial Area, Nairobi',
    status: 'active',
  },
  {
    id: 'VND-002',
    name: 'Coastal Refrigeration Ltd',
    contactName: 'Hassan Abdi',
    email: 'hassan.abdi@coastalrefrig.co.ke',
    phone: '+254 733 118 902',
    address: 'Mombasa Road, Mombasa',
    status: 'active',
  },
  {
    id: 'VND-003',
    name: 'Rift Valley Pumps & Motors',
    contactName: 'Lydia Chepkoech',
    email: 'lydia.chepkoech@rvpm.co.ke',
    phone: '+254 715 902 447',
    address: 'Kenyatta Avenue, Nakuru',
    status: 'inactive',
  },
]
