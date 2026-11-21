// Testes das regras de negócio executadas no aparelho (src/negocio/regras.ts).
// As mesmas regras são garantidas no banco; estes testes cobrem a validação de conveniência das telas.
import {
  digitosTelefone,
  formatarTelefone,
  iniciais,
  limparTermo,
  linkWhatsApp,
  situacaoInteresse,
  temErros,
  tempoRelativo,
  validarCadastro,
  validarDetalhes,
  validarLocal,
  validarLogin,
  validarNovaSenha,
} from '@/negocio/regras';
import type { Anuncio, DadosAnuncio, Perfil } from '@/negocio/tipos';

const anuncio = (p: Partial<Anuncio> = {}): Anuncio => ({
  id: 1,
  usuario_id: 'dono',
  categoria_id: 1,
  titulo: 'Casaco',
  descricao: 'Casaco azul tamanho 6',
  cidade: 'Campinas',
  uf: 'SP',
  status: 'DISPONIVEL',
  inativado_por: null,
  criado_em: '2026-11-20T10:00:00Z',
  atualizado_em: '2026-11-20T10:00:00Z',
  concluido_em: null,
  categoria: null,
  usuario: null,
  ...p,
});
const perfil = (p: Partial<Perfil> = {}): Perfil => ({
  id: 'outra',
  nome: 'Ana Souza',
  email: 'ana@exemplo.com',
  tipo: 'PESSOA_FISICA',
  papel: 'USUARIO',
  situacao: 'ATIVA',
  criado_em: '2026-11-01T00:00:00Z',
  ...p,
});
const dados = (p: Partial<DadosAnuncio> = {}): DadosAnuncio => ({
  titulo: 'Casaco infantil',
  descricao: 'Casaco azul, usado um inverno.',
  categoriaId: 1,
  cidade: 'Campinas',
  uf: 'SP',
  telefone: '',
  ...p,
});

describe('cadastro e login (RF-001, RF-002)', () => {
  test('aceita dados válidos', () => {
    expect(temErros(validarCadastro({ nome: 'Ana', email: 'ana@exemplo.com', senha: '12345678' }))).toBe(false);
  });
  test('recusa nome curto, e-mail inválido e senha curta', () => {
    const e = validarCadastro({ nome: 'A', email: 'ana@', senha: '123' });
    expect(Object.keys(e).sort()).toEqual(['email', 'nome', 'senha']);
  });
  test('login exige e-mail e senha', () => {
    expect(validarLogin({ email: '', senha: '' })).toEqual({ email: 'Digite o e-mail da sua conta.', senha: 'Digite sua senha.' });
  });
});

describe('troca de senha (DA-09)', () => {
  test('exige a senha atual quando ela faz parte do formulário', () => {
    expect(validarNovaSenha({ atual: '', nova: 'nova-senha-1', confirmacao: 'nova-senha-1' }).atual).toBeDefined();
  });
  test('nova senha precisa ser diferente da atual e confirmada', () => {
    expect(validarNovaSenha({ atual: 'mesma-senha', nova: 'mesma-senha', confirmacao: 'mesma-senha' }).nova).toMatch(/diferente/);
    expect(validarNovaSenha({ nova: 'nova-senha-1', confirmacao: 'outra' }).confirmacao).toBeDefined();
    expect(temErros(validarNovaSenha({ nova: 'nova-senha-1', confirmacao: 'nova-senha-1' }))).toBe(false);
  });
});

describe('anúncio (RF-003)', () => {
  test('detalhes: título, categoria e descrição', () => {
    expect(temErros(validarDetalhes(dados()))).toBe(false);
    expect(Object.keys(validarDetalhes(dados({ titulo: 'ab', categoriaId: null, descricao: 'curta' }))).sort()).toEqual(['categoria', 'descricao', 'titulo']);
  });
  test('local: cidade e UF válida', () => {
    expect(Object.keys(validarLocal(dados({ cidade: '', uf: 'XX' }))).sort()).toEqual(['cidade', 'uf']);
  });
});

describe('telefone de contato (DA-10)', () => {
  test('é opcional, mas quando informado precisa de DDD + número', () => {
    expect(validarLocal(dados({ telefone: '' })).telefone).toBeUndefined();
    expect(validarLocal(dados({ telefone: '(11) 98765-4321' })).telefone).toBeUndefined();
    expect(validarLocal(dados({ telefone: '(11) 3456-7890' })).telefone).toBeUndefined();
    expect(validarLocal(dados({ telefone: '1198' })).telefone).toBeDefined();
  });
  test('remove +55, zero do DDD e símbolos', () => {
    expect(digitosTelefone('+55 (11) 98765-4321')).toBe('11987654321');
    expect(digitosTelefone('011 3456-7890')).toBe('1134567890');
  });
  test('máscara enquanto digita termina sempre num dígito', () => {
    expect(formatarTelefone('1')).toBe('(1');
    expect(formatarTelefone('11')).toBe('(11');
    expect(formatarTelefone('119')).toBe('(11) 9');
    expect(formatarTelefone('1134567890')).toBe('(11) 3456-7890');
    expect(formatarTelefone('11987654321')).toBe('(11) 98765-4321');
  });
  test('link do WhatsApp usa o código do Brasil e codifica a mensagem', () => {
    expect(linkWhatsApp('(11) 98765-4321', 'Olá!')).toBe('https://wa.me/5511987654321?text=Ol%C3%A1!');
  });
});

describe('quem pode demonstrar interesse (RN-02, RN-03, RN-04)', () => {
  test('visitante, bloqueado, próprio, indisponível, já manifestou e pode', () => {
    expect(situacaoInteresse(anuncio(), null, false)).toBe('visitante');
    expect(situacaoInteresse(anuncio(), perfil({ situacao: 'BLOQUEADA' }), false)).toBe('bloqueado');
    expect(situacaoInteresse(anuncio(), perfil({ id: 'dono' }), false)).toBe('proprio');
    expect(situacaoInteresse(anuncio({ status: 'DOADO' }), perfil(), false)).toBe('indisponivel');
    expect(situacaoInteresse(anuncio(), perfil(), true)).toBe('ja_manifestou');
    expect(situacaoInteresse(anuncio(), perfil(), false)).toBe('pode');
  });
});

describe('apresentação', () => {
  test('tempo relativo', () => {
    const agora = new Date('2026-11-20T12:00:00Z');
    expect(tempoRelativo('2026-11-20T11:59:40Z', agora)).toBe('agora');
    expect(tempoRelativo('2026-11-20T11:30:00Z', agora)).toBe('há 30 min');
    expect(tempoRelativo('2026-11-19T12:00:00Z', agora)).toBe('ontem');
    expect(tempoRelativo('2026-10-20T12:00:00Z', agora)).toBe('há 1 mês');
  });
  test('iniciais e limpeza do termo de busca', () => {
    expect(iniciais('Ana Maria Souza')).toBe('AS');
    expect(limparTermo('casaco, (azul)%')).toBe('casaco   azul');
  });
});
