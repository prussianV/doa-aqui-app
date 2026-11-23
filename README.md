# Doa Aqui

Aplicativo de doação de itens entre pessoas físicas, ONGs e instituições beneficentes.
Projeto acadêmico (Fatec) das disciplinas de Laboratório de Software e Desenvolvimento Mobile.

O Doa Aqui é um **aplicativo nativo em React Native** (Android, com iOS preparado no mesmo código) e usa o
**Supabase** como backend: autenticação, API de dados e banco PostgreSQL com regras de acesso (RLS).

## Estrutura do repositório

| Pasta | Conteúdo |
| --- | --- |
| `app/` | Aplicativo React Native (CLI), com os projetos nativos `android/` e `ios/` |
| `supabase/` | Migrações do banco PostgreSQL, políticas RLS, testes de autorização e contas de teste |
| `docs/` | Documento de Arquitetura de Software (DA 3.2), diagramas e documentos de referência |
| `design/` | Guia de identidade visual e telas de referência |

## Começar

```bash
cd app
npm install
npm run apresentar
```

Isso abre o emulador Android, instala o app e o abre. Requisitos, comandos de desenvolvimento e o mapa das
telas estão em [`app/README.md`](app/README.md). As contas de teste (administradora, doador e interessado)
estão em [`supabase/README.md`](supabase/README.md).

## Testes

```bash
cd app && npm test && npm run typecheck && npm run lint   # regras do app, tipos e lint
cd .. && node --test supabase/testes/                      # autorização no banco real
```

## Documentação

O Documento de Arquitetura de Software está em `docs/arquitetura/` (DOCX e PDF), com a matriz de
rastreabilidade, o relatório de auditoria, as pendências e os diagramas editáveis (`.mmd`). Para gerar de
novo depois de mudar `docs/arquitetura/ferramentas/conteudo.mjs`:

```bash
cd docs/arquitetura/ferramentas
npm install
node gerar-documento.mjs
python3 atualizar-e-exportar.py ../DA_DocumentoArquiteturaSoftware_v3.2.docx
```
