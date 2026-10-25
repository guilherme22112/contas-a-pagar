// Tipagens estritas espelhadas 1:1 com o Back-End Spring Boot (sem uso de 'any')

export type TipoPessoa = 'CLIENTE' | 'FORNECEDOR' | 'AMBOS';

export type SituacaoConta = 'ABERTA' | 'PAGA' | 'RECEBIDA' | 'VENCIDA' | 'CANCELADA';

export type TipoTitulo = 'DUPLICATA' | 'NOTA_PROMISSORIA' | 'PIX' | 'CARTAO' | 'OUTROS';

export interface Pessoa {
  id?: number;
  tipo: TipoPessoa;
  nome: string;
  documento: string;
  inscricaoEstadual?: string;
  endereco?: string;
  cidade?: string;
  uf?: string;
  cep?: string;
  telefone?: string;
  email?: string;
  contato?: string;
  criadoEm?: string;
}

export interface PlanoConta {
  id?: number;
  codigo: string;
  descricao: string;
  superior?: PlanoConta | null;
  consolidada: boolean;
}

export interface ContaPagar {
  id?: number;
  numeroTitulo: string;
  pessoa: Pessoa;
  planoConta: PlanoConta;
  tipoTitulo: TipoTitulo;
  situacao?: SituacaoConta;
  valor: number;
  emissao: string;
  vencimento: string;
  desconto?: number;
  validadeDesc?: string | null;
  acrescimo?: number;
  dataPagamento?: string | null;
  valorPago?: number | null;
  observacao?: string;
}

export interface ContaReceber {
  id?: number;
  numeroTitulo: string;
  pessoa: Pessoa;
  planoConta: PlanoConta;
  tipoTitulo: TipoTitulo;
  situacao?: SituacaoConta;
  valor: number;
  emissao: string;
  vencimento: string;
  desconto?: number;
  validadeDesc?: string | null;
  acrescimo?: number;
  dataRecebimento?: string | null;
  valorRecebido?: number | null;
  observacao?: string;
}

export interface QuitacaoRequest {
  data: string;
  desconto: number;
  acrescimo: number;
}

export interface CampoErro {
  nome: string;
  mensagem: string;
}

export interface ErroResposta {
  timestamp: string;
  status: number;
  erro: string;
  mensagem: string;
  campos?: CampoErro[] | null;
}

export interface FiltroContas {
  inicio?: string;
  fim?: string;
  situacao?: SituacaoConta | '';
}
