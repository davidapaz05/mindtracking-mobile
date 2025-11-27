// Centralized environment access for Expo RN
// Prefer EXPO_PUBLIC_ variables for client-side usage

export const ENV = {
  API_BASE_URL: process.env.EXPO_PUBLIC_API_BASE_URL || "https://mindtracking-api-1.onrender.com/",
  CLOUDINARY_CLOUD_NAME: process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME || "danydlyeq",
  CLOUDINARY_UPLOAD_PRESET: process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "mindtracking",
};

export default ENV;
