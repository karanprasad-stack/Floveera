import crypto from 'crypto';

/**
 * Generates a clean, readable, secure registration code
 * Format: 4 letters - 4 alphanumeric (e.g. ABCD-1234, FLOV-7821)
 */
export function generateInvitationCode(prefix = 'FLOV') {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ'; // Exclude ambiguous 0, O, 1, I
  let part1 = prefix.slice(0, 4).toUpperCase();
  while (part1.length < 4) {
    part1 += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  let part2 = '';
  const randomBytes = crypto.randomBytes(4);
  for (let i = 0; i < 4; i++) {
    part2 += chars.charAt(randomBytes[i] % chars.length);
  }

  return `${part1}-${part2}`;
}

/**
 * Normalizes phone number into canonical E.164 representation (+919876543210 for India)
 */
export function normalizePhoneNumber(phone) {
  if (!phone || typeof phone !== 'string') return null;
  let cleaned = phone.trim().replace(/[\s\-\(\)\.]/g, '');
  if (!cleaned) return null;

  // Handle +91, 0091, 91 (if 12 digits), 0 (if 11 digits)
  if (cleaned.startsWith('+91')) {
    cleaned = cleaned.slice(3);
  } else if (cleaned.startsWith('0091')) {
    cleaned = cleaned.slice(4);
  } else if (cleaned.startsWith('91') && cleaned.length === 12) {
    cleaned = cleaned.slice(2);
  } else if (cleaned.startsWith('0') && cleaned.length === 11) {
    cleaned = cleaned.slice(1);
  }

  // 10 digits Indian mobile number
  if (/^\d{10}$/.test(cleaned)) {
    return `+91${cleaned}`;
  }

  // If already has country code +...
  if (phone.trim().startsWith('+')) {
    return `+${phone.replace(/[^\d]/g, '')}`;
  }

  return cleaned;
}

/**
 * Checks whether an identifier is an email address
 */
export function isEmailIdentifier(identifier) {
  if (!identifier || typeof identifier !== 'string') return false;
  return identifier.trim().includes('@');
}

/**
 * Returns phone lookup variants to reliably match both normalized and legacy phone records
 */
export function getPhoneSearchVariants(rawInput) {
  if (!rawInput || typeof rawInput !== 'string') return [];
  const trimmed = rawInput.trim();
  const normalized = normalizePhoneNumber(trimmed);
  const rawDigits = trimmed.replace(/[^\d]/g, '');
  const last10 = rawDigits.length >= 10 ? rawDigits.slice(-10) : rawDigits;

  const set = new Set([
    trimmed,
    normalized,
    rawDigits,
    last10,
    `+91${last10}`,
    `+91 ${last10}`,
    `91${last10}`,
    `0${last10}`
  ]);

  return Array.from(set).filter(Boolean);
}

