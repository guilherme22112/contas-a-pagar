import { z } from 'zod';

/**
 * Schemas Zod dos formulários do CPR.
 * São usados com React Hook Form via `zodResolver(schema)` e espelham as
 * validações do back-end (Bean Validation), para o usuário ver o erro antes
 * de a requisição sair.
 */

const apenasDigitos = (v: string) => v.replace(/\D/g, '');

const dataISO = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Informe uma data válida.');

const valorMonetario = z.coerce
  .number({ invalid_type_error: 'Informe um valor numérico.' })
  .min(0, 'O valor não pode ser negativo.');

export const pessoaSchema = z.object({
  tipo: z.enum(['CLIENTE', 'FORNECEDOR', 'AMBOS']),
  nome: z.string().trim().min(3, 'O nome deve ter ao menos 3 caracteres.'),
  documento: z
    .string()
    .transform(apenasDigitos)
    .refine((d) => d.length === 11 || d.length === 14, 'Informe um CPF (11) ou CNPJ (14 dígitos).'),
  inscricaoEstadual: z.string().optional(),
  endereco: z.string().optional(),
  cidade: z.string().optional(),
  uf: z
    .string()
    .trim()
    .toUpperCase()
    .refine((v) => v === '' || /^[A-Z]{2}$/.test(v), 'UF deve ter 2 letras.')
    .optional(),
  cep: z
    .string()
    .transform(apenasDigitos)
    .refine((v) => v === '' || v.length === 8, 'CEP deve ter 8 dígitos.')
    .optional(),
  telefone: z.string().optional(),
  email: z.union([z.literal(''), z.string().email('E-mail inválido.')]).optional(),
  contato: z.string().optional(),
});
export type PessoaForm = z.infer<typeof pessoaSchema>;

export const planoContaSchema = z.object({
  codigo: z
    .string()
    .trim()
    .regex(/^\d+(\.\d+)*$/, 'Use o formato 1, 1.1, 1.1.01 ...'),
  descricao: z.string().trim().min(3, 'Descrição muito curta.'),
  superiorId: z.coerce.number().int().positive().optional(),
  consolidada: z.boolean(),
});
export type PlanoContaForm = z.infer<typeof planoContaSchema>;

export const contaSchema = z
  .object({
    numeroTitulo: z.string().trim().min(1, 'Informe o número do título.'),
    pessoaId: z.coerce.number().int().positive('Selecione a pessoa.'),
    planoContaId: z.coerce.number().int().positive('Selecione o plano de conta.'),
    tipoTitulo: z.enum(['DUPLICATA', 'NOTA_PROMISSORIA', 'PIX', 'CARTAO', 'OUTROS']),
    valor: valorMonetario.refine((v) => v > 0, 'O valor deve ser maior que zero.'),
    emissao: dataISO,
    vencimento: dataISO,
    desconto: valorMonetario.default(0),
    validadeDesc: z.union([z.literal(''), dataISO]).optional(),
    acrescimo: valorMonetario.default(0),
    observacao: z.string().max(500).optional(),
  })
  .refine((c) => c.vencimento >= c.emissao, {
    path: ['vencimento'],
    message: 'O vencimento não pode ser anterior à emissão.',
  })
  .refine((c) => c.desconto < c.valor, {
    path: ['desconto'],
    message: 'O desconto deve ser menor que o valor do título.',
  });
export type ContaForm = z.infer<typeof contaSchema>;

export const quitacaoSchema = z.object({
  data: dataISO,
  desconto: valorMonetario.default(0),
  acrescimo: valorMonetario.default(0),
});
export type QuitacaoForm = z.infer<typeof quitacaoSchema>;
