// Generate a 6-digit OTP
export function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
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
