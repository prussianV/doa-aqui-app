-- Doa Aqui · Funções auxiliares e gatilho do ciclo de vida do anúncio
-- O esquema doaaqui_privado não é exposto pela API do Supabase: as funções daqui só são
-- chamadas pelas políticas RLS e pelo gatilho.
-- O projeto Supabase é compartilhado com outra aplicação; por isso o Doa Aqui não cria
-- gatilhos em auth.users: o perfil é criado pela função criar_meu_perfil() (ver funções RPC).

create schema if not exists doaaqui_privado;
revoke all on schema doaaqui_privado from public;
grant usage on schema doaaqui_privado to anon, authenticated;

-- Usuário logado é administrador com conta ativa?
create or replace function doaaqui_privado.e_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.usuario u
    where u.id = (select auth.uid())
      and u.papel = 'ADMINISTRADOR'
      and u.situacao = 'ATIVA'
  );
$$;

-- Usuário logado tem conta ativa (não bloqueada)?  RF-011
create or replace function doaaqui_privado.conta_ativa()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.usuario u
    where u.id = (select auth.uid())
      and u.situacao = 'ATIVA'
  );
$$;

-- O anúncio aceita interesse do usuário logado?  RN-03
-- Precisa estar DISPONIVEL e pertencer a outra pessoa.
create or replace function doaaqui_privado.anuncio_aceita_interesse(p_anuncio_id bigint)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.anuncio a
    where a.id = p_anuncio_id
      and a.status = 'DISPONIVEL'
      and a.usuario_id <> (select auth.uid())
  );
$$;

revoke all on all functions in schema doaaqui_privado from public;
grant execute on function doaaqui_privado.e_admin() to anon, authenticated;
grant execute on function doaaqui_privado.conta_ativa() to anon, authenticated;
grant execute on function doaaqui_privado.anuncio_aceita_interesse(bigint) to authenticated;

-- ---------------------------------------------------------------
-- Gatilho: ciclo de vida do anúncio (RN-06, RF-008, RF-009, RF-010)
--   DISPONIVEL -> DISPONIVEL  edição pelo proprietário
--   DISPONIVEL -> DOADO       conclusão pelo proprietário (RF-009)
--   DISPONIVEL -> INATIVO     desativação pelo proprietário (RF-008) ou administrador (RF-010)
--   DOADO      -> INATIVO     desativação pelo administrador (RF-010)
-- Qualquer outra transição é recusada. Não há reativação no MVP.
-- DISPONIVEL -> DISPONIVEL não muda a situação (edição dos dados); fora da situação
-- DISPONIVEL os dados do item (título, descrição, categoria, cidade e UF) não mudam.
-- ---------------------------------------------------------------
create or replace function doaaqui_privado.validar_anuncio()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  v_uid uuid := (select auth.uid());
  v_admin boolean := doaaqui_privado.e_admin();
begin
  if new.usuario_id <> old.usuario_id or new.criado_em <> old.criado_em then
    raise exception 'O proprietário e a data de criação do anúncio não podem ser alterados.'
      using errcode = '42501';
  end if;

  if old.status = 'DISPONIVEL' and new.status = 'DISPONIVEL' then
    null;
  elsif old.status = 'DISPONIVEL' and new.status = 'DOADO' then
    if v_uid is distinct from old.usuario_id then
      raise exception 'Só o proprietário pode concluir a doação.' using errcode = '42501';
    end if;
    new.concluido_em := now();
  elsif new.status = 'INATIVO' and old.status in ('DISPONIVEL', 'DOADO') then
    if v_uid is not distinct from old.usuario_id and old.status = 'DISPONIVEL' then
      new.inativado_por := 'PROPRIETARIO';
    elsif v_admin then
      new.inativado_por := 'ADMINISTRADOR';
    else
      raise exception 'Você não pode desativar este anúncio.' using errcode = '42501';
    end if;
  else
    raise exception 'Mudança de situação não permitida: % para %.', old.status, new.status
      using errcode = 'P0001';
  end if;

  if old.status <> 'DISPONIVEL' and (
       new.titulo <> old.titulo or new.descricao <> old.descricao or new.categoria_id <> old.categoria_id
       or new.cidade <> old.cidade or new.uf <> old.uf) then
    raise exception 'Só anúncios disponíveis podem ser editados.' using errcode = 'P0001';
  end if;

  new.atualizado_em := now();
  return new;
end;
$$;

create trigger antes_de_atualizar_anuncio
  before update on public.anuncio
  for each row execute function doaaqui_privado.validar_anuncio();
