// Gera o Documento de Arquitetura de Software v3.2 (DOCX) e os anexos em Markdown.
// Uso: npm install && npm run diagramas && npm run documento
// Depois: python3 atualizar-e-exportar.py  (atualiza o sumário e gera o PDF com o LibreOffice)
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import {
  AlignmentType, BorderStyle, Document, Footer, Header, HeadingLevel, ImageRun, LevelFormat, Packer, PageBreak,
  PageNumber, Paragraph, ShadingType, Table, TableCell, TableRow, TabStopType, TextRun, WidthType,
} from 'docx';

import * as C from './conteudo.mjs';

const aqui = fileURLToPath(new URL('.', import.meta.url));
const IMG = `${aqui}../diagramas/imagens/`;
const SAIDA = `${aqui}../`;

const FONTE = 'Arial';
const LARGURA = 9070; // largura útil em twips (A4 com margens de 2,5 cm)
const CINZA = 'D9D9D9';
const borda = { style: BorderStyle.SINGLE, size: 4, color: '808080' };
const bordas = { top: borda, bottom: borda, left: borda, right: borda };

/* ---------------- utilitários ---------------- */
let nTabela = 0;
let nFigura = 0;
const corpo = [];
const add = (...x) => corpo.push(...x.flat());

const run = (t, o = {}) => new TextRun({ text: t, font: FONTE, ...o });

