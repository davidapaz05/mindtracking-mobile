import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "./api";

export async function register(payload: Record<string, any>) {
	try {
			const response = await api.post(`/auth/register`, payload);

		if (response.data) {
			// persist some useful values on success
			try {
				if (payload.email) await AsyncStorage.setItem('email', String(payload.email));
				if (payload.nome) await AsyncStorage.setItem('nome', String(payload.nome));
				// mark questionnaire pending by default (existing app logic)
				await AsyncStorage.setItem('questionario_pending', 'true');
				if (response.data.token) {
					await AsyncStorage.setItem('token', String(response.data.token));
				}
			} catch (e) {
				// ignore storage errors
			}

			return response.data;
		}

		throw new Error('Resposta inesperada do servidor.');
	} catch (err: any) {
		const message = err?.response?.data?.message || err?.message || 'Erro ao salvar perfil';
		throw new Error(message);
	}
}

export default { register };
