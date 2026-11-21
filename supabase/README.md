# Doa Aqui — banco de dados (Supabase / PostgreSQL)

## Migrações

Aplicar na ordem, no SQL Editor do Supabase ou com o Supabase CLI. Os nomes e as versões são os mesmos registrados em `supabase_migrations.schema_migrations` no projeto atual:

1. `migrations/20261120211727_doaaqui_esquema_inicial.sql` — tabelas `usuario`, `categoria`, `anuncio`, `interesse` e as 5 categorias
2. `migrations/20261120211757_doaaqui_funcoes_e_gatilhos.sql` — esquema `doaaqui_privado`, funções auxiliares e gatilho de status do anúncio
3. `migrations/20261120211819_doaaqui_politicas_rls.sql` — permissões por coluna e políticas RLS
4. `migrations/20261120211845_doaaqui_funcoes_rpc.sql` — funções chamadas pelo app (perfil, interessados, administração)
5. `migrations/20261121020904_doaaqui_contato_anuncio.sql` — tabela `anuncio_contato` (telefone opcional do anúncio, visível ao doador, aos interessados e ao administrador)

As migrações não criam gatilhos em `auth.users`, porque o projeto atual é compartilhado com outra
aplicação. O perfil do Doa Aqui é criado pela função `criar_meu_perfil()` no primeiro acesso.

## Administrador

O papel é atribuído direto no banco, depois que a pessoa entrar uma vez no app:

```sql
update public.usuario set papel = 'ADMINISTRADOR'
where id = (select id from auth.users where email = 'email-do-admin@exemplo.com');
```

## Contas de teste

Criadas em 20/11/2026 no projeto Supabase atual (achado-tecnico), já com e-mail confirmado, para os
testes automáticos e para demonstrar o aplicativo (emulador ou celular Android). Os e-mails usam o
domínio doaaqui.com.br, que hoje não tem servidor de e-mail: mensagens enviadas a eles (confirmação ou
redefinição de senha) não chegam a ninguém. Para testar a redefinição de senha de verdade, use uma conta
com um e-mail que a equipe consiga abrir.

| Papel no Doa Aqui | Tipo de conta | E-mail (login) | Senha |
| --- | --- | --- | --- |
| Administrador | Pessoa física | `bianca@doaaqui.com.br` | `ThvkSP2gwB5F99!` |
| Usuário (doador) | ONG | `vitor@doaaqui.com.br` | `TIdUk__pkr1le9!` |
| Usuário (interessado) | Pessoa física | `alfred@doaaqui.com.br` | `Thd1kO8tw8NtV9!` |

Cuidados:

- O repositório é privado. Se ele for tornado público, troque as senhas ou exclua essas contas antes,
  porque a conta de administrador consegue desativar anúncios e bloquear usuários.
- Não troque a senha dessas contas pelo app: os testes automáticos (`supabase/testes/.env`) dependem delas.
  Se trocar, atualize esta tabela e o arquivo `.env` dos testes.
- Para remover tudo antes da entrega final, veja a pendência P-09 do Documento de Arquitetura.

## Testes de autorização

`testes/autorizacao.test.mjs` verifica as regras no banco real (38 casos: RLS, gatilho, funções e telefone de contato).

Para recriar as contas em outro projeto:

1. Crie três usuários em **Authentication → Users → Add user**, marcando **Auto Confirm User**.
2. Grave as credenciais em `supabase/testes/.env` (não versionado):
   ```
   TESTE_ADMIN_EMAIL=...
   TESTE_ADMIN_SENHA=...
   TESTE_DOADOR_EMAIL=...
   TESTE_DOADOR_SENHA=...
   TESTE_INTERESSADO_EMAIL=...
   TESTE_INTERESSADO_SENHA=...
   ```
3. Faça o login de cada um ao menos uma vez (o próprio teste chama `criar_meu_perfil()`), promova o
   administrador com o SQL acima e rode, na raiz do repositório:
   ```bash
   node --test supabase/testes/
   ```

Os testes usam a URL e a chave pública de `app/src/config.ts` e o `@supabase/supabase-js` instalado em `app/` (rode `npm install` em `app/` antes).
