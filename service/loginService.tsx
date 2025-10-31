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

		// Decodifica com atob ou Buffer (dependendo do ambiente)
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
 * Faz login e armazena token e dados do usuário no AsyncStorage.
 */
export async function login(email: string, senha: string) {
	try {
		const response = await api.post("/auth/login", { email, senha });

		if (!response?.data) {
			throw new Error("Resposta inválida do servidor.");
		}

		const { token, nome } = response.data;

		if (!token) {
			throw new Error(response.data?.message || "Token não retornado pelo servidor.");
		}

		// Armazena o token
		try {
			await AsyncStorage.setItem("token", String(token));
		} catch {
			// Falha silenciosa
		}

		// Armazena email (sempre)
		try {
			await AsyncStorage.setItem("email", String(email));
		} catch {
			// Falha silenciosa
		}

		// Tenta extrair nome/email do JWT
		const payload = decodeJwt(token);
		if (payload) {
			if (payload.nome) {
				try {
					await AsyncStorage.setItem("nome", String(payload.nome));
				} catch {}
			}
			if (payload.email) {
				try {
					await AsyncStorage.setItem("email", String(payload.email));
				} catch {}
			}
		} else if (nome) {
			// Fallback: nome direto da resposta
			try {
				await AsyncStorage.setItem("nome", String(nome));
			} catch {}
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
