# Doa Aqui: instruções para o Claude

Este repositório é usado em **dois computadores** (um Linux e um Windows), sincronizados pelo GitHub:
`origin` = `prussianV/doa-aqui-app`, branch `main`. A pessoa usuária pediu que tudo o que for desenvolvido
ou melhorado em um computador chegue ao outro.

## Sincronização

- **Antes de editar qualquer coisa** numa sessão ou tarefa nova: `git pull --rebase origin main`. Se houver
  alterações locais não commitadas, avise a pessoa usuária antes de puxar.
- **Ao terminar uma tarefa** (com `npm test`, `npm run typecheck` e `npm run lint` passando em `app/`, quando
  ela mexe no app): faça o commit e `git push origin main` sem esperar ser lembrado. Não envie trabalho pela
  metade nem com testes falhando; nesse caso, diga o que ficou pendente.
- Se o push for recusado porque o outro computador enviou algo antes: `git pull --rebase origin main`, resolva
  os conflitos (mostre à pessoa usuária os que não forem óbvios) e envie de novo. **Nunca** `git push --force`.
- Para a pessoa usuária fazer tudo isso de uma vez: `node scripts/sincronizar.mjs` (commit, pull e push).
- O repositório antigo `prussianV/doa-aqui` (Expo + PWA) está **arquivado** e não deve ser usado.

## O que não vai para o Git (cada computador tem o seu)

- `app/android/local.properties`: pasta do Android SDK da máquina.
- `supabase/testes/.env`: contas de teste dos testes de autorização (os valores estão em `supabase/README.md`).
- `node_modules/` e as pastas de build do Android/iOS.

## Diferenças entre os computadores

- Fim de linha: o `.gitattributes` guarda texto com LF e converte no checkout. Scripts `.sh` e o `gradlew`
  ficam com LF também no Windows.
- Os scripts npm do app que mexem com Android (`android`, `emulador`, `apk`, `apresentar`) rodam com `bash` e
  `app/scripts/ambiente.sh`, que usa `JAVA_HOME` e `ANDROID_HOME` se já existirem e, se não, os caminhos do
  Linux (`~/.local/share/jdk-17`, `~/Android/Sdk`). No Windows, defina essas duas variáveis e rode pelo Git Bash.
