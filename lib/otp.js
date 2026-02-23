// Hardcoded OTP for testing
const HARDCODED_OTP = '123456';

// Phone numbers for testing
const TEST_PHONES = {
  '917740847114': { role: 'buyer', name: 'Test Customer', userType: 'customer' },
  '917740847112': { role: 'vendor', name: 'Test Seller', userType: 'vendor' },
  '917740847111': { role: 'admin', name: 'Admin User', userType: 'admin' },
};

// Generate a 6-digit OTP
export function generateOTP(phone) {
  // Normalize phone number
  const normalizedPhone = phone.replace(/^\+?91/, '').replace(/^0/, '');
  const fullPhone = '91' + normalizedPhone;
  
  // Return hardcoded OTP for specific phone numbers
  if (TEST_PHONES[fullPhone]) {
    return HARDCODED_OTP;
  }
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Get test user data
export function getTestUser(phone) {
  const normalizedPhone = phone.replace(/^\+?91/, '').replace(/^0/, '');
  const fullPhone = '91' + normalizedPhone;
  return TEST_PHONES[fullPhone] || null;
}

// Check if OTP is expired (default: 10 minutes)
export function isOTPExpired(expiresAt) {
  return new Date() > new Date(expiresAt);
}

// Generate OTP expiry time (default: 10 minutes from now)
export function generateOTPExpiry(minutes = 10) {
  const now = new Date();
  return new Date(now.getTime() + minutes * 60 * 1000);
}

// Demo OTP storage (in production, use SMS provider)
const demoOTPs = new Map();

export function storeDemoOTP(phone, otp) {
  demoOTPs.set(phone, otp);
  console.log(`[Demo OTP] Phone: ${phone}, OTP: ${otp}`);
}

export function getDemoOTP(phone) {
  return demoOTPs.get(phone);
}

export function clearDemoOTP(phone) {
  demoOTPs.delete(phone);
}
