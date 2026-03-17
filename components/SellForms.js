'use client';
import { Loader2 } from 'lucide-react';

/* ─── Shared input styles ─── */
const IC = "w-full px-3.5 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 transition";
const IS = { background: '#f8fafc', border: '1.5px solid #d0dce8', color: '#0f1f35' };
const ISF = { '--tw-ring-color': '#1E4F7A' };
const LC = "block text-xs font-semibold mb-1.5 uppercase tracking-wider";
const LS = { color: '#1E4F7A' };

/* ─── Service-specific extra fields per category ─── */
export const SERVICE_SPECIFIC_FIELDS = {
  'Event Planner': [
    { name: 'eventTypes',      label: 'Event Types Handled',    type: 'text',   placeholder: 'Wedding, Birthday, Corporate, Anniversary...' },
    { name: 'capacity',        label: 'Max Guest Capacity',     type: 'number', placeholder: '500' },
    { name: 'venueType',       label: 'Venue Type',             type: 'select', options: ['Indoor', 'Outdoor', 'Both'] },
    { name: 'cateringIncluded',label: 'Catering Included',      type: 'select', options: ['Yes', 'No', 'Optional Add-on'] },
    { name: 'decorIncluded',   label: 'Decoration Included',    type: 'select', options: ['Yes', 'No', 'Optional Add-on'] },
    { name: 'startingPrice',   label: 'Starting Package Price (₹)', type: 'number', placeholder: '50000' },
    { name: 'experience',      label: 'Years of Experience',    type: 'number', placeholder: '5' },
  ],
  'Hospitality': [
    { name: 'propertyType',    label: 'Property Type',          type: 'select', options: ['Hotel', 'Resort', 'Homestay', 'Villa', 'Hostel', 'Guest House'] },
    { name: 'starRating',      label: 'Star Rating',            type: 'select', options: ['1 Star', '2 Star', '3 Star', '4 Star', '5 Star', 'Unrated'] },
    { name: 'totalRooms',      label: 'Total Rooms',            type: 'number', placeholder: '20' },
    { name: 'amenities',       label: 'Amenities',              type: 'text',   placeholder: 'WiFi, Pool, Gym, Restaurant, Parking...' },
    { name: 'pricePerNight',   label: 'Price Per Night (₹)',    type: 'number', placeholder: '2000' },
    { name: 'checkIn',         label: 'Check-in Time',          type: 'text',   placeholder: '12:00 PM' },
    { name: 'checkOut',        label: 'Check-out Time',         type: 'text',   placeholder: '11:00 AM' },
  ],
  'Pharmacy': [
    { name: 'licenseNumber',   label: 'Drug License Number',    type: 'text',   placeholder: 'DL-XXXX-XXXX' },
    { name: 'deliveryAvailable',label: 'Home Delivery',         type: 'select', options: ['Yes', 'No'] },
    { name: 'open24x7',        label: 'Open 24×7',              type: 'select', options: ['Yes', 'No'] },
    { name: 'timings',         label: 'Operating Hours',        type: 'text',   placeholder: '8:00 AM – 10:00 PM' },
    { name: 'specialization',  label: 'Specialization',         type: 'text',   placeholder: 'Ayurvedic, Homeopathic, Allopathic, All...' },
    { name: 'insuranceAccepted',label: 'Insurance Accepted',    type: 'select', options: ['Yes', 'No'] },
  ],
  'Hospitals': [
    { name: 'specialties',     label: 'Medical Specialties',    type: 'text',   placeholder: 'Cardiology, Orthopedics, Neurology...' },
    { name: 'totalBeds',       label: 'Total Beds',             type: 'number', placeholder: '100' },
    { name: 'emergencyServices',label: '24×7 Emergency',        type: 'select', options: ['Yes', 'No'] },
    { name: 'icuAvailable',    label: 'ICU Available',          type: 'select', options: ['Yes', 'No'] },
    { name: 'insuranceAccepted',label: 'Insurance Accepted',    type: 'text',   placeholder: 'CGHS, ESI, Star Health, Mediclaim...' },
    { name: 'accreditation',   label: 'Accreditation',          type: 'text',   placeholder: 'NABH, JCI, ISO...' },
    { name: 'ambulanceService',label: 'Ambulance Service',      type: 'select', options: ['Yes', 'No'] },
  ],
  'Gym & Fitness': [
    { name: 'facilities',      label: 'Facilities',             type: 'text',   placeholder: 'Cardio, Weight Training, Yoga, Zumba...' },
    { name: 'trainersAvailable',label: 'Personal Trainers',     type: 'select', options: ['Yes', 'No'] },
    { name: 'membershipPlans', label: 'Membership Plans',       type: 'text',   placeholder: 'Monthly ₹999, Quarterly ₹2499, Annual ₹7999' },
    { name: 'timings',         label: 'Operating Hours',        type: 'text',   placeholder: '5:00 AM – 10:00 PM' },
    { name: 'genderType',      label: 'Gender',                 type: 'select', options: ['Unisex', 'Male Only', 'Female Only'] },
    { name: 'steamSauna',      label: 'Steam / Sauna',          type: 'select', options: ['Yes', 'No'] },
  ],
  'Farmhouse': [
    { name: 'capacity',        label: 'Guest Capacity',         type: 'number', placeholder: '100' },
    { name: 'area',            label: 'Area (sq ft / acres)',   type: 'text',   placeholder: '2 acres' },
    { name: 'amenities',       label: 'Amenities',              type: 'text',   placeholder: 'Pool, Bonfire, Lawn, Parking, Catering...' },
    { name: 'poolAvailable',   label: 'Swimming Pool',          type: 'select', options: ['Yes', 'No'] },
    { name: 'cateringAvailable',label: 'Catering Available',    type: 'select', options: ['Yes', 'No', 'Outside Allowed'] },
    { name: 'pricePerDay',     label: 'Price Per Day (₹)',      type: 'number', placeholder: '15000' },
    { name: 'overnightStay',   label: 'Overnight Stay',         type: 'select', options: ['Allowed', 'Not Allowed'] },
  ],
  'Hotel Bookings': [
    { name: 'hotelType',       label: 'Hotel Type',             type: 'select', options: ['Budget', 'Business', 'Luxury', 'Boutique', 'Heritage'] },
    { name: 'starRating',      label: 'Star Rating',            type: 'select', options: ['1 Star', '2 Star', '3 Star', '4 Star', '5 Star'] },
    { name: 'totalRooms',      label: 'Total Rooms',            type: 'number', placeholder: '50' },
    { name: 'roomTypes',       label: 'Room Types',             type: 'text',   placeholder: 'Standard, Deluxe, Suite, Family Room...' },
    { name: 'amenities',       label: 'Amenities',              type: 'text',   placeholder: 'WiFi, AC, TV, Room Service, Parking...' },
    { name: 'breakfastIncluded',label: 'Breakfast Included',    type: 'select', options: ['Yes', 'No', 'Optional'] },
    { name: 'pricePerNight',   label: 'Starting Price/Night (₹)', type: 'number', placeholder: '1500' },
  ],
  'Corporate': [
    { name: 'servicesOffered', label: 'Services Offered',       type: 'text',   placeholder: 'IT, Consulting, HR, Legal, Finance...' },
    { name: 'teamSize',        label: 'Team Size',              type: 'select', options: ['1-10', '11-50', '51-200', '200+'] },
    { name: 'industriesServed',label: 'Industries Served',      type: 'text',   placeholder: 'Healthcare, Finance, Retail, Tech...' },
    { name: 'yearsInBusiness', label: 'Years in Business',      type: 'number', placeholder: '5' },
    { name: 'certifications',  label: 'Certifications',         type: 'text',   placeholder: 'ISO 9001, CMMI, PCI DSS...' },
    { name: 'projectTypes',    label: 'Project Types',          type: 'text',   placeholder: 'Short-term, Long-term, Retainer...' },
  ],
  'Sports': [
    { name: 'sportsTypes',     label: 'Sports / Activities',    type: 'text',   placeholder: 'Cricket, Football, Badminton, Swimming...' },
    { name: 'coachingAvailable',label: 'Coaching Available',    type: 'select', options: ['Yes', 'No'] },
    { name: 'equipmentRental', label: 'Equipment Rental',       type: 'select', options: ['Yes', 'No'] },
    { name: 'groundSize',      label: 'Ground / Court Size',    type: 'text',   placeholder: 'Full size, Half size, Indoor...' },
    { name: 'timings',         label: 'Operating Hours',        type: 'text',   placeholder: '6:00 AM – 9:00 PM' },
    { name: 'membershipPlans', label: 'Membership / Fees',      type: 'text',   placeholder: 'Monthly ₹500, Per session ₹100...' },
  ],
  'Beauty': [
    { name: 'servicesOffered', label: 'Services Offered',       type: 'text',   placeholder: 'Hair, Skin, Nails, Makeup, Waxing, Facial...' },
    { name: 'genderType',      label: 'Serves',                 type: 'select', options: ['Unisex', 'Ladies Only', 'Gents Only'] },
    { name: 'homeServiceAvailable', label: 'Home Service',      type: 'select', options: ['Yes', 'No'] },
    { name: 'experience',      label: 'Years of Experience',    type: 'number', placeholder: '3' },
    { name: 'timings',         label: 'Operating Hours',        type: 'text',   placeholder: '9:00 AM – 8:00 PM' },
    { name: 'brands',          label: 'Brands Used',            type: 'text',   placeholder: 'Loreal, Schwarzkopf, OPI...' },
  ],
  'Food': [
    { name: 'cuisineType',     label: 'Cuisine Type',           type: 'text',   placeholder: 'North Indian, South Indian, Chinese, Italian...' },
    { name: 'seatingCapacity', label: 'Seating Capacity',       type: 'number', placeholder: '50' },
    { name: 'deliveryAvailable',label: 'Home Delivery',         type: 'select', options: ['Yes', 'No'] },
    { name: 'foodType',        label: 'Food Type',              type: 'select', options: ['Pure Veg', 'Non-Veg', 'Both Veg & Non-Veg'] },
    { name: 'timings',         label: 'Operating Hours',        type: 'text',   placeholder: '11:00 AM – 11:00 PM' },
    { name: 'avgCostForTwo',   label: 'Avg Cost for Two (₹)',   type: 'number', placeholder: '500' },
    { name: 'dineInAvailable', label: 'Dine-in Available',      type: 'select', options: ['Yes', 'No'] },
  ],
  'Dentists': [
    { name: 'specializations', label: 'Specializations',        type: 'text',   placeholder: 'Orthodontics, Implants, Root Canal, Cosmetic...' },
    { name: 'experience',      label: 'Years of Experience',    type: 'number', placeholder: '8' },
    { name: 'emergencyAvailable',label: 'Emergency Services',   type: 'select', options: ['Yes', 'No'] },
    { name: 'insuranceAccepted',label: 'Insurance Accepted',    type: 'select', options: ['Yes', 'No'] },
    { name: 'timings',         label: 'Clinic Hours',           type: 'text',   placeholder: 'Mon-Sat: 9:00 AM – 7:00 PM' },
    { name: 'consultationFee', label: 'Consultation Fee (₹)',   type: 'number', placeholder: '300' },
    { name: 'equipment',       label: 'Equipment / Technology', type: 'text',   placeholder: 'Digital X-Ray, Laser, CAD/CAM...' },
  ],
  'Driving Schools': [
    { name: 'vehicleTypes',    label: 'Vehicle Types',          type: 'text',   placeholder: 'Car (Manual), Car (Auto), Bike, Heavy Vehicle...' },
    { name: 'courseDuration',  label: 'Course Duration',        type: 'text',   placeholder: '15 days, 1 month...' },
    { name: 'licenseTypes',    label: 'License Types',          type: 'text',   placeholder: 'LMV, HMV, Motorcycle...' },
    { name: 'pickupAvailable', label: 'Home Pickup',            type: 'select', options: ['Yes', 'No'] },
    { name: 'courseFee',       label: 'Course Fee (₹)',         type: 'number', placeholder: '3000' },
    { name: 'rtoAssistance',   label: 'RTO Assistance',         type: 'select', options: ['Yes', 'No'] },
    { name: 'timings',         label: 'Training Hours',         type: 'text',   placeholder: '6:00 AM – 8:00 PM' },
  ],
  'PG & Rentals': [
    { name: 'propertyType',    label: 'Property Type',          type: 'select', options: ['PG', 'Hostel', 'Flat / Apartment', 'Room', 'House', 'Villa'] },
    { name: 'furnishing',      label: 'Furnishing',             type: 'select', options: ['Fully Furnished', 'Semi Furnished', 'Unfurnished'] },
    { name: 'genderPreference',label: 'Gender Preference',      type: 'select', options: ['Any', 'Male Only', 'Female Only', 'Family Only'] },
    { name: 'amenities',       label: 'Amenities',              type: 'text',   placeholder: 'WiFi, AC, Meals, Laundry, Parking, CCTV...' },
    { name: 'mealsIncluded',   label: 'Meals Included',         type: 'select', options: ['Yes', 'No', 'Optional'] },
    { name: 'rentPerMonth',    label: 'Rent Per Month (₹)',     type: 'number', placeholder: '8000' },
    { name: 'deposit',         label: 'Security Deposit (₹)',   type: 'number', placeholder: '16000' },
  ],
};

