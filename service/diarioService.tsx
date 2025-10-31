import api from './api';

interface DiarioPayload {
  titulo?: string;
  texto: string;
}

export async function getAllDiarios() {
  try {
    const resp = await api.get('/api/diario');
    return resp.data;
  } catch (err: any) {
    const message = err?.response?.data?.message || err?.message || 'Erro ao buscar diários';
    throw new Error(message);
  }
}

export async function getDiarioById(id: string | number) {
  try {
    const resp = await api.get(`/api/diario/${id}`);
    return resp.data;
  } catch (err: any) {
    const message = err?.response?.data?.message || err?.message || 'Erro ao buscar diário';
    throw new Error(message);
  }
}

export async function postDiario(payload: DiarioPayload) {
  try {
    const resp = await api.post('/api/diario', payload);
    return resp.data;
  } catch (err: any) {
    const message = err?.response?.data?.message || err?.message || 'Erro ao enviar diário';
    throw new Error(message);
  }
}

export default { getAllDiarios, getDiarioById, postDiario };
