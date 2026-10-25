import React from 'react';
import { ContaPagar, ContaReceber, Pessoa, PlanoConta } from '../types/cpr';
import { formatCurrency, formatDate } from '../utils/formatters';
import { StatusBadge } from './StatusBadge';

interface DashboardViewProps {
  contasPagar: ContaPagar[];
  contasReceber: ContaReceber[];
  pessoas: Pessoa[];
  planosConta: PlanoConta[];
  loading: boolean;
  onNavigate: (tab: 'pagar' | 'receber' | 'pessoas' | 'planos') => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  contasPagar,
  contasReceber,
  pessoas,
  planosConta,
  loading,
  onNavigate,
}) => {
  const totalPagarAberto = contasPagar
    .filter((c) => c.situacao === 'ABERTA' || c.situacao === 'VENCIDA')
    .reduce((acc, c) => acc + Number(c.valor || 0), 0);

  const qtdPagarAberto = contasPagar.filter(
    (c) => c.situacao === 'ABERTA' || c.situacao === 'VENCIDA'
  ).length;

  const totalPago = contasPagar
    .filter((c) => c.situacao === 'PAGA')
    .reduce((acc, c) => acc + Number(c.valorPago ?? c.valor ?? 0), 0);

  const totalReceberAberto = contasReceber
    .filter((c) => c.situacao === 'ABERTA' || c.situacao === 'VENCIDA')
    .reduce((acc, c) => acc + Number(c.valor || 0), 0);

  const qtdReceberAberto = contasReceber.filter(
    (c) => c.situacao === 'ABERTA' || c.situacao === 'VENCIDA'
  ).length;

  const totalRecebido = contasReceber
    .filter((c) => c.situacao === 'RECEBIDA')
    .reduce((acc, c) => acc + Number(c.valorRecebido ?? c.valor ?? 0), 0);

  const saldoAtualCaixa = totalRecebido - totalPago;
  const saldoPrevisto =
    totalRecebido + totalReceberAberto - (totalPago + totalPagarAberto);

  const proximasPagar = [...contasPagar]
    .sort((a, b) => a.vencimento.localeCompare(b.vencimento))
    .slice(0, 5);

  const proximasReceber = [...contasReceber]
    .sort((a, b) => a.vencimento.localeCompare(b.vencimento))
    .slice(0, 5);

  return (
    <div>
      <div className="page-header">
        <div>
          <h3>Visão Geral Financeira</h3>
          <p>
            Acompanhamento consolidado de títulos a pagar, a receber e saldo previsto.
          </p>
        </div>
        <div className="row-actions">
          <button
            type="button"
            className="btn btn-outline"
            onClick={() => onNavigate('pessoas')}
          >
            👥 {pessoas.length} Pessoas Cadastradas
          </button>
          <button
            type="button"
            className="btn btn-outline"
            onClick={() => onNavigate('planos')}
          >
            📂 {planosConta.length} Planos de Conta
          </button>
        </div>
      </div>

      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-card-header">
            <span>A Pagar (Em Aberto)</span>
            <span className="kpi-icon danger">💸</span>
          </div>
          <div className="kpi-value danger">{formatCurrency(totalPagarAberto)}</div>
          <div className="kpi-subtitle">
            {qtdPagarAberto} título(s) pendente(s) | Pago: {formatCurrency(totalPago)}
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-card-header">
            <span>A Receber (Em Aberto)</span>
            <span className="kpi-icon success">💰</span>
          </div>
          <div className="kpi-value success">{formatCurrency(totalReceberAberto)}</div>
          <div className="kpi-subtitle">
            {qtdReceberAberto} título(s) a receber | Recebido: {formatCurrency(totalRecebido)}
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-card-header">
            <span>Saldo Previsto Total</span>
            <span className="kpi-icon primary">⚖️</span>
          </div>
          <div className={`kpi-value ${saldoPrevisto >= 0 ? 'success' : 'danger'}`}>
            {formatCurrency(saldoPrevisto)}
          </div>
          <div className="kpi-subtitle">
            Caixa atual ({formatCurrency(saldoAtualCaixa)}) + A Receber - A Pagar
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-card-header">
            <span>Saldo em Caixa (Baixado)</span>
            <span className="kpi-icon warning">📊</span>
          </div>
          <div className={`kpi-value ${saldoAtualCaixa >= 0 ? 'success' : 'danger'}`}>
            {formatCurrency(saldoAtualCaixa)}
          </div>
          <div className="kpi-subtitle">
            Entradas: {formatCurrency(totalRecebido)} | Saídas: {formatCurrency(totalPago)}
          </div>
        </div>
      </div>

      <div className="dashboard-split">
        <div className="card">
          <div className="card-header">
            <h4>Últimas / Próximas Contas a Pagar</h4>
            <button
              type="button"
              className="btn btn-sm btn-outline"
              onClick={() => onNavigate('pagar')}
            >
              Ver todas →
            </button>
          </div>
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Título</th>
                  <th>Fornecedor</th>
                  <th>Vencimento</th>
                  <th className="text-right">Valor</th>
                  <th>Situação</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={5}>
                      <div className="skeleton-row" />
                    </td>
                  </tr>
                ) : proximasPagar.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', padding: '24px' }}>
                      Nenhuma conta a pagar registrada.
                    </td>
                  </tr>
                ) : (
                  proximasPagar.map((c) => (
                    <tr key={c.id}>
                      <td className="font-mono">{c.numeroTitulo}</td>
                      <td>{c.pessoa?.nome ?? '—'}</td>
                      <td>{formatDate(c.vencimento)}</td>
                      <td className="text-right font-mono">{formatCurrency(c.valor)}</td>
                      <td>
                        <StatusBadge situacao={c.situacao} />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h4>Últimas / Próximas Contas a Receber</h4>
            <button
              type="button"
              className="btn btn-sm btn-outline"
              onClick={() => onNavigate('receber')}
            >
              Ver todas →
            </button>
          </div>
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Título</th>
                  <th>Cliente</th>
                  <th>Vencimento</th>
                  <th className="text-right">Valor</th>
                  <th>Situação</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={5}>
                      <div className="skeleton-row" />
                    </td>
                  </tr>
                ) : proximasReceber.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', padding: '24px' }}>
                      Nenhuma conta a receber registrada.
                    </td>
                  </tr>
                ) : (
                  proximasReceber.map((c) => (
                    <tr key={c.id}>
                      <td className="font-mono">{c.numeroTitulo}</td>
                      <td>{c.pessoa?.nome ?? '—'}</td>
                      <td>{formatDate(c.vencimento)}</td>
                      <td className="text-right font-mono">{formatCurrency(c.valor)}</td>
                      <td>
                        <StatusBadge situacao={c.situacao} />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
