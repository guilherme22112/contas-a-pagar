-- Tabela unificada de Pessoas (Clientes e Fornecedores)
CREATE TABLE pessoa (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tipo VARCHAR(15) NOT NULL, -- 'CLIENTE', 'FORNECEDOR', 'AMBOS'
  nome VARCHAR(100) NOT NULL,
  documento VARCHAR(18) NOT NULL UNIQUE,
  inscricao_est VARCHAR(15),
  endereco VARCHAR(120),
  cidade VARCHAR(50),
  uf CHAR(2),
  cep VARCHAR(9),
  telefone VARCHAR(20),
  email VARCHAR(80),
  contato VARCHAR(50),
  criado_em DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Tabela hierárquica do Plano de Contas
CREATE TABLE plano_conta (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  codigo VARCHAR(18) NOT NULL UNIQUE,
  descricao VARCHAR(60) NOT NULL,
  superior_id INTEGER REFERENCES plano_conta(id),
  consolidada BOOLEAN NOT NULL DEFAULT 0
);

-- Tabela de Contas a Pagar (Despesas/Pagamentos)
CREATE TABLE conta_pagar (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  numero_titulo VARCHAR(20) NOT NULL UNIQUE,
  pessoa_id INTEGER NOT NULL REFERENCES pessoa(id),
  plano_conta_id INTEGER NOT NULL REFERENCES plano_conta(id),
  tipo_titulo VARCHAR(20) NOT NULL,
  situacao VARCHAR(15) NOT NULL DEFAULT 'ABERTA',
  valor NUMERIC(14,2) NOT NULL CHECK (valor > 0),
  emissao DATE NOT NULL,
  vencimento DATE NOT NULL,
  desconto NUMERIC(14,2) DEFAULT 0,
  validade_desc DATE,
  acrescimo NUMERIC(14,2) DEFAULT 0,
  data_pagamento DATE,
  valor_pago NUMERIC(14,2),
  observacao VARCHAR(255)
);

-- Tabela de Contas a Receber (Recebimentos)
CREATE TABLE conta_receber (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  numero_titulo VARCHAR(20) NOT NULL UNIQUE,
  pessoa_id INTEGER NOT NULL REFERENCES pessoa(id),
  plano_conta_id INTEGER NOT NULL REFERENCES plano_conta(id),
  tipo_titulo VARCHAR(20) NOT NULL,
  situacao VARCHAR(15) NOT NULL DEFAULT 'ABERTA',
  valor NUMERIC(14,2) NOT NULL CHECK (valor > 0),
  emissao DATE NOT NULL,
  vencimento DATE NOT NULL,
  desconto NUMERIC(14,2) DEFAULT 0,
  validade_desc DATE,
  acrescimo NUMERIC(14,2) DEFAULT 0,
  data_recebimento DATE,
  valor_recebido NUMERIC(14,2),
  observacao VARCHAR(255)
);

-- Índices para otimizar as consultas de relatórios
CREATE INDEX ix_cp_venc ON conta_pagar (vencimento, situacao);
CREATE INDEX ix_cr_venc ON conta_receber (vencimento, situacao);