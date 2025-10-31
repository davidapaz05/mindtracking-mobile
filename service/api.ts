import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

const API_BASE_URL = "http://44.220.11.145";

const api = axios.create({ baseURL: API_BASE_URL, timeout: 15000 });

export function setupInterceptors(router: any) {
  const reqId = api.interceptors.request.use(
    async (config) => {
      try {
        const token = await AsyncStorage.getItem("token");
        if (token) {
          (config.headers as any) = {
            ...(config.headers || {}),
            Authorization: `Bearer ${token}`,
          };
        }
      } catch (e) {
        // ignore
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  const resId = api.interceptors.response.use(
    (res) => res,
    async (error) => {
      try {
        if (error?.response?.status === 401) {
          await AsyncStorage.removeItem("token");
          try {
            router.replace("/auth/login");
          } catch (e) {
            // router may be unavailable in some contexts
          }
        }
      } catch (e) {
        // ignore
      }
      return Promise.reject(error);
    }
  );

  return () => {
    api.interceptors.request.eject(reqId);
    api.interceptors.response.eject(resId);
  };
}

export default api;
