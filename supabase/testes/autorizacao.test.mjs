// Testes de autorização do Doa Aqui contra o Supabase real (RLS, gatilhos e funções RPC).
// Executar a partir da raiz do repositório:  node --test supabase/testes/
// Usa a URL e a chave pública de app/src/config.ts e as três contas de teste de supabase/testes/.env:
//   TESTE_ADMIN_EMAIL / TESTE_ADMIN_SENHA            (perfil com papel ADMINISTRADOR)
//   TESTE_DOADOR_EMAIL / TESTE_DOADOR_SENHA
//   TESTE_INTERESSADO_EMAIL / TESTE_INTERESSADO_SENHA
// Cada execução cria anúncios novos (com o prefixo [TESTE]) e os deixa inativos ao final.
import assert from 'node:assert/strict';
import { after, before, describe, test } from 'node:test';

import { cliente, env, logado } from './comum.mjs';

const visitante = cliente();
let admin, doador, interessado;
let idDoador, idInteressado;
let categoriaId;
const criados = [];

const novoAnuncio = (sufixo) => ({
  titulo: `[TESTE] Casaco ${sufixo}`,
  descricao: 'Anúncio criado pelos testes automáticos de autorização do Doa Aqui.',
  categoria_id: categoriaId,
  cidade: 'Campinas',
  uf: 'SP',
});

async function publicarComo(sb, sufixo) {
  const { data, error } = await sb.from('anuncio').insert(novoAnuncio(sufixo)).select('id, status, usuario_id').single();
  assert.ifError(error);
  criados.push(data.id);
  return data;
}

before(async () => {
  for (const chave of ['ADMIN', 'DOADOR', 'INTERESSADO']) {
    assert.ok(env[`TESTE_${chave}_EMAIL`] && env[`TESTE_${chave}_SENHA`], `Faltam as credenciais TESTE_${chave}_* em supabase/testes/.env`);
  }
  admin = await logado(env.TESTE_ADMIN_EMAIL, env.TESTE_ADMIN_SENHA);
  doador = await logado(env.TESTE_DOADOR_EMAIL, env.TESTE_DOADOR_SENHA);
  interessado = await logado(env.TESTE_INTERESSADO_EMAIL, env.TESTE_INTERESSADO_SENHA);
  for (const sb of [admin, doador, interessado]) {
    const { error } = await sb.rpc('criar_meu_perfil');
    assert.ifError(error);
  }
  idDoador = (await doador.auth.getUser()).data.user.id;
  idInteressado = (await interessado.auth.getUser()).data.user.id;
  const { data } = await visitante.from('categoria').select('id').order('id').limit(1).single();
  categoriaId = data.id;
});

after(async () => {
  // Deixa os anúncios de teste fora da pesquisa pública.
  for (const id of criados) await admin.rpc('admin_desativar_anuncio', { p_anuncio_id: id });
  // Garante que o interessado termina desbloqueado.
  await admin.rpc('admin_definir_situacao', { p_usuario_id: idInteressado, p_situacao: 'ATIVA' });
});

describe('Conta e perfil (RF-001, RF-002, RNF-002, RNF-007)', () => {
  test('meu_perfil devolve o próprio perfil, sem senha', async () => {
    const { data, error } = await doador.rpc('meu_perfil');
    assert.ifError(error);
    assert.equal(data.length, 1);
    assert.equal(data[0].email, env.TESTE_DOADOR_EMAIL);
    assert.deepEqual(Object.keys(data[0]).sort(), ['criado_em', 'email', 'id', 'nome', 'papel', 'situacao', 'tipo']);
  });

  test('visitante não executa meu_perfil', async () => {
    const { error } = await visitante.rpc('meu_perfil');
    assert.ok(error, 'deveria recusar o visitante');
  });

  test('colunas papel e situação não são legíveis pela API', async () => {
    const { error } = await doador.from('usuario').select('papel, situacao');
    assert.ok(error, 'deveria negar papel/situação');
  });

  test('nome e tipo do responsável são públicos (RF-005)', async () => {
    const { data, error } = await visitante.from('usuario').select('nome, tipo').eq('id', idDoador).single();
    assert.ifError(error);
    assert.equal(data.tipo, 'ONG');
  });

  test('usuário não altera o próprio papel', async () => {
    const { error } = await doador.from('usuario').update({ papel: 'ADMINISTRADOR' }).eq('id', idDoador);
    assert.ok(error, 'deveria negar a alteração de papel');
  });
});

