import api from "./api";

export async function fetchQuestions(mode?: string) {
  try {
    const endpoint = mode === "diario" ? "/questionario/diario/perguntas" : "/questionario/perguntas";
    const resp = await api.get(endpoint);
    return resp.data;
  } catch (err: any) {
    const message = err?.response?.data?.message || err?.message || "Erro ao obter questionário";
    throw new Error(message);
  }
}

export async function submitAnswers(body: any, mode?: string) {
  try {
    const endpoint = mode === "diario" ? "/questionario/diario/responder" : "/questionario/responder";
    const resp = await api.post(endpoint, body);
    return resp.data;
  } catch (err: any) {
    const message = err?.response?.data?.message || err?.message || "Erro ao enviar respostas";
    throw new Error(message);
  }
}

/**
 * Verifica se o usuário já respondeu o questionário diário
 * Endpoint: GET /questionario/diario/verificar/:usuario_id
 * O `api` instancia já adiciona Authorization via interceptor quando houver token.
 */
export async function verifyDaily(usuarioId: string | number) {
  try {
    const endpoint = `/questionario/diario/verificar/${usuarioId}`;
    const resp = await api.get(endpoint);
    return resp.data;
  } catch (err: any) {
    const message = err?.response?.data?.message || err?.message || 'Erro ao verificar questionário diário';
    throw new Error(message);
  }
}

/**
 * Retorna a pontuação calculada para um usuário
 * Endpoint: GET /questionario/pontuacao/:usuario_id
 */
export async function getPontuacao(usuarioId: string | number) {
  try {
    const endpoint = `/questionario/pontuacao/${usuarioId}`;
    const resp = await api.get(endpoint);
    return resp.data;
  } catch (err: any) {
    const message = err?.response?.data?.message || err?.message || 'Erro ao obter pontuação';
    throw new Error(message);
  }
}

export default { fetchQuestions, submitAnswers, verifyDaily, getPontuacao };
