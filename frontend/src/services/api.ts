import {
  ContaPagar,
  ContaReceber,
  ErroResposta,
  FiltroContas,
  Pessoa,
  PlanoConta,
  QuitacaoRequest,
} from '../types/cpr';

export class ApiError extends Error {
  public readonly status: number;
  public readonly codigoErro: string;
  public readonly campos: { nome: string; mensagem: string }[];

  constructor(erroResposta: ErroResposta) {
    super(erroResposta.mensagem || 'Erro na comunicação com o servidor.');
    this.name = 'ApiError';
    this.status = erroResposta.status;
    this.codigoErro = erroResposta.erro;
    this.campos = erroResposta.campos ?? [];
  }
}

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...(options?.headers ?? {}),
    },
    ...options,
  });

  if (!response.ok) {
    let erroData: ErroResposta | null = null;
    try {
      erroData = (await response.json()) as ErroResposta;
    } catch {
      // Caso o servidor retorne erro sem corpo JSON
    }

    if (erroData && erroData.mensagem) {
      throw new ApiError(erroData);
    }

    throw new ApiError({
      timestamp: new Date().toISOString(),
      status: response.status,
      erro: 'ERRO_HTTP',
      mensagem: `Falha na requisição (HTTP ${response.status}). Verifique se o Back-End Spring Boot está em execução na porta 8080.`,
      campos: null,
    });
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

function buildQueryParams(filtro?: FiltroContas): string {
  if (!filtro) return '';
  const params = new URLSearchParams();
  if (filtro.inicio) params.append('inicio', filtro.inicio);
  if (filtro.fim) params.append('fim', filtro.fim);
  if (filtro.situacao) params.append('situacao', filtro.situacao);
  const queryString = params.toString();
  return queryString ? `?${queryString}` : '';
}

export const api = {
  // Pessoas (/api/pessoas)
  listarPessoas: () => request<Pessoa[]>('/api/pessoas'),
  buscarPessoa: (id: number) => request<Pessoa>(`/api/pessoas/${id}`),
  criarPessoa: (pessoa: Pessoa) =>
    request<Pessoa>('/api/pessoas', {
      method: 'POST',
      body: JSON.stringify(pessoa),
    }),
  atualizarPessoa: (id: number, pessoa: Pessoa) =>
    request<Pessoa>(`/api/pessoas/${id}`, {
      method: 'PUT',
      body: JSON.stringify(pessoa),
    }),
  excluirPessoa: (id: number) =>
    request<void>(`/api/pessoas/${id}`, {
      method: 'DELETE',
    }),

  // Plano de Contas (/api/plano-contas)
  listarPlanosConta: () => request<PlanoConta[]>('/api/plano-contas'),
  buscarPlanoConta: (id: number) => request<PlanoConta>(`/api/plano-contas/${id}`),
  criarPlanoConta: (plano: PlanoConta) =>
    request<PlanoConta>('/api/plano-contas', {
      method: 'POST',
      body: JSON.stringify(plano),
    }),
  atualizarPlanoConta: (id: number, plano: PlanoConta) =>
    request<PlanoConta>(`/api/plano-contas/${id}`, {
      method: 'PUT',
      body: JSON.stringify(plano),
    }),
  excluirPlanoConta: (id: number) =>
    request<void>(`/api/plano-contas/${id}`, {
      method: 'DELETE',
    }),

  // Contas a Pagar (/api/contas-pagar)
  listarContasPagar: (filtro?: FiltroContas) =>
    request<ContaPagar[]>(`/api/contas-pagar${buildQueryParams(filtro)}`),
  lancarContaPagar: (conta: ContaPagar) =>
    request<ContaPagar>('/api/contas-pagar', {
      method: 'POST',
      body: JSON.stringify(conta),
    }),
  atualizarContaPagar: (id: number, conta: ContaPagar) =>
    request<ContaPagar>(`/api/contas-pagar/${id}`, {
      method: 'PUT',
      body: JSON.stringify(conta),
    }),
  excluirContaPagar: (id: number) =>
    request<void>(`/api/contas-pagar/${id}`, {
      method: 'DELETE',
    }),
  quitarContaPagar: (id: number, payload: QuitacaoRequest) =>
    request<ContaPagar>(`/api/contas-pagar/${id}/pagamento`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  // Contas a Receber (/api/contas-receber)
  listarContasReceber: (filtro?: FiltroContas) =>
    request<ContaReceber[]>(`/api/contas-receber${buildQueryParams(filtro)}`),
  lancarContaReceber: (conta: ContaReceber) =>
    request<ContaReceber>('/api/contas-receber', {
      method: 'POST',
      body: JSON.stringify(conta),
    }),
  atualizarContaReceber: (id: number, conta: ContaReceber) =>
    request<ContaReceber>(`/api/contas-receber/${id}`, {
      method: 'PUT',
      body: JSON.stringify(conta),
    }),
  excluirContaReceber: (id: number) =>
    request<void>(`/api/contas-receber/${id}`, {
      method: 'DELETE',
    }),
  receberContaReceber: (id: number, payload: QuitacaoRequest) =>
    request<ContaReceber>(`/api/contas-receber/${id}/recebimento`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
};
