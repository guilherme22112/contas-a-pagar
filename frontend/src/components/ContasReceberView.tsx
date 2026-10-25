import React, { useState } from 'react';
import { api, ApiError } from '../services/api';
import {
  ContaReceber,
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

interface ContasReceberViewProps {
  contas: ContaReceber[];
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
  'RECEBIDA',
  'VENCIDA',
  'CANCELADA',
];

export const ContasReceberView: React.FC<ContasReceberViewProps> = ({
  contas,
  pessoas,
  planosConta,
  loading,
  onRefresh,
}) => {
  const [inicio, setInicio] = useState<string>('');
  const [fim, setFim] = useState<string>('');
  const [situacaoFiltro, setSituacaoFiltro] = useState<SituacaoConta | ''>('');

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

  // Modal de Recebimento (Baixa)
  const [contaRecebimento, setContaRecebimento] = useState<ContaReceber | null>(
    null
  );
  const [dataRecebimento, setDataRecebimento] = useState<string>(getTodayISO());
  const [descontoRec, setDescontoRec] = useState<string>('0');
  const [acrescimoRec, setAcrescimoRec] = useState<string>('0');
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
    setNumeroTitulo(`CR-${Math.floor(1000 + Math.random() * 9000)}`);
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

  const openEditModal = (c: ContaReceber) => {
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
    const planoSelecionado = planosConta.find(
      (pl) => pl.id === Number(planoContaId)
    );

    if (!pessoaSelecionada || !planoSelecionado) {
      setModalError(
        new Error('Selecione uma Pessoa (Cliente) e um Plano de Conta válidos.')
      );
      return;
    }

    const payload: ContaReceber = {
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
        await api.atualizarContaReceber(editingId, payload);
        setSuccessMsg(`Título ${payload.numeroTitulo} atualizado com sucesso!`);
      } else {
        await api.lancarContaReceber(payload);
        setSuccessMsg(
          `Título ${payload.numeroTitulo} lançado com sucesso (201 Created)!`
        );
      }
      setShowFormModal(false);
      await onRefresh({
        inicio: inicio || undefined,
        fim: fim || undefined,
        situacao: situacaoFiltro || undefined,
      });
    } catch (err) {
      setModalError(
        err instanceof Error ? err : new Error('Erro ao salvar conta.')
      );
    } finally {
      setSubmitting(false);
    }
  };

  const openRecebimentoModal = (c: ContaReceber) => {
    setModalError(null);
    setContaRecebimento(c);
    setDataRecebimento(getTodayISO());
    setDescontoRec(String(c.desconto ?? 0));
    setAcrescimoRec(String(c.acrescimo ?? 0));
  };

  const handleConfirmarRecebimento = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contaRecebimento?.id) return;
    setModalError(null);
    setSuccessMsg(null);

    try {
      setSubmitting(true);
      const atualizada = await api.receberContaReceber(contaRecebimento.id, {
        data: dataRecebimento,
        desconto: Number(descontoRec || 0),
        acrescimo: Number(acrescimoRec || 0),
      });
      setContaRecebimento(null);
      setSuccessMsg(
        `Título ${atualizada.numeroTitulo} recebido com sucesso! Valor efetivo: ${formatCurrency(
          atualizada.valorRecebido
        )}`
      );
      await onRefresh({
        inicio: inicio || undefined,
        fim: fim || undefined,
        situacao: situacaoFiltro || undefined,
      });
    } catch (err) {
      setModalError(
        err instanceof Error ? err : new Error('Erro ao registrar recebimento.')
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (c: ContaReceber) => {
    if (!c.id) return;
    if (!window.confirm(`Deseja realmente excluir o título ${c.numeroTitulo}?`))
      return;
    setError(null);
    setSuccessMsg(null);

    try {
      await api.excluirContaReceber(c.id);
      setSuccessMsg(`Título ${c.numeroTitulo} excluído com sucesso.`);
      await onRefresh({
        inicio: inicio || undefined,
        fim: fim || undefined,
        situacao: situacaoFiltro || undefined,
      });
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error('Erro ao excluir título.')
      );
    }
  };

  const valorPrevistoRec = contaRecebimento
    ? Number(contaRecebimento.valor) -
      Number(descontoRec || 0) +
      Number(acrescimoRec || 0)
    : 0;

  return (
    <div>
      <div className="page-header">
        <div>
          <h3>Contas a Receber</h3>
          <p>
            Controle de receitas de clientes, vencimentos e baixa de recebimentos.
          </p>
        </div>
        <button
          type="button"
          className="btn btn-primary"
          onClick={openNewModal}
        >
          + Nova Conta a Receber
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
          <label htmlFor="filtro-inicio-cr">Vencimento Início</label>
          <input
            id="filtro-inicio-cr"
            type="date"
            className="input-control"
            value={inicio}
            onChange={(e) => setInicio(e.target.value)}
          />
        </div>
        <div className="filter-group">
          <label htmlFor="filtro-fim-cr">Vencimento Fim</label>
          <input
            id="filtro-fim-cr"
            type="date"
            className="input-control"
            value={fim}
            onChange={(e) => setFim(e.target.value)}
          />
        </div>
        <div className="filter-group">
          <label htmlFor="filtro-situacao-cr">Situação da Conta</label>
          <select
            id="filtro-situacao-cr"
            className="select-control"
            value={situacaoFiltro}
            onChange={(e) =>
              setSituacaoFiltro(e.target.value as SituacaoConta | '')
            }
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
          <button
            type="button"
            className="btn btn-outline"
            onClick={handleClearFilter}
          >
            Limpar
          </button>
        </div>
      </form>

      {/* Tabela */}
      <div className="card">
        <div className="card-header">
          <h4>Títulos de Contas a Receber ({contas.length})</h4>
        </div>
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Nº Título</th>
                <th>Cliente (Pessoa)</th>
                <th>Plano de Conta</th>
                <th>Tipo</th>
                <th>Emissão / Venc.</th>
                <th className="text-right">Valor Original</th>
                <th className="text-right">Valor Recebido</th>
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
                      <span className="state-icon">💰</span>
                      <h5>Nenhuma conta a receber encontrada</h5>
                      <p>
                        Não há títulos registrados para os filtros selecionados.
                      </p>
                      <button
                        type="button"
                        className="btn btn-primary"
                        onClick={openNewModal}
                      >
                        + Lançar Conta a Receber
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
                      <span className="cell-sub">
                        {c.pessoa?.documento ?? ''}
                      </span>
                    </td>
                    <td>
                      <span className="cell-main">
                        {c.planoConta?.descricao ?? '—'}
                      </span>
                      <span className="cell-sub">
                        {c.planoConta?.codigo ?? ''}
                      </span>
                    </td>
                    <td>
                      <span className="badge badge-tipo">
                        {formatTipoTitulo(c.tipoTitulo)}
                      </span>
                    </td>
                    <td>
                      <span className="cell-main">
                        {formatDate(c.vencimento)}
                      </span>
                      <span className="cell-sub">
                        Emissão: {formatDate(c.emissao)}
                      </span>
                    </td>
                    <td className="text-right font-mono">
                      {formatCurrency(c.valor)}
                    </td>
                    <td className="text-right font-mono">
                      {c.valorRecebido ? (
                        <div>
                          <strong>{formatCurrency(c.valorRecebido)}</strong>
                          <span className="cell-sub">
                            em {formatDate(c.dataRecebimento)}
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
                        {c.situacao !== 'RECEBIDA' && (
                          <button
                            type="button"
                            className="btn btn-sm btn-success"
                            onClick={() => openRecebimentoModal(c)}
                          >
                            💰 Receber
                          </button>
                        )}
                        <button
                          type="button"
                          className="btn btn-sm btn-outline"
                          onClick={() => openEditModal(c)}
                        >
                          ✏️
                        </button>
                        <button
                          type="button"
                          className="btn btn-sm btn-outline"
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
                {editingId
                  ? 'Editar Conta a Receber'
                  : 'Lançar Nova Conta a Receber'}
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

                <div className="form-grid">
                  <div className="form-group">
                    <label>Número do Título *</label>
                    <input
                      type="text"
                      required
                      maxLength={20}
                      className="input-control"
                      placeholder="Ex: CR-2026-001"
                      value={numeroTitulo}
                      onChange={(e) => setNumeroTitulo(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label>Tipo de Título *</label>
                    <select
                      className="select-control"
                      value={tipoTitulo}
                      onChange={(e) =>
                        setTipoTitulo(e.target.value as TipoTitulo)
                      }
                    >
                      {TIPOS_TITULO.map((t) => (
                        <option key={t} value={t}>
                          {formatTipoTitulo(t)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Pessoa (Cliente) *</label>
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
                    <label>Data Limite p/ Desconto</label>
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

      {/* Modal de Recebimento */}
      {contaRecebimento && (
        <div className="modal-backdrop">
          <div className="modal-panel">
            <div className="modal-header">
              <h4>
                Registrar Recebimento — {contaRecebimento.numeroTitulo}
              </h4>
              <button
                type="button"
                className="btn btn-sm btn-outline"
                onClick={() => setContaRecebimento(null)}
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleConfirmarRecebimento}>
              <div className="modal-body">
                <ErrorBanner
                  error={modalError}
                  onClose={() => setModalError(null)}
                />

                <div className="summary-box">
                  <div>
                    <span>Cliente</span>
                    <strong>{contaRecebimento.pessoa?.nome}</strong>
                  </div>
                  <div>
                    <span>Valor Original</span>
                    <strong>{formatCurrency(contaRecebimento.valor)}</strong>
                  </div>
                  <div>
                    <span>Vencimento</span>
                    <strong>{formatDate(contaRecebimento.vencimento)}</strong>
                  </div>
                  <div>
                    <span>Validade do Desconto</span>
                    <strong>
                      {contaRecebimento.validadeDesc
                        ? formatDate(contaRecebimento.validadeDesc)
                        : 'Sem limite definido'}
                    </strong>
                  </div>
                </div>

                <div className="form-grid">
                  <div className="form-group full-width">
                    <label>Data Efetiva do Recebimento *</label>
                    <input
                      type="date"
                      required
                      className="input-control"
                      value={dataRecebimento}
                      onChange={(e) => setDataRecebimento(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label>Desconto Concedido (R$)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      className="input-control"
                      value={descontoRec}
                      onChange={(e) => setDescontoRec(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label>Acréscimo / Juros (R$)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      className="input-control"
                      value={acrescimoRec}
                      onChange={(e) => setAcrescimoRec(e.target.value)}
                    />
                  </div>
                </div>

                <div
                  className="summary-box"
                  style={{ marginTop: '16px', marginBottom: 0 }}
                >
                  <div>
                    <span>Fórmula (Valor - Desconto + Acréscimo)</span>
                    <strong>Valor Efetivo a Receber:</strong>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span>Status após confirmação: RECEBIDA</span>
                    <strong style={{ fontSize: '16px', color: '#15803d' }}>
                      {formatCurrency(valorPrevistoRec)}
                    </strong>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setContaRecebimento(null)}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn btn-success"
                  disabled={submitting}
                >
                  {submitting ? 'Processando...' : '💰 Confirmar Recebimento'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