describe('Publicação e pesquisa (RF-003, RF-004, RF-005, RN-02, RN-06)', () => {
  test('visitante não publica', async () => {
    const { error } = await visitante.from('anuncio').insert(novoAnuncio('visitante'));
    assert.ok(error);
  });

  test('usuário publica e o anúncio nasce DISPONIVEL em seu nome', async () => {
    const a = await publicarComo(doador, 'publicacao');
    assert.equal(a.status, 'DISPONIVEL');
    assert.equal(a.usuario_id, idDoador);
  });

  test('não é possível publicar já como DOADO', async () => {
    const { error } = await doador.from('anuncio').insert({ ...novoAnuncio('doado'), status: 'DOADO' });
    assert.ok(error);
  });

  test('título curto demais é recusado pelo banco', async () => {
    const { error } = await doador.from('anuncio').insert({ ...novoAnuncio('x'), titulo: 'ab' });
    assert.ok(error);
    assert.equal(error.code, '23514');
  });

  test('visitante encontra o anúncio disponível pela categoria e UF', async () => {
    const a = await publicarComo(doador, 'pesquisa');
    const { data, error } = await visitante.from('anuncio').select('id').eq('status', 'DISPONIVEL').eq('categoria_id', categoriaId).eq('uf', 'SP');
    assert.ifError(error);
    assert.ok(data.some((x) => x.id === a.id));
  });
});

describe('Interesse e interessados (RF-006, RF-007, RN-03, RN-04, RN-07)', () => {
  let anuncioId;
  before(async () => {
    anuncioId = (await publicarComo(doador, 'interesse')).id;
  });

  test('visitante não manifesta interesse', async () => {
    const { error } = await visitante.from('interesse').insert({ anuncio_id: anuncioId, autoriza_email: true });
    assert.ok(error);
  });

  test('dono não manifesta interesse no próprio anúncio (RN-03)', async () => {
    const { error } = await doador.from('interesse').insert({ anuncio_id: anuncioId, autoriza_email: false });
    assert.ok(error);
    assert.equal(error.code, '42501');
  });

  test('interessado registra interesse sem autorizar o e-mail', async () => {
    const { error } = await interessado.from('interesse').insert({ anuncio_id: anuncioId, autoriza_email: false });
    assert.ifError(error);
  });

  test('segundo interesse no mesmo anúncio é recusado (RN-04)', async () => {
    const { error } = await interessado.from('interesse').insert({ anuncio_id: anuncioId, autoriza_email: true });
    assert.ok(error);
    assert.equal(error.code, '23505');
  });

  test('dono vê o interessado, sem e-mail porque não houve autorização (RN-07)', async () => {
    const { data, error } = await doador.rpc('listar_interessados', { p_anuncio_id: anuncioId });
    assert.ifError(error);
    assert.equal(data.length, 1);
    assert.equal(data[0].nome, 'Pessoa Teste Doa Aqui');
    assert.equal(data[0].email, null);
  });

  test('com autorização, o dono vê o e-mail', async () => {
    const outro = (await publicarComo(doador, 'interesse-com-email')).id;
    assert.ifError((await interessado.from('interesse').insert({ anuncio_id: outro, autoriza_email: true })).error);
    const { data, error } = await doador.rpc('listar_interessados', { p_anuncio_id: outro });
    assert.ifError(error);
    assert.equal(data[0].email, env.TESTE_INTERESSADO_EMAIL);
  });

  test('quem não é dono não vê a lista de interessados (RF-007)', async () => {
    const { error } = await interessado.rpc('listar_interessados', { p_anuncio_id: anuncioId });
    assert.ok(error);
    assert.equal(error.code, '42501');
  });
});

