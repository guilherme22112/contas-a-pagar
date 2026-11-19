import { QueryCache, QueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

/**
 * Cliente central do TanStack Query.
 * - staleTime: evita refazer a mesma requisição ao trocar de tela em sequência.
 * - retry: 1 tentativa extra (o back-end é local; muitas tentativas só atrasam o erro).
 * - QueryCache.onError: qualquer falha de leitura vira um toast, sem try/catch em cada tela.
 */
export const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error) => {
      toast.error(error.message || 'Erro ao comunicar com a API.');
    },
  }),
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
      refetchOnWindowFocus: true,
    },
  },
});