const SERVICE_CATEGORIES = [
  { value: 'Event Planner',   label: '🎊 Event Planner – Weddings (All Functions)' },
  { value: 'Hospitality',     label: '✈️ Hospitality – Travel & Hotel Bookings' },
  { value: 'Pharmacy',        label: '💊 Pharmacy' },
  { value: 'Hospitals',       label: '🏥 Hospitals' },
  { value: 'Gym & Fitness',   label: '💪 Gym & Fitness' },
  { value: 'Farmhouse',       label: '🌾 Farmhouse Bookings' },
  { value: 'Hotel Bookings',  label: '🏨 Hotel Bookings' },
  { value: 'Corporate',       label: '💼 Corporate Services' },
  { value: 'Sports',          label: '⚽ Sports Services' },
  { value: 'Beauty',          label: '💄 Beauty Services' },
  { value: 'Food',            label: '🍔 Food & Restaurants' },
  { value: 'Dentists',        label: '🦷 Dentists' },
  { value: 'Driving Schools', label: '🚗 Driving Schools' },
  { value: 'PG & Rentals',    label: '🏠 PG / Hotels / Room Rentals / House Rentals' },
];

function DynamicField({ field, value, onChange }) {
  const baseClass = IC + " focus:ring-2";
  if (field.type === 'select') {
    return (
      <select name={'serviceDetails.' + field.name} value={value || ''} onChange={onChange}
        className={baseClass} style={{ ...IS, ...ISF }}>
        <option value="">Select {field.label}</option>
        {field.options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    );
  }
  return (
    <input type={field.type} name={'serviceDetails.' + field.name} value={value || ''}
      onChange={onChange} placeholder={field.placeholder}
      className={baseClass} style={{ ...IS, ...ISF }} />
  );
}

export function ServiceForm({ svc, onChange, onSubmit, onCancel, loading, nextFree, LISTING_FEE }) {
  const extraFields = SERVICE_SPECIFIC_FIELDS[svc.category] || [];

  return (
    <form onSubmit={onSubmit} className="p-5 space-y-4">

      {/* Basic Info */}
      <div className="rounded-xl p-4 space-y-3" style={{ background: '#f8fafc', border: '1px solid #e8f0f8' }}>
        <p className="text-xs font-bold uppercase tracking-wider" style={{ color: '#1E4F7A' }}>Basic Information</p>

        <div>
          <label className={LC} style={LS}>Business / Service Name *</label>
          <input type="text" name="shopName" value={svc.shopName} onChange={onChange} required
            placeholder="e.g. Royal Wedding Planners" className={IC + " focus:ring-2"} style={{ ...IS, ...ISF }} />
        </div>

        <div>
          <label className={LC} style={LS}>Service Category *</label>
          <select name="category" value={svc.category} onChange={onChange} required
            className={IC + " focus:ring-2"} style={{ ...IS, ...ISF }}>
            {SERVICE_CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
        </div>

        <div>
          <label className={LC} style={LS}>Description *</label>
          <textarea name="description" value={svc.description} onChange={onChange} required rows={3}
            placeholder="Describe your service in detail..." className={IC + " focus:ring-2 resize-none"} style={{ ...IS, ...ISF }} />
        </div>
      </div>

      {/* Service-Specific Fields */}
      {extraFields.length > 0 && (
        <div className="rounded-xl p-4 space-y-3" style={{ background: '#f0f9ff', border: '1px solid #bae6fd' }}>
          <p className="text-xs font-bold uppercase tracking-wider" style={{ color: '#0369a1' }}>
            {svc.category} — Specific Details
          </p>
          {extraFields.map(field => (
            <div key={field.name}>
              <label className={LC} style={{ color: '#0369a1' }}>{field.label}</label>
              <DynamicField field={field} value={svc.serviceDetails?.[field.name] || ''} onChange={onChange} />
            </div>
          ))}
        </div>
      )}

      {/* Location */}
      <div className="rounded-xl p-4 space-y-3" style={{ background: '#f8fafc', border: '1px solid #e8f0f8' }}>
        <p className="text-xs font-bold uppercase tracking-wider" style={{ color: '#1E4F7A' }}>Location</p>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={LC} style={LS}>City *</label>
            <input type="text" name="location.city" value={svc.location.city} onChange={onChange} required
              placeholder="Mumbai" className={IC + " focus:ring-2"} style={{ ...IS, ...ISF }} />
          </div>
          <div>
            <label className={LC} style={LS}>State *</label>
            <input type="text" name="location.state" value={svc.location.state} onChange={onChange} required
              placeholder="Maharashtra" className={IC + " focus:ring-2"} style={{ ...IS, ...ISF }} />
          </div>
        </div>
        <div>
          <label className={LC} style={LS}>Full Address</label>
          <input type="text" name="location.fullAddress" value={svc.location.fullAddress} onChange={onChange}
            placeholder="Shop/Office address" className={IC + " focus:ring-2"} style={{ ...IS, ...ISF }} />
        </div>
      </div>

      {/* Contact */}
      <div className="rounded-xl p-4 space-y-3" style={{ background: '#f8fafc', border: '1px solid #e8f0f8' }}>
        <p className="text-xs font-bold uppercase tracking-wider" style={{ color: '#1E4F7A' }}>Contact Details</p>
        <div>
          <label className={LC} style={LS}>Contact Person *</label>
          <input type="text" name="contactPerson" value={svc.contactPerson} onChange={onChange} required
            placeholder="Owner / Manager name" className={IC + " focus:ring-2"} style={{ ...IS, ...ISF }} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={LC} style={LS}>Mobile *</label>
            <input type="tel" name="mobile" value={svc.mobile} onChange={onChange} required
              placeholder="9876543210" className={IC + " focus:ring-2"} style={{ ...IS, ...ISF }} />
          </div>
          <div>
            <label className={LC} style={LS}>WhatsApp</label>
            <input type="tel" name="whatsapp" value={svc.whatsapp} onChange={onChange}
              placeholder="9876543210" className={IC + " focus:ring-2"} style={{ ...IS, ...ISF }} />
          </div>
        </div>
      </div>

      {/* Submit */}
      <div className="flex gap-3 pt-1">
        <button type="button" onClick={onCancel}
          className="flex-1 py-3 rounded-xl text-sm font-semibold border transition"
          style={{ borderColor: '#d0dce8', color: '#5a7a9a', background: '#ffffff' }}>
          Cancel
        </button>
        <button type="submit" disabled={loading}
          className="flex-1 py-3 rounded-xl text-sm font-semibold text-white disabled:opacity-50 shadow-md"
          style={{ background: 'linear-gradient(135deg, #1E4F7A, #2a6fa8)' }}>
          {loading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : nextFree ? '✅ List for FREE' : 'List (₹' + LISTING_FEE + ')'}
        </button>
      </div>
    </form>
  );
}
          Cancel
        </button>
        <button type="submit" disabled={loading}
          className="flex-1 py-3 rounded-xl text-sm font-semibold text-white disabled:opacity-50 shadow-md"
          style={{ background: 'linear-gradient(135deg, #1E4F7A, #2a6fa8)' }}>
          {loading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : nextFree ? '✅ List for FREE' : 'List (₹' + LISTING_FEE + ')'}
        </button>
      </div>
    </form>
  );
}

