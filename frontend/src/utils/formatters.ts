import { SituacaoConta, TipoPessoa, TipoTitulo } from '../types/cpr';

export function formatCurrency(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return '—';
  }
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

export function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '—';
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  return `${parts[2]}/${parts[1]}/${parts[0]}`;
}

export function getTodayISO(): string {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

export function formatTipoTitulo(tipo: TipoTitulo): string {
  const map: Record<TipoTitulo, string> = {
    DUPLICATA: 'Duplicata',
    NOTA_PROMISSORIA: 'Nota Promissória',
    PIX: 'PIX',
    CARTAO: 'Cartão',
    OUTROS: 'Outros',
  };
  return map[tipo] ?? tipo;
}

export function formatTipoPessoa(tipo: TipoPessoa): string {
  const map: Record<TipoPessoa, string> = {
    CLIENTE: 'Cliente',
    FORNECEDOR: 'Fornecedor',
    AMBOS: 'Cliente / Fornecedor',
  };
  return map[tipo] ?? tipo;
}

export function formatSituacao(situacao: SituacaoConta | undefined): string {
  if (!situacao) return 'Aberta';
  const map: Record<SituacaoConta, string> = {
    ABERTA: 'Aberta',
    PAGA: 'Paga',
    RECEBIDA: 'Recebida',
    VENCIDA: 'Vencida',
    CANCELADA: 'Cancelada',
  };
  return map[situacao] ?? situacao;
}
