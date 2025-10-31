import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "./api";

/**
 * Try to obtain the user profile and persist it locally so it is available across devices.
 * Strategy:
 * 1) Try GET /auth/me (backend should return user data when token is valid)
 * 2) If that fails, try to decode token payload for basic fields
 * 3) Persist useful fields in AsyncStorage: usuario_id, nome, email, telefone, genero
 */
export async function fetchAndPersistProfileFromServerOrToken() {
  try {
    // 1) Try server
    try {
      const res = await api.get('/auth/me');
      if (res?.data) {
        const data = res.data;
        await persistProfileData(data);
        return data;
      }
    } catch (e) {
      // ignore server errors and try decoding token below
    }

    // 2) Try decoding token stored in AsyncStorage
    const tk = await AsyncStorage.getItem('token');
    if (!tk) throw new Error('Token não encontrado');

    const payload = decodeJwtPayload(tk);
    if (!payload) throw new Error('Não foi possível decodificar o token');

    const candidate = {
      id: payload.id ?? payload.sub ?? payload.usuario_id ?? null,
      nome: payload.nome ?? payload.name ?? null,
      email: payload.email ?? null,
      telefone: payload.telefone ?? payload.phone ?? null,
      genero: payload.genero ?? payload.gender ?? null,
    };
    await persistProfileData(candidate);
    return candidate;
  } catch (err: any) {
    throw new Error(err?.message || 'Erro ao obter perfil do usuário');
  }
}

async function persistProfileData(data: any) {
  try {
    if (data.id) await AsyncStorage.setItem('usuario_id', String(data.id));
    if (data.nome) await AsyncStorage.setItem('nome', String(data.nome));
    if (data.email) await AsyncStorage.setItem('email', String(data.email));
    if (data.telefone) await AsyncStorage.setItem('telefone', String(data.telefone));
    if (data.genero) await AsyncStorage.setItem('genero', String(data.genero));
  } catch (e) {
    // ignore storage errors
  }
}

function decodeJwtPayload(token: string) {
  try {
    const parts = token.split('.');
    if (parts.length < 2) return null;
    const b64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    let json: string | null = null;
    if (typeof (global as any).atob === 'function') {
      const decoded = (global as any).atob(b64);
      json = decodeURIComponent(
        Array.prototype.map
          .call(decoded, function (c: string) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
          })
          .join('')
      );
    } else if (typeof (global as any).Buffer !== 'undefined') {
      json = (global as any).Buffer.from(b64, 'base64').toString('utf8');
    } else {
      return null;
    }
  return JSON.parse(json as string);
  } catch (e) {
    return null;
  }
}

export default { fetchAndPersistProfileFromServerOrToken };