describe('Gerenciar e concluir (RF-008, RF-009, RN-05, RN-08)', () => {
  test('outro usuário não edita o anúncio (RN-05)', async () => {
    const { id } = await publicarComo(doador, 'propriedade');
    const { data, error } = await interessado.from('anuncio').update({ titulo: '[TESTE] Invadido' }).eq('id', id).select('id');
    assert.ifError(error);
    assert.equal(data.length, 0, 'nenhuma linha deveria ser alterada');
  });

  test('dono edita o anúncio disponível', async () => {
    const { id } = await publicarComo(doador, 'edicao');
    const { data, error } = await doador.from('anuncio').update({ titulo: '[TESTE] Casaco editado' }).eq('id', id).select('titulo').single();
    assert.ifError(error);
    assert.equal(data.titulo, '[TESTE] Casaco editado');
  });

  test('dono conclui a doação e o anúncio some da pesquisa pública (RN-06)', async () => {
    const { id } = await publicarComo(doador, 'conclusao');
    const { data, error } = await doador.from('anuncio').update({ status: 'DOADO' }).eq('id', id).select('status, concluido_em').single();
    assert.ifError(error);
    assert.equal(data.status, 'DOADO');
    assert.ok(data.concluido_em);
    const publico = await visitante.from('anuncio').select('id').eq('id', id);
    assert.equal(publico.data.length, 0);
  });

  test('anúncio doado não pode ser editado nem reativado', async () => {
    const { id } = await publicarComo(doador, 'pos-doacao');
    assert.ifError((await doador.from('anuncio').update({ status: 'DOADO' }).eq('id', id)).error);
    const editar = await doador.from('anuncio').update({ titulo: '[TESTE] Depois' }).eq('id', id);
    assert.ok(editar.error);
    const reativar = await doador.from('anuncio').update({ status: 'DISPONIVEL' }).eq('id', id);
    assert.ok(reativar.error);
  });

  test('dono desativa o anúncio (inativado pelo proprietário)', async () => {
    const { id } = await publicarComo(doador, 'desativacao');
    const { data, error } = await doador.from('anuncio').update({ status: 'INATIVO' }).eq('id', id).select('status, inativado_por').single();
    assert.ifError(error);
    assert.equal(data.inativado_por, 'PROPRIETARIO');
  });

  test('não há exclusão física de anúncios', async () => {
    const { id } = await publicarComo(doador, 'exclusao');
    await doador.from('anuncio').delete().eq('id', id);
    const { data } = await doador.from('anuncio').select('id').eq('id', id);
    assert.equal(data.length, 1);
  });
});

describe('Administração (RF-010, RF-011)', () => {
  test('usuário comum não executa funções de administrador', async () => {
    const r1 = await doador.rpc('admin_listar_usuarios');
    const r2 = await interessado.rpc('admin_definir_situacao', { p_usuario_id: idDoador, p_situacao: 'BLOQUEADA' });
    assert.equal(r1.error?.code, '42501');
    assert.equal(r2.error?.code, '42501');
  });

  test('administrador vê anúncios em qualquer situação', async () => {
    const { id } = await publicarComo(doador, 'moderacao-visivel');
    assert.ifError((await doador.from('anuncio').update({ status: 'INATIVO' }).eq('id', id)).error);
    const { data, error } = await admin.from('anuncio').select('id, status').eq('id', id);
    assert.ifError(error);
    assert.equal(data[0].status, 'INATIVO');
  });

  test('administrador desativa anúncio de terceiro (moderação)', async () => {
    const { id } = await publicarComo(doador, 'moderacao');
    assert.ifError((await admin.rpc('admin_desativar_anuncio', { p_anuncio_id: id })).error);
    const { data } = await admin.from('anuncio').select('status, inativado_por').eq('id', id).single();
    assert.equal(data.status, 'INATIVO');
    assert.equal(data.inativado_por, 'ADMINISTRADOR');
  });

  test('administrador lista usuários com e-mail e situação', async () => {
    const { data, error } = await admin.rpc('admin_listar_usuarios');
    assert.ifError(error);
    const alvo = data.find((u) => u.id === idInteressado);
    assert.equal(alvo.email, env.TESTE_INTERESSADO_EMAIL);
    assert.equal(alvo.situacao, 'ATIVA');
  });

  test('usuário bloqueado não publica nem manifesta interesse; desbloqueado volta a publicar', async () => {
    const alvoAnuncio = (await publicarComo(doador, 'bloqueio')).id;
    assert.ifError((await admin.rpc('admin_definir_situacao', { p_usuario_id: idInteressado, p_situacao: 'BLOQUEADA' })).error);

    const perfil = await interessado.rpc('meu_perfil');
    assert.equal(perfil.data[0].situacao, 'BLOQUEADA');
    assert.ok((await interessado.from('anuncio').insert(novoAnuncio('bloqueado'))).error, 'bloqueado não publica');
    assert.ok((await interessado.from('interesse').insert({ anuncio_id: alvoAnuncio, autoriza_email: false })).error, 'bloqueado não manifesta interesse');

    assert.ifError((await admin.rpc('admin_definir_situacao', { p_usuario_id: idInteressado, p_situacao: 'ATIVA' })).error);
    const volta = await interessado.from('anuncio').insert(novoAnuncio('desbloqueado')).select('id').single();
    assert.ifError(volta.error);
    criados.push(volta.data.id);
  });

  test('administrador não bloqueia a própria conta', async () => {
    const idAdmin = (await admin.auth.getUser()).data.user.id;
    const { error } = await admin.rpc('admin_definir_situacao', { p_usuario_id: idAdmin, p_situacao: 'BLOQUEADA' });
    assert.ok(error);
  });
});

