import { randomBytes, createCipheriv, createDecipheriv } from 'crypto';

const KEY_LEN = 32; // 256-bit key

export function generateKey() {
  return randomBytes(KEY_LEN);
}

export function aeadEncrypt(key, plaintext, aad = '') {
  const iv = randomBytes(12); // 96-bit IV
  const cipher = createCipheriv('aes-256-gcm', key, iv);
  cipher.setAAD(Buffer.from(aad));
  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, encrypted]).toString('base64');
}

export function aeadDecrypt(key, ciphertextB64, aad = '') {
  const data = Buffer.from(ciphertextB64, 'base64');
  const iv = data.slice(0, 12);
  const tag = data.slice(12, 28);
  const encrypted = data.slice(28);
  const decipher = createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAAD(Buffer.from(aad));
  decipher.setAuthTag(tag);
  const out = Buffer.concat([decipher.update(encrypted), decipher.final()]);
  return out.toString('utf8');
}
