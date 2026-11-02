// @the-static/crypto-core
//
// Privacy-first cryptographic primitives for The Static.
// Uses only the Web Crypto API (crypto.subtle), an established, audited
// primitive available in browsers and React Native (via react-native-quick-crypto
// or newer RN builds). No custom protocol construction happens here.
//
// Direct-message E2EE (Signal Protocol / MLS) is deliberately NOT bundled here.
// Adopt an audited implementation after licensing and security review.

export const CRYPTO_VERSION = 1;

const getSubtle = (): any => {
  const crypto =
    typeof globalThis !== "undefined" ? (globalThis as any).crypto : undefined;
  if (!crypto?.subtle) {
    throw new Error(
      "Web Crypto API (crypto.subtle) is not available. On React Native, add react-native-quick-crypto.",
    );
  }
  return crypto.subtle;
};

const getRandomValues = (length: number): Uint8Array => {
  const crypto =
    typeof globalThis !== "undefined" ? (globalThis as any).crypto : undefined;
  if (!crypto?.getRandomValues) {
    throw new Error("crypto.getRandomValues is not available");
  }
  return crypto.getRandomValues(new Uint8Array(length));
};

const encoder = new TextEncoder();

/**
 * Generate cryptographically secure random bytes.
 */
export function generateRandomBytes(length: number): Uint8Array {
  return getRandomValues(length);
}

/**
 * Derive a content encryption key from input key material using HKDF-SHA256.
 * Returns a CryptoKey usable for AES-GCM wrap/unwrap.
 */
export async function deriveContentKey(
  ikm: Uint8Array,
  info: string,
  keyLength: number = 32,
): Promise<any> {
  const subtle = getSubtle();
  const salt = new Uint8Array(32);
  const keyData = await subtle.importKey("raw", ikm, { name: "HKDF", hash: "SHA-256" }, false, [
    "deriveKey",
  ]);
  return subtle.deriveKey(
    { name: "HKDF", hash: "SHA-256", salt, info: encoder.encode(info) },
    keyData,
    { name: "AES-GCM", length: keyLength * 8 },
    false,
    ["encrypt", "decrypt"],
  );
}

/**
 * Generate a random content encryption key (raw bytes).
 */
export function generateContentKey(): Uint8Array {
  return generateRandomBytes(32);
}

/**
 * Wrap a content key for a recipient device using AES-GCM.
 * Returns sealed bytes: [nonce(12)][ciphertext+tag].
 */
export async function wrapKey(
  contentKey: Uint8Array,
  wrappingKey: any,
): Promise<Uint8Array> {
  const subtle = getSubtle();
  const nonce = generateRandomBytes(12);
  const ciphertext = await subtle.encrypt(
    { name: "AES-GCM", iv: nonce },
    wrappingKey,
    contentKey,
  );
  const result = new Uint8Array(nonce.length + ciphertext.byteLength);
  result.set(nonce);
  result.set(new Uint8Array(ciphertext), nonce.length);
  return result;
}

/**
 * Unwrap a content key encrypted with wrapKey.
 */
export async function unwrapKey(
  sealed: Uint8Array,
  unwrappingKey: any,
): Promise<Uint8Array> {
  if (sealed.length < 12 + 16) {
    throw new Error("Sealed payload too short");
  }
  const subtle = getSubtle();
  const nonce = sealed.slice(0, 12);
  const ciphertext = sealed.slice(12);
  const plaintext = await subtle.decrypt(
    { name: "AES-GCM", iv: nonce },
    unwrappingKey,
    ciphertext,
  );
  return new Uint8Array(plaintext);
}

/**
 * AES-256-GCM authenticated encryption.
 * Returns sealed bytes: [nonce(12)][ciphertext+tag(16)].
 */
export async function aesGcmEncrypt(
  key: any,
  plaintext: Uint8Array,
  aad?: Uint8Array,
): Promise<Uint8Array> {
  const subtle = getSubtle();
  const nonce = generateRandomBytes(12);
  const cryptoKey =
    key instanceof Uint8Array
      ? await subtle.importKey("raw", key, { name: "AES-GCM", length: 256 }, false, [
          "encrypt",
        ])
      : key;
  const ciphertext = await subtle.encrypt(
    { name: "AES-GCM", iv: nonce, additionalData: aad },
    cryptoKey,
    plaintext,
  );
  const result = new Uint8Array(nonce.length + ciphertext.byteLength);
  result.set(nonce);
  result.set(new Uint8Array(ciphertext), nonce.length);
  return result;
}

/**
 * AES-256-GCM authenticated decryption.
 * Expects sealed bytes: [nonce(12)][ciphertext+tag(16)].
 */
export async function aesGcmDecrypt(
  key: any,
  sealed: Uint8Array,
  aad?: Uint8Array,
): Promise<Uint8Array> {
  if (sealed.length < 12 + 16) {
    throw new Error("Sealed payload too short");
  }
  const subtle = getSubtle();
  const nonce = sealed.slice(0, 12);
  const ciphertext = sealed.slice(12);
  const cryptoKey =
    key instanceof Uint8Array
      ? await subtle.importKey("raw", key, { name: "AES-GCM", length: 256 }, false, [
          "decrypt",
        ])
      : key;
  const plaintext = await subtle.decrypt(
    { name: "AES-GCM", iv: nonce, additionalData: aad },
    cryptoKey,
    ciphertext,
  );
  return new Uint8Array(plaintext);
}

/**
 * ChaCha20-Poly1305 is not available in Web Crypto. AES-GCM is the default
 * authenticated encryption mode. Use aesGcmEncrypt/aesGcmDecrypt.
 */
export async function chacha20Poly1305Encrypt(): Promise<never> {
  throw new Error("ChaCha20-Poly1305 is not implemented; use aesGcmEncrypt");
}
export async function chacha20Poly1305Decrypt(): Promise<never> {
  throw new Error("ChaCha20-Poly1305 is not implemented; use aesGcmDecrypt");
}

/**
 * SHA-256 hash of arbitrary bytes.
 */
export async function hashBytes(data: Uint8Array): Promise<Uint8Array> {
  const subtle = getSubtle();
  const digest = await subtle.digest("SHA-256", data);
  return new Uint8Array(digest);
}

/**
 * Encode bytes to base64url without padding.
 */
export function base64UrlEncode(bytes: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  const b64 = btoaFn(binary);
  return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

/**
 * Decode base64url to bytes.
 */
export function base64UrlDecode(input: string): Uint8Array {
  const base64 = input.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
  const binary = atobFn(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

function btoaFn(s: string): string {
  return (globalThis as any).btoa(s);
}
function atobFn(s: string): string {
  return (globalThis as any).atob(s);
}

/**
 * Constant-time comparison to prevent timing attacks.
 */
export function constantTimeEquals(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) {
    return false;
  }
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a[i] ^ b[i];
  }
  return diff === 0;
}

/**
 * Import raw bytes as an AES-GCM key for envelope wrapping.
 */
export async function importAesKey(raw: Uint8Array): Promise<any> {
  const subtle = getSubtle();
  return subtle.importKey("raw", raw, { name: "AES-GCM", length: 256 }, false, [
    "encrypt",
    "decrypt",
  ]);
}

/**
 * Generate an EC key pair (P-256) for device identity / future E2EE protocols.
 */
export async function generateKeyPair(): Promise<{
  publicKey: any;
  privateKey: any;
}> {
  const subtle = getSubtle();
  const pair = await subtle.generateKey(
    { name: "ECDSA", namedCurve: "P-256" },
    true,
    ["sign", "verify"],
  );
  return { publicKey: pair.publicKey, privateKey: pair.privateKey };
}
