import React, { useMemo } from 'react';
import { addMonths, format, parseISO, startOfMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { ContaPagar, ContaReceber } from '../../types/cpr';
import { formatCurrency } from '../../utils/formatters';

interface FluxoCaixaChartProps {
  contasPagar: ContaPagar[];
  contasReceber: ContaReceber[];
  meses?: number;
}

interface PontoMes {
  chave: string;
  mes: string;
  aPagar: number;
  aReceber: number;
}

/**
 * Fluxo de caixa previsto: soma, por mês de vencimento, os títulos a pagar e
 * a receber dos próximos `meses` meses (canceladas ficam de fora).
 */
export const FluxoCaixaChart: React.FC<FluxoCaixaChartProps> = ({
  contasPagar,
  contasReceber,
  meses = 6,
}) => {
  const dados = useMemo<PontoMes[]>(() => {
    const inicio = startOfMonth(new Date());
    const pontos = new Map<string, PontoMes>();
    for (let i = 0; i < meses; i++) {
      const d = addMonths(inicio, i);
      const chave = format(d, 'yyyy-MM');
      pontos.set(chave, {
        chave,
        mes: format(d, 'MMM/yy', { locale: ptBR }),
        aPagar: 0,
        aReceber: 0,
      });
    }

    for (const c of contasPagar) {
      if (c.situacao === 'CANCELADA') continue;
      const p = pontos.get(format(parseISO(c.vencimento), 'yyyy-MM'));
      if (p) p.aPagar += Number(c.valor || 0);
    }
    for (const c of contasReceber) {
      if (c.situacao === 'CANCELADA') continue;
      const p = pontos.get(format(parseISO(c.vencimento), 'yyyy-MM'));
      if (p) p.aReceber += Number(c.valor || 0);
    }
    return [...pontos.values()];
  }, [contasPagar, contasReceber, meses]);

  return (
    <div className="card">
      <div className="card-header">
        <h4>Fluxo de Caixa Previsto (próximos {meses} meses)</h4>
      </div>
      <div style={{ width: '100%', height: 280, padding: '8px 16px 16px' }}>
        <ResponsiveContainer>
          <BarChart data={dados} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
            <XAxis dataKey="mes" tickLine={false} axisLine={false} />
            <YAxis
              tickLine={false}
              axisLine={false}
              width={80}
              tickFormatter={(v: number) =>
                new Intl.NumberFormat('pt-BR', { notation: 'compact' }).format(v)
              }
            />
            <Tooltip formatter={(v: number) => formatCurrency(v)} />
            <Legend />
            <Bar dataKey="aReceber" name="A receber" fill="var(--success)" radius={[4, 4, 0, 0]} />
            <Bar dataKey="aPagar" name="A pagar" fill="var(--danger)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
