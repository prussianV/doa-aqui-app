#!/usr/bin/env node
// Sincroniza esta cópia do Doa Aqui com o GitHub (origin/main). Funciona igual no Linux e no Windows.
//
//   node scripts/sincronizar.mjs                        # pergunta a mensagem se houver alterações
//   node scripts/sincronizar.mjs "feat(app): perfil"    # usa esta mensagem no commit
//
// 1. Se houver alterações locais, mostra quais são e faz um commit com elas.
// 2. Traz o que o outro computador enviou (git pull --rebase).
// 3. Envia os commits deste computador (git push).
// Nunca força nada: se houver conflito, para e explica o que fazer.
import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { createInterface } from 'node:readline/promises';
import { fileURLToPath } from 'node:url';

const raiz = fileURLToPath(new URL('..', import.meta.url));
const RAMO = 'main';
const SISTEMA = { win32: 'Windows', linux: 'Linux', darwin: 'macOS' }[process.platform] ?? process.platform;

function git(args, { capturar = false } = {}) {
  const r = spawnSync('git', args, {
    cwd: raiz,
    encoding: 'utf8',
    stdio: capturar ? ['ignore', 'pipe', 'pipe'] : 'inherit',
  });
  if (r.error) parar(`Não consegui rodar o git (${r.error.message}). Ele está instalado?`);
  return { ok: r.status === 0, saida: (r.stdout ?? '').trim() };
}

function parar(mensagem) {
  console.error(`\n✖ ${mensagem}`);
  process.exit(1);
}

function passo(mensagem) {
  console.log(`\n→ ${mensagem}`);
}

async function perguntarMensagem(padrao) {
  // Sem terminal interativo (ex.: rodando por outro programa), usa a mensagem padrão.
  if (!process.stdin.isTTY) return padrao;
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  rl.on('SIGINT', () => {
    console.log('\nCancelado. Nada foi commitado nem enviado.');
    process.exit(130);
  });
  const resposta = await rl.question(`\nMensagem do commit (Enter = "${padrao}", Ctrl+C cancela): `);
  rl.close();
  return resposta.trim() || padrao;
}

// 0. Conferências
const dirGit = git(['rev-parse', '--git-dir'], { capturar: true });
if (!dirGit.ok) parar('Esta pasta não é um repositório Git.');
const pastaGit = resolve(raiz, dirGit.saida);
if (['rebase-merge', 'rebase-apply', 'MERGE_HEAD'].some((f) => existsSync(resolve(pastaGit, f)))) {
  parar(
    'Há um rebase ou merge pela metade. Resolva os conflitos, rode "git add <arquivo>" e ' +
      '"git rebase --continue" (ou "git rebase --abort" para desistir) e rode este script de novo.',
  );
}
const ramo = git(['rev-parse', '--abbrev-ref', 'HEAD'], { capturar: true }).saida;
if (ramo !== RAMO) parar(`Você está no branch "${ramo}". Este script sincroniza só o "${RAMO}" (git switch ${RAMO}).`);

// 1. Commit das alterações locais
if (git(['status', '--porcelain'], { capturar: true }).saida) {
  passo('Alterações deste computador que vão para o GitHub:');
  git(['status', '--short']);
  const mensagem =
    process.argv.slice(2).join(' ').trim() || (await perguntarMensagem(`chore: sincroniza alterações (${SISTEMA})`));
  if (!git(['add', '-A']).ok) parar('O git add falhou.');
  if (!git(['commit', '-m', mensagem]).ok) parar('O git commit falhou.');
}

// 2. Trazer o que veio do outro computador
passo('Trazendo o que chegou do GitHub...');
if (!git(['pull', '--rebase', 'origin', RAMO]).ok) {
  parar(
    'Conflito ao juntar com o GitHub: o mesmo trecho foi mudado nos dois computadores. ' +
      'Rode "git status", abra os arquivos marcados como "both modified", escolha o que fica, ' +
      'rode "git add <arquivo>" e "git rebase --continue". Para desistir e voltar ao estado anterior: "git rebase --abort".',
  );
}

// 3. Enviar os commits deste computador
const aFrente = Number(git(['rev-list', '--count', `origin/${RAMO}..HEAD`], { capturar: true }).saida || 0);
if (aFrente > 0) {
  passo(`Enviando ${aFrente} commit(s) para o GitHub...`);
  if (!git(['push', 'origin', RAMO]).ok) {
    parar('O GitHub recusou o envio (talvez o outro computador tenha enviado algo agora). Rode este script de novo.');
  }
} else {
  passo('Nada novo para enviar.');
}

passo('Pronto. Situação atual:');
git(['status', '-sb']);
git(['log', '--oneline', '-3']);