describe('Telefone de contato do anúncio (funcionalidade adicional, DA-10)', () => {
  let anuncio;
  const ler = async (sb, id = anuncio.id) => {
    const { data, error } = await sb.from('anuncio_contato').select('telefone').eq('anuncio_id', id);
    assert.ifError(error);
    return data[0]?.telefone ?? null;
  };

  before(async () => {
    anuncio = await publicarComo(doador, 'com telefone');
  });

  test('doador informa e troca o telefone do próprio anúncio', async () => {
    const { error } = await doador.from('anuncio_contato').insert({ anuncio_id: anuncio.id, telefone: '11987654321' });
    assert.ifError(error);
    assert.equal(await ler(doador), '11987654321');
    const { data, error: erroTroca } = await doador.from('anuncio_contato').update({ telefone: '1934567890' }).eq('anuncio_id', anuncio.id).select('telefone');
    assert.ifError(erroTroca);
    assert.equal(data[0].telefone, '1934567890');
  });

  test('telefone fora do formato é recusado pelo banco', async () => {
    const outro = await publicarComo(doador, 'telefone inválido');
    const { error } = await doador.from('anuncio_contato').insert({ anuncio_id: outro.id, telefone: '12345' });
    assert.equal(error?.code, '23514');
  });

  test('visitante não tem acesso à tabela de contatos', async () => {
    const { error } = await visitante.from('anuncio_contato').select('telefone').eq('anuncio_id', anuncio.id);
    assert.equal(error?.code, '42501');
  });

  test('quem não manifestou interesse não vê o telefone; depois do interesse, vê', async () => {
    assert.equal(await ler(interessado), null);
    const { error } = await interessado.from('interesse').insert({ anuncio_id: anuncio.id, autoriza_email: false });
    assert.ifError(error);
    assert.equal(await ler(interessado), '1934567890');
  });

  test('administrador vê o telefone', async () => {
    assert.equal(await ler(admin), '1934567890');
  });

  test('outra pessoa não grava, troca nem apaga o telefone de anúncio alheio', async () => {
    const outro = await publicarComo(doador, 'sem telefone');
    const { error } = await interessado.from('anuncio_contato').insert({ anuncio_id: outro.id, telefone: '11912345678' });
    assert.equal(error?.code, '42501');
    const troca = await interessado.from('anuncio_contato').update({ telefone: '11912345678' }).eq('anuncio_id', anuncio.id).select('telefone');
    assert.ifError(troca.error);
    assert.equal(troca.data.length, 0);
    const apaga = await interessado.from('anuncio_contato').delete().eq('anuncio_id', anuncio.id).select('anuncio_id');
    assert.ifError(apaga.error);
    assert.equal(apaga.data.length, 0);
    assert.equal(await ler(doador), '1934567890');
  });

  test('interessado bloqueado deixa de ver o telefone e volta a ver ao ser desbloqueado', async () => {
    const bloqueio = await admin.rpc('admin_definir_situacao', { p_usuario_id: idInteressado, p_situacao: 'BLOQUEADA' });
    assert.ifError(bloqueio.error);
    assert.equal(await ler(interessado), null);
    const desbloqueio = await admin.rpc('admin_definir_situacao', { p_usuario_id: idInteressado, p_situacao: 'ATIVA' });
    assert.ifError(desbloqueio.error);
    assert.equal(await ler(interessado), '1934567890');
  });

  test('anúncio desativado esconde o telefone dos interessados, mas não do doador', async () => {
    const { error } = await admin.rpc('admin_desativar_anuncio', { p_anuncio_id: anuncio.id });
    assert.ifError(error);
    assert.equal(await ler(interessado), null);
    assert.equal(await ler(doador), '1934567890');
  });

  test('doador remove o telefone', async () => {
    const { data, error } = await doador.from('anuncio_contato').delete().eq('anuncio_id', anuncio.id).select('anuncio_id');
    assert.ifError(error);
    assert.equal(data.length, 1);
    assert.equal(await ler(doador), null);
  });
});
