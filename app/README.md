# Doa Aqui · aplicativo React Native

Aplicativo nativo do Doa Aqui, criado com o **React Native CLI** (sem Expo). Roda no Android (celular ou
emulador) e está preparado para iOS com o mesmo código. Os dados ficam no **Supabase** (PostgreSQL com RLS);
veja `../supabase/README.md`.

## O que precisa estar instalado

| Ferramenta | Versão | Onde fica neste computador |
| --- | --- | --- |
| Node.js | 22 ou superior | `node -v` |
| JDK | 17 | `~/.local/share/jdk-17` |
| Android SDK | plataforma 37, build-tools 37.0.0, NDK 27.1.12297006, CMake 3.22.1 | `~/Android/Sdk` |
| Emulador | imagem Android 15 (API 35) x86_64 | AVD `DoaAqui_Pixel` |

Os scripts do projeto (`scripts/ambiente.sh`) apontam `JAVA_HOME` e `ANDROID_HOME` para essas pastas só
enquanto rodam; o terminal não é alterado. Em outro computador, siga
[o guia oficial de ambiente](https://reactnative.dev/docs/set-up-your-environment) e crie
`android/local.properties` com `sdk.dir=<pasta do Android SDK>`.

## Apresentar o app no computador

```bash
npm install
npm run apresentar
```

O script abre o emulador, gera o APK de release na primeira vez, instala e abre o Doa Aqui. O APK de release
leva o JavaScript dentro, então não precisa do Metro e funciona igual num celular Android
(`android/app/build/outputs/apk/release/app-release.apk`).

## Desenvolver

```bash
npm run emulador   # abre o emulador (ou conecte um celular com depuração USB)
npm start          # Metro: envia o JavaScript ao app de depuração
npm run android    # em outro terminal: compila, instala e abre o app de depuração
```

Com o Metro rodando, as mudanças no código aparecem na hora (Fast Refresh). No emulador, `R` duas vezes
recarrega e `Ctrl+M` abre o menu de desenvolvimento.

| Comando | O que faz |
| --- | --- |
| `npm run typecheck` | Verificação de tipos (TypeScript) |
| `npm run lint` | Análise estática (ESLint do React Native) |
| `npm test` | Testes de unidade das regras (Jest, `__tests__/`) |
| `npm run apk` | Gera o APK de release para o emulador (x86_64) |
| `npm run apk:celular` | Gera o APK de release para celulares Android (arm64-v8a) |

O primeiro build nativo é demorado: o Gradle baixa dependências e compila o código C++ das bibliotecas.
**Feche o emulador antes de compilar.** Neste computador (Core i3, 8 GB de RAM), compilar o APK com o
emulador aberto esgotou a memória e reiniciou a máquina; por isso cada APK é gerado para uma arquitetura.

## Telas e casos de uso

| Caso de uso | Tela | Serviço |
| --- | --- | --- |
| UC-01 Cadastrar conta | `src/telas/Cadastro.tsx` | `servicos/autenticacao.ts` |
| UC-02 Realizar login | `src/telas/Entrar.tsx` | `servicos/autenticacao.ts` |
| UC-03 Realizar logout | `src/telas/Conta.tsx` | `servicos/autenticacao.ts` |
| UC-04 Pesquisar anúncios | `src/telas/Inicio.tsx`, `src/telas/Busca.tsx` | `servicos/anuncios.ts` |
| UC-05 Consultar anúncio | `src/telas/DetalheAnuncio.tsx` | `servicos/anuncios.ts` |
| UC-06 Manifestar interesse | `src/telas/DetalheAnuncio.tsx` (`FolhaInteresse`) | `servicos/interesses.ts` |
| UC-07 Publicar anúncio | `src/telas/anunciar/` (`Detalhes`, `Local`, `Publicado`) | `servicos/anuncios.ts` |
| UC-08 Gerenciar anúncio | `src/telas/MeusItens.tsx` (`FolhaGerenciar`), `Anunciar { editar }` | `servicos/anuncios.ts` |
| UC-09 Ver interessados | `src/telas/Interessados.tsx` | `servicos/interesses.ts` |
| UC-10 Concluir doação | `src/telas/MeusItens.tsx`, detalhe do anúncio | `servicos/anuncios.ts` |
| UC-11 Moderar anúncios | `src/telas/Admin.tsx` | `servicos/administracao.ts` |
| UC-12 Gerenciar usuários | `src/telas/Admin.tsx` | `servicos/administracao.ts` |
| Adicional: trocar senha | `src/telas/Conta.tsx` (Trocar senha) | `servicos/autenticacao.ts` |
| Adicional: esqueci minha senha | `src/telas/RecuperarSenha.tsx`, `src/telas/NovaSenha.tsx` | `servicos/autenticacao.ts` |
| Adicional: telefone de contato | `src/telas/anunciar/Local.tsx`, `src/telas/DetalheAnuncio.tsx` | `servicos/anuncios.ts` |

A aba **Admin** só aparece para contas com papel `ADMINISTRADOR` (atribuído no banco). O telefone de contato
é opcional e só aparece para quem demonstrou interesse no anúncio.

## Links que abrem o app

| Link | Abre |
| --- | --- |
| `doaaqui://nova-senha#...` | Tela Nova senha (link do e-mail de redefinição de senha) |
| `doaaqui://anuncio/ID` | Detalhe do anúncio |

Para o link de redefinição funcionar, `doaaqui://nova-senha` precisa estar nas Redirect URLs do Supabase Auth
(pendência P-13 do Documento de Arquitetura). Teste no emulador:
`adb shell am start -a android.intent.action.VIEW -d "doaaqui://anuncio/1"`.

## Organização do código

```
src/
├─ App.tsx       Raiz: área segura, sessão, tela de abertura e navegação
├─ navegacao/    Pilha principal, abas, fluxo de anúncio e links doaaqui://
├─ telas/        Uma tela por arquivo
├─ componentes/  Peças visuais reutilizáveis
├─ tema/         Cores, fontes e espaçamentos do guia de marca
├─ estado/       Sessão e perfil (SessaoContexto), formulário de anúncio, hook useConsulta
├─ servicos/     Chamadas ao Supabase por caso de uso e tradução de erros
├─ negocio/      Tipos, validações de conveniência e catálogos
├─ lib/          Cliente do Supabase e preferências locais
├─ config.ts     Endereço do Supabase, chave pública e link de nova senha
└─ assets/       Fontes (.ttf) e imagens de origem do ícone
android/         Projeto Android (Gradle): manifesto, ícone adaptativo, tela de abertura, fontes
ios/             Projeto iOS (Xcode): exige macOS para compilar
```

As telas nunca falam direto com o banco: usam os serviços. As regras que importam (quem pode ver e alterar
cada registro) são garantidas pelo PostgreSQL, com políticas RLS. A chave em `src/config.ts` é a chave
**pública** do Supabase; nunca coloque a chave secreta no app.

## Fora do MVP

Trocas, fotos, avaliações, denúncias, relatórios, versão web e publicação nas lojas.
