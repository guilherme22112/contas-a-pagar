import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ContasPagarView } from './components/ContasPagarView';
import { ContasReceberView } from './components/ContasReceberView';
import { DashboardView } from './components/DashboardView';
import { ErrorBanner } from './components/ErrorBanner';
import { PessoasView } from './components/PessoasView';
import { PlanoContasView } from './components/PlanoContasView';
import { api, ApiError } from './services/api';
import {
  ContaPagar,
  ContaReceber,
  FiltroContas,
  Pessoa,
  PlanoConta,
} from './types/cpr';

type TabKey = 'dashboard' | 'pagar' | 'receber' | 'pessoas' | 'planos';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabKey>('dashboard');

  const [contasPagar, setContasPagar] = useState<ContaPagar[]>([]);
  const [contasReceber, setContasReceber] = useState<ContaReceber[]>([]);
  const [pessoas, setPessoas] = useState<Pessoa[]>([]);
  const [planosConta, setPlanosConta] = useState<PlanoConta[]>([]);

  const [loading, setLoading] = useState<boolean>(true);
  const [apiOnline, setApiOnline] = useState<boolean>(true);
  const [globalError, setGlobalError] = useState<ApiError | Error | null>(null);
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

  const loadAllData = useCallback(async () => {
    setLoading(true);
    setGlobalError(null);

    const results = await Promise.allSettled([
      api.listarContasPagar(),
      api.listarContasReceber(),
      api.listarPessoas(),
      api.listarPlanosConta(),
    ]);

    let firstError: ApiError | Error | null = null;
    let anySuccess = false;

    if (results[0].status === 'fulfilled') {
      setContasPagar(results[0].value);
      anySuccess = true;
    } else {
      firstError = results[0].reason as Error;
    }

    if (results[1].status === 'fulfilled') {
      setContasReceber(results[1].value);
      anySuccess = true;
    } else if (!firstError) {
      firstError = results[1].reason as Error;
    }

    if (results[2].status === 'fulfilled') {
      setPessoas(results[2].value);
      anySuccess = true;
    } else if (!firstError) {
      firstError = results[2].reason as Error;
    }

    if (results[3].status === 'fulfilled') {
      setPlanosConta(results[3].value);
      anySuccess = true;
    } else if (!firstError) {
      firstError = results[3].reason as Error;
    }

    setApiOnline(anySuccess);
    if (firstError) {
      setGlobalError(firstError);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void loadAllData();
  }, [loadAllData]);

  const handleRefreshContasPagar = async (filtro?: FiltroContas) => {
    setLoading(true);
    try {
      const [cp, ps, pl] = await Promise.all([
        api.listarContasPagar(filtro),
        api.listarPessoas(),
        api.listarPlanosConta(),
      ]);
      setContasPagar(cp);
      setPessoas(ps);
      setPlanosConta(pl);
      setApiOnline(true);
    } catch (err) {
      setGlobalError(
        err instanceof Error ? err : new Error('Erro ao buscar contas a pagar.')
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRefreshContasReceber = async (filtro?: FiltroContas) => {
    setLoading(true);
    try {
      const [cr, ps, pl] = await Promise.all([
        api.listarContasReceber(filtro),
        api.listarPessoas(),
        api.listarPlanosConta(),
      ]);
      setContasReceber(cr);
      setPessoas(ps);
      setPlanosConta(pl);
      setApiOnline(true);
    } catch (err) {
      setGlobalError(
        err instanceof Error
          ? err
          : new Error('Erro ao buscar contas a receber.')
      );
    } finally {
      setLoading(false);
    }
  };

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
          <button
            type="button"
            className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            <span className="nav-icon">📊</span>
            <span>Dashboard Financeiro</span>
          </button>

          <button
            type="button"
            className={`nav-item ${activeTab === 'pagar' ? 'active' : ''}`}
            onClick={() => setActiveTab('pagar')}
          >
            <span className="nav-icon">💸</span>
            <span>Contas a Pagar</span>
          </button>

          <button
            type="button"
            className={`nav-item ${activeTab === 'receber' ? 'active' : ''}`}
            onClick={() => setActiveTab('receber')}
          >
            <span className="nav-icon">💰</span>
            <span>Contas a Receber</span>
          </button>

          <span className="nav-section-label">Cadastros Base</span>
          <button
            type="button"
            className={`nav-item ${activeTab === 'pessoas' ? 'active' : ''}`}
            onClick={() => setActiveTab('pessoas')}
          >
            <span className="nav-icon">👥</span>
            <span>Pessoas (Cli / Forn)</span>
          </button>

          <button
            type="button"
            className={`nav-item ${activeTab === 'planos' ? 'active' : ''}`}
            onClick={() => setActiveTab('planos')}
          >
            <span className="nav-icon">📂</span>
            <span>Plano de Contas</span>
          </button>
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
            onClose={() => setGlobalError(null)}
          />

          {activeTab === 'dashboard' && (
            <DashboardView
              contasPagar={contasPagar}
              contasReceber={contasReceber}
              pessoas={pessoas}
              planosConta={planosConta}
              loading={loading}
              onNavigate={(tab) => setActiveTab(tab)}
            />
          )}

          {activeTab === 'pagar' && (
            <ContasPagarView
              contas={contasPagar}
              pessoas={pessoas}
              planosConta={planosConta}
              loading={loading}
              onRefresh={handleRefreshContasPagar}
            />
          )}

          {activeTab === 'receber' && (
            <ContasReceberView
              contas={contasReceber}
              pessoas={pessoas}
              planosConta={planosConta}
              loading={loading}
              onRefresh={handleRefreshContasReceber}
            />
          )}

          {activeTab === 'pessoas' && (
            <PessoasView
              pessoas={pessoas}
              contasPagar={contasPagar}
              contasReceber={contasReceber}
              loading={loading}
              onRefresh={loadAllData}
            />
          )}

          {activeTab === 'planos' && (
            <PlanoContasView
              planos={planosConta}
              contasPagar={contasPagar}
              contasReceber={contasReceber}
              loading={loading}
              onRefresh={loadAllData}
            />
          )}
        </main>
      </div>
    </div>
  );
};
