import React, { useState } from 'react';
import { api, ApiError } from '../services/api';
import {
  ContaPagar,
  FiltroContas,
  Pessoa,
  PlanoConta,
  SituacaoConta,
  TipoTitulo,
} from '../types/cpr';
import {
  formatCurrency,
  formatDate,
  formatTipoTitulo,
  getTodayISO,
} from '../utils/formatters';
import { ErrorBanner } from './ErrorBanner';
import { StatusBadge } from './StatusBadge';

interface ContasPagarViewProps {
  contas: ContaPagar[];
  pessoas: Pessoa[];
  planosConta: PlanoConta[];
  loading: boolean;
  onRefresh: (filtro?: FiltroContas) => Promise<void>;
}

const TIPOS_TITULO: TipoTitulo[] = [
  'DUPLICATA',
  'NOTA_PROMISSORIA',
  'PIX',
  'CARTAO',
  'OUTROS',
];

const SITUACOES: SituacaoConta[] = [
  'ABERTA',
  'PAGA',
  'VENCIDA',
  'CANCELADA',
];

export const ContasPagarView: React.FC<ContasPagarViewProps> = ({
  contas,
  pessoas,
  planosConta,
  loading,
  onRefresh,
}) => {
  // Estados de filtro
  const [inicio, setInicio] = useState<string>('');
  const [fim, setFim] = useState<string>('');
  const [situacaoFiltro, setSituacaoFiltro] = useState<SituacaoConta | ''>('');

  // Estados de feedback
  const [error, setError] = useState<ApiError | Error | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);

  // Modal de Lançamento / Edição
  const [showFormModal, setShowFormModal] = useState<boolean>(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [numeroTitulo, setNumeroTitulo] = useState<string>('');
  const [pessoaId, setPessoaId] = useState<number>(0);
  const [planoContaId, setPlanoContaId] = useState<number>(0);
  const [tipoTitulo, setTipoTitulo] = useState<TipoTitulo>('DUPLICATA');
  const [valor, setValor] = useState<string>('');
  const [emissao, setEmissao] = useState<string>(getTodayISO());
  const [vencimento, setVencimento] = useState<string>(getTodayISO());
  const [desconto, setDesconto] = useState<string>('0');
  const [validadeDesc, setValidadeDesc] = useState<string>('');
  const [acrescimo, setAcrescimo] = useState<string>('0');
  const [observacao, setObservacao] = useState<string>('');

  // Modal de Quitação (Baixa / Pagamento)
  const [contaQuitacao, setContaQuitacao] = useState<ContaPagar | null>(null);
  const [dataPagamento, setDataPagamento] = useState<string>(getTodayISO());
  const [descontoQuitacao, setDescontoQuitacao] = useState<string>('0');
  const [acrescimoQuitacao, setAcrescimoQuitacao] = useState<string>('0');
  const [modalError, setModalError] = useState<ApiError | Error | null>(null);

  const handleFilter = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    await onRefresh({
      inicio: inicio || undefined,
      fim: fim || undefined,
      situacao: situacaoFiltro || undefined,
    });
  };

  const handleClearFilter = async () => {
    setInicio('');
    setFim('');
    setSituacaoFiltro('');
    setError(null);
    await onRefresh();
  };

  const openNewModal = () => {
    setModalError(null);
    setEditingId(null);
    setNumeroTitulo(`CP-${Math.floor(1000 + Math.random() * 9000)}`);
    setPessoaId(pessoas[0]?.id ?? 0);
    setPlanoContaId(planosConta[0]?.id ?? 0);
    setTipoTitulo('DUPLICATA');
    setValor('');
    setEmissao(getTodayISO());
    setVencimento(getTodayISO());
    setDesconto('0');
    setValidadeDesc('');
    setAcrescimo('0');
    setObservacao('');
    setShowFormModal(true);
  };

  const openEditModal = (c: ContaPagar) => {
    setModalError(null);
    setEditingId(c.id ?? null);
    setNumeroTitulo(c.numeroTitulo);
    setPessoaId(c.pessoa?.id ?? 0);
    setPlanoContaId(c.planoConta?.id ?? 0);
    setTipoTitulo(c.tipoTitulo);
    setValor(String(c.valor));
    setEmissao(c.emissao);
    setVencimento(c.vencimento);
    setDesconto(String(c.desconto ?? 0));
    setValidadeDesc(c.validadeDesc ?? '');
    setAcrescimo(String(c.acrescimo ?? 0));
    setObservacao(c.observacao ?? '');
    setShowFormModal(true);
  };

  const handleSaveConta = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError(null);
    setSuccessMsg(null);

    const pessoaSelecionada = pessoas.find((p) => p.id === Number(pessoaId));
    const planoSelecionado = planosConta.find((pl) => pl.id === Number(planoContaId));

    if (!pessoaSelecionada || !planoSelecionado) {
      setModalError(
        new Error('Selecione uma Pessoa (Fornecedor) e um Plano de Conta válidos.')
      );
      return;
    }

    const payload: ContaPagar = {
      numeroTitulo: numeroTitulo.trim(),
      pessoa: pessoaSelecionada,
      planoConta: planoSelecionado,
      tipoTitulo,
      valor: Number(valor),
      emissao,
      vencimento,
      desconto: Number(desconto || 0),
      validadeDesc: validadeDesc ? validadeDesc : null,
      acrescimo: Number(acrescimo || 0),
      observacao: observacao.trim() || undefined,
    };

    try {
      setSubmitting(true);
      if (editingId) {
        await api.atualizarContaPagar(editingId, payload);
        setSuccessMsg(`Título ${payload.numeroTitulo} atualizado com sucesso!`);
      } else {
        await api.lancarContaPagar(payload);
        setSuccessMsg(`Título ${payload.numeroTitulo} lançado com sucesso (201 Created)!`);
      }
      setShowFormModal(false);
      await onRefresh({
        inicio: inicio || undefined,
        fim: fim || undefined,
        situacao: situacaoFiltro || undefined,
      });
    } catch (err) {
      setModalError(err instanceof Error ? err : new Error('Erro ao salvar conta.'));
    } finally {
      setSubmitting(false);
    }
  };

  const openQuitacaoModal = (c: ContaPagar) => {
    setModalError(null);
    setContaQuitacao(c);
    setDataPagamento(getTodayISO());
    setDescontoQuitacao(String(c.desconto ?? 0));
    setAcrescimoQuitacao(String(c.acrescimo ?? 0));
  };

  const handleConfirmarQuitacao = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contaQuitacao?.id) return;
    setModalError(null);
    setSuccessMsg(null);

    try {
      setSubmitting(true);
      const atualizada = await api.quitarContaPagar(contaQuitacao.id, {
        data: dataPagamento,
        desconto: Number(descontoQuitacao || 0),
        acrescimo: Number(acrescimoQuitacao || 0),
      });
      setContaQuitacao(null);
      setSuccessMsg(
        `Título ${atualizada.numeroTitulo} quitado com sucesso! Valor efetivo pago: ${formatCurrency(
          atualizada.valorPago
        )}`
      );
      await onRefresh({
        inicio: inicio || undefined,
        fim: fim || undefined,
        situacao: situacaoFiltro || undefined,
      });
    } catch (err) {
      setModalError(err instanceof Error ? err : new Error('Erro ao quitar título.'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (c: ContaPagar) => {
    if (!c.id) return;
    if (!window.confirm(`Deseja realmente excluir o título ${c.numeroTitulo}?`)) return;
    setError(null);
    setSuccessMsg(null);

    try {
      await api.excluirContaPagar(c.id);
      setSuccessMsg(`Título ${c.numeroTitulo} excluído com sucesso.`);
      await onRefresh({
        inicio: inicio || undefined,
        fim: fim || undefined,
        situacao: situacaoFiltro || undefined,
      });
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Erro ao excluir título.'));
    }
  };

  const valorPrevistoQuitacao = contaQuitacao
    ? Number(contaQuitacao.valor) -
      Number(descontoQuitacao || 0) +
      Number(acrescimoQuitacao || 0)
    : 0;

  return (
    <div>
      <div className="page-header">
        <div>
          <h3>Contas a Pagar</h3>
          <p>
            Gerenciamento completo de obrigações financeiras, filtros por período/situação e baixa de pagamento.
          </p>
        </div>
        <button type="button" className="btn btn-primary" onClick={openNewModal}>
          + Nova Conta a Pagar
        </button>
      </div>

      <ErrorBanner error={error} onClose={() => setError(null)} />

      {successMsg && (
        <div className="alert alert-success">
          <span>✅ {successMsg}</span>
          <button
            type="button"
            className="btn btn-sm btn-outline"
            onClick={() => setSuccessMsg(null)}
          >
            OK
          </button>
        </div>
      )}

      {/* Barra de Filtros */}
      <form className="filter-bar" onSubmit={handleFilter}>
        <div className="filter-group">
          <label htmlFor="filtro-inicio-cp">Vencimento Início</label>
          <input
            id="filtro-inicio-cp"
            type="date"
            className="input-control"
            value={inicio}
            onChange={(e) => setInicio(e.target.value)}
          />
        </div>
        <div className="filter-group">
          <label htmlFor="filtro-fim-cp">Vencimento Fim</label>
          <input
            id="filtro-fim-cp"
            type="date"
            className="input-control"
            value={fim}
            onChange={(e) => setFim(e.target.value)}
          />
        </div>
        <div className="filter-group">
          <label htmlFor="filtro-situacao-cp">Situação da Conta</label>
          <select
            id="filtro-situacao-cp"
            className="select-control"
            value={situacaoFiltro}
            onChange={(e) => setSituacaoFiltro(e.target.value as SituacaoConta | '')}
          >
            <option value="">Todas as situações</option>
            {SITUACOES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
        <div className="filter-actions">
          <button type="submit" className="btn btn-primary">
            🔍 Filtrar
          </button>
          <button type="button" className="btn btn-outline" onClick={handleClearFilter}>
            Limpar
          </button>
        </div>
      </form>

      {/* Tabela de Contas a Pagar */}
      <div className="card">
        <div className="card-header">
          <h4>Títulos de Contas a Pagar ({contas.length})</h4>
        </div>
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Nº Título</th>
                <th>Fornecedor (Pessoa)</th>
                <th>Plano de Conta</th>
                <th>Tipo</th>
                <th>Emissão / Venc.</th>
                <th className="text-right">Valor Original</th>
                <th className="text-right">Valor Pago</th>
                <th>Situação</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={9}>
                      <div className="skeleton-row" />
                    </td>
                  </tr>
                ))
              ) : contas.length === 0 ? (
                <tr>
                  <td colSpan={9}>
                    <div className="state-box">
                      <span className="state-icon">📭</span>
                      <h5>Nenhuma conta a pagar encontrada</h5>
                      <p>
                        Não há títulos registrados para os filtros selecionados. Clique no botão
                        abaixo para lançar um novo título.
                      </p>
                      <button
                        type="button"
                        className="btn btn-primary"
                        onClick={openNewModal}
                      >
                        + Lançar Primeiro Título
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                contas.map((c) => (
                  <tr key={c.id}>
                    <td className="font-mono">{c.numeroTitulo}</td>
                    <td>
                      <span className="cell-main">{c.pessoa?.nome ?? '—'}</span>
                      <span className="cell-sub">{c.pessoa?.documento ?? ''}</span>
                    </td>
                    <td>
                      <span className="cell-main">{c.planoConta?.descricao ?? '—'}</span>
                      <span className="cell-sub">{c.planoConta?.codigo ?? ''}</span>
                    </td>
                    <td>
                      <span className="badge badge-tipo">
                        {formatTipoTitulo(c.tipoTitulo)}
                      </span>
                    </td>
                    <td>
                      <span className="cell-main">{formatDate(c.vencimento)}</span>
                      <span className="cell-sub">Emissão: {formatDate(c.emissao)}</span>
                    </td>
                    <td className="text-right font-mono">{formatCurrency(c.valor)}</td>
                    <td className="text-right font-mono">
                      {c.valorPago ? (
                        <div>
                          <strong>{formatCurrency(c.valorPago)}</strong>
                          <span className="cell-sub">
                            em {formatDate(c.dataPagamento)}
                          </span>
                        </div>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td>
                      <StatusBadge situacao={c.situacao} />
                    </td>
                    <td>
                      <div className="row-actions">
                        {c.situacao !== 'PAGA' && (
                          <button
                            type="button"
                            className="btn btn-sm btn-success"
                            title="Dar baixa / Quitar título"
                            onClick={() => openQuitacaoModal(c)}
                          >
                            💲 Quitar
                          </button>
                        )}
                        <button
                          type="button"
                          className="btn btn-sm btn-outline"
                          title="Editar título"
                          onClick={() => openEditModal(c)}
                        >
                          ✏️
                        </button>
                        <button
                          type="button"
                          className="btn btn-sm btn-outline"
                          title="Excluir título"
                          onClick={() => handleDelete(c)}
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Lançamento / Edição */}
      {showFormModal && (
        <div className="modal-backdrop">
          <div className="modal-panel">
            <div className="modal-header">
              <h4>
                {editingId ? 'Editar Conta a Pagar' : 'Lançar Nova Conta a Pagar'}
              </h4>
              <button
                type="button"
                className="btn btn-sm btn-outline"
                onClick={() => setShowFormModal(false)}
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleSaveConta}>
              <div className="modal-body">
                <ErrorBanner
                  error={modalError}
                  onClose={() => setModalError(null)}
                />

                {(pessoas.length === 0 || planosConta.length === 0) && (
                  <div className="alert alert-warning">
                    <span>
                      ⚠️ Atenção: Para lançar um título (Regra de Negócio 1), é obrigatório
                      ter pelo menos uma <strong>Pessoa</strong> e um{' '}
                      <strong>Plano de Conta</strong> cadastrados.
                    </span>
                  </div>
                )}

                <div className="form-grid">
                  <div className="form-group">
                    <label>Número do Título *</label>
                    <input
                      type="text"
                      required
                      maxLength={20}
                      className="input-control"
                      placeholder="Ex: CP-2026-001"
                      value={numeroTitulo}
                      onChange={(e) => setNumeroTitulo(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label>Tipo de Título *</label>
                    <select
                      className="select-control"
                      value={tipoTitulo}
                      onChange={(e) => setTipoTitulo(e.target.value as TipoTitulo)}
                    >
                      {TIPOS_TITULO.map((t) => (
                        <option key={t} value={t}>
                          {formatTipoTitulo(t)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Pessoa (Fornecedor) *</label>
                    <select
                      required
                      className="select-control"
                      value={pessoaId}
                      onChange={(e) => setPessoaId(Number(e.target.value))}
                    >
                      <option value={0} disabled>
                        Selecione uma pessoa...
                      </option>
                      {pessoas.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.nome} ({p.documento}) — {p.tipo}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Plano de Conta *</label>
                    <select
                      required
                      className="select-control"
                      value={planoContaId}
                      onChange={(e) => setPlanoContaId(Number(e.target.value))}
                    >
                      <option value={0} disabled>
                        Selecione um plano de conta...
                      </option>
                      {planosConta.map((pl) => (
                        <option key={pl.id} value={pl.id}>
                          {pl.codigo} - {pl.descricao}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Valor do Título (R$) *</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      required
                      className="input-control"
                      placeholder="0.00"
                      value={valor}
                      onChange={(e) => setValor(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label>Data de Emissão *</label>
                    <input
                      type="date"
                      required
                      className="input-control"
                      value={emissao}
                      onChange={(e) => setEmissao(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label>Data de Vencimento *</label>
                    <input
                      type="date"
                      required
                      className="input-control"
                      value={vencimento}
                      onChange={(e) => setVencimento(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label>Desconto Previsto (R$)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      className="input-control"
                      value={desconto}
                      onChange={(e) => setDesconto(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label>Data Limite p/ Desconto (Validade)</label>
                    <input
                      type="date"
                      className="input-control"
                      value={validadeDesc}
                      onChange={(e) => setValidadeDesc(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label>Acréscimo Previsto (R$)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      className="input-control"
                      value={acrescimo}
                      onChange={(e) => setAcrescimo(e.target.value)}
                    />
                  </div>

                  <div className="form-group full-width">
                    <label>Observação</label>
                    <input
                      type="text"
                      maxLength={255}
                      className="input-control"
                      placeholder="Informações adicionais sobre o título..."
                      value={observacao}
                      onChange={(e) => setObservacao(e.target.value)}
                    />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setShowFormModal(false)}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={submitting}
                >
                  {submitting ? 'Salvando...' : 'Salvar Título'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Quitação (POST /api/contas-pagar/{id}/pagamento) */}
      {contaQuitacao && (
        <div className="modal-backdrop">
          <div className="modal-panel">
            <div className="modal-header">
              <h4>Quitar / Pagar Título — {contaQuitacao.numeroTitulo}</h4>
              <button
                type="button"
                className="btn btn-sm btn-outline"
                onClick={() => setContaQuitacao(null)}
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleConfirmarQuitacao}>
              <div className="modal-body">
                <ErrorBanner
                  error={modalError}
                  onClose={() => setModalError(null)}
                />

                <div className="summary-box">
                  <div>
                    <span>Fornecedor</span>
                    <strong>{contaQuitacao.pessoa?.nome}</strong>
                  </div>
                  <div>
                    <span>Valor Original</span>
                    <strong>{formatCurrency(contaQuitacao.valor)}</strong>
                  </div>
                  <div>
                    <span>Vencimento</span>
                    <strong>{formatDate(contaQuitacao.vencimento)}</strong>
                  </div>
                  <div>
                    <span>Validade do Desconto</span>
                    <strong>
                      {contaQuitacao.validadeDesc
                        ? formatDate(contaQuitacao.validadeDesc)
                        : 'Sem limite definido'}
                    </strong>
                  </div>
                </div>

                <div className="form-grid">
                  <div className="form-group full-width">
                    <label>Data Efetiva do Pagamento *</label>
                    <input
                      type="date"
                      required
                      className="input-control"
                      value={dataPagamento}
                      onChange={(e) => setDataPagamento(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label>Desconto Aplicado (R$)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      className="input-control"
                      value={descontoQuitacao}
                      onChange={(e) => setDescontoQuitacao(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label>Acréscimo / Juros (R$)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      className="input-control"
                      value={acrescimoQuitacao}
                      onChange={(e) => setAcrescimoQuitacao(e.target.value)}
                    />
                  </div>
                </div>

                <div
                  className="summary-box"
                  style={{ marginTop: '16px', marginBottom: 0 }}
                >
                  <div>
                    <span>Fórmula (Valor - Desconto + Acréscimo)</span>
                    <strong>Valor Efetivo a Pagar:</strong>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span>Status após confirmação: PAGA</span>
                    <strong style={{ fontSize: '16px', color: '#15803d' }}>
                      {formatCurrency(valorPrevistoQuitacao)}
                    </strong>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setContaQuitacao(null)}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn btn-success"
                  disabled={submitting}
                >
                  {submitting ? 'Processando...' : '💲 Confirmar Pagamento'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