/** Texto com **negrito** e `código` simples. */
function partes(texto, base = {}) {
  const out = [];
  const re = /(\*\*[^*]+\*\*|`[^`]+`)/g;
  let i = 0;
  for (const m of texto.matchAll(re)) {
    if (m.index > i) out.push(run(texto.slice(i, m.index), base));
    const s = m[0];
    if (s.startsWith('**')) out.push(run(s.slice(2, -2), { ...base, bold: true }));
    else out.push(run(s.slice(1, -1), { ...base, font: 'Courier New', size: (base.size ?? 22) - 2 }));
    i = m.index + s.length;
  }
  if (i < texto.length) out.push(run(texto.slice(i), base));
  return out;
}

const p = (texto, o = {}) =>
  new Paragraph({
    children: partes(texto),
    alignment: AlignmentType.JUSTIFIED,
    spacing: { after: 120, line: 300 },
    indent: o.semRecuo ? undefined : { firstLine: 709 },
    ...o.par,
  });

const h1 = (t) => new Paragraph({ heading: HeadingLevel.HEADING_1, outlineLevel: 0, children: [run(t)], spacing: { before: 360, after: 160 }, keepNext: true });
const h2 = (t) => new Paragraph({ heading: HeadingLevel.HEADING_2, outlineLevel: 1, children: [run(t)], spacing: { before: 240, after: 120 }, keepNext: true });

const itens = (lista) =>
  lista.map((t) => new Paragraph({ children: partes(t), numbering: { reference: 'marcadores', level: 0 }, alignment: AlignmentType.JUSTIFIED, spacing: { after: 80, line: 288 } }));

const quebra = () => new Paragraph({ children: [new PageBreak()] });

function celula(texto, { cabecalho = false, largura, negrito = false } = {}) {
  const linhas = String(texto).split('\n');
  return new TableCell({
    width: { size: largura, type: WidthType.DXA },
    borders: bordas,
    shading: cabecalho ? { type: ShadingType.CLEAR, color: 'auto', fill: CINZA } : undefined,
    margins: { top: 50, bottom: 50, left: 90, right: 90 },
    children: linhas.map((l) => new Paragraph({ children: partes(l, { size: 18, bold: cabecalho || negrito }), alignment: cabecalho ? AlignmentType.CENTER : AlignmentType.LEFT, spacing: { after: 0 } })),
  });
}

/** Tabela com legenda “Tabela N – título” acima. pesos = proporção das colunas. */
function tabela(titulo, cabecalho, linhas, pesos, o = {}) {
  const total = pesos.reduce((a, b) => a + b, 0);
  const larg = pesos.map((x) => Math.round((x / total) * LARGURA));
  const out = [];
  if (titulo) {
    nTabela += 1;
    out.push(new Paragraph({ children: [run(`Tabela ${nTabela} – ${titulo}`, { bold: true, size: 19 })], spacing: { before: 120, after: 60 }, keepNext: true }));
  }
  out.push(
    new Table({
      width: { size: LARGURA, type: WidthType.DXA },
      columnWidths: larg,
      rows: [
        ...(cabecalho ? [new TableRow({ tableHeader: true, children: cabecalho.map((c, i) => celula(c, { cabecalho: true, largura: larg[i] })) })] : []),
        ...linhas.map((l) => new TableRow({ cantSplit: true, children: l.map((c, i) => celula(c, { largura: larg[i], negrito: o.primeiraNegrito && i === 0 })) })),
      ],
    }),
    new Paragraph({ children: [], spacing: { after: 120 } }),
  );
  return out;
}

function tamanhoPng(buf) {
  return { w: buf.readUInt32BE(16), h: buf.readUInt32BE(20) };
}

/** Figura centralizada com legenda “Figura N – título” abaixo. */
function figura(arquivo, titulo, { maxLargura = 600, maxAltura = 780 } = {}) {
  const buf = readFileSync(IMG + arquivo);
  const { w, h } = tamanhoPng(buf);
  const escala = Math.min(maxLargura / w, maxAltura / h, 1);
  nFigura += 1;
  return [
    new Paragraph({ alignment: AlignmentType.CENTER, keepNext: true, spacing: { before: 120, after: 60 }, children: [new ImageRun({ type: 'png', data: buf, transformation: { width: Math.round(w * escala), height: Math.round(h * escala) } })] }),
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 200 }, children: [run(`Figura ${nFigura} – ${titulo}`, { size: 19, bold: true })] }),
  ];
}

/* ---------------- capa, histórico e sumário ---------------- */
const capa = [
  ...Array.from({ length: 12 }, () => new Paragraph({ children: [] })),
  new Paragraph({ alignment: AlignmentType.RIGHT, spacing: { after: 240 }, children: [run('DA – Doa Aqui', { bold: true, size: 36 })] }),
  new Paragraph({ alignment: AlignmentType.RIGHT, spacing: { after: 240 }, children: [run('Documento de Arquitetura de Software', { bold: true, size: 32 })] }),
  new Paragraph({ alignment: AlignmentType.RIGHT, children: [run(`Versão ${C.META.versao}`, { bold: true, size: 28 })] }),
  quebra(),
];

const historico = [
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 160 }, children: [run('Histórico de Revisões', { bold: true, size: 24 })] }),
  ...tabela(null, ['Versão', 'Data', 'Descrição', 'Autor'], C.HISTORICO, [9, 13, 55, 23]),
  quebra(),
];

// O sumário é inserido pelo LibreOffice no lugar deste marcador (atualizar-e-exportar.py).
const sumario = [
  new Paragraph({ children: [run('[[SUMARIO]]')] }),
  quebra(),
];

/* ---------------- corpo do documento ---------------- */
add(new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 240 }, children: [run('Documento de Arquitetura de Software', { bold: true, size: 28 })] }));

// 1
add(h1('1. Introdução'));
add(p('Este documento apresenta as decisões de arquitetura do **Doa Aqui**, Produto Mínimo Viável (MVP) de uma plataforma digital para divulgação e gerenciamento de doações de itens entre pessoas físicas, ONGs e instituições beneficentes. O fluxo central é: um usuário publica um item, outro usuário localiza o anúncio e manifesta interesse, o anunciante consulta os interessados, as partes combinam a entrega fora da plataforma e o anunciante conclui o anúncio como doado. O Doa Aqui é exclusivamente uma plataforma de doações: não há troca de itens no MVP.'));
add(p('A versão 3.2 descreve o Doa Aqui como **aplicativo nativo em React Native**, criado com o React Native CLI, executado no Android (celular ou emulador) e preparado para iOS com o mesmo código. Por decisão da equipe, a versão web e o Progressive Web App (PWA) foram descontinuados (decisão DA-11, Anexo C). O backend é gerenciado pelo **Supabase**, que fornece autenticação, API de dados e banco **PostgreSQL**. Não existe servidor de aplicação próprio.'));
add(p('Para não confundir o que foi planejado com o que está pronto, cada requisito e caso de uso traz uma situação: **implementado e verificado**, quando há evidência de teste registrada no Anexo D; **implementado com teste pendente**, quando o código e o banco existem mas o teste ainda não foi executado; **parcialmente verificado**; **planejado**; ou **pendente de validação**. O documento atende desenvolvedores, avaliadores e demais interessados e está alinhado ao Documento de Visão atualizado e ao documento de Casos de Uso (UC-01 a UC-12).'));

// 2
add(h1('2. Identificação do Projeto'));
add(tabela('Identificação do projeto', ['Campo', 'Descrição'], C.IDENTIFICACAO, [26, 74], { primeiraNegrito: true }));

// 3
add(h1('3. Representação Arquitetural'));
add(p('A arquitetura combina um **aplicativo nativo** com um **backend gerenciado (Backend as a Service)**. O aplicativo é escrito em TypeScript com React Native, usa o React Navigation para as telas e é compilado pelo Gradle em um APK Android; o JavaScript roda no motor Hermes do próprio aparelho. O app se comunica diretamente com o Supabase pela biblioteca `supabase-js`, sempre por HTTPS e com mensagens JSON: a **API de autenticação** cuida de cadastro, login e sessão, e a **API de dados (PostgREST)** expõe as tabelas e as funções do PostgreSQL.'));
add(p('Como não há servidor próprio, as regras que precisam ser garantidas no backend (RNF-003) ficam no próprio banco: **políticas Row Level Security (RLS)**, permissões por coluna, restrições de integridade, um gatilho que controla o ciclo de vida do anúncio e funções que verificam o papel de quem chama. O aplicativo repete parte das validações apenas para dar retorno rápido ao usuário. A organização lógica tem cinco camadas: apresentação, aplicação e domínio no cliente, executadas no dispositivo, e backend gerenciado e persistência, executados no Supabase (seção 6.3).'));
add(figura('01-arquitetura-geral.png', 'Diagrama geral de arquitetura', { maxAltura: 700 }));
add(p('A arquitetura é descrita pelas seguintes visões:', { semRecuo: true }));
add(itens([
  '**Visão de Casos de Uso:** relaciona os atores Visitante, Usuário Autenticado (pessoa física ou ONG) e Administrador aos doze casos de uso do MVP.',
  '**Visão Lógica:** apresenta os módulos do código, os tipos do domínio, as camadas e o ciclo de vida do anúncio.',
  '**Visão de Processos:** descreve por diagramas de sequência os fluxos principais e os pontos de verificação de segurança.',
  '**Visão de Implantação:** mostra o celular Android, o computador de desenvolvimento com o emulador, o Supabase e o GitHub e os protocolos entre eles.',
  '**Visão da Implementação:** detalha a estrutura de diretórios, as dependências e as operações da API do Supabase usadas pelo app.',
  '**Visão de Dados:** apresenta o diagrama entidade-relacionamento, o dicionário de dados, as restrições e as políticas RLS.',
]));

// 4
add(h1('4. Metas e Restrições da Arquitetura'));
add(p('Esta seção apresenta os requisitos não funcionais e as regras de negócio do Documento de Visão, as restrições técnicas e as justificativas das tecnologias adotadas.'));
add(h2('4.1 Requisitos Não Funcionais'));
add(p('A tabela relaciona cada requisito não funcional da Visão à decisão arquitetural que o atende e ao que foi efetivamente verificado.'));
add(tabela('Requisitos não funcionais, decisões e verificação', ['ID', 'Requisito (Visão)', 'Decisão arquitetural', 'Verificação', 'Situação'], C.RNF, [11, 21, 28, 25, 15]));
add(h2('4.2 Regras de Negócio com Impacto Arquitetural'));
add(p('As regras de negócio são garantidas no banco de dados, independentemente do app. Na Visão, a tabela de regras usa os rótulos RNF-001 a RNF-008; aqui são identificadas como RN-01 a RN-08 (Anexo B).'));
add(tabela('Regras de negócio e mecanismo que as garante', ['ID', 'Regra de negócio', 'Onde é garantida'], C.RN, [10, 45, 45]));
add(h2('4.3 Restrições Arquiteturais'));
add(tabela('Restrições arquiteturais', ['Aspecto', 'Solução adotada'], C.RESTRICOES, [22, 78], { primeiraNegrito: true }));
add(h2('4.4 Justificativas Técnicas'));
add(p('As tecnologias abaixo foram confirmadas no código-fonte (`app/package.json`, `app/android/build.gradle` e `supabase/migrations`). A escolha considerou a viabilidade de entregar o MVP no prazo, um aplicativo de celular real para a disciplina de Desenvolvimento Mobile, a autenticação e a persistência reais sem servidor próprio e a possibilidade de evolução.'));
add(tabela('Tecnologias, vantagens e limitações', ['Tecnologia', 'Por que foi adotada', 'Limitação'], C.TECNOLOGIAS, [22, 43, 35], { primeiraNegrito: true }));
add(p('Limitações gerais da arquitetura escolhida:', { semRecuo: true }));
add(itens(C.LIMITACOES));
add(h2('4.5 Fora do Escopo do MVP'));
add(itens(C.FORA_ESCOPO));

// 5
add(h1('5. Visão de Casos de Uso'));
add(p('A Visão de Casos de Uso apresenta as funcionalidades do MVP sob a perspectiva dos atores. Os casos de uso e sua numeração são os do documento de Casos de Uso, organizados em três grupos: Conta e Acesso; Anúncios, Consulta e Doação; e Administração. Os diagramas usam notação UML adaptada: atores como blocos «ator» e casos de uso como elipses.'));
add(tabela('Atores do sistema', ['Ator', 'Descrição'], C.ATORES, [22, 78], { primeiraNegrito: true }));
add(figura('02-casos-de-uso-conta.png', 'Casos de uso – Conta e Acesso', { maxLargura: 380 }));
add(figura('03-casos-de-uso-anuncios.png', 'Casos de uso – Anúncios, Consulta e Doação'));
add(figura('04-casos-de-uso-admin.png', 'Casos de uso – Administração', { maxLargura: 380 }));
add(h2('5.1 Realizações de Casos de Uso'));
add(p('A tabela relaciona cada caso de uso ao ator, ao requisito funcional e aos componentes que o realizam. A numeração dos requisitos segue o documento de Casos de Uso (RF-001 a RF-011); a Visão atualizada usa RF-010 a RF-012 para os três últimos e não tem RF-009. A correção recomendada está no Anexo B; nenhum requisito foi alterado.'));
add(tabela('Casos de uso, requisitos, componentes e situação', ['Caso de uso', 'Ator', 'RF', 'Telas', 'Serviço e objetos do banco', 'Situação'], C.UCS, [17, 16, 10, 18, 25, 14]));
add(p('Pré-condições comuns: os casos de uso do Usuário Autenticado e do Administrador exigem sessão válida (UC-02) e conta ativa; contas bloqueadas (UC-12) não executam operações autenticadas. UC-08, UC-09 e UC-10 só podem ser executados pelo proprietário do anúncio. O UC-06 estende o UC-05 quando o anúncio está disponível e pertence a outra pessoa.'));

// 6
add(h1('6. Visão Lógica'));
add(p('A Visão Lógica descreve a organização interna real do software. O código não usa classes de domínio orientadas a objetos nem controllers e repositórios próprios: é organizado em módulos de funções e componentes React, com tipos TypeScript que espelham as tabelas do banco.'));
add(h2('6.1 Visão Geral'));
add(p('A figura mostra os módulos de `app/src` e as dependências permitidas. A navegação organiza as telas; as telas usam componentes, estado e serviços; apenas os serviços e o estado acessam o cliente do Supabase.'));
add(figura('05-pacotes.png', 'Diagrama de pacotes (módulos de app/src)', { maxLargura: 560 }));
add(h2('6.2 Pacotes de Design Significativos do Ponto de Vista da Arquitetura'));
add(tabela('Módulos do código-fonte', ['Módulo', 'Camada', 'Responsabilidade'], C.PACOTES, [24, 18, 58], { primeiraNegrito: true }));
add(p('Os tipos de domínio ficam em `negocio/tipos.ts` e correspondem às tabelas e às funções do banco:'));
add(tabela('Tipos do domínio no cliente', ['Tipo', 'Arquivo', 'Descrição'], C.TIPOS, [30, 18, 52], { primeiraNegrito: true }));
add(p('**Ciclo de vida do anúncio.** Todo anúncio nasce DISPONIVEL. O proprietário pode editá-lo, concluí-lo como DOADO ou desativá-lo; o administrador pode desativar anúncios disponíveis ou doados. Não há reativação nem exclusão física no MVP. As transições são impostas pelo gatilho `validar_anuncio()` no banco.', { semRecuo: true }));
add(figura('15-estados-anuncio.png', 'Diagrama de estados do anúncio', { maxLargura: 460 }));
add(h2('6.3 Camadas'));
add(p('As camadas abaixo são lógicas. As três primeiras executam no dispositivo do usuário, dentro do mesmo aplicativo; as duas últimas executam nos serviços gerenciados do Supabase. A separação física entre cliente e backend está descrita na seção 8.'));
add(tabela('Camadas lógicas e onde executam', ['Camada', 'Componentes', 'Onde executa', 'Responsabilidade'], C.CAMADAS, [17, 27, 18, 38], { primeiraNegrito: true }));
add(p('A comunicação é descendente: telas chamam estado e serviços; serviços chamam o Supabase; o banco nunca chama o app. A camada de apresentação não contém consultas e a decisão final sobre permissões é sempre do banco.'));

// 7
add(h1('7. Visão de Processos'));
add(p('Cada chamada do app ao Supabase é uma requisição HTTPS independente que carrega o JWT da sessão. O PostgreSQL identifica o usuário por `auth.uid()` e aplica as políticas RLS a cada operação, de modo que um bloqueio ou uma mudança de papel vale a partir da requisição seguinte. Os diagramas abaixo mostram os componentes reais envolvidos.'));
add(h2('7.1 Cadastro e Autenticação'));
add(p('Realiza UC-01, UC-02 e UC-03. O cadastro envia nome e tipo como metadados ao Supabase Auth. Como o projeto tem confirmação de e-mail ligada, a sessão só existe após a confirmação. No primeiro login, o app chama `criar_meu_perfil()`, que grava o perfil em `usuario`; em seguida, `meu_perfil()` informa papel e situação, e contas bloqueadas são desconectadas.'));
add(figura('08-seq-cadastro-autenticacao.png', 'Sequência – cadastrar conta, realizar login e logout', { maxAltura: 860 }));
add(p('Troca e redefinição de senha são funcionalidades adicionais, pedidas pela equipe (a Visão deixava a recuperação de senha fora do MVP; ver Anexo B e DA-09). Com a sessão aberta, a tela Conta pede a senha atual, confirmada com um novo login, antes de gravar a nova com `updateUser`. Sem sessão, “Esqueci minha senha” chama `resetPasswordForEmail`; o link do e-mail (`doaaqui://nova-senha`) abre o próprio app na tela Nova senha, que cria a sessão de recuperação, descarta os tokens recebidos e grava a nova senha. A resposta é a mesma exista ou não a conta, para não revelar quais e-mails estão cadastrados.'));
add(figura('17-seq-troca-senha.png', 'Sequência – trocar senha na conta e redefinir pelo e-mail', { maxAltura: 860 }));
add(h2('7.2 Publicação de Anúncio'));
add(p('Realiza UC-07. O formulário valida os campos em dois passos; o banco preenche o proprietário com `auth.uid()` e a situação DISPONIVEL e recusa dados fora das restrições.'));
add(figura('09-seq-publicar-anuncio.png', 'Sequência – publicar anúncio'));
add(h2('7.3 Pesquisa e Consulta'));
add(p('Realiza UC-04 e UC-05. Visitantes e usuários consultam a mesma tabela; a política RLS faz com que apenas anúncios disponíveis sejam retornados ao público, com o nome e o tipo do responsável.'));
add(figura('10-seq-pesquisar-consultar.png', 'Sequência – pesquisar e consultar anúncio'));
add(h2('7.4 Manifestação de Interesse e Consulta aos Interessados'));
add(p('Realiza UC-06 e UC-09. A autorização para mostrar o e-mail é pedida no momento da manifestação (RN-07). O banco impede interesse em anúncio próprio ou indisponível (RN-03) e interesse repetido (RN-04). Só o proprietário consulta a lista de interessados. Depois de registrar o interesse, o app lê `anuncio_contato`: se o doador informou telefone, a tela mostra o número com os botões Ligar e WhatsApp. A política RLS só devolve o número a quem manifestou interesse, ao doador e ao administrador (DA-10).'));
add(figura('11-seq-manifestar-interesse.png', 'Sequência – manifestar interesse e ver interessados'));
add(h2('7.5 Gerenciamento e Conclusão da Doação'));
add(p('Realiza UC-08 e UC-10. Editar, desativar e concluir passam pela política de UPDATE (só o proprietário) e pelo gatilho de transições. A conclusão é uma declaração do anunciante (RN-08).'));
add(figura('12-seq-concluir-doacao.png', 'Sequência – gerenciar e concluir doação'));
add(h2('7.6 Moderação de Anúncios'));
add(p('Realiza UC-11. O administrador vê anúncios em qualquer situação por meio da política de SELECT e desativa anúncios pela função `admin_desativar_anuncio()`, que verifica o papel antes de alterar.'));
add(figura('13-seq-moderacao.png', 'Sequência – moderar anúncios'));
add(h2('7.7 Bloqueio e Desbloqueio de Usuários'));
add(p('Realiza UC-12. O bloqueio altera `usuario.situacao`. A partir daí, as políticas RLS recusam publicações e interesses da conta, e o app encerra a sessão no próximo login. O administrador não pode bloquear a própria conta.'));
add(figura('14-seq-bloqueio-usuario.png', 'Sequência – bloquear e desbloquear usuário'));

// 8
add(h1('8. Visão de Implantação'));
add(p('O Doa Aqui não tem servidor próprio. O aplicativo é instalado no celular Android por um APK gerado pelo Gradle e, a partir daí, conversa diretamente com o Supabase. Para desenvolvimento e apresentação, o mesmo APK roda no emulador Android do computador; na versão de depuração, o JavaScript é enviado pelo Metro, e na versão de release ele vai dentro do APK, pré-compilado pelo Hermes. A versão iOS usa o mesmo código, mas depende de um Mac com Xcode e não foi compilada.'));
add(p('O banco está num projeto Supabase compartilhado com outra aplicação (achado-tecnico), por causa do limite de projetos ativos do plano gratuito. As tabelas do Doa Aqui foram criadas sem alterar os objetos existentes, e as funções internas ficam no esquema exclusivo `doaaqui_privado`. A migração para um projeto dedicado está registrada como pendência (Anexo E).'));
add(h2('8.1 Nós Físicos'));
add(tabela('Nós físicos', ['Nó', 'Descrição'], C.NOS, [24, 76], { primeiraNegrito: true }));
add(h2('8.2 Componentes Implantados'));
add(tabela('Componentes implantados por nó', ['Nó', 'Componentes'], C.COMPONENTES_IMPLANTADOS, [24, 76], { primeiraNegrito: true }));
add(h2('8.3 Diagrama de Implantação'));
add(figura('07-implantacao.png', 'Diagrama de implantação', { maxLargura: 560 }));
add(h2('8.4 Mapeamento dos Processos nos Nós Físicos'));
add(tabela('Mapeamento dos processos nos nós', ['Processo', 'Nó responsável'], C.MAPA_PROCESSOS, [60, 40]));
add(p('As verificações de identidade e propriedade acontecem sempre no Supabase. O aparelho exibe as telas e faz validações de conveniência. O app guarda apenas a sessão; sem internet, as funções de negócio não funcionam.'));

// 9
add(h1('9. Visão da Implementação'));
add(p('Esta seção descreve como o código-fonte está organizado no repositório e como o app se integra ao Supabase.'));
add(h2('9.1 Visão Geral'));
add(p('O repositório tem quatro áreas: `app/` (aplicativo React Native, com os projetos nativos `android/` e `ios/`), `supabase/` (migrações e testes do banco), `docs/` (documentação e diagramas) e `design/` (identidade visual). Não há pasta de backend: as APIs usadas são as fornecidas pelo Supabase.'));
add(tabela('Estrutura de diretórios', ['Diretório', 'Conteúdo', 'Camada'], C.DIRETORIOS, [28, 50, 22]));
add(tabela('Principais dependências do aplicativo (app/package.json e app/android)', ['Pacote', 'Versão', 'Finalidade'], C.DEPENDENCIAS, [38, 22, 40]));
add(figura('06-componentes.png', 'Diagrama de componentes da implementação'));
add(p('Em vez de endpoints próprios, o app usa as operações abaixo da API do Supabase. Todas passam pelas políticas RLS ou pelas verificações das funções.'));
add(tabela('Operações da API do Supabase usadas pelo app', ['Operação', 'Finalidade', 'UC', 'Acesso'], C.OPERACOES_API, [40, 26, 14, 20]));
add(p('Comandos de execução, na pasta `app/`: `npm install`; `npm run emulador` (abre o emulador Android); `npm start` (Metro) e `npm run android` (compila, instala e abre o app de depuração); `npm run apk` e `npm run apk:celular` (APK de release para o emulador, x86_64, e para celulares, arm64-v8a, sempre com o emulador fechado); `npm run apresentar` (abre o emulador e instala o APK de release); `npm run typecheck`, `npm run lint` e `npm test`. Na raiz, `node --test supabase/testes/` roda os testes de autorização. O endereço do Supabase e a chave pública ficam em `app/src/config.ts`; o controle de acesso não depende dessa chave, e sim das políticas do banco.'));

// 10
add(h1('10. Visão de Dados'));
add(p('O modelo de dados tem cinco tabelas no esquema `public` do PostgreSQL e usa a tabela `auth.users` do Supabase Auth para as credenciais. Segue o princípio de coleta mínima (RNF-007): não há CPF, CNPJ, endereço, imagens ou documentos. O único dado além de nome e e-mail é o telefone de contato opcional de cada anúncio (tabela `anuncio_contato`), pedido pela equipe e visível só a quem manifestou interesse (DA-10). O esquema foi definido nas migrações de `supabase/migrations` e substitui o MER lógico anterior, baseado em MySQL (Anexo B).'));
add(h2('10.1 Modelo Entidade-Relacionamento'));
add(figura('16-der.png', 'Diagrama entidade-relacionamento (PostgreSQL)', { maxAltura: 760 }));
add(p('Cardinalidades: cada conta de `auth.users` tem no máximo um perfil em `usuario` (1:0..1), criado no primeiro acesso ao Doa Aqui; um usuário publica N anúncios e registra N interesses; uma categoria classifica N anúncios; um anúncio recebe N interesses, no máximo um por usuário, e tem no máximo um telefone de contato em `anuncio_contato` (1:0..1).'));
add(h2('10.2 Dicionário de Dados'));
add(tabela('Tabela usuario', ['Campo', 'Tipo', 'Restrições e observações'], C.DICIONARIO.usuario, [22, 16, 62]));
add(tabela('Tabela categoria', ['Campo', 'Tipo', 'Restrições e observações'], C.DICIONARIO.categoria, [22, 16, 62]));
add(tabela('Tabela anuncio', ['Campo', 'Tipo', 'Restrições e observações'], C.DICIONARIO.anuncio, [22, 16, 62]));
add(tabela('Tabela interesse', ['Campo', 'Tipo', 'Restrições e observações'], C.DICIONARIO.interesse, [22, 16, 62]));
add(tabela('Tabela anuncio_contato', ['Campo', 'Tipo', 'Restrições e observações'], C.DICIONARIO.anuncio_contato, [22, 16, 62]));
add(p('Carga inicial: as cinco categorias (Roupas, Livros, Móveis, Ração e Brinquedos) são inseridas pela primeira migração.'));
add(h2('10.3 Restrições de Integridade e Índices'));
add(itens(C.INTEGRIDADE));
add(h2('10.4 Políticas RLS e Permissões'));
add(p('O Supabase concede por padrão todos os privilégios aos papéis `anon` (visitante) e `authenticated` (usuário logado). As migrações revogam esses privilégios e concedem apenas o necessário, por coluna, antes de definir as políticas.'));
add(tabela('Políticas RLS e permissões por tabela', ['Tabela', 'Operação', 'Papéis', 'Regra'], C.POLITICAS, [14, 12, 20, 54]));
add(h2('10.5 Funções e Gatilho'));
add(tabela('Funções e gatilho do banco', ['Objeto', 'Finalidade', 'Execução'], C.FUNCOES, [36, 44, 20]));
add(h2('10.6 Relação entre o Supabase Auth e o Perfil'));
add(p('E-mail e hash de senha ficam em `auth.users`, gerenciados pelo Supabase Auth e nunca expostos pela API. O perfil do Doa Aqui fica em `usuario`, com a mesma chave primária. Como o projeto Supabase é compartilhado, não foi criado gatilho em `auth.users`: o perfil é criado pela função `criar_meu_perfil()` quando a pessoa entra no app pela primeira vez, usando o nome e o tipo informados no cadastro. Papel e situação só são lidos por `meu_perfil()` e pelas funções administrativas.'));

// 11
add(h1('11. Tamanho e Desempenho'));
add(p('O Documento de Visão não define requisitos quantitativos de desempenho nem de volume. A tabela registra as decisões que mantêm o sistema responsivo e separa o que foi medido do que é apenas objetivo. Não há números de usuários suportados ou resultados de testes de carga.'));
add(tabela('Tamanho e desempenho', ['Aspecto', 'Decisão ou premissa', 'Situação'], C.DESEMPENHO, [22, 58, 20], { primeiraNegrito: true }));

// 12
add(h1('12. Qualidade'));
add(p('Os atributos de qualidade seguem o modelo da norma ISO/IEC 25010. A tabela relaciona cada atributo às decisões arquiteturais e ao mecanismo de verificação disponível.'));
add(tabela('Atributos de qualidade (ISO/IEC 25010)', ['Atributo', 'Decisão arquitetural', 'Verificação', 'RNF'], C.QUALIDADE, [18, 38, 30, 14], { primeiraNegrito: true }));
add(p('A tecnologia, por si só, não garante segurança nem desempenho: as políticas RLS precisam ser testadas a cada mudança, e o desempenho real só será conhecido com medições num celular real.'));
add(tabela('Padrões e boas práticas', ['Padrão ou prática', 'Objetivo'], C.PRATICAS, [32, 68], { primeiraNegrito: true }));

// 13
add(h1('13. Anexos'));
add(h2('Anexo A – Matriz de Rastreabilidade'));
add(tabela('Rastreabilidade entre requisitos, casos de uso, componentes e entidades', ['RF', 'Requisito', 'UC', 'Telas', 'Serviço', 'Entidades', 'Situação'], C.MATRIZ, [10, 14, 10, 19, 15, 16, 16]));
add(h2('Anexo B – Divergências entre Documentos e Código'));
add(tabela('Divergências identificadas na auditoria', ['Item', 'Origem', 'Divergência', 'Correção'], C.DIVERGENCIAS, [17, 17, 33, 33], { primeiraNegrito: true }));
add(h2('Anexo C – Decisões Arquiteturais'));
add(tabela('Decisões arquiteturais', ['ID', 'Decisão', 'Motivo', 'Consequência'], C.DECISOES, [8, 30, 34, 28]));
add(h2('Anexo D – Evidências de Testes'));
add(p('Somente testes efetivamente executados aparecem com resultado. Os scripts estão no repositório (`supabase/testes/` e `app/__tests__/`).'));
add(tabela('Evidências de testes', ['Data', 'Verificação', 'Resultado'], C.EVIDENCIAS, [12, 38, 50]));
add(h2('Anexo E – Pendências Técnicas'));
add(tabela('Pendências a verificar no código ou no Supabase', ['ID', 'Pendência', 'Responsável', 'Prioridade'], C.PENDENCIAS, [8, 66, 13, 13]));
add(h2('Anexo F – Principais Mudanças em Relação à Versão 3.0'));
add(tabela('Mudanças em relação à versão 3.0', ['Item', 'Versão 3.0', 'Versão 3.2'], C.MUDANCAS_30, [20, 38, 42], { primeiraNegrito: true }));

// 14
add(h1('14. Referências'));
add(C.REFERENCIAS.map((r) => new Paragraph({ children: [run(r, { size: 20 })], spacing: { after: 120 }, alignment: AlignmentType.LEFT })));

// 15
add(h1('15. Aprovações'));
add(tabela(null, ['Participante', 'Assinatura', 'Data'], [['', '', ''], ['', '', ''], ['', '', '']], [40, 40, 20]));

/* ---------------- montagem ---------------- */
const cabecalho = new Header({
  children: [
    new Table({
      width: { size: LARGURA, type: WidthType.DXA },
      columnWidths: [Math.round(LARGURA * 0.3), Math.round(LARGURA * 0.7)],
      rows: [new TableRow({ children: [
        new TableCell({ borders: bordas, width: { size: Math.round(LARGURA * 0.3), type: WidthType.DXA }, children: [new Paragraph({ children: [run('Doa Aqui', { size: 18 })] })] }),
        new TableCell({ borders: bordas, width: { size: Math.round(LARGURA * 0.7), type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [run(`Documento de Arquitetura de Software · Versão ${C.META.versao}`, { size: 18 })] })] }),
      ] })],
    }),
  ],
});

