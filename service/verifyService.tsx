import api from "./api";

export async function verifyEmail(email: string, codigo: string) {
  try {
    const resp = await api.post("/auth/verify-email", { email, codigo });
    return resp.data;
  } catch (err: any) {
    const message = err?.response?.data?.message || err?.message || "Erro ao verificar código";
    throw new Error(message);
  }
}

export async function sendRecoveryCode(email: string) {
  try {
    const resp = await api.post("/auth/recuperar-senha", { email });
    return resp.data;
  } catch (err: any) {
    const message = err?.response?.data?.message || err?.message || "Erro ao enviar código";
    throw new Error(message);
  }
}

// Prefer named exports; barrel re-export in service/verify/index.ts
