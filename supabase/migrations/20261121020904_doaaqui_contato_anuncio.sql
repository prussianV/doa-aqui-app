-- Doa Aqui · Telefone de contato do anúncio (funcionalidade adicional pedida pela equipe, DA-10)
-- O doador pode informar, em cada anúncio, um telefone ou WhatsApp para contato (opcional).
-- O número fica numa tabela separada para que o RLS decida quem o vê: o próprio doador, quem
-- manifestou interesse no anúncio (conta ativa e anúncio não inativado) e o administrador.
-- Visitantes não têm nenhuma permissão nesta tabela.

create table public.anuncio_contato (
  anuncio_id bigint primary key references public.anuncio (id) on delete cascade,
  telefone   text not null
    constraint anuncio_contato_telefone_formato
    check (telefone ~ '^[1-9]{2}(9[0-9]{8}|[2-5][0-9]{7})$')
);

comment on table public.anuncio_contato is
  'Telefone ou WhatsApp opcional do doador para um anúncio. Visível ao doador, aos interessados e ao administrador.';
comment on column public.anuncio_contato.telefone is
  'Somente dígitos: DDD + número (10 dígitos para fixo, 11 para celular), sem o código do país.';

-- O usuário logado é o dono do anúncio?
create or replace function doaaqui_privado.e_dono_do_anuncio(p_anuncio_id bigint)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.anuncio a
    where a.id = p_anuncio_id
      and a.usuario_id = (select auth.uid())
  );
$$;

-- O usuário logado pode ver o telefone de contato do anúncio?
create or replace function doaaqui_privado.pode_ver_contato(p_anuncio_id bigint)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select (select doaaqui_privado.e_admin())
    or doaaqui_privado.e_dono_do_anuncio(p_anuncio_id)
    or (
      (select doaaqui_privado.conta_ativa())
      and exists (
        select 1
        from public.interesse i
        join public.anuncio a on a.id = i.anuncio_id
        where i.anuncio_id = p_anuncio_id
          and i.usuario_id = (select auth.uid())
          and a.status <> 'INATIVO'
      )
    );
$$;

revoke all on function doaaqui_privado.e_dono_do_anuncio(bigint) from public;
revoke all on function doaaqui_privado.pode_ver_contato(bigint) from public;
grant execute on function doaaqui_privado.e_dono_do_anuncio(bigint) to authenticated;
grant execute on function doaaqui_privado.pode_ver_contato(bigint) to authenticated;

-- Permissões por coluna
revoke all on public.anuncio_contato from anon, authenticated;
grant select on public.anuncio_contato to authenticated;
grant insert (anuncio_id, telefone) on public.anuncio_contato to authenticated;
grant update (telefone) on public.anuncio_contato to authenticated;
grant delete on public.anuncio_contato to authenticated;

alter table public.anuncio_contato enable row level security;

create policy "contato visível ao doador, aos interessados e ao administrador"
  on public.anuncio_contato for select
  to authenticated
  using (doaaqui_privado.pode_ver_contato(anuncio_id));

create policy "doador ativo informa o contato do próprio anúncio"
  on public.anuncio_contato for insert
  to authenticated
  with check (doaaqui_privado.e_dono_do_anuncio(anuncio_id) and (select doaaqui_privado.conta_ativa()));

create policy "doador ativo altera o contato do próprio anúncio"
  on public.anuncio_contato for update
  to authenticated
  using (doaaqui_privado.e_dono_do_anuncio(anuncio_id) and (select doaaqui_privado.conta_ativa()))
  with check (doaaqui_privado.e_dono_do_anuncio(anuncio_id));

create policy "doador ativo remove o contato do próprio anúncio"
  on public.anuncio_contato for delete
  to authenticated
  using (doaaqui_privado.e_dono_do_anuncio(anuncio_id) and (select doaaqui_privado.conta_ativa()));