const rodape = new Footer({
  children: [
    new Paragraph({
      tabStops: [{ type: TabStopType.RIGHT, position: LARGURA }],
      children: [
        run(`Nome do Arquivo: ${C.META.arquivo}`, { size: 16 }),
        new TextRun({ font: FONTE, size: 16, children: ['\tPágina ', PageNumber.CURRENT, '/', PageNumber.TOTAL_PAGES] }),
      ],
    }),
  ],
});

const doc = new Document({
  creator: C.META.autores,
  title: `DA – Doa Aqui – Documento de Arquitetura de Software – Versão ${C.META.versao}`,
  description: 'Documento de Arquitetura de Software do MVP Doa Aqui',
  features: { updateFields: true },
  styles: {
    default: { document: { run: { font: FONTE, size: 22 } } },
    paragraphStyles: [
      { id: 'Heading1', name: 'Heading 1', basedOn: 'Normal', next: 'Normal', quickFormat: true, run: { font: FONTE, size: 28, bold: true, color: '000000' }, paragraph: { spacing: { before: 360, after: 160 }, outlineLevel: 0 } },
      { id: 'Heading2', name: 'Heading 2', basedOn: 'Normal', next: 'Normal', quickFormat: true, run: { font: FONTE, size: 24, bold: true, color: '000000' }, paragraph: { spacing: { before: 240, after: 120 }, outlineLevel: 1 } },
    ],
  },
  numbering: {
    config: [{ reference: 'marcadores', levels: [{ level: 0, format: LevelFormat.BULLET, text: '•', alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] }],
  },
  sections: [
    {
      properties: {
        titlePage: true,
        page: { size: { width: 11906, height: 16838 }, margin: { top: 1418, bottom: 1134, left: 1418, right: 1418, header: 567, footer: 567 } },
      },
      headers: { default: cabecalho, first: cabecalho },
      footers: { default: rodape, first: new Footer({ children: [new Paragraph({ children: [] })] }) },
      children: [...capa, ...historico, ...sumario, ...corpo],
    },
  ],
});

mkdirSync(SAIDA, { recursive: true });
writeFileSync(`${SAIDA}${C.META.arquivo}`, await Packer.toBuffer(doc));
console.log(`DOCX gerado: docs/arquitetura/${C.META.arquivo} (${nTabela} tabelas, ${nFigura} figuras)`);

/* ---------------- anexos em Markdown ---------------- */
const md = (cab, linhas) => [`| ${cab.join(' | ')} |`, `| ${cab.map(() => '---').join(' | ')} |`, ...linhas.map((l) => `| ${l.map((c) => String(c).replace(/\|/g, '\\|').replace(/\n/g, ' ')).join(' | ')} |`)].join('\n');

writeFileSync(`${SAIDA}matriz-rastreabilidade.md`, `# Matriz de rastreabilidade · Doa Aqui (DA ${C.META.versao})\n\nRequisitos (numeração RF-001 a RF-011 dos Casos de Uso), casos de uso, componentes e entidades. Situação em ${C.META.data}.\n\n${md(['RF', 'Requisito', 'UC', 'Telas', 'Serviço', 'Entidades', 'Situação'], C.MATRIZ)}\n\n## Casos de uso e componentes\n\n${md(['Caso de uso', 'Ator', 'RF', 'Telas', 'Serviço e objetos do banco', 'Situação'], C.UCS)}\n`);

writeFileSync(`${SAIDA}pendencias.md`, `# Pendências técnicas · Doa Aqui (DA ${C.META.versao})\n\nItens que ainda precisam ser verificados no código ou no Supabase real. Atualizado em ${C.META.data}.\n\n${md(['ID', 'Pendência', 'Responsável', 'Prioridade'], C.PENDENCIAS)}\n`);

writeFileSync(`${SAIDA}relatorio-auditoria.md`, `# Relatório de auditoria e correções · Doa Aqui (DA ${C.META.versao})

Data: ${C.META.data}. Base: Documento de Visão atualizado, Casos de Uso (UC-01 a UC-12), DA 3.0, MER lógico e o código do repositório (app React Native e migrações do Supabase).

## Resumo

- O Doa Aqui é um aplicativo nativo em React Native (React Native CLI), executado no Android e preparado para iOS. A versão web e o PWA foram descontinuados por decisão da equipe em 21/11/2026 (DA-11); o RNF-006 da Visão passa a ser atendido pela instalação do app nativo e precisa ser atualizado na Visão (P-15).
- O DA 3.0 descrevia MySQL, API REST própria, controllers, repositórios, JWT emitido por servidor e XAMPP. Nada disso existe no projeto: o backend é o Supabase (Auth, PostgREST e PostgreSQL com RLS, gatilho e funções).
- O app foi refeito com React Navigation (pilha, abas e links doaaqui://), projetos android/ e ios/, ícone adaptativo e tela de abertura nativos, mantendo todas as funcionalidades e a identidade visual: cadastro e login, pesquisa por categoria e cidade/UF, interesse com consentimento de e-mail, telefone de contato para quem manifestou interesse, lista de interessados, conclusão e desativação, moderação, bloqueio de usuários e troca e redefinição de senha.
- O banco está no projeto Supabase compartilhado achado-tecnico, sem alterar os objetos existentes (sem gatilho em auth.users e com funções internas no esquema doaaqui_privado).
- Os 38 testes de autorização passaram contra o banco real e os 14 testes de unidade do app passaram. Cadastro e login digitados na tela ainda dependem da decisão sobre a confirmação de e-mail (P-02 e P-03).
- Troca e redefinição de senha (DA-09) e telefone de contato (DA-10) são funcionalidades adicionais pedidas pela equipe e precisam ser registradas na Visão (P-14). O e-mail real de redefinição depende de P-02 e P-13.

## Tecnologias confirmadas no código

${md(['Tecnologia', 'Por que foi adotada', 'Limitação'], C.TECNOLOGIAS)}

## Divergências e correções

${md(['Item', 'Origem', 'Divergência', 'Correção'], C.DIVERGENCIAS)}

## Situação dos requisitos não funcionais

${md(['ID', 'Requisito', 'Decisão', 'Verificação', 'Situação'], C.RNF)}

## Evidências de teste

${md(['Data', 'Verificação', 'Resultado'], C.EVIDENCIAS)}

## Decisões arquiteturais

${md(['ID', 'Decisão', 'Motivo', 'Consequência'], C.DECISOES)}
`);
console.log('Markdown gerado: matriz-rastreabilidade.md, pendencias.md, relatorio-auditoria.md');
