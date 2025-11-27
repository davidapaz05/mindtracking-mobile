Service layer structure:

- api.ts: Axios client with interceptors (token, 401 handling). Reads base URL from config/env.ts.
- authService.tsx: Authentication and profile endpoints
  - getProfile()
  - updateProfile(payload)
- profileService.tsx: Profile photos
  - uploadImageToCloudinary(uri, opts)
  - saveProfilePhoto(url)
- auth/: Domain barrel re-exports for profile and photo services

Usage in screens:
- Import functions from service modules, e.g.
  import { getProfile, updateProfile } from '@/service/auth';
  import { uploadImageToCloudinary, saveProfilePhoto } from '@/service/auth';
