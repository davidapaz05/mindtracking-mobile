import api from "./api";

export type UpdateProfilePayload = {
  nome: string;
  telefone: string; // digits only
  data_nascimento: string; // yyyy-mm-dd
  genero: string;
};

export async function getProfile() {
  try {
    const res = await api.get('/auth/profile');
    return res.data;
  } catch (err: any) {
    if (err?.response?.status === 404 || err?.response?.status === 405) {
      const res = await api.get('/api/auth/profile');
      return res.data;
    }
    throw err;
  }
}

export async function updateProfile(payload: UpdateProfilePayload) {
  try {
    const res = await api.put('/auth/profile', payload);
    return res.data;
  } catch (err: any) {
    if (err?.response?.status === 404 || err?.response?.status === 405) {
      const res = await api.put('/api/auth/profile', payload);
      return res.data;
    }
    throw err;
  }
}

export default { getProfile, updateProfile };
