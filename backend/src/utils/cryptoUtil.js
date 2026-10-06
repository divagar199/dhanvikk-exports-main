import crypto from 'crypto';

const SECRET_KEY = process.env.JWT_SECRET || 'dhanvikk_secret_luxury_botanical_key_2026';

/**
 * Generate a deterministic 32-byte key and 16-byte IV for AES-256-CBC
 */
function getKeyAndIV() {
  const key = crypto.scryptSync(SECRET_KEY, 'dhanvikk-botanical-salt', 32);
  const iv = Buffer.alloc(16, 0); // Deterministic IV for portal URL reproducibility
  return { key, iv };
}

/**
 * Encrypt user identification payload (name, phone, email, id)
 * returns a safe URL-friendly hex or base64url string
 */
export function generateEncryptedPortalKey(payload) {
  try {
    const { key, iv } = getKeyAndIV();
    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
    const dataString = JSON.stringify({
      id: payload.id || payload._id || 'user',
      name: payload.name || '',
      email: (payload.email || '').toLowerCase().trim(),
      phone: payload.phone || '',
      createdAt: payload.createdAt || Date.now(),
      hashSalt: 'DHANVIKK_MEMBER_LUXURY_CIPHER',
    });

    let encrypted = cipher.update(dataString, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return `dhn_enc_${encrypted}`;
  } catch (error) {
    console.error('Portal key generation error:', error);
    // Safe fallback
    return `dhn_enc_${Buffer.from(JSON.stringify(payload)).toString('base64url')}`;
  }
}

/**
 * Decrypt the portal key back to user identification data
 */
export function decryptPortalKey(portalKey) {
  try {
    if (!portalKey || !portalKey.startsWith('dhn_enc_')) {
      throw new Error('Invalid portal key format');
    }

    const cipherHex = portalKey.replace('dhn_enc_', '');

    // Check if it's hex or base64url fallback
    if (/^[0-9a-fA-F]+$/.test(cipherHex)) {
      const { key, iv } = getKeyAndIV();
      const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
      let decrypted = decipher.update(cipherHex, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      return JSON.parse(decrypted);
    } else {
      const decoded = Buffer.from(cipherHex, 'base64url').toString('utf8');
      return JSON.parse(decoded);
    }
  } catch (error) {
    console.error('Portal key decryption error:', error);
    throw new Error('Malformed or corrupted unique encrypted URL key');
  }
}
