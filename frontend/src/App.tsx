import React, { useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Navigate, NavLink, Route, Routes, useNavigate } from 'react-router-dom';
import { FluxoCaixaChart } from './components/charts/FluxoCaixaChart';
import { ContasPagarView } from './components/ContasPagarView';
import { ContasReceberView } from './components/ContasReceberView';
import { DashboardView } from './components/DashboardView';
import { ErrorBanner } from './components/ErrorBanner';
import { PessoasView } from './components/PessoasView';
import { PlanoContasView } from './components/PlanoContasView';
import {
  cprKeys,
  useContasPagar,
  useContasReceber,
  usePessoas,
  usePlanosConta,
} from './hooks/useCprQueries';
import { FiltroContas } from './types/cpr';

const ROTAS = {
  dashboard: '/',
  pagar: '/contas-pagar',
  receber: '/contas-receber',
  pessoas: '/pessoas',
  planos: '/plano-contas',
} as const;

type TabKey = keyof typeof ROTAS;

const navClass = ({ isActive }: { isActive: boolean }) =>
  `nav-item ${isActive ? 'active' : ''}`;

export const App: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Filtros das listagens ficam aqui; mudar o filtro muda a chave da query
  // e o TanStack Query busca os dados de novo sozinho.
  const [filtroPagar, setFiltroPagar] = useState<FiltroContas | undefined>();
  const [filtroReceber, setFiltroReceber] = useState<FiltroContas | undefined>();

  const contasPagarQ = useContasPagar(filtroPagar);
  const contasReceberQ = useContasReceber(filtroReceber);
  const pessoasQ = usePessoas();
  const planosQ = usePlanosConta();
  const queries = [contasPagarQ, contasReceberQ, pessoasQ, planosQ];

  const contasPagar = contasPagarQ.data ?? [];
  const contasReceber = contasReceberQ.data ?? [];
  const pessoas = pessoasQ.data ?? [];
  const planosConta = planosQ.data ?? [];

  const loading = queries.some((q) => q.isLoading || q.isFetching);
  const apiOnline = queries.some((q) => q.isSuccess);
  const queryError = queries.find((q) => q.error)?.error ?? null;
  const [errorDismissed, setErrorDismissed] = useState<Error | null>(null);
  const globalError = queryError && queryError !== errorDismissed ? queryError : null;

  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handleToggleEasterEgg = () => {
    if (!audioRef.current) {
      const audio = new Audio('/breaking-bad-intro.mp3');
      audio.onended = () => setIsPlayingAudio(false);
      audioRef.current = audio;
    }

    if (isPlayingAudio) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlayingAudio(false);
    } else {
      audioRef.current.currentTime = 0;
      void audioRef.current.play();
      setIsPlayingAudio(true);
    }
  };

  // Invalida todo o cache do CPR: listas, cadastros e dashboard se atualizam juntos.
  const refreshAll = async () => {
    await queryClient.invalidateQueries({ queryKey: cprKeys.all });
  };

  const handleRefreshContasPagar = async (filtro?: FiltroContas) => {
    setFiltroPagar(filtro);
    await refreshAll();
  };

  const handleRefreshContasReceber = async (filtro?: FiltroContas) => {
    setFiltroReceber(filtro);
    await refreshAll();
  };

  const goTo = (tab: TabKey) => navigate(ROTAS[tab]);

  return (
    <div className="app-shell">
      {/* Sidebar Lateral */}
      <aside className="sidebar">
        <div className="sidebar-brand">
          <img
            src="/logo-cpr.png"
            alt="Logo Contas a Pagar e Receber"
            className={`brand-logo-img ${isPlayingAudio ? 'playing-easter-egg' : ''}`}
            onClick={handleToggleEasterEgg}
            title="Say my name..."
          />
          <div className="brand-text">
            <h1>Contas a Pagar e Receber</h1>
          </div>
        </div>

        <nav className="sidebar-nav">
          <span className="nav-section-label">Menu Principal</span>
          <NavLink to={ROTAS.dashboard} className={navClass} end>
            <span className="nav-icon">📊</span>
            <span>Dashboard Financeiro</span>
          </NavLink>

          <NavLink to={ROTAS.pagar} className={navClass}>
            <span className="nav-icon">💸</span>
            <span>Contas a Pagar</span>
          </NavLink>

          <NavLink to={ROTAS.receber} className={navClass}>
            <span className="nav-icon">💰</span>
            <span>Contas a Receber</span>
          </NavLink>

          <span className="nav-section-label">Cadastros Base</span>
          <NavLink to={ROTAS.pessoas} className={navClass}>
            <span className="nav-icon">👥</span>
            <span>Pessoas (Cli / Forn)</span>
          </NavLink>

          <NavLink to={ROTAS.planos} className={navClass}>
            <span className="nav-icon">📂</span>
            <span>Plano de Contas</span>
          </NavLink>
        </nav>

        <div className="sidebar-footer">
          <div>
            <span
              className={`status-dot ${apiOnline ? 'online' : 'offline'}`}
            />
            <strong>API Spring Boot:</strong>{' '}
            {apiOnline ? 'Conectada (8080)' : 'Offline'}
          </div>
        </div>
      </aside>

      {/* Área Principal */}
      <div className="main-content">
        <header className="topbar">
          <div className="topbar-title">
            <h2>Gestão Financeira Integrada</h2>
          </div>
        </header>

        <main className="page-container">
          <ErrorBanner
            error={globalError}
            onClose={() => setErrorDismissed(queryError)}
          />

          <Routes>
            <Route
              path={ROTAS.dashboard}
              element={
                <>
                  <DashboardView
                    contasPagar={contasPagar}
                    contasReceber={contasReceber}
                    pessoas={pessoas}
                    planosConta={planosConta}
                    loading={loading}
                    onNavigate={goTo}
                  />
                  <div style={{ marginTop: 24 }}>
                    <FluxoCaixaChart
                      contasPagar={contasPagar}
                      contasReceber={contasReceber}
                    />
                  </div>
                </>
              }
            />
            <Route
              path={ROTAS.pagar}
              element={
                <ContasPagarView
                  contas={contasPagar}
                  pessoas={pessoas}
                  planosConta={planosConta}
                  loading={loading}
                  onRefresh={handleRefreshContasPagar}
                />
              }
            />
            <Route
              path={ROTAS.receber}
              element={
                <ContasReceberView
                  contas={contasReceber}
                  pessoas={pessoas}
                  planosConta={planosConta}
                  loading={loading}
                  onRefresh={handleRefreshContasReceber}
                />
              }
            />
            <Route
              path={ROTAS.pessoas}
              element={
                <PessoasView
                  pessoas={pessoas}
                  contasPagar={contasPagar}
                  contasReceber={contasReceber}
                  loading={loading}
                  onRefresh={refreshAll}
                />
              }
            />
            <Route
              path={ROTAS.planos}
              element={
                <PlanoContasView
                  planos={planosConta}
                  contasPagar={contasPagar}
                  contasReceber={contasReceber}
                  loading={loading}
                  onRefresh={refreshAll}
                />
              }
            />
            <Route path="*" element={<Navigate to={ROTAS.dashboard} replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};
