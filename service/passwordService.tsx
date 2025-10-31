import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "./api";

export async function recoverPassword(email: string) {
  try {
    const resp = await api.post("/auth/recuperar-senha", { email });
    return resp.data;
  } catch (err: any) {
    const message = err?.response?.data?.message || err?.message || "Erro ao enviar código";
    throw new Error(message);
  }
}

export async function resetPassword(payload: Record<string, any>) {
  try {
    // include token if present in AsyncStorage
    const token = await AsyncStorage.getItem("token");
    const headers: any = { "Content-Type": "application/json" };
    if (token) headers.Authorization = `Bearer ${token}`;
    const resp = await api.post("/auth/redefinir-senha", payload, { headers });
    return resp.data;
  } catch (err: any) {
    const message = err?.response?.data?.message || err?.message || "Erro ao redefinir senha";
    throw new Error(message);
  }
}

export default { recoverPassword, resetPassword };
