import api from "./api";

export type UpdateProfilePayload = {
  nome: string;
  telefone: string; // digits only
  data_nascimento: string; // yyyy-mm-dd
  genero: string;
};

export async function getProfile() {
  const res = await api.get('/auth/profile');
  return res.data;
}

export async function updateProfile(payload: UpdateProfilePayload) {
  const res = await api.put('/auth/profile', payload);
  return res.data;
}

export default { getProfile, updateProfile };