export function ProductForm({ prd, onChange, onSubmit, onCancel, loading, nextFree, LISTING_FEE }) {
  return (
    <form onSubmit={onSubmit} className="p-5 space-y-4">

      <div className="rounded-xl p-4 space-y-3" style={{ background: '#f8fafc', border: '1px solid #e8f0f8' }}>
        <p className="text-xs font-bold uppercase tracking-wider" style={{ color: '#1E4F7A' }}>Product Information</p>

        <div>
          <label className={LC} style={LS}>Product Name *</label>
          <input type="text" name="title" value={prd.title} onChange={onChange} required
            placeholder="e.g. Wedding Photography Package" className={IC + " focus:ring-2"} style={{ ...IS, ...ISF }} />
        </div>

        <div>
          <label className={LC} style={LS}>Category *</label>
          <select name="category" value={prd.category} onChange={onChange} required
            className={IC + " focus:ring-2"} style={{ ...IS, ...ISF }}>
            {SERVICE_CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
        </div>

        <div>
          <label className={LC} style={LS}>Description *</label>
          <textarea name="description" value={prd.description} onChange={onChange} required rows={3}
            placeholder="Describe your product..." className={IC + " focus:ring-2 resize-none"} style={{ ...IS, ...ISF }} />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={LC} style={LS}>Price (₹) *</label>
            <input type="number" name="price" value={prd.price} onChange={onChange} required min="0"
              placeholder="999" className={IC + " focus:ring-2"} style={{ ...IS, ...ISF }} />
          </div>
          <div>
            <label className={LC} style={LS}>Stock / Slots</label>
            <input type="number" name="stock" value={prd.stock} onChange={onChange} min="1"
              placeholder="10" className={IC + " focus:ring-2"} style={{ ...IS, ...ISF }} />
          </div>
        </div>
      </div>

      <div className="rounded-xl p-4 space-y-3" style={{ background: '#f8fafc', border: '1px solid #e8f0f8' }}>
        <p className="text-xs font-bold uppercase tracking-wider" style={{ color: '#1E4F7A' }}>Location & Contact</p>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={LC} style={LS}>City *</label>
            <input type="text" name="location.city" value={prd.location.city} onChange={onChange} required
              placeholder="Mumbai" className={IC + " focus:ring-2"} style={{ ...IS, ...ISF }} />
          </div>
          <div>
            <label className={LC} style={LS}>State *</label>
            <input type="text" name="location.state" value={prd.location.state} onChange={onChange} required
              placeholder="Maharashtra" className={IC + " focus:ring-2"} style={{ ...IS, ...ISF }} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={LC} style={LS}>Contact Person</label>
            <input type="text" name="contactPerson" value={prd.contactPerson} onChange={onChange}
              placeholder="Your name" className={IC + " focus:ring-2"} style={{ ...IS, ...ISF }} />
          </div>
          <div>
            <label className={LC} style={LS}>Mobile</label>
            <input type="tel" name="mobile" value={prd.mobile} onChange={onChange}
              placeholder="9876543210" className={IC + " focus:ring-2"} style={{ ...IS, ...ISF }} />
          </div>
        </div>
      </div>

      <div className="flex gap-3 pt-1">
        <button type="button" onClick={onCancel}
          className="flex-1 py-3 rounded-xl text-sm font-semibold border transition"
          style={{ borderColor: '#d0dce8', color: '#5a7a9a', background: '#ffffff'
