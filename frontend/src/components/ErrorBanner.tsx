import React from 'react';
import { ApiError } from '../services/api';

interface ErrorBannerProps {
  error: ApiError | Error | null;
  onClose: () => void;
}

export const ErrorBanner: React.FC<ErrorBannerProps> = ({ error, onClose }) => {
  if (!error) return null;

  const isApiError = error instanceof ApiError;

  return (
    <div className="alert alert-error" role="alert">
      <div>
        <strong>
          {isApiError ? `Erro ${error.status} (${error.codigoErro}): ` : 'Erro: '}
        </strong>
        <span>{error.message}</span>
        {isApiError && error.campos.length > 0 && (
          <ul>
            {error.campos.map((c, idx) => (
              <li key={idx}>
                <strong>{c.nome}:</strong> {c.mensagem}
              </li>
            ))}
          </ul>
        )}
      </div>
      <button type="button" className="btn btn-sm btn-outline" onClick={onClose}>
        Fechar
      </button>
    </div>
  );
};
