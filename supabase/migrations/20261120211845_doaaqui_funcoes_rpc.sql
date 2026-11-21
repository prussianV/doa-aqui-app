-- Doa Aqui · Funções chamadas pelo app (RPC do Supabase)
-- São SECURITY DEFINER porque leem dados protegidos (e-mail em auth.users, papel e situação),
-- mas cada uma verifica quem está chamando antes de devolver ou alterar qualquer coisa.

-- ---------------------------------------------------------------
-- RF-001 / UC-01: cria o perfil do Doa Aqui para a conta logada (uma vez só).
-- Chamada pelo app logo após o cadastro ou no primeiro login. Nome e tipo vêm
-- dos parâmetros ou, se vazios, dos metadados gravados pelo Supabase Auth no cadastro.
-- ---------------------------------------------------------------
create or replace function public.criar_meu_perfil(p_nome text default null, p_tipo text default null)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := (select auth.uid());
  v_meta jsonb;
  v_nome text;
  v_tipo text;
begin
  if v_uid is null then
    raise exception 'É preciso estar logado.' using errcode = '42501';
  end if;
  if exists (select 1 from public.usuario where id = v_uid) then
    return;
  end if;

  select raw_user_meta_data into v_meta from auth.users where id = v_uid;
  v_nome := btrim(coalesce(nullif(btrim(p_nome), ''), v_meta ->> 'nome', ''));
  v_tipo := coalesce(nullif(p_tipo, ''), v_meta ->> 'tipo', 'PESSOA_FISICA');
  if char_length(v_nome) < 2 then
    v_nome := 'Usuário';
  end if;

  insert into public.usuario (id, nome, tipo)
  values (v_uid, left(v_nome, 100), case when v_tipo = 'ONG' then 'ONG' else 'PESSOA_FISICA' end)
  on conflict (id) do nothing;
end;
$$;

-- ---------------------------------------------------------------
-- Perfil do usuário logado (usado no login para checar bloqueio e papel)
-- ---------------------------------------------------------------
create or replace function public.meu_perfil()
returns table (id uuid, nome text, email text, tipo text, papel text, situacao text, criado_em timestamptz)
language sql
stable
security definer
set search_path = ''
as $$
  select u.id, u.nome, au.email::text, u.tipo, u.papel, u.situacao, u.criado_em
  from public.usuario u
  join auth.users au on au.id = u.id
  where u.id = (select auth.uid());
$$;

-- ---------------------------------------------------------------
-- RF-007 / UC-09: interessados em um anúncio, só para o proprietário.
-- O e-mail aparece apenas quando o interessado autorizou (RN-07).
-- ---------------------------------------------------------------
create or replace function public.listar_interessados(p_anuncio_id bigint)
returns table (interesse_id bigint, nome text, tipo text, email text, autoriza_email boolean, criado_em timestamptz)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if not exists (
    select 1 from public.anuncio a
    where a.id = p_anuncio_id and a.usuario_id = (select auth.uid())
  ) or not doaaqui_privado.conta_ativa() then
    raise exception 'Só o proprietário do anúncio pode ver os interessados.' using errcode = '42501';
  end if;

  return query
    select i.id, u.nome, u.tipo,
           case when i.autoriza_email then au.email::text end,
           i.autoriza_email, i.criado_em
    from public.interesse i
    join public.usuario u on u.id = i.usuario_id
    join auth.users au on au.id = i.usuario_id
    where i.anuncio_id = p_anuncio_id
    order by i.criado_em;
end;
$$;

-- ---------------------------------------------------------------
-- RF-011 / UC-12: lista de usuários para o administrador
-- ---------------------------------------------------------------
create or replace function public.admin_listar_usuarios()
returns table (id uuid, nome text, email text, tipo text, papel text, situacao text, criado_em timestamptz, total_anuncios bigint)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if not doaaqui_privado.e_admin() then
    raise exception 'Acesso restrito ao administrador.' using errcode = '42501';
  end if;

  return query
    select u.id, u.nome, au.email::text, u.tipo, u.papel, u.situacao, u.criado_em,
           (select count(*) from public.anuncio a where a.usuario_id = u.id)
    from public.usuario u
    join auth.users au on au.id = u.id
    order by u.criado_em desc;
end;
$$;

-- ---------------------------------------------------------------
-- RF-011 / UC-12: bloquear ou desbloquear um usuário
-- ---------------------------------------------------------------
create or replace function public.admin_definir_situacao(p_usuario_id uuid, p_situacao text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not doaaqui_privado.e_admin() then
    raise exception 'Acesso restrito ao administrador.' using errcode = '42501';
  end if;
  if p_situacao not in ('ATIVA', 'BLOQUEADA') then
    raise exception 'Situação inválida: %.', p_situacao using errcode = '22023';
  end if;
  if p_usuario_id = (select auth.uid()) then
    raise exception 'Você não pode alterar a situação da sua própria conta.' using errcode = 'P0001';
  end if;

  update public.usuario set situacao = p_situacao where id = p_usuario_id;
  if not found then
    raise exception 'Usuário não encontrado.' using errcode = 'P0002';
  end if;
end;
$$;

-- ---------------------------------------------------------------
-- RF-010 / UC-11: desativar anúncio que viola as regras
-- ---------------------------------------------------------------
create or replace function public.admin_desativar_anuncio(p_anuncio_id bigint)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not doaaqui_privado.e_admin() then
    raise exception 'Acesso restrito ao administrador.' using errcode = '42501';
  end if;

  update public.anuncio set status = 'INATIVO'
  where id = p_anuncio_id and status <> 'INATIVO';
  if not found then
    raise exception 'Anúncio não encontrado ou já inativo.' using errcode = 'P0002';
  end if;
end;
$$;

-- Ninguém executa por padrão; só usuários logados (cada função confere o papel).
revoke all on function public.criar_meu_perfil(text, text) from public, anon;
revoke all on function public.meu_perfil() from public, anon;
revoke all on function public.listar_interessados(bigint) from public, anon;
revoke all on function public.admin_listar_usuarios() from public, anon;
revoke all on function public.admin_definir_situacao(uuid, text) from public, anon;
revoke all on function public.admin_desativar_anuncio(bigint) from public, anon;

grant execute on function public.criar_meu_perfil(text, text) to authenticated;
grant execute on function public.meu_perfil() to authenticated;
grant execute on function public.listar_interessados(bigint) to authenticated;
grant execute on function public.admin_listar_usuarios() to authenticated;
grant execute on function public.admin_definir_situacao(uuid, text) to authenticated;
grant execute on function public.admin_desativar_anuncio(bigint) to authenticated;
