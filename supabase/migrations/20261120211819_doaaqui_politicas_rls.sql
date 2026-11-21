-- Doa Aqui · Autorização: permissões por coluna e políticas Row Level Security (RLS)
-- O app usa a chave pública (publishable) do Supabase; o que cada pessoa pode ler ou
-- alterar é decidido aqui, no banco (RNF-003).
--   anon           = visitante (sem login)
--   authenticated  = usuário logado (pessoa física, ONG ou administrador)

alter table public.usuario   enable row level security;
alter table public.categoria enable row level security;
alter table public.anuncio   enable row level security;
alter table public.interesse enable row level security;

-- ---------------------------------------------------------------
-- Permissões por coluna (o Supabase concede tudo por padrão; restringimos)
-- ---------------------------------------------------------------
revoke all on public.usuario, public.categoria, public.anuncio, public.interesse from anon, authenticated;

-- usuario: só nome e tipo são públicos (responsável pelo anúncio, RF-005).
-- Papel e situação são lidos pelas funções meu_perfil() e admin_listar_usuarios().
grant select (id, nome, tipo, criado_em) on public.usuario to anon, authenticated;

grant select on public.categoria to anon, authenticated;

grant select on public.anuncio to anon, authenticated;
grant insert (categoria_id, titulo, descricao, cidade, uf) on public.anuncio to authenticated;
grant update (categoria_id, titulo, descricao, cidade, uf, status) on public.anuncio to authenticated;

grant select on public.interesse to authenticated;
grant insert (anuncio_id, autoriza_email) on public.interesse to authenticated;

-- ---------------------------------------------------------------
-- usuario
-- ---------------------------------------------------------------
create policy "perfil público visível a todos"
  on public.usuario for select
  to anon, authenticated
  using (true);

-- ---------------------------------------------------------------
-- categoria
-- ---------------------------------------------------------------
create policy "categorias visíveis a todos"
  on public.categoria for select
  to anon, authenticated
  using (true);

-- ---------------------------------------------------------------
-- anuncio
-- ---------------------------------------------------------------
-- RN-06: o público vê só DISPONIVEL; o proprietário vê os seus; o administrador vê todos (RF-010).
create policy "anúncios visíveis conforme situação e papel"
  on public.anuncio for select
  to anon, authenticated
  using (
    status = 'DISPONIVEL'
    or usuario_id = (select auth.uid())
    or (select doaaqui_privado.e_admin())
  );

-- RN-02 e RF-003: só usuário logado e ativo publica, sempre em seu nome e como DISPONIVEL.
create policy "usuário ativo publica em seu nome"
  on public.anuncio for insert
  to authenticated
  with check (
    usuario_id = (select auth.uid())
    and status = 'DISPONIVEL'
    and (select doaaqui_privado.conta_ativa())
  );

-- RN-05: só o proprietário ativo altera o próprio anúncio.
-- As transições permitidas são validadas pelo gatilho doaaqui_privado.validar_anuncio().
create policy "proprietário ativo altera o próprio anúncio"
  on public.anuncio for update
  to authenticated
  using (usuario_id = (select auth.uid()) and (select doaaqui_privado.conta_ativa()))
  with check (usuario_id = (select auth.uid()));

-- Não há política de DELETE: anúncios não são apagados, são desativados.

-- ---------------------------------------------------------------
-- interesse
-- ---------------------------------------------------------------
-- O interessado vê os próprios; o dono do anúncio vê os do seu anúncio; o administrador vê todos.
create policy "interesses visíveis ao interessado, ao anunciante e ao administrador"
  on public.interesse for select
  to authenticated
  using (
    usuario_id = (select auth.uid())
    or exists (
      select 1 from public.anuncio a
      where a.id = interesse.anuncio_id and a.usuario_id = (select auth.uid())
    )
    or (select doaaqui_privado.e_admin())
  );

-- RN-02, RN-03: usuário ativo, em seu nome, em anúncio disponível de outra pessoa.
-- RN-04 é garantida pela restrição UNIQUE (anuncio_id, usuario_id).
create policy "usuário ativo manifesta interesse em anúncio disponível de terceiro"
  on public.interesse for insert
  to authenticated
  with check (
    usuario_id = (select auth.uid())
    and (select doaaqui_privado.conta_ativa())
    and doaaqui_privado.anuncio_aceita_interesse(anuncio_id)
  );
