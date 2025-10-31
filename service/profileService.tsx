import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "./api";

// Cloudinary configuration - replace with your account values or use the provided ones.
// NOTE: embedding API secret in a client app is a security risk. Prefer a server-side
// signed upload. For quick testing (you provided the credentials), we compute a
// signature client-side. Remove SECRET from client for production.
const CLOUDINARY_CLOUD_NAME = "danydlyeq";
const CLOUDINARY_API_KEY = "629517973345647";
const CLOUDINARY_API_SECRET = "mALfsqQC8j3VACWOsJk3vE1GiQE";
const CLOUDINARY_UPLOAD_PRESET = undefined; // optional unsigned preset

/**
 * Upload an image (local URI) to Cloudinary and return the upload response.
 *
 * Usage (React Native):
 * const res = await uploadImageToCloudinary(uri);
 * const imageUrl = res.secure_url;
 */
export async function uploadImageToCloudinary(uri: string, options?: { uploadPreset?: string; folder?: string; public_id?: string; }) {
  const cloudName = CLOUDINARY_CLOUD_NAME;
  if (!cloudName) throw new Error('Cloudinary cloud name not configured');

  const url = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;

  const formData = new FormData();
  formData.append('file' as any, {
    uri,
    type: 'image/jpeg',
    name: `photo.jpg`,
  } as any);

  // If an unsigned upload preset is provided, prefer that (no signature required)
  const uploadPreset = options?.uploadPreset || CLOUDINARY_UPLOAD_PRESET || options?.uploadPreset;
  if (uploadPreset) {
    formData.append('upload_preset' as any, uploadPreset as any);
    if (options?.folder) formData.append('folder' as any, options.folder as any);
    if (options?.public_id) formData.append('public_id' as any, options.public_id as any);
  } else {
    // Signed upload: compute timestamp and signature using API secret (not recommended in client)
    const timestamp = Math.floor(Date.now() / 1000);
    // build string to sign: only include timestamp (and folder/public_id if provided)
    let toSign = `timestamp=${timestamp}`;
    if (options?.folder) toSign += `&folder=${options.folder}`;
    if (options?.public_id) toSign += `&public_id=${options.public_id}`;
    toSign += CLOUDINARY_API_SECRET;

    const signature = sha1(toSign);

    formData.append('api_key' as any, CLOUDINARY_API_KEY as any);
    formData.append('timestamp' as any, String(timestamp));
    formData.append('signature' as any, signature as any);
    if (options?.folder) formData.append('folder' as any, options.folder as any);
    if (options?.public_id) formData.append('public_id' as any, options.public_id as any);
  }

  const resp = await fetch(url, {
    method: 'POST',
    body: formData as any,
    headers: {
      Accept: 'application/json',
    } as any,
  });

  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`Cloudinary upload failed: ${resp.status} ${text}`);
  }

  const data = await resp.json();
  return data;
}

// Minimal SHA1 implementation for client-side signature. For production, compute signature server-side.
function sha1(msg: string) {
  // simple JS SHA1 (not optimized)
  function rotl(n: number, s: number) { return (n << s) | (n >>> (32 - s)); }
  function toHex(i: number) { return ('00000000' + i.toString(16)).slice(-8); }

  const utf8 = unescape(encodeURIComponent(msg));
  const words = [] as number[];
  for (let i = 0; i < utf8.length; i++) words[i >> 2] |= utf8.charCodeAt(i) << (24 - (i % 4) * 8);
  const l = utf8.length * 8;
  words[l >> 5] |= 0x80 << (24 - l % 32);
  words[((l + 64 >> 9) << 4) + 15] = l;

  let h0 = 0x67452301, h1 = 0xEFCDAB89, h2 = 0x98BADCFE, h3 = 0x10325476, h4 = 0xC3D2E1F0;

  for (let i = 0; i < words.length; i += 16) {
    const oldh0 = h0, oldh1 = h1, oldh2 = h2, oldh3 = h3, oldh4 = h4;
    const w = words.slice(i, i + 16);
    for (let t = 16; t < 80; t++) w[t] = rotl(w[t-3] ^ w[t-8] ^ w[t-14] ^ w[t-16], 1) >>> 0;
    for (let t = 0; t < 80; t++) {
      let tmp;
      if (t < 20) tmp = ((h1 & h2) | (~h1 & h3)) + 0x5A827999;
      else if (t < 40) tmp = (h1 ^ h2 ^ h3) + 0x6ED9EBA1;
      else if (t < 60) tmp = ((h1 & h2) | (h1 & h3) | (h2 & h3)) + 0x8F1BBCDC;
      else tmp = (h1 ^ h2 ^ h3) + 0xCA62C1D6;
      const a = (rotl(h0,5) + tmp + h4 + (w[t] >>> 0)) >>> 0;
      h4 = h3; h3 = h2; h2 = rotl(h1,30) >>> 0; h1 = h0; h0 = a;
    }
    h0 = (h0 + oldh0) >>> 0; h1 = (h1 + oldh1) >>> 0; h2 = (h2 + oldh2) >>> 0; h3 = (h3 + oldh3) >>> 0; h4 = (h4 + oldh4) >>> 0;
  }
  return toHex(h0) + toHex(h1) + toHex(h2) + toHex(h3) + toHex(h4);
}

/**
 * Send the image URL to your backend to save as the user's profile photo.
 * Adjust the endpoint '/usuario/photo' to match your backend API.
 */
export async function saveProfilePhoto(photoUrl: string) {
  try {
    const resp = await api.post('/usuario/photo', { foto: photoUrl });
    // persist locally for fast access
    try {
      await AsyncStorage.setItem('foto', String(photoUrl));
    } catch (e) {
      // ignore storage errors
    }
    return resp.data;
  } catch (err: any) {
    const message = err?.response?.data?.message || err?.message || 'Erro ao salvar foto no servidor';
    throw new Error(message);
  }
}

export default { uploadImageToCloudinary, saveProfilePhoto };
