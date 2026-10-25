import React, { useState } from 'react';
import { api, ApiError } from '../services/api';
import { ContaPagar, ContaReceber, PlanoConta } from '../types/cpr';
import { ErrorBanner } from './ErrorBanner';

interface PlanoContasViewProps {
  planos: PlanoConta[];
  contasPagar: ContaPagar[];
  contasReceber: ContaReceber[];
  loading: boolean;
  onRefresh: () => Promise<void>;
}

export const PlanoContasView: React.FC<PlanoContasViewProps> = ({
  planos,
  contasPagar,
  contasReceber,
  loading,
  onRefresh,
}) => {
  const [error, setError] = useState<ApiError | Error | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);

  const [showModal, setShowModal] = useState<boolean>(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [codigo, setCodigo] = useState<string>('');
  const [descricao, setDescricao] = useState<string>('');
  const [consolidada, setConsolidada] = useState<boolean>(false);
  const [modalError, setModalError] = useState<ApiError | Error | null>(null);

  const openNew = () => {
    setModalError(null);
    setEditingId(null);
    setCodigo('');
    setDescricao('');
    setConsolidada(false);
    setShowModal(true);
  };

  const openEdit = (pl: PlanoConta) => {
    setModalError(null);
    setEditingId(pl.id ?? null);
    setCodigo(pl.codigo);
    setDescricao(pl.descricao);
    setConsolidada(pl.consolidada);
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError(null);
    setSuccessMsg(null);

    const payload: PlanoConta = {
      codigo: codigo.trim(),
      descricao: descricao.trim(),
      consolidada,
    };

    try {
      setSubmitting(true);
      if (editingId) {
        await api.atualizarPlanoConta(editingId, payload);
        setSuccessMsg(`Plano de Conta "${payload.codigo}" atualizado!`);
      } else {
        await api.criarPlanoConta(payload);
        setSuccessMsg(`Plano de Conta "${payload.codigo}" criado com sucesso!`);
      }
      setShowModal(false);
      await onRefresh();
    } catch (err) {
      setModalError(
        err instanceof Error ? err : new Error('Erro ao salvar plano de conta.')
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (pl: PlanoConta) => {
    if (!pl.id) return;
    setError(null);
    setSuccessMsg(null);

    const titulosVinculados = [
      ...contasPagar.filter((c) => c.planoConta?.id === pl.id).map((c) => c.numeroTitulo),
      ...contasReceber.filter((c) => c.planoConta?.id === pl.id).map((c) => c.numeroTitulo),
    ];

    if (titulosVinculados.length > 0) {
      setError(
        new Error(
          `Não é possível excluir o plano "${pl.descricao}" pois existem títulos financeiros vinculados a ele (${titulosVinculados.join(
            ', '
          )}). Exclua os títulos antes de remover o plano de conta.`
        )
      );
      return;
    }

    if (!window.confirm(`Deseja realmente excluir o plano "${pl.descricao}"?`))
      return;

    try {
      await api.excluirPlanoConta(pl.id);
      setSuccessMsg(`Plano "${pl.descricao}" removido com sucesso.`);
      await onRefresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err
          : new Error('Não foi possível excluir este plano de conta.')
      );
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h3>Plano de Contas</h3>
          <p>
            Estrutura de classificação contábil para receitas e despesas.
          </p>
        </div>
        <button type="button" className="btn btn-primary" onClick={openNew}>
          + Novo Plano de Conta
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

      <div className="card">
        <div className="card-header">
          <h4>Categorias Contábeis ({planos.length})</h4>
        </div>
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Código Contábil</th>
                <th>Descrição da Conta</th>
                <th>Natureza</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={5}>
                      <div className="skeleton-row" />
                    </td>
                  </tr>
                ))
              ) : planos.length === 0 ? (
                <tr>
                  <td colSpan={5}>
                    <div className="state-box">
                      <span className="state-icon">📂</span>
                      <h5>Nenhum plano de conta cadastrado</h5>
                      <p>
                        Cadastre categorias como "1.01 - Receita de Serviços" ou "2.01 - Fornecedores".
                      </p>
                      <button
                        type="button"
                        className="btn btn-primary"
                        onClick={openNew}
                      >
                        + Criar Plano de Conta
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                planos.map((pl) => (
                  <tr key={pl.id}>
                    <td className="font-mono">#{pl.id}</td>
                    <td className="font-mono">{pl.codigo}</td>
                    <td className="cell-main">{pl.descricao}</td>
                    <td>
                      <span
                        className={`badge ${
                          pl.consolidada ? 'badge-cancelada' : 'badge-aberta'
                        }`}
                      >
                        {pl.consolidada
                          ? 'Sintética (Consolidada)'
                          : 'Analítica (Lançamento)'}
                      </span>
                    </td>
                    <td>
                      <div className="row-actions">
                        <button
                          type="button"
                          className="btn btn-sm btn-outline"
                          onClick={() => openEdit(pl)}
                        >
                          ✏️ Editar
                        </button>
                        <button
                          type="button"
                          className="btn btn-sm btn-outline"
                          onClick={() => handleDelete(pl)}
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

      {showModal && (
        <div className="modal-backdrop">
          <div className="modal-panel">
            <div className="modal-header">
              <h4>
                {editingId ? 'Editar Plano de Conta' : 'Novo Plano de Conta'}
              </h4>
              <button
                type="button"
                className="btn btn-sm btn-outline"
                onClick={() => setShowModal(false)}
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleSave}>
              <div className="modal-body">
                <ErrorBanner
                  error={modalError}
                  onClose={() => setModalError(null)}
                />

                <div className="form-grid">
                  <div className="form-group">
                    <label>Código Contábil *</label>
                    <input
                      type="text"
                      required
                      maxLength={18}
                      className="input-control"
                      placeholder="Ex: 2.01.001"
                      value={codigo}
                      onChange={(e) => setCodigo(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label>Tipo de Conta *</label>
                    <select
                      className="select-control"
                      value={consolidada ? 'true' : 'false'}
                      onChange={(e) =>
                        setConsolidada(e.target.value === 'true')
                      }
                    >
                      <option value="false">Analítica (Aceita Lançamentos)</option>
                      <option value="true">Sintética (Consolidada / Grupo)</option>
                    </select>
                  </div>

                  <div className="form-group full-width">
                    <label>Descrição *</label>
                    <input
                      type="text"
                      required
                      maxLength={60}
                      className="input-control"
                      placeholder="Ex: Despesas com Fornecedores de TI"
                      value={descricao}
                      onChange={(e) => setDescricao(e.target.value)}
                    />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setShowModal(false)}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={submitting}
                >
                  {submitting ? 'Salvando...' : 'Salvar Plano'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
