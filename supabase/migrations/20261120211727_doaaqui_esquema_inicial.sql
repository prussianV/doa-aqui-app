-- Doa Aqui · Esquema inicial (PostgreSQL / Supabase)
-- Tabelas do MVP: usuario, categoria, anuncio e interesse.
-- A conta (e-mail e senha) fica em auth.users, gerenciada pelo Supabase Auth.
-- O perfil em public.usuario é criado pela função criar_meu_perfil() no primeiro acesso ao app.
-- Exclusão de conta (feita só pelo painel do Supabase) remove em cascata o perfil, os anúncios e os interesses,
-- para nunca bloquear a administração do projeto Supabase, que é compartilhado com outra aplicação.
-- Coleta mínima (RNF-007): não há CPF, CNPJ, telefone, endereço, documentos nem imagens.

-- ---------------------------------------------------------------
-- usuario: perfil público da conta (1:1 com auth.users)
-- ---------------------------------------------------------------
create table public.usuario (
  id         uuid primary key references auth.users (id) on delete cascade,
  nome       text not null check (char_length(btrim(nome)) between 2 and 100),
  tipo       text not null default 'PESSOA_FISICA' check (tipo in ('PESSOA_FISICA', 'ONG')),
  papel      text not null default 'USUARIO' check (papel in ('USUARIO', 'ADMINISTRADOR')),
  situacao   text not null default 'ATIVA' check (situacao in ('ATIVA', 'BLOQUEADA')),
  criado_em  timestamptz not null default now()
);

comment on table public.usuario is 'Doa Aqui: perfil da conta. O e-mail e a senha ficam em auth.users (Supabase Auth).';
comment on column public.usuario.tipo is 'Pessoa física ou ONG/instituição, autodeclarado no cadastro.';
comment on column public.usuario.papel is 'USUARIO ou ADMINISTRADOR. Só é alterado diretamente no banco.';
comment on column public.usuario.situacao is 'ATIVA ou BLOQUEADA (RF-011). Conta bloqueada não executa operações autenticadas.';

-- ---------------------------------------------------------------
-- categoria: classificação dos itens
-- ---------------------------------------------------------------
create table public.categoria (
  id    smallint generated always as identity primary key,
  nome  text not null unique,
  slug  text not null unique check (slug ~ '^[a-z]+$')
);

comment on table public.categoria is 'Doa Aqui: categorias usadas na publicação e no filtro de pesquisa.';

insert into public.categoria (nome, slug) values
  ('Roupas', 'roupa'),
  ('Livros', 'livro'),
  ('Móveis', 'movel'),
  ('Ração', 'racao'),
  ('Brinquedos', 'brinquedo');

-- ---------------------------------------------------------------
-- anuncio: item oferecido para doação
-- ---------------------------------------------------------------
create table public.anuncio (
  id             bigint generated always as identity primary key,
  usuario_id     uuid not null default auth.uid() references public.usuario (id) on delete cascade,
  categoria_id   smallint not null references public.categoria (id) on delete restrict,
  titulo         text not null check (char_length(btrim(titulo)) between 3 and 60),
  descricao      text not null check (char_length(btrim(descricao)) between 10 and 500),
  cidade         text not null check (char_length(btrim(cidade)) between 2 and 80),
  uf             char(2) not null check (uf in (
                   'AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA',
                   'PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO')),
  status         text not null default 'DISPONIVEL' check (status in ('DISPONIVEL', 'DOADO', 'INATIVO')),
  inativado_por  text check (inativado_por in ('PROPRIETARIO', 'ADMINISTRADOR')),
  criado_em      timestamptz not null default now(),
  atualizado_em  timestamptz not null default now(),
  concluido_em   timestamptz,
  constraint anuncio_inativo_tem_responsavel check ((status = 'INATIVO') = (inativado_por is not null)),
  constraint anuncio_doado_tem_data check (status <> 'DOADO' or concluido_em is not null)
);

comment on table public.anuncio is 'Doa Aqui: item oferecido para doação (RF-003). Não há exclusão física pelo app: o anúncio é desativado.';
comment on column public.anuncio.status is 'DISPONIVEL, DOADO ou INATIVO (RN-06). Só DISPONIVEL aparece na pesquisa pública.';
comment on column public.anuncio.inativado_por is 'Quem desativou: o proprietário (RF-008) ou o administrador (RF-010).';

create index anuncio_pesquisa_idx on public.anuncio (status, categoria_id, uf);
create index anuncio_usuario_idx on public.anuncio (usuario_id);

-- ---------------------------------------------------------------
-- interesse: manifestação de interesse de um usuário em um anúncio
-- ---------------------------------------------------------------
create table public.interesse (
  id              bigint generated always as identity primary key,
  anuncio_id      bigint not null references public.anuncio (id) on delete cascade,
  usuario_id      uuid not null default auth.uid() references public.usuario (id) on delete cascade,
  autoriza_email  boolean not null default false,
  criado_em       timestamptz not null default now(),
  constraint interesse_unico_por_usuario unique (anuncio_id, usuario_id)
);

comment on table public.interesse is 'Doa Aqui: interesse em um anúncio (RF-006). Um por usuário e anúncio (RN-04).';
comment on column public.interesse.autoriza_email is 'Autorização explícita para mostrar o e-mail ao anunciante (RN-07).';

create index interesse_usuario_idx on public.interesse (usuario_id);
