import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { api } from '../services/api';
import {
  ContaPagar,
  ContaReceber,
  FiltroContas,
  Pessoa,
  PlanoConta,
  QuitacaoRequest,
} from '../types/cpr';

/**
 * Chaves de cache do TanStack Query.
 * Toda escrita invalida `cprKeys.all`, porque uma baixa de título muda
 * dashboard, listas e saldos ao mesmo tempo.
 */
export const cprKeys = {
  all: ['cpr'] as const,
  pessoas: () => [...cprKeys.all, 'pessoas'] as const,
  planosConta: () => [...cprKeys.all, 'planos-conta'] as const,
  contasPagar: (filtro?: FiltroContas) =>
    [...cprKeys.all, 'contas-pagar', filtro ?? {}] as const,
  contasReceber: (filtro?: FiltroContas) =>
    [...cprKeys.all, 'contas-receber', filtro ?? {}] as const,
};

// ---------- Leituras ----------

export const usePessoas = () =>
  useQuery({ queryKey: cprKeys.pessoas(), queryFn: api.listarPessoas });

export const usePlanosConta = () =>
  useQuery({ queryKey: cprKeys.planosConta(), queryFn: api.listarPlanosConta });

export const useContasPagar = (filtro?: FiltroContas) =>
  useQuery({
    queryKey: cprKeys.contasPagar(filtro),
    queryFn: () => api.listarContasPagar(filtro),
  });

export const useContasReceber = (filtro?: FiltroContas) =>
  useQuery({
    queryKey: cprKeys.contasReceber(filtro),
    queryFn: () => api.listarContasReceber(filtro),
  });

// ---------- Escritas (mutations) ----------

function useCprMutation<TVars, TResult>(
  mutationFn: (vars: TVars) => Promise<TResult>,
  mensagemSucesso: string
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: async () => {
      toast.success(mensagemSucesso);
      await queryClient.invalidateQueries({ queryKey: cprKeys.all });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export const useSalvarPessoa = () =>
  useCprMutation(
    (p: Pessoa) => (p.id ? api.atualizarPessoa(p.id, p) : api.criarPessoa(p)),
    'Pessoa salva com sucesso.'
  );

export const useSalvarPlanoConta = () =>
  useCprMutation(
    (p: PlanoConta) =>
      p.id ? api.atualizarPlanoConta(p.id, p) : api.criarPlanoConta(p),
    'Plano de conta salvo com sucesso.'
  );

export const useSalvarContaPagar = () =>
  useCprMutation(
    (c: ContaPagar) =>
      c.id ? api.atualizarContaPagar(c.id, c) : api.lancarContaPagar(c),
    'Conta a pagar salva com sucesso.'
  );

export const useSalvarContaReceber = () =>
  useCprMutation(
    (c: ContaReceber) =>
      c.id ? api.atualizarContaReceber(c.id, c) : api.lancarContaReceber(c),
    'Conta a receber salva com sucesso.'
  );

export const useQuitarContaPagar = () =>
  useCprMutation(
    ({ id, payload }: { id: number; payload: QuitacaoRequest }) =>
      api.quitarContaPagar(id, payload),
    'Pagamento registrado.'
  );

export const useReceberContaReceber = () =>
  useCprMutation(
    ({ id, payload }: { id: number; payload: QuitacaoRequest }) =>
      api.receberContaReceber(id, payload),
    'Recebimento registrado.'
  );
