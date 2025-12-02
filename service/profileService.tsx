import { ENV } from "../config/env";
import api from "./api";

// Cloudinary configuration - replace with your account values or use the provided ones.
// NOTE: embedding API secret in a client app is a security risk. Prefer a server-side
// signed upload. For quick testing (you provided the credentials), we compute a
// signature client-side. Remove SECRET from client for production.
const CLOUDINARY_CLOUD_NAME = ENV.CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_UPLOAD_PRESET = ENV.CLOUDINARY_UPLOAD_PRESET; // unsigned preset

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


    // Without preset, abort: do not sign on client for security.
    throw new Error('Cloudinary upload preset não configurado');
  }

  console.log('Cloudinary upload: url=', url, 'preset=', uploadPreset, 'folder=', options?.folder);
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
  console.log('Cloudinary upload success: secure_url=', data?.secure_url);
  return data;
}




// removed client-side SHA1 and signing for security

/**
 * Send the image URL to your backend to save as the user's profile photo.
 * Adjust the endpoint '/usuario/photo' to match your backend API.
 */
export async function saveProfilePhoto(photoUrl: string) {
  try {
    let resp;
    try {
      console.log('Saving photo to backend via /auth/profile');
      resp = await api.put('/auth/profile', { foto_perfil_url: photoUrl });
    } catch (err: any) {
      if (err?.response?.status === 404 || err?.response?.status === 405) {
        console.log('Fallback: saving photo via /api/auth/profile');
        resp = await api.put('/api/auth/profile', { foto_perfil_url: photoUrl });
      } else {
        throw err;
      }
    }
    console.log('Backend save status:', resp?.status);
    return resp.data;
  } catch (err: any) {
    const message = err?.response?.data?.message || err?.message || 'Erro ao salvar foto no servidor';
    console.log('saveProfilePhoto error:', message);
    throw new Error(message);
  }
}

// Prefer named exports; barrel re-export in service/auth/index.ts
