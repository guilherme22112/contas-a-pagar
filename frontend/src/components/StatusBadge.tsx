import React from 'react';
import { SituacaoConta } from '../types/cpr';
import { formatSituacao } from '../utils/formatters';

interface StatusBadgeProps {
  situacao?: SituacaoConta;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ situacao = 'ABERTA' }) => {
  const classMap: Record<SituacaoConta, string> = {
    ABERTA: 'badge badge-aberta',
    PAGA: 'badge badge-paga',
    RECEBIDA: 'badge badge-recebida',
    VENCIDA: 'badge badge-vencida',
    CANCELADA: 'badge badge-cancelada',
  };

  return <span className={classMap[situacao] ?? 'badge badge-aberta'}>{formatSituacao(situacao)}</span>;
};
