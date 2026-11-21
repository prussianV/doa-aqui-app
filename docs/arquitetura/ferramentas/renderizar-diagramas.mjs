// Renderiza os diagramas Mermaid (../diagramas/*.mmd) em PNG e SVG usando o Chrome instalado na máquina.
// Uso: npm install && npm run diagramas   (CHROME=/caminho/do/chrome para outro navegador)
// Para renderizar só alguns: node renderizar-diagramas.mjs 17-seq   (trecho do nome do arquivo)
import { readdirSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer-core';

const aqui = fileURLToPath(new URL('.', import.meta.url));
const origem = `${aqui}../diagramas/`;
const destino = `${origem}imagens/`;
mkdirSync(destino, { recursive: true });

const browser = await puppeteer.launch({ executablePath: process.env.CHROME ?? '/usr/bin/google-chrome', headless: 'new', args: ['--no-sandbox'] });
const page = await browser.newPage();
await page.setViewport({ width: 1600, height: 1200, deviceScaleFactor: 2 });
await page.setContent('<!doctype html><html><body style="margin:0;background:#fff"><div id="alvo" style="display:inline-block;padding:24px;background:#fff"></div></body></html>');
await page.addScriptTag({ path: `${aqui}node_modules/mermaid/dist/mermaid.min.js` });
await page.evaluate(() => {
  window.mermaid.initialize({
    startOnLoad: false,
    theme: 'base',
    fontFamily: 'Arial, Helvetica, sans-serif',
    themeVariables: {
      fontSize: '15px',
      primaryColor: '#FCE6DF',
      primaryBorderColor: '#C94F38',
      primaryTextColor: '#2B2420',
      secondaryColor: '#DDEFE7',
      tertiaryColor: '#F7F3EE',
      lineColor: '#5A4E46',
      clusterBkg: '#FBF8F4',
      clusterBorder: '#B8A99A',
      noteBkgColor: '#FCEFD3',
      noteBorderColor: '#C9A043',
      actorBkg: '#FCE6DF',
      actorBorder: '#C94F38',
    },
    flowchart: { htmlLabels: true, curve: 'basis', padding: 12, useMaxWidth: false },
    sequence: { mirrorActors: false, wrap: true, width: 140, actorMargin: 22, boxMargin: 6, messageMargin: 28, messageFontSize: 19, actorFontSize: 18, noteFontSize: 17, useMaxWidth: false },
    state: { useMaxWidth: false },
    er: { layoutDirection: 'TB', useMaxWidth: false },
  });
});

const filtro = process.argv[2];
const arquivos = readdirSync(origem).filter((f) => f.endsWith('.mmd') && (!filtro || f.includes(filtro))).sort();
for (const arquivo of arquivos) {
  const texto = readFileSync(origem + arquivo, 'utf8');
  const id = 'd' + arquivo.replace(/\W/g, '');
  const svg = await page.evaluate(async (id, texto) => {
    const { svg } = await window.mermaid.render(id, texto);
    document.getElementById('alvo').innerHTML = svg;
    return svg;
  }, id, texto);
  const nome = arquivo.replace(/\.mmd$/, '');
  writeFileSync(`${destino}${nome}.svg`, svg);
  const el = await page.$('#alvo');
  await el.screenshot({ path: `${destino}${nome}.png` });
  console.log('ok', nome);
}
await browser.close();
