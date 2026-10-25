import React, { useState } from 'react';
import { api, ApiError } from '../services/api';
import { ContaPagar, ContaReceber, Pessoa, TipoPessoa } from '../types/cpr';
import { formatTipoPessoa } from '../utils/formatters';
import { ErrorBanner } from './ErrorBanner';

interface PessoasViewProps {
  pessoas: Pessoa[];
  contasPagar: ContaPagar[];
  contasReceber: ContaReceber[];
  loading: boolean;
  onRefresh: () => Promise<void>;
}

const TIPOS_PESSOA: TipoPessoa[] = ['CLIENTE', 'FORNECEDOR', 'AMBOS'];

export const PessoasView: React.FC<PessoasViewProps> = ({
  pessoas,
  contasPagar,
  contasReceber,
  loading,
  onRefresh,
}) => {
  const [busca, setBusca] = useState<string>('');
  const [filtroTipo, setFiltroTipo] = useState<TipoPessoa | ''>('');

  const [error, setError] = useState<ApiError | Error | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);

  const [showModal, setShowModal] = useState<boolean>(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [tipo, setTipo] = useState<TipoPessoa>('FORNECEDOR');
  const [nome, setNome] = useState<string>('');
  const [documento, setDocumento] = useState<string>('');
  const [inscricaoEstadual, setInscricaoEstadual] = useState<string>('');
  const [telefone, setTelefone] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [contato, setContato] = useState<string>('');
  const [cep, setCep] = useState<string>('');
  const [endereco, setEndereco] = useState<string>('');
  const [cidade, setCidade] = useState<string>('');
  const [uf, setUf] = useState<string>('');
  const [modalError, setModalError] = useState<ApiError | Error | null>(null);

  const pessoasFiltradas = pessoas.filter((p) => {
    const matchTipo = !filtroTipo || p.tipo === filtroTipo;
    const termo = busca.toLowerCase();
    const matchBusca =
      !termo ||
      p.nome.toLowerCase().includes(termo) ||
      p.documento.toLowerCase().includes(termo) ||
      (p.email ?? '').toLowerCase().includes(termo);
    return matchTipo && matchBusca;
  });

  const openNew = () => {
    setModalError(null);
    setEditingId(null);
    setTipo('FORNECEDOR');
    setNome('');
    setDocumento('');
    setInscricaoEstadual('');
    setTelefone('');
    setEmail('');
    setContato('');
    setCep('');
    setEndereco('');
    setCidade('');
    setUf('');
    setShowModal(true);
  };

  const openEdit = (p: Pessoa) => {
    setModalError(null);
    setEditingId(p.id ?? null);
    setTipo(p.tipo);
    setNome(p.nome);
    setDocumento(p.documento);
    setInscricaoEstadual(p.inscricaoEstadual ?? '');
    setTelefone(p.telefone ?? '');
    setEmail(p.email ?? '');
    setContato(p.contato ?? '');
    setCep(p.cep ?? '');
    setEndereco(p.endereco ?? '');
    setCidade(p.cidade ?? '');
    setUf(p.uf ?? '');
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError(null);
    setSuccessMsg(null);

    const payload: Pessoa = {
      tipo,
      nome: nome.trim(),
      documento: documento.trim(),
      inscricaoEstadual: inscricaoEstadual.trim() || undefined,
      telefone: telefone.trim() || undefined,
      email: email.trim() || undefined,
      contato: contato.trim() || undefined,
      cep: cep.trim() || undefined,
      endereco: endereco.trim() || undefined,
      cidade: cidade.trim() || undefined,
      uf: uf.trim().toUpperCase() || undefined,
    };

    try {
      setSubmitting(true);
      if (editingId) {
        await api.atualizarPessoa(editingId, payload);
        setSuccessMsg(`Cadastro de "${payload.nome}" atualizado com sucesso!`);
      } else {
        await api.criarPessoa(payload);
        setSuccessMsg(`Pessoa "${payload.nome}" cadastrada com sucesso!`);
      }
      setShowModal(false);
      await onRefresh();
    } catch (err) {
      setModalError(
        err instanceof Error ? err : new Error('Erro ao salvar pessoa.')
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (p: Pessoa) => {
    if (!p.id) return;
    setError(null);
    setSuccessMsg(null);

    const titulosVinculados = [
      ...contasPagar.filter((c) => c.pessoa?.id === p.id).map((c) => c.numeroTitulo),
      ...contasReceber.filter((c) => c.pessoa?.id === p.id).map((c) => c.numeroTitulo),
    ];

    if (titulosVinculados.length > 0) {
      setError(
        new Error(
          `Não é possível excluir "${p.nome}" pois existem títulos financeiros vinculados a esta pessoa (${titulosVinculados.join(
            ', '
          )}). Exclua os títulos antes de remover a pessoa.`
        )
      );
      return;
    }

    if (!window.confirm(`Deseja realmente excluir "${p.nome}"?`)) return;

    try {
      await api.excluirPessoa(p.id);
      setSuccessMsg(`Pessoa "${p.nome}" removida com sucesso.`);
      await onRefresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err
          : new Error('Não foi possível excluir esta pessoa.')
      );
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h3>Pessoas (Clientes e Fornecedores)</h3>
          <p>
            Cadastro prévio obrigatório para vínculo de títulos de Contas a Pagar e a Receber.
          </p>
        </div>
        <button type="button" className="btn btn-primary" onClick={openNew}>
          + Nova Pessoa
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

      <div className="filter-bar">
        <div className="filter-group" style={{ flex: 2 }}>
          <label>Buscar por Nome, CPF/CNPJ ou E-mail</label>
          <input
            type="text"
            className="input-control"
            placeholder="Digite para filtrar..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </div>
        <div className="filter-group">
          <label>Tipo de Vínculo</label>
          <select
            className="select-control"
            value={filtroTipo}
            onChange={(e) => setFiltroTipo(e.target.value as TipoPessoa | '')}
          >
            <option value="">Todos os tipos</option>
            {TIPOS_PESSOA.map((t) => (
              <option key={t} value={t}>
                {formatTipoPessoa(t)}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h4>Pessoas Cadastradas ({pessoasFiltradas.length})</h4>
        </div>
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nome / Razão Social</th>
                <th>CPF / CNPJ</th>
                <th>Tipo</th>
                <th>Cidade / UF</th>
                <th>Contato / Telefone</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={7}>
                      <div className="skeleton-row" />
                    </td>
                  </tr>
                ))
              ) : pessoasFiltradas.length === 0 ? (
                <tr>
                  <td colSpan={7}>
                    <div className="state-box">
                      <span className="state-icon">👥</span>
                      <h5>Nenhuma pessoa encontrada</h5>
                      <p>
                        Cadastre clientes e fornecedores para poder lançar títulos financeiros.
                      </p>
                      <button
                        type="button"
                        className="btn btn-primary"
                        onClick={openNew}
                      >
                        + Cadastrar Pessoa
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                pessoasFiltradas.map((p) => (
                  <tr key={p.id}>
                    <td className="font-mono">#{p.id}</td>
                    <td>
                      <span className="cell-main">{p.nome}</span>
                      <span className="cell-sub">{p.email ?? ''}</span>
                    </td>
                    <td className="font-mono">{p.documento}</td>
                    <td>
                      <span className="badge badge-tipo">
                        {formatTipoPessoa(p.tipo)}
                      </span>
                    </td>
                    <td>
                      {p.cidade ? `${p.cidade}/${p.uf ?? ''}` : '—'}
                    </td>
                    <td>
                      <span className="cell-main">{p.telefone ?? '—'}</span>
                      <span className="cell-sub">{p.contato ?? ''}</span>
                    </td>
                    <td>
                      <div className="row-actions">
                        <button
                          type="button"
                          className="btn btn-sm btn-outline"
                          onClick={() => openEdit(p)}
                        >
                          ✏️ Editar
                        </button>
                        <button
                          type="button"
                          className="btn btn-sm btn-outline"
                          onClick={() => handleDelete(p)}
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
              <h4>{editingId ? 'Editar Pessoa' : 'Cadastrar Nova Pessoa'}</h4>
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
                  <div className="form-group full-width">
                    <label>Nome / Razão Social *</label>
                    <input
                      type="text"
                      required
                      maxLength={100}
                      className="input-control"
                      placeholder="Ex: Tech Suprimentos Ltda"
                      value={nome}
                      onChange={(e) => setNome(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label>Documento (CPF ou CNPJ) *</label>
                    <input
                      type="text"
                      required
                      maxLength={18}
                      className="input-control"
                      placeholder="Ex: 12.345.678/0001-90"
                      value={documento}
                      onChange={(e) => setDocumento(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label>Tipo de Pessoa *</label>
                    <select
                      className="select-control"
                      value={tipo}
                      onChange={(e) => setTipo(e.target.value as TipoPessoa)}
                    >
                      {TIPOS_PESSOA.map((t) => (
                        <option key={t} value={t}>
                          {formatTipoPessoa(t)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Telefone</label>
                    <input
                      type="text"
                      maxLength={20}
                      className="input-control"
                      placeholder="(64) 99999-0000"
                      value={telefone}
                      onChange={(e) => setTelefone(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label>E-mail</label>
                    <input
                      type="email"
                      maxLength={80}
                      className="input-control"
                      placeholder="financeiro@empresa.com.br"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label>Cidade</label>
                    <input
                      type="text"
                      maxLength={50}
                      className="input-control"
                      value={cidade}
                      onChange={(e) => setCidade(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label>UF</label>
                    <input
                      type="text"
                      maxLength={2}
                      className="input-control"
                      placeholder="GO"
                      value={uf}
                      onChange={(e) => setUf(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label>CEP</label>
                    <input
                      type="text"
                      maxLength={9}
                      className="input-control"
                      placeholder="75600-000"
                      value={cep}
                      onChange={(e) => setCep(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label>Pessoa de Contato</label>
                    <input
                      type="text"
                      maxLength={50}
                      className="input-control"
                      value={contato}
                      onChange={(e) => setContato(e.target.value)}
                    />
                  </div>

                  <div className="form-group full-width">
                    <label>Endereço Completo</label>
                    <input
                      type="text"
                      maxLength={120}
                      className="input-control"
                      value={endereco}
                      onChange={(e) => setEndereco(e.target.value)}
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
                  {submitting ? 'Salvando...' : 'Salvar Pessoa'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
