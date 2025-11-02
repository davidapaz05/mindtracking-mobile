import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "./api";

/**
 * Decodifica o payload de um JWT manualmente (sem dependências externas)
 */
function decodeJwt(token: string) {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const payload = parts[1];
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    let json: string | null = null;
    const atobFn = (global as any).atob || (globalThis as any).atob;
    if (typeof atobFn === "function") {
      const decoded = atobFn(base64);
      json = decodeURIComponent(
        Array.prototype.map
          .call(decoded, (c: string) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join("")
      );
    } else if (typeof (global as any).Buffer !== "undefined") {
      json = (global as any).Buffer.from(base64, "base64").toString("utf8");
    } else {
      return null;
    }
    if (!json) return null;
    return JSON.parse(json);
  } catch {
    return null;
  }
}

/**
 * Salva todos os campos do objeto recebido no AsyncStorage (ex: user, payload JWT)
 */
async function saveUserToAsyncStorage(obj: Record<string, any>) {
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined && value !== null) {
      try {
        await AsyncStorage.setItem(key, String(value));
      } catch {}
    }
  }
}

/**
 * Faz login e armazena token e todos os dados do usuário (tanto do corpo quanto do JWT) no AsyncStorage.
 */
export async function login(email: string, senha: string) {
  try {
    const response = await api.post("/auth/login", { email, senha });

    if (!response?.data) {
      throw new Error("Resposta inválida do servidor.");
    }

    const { token, user } = response.data;

    if (!token) {
      throw new Error(response.data?.message || "Token não retornado pelo servidor.");
    }

    // Salva o token
    await AsyncStorage.setItem("token", String(token));

    // Salva o email informado no login (garante que sempre estará presente)
    await AsyncStorage.setItem("email", String(email));

    // Salva todos os campos vindos do objeto user na resposta
    if (user && typeof user === "object") {
      await saveUserToAsyncStorage(user);
    }

    // Salva também todos os campos do JWT (caso precise no futuro)
    const payload = decodeJwt(token);
    if (payload && typeof payload === "object") {
      await saveUserToAsyncStorage(payload);
    }

    return response.data;
  } catch (err: any) {
    const message =
      err?.response?.data?.message ||
      err?.message ||
      "Erro desconhecido ao fazer login.";
    throw new Error(message);
  }
}
