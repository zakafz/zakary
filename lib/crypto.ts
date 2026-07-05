/**
 * Client-side vault encryption helpers.
 *
 * A master password is stretched with PBKDF2 into an AES-GCM key that never
 * leaves the browser. Secrets are encrypted before being sent to Supabase, so
 * the database only ever stores ciphertext.
 */

const PBKDF2_ITERATIONS = 210_000;
const IV_BYTES = 12;
const SALT_BYTES = 16;
const VERIFIER_PLAINTEXT = "vault-ok";

function bytesToB64(bytes: Uint8Array) {
  let binary = "";
  for (const b of bytes) {
    binary += String.fromCharCode(b);
  }
  return btoa(binary);
}

function b64ToBytes(b64: string) {
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

export function generateSaltB64() {
  return bytesToB64(crypto.getRandomValues(new Uint8Array(SALT_BYTES)));
}

export async function deriveKey(
  master: string,
  saltB64: string
): Promise<CryptoKey> {
  const baseKey = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(master),
    "PBKDF2",
    false,
    ["deriveKey"]
  );
  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: b64ToBytes(saltB64),
      iterations: PBKDF2_ITERATIONS,
      hash: "SHA-256",
    },
    baseKey,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

export async function encryptString(key: CryptoKey, text: string) {
  const iv = crypto.getRandomValues(new Uint8Array(IV_BYTES));
  const cipher = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    new TextEncoder().encode(text)
  );
  const combined = new Uint8Array(iv.length + cipher.byteLength);
  combined.set(iv, 0);
  combined.set(new Uint8Array(cipher), iv.length);
  return bytesToB64(combined);
}

export async function decryptString(key: CryptoKey, payloadB64: string) {
  const data = b64ToBytes(payloadB64);
  const iv = data.slice(0, IV_BYTES);
  const cipher = data.slice(IV_BYTES);
  const plain = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv },
    key,
    cipher
  );
  return new TextDecoder().decode(plain);
}

/** Encrypt a known constant so we can later verify the master password. */
export function makeVerifier(key: CryptoKey) {
  return encryptString(key, VERIFIER_PLAINTEXT);
}

/** Returns true if the key correctly decrypts the stored verifier. */
export async function checkVerifier(key: CryptoKey, verifier: string) {
  try {
    return (await decryptString(key, verifier)) === VERIFIER_PLAINTEXT;
  } catch {
    return false;
  }
}
