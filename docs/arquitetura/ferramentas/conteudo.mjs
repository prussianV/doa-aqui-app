// Conteúdo do Documento de Arquitetura de Software v3.2 e dos anexos em Markdown.
// Fonte única: gerar-documento.mjs monta o DOCX e os arquivos .md a partir daqui.

export const META = {
  versao: '3.2',
  data: '21/11/2026',
  arquivo: 'DA_DocumentoArquiteturaSoftware_v3.2.docx',
  autores: 'Bianca Flauzino, Fernando Freire, Lorenzo Eterovic',
  repositorio: 'https://github.com/prussianV/doa-aqui-app',
  pacoteAndroid: 'br.fatec.doaaqui',
};

// Situação de cada item. Atualize aqui quando novos testes forem executados.
export const S = {
  OK: 'Implementado e verificado',
  IMPL: 'Implementado; teste pendente',
  PARCIAL: 'Parcialmente verificado',
  PLAN: 'Planejado',
  PEND: 'Pendente de validação',
  SUBST: 'Atendido de outra forma (DA-11)',
};

export const HISTORICO = [
  ['1.0', '06/05/2026', 'Criação inicial do documento de arquitetura do sistema.', META.autores],
  ['1.1', '13/05/2026', 'Atualização da arquitetura em 3 camadas e refinamento dos diagramas UML.', META.autores],
  ['1.2', '17/05/2026', 'Revisão geral do documento, complementação das visões arquiteturais, requisitos não funcionais e atributos de qualidade.', META.autores],
  ['2.0', '06/06/2026', 'Revisão final e preenchimento das referências bibliográficas para entrega do documento.', META.autores],
  ['3.0', '20/11/2026', 'Reestruturação completa conforme o Documento de Visão atualizado (RF-001 a RF-011, RNF-001 a RNF-007 e RN-01 a RN-08) e o documento de Casos de Uso (UC-01 a UC-12), com máquina de estados do anúncio, visão de dados e matriz de rastreabilidade.', META.autores],
  ['3.1', '20/11/2026', 'Substituição de MySQL, API REST própria e servidor de aplicação pelo backend gerenciado Supabase (Auth, API de dados e PostgreSQL com RLS, gatilho e funções); inclusão da auditoria técnica, das divergências, das decisões arquiteturais, das evidências de teste e das pendências; troca e redefinição de senha e telefone de contato opcional no anúncio, a pedido da equipe.', META.autores],
  ['3.2', META.data, 'Reestruturação do aplicativo como app nativo em React Native CLI (Android e iOS), sem versão web nem PWA, por decisão da equipe (DA-11): navegação com React Navigation, projetos android/ e ios/, ícone e tela de abertura nativos, link doaaqui:// para a redefinição de senha, execução no emulador Android e distribuição por APK. Revisão completa do documento para descrever apenas o app nativo: restrições, tecnologias, visões lógica, de processos, de implantação e de implementação, diagramas, evidências de teste, pendências e referências. Novo repositório: prussianV/doa-aqui-app.', META.autores],
];

export const IDENTIFICACAO = [
  ['Projeto', 'DA – Doa Aqui'],
  ['Requisitante', 'ONGs e instituições beneficentes'],
  ['Gerente de Projetos', META.autores],
  ['Escopo desta versão', 'MVP: cadastro, autenticação, publicação, pesquisa e consulta de anúncios, manifestação de interesse, consulta aos interessados, gerenciamento e conclusão de doações, moderação de anúncios e gerenciamento de usuários'],
  ['Plataforma', `Aplicativo nativo em React Native para Android (pacote ${META.pacoteAndroid}); iOS possível com o mesmo código`],
  ['Documentos de referência', 'Documento de Visão – Doa Aqui (versão atualizada); Casos de Uso – Doa Aqui (UC-01 a UC-12); Documento de Arquitetura versão 3.0'],
  ['Código-fonte', `${META.repositorio} (repositório privado)`],
];

export const RNF = [
  ['RNF-001', 'Interface funcional e sem rolagem horizontal indevida em largura móvel de 360 px e desktop de 1280 px.', 'Interface mobile-first em React Native, com layouts flexíveis (flexbox), áreas seguras e orientação retrato. Sem versão web, a largura de desktop deixa de se aplicar (DA-11).', 'Fluxos executados no emulador Android (Pixel 6, 411 dp de largura) sem rolagem horizontal. A largura de 360 dp e um celular real ainda não foram verificados (P-07).', S.PARCIAL],
  ['RNF-002', 'Senhas nunca armazenadas em texto puro e nunca retornadas pela API; autenticação protegida.', 'Senhas tratadas apenas pelo Supabase Auth, que guarda o hash e emite JWT. O app nunca lê a senha armazenada; as funções do banco não retornam campos de senha. Comunicação somente em HTTPS.', 'Testes aprovados: meu_perfil() devolve apenas id, nome, e-mail, tipo, papel, situação e data; visitante não executa a função (Anexo D).', S.OK],
  ['RNF-003', 'Backend valida identidade e propriedade antes de criar, editar, desativar ou concluir anúncio.', 'Sem servidor próprio: a validação acontece no PostgreSQL. Políticas RLS comparam usuario_id com auth.uid(); o gatilho validar_anuncio() controla as transições; funções administrativas conferem o papel.', '38 testes de autorização aprovados contra o banco real, incluindo propriedade, transições, interesse, telefone de contato, moderação e bloqueio (Anexo D).', S.OK],
  ['RNF-004', 'Dados persistem após atualização da página e reinicialização do cliente; consultas leem dados do banco real.', 'Dados de negócio somente no PostgreSQL do Supabase. O aparelho guarda apenas a sessão (token, no AsyncStorage) e a preferência de boas-vindas; ao fechar e reabrir o app, a sessão é restaurada e os dados são lidos de novo do banco.', 'Categorias, anúncios e perfil lidos do banco real no app em execução no emulador (Anexo D).', S.OK],
  ['RNF-005', 'Campos inválidos e falhas de rede apresentam mensagens compreensíveis ao usuário.', 'Validação no cliente (negocio/regras.ts) e tradução de erros do Supabase e do PostgreSQL (servicos/erros.ts); telas com estados de carregamento, erro e “Tentar de novo”.', '14 testes de unidade das validações (Jest); mensagens conferidas nas telas do emulador. Falhas de rede não foram simuladas.', S.PARCIAL],
  ['RNF-006', 'PWA fornece manifesto/ícones e instalação quando compatível; conectividade online exigida para funções de servidor.', 'Por decisão da equipe (DA-11), a instalação é feita como aplicativo nativo Android (APK), com ícone adaptativo, nome “Doa Aqui” e tela de abertura do sistema; não há versão web. Conectividade continua exigida para as funções de servidor.', 'APK instalado e aberto no emulador Android 15 com ícone e tela de abertura (Anexo D). Atualizar o RNF-006 na Visão (P-15).', S.SUBST],
  ['RNF-007', 'Coleta mínima: nome e e-mail; localização aproximada, sem CPF/CNPJ ou documentos pessoais obrigatórios.', 'Modelo de dados limitado a nome, e-mail (no Supabase Auth), tipo autodeclarado e cidade/UF do anúncio. O único dado extra é um telefone de contato opcional por anúncio, pedido pela equipe (DA-10), visível só ao doador, aos interessados e ao administrador. Não há campos de CPF, CNPJ, endereço, imagens ou documentos.', 'Conferido no esquema aplicado (seção 10) e nos testes do telefone (Anexo D). O telefone opcional precisa ser registrado na Visão (P-14).', S.OK],
];

export const RN = [
  ['RN-01', 'E-mail de cadastro deve ser único.', 'Unicidade de e-mail do Supabase Auth; o app trata a resposta de e-mail já cadastrado.'],
  ['RN-02', 'Somente usuário autenticado pode publicar e manifestar interesse.', 'Permissões de INSERT só para o papel authenticated e políticas RLS que exigem conta ativa.'],
  ['RN-03', 'Não se permite manifestar interesse em anúncio próprio ou com status diferente de “disponível”.', 'Política RLS de INSERT em interesse com a função anuncio_aceita_interesse().'],
  ['RN-04', 'Um usuário pode ter no máximo um registro de interesse ativo por anúncio.', 'Restrição UNIQUE (anuncio_id, usuario_id).'],
  ['RN-05', 'Somente o proprietário pode alterar, desativar ou concluir o próprio anúncio.', 'Política RLS de UPDATE (usuario_id = auth.uid()) e permissão de UPDATE restrita a colunas.'],
  ['RN-06', 'Estados do anúncio: disponível, doado e inativo. Apenas “disponível” aparece nos resultados públicos por padrão.', 'CHECK em anuncio.status, gatilho validar_anuncio() e política RLS de SELECT.'],
  ['RN-07', 'Compartilhar e-mail de interessado com anunciante exige confirmação explícita no ato da manifestação.', 'Campo interesse.autoriza_email (padrão falso) e função listar_interessados(), que só devolve o e-mail quando autorizado.'],
  ['RN-08', 'A conclusão da doação é uma declaração do anunciante; não confirma entrega física auditada.', 'A conclusão só altera o status para DOADO e grava concluido_em; não há fluxo de comprovação.'],
];

export const RESTRICOES = [
  ['Plataforma', 'Aplicativo nativo em React Native (CLI, sem Expo). Android 7.0 (API 24) ou superior, compilado com Android SDK 37; iOS possível com o mesmo código, mas exige macOS com Xcode e não foi compilado.'],
  ['Compatibilidade', 'Celulares Android em orientação retrato; verificado no emulador Android 15 (API 35).'],
  ['Arquitetura', 'Cliente com camadas lógicas (apresentação, aplicação e domínio no cliente) integrado a um backend gerenciado (BaaS). Não há servidor de aplicação próprio.'],
  ['Comunicação', 'HTTPS com JSON, por meio do cliente supabase-js, para a API de autenticação e a API de dados (PostgREST) do Supabase.'],
  ['Segurança', 'Supabase Auth (hash de senha e JWT), políticas Row Level Security, permissões por coluna e funções que verificam o papel do usuário.'],
  ['Persistência', 'PostgreSQL 17 gerenciado pelo Supabase, região sa-east-1 (São Paulo).'],
  ['Distribuição', `APK gerado pelo Gradle (pacote ${META.pacoteAndroid}) para instalação direta e apresentação no emulador; publicação nas lojas fora do escopo.`],
  ['Ambiente de desenvolvimento', 'Node.js 22 ou superior, JDK 17, Android SDK (plataforma 37, build-tools 37, NDK 27) e emulador Android.'],
  ['Conectividade', 'Internet obrigatória para as funções de negócio.'],
  ['Metodologia', 'Scrum.'],
  ['Controle de versão', 'Git e GitHub.'],
];

export const TECNOLOGIAS = [
  ['React Native 0.88 (CLI)', 'App nativo com uma base de código para Android e iOS; atende a disciplina de Desenvolvimento Mobile. Projetos android/ e ios/ abertos no Android Studio e no Xcode.', 'O build nativo exige Android SDK, JDK e NDK; o primeiro build é demorado em computadores modestos.'],
  ['React Navigation 7', 'Pilha nativa (native-stack), abas inferiores e links doaaqui:// com rotas e parâmetros tipados.', 'As rotas são declaradas no código (src/navegacao), não por arquivos.'],
  ['TypeScript 6', 'Tipos verificados em tempo de compilação (npm run typecheck) e tipos que espelham as tabelas.', 'Os tipos do banco são mantidos à mão; não há geração automática.'],
  ['Hermes', 'Motor JavaScript do React Native: no APK de release o código vai pré-compilado em bytecode, o que acelera a abertura.', 'Depuração diferente da de um navegador.'],
  ['Android SDK, Gradle e emulador', 'Compilação do APK e execução do app no computador para desenvolvimento e apresentação.', 'O emulador exige virtualização (KVM) e cerca de 2 GB de RAM.'],
  ['Supabase Auth', 'Cadastro, login, sessão, hash de senha, troca e redefinição de senha sem servidor próprio (RF-001, RF-002, RNF-002).', 'Configuração de e-mail compartilhada com o projeto achado-tecnico (Anexo E).'],
  ['PostgreSQL + RLS (Supabase)', 'Persistência real, integridade por restrições e autorização aplicada no próprio banco (RNF-003, RNF-004).', 'Regras em SQL exigem conhecimento de políticas RLS e testes específicos; dependência do fornecedor.'],
  ['AsyncStorage', 'Guarda a sessão do Supabase e a preferência de boas-vindas no aparelho (RNF-004).', 'Não guarda dados de negócio: sem internet, as listas não carregam.'],
  ['Jest e node:test', 'Testes de unidade das regras do app (Jest) e testes de autorização contra o banco real (node --test).', 'Não há testes automatizados de interface; as telas foram verificadas no emulador.'],
  ['Mermaid', 'Diagramas em texto, versionados junto ao código e importáveis no Draw.io.', 'Notação UML aproximada em casos de uso, componentes e implantação.'],
];

export const LIMITACOES = [
  'A lógica de autorização está no banco (RLS, gatilho e funções). Isso evita um servidor próprio, mas exige que toda regra nova seja escrita e testada em SQL.',
  'O projeto Supabase é compartilhado com outra aplicação (achado-tecnico), por limite de projetos ativos do plano gratuito. Contas, configuração de e-mail e cotas são comuns aos dois sistemas (Anexo E).',
  'A confirmação de e-mail está ligada no projeto e usa o envio padrão do Supabase, que tem limite de mensagens por hora.',
  'Não há operação offline: sem internet, o app abre, mas as listas e as ações mostram a mensagem de falha com “Tentar de novo”.',
  'O build nativo é pesado: no computador usado (Core i3-4005U, 8 GB de RAM), compilar o APK com o emulador aberto esgotou a memória. O APK do emulador é gerado só para x86_64 e o de celular (arm64-v8a) separadamente, sempre com o emulador fechado.',
  'A versão iOS não foi compilada: exige um Mac com Xcode (P-11).',
  'O APK atual é assinado com a chave de depuração do projeto; para distribuição ampla é preciso uma chave própria (P-16).',
  'A conclusão da doação é declaratória (RN-08) e o cadastro de ONG é autodeclarado.',
];

export const FORA_ESCOPO = [
  'entrega física dos itens, combinada diretamente entre as partes fora da plataforma;',
  'comprovação da entrega: o status “doado” é declarado pelo anunciante (RN-08);',
  'verificação da legitimidade jurídica de ONGs: o cadastro institucional é autodeclarado;',
  'moderação automatizada de conteúdo: a moderação é feita manualmente pelo administrador;',
  'trocas, denúncias, avaliações entre usuários, relatórios, mensagens internas e envio de imagens ou documentos (a recuperação de senha também estava fora do escopo na Visão, mas foi incluída a pedido da equipe: Anexo B e DA-09);',
  'versão web e PWA, descontinuadas em 21/11/2026 por decisão da equipe (DA-11);',
  'publicação nas lojas Google Play e App Store: o app é distribuído como APK e apresentado no emulador.',
];

export const ATORES = [
  ['Visitante', 'Pessoa sem sessão. Cria conta, realiza login, pesquisa e consulta anúncios disponíveis.'],
  ['Usuário Autenticado', 'Pessoa com conta ativa e sessão válida. Publica e gerencia os próprios anúncios, manifesta interesse em anúncios de terceiros, vê os interessados nos próprios anúncios, conclui doações e realiza logout. Especializa-se em Pessoa Física e ONG/Instituição, com as mesmas permissões; o tipo é autodeclarado no cadastro.'],
  ['Administrador', 'Usuário com papel ADMINISTRADOR. Visualiza anúncios em qualquer situação, desativa os que violam as regras e consulta, bloqueia ou desbloqueia usuários. O papel é atribuído diretamente no banco.'],
];

// UC, ator, RF, telas (apresentação), serviço e objetos do banco, situação
export const UCS = [
  ['UC-01 – Cadastrar conta', 'Visitante', 'RF-001', 'telas/Cadastro.tsx', 'autenticacao.cadastrar(); Supabase Auth signUp; criar_meu_perfil()', S.PARCIAL],
  ['UC-02 – Realizar login', 'Visitante', 'RF-002', 'telas/Entrar.tsx', 'autenticacao.entrar(); signInWithPassword; meu_perfil()', S.PARCIAL],
  ['UC-03 – Realizar logout', 'Usuário Autenticado', 'RF-002', 'telas/Conta.tsx', 'autenticacao.sair(); signOut', S.OK],
  ['UC-04 – Pesquisar anúncios', 'Visitante', 'RF-004', 'telas/Inicio.tsx, telas/Busca.tsx', 'anuncios.pesquisar(); SELECT anuncio (RLS)', S.OK],
  ['UC-05 – Consultar anúncio', 'Visitante', 'RF-005', 'telas/DetalheAnuncio.tsx', 'anuncios.obter(); SELECT anuncio + categoria + usuario; obterContato() para o dono e os interessados (DA-10)', S.OK],
  ['UC-06 – Manifestar interesse', 'Usuário Autenticado', 'RF-006', 'telas/DetalheAnuncio.tsx (FolhaInteresse)', 'interesses.manifestar(); INSERT interesse (RLS + UNIQUE); depois, SELECT anuncio_contato (telefone do doador, se informado)', S.OK],
  ['UC-07 – Publicar anúncio', 'Usuário Autenticado', 'RF-003', 'telas/anunciar/Detalhes.tsx, Local.tsx, Publicado.tsx', 'anuncios.publicar(); INSERT anuncio (RLS + CHECK); salvarContato(): INSERT anuncio_contato, opcional', S.OK],
  ['UC-08 – Gerenciar anúncio', 'Usuário Autenticado', 'RF-008', 'telas/MeusItens.tsx (FolhaGerenciar), telas/anunciar (edição)', 'anuncios.meus(), editar(), salvarContato(), desativar(); gatilho validar_anuncio()', S.OK],
  ['UC-09 – Ver interessados', 'Usuário Autenticado', 'RF-007', 'telas/Interessados.tsx', 'interesses.listarInteressados(); listar_interessados()', S.OK],
  ['UC-10 – Concluir doação', 'Usuário Autenticado', 'RF-009', 'telas/MeusItens.tsx, telas/DetalheAnuncio.tsx', 'anuncios.concluir(); UPDATE status DOADO (gatilho)', S.OK],
  ['UC-11 – Moderar anúncios', 'Administrador', 'RF-010', 'telas/Admin.tsx (Anúncios)', 'administracao.listarAnuncios(), desativarAnuncio(); admin_desativar_anuncio()', S.OK],
  ['UC-12 – Gerenciar usuários', 'Administrador', 'RF-011', 'telas/Admin.tsx (Usuários)', 'administracao.listarUsuarios(), definirSituacao(); admin_listar_usuarios(), admin_definir_situacao()', S.OK],
];

export const PACOTES = [
  ['app/src/navegacao', 'Apresentação', 'Pilha principal (native-stack), abas inferiores (Início, Meus itens, Anunciar, Conta e, para o administrador, Admin), fluxo de anúncio em dois passos e links doaaqui:// (anúncio e nova senha).'],
  ['app/src/telas', 'Apresentação', 'Uma tela por arquivo: Início, Busca, Detalhe do anúncio, Interessados, Meus itens, Conta, Admin, Entrar, Cadastro, Esqueci minha senha, Nova senha, Boas-vindas e os passos do formulário de anúncio.'],
  ['app/src/componentes', 'Apresentação', 'Componentes reutilizáveis: botões, campos, chips, selos, cards e linhas de anúncio, folhas inferiores (filtros, interesse, gerenciar, confirmar), ilustrações, estados de carregamento e erro.'],
  ['app/src/tema', 'Apresentação', 'Cores, fontes (Nunito e Plus Jakarta Sans, nos arquivos de src/assets/fonts), espaçamentos e cantos do guia de identidade visual.'],
  ['app/src/estado', 'Aplicação', 'SessaoContexto (sessão do Supabase, perfil, categorias e avisos), RascunhoContexto (formulário de anúncio) e o hook useConsulta (carregando, erro, recarregar e recarga ao voltar para a tela).'],
  ['app/src/servicos', 'Aplicação', 'Casos de uso implementados sobre o supabase-js: autenticacao (inclui troca e redefinição de senha), anuncios (inclui o telefone de contato), interesses e administracao; erros traduz as falhas para mensagens compreensíveis.'],
  ['app/src/negocio', 'Domínio no cliente', 'Tipos que espelham as tabelas, validações de conveniência (cadastro, login, nova senha, anúncio, telefone) e catálogos (UFs, rótulos e limites).'],
  ['app/src/lib e app/src/config.ts', 'Integração', 'Cliente do Supabase (sessão no AsyncStorage), preferências locais, endereço do Supabase, chave pública e link de redefinição de senha.'],
  ['app/android e app/ios', 'Plataforma nativa', 'Projetos nativos gerados pelo React Native CLI: manifesto Android (links doaaqui://, apps que podem ser abertos), ícone adaptativo, tela de abertura, fontes e configuração do Gradle.'],
  ['supabase/migrations', 'Persistência e segurança', 'Esquema, gatilho, políticas RLS, permissões por coluna e funções RPC, em cinco migrações versionadas (a quinta cria o telefone de contato).'],
  ['supabase/testes e app/__tests__', 'Verificação', 'Testes de autorização contra o banco real (node --test) e testes de unidade das regras do app (Jest).'],
];

export const TIPOS = [
  ['Anuncio', 'negocio/tipos.ts', 'Anúncio com categoria e responsável embutidos; total_interesses preenchido para o proprietário e o administrador.'],
  ['Perfil', 'negocio/tipos.ts', 'Retorno de meu_perfil(): nome, e-mail, tipo, papel e situação do usuário logado.'],
  ['Interessado', 'negocio/tipos.ts', 'Linha de listar_interessados(); e-mail nulo quando não autorizado.'],
  ['UsuarioAdmin', 'negocio/tipos.ts', 'Linha de admin_listar_usuarios().'],
  ['Categoria, Filtros, DadosAnuncio', 'negocio/tipos.ts', 'Categoria, filtros da pesquisa e dados do formulário de anúncio (com o telefone opcional).'],
  ['StatusAnuncio, TipoConta, Papel, SituacaoConta', 'negocio/tipos.ts', 'Enumerações equivalentes às restrições CHECK do banco.'],
  ['RotasRaiz, RotasAbas, RotasAnunciar', 'navegacao/tipos.ts', 'Telas do app e os parâmetros de cada uma (ex.: Anuncio recebe o id; NovaSenha recebe o link do e-mail).'],
];

export const CAMADAS = [
  ['Apresentação', 'Navegação, telas, componentes e tema (src/navegacao, src/telas, src/componentes, src/tema)', 'Celular Android (app instalado)', 'Exibe dados, coleta entradas e faz validações de conveniência. Não acessa o banco diretamente.'],
  ['Aplicação', 'Contextos, hooks e serviços (src/estado, src/servicos)', 'Celular Android (app instalado)', 'Coordena os casos de uso, mantém a sessão e traduz erros. Chama o Supabase pelo cliente supabase-js.'],
  ['Domínio no cliente', 'Tipos e regras (src/negocio)', 'Celular Android (app instalado)', 'Tipos do domínio e validações repetidas no banco.'],
  ['Backend gerenciado', 'Supabase Auth e API de dados (PostgREST)', 'Supabase (sa-east-1)', 'Autentica, emite JWT e expõe tabelas e funções por HTTPS.'],
  ['Persistência e regras', 'PostgreSQL: tabelas, restrições, RLS, gatilho e funções', 'Supabase (sa-east-1)', 'Decide o que cada papel pode ler e alterar e garante a integridade dos dados.'],
];

export const NOS = [
  ['Celular Android', `Smartphone com Android 7.0 (API 24) ou superior. Executa o app instalado pelo APK (${META.pacoteAndroid}): código nativo, JavaScript pré-compilado pelo Hermes e fontes. Guarda só a sessão e a preferência de boas-vindas.`],
  ['Computador de desenvolvimento', 'Node.js, Metro (empacotador do JavaScript, porta 8081, usado só em desenvolvimento), JDK 17, Android SDK e Gradle, que compilam o APK, e o emulador Android (DoaAqui_Pixel, Android 15), usado para testar e apresentar o app.'],
  ['Supabase (sa-east-1)', 'Serviços gerenciados Supabase Auth e PostgREST e o banco PostgreSQL 17. O projeto é compartilhado com a aplicação achado-tecnico.'],
  ['GitHub', 'Repositório prussianV/doa-aqui-app: código do app, projetos nativos, migrações, testes e documentação.'],
];

export const COMPONENTES_IMPLANTADOS = [
  ['Celular Android', `APK ${META.pacoteAndroid}: código nativo do React Native e das bibliotecas (telas nativas, SVG, área segura), pacote JavaScript em bytecode Hermes, fontes, ícone adaptativo e tela de abertura; sessão no AsyncStorage`],
  ['Computador de desenvolvimento', 'Gradle e Android SDK (geram o APK), Metro (envia o JavaScript ao app de depuração) e emulador Android com o APK instalado'],
  ['Supabase', 'Supabase Auth (auth.users), PostgREST, esquema public (tabelas e funções RPC) e esquema doaaqui_privado (funções auxiliares e gatilho)'],
  ['GitHub', 'Código-fonte, migrações SQL, testes e documentação'],
];

export const MAPA_PROCESSOS = [
  ['Exibição das telas e validação de formulários', 'Celular Android (ou emulador)'],
  ['Cadastro, login, sessão, logout e troca de senha (7.1)', 'Celular Android e Supabase Auth'],
  ['Publicação, pesquisa, consulta e gerenciamento de anúncios (7.2, 7.3, 7.5)', 'Supabase (PostgREST + PostgreSQL)'],
  ['Manifestação de interesse e lista de interessados (7.4)', 'Supabase (PostgREST + PostgreSQL)'],
  ['Moderação e gerenciamento de usuários (7.6, 7.7)', 'Supabase (funções RPC no PostgreSQL)'],
  ['Compilação e instalação do app (APK)', 'Computador de desenvolvimento (Gradle e adb)'],
];

export const DIRETORIOS = [
  ['app/src/navegacao', 'Pilha, abas, fluxo de anúncio e links doaaqui://', 'Apresentação'],
  ['app/src/telas', 'Telas do app (uma por arquivo)', 'Apresentação'],
  ['app/src/componentes', 'Componentes reutilizáveis', 'Apresentação'],
  ['app/src/tema e app/src/assets', 'Tema, fontes e imagens de origem do ícone', 'Apresentação'],
  ['app/src/estado', 'Contextos e hooks de estado', 'Aplicação'],
  ['app/src/servicos', 'Serviços que chamam o Supabase', 'Aplicação'],
  ['app/src/negocio', 'Tipos, regras e catálogos', 'Domínio no cliente'],
  ['app/src/lib, app/src/config.ts', 'Cliente do Supabase, preferências e configuração', 'Integração'],
  ['app/android, app/ios', 'Projetos nativos (Gradle e Xcode), manifesto, ícones e tela de abertura', 'Plataforma nativa'],
  ['app/__tests__', 'Testes de unidade (Jest)', 'Verificação'],
  ['app/scripts', 'Scripts de ambiente e de apresentação no emulador', 'Ferramentas'],
  ['supabase/migrations', 'Migrações SQL do banco', 'Persistência'],
  ['supabase/testes', 'Testes de autorização', 'Verificação'],
  ['docs/arquitetura', 'Este documento, diagramas (.mmd, .png, .svg) e ferramentas', 'Documentação'],
  ['design/', 'Guia de identidade visual e telas de referência', 'Documentação'],
];

export const DEPENDENCIAS = [
  ['react / react-native', '19.3.0 / 0.88.1', 'Biblioteca de interface e plataforma nativa'],
  ['@react-native-community/cli', '20.2.0', 'Criação, execução (run-android) e empacotamento do app'],
  ['@react-navigation/native, native-stack, bottom-tabs', '^7.5.2 / ^7.21.1 / ^7.22.0', 'Navegação em pilha, abas e links'],
  ['react-native-screens / react-native-safe-area-context', '~4.30.1 / ~5.11.1', 'Telas nativas e áreas seguras (entalhe e barra de navegação)'],
  ['@supabase/supabase-js', '^2.119.2', 'Cliente do Supabase Auth e da API de dados'],
  ['@react-native-async-storage/async-storage', '^2.2.0', 'Armazenamento da sessão no aparelho'],
  ['react-native-url-polyfill', '^4.0.0', 'Compatibilidade da API URL usada pelo supabase-js'],
  ['react-native-svg / lucide-react-native', '^15.16.0 / ^1.77.0', 'Ilustrações e ícones'],
  ['typescript / babel-plugin-module-resolver', '^6.0.3 / ^5.0.3', 'Verificação de tipos e atalho de importação “@/”'],
  ['jest / eslint (@react-native/eslint-config)', '^29.6.3 / ^8.19.0', 'Testes de unidade e análise estática'],
  ['Android: compileSdk / minSdk / NDK', '37 / 24 / 27.1.12297006', 'Plataforma de compilação, versão mínima do Android e compilador nativo'],
];

export const OPERACOES_API = [
  ['Supabase Auth', 'signUp, signInWithPassword, signOut, getSession', 'UC-01, UC-02, UC-03', 'Público / autenticado'],
  ['Supabase Auth (POST /auth/v1/token + PUT /auth/v1/user)', 'Trocar senha: confirma a senha atual e grava a nova (updateUser)', 'Adicional (DA-09)', 'Autenticado'],
  ['Supabase Auth (POST /auth/v1/recover)', 'Pedir link de redefinição (resetPasswordForEmail com redirectTo doaaqui://nova-senha); o link abre o app na tela Nova senha, que cria a sessão de recuperação e grava a nova senha', 'Adicional (DA-09)', 'Público (link de uso único)'],
  ['GET /rest/v1/categoria', 'Listar categorias', 'UC-04, UC-07', 'Público'],
  ['GET /rest/v1/anuncio (status=DISPONIVEL, filtros)', 'Pesquisar anúncios', 'UC-04', 'Público'],
  ['GET /rest/v1/anuncio?id=eq.{id}', 'Consultar anúncio', 'UC-05', 'Público (RLS)'],
  ['POST /rest/v1/anuncio', 'Publicar anúncio', 'UC-07', 'Autenticado e ativo'],
  ['GET /rest/v1/anuncio?usuario_id=eq.{id} + interesse(count)', 'Meus anúncios', 'UC-08', 'Proprietário'],
  ['PATCH /rest/v1/anuncio?id=eq.{id}', 'Editar, desativar ou concluir', 'UC-08, UC-10', 'Proprietário ativo'],
  ['POST /rest/v1/interesse', 'Manifestar interesse', 'UC-06', 'Autenticado e ativo'],
  ['GET /rest/v1/anuncio_contato?anuncio_id=eq.{id}', 'Ler o telefone de contato do anúncio', 'UC-05, UC-06, UC-08 (DA-10)', 'Dono, interessado ativo ou administrador (RLS)'],
  ['POST, PATCH e DELETE /rest/v1/anuncio_contato', 'Informar, trocar ou remover o telefone', 'UC-07, UC-08 (DA-10)', 'Dono com conta ativa (RLS)'],
  ['POST /rest/v1/rpc/criar_meu_perfil, meu_perfil', 'Criar e ler o perfil', 'UC-01, UC-02', 'Autenticado'],
  ['POST /rest/v1/rpc/listar_interessados', 'Ver interessados', 'UC-09', 'Proprietário ativo'],
  ['GET /rest/v1/anuncio (todas as situações)', 'Listar para moderação', 'UC-11', 'Administrador (RLS)'],
  ['POST /rest/v1/rpc/admin_desativar_anuncio', 'Desativar anúncio', 'UC-11', 'Administrador'],
  ['POST /rest/v1/rpc/admin_listar_usuarios, admin_definir_situacao', 'Consultar, bloquear e desbloquear usuários', 'UC-12', 'Administrador'],
];

export const DICIONARIO = {
  usuario: [
    ['id', 'uuid', 'PK; FK → auth.users.id (on delete cascade)'],
    ['nome', 'text', 'Obrigatório; 2 a 100 caracteres'],
    ['tipo', 'text', 'PESSOA_FISICA ou ONG (autodeclarado); padrão PESSOA_FISICA'],
    ['papel', 'text', 'USUARIO ou ADMINISTRADOR; padrão USUARIO; não legível pela API'],
    ['situacao', 'text', 'ATIVA ou BLOQUEADA (RF-011); padrão ATIVA; não legível pela API'],
    ['criado_em', 'timestamptz', 'Preenchido pelo banco'],
  ],
  categoria: [
    ['id', 'smallint', 'PK; identity'],
    ['nome', 'text', 'Obrigatório; UNIQUE'],
    ['slug', 'text', 'Obrigatório; UNIQUE; letras minúsculas (usado para ícones e ilustrações)'],
  ],
  anuncio: [
    ['id', 'bigint', 'PK; identity'],
    ['usuario_id', 'uuid', 'FK → usuario.id; padrão auth.uid(); proprietário'],
    ['categoria_id', 'smallint', 'FK → categoria.id (on delete restrict)'],
    ['titulo', 'text', 'Obrigatório; 3 a 60 caracteres'],
    ['descricao', 'text', 'Obrigatório; 10 a 500 caracteres'],
    ['cidade', 'text', 'Obrigatório; 2 a 80 caracteres (localização aproximada)'],
    ['uf', 'char(2)', 'Obrigatório; uma das 27 UFs'],
    ['status', 'text', 'DISPONIVEL, DOADO ou INATIVO; padrão DISPONIVEL (RN-06)'],
    ['inativado_por', 'text', 'PROPRIETARIO ou ADMINISTRADOR; preenchido pelo gatilho; obrigatório se INATIVO'],
    ['criado_em / atualizado_em', 'timestamptz', 'Preenchidos pelo banco e pelo gatilho'],
    ['concluido_em', 'timestamptz', 'Preenchido pelo gatilho na conclusão; obrigatório se DOADO'],
  ],
  interesse: [
    ['id', 'bigint', 'PK; identity'],
    ['anuncio_id', 'bigint', 'FK → anuncio.id (on delete cascade)'],
    ['usuario_id', 'uuid', 'FK → usuario.id; padrão auth.uid(); interessado'],
    ['autoriza_email', 'boolean', 'Obrigatório; padrão falso (RN-07)'],
    ['criado_em', 'timestamptz', 'Preenchido pelo banco'],
  ],
  anuncio_contato: [
    ['anuncio_id', 'bigint', 'PK; FK → anuncio.id (on delete cascade); no máximo um telefone por anúncio'],
    ['telefone', 'text', 'Obrigatório; só dígitos, DDD + número (10 para fixo, 11 para celular), sem +55; visível só ao doador, aos interessados e ao administrador (DA-10)'],
  ],
};

export const INTEGRIDADE = [
  'UNIQUE do e-mail em auth.users, mantido pelo Supabase Auth (RN-01).',
  'UNIQUE (interesse.anuncio_id, interesse.usuario_id): no máximo um interesse por usuário e anúncio (RN-04).',
  'CHECK de domínio para tipo, papel, situação, status, inativado_por e UF; CHECK de tamanho para nome, título, descrição e cidade.',
  'CHECK de coerência: status INATIVO exige inativado_por; status DOADO exige concluido_em.',
  'Chaves estrangeiras com on delete cascade a partir de auth.users, para que a exclusão de uma conta pelo painel do Supabase nunca seja bloqueada pelo Doa Aqui. O app não exclui anúncios: eles são desativados.',
  'anuncio_contato: chave primária anuncio_id (no máximo um telefone por anúncio), FK para anuncio com on delete cascade e CHECK de formato (DDD + número de 10 ou 11 dígitos, só dígitos).',
  'Índices: anuncio (status, categoria_id, uf) para a pesquisa pública; anuncio (usuario_id) para “meus anúncios”; interesse (usuario_id); o UNIQUE de interesse atende a busca por anúncio.',
];

export const POLITICAS = [
  ['usuario', 'SELECT', 'anon, authenticated', 'Todas as linhas, mas só as colunas id, nome, tipo e criado_em (permissão por coluna).'],
  ['categoria', 'SELECT', 'anon, authenticated', 'Todas as linhas.'],
  ['anuncio', 'SELECT', 'anon, authenticated', 'status = DISPONIVEL, ou proprietário, ou administrador.'],
  ['anuncio', 'INSERT', 'authenticated', 'usuario_id = auth.uid(), status DISPONIVEL e conta ativa; colunas permitidas: categoria, título, descrição, cidade e UF.'],
  ['anuncio', 'UPDATE', 'authenticated', 'Proprietário com conta ativa; colunas permitidas: categoria, título, descrição, cidade, UF e status. Transições validadas pelo gatilho.'],
  ['anuncio', 'DELETE', '—', 'Sem política: exclusão negada.'],
  ['interesse', 'SELECT', 'authenticated', 'Próprio interesse, interesses dos próprios anúncios ou administrador.'],
  ['interesse', 'INSERT', 'authenticated', 'usuario_id = auth.uid(), conta ativa e anuncio_aceita_interesse(): anúncio disponível e de terceiro.'],
  ['anuncio_contato', 'SELECT', 'authenticated', 'pode_ver_contato(): dono do anúncio, administrador ou quem manifestou interesse, com conta ativa e anúncio não inativado. Visitantes não têm permissão na tabela.'],
  ['anuncio_contato', 'INSERT / UPDATE / DELETE', 'authenticated', 'Dono do anúncio com conta ativa; colunas permitidas: anuncio_id e telefone (INSERT) e telefone (UPDATE).'],
];

export const FUNCOES = [
  ['public.criar_meu_perfil(nome, tipo)', 'Cria o perfil do usuário logado no primeiro acesso.', 'authenticated'],
  ['public.meu_perfil()', 'Perfil do usuário logado, com e-mail, papel e situação.', 'authenticated'],
  ['public.listar_interessados(anuncio)', 'Interessados do anúncio; só para o proprietário ativo; e-mail apenas com autorização.', 'authenticated'],
  ['public.admin_listar_usuarios()', 'Usuários com e-mail, papel, situação e número de anúncios.', 'authenticated (verifica administrador)'],
  ['public.admin_definir_situacao(usuario, situação)', 'Bloqueia ou desbloqueia; não permite alterar a própria conta.', 'authenticated (verifica administrador)'],
  ['public.admin_desativar_anuncio(anuncio)', 'Desativa um anúncio que viola as regras.', 'authenticated (verifica administrador)'],
  ['doaaqui_privado.e_admin(), conta_ativa(), anuncio_aceita_interesse()', 'Funções auxiliares usadas pelas políticas RLS; fora da API.', 'anon, authenticated (somente via políticas)'],
  ['doaaqui_privado.e_dono_do_anuncio(), pode_ver_contato()', 'Funções auxiliares das políticas de anuncio_contato; fora da API.', 'authenticated (somente via políticas)'],
  ['doaaqui_privado.validar_anuncio() + gatilho antes_de_atualizar_anuncio', 'Controla as transições de status e grava concluido_em, inativado_por e atualizado_em.', 'Executado pelo banco'],
];

export const DESEMPENHO = [
  ['Requisitos quantitativos', 'O Documento de Visão não define tempo de resposta nem volume de usuários. Não há números de capacidade comprovados.', 'Sem requisito'],
  ['Pesquisa pública', 'Filtros aplicados no banco (status, categoria, UF, cidade e texto), ordenação por data e limite de 60 resultados por consulta, com índice composto.', 'Implementado'],
  ['Digitação na busca', 'A consulta espera 350 ms sem digitação antes de ir ao servidor.', 'Implementado'],
  ['Administração', 'Lista de moderação limitada a 200 anúncios por consulta.', 'Implementado'],
  ['Abertura do app', 'No APK de release, o JavaScript vai pré-compilado em bytecode pelo Hermes e as telas usam componentes nativos (react-native-screens). Durante a restauração da sessão, o app mostra a tela de abertura na cor da marca.', 'Implementado'],
  ['Tamanho do app', 'Um APK por arquitetura: x86_64 para o emulador (npm run apk) e arm64-v8a para celulares atuais (npm run apk:celular); arquiteturas de 32 bits foram retiradas para reduzir o tamanho e o tempo de build.', 'Implementado'],
  ['Latência', 'Banco em sa-east-1 (São Paulo). Não houve medição de tempo de resposta.', 'Pendente de validação'],
  ['Meta de verificação sugerida', 'Pesquisa e consulta em até 3 s em rede 4G, medidas num celular real.', 'Objetivo, não resultado'],
  ['Limites do plano gratuito', 'O Supabase gratuito tem cotas de banco, requisições e e-mails. Os valores atuais não foram consultados neste documento.', 'Pendente de validação'],
];

export const QUALIDADE = [
  ['Segurança', 'Supabase Auth com hash de senha e JWT; RLS, permissões por coluna e funções que verificam papel e propriedade; HTTPS; o app só tem a chave pública do Supabase.', '38 testes de autorização aprovados; avisos do Security Advisor do Supabase revisados.', 'RNF-002, RNF-003'],
  ['Confiabilidade e integridade', 'Restrições CHECK, UNIQUE e FK; gatilho de transições; dados lidos sempre do banco.', 'Testes aprovados: anúncio doado não é editado nem reativado; não há exclusão física.', 'RNF-004'],
  ['Usabilidade', 'Interface mobile-first com a identidade visual do projeto, mensagens compreensíveis, confirmações antes de ações sem volta.', 'Fluxos de visitante e autenticados executados no emulador Android (Anexo D).', 'RNF-001, RNF-005'],
  ['Manutenibilidade', 'Código separado em navegação, telas, aplicação, domínio no cliente e integração; migrações SQL versionadas.', 'npm run typecheck e npm run lint sem erros; 14 testes de unidade (Jest) aprovados.', '—'],
  ['Portabilidade', 'Um código React Native para Android e iOS.', 'Android compilado e verificado no emulador; iOS não compilado (requer macOS).', 'RNF-006'],
  ['Compatibilidade', 'Android 7.0 (API 24) ou superior; HTTPS/JSON com o Supabase.', 'Verificado no Android 15 (emulador); celular real pendente (P-07).', 'RNF-001'],
  ['Eficiência de desempenho', 'Filtros e limites no banco, índices, Hermes e telas nativas.', 'Sem medição de tempo (seção 11).', '—'],
  ['Privacidade (coleta mínima)', 'Só nome e e-mail obrigatórios; e-mail do interessado apenas com autorização; telefone do doador opcional e só para interessados.', 'Conferido no esquema, na função listar_interessados() e nos testes de anuncio_contato.', 'RNF-007'],
];

export const PRATICAS = [
  ['Backend as a Service', 'Reduzir infraestrutura própria e concentrar o esforço no produto do MVP.'],
  ['Autorização no banco (RLS)', 'Garantir as regras mesmo que alguém chame a API sem usar o app.'],
  ['Camadas lógicas no cliente', 'Telas sem acesso direto ao banco; serviços concentram as chamadas ao Supabase.'],
  ['Aplicativo nativo (React Native CLI)', 'Uso no celular com recursos do sistema: ícone, tela de abertura, links doaaqui://, discador e WhatsApp.'],
  ['Migrações versionadas', 'Reproduzir o banco em outro projeto Supabase com os mesmos scripts.'],
  ['Testes automatizados', 'Regras do app (Jest) e autorização no banco real (node --test) verificadas a cada mudança.'],
  ['Commits pequenos (Conventional Commits)', 'Histórico claro no GitHub para acompanhamento e avaliação.'],
  ['UML (notação adaptada em Mermaid)', 'Diagramas versionados junto ao código.'],
];

// Anexo A
export const MATRIZ = [
  ['RF-001', 'Cadastrar conta', 'UC-01', 'Cadastro.tsx', 'servicos/autenticacao', 'auth.users, usuario', S.PARCIAL],
  ['RF-002', 'Autenticar usuário', 'UC-02, UC-03', 'Entrar.tsx, Conta.tsx', 'servicos/autenticacao', 'auth.users, usuario', S.PARCIAL],
  ['RF-003', 'Publicar anúncio', 'UC-07', 'anunciar/*', 'servicos/anuncios', 'anuncio, categoria', S.OK],
  ['RF-004', 'Pesquisar anúncios', 'UC-04', 'Inicio.tsx, Busca.tsx', 'servicos/anuncios', 'anuncio, categoria', S.OK],
  ['RF-005', 'Consultar anúncio', 'UC-05', 'DetalheAnuncio.tsx', 'servicos/anuncios', 'anuncio, categoria, usuario', S.OK],
  ['RF-006', 'Manifestar interesse', 'UC-06', 'DetalheAnuncio.tsx', 'servicos/interesses', 'interesse', S.OK],
  ['RF-007', 'Ver interessados', 'UC-09', 'Interessados.tsx', 'servicos/interesses', 'interesse, usuario, auth.users', S.OK],
  ['RF-008', 'Gerenciar anúncio', 'UC-08', 'MeusItens.tsx, anunciar/*', 'servicos/anuncios', 'anuncio', S.OK],
  ['RF-009', 'Concluir doação', 'UC-10', 'MeusItens.tsx, DetalheAnuncio.tsx', 'servicos/anuncios', 'anuncio', S.OK],
  ['RF-010', 'Moderação de anúncios', 'UC-11', 'Admin.tsx', 'servicos/administracao', 'anuncio', S.OK],
  ['RF-011', 'Gerenciamento de usuários', 'UC-12', 'Admin.tsx', 'servicos/administracao', 'usuario, auth.users', S.OK],
  ['Adicional (DA-09)', 'Trocar e redefinir senha', '—', 'Conta.tsx, RecuperarSenha.tsx, NovaSenha.tsx', 'servicos/autenticacao', 'auth.users', S.PARCIAL],
  ['Adicional (DA-10)', 'Telefone de contato do anúncio', 'UC-05 a UC-08', 'anunciar/Local.tsx, DetalheAnuncio.tsx', 'servicos/anuncios', 'anuncio_contato', S.OK],
];

// Anexo B
export const DIVERGENCIAS = [
  ['Numeração dos RFs', 'Documento de Visão atualizado', 'A Visão pula o RF-009 e vai até RF-012; os Casos de Uso e o DA 3.0 usam RF-001 a RF-011.', 'Adotado RF-001 a RF-011 neste documento. Renumerar a Visão: RF-010→RF-009, RF-011→RF-010, RF-012→RF-011.'],
  ['Rótulos das regras de negócio', 'Documento de Visão atualizado', 'A tabela de regras usa os identificadores RNF-001 a RNF-008, embora o texto comece com “RN-01”.', 'Usar RN-01 a RN-08 na Visão, como feito aqui.'],
  ['Trocas em “Alternativas e Competição”', 'Documento de Visão atualizado', 'O texto ainda cita trocas, fora do escopo.', 'Remover a menção a trocas na Visão.'],
  ['Banco MySQL, API REST própria, controllers e repositórios', 'DA 3.0', 'Não existem na implementação; o backend é o Supabase.', 'Substituído nesta versão pelas seções 3, 6 a 10.'],
  ['MER conceitual', 'MER_Conceitual.png', 'O arquivo é de outro sistema (cliente, conta, transação, parcela).', 'Descartado; usar o DER da seção 10.'],
  ['MER lógico', 'MER_Logico.png', 'Relações 1:N modeladas com tabelas associativas (publica, classifica, recebe, registra) que repetem FKs; campo imagem_anuncio; faltam consentimento de e-mail, papel e situação.', 'Substituído pelo DER da seção 10.'],
  ['Fotos dos anúncios', 'MER lógico × Visão (RF-003)', 'O MER prevê imagem; a Visão não.', 'Seguida a Visão: sem fotos; o app mostra a ilustração da categoria.'],
  ['Localização', 'MVP anterior (código)', 'O código anterior usava bairro e distância.', 'Corrigido para cidade/UF.'],
  ['Trocas, dados no aparelho e perfil com telefone', 'MVP anterior (código)', 'O código anterior guardava tudo no AsyncStorage, tinha trocas e telefone.', 'Corrigido: Supabase, só doações, coleta mínima.'],
  ['Projeto Supabase', 'Arquitetura planejada × ambiente', 'O banco está num projeto compartilhado (achado-tecnico), não num projeto dedicado.', 'Migrar para projeto próprio quando possível (Anexo E).'],
  ['Recuperação e troca de senha', 'Documento de Visão × implementação', 'A Visão deixa a recuperação de senha fora do MVP. Em 20/11/2026 a equipe pediu a troca de senha na conta e o “Esqueci minha senha” no login.', 'Implementado como funcionalidade adicional, sem RF próprio (DA-09). Registrar na Visão um novo RF ou retirar o item da lista de fora do escopo.'],
  ['Telefone de contato', 'Documento de Visão (RNF-007) × implementação', 'A Visão limita a coleta a nome e e-mail, e o telefone do perfil do código anterior foi removido nesta reformulação. Em 20/11/2026 a equipe pediu um telefone para o interessado falar com o doador.', 'Implementado como opcional, por anúncio, visível só ao doador, a quem manifestou interesse e ao administrador (DA-10). Registrar no RNF-007 e no UC-06 da Visão e dos Casos de Uso (P-14).'],
  ['Versão web e PWA (RNF-006)', 'Documento de Visão × implementação', 'A Visão pede um PWA com manifesto, ícones e instalação. Em 21/11/2026 a equipe decidiu descontinuar a versão web e manter somente o aplicativo React Native.', 'Instalação como app nativo Android (APK), com ícone e tela de abertura (DA-11). Atualizar o RNF-006 na Visão (P-15).'],
  ['Largura de desktop (RNF-001)', 'Documento de Visão × implementação', 'A Visão pede funcionamento em desktop de 1280 px; sem versão web, o app roda só em celulares.', 'Verificar em telas de 360 dp e num celular real (P-07); atualizar o RNF-001 na Visão (P-15).'],
  ['PlantUML / Draw.io', 'Pedido de entrega dos diagramas', 'O download do PlantUML foi bloqueado na máquina de desenvolvimento.', 'Diagramas em Mermaid (.mmd), importáveis no Draw.io.'],
];

// Anexo C
export const DECISOES = [
  ['DA-01', 'Usar Supabase (BaaS) em vez de servidor próprio', 'Prazo e tamanho de um MVP acadêmico; autenticação e banco gerenciados.', 'Dependência do fornecedor; regras escritas em SQL.'],
  ['DA-02', 'Autorização por RLS, permissões por coluna e funções SECURITY DEFINER', 'RNF-003 exige validação no backend; sem servidor, o banco é o backend.', 'Funções expostas na API geram avisos do Security Advisor, aceitos e documentados.'],
  ['DA-03', 'Perfil criado pela função criar_meu_perfil() em vez de gatilho em auth.users', 'O projeto é compartilhado; um gatilho global afetaria os cadastros da outra aplicação.', 'O app precisa chamar a função no primeiro acesso.'],
  ['DA-04', 'React Native CLI, sem Expo', 'A equipe pediu um app somente React Native, aberto no Android Studio e executado no emulador, com os projetos nativos versionados.', 'O build exige Android SDK, JDK 17, NDK e Gradle; navegação com React Navigation; iOS só com macOS.'],
  ['DA-05', 'Distribuição por APK e apresentação no emulador Android', 'A publicação nas lojas está fora do escopo; o APK de release leva o JavaScript pré-compilado e funciona sem o computador.', 'Sem atualização automática: cada versão gera um novo APK; chave de assinatura própria pendente (P-16).'],
  ['DA-06', 'Sem fotos no MVP', 'RF-003 da Visão não prevê imagens; evita armazenamento de arquivos.', 'Ilustração por categoria no lugar de foto.'],
  ['DA-07', 'Sem exclusão física de anúncios', 'Histórico de doações e coerência dos interesses.', 'Anúncios inativos permanecem no banco.'],
  ['DA-08', 'Diagramas em Mermaid', 'Texto versionado; renderização local; PlantUML indisponível.', 'Notação UML aproximada.'],
  ['DA-09', 'Troca e redefinição de senha pelo próprio Supabase Auth', 'Pedido da equipe; o Auth já oferece updateUser e resetPasswordForEmail, sem tabela nova, servidor ou alteração no banco.', 'A troca na conta confirma a senha atual com um novo login antes de gravar. O link de redefinição (doaaqui://nova-senha) depende do envio de e-mails e da lista de URLs de redirecionamento do projeto compartilhado (P-02, P-13).'],
  ['DA-10', 'Telefone de contato opcional numa tabela separada (anuncio_contato) protegida por RLS', 'Pedido da equipe. A tabela anuncio é pública; com o telefone separado, o RLS esconde o número de visitantes e de quem não manifestou interesse sem mudar as permissões de anuncio.', 'Publicar ou editar com telefone faz duas gravações (anúncio e contato); se a segunda falhar, o app avisa e o doador edita de novo. O número some para interessados bloqueados ou quando o anúncio é desativado.'],
  ['DA-11', 'Descontinuar a versão web/PWA e manter só o aplicativo React Native', 'Decisão da equipe em 21/11/2026: o Doa Aqui é apresentado e avaliado como aplicativo de celular.', 'O RNF-006 passa a ser atendido pela instalação do app nativo e o RNF-001 deixa de cobrir desktop (P-15); a hospedagem web foi encerrada e o código anterior ficou arquivado.'],
];

// Anexo D
export const EVIDENCIAS = [
  ['20/11/2026', 'Migrações aplicadas no Supabase', 'Quatro migrações aplicadas sem erro.'],
  ['20/11/2026', 'Security Advisor do Supabase', 'Apenas avisos esperados de funções SECURITY DEFINER executáveis por usuários logados (cada função verifica o chamador) e avisos que já existiam no projeto achado-tecnico.'],
  ['20/11/2026', 'Leitura anônima de categorias pela API', '5 categorias retornadas.'],
  ['20/11/2026', 'Cadastro pela API do Supabase Auth (sondagem)', 'Conta criada sem sessão e e-mail de confirmação enviado: a confirmação de e-mail está ligada no projeto. Novos cadastros esbarraram no limite de envio de e-mails por hora.'],
  ['20/11/2026', 'Contas de teste', 'Três contas confirmadas (administrador, doador e interessado) criadas no banco com autorização da equipe, com hash bcrypt e sem envio de e-mail; perfis criados por criar_meu_perfil() no primeiro login.'],
  ['20/11/2026', 'Integridade: migrações do repositório x banco aplicado', 'As funções têm o mesmo código (hash idêntico); restrições, índices, RLS e permissões por tabela, coluna e função conferem com as migrações. Nomes dos arquivos alinhados às versões registradas no Supabase.'],
  ['20/11/2026', 'Integridade dos dados', 'Nenhum interesse em anúncio do próprio usuário, nenhum perfil sem conta, datas coerentes e as 5 categorias corretas. Objetos do achado-tecnico (tabelas admins e produtos, funções, gatilho e políticas) inalterados.'],
  ['20/11/2026', 'Troca de senha pela API (conta de teste interessado)', 'Troca para senha temporária aceita; senha antiga recusada; login com a nova aceito; mesma senha recusada (same_password); senha original restaurada e login com ela aceito.'],
  ['20/11/2026', 'Contas de teste renomeadas', 'E-mails trocados para bianca@, vitor@ e alfred@doaaqui.com.br (administradora, doador e interessado) direto no Supabase Auth, mantendo senhas e perfis. O domínio não tem servidor de e-mail.'],
  ['21/11/2026', 'Migração doaaqui_contato_anuncio aplicada', 'Tabela anuncio_contato, duas funções auxiliares, permissões por coluna e quatro políticas; Security Advisor sem avisos novos.'],
  ['21/11/2026', 'Suíte de autorização (node --test supabase/testes/)', '38 de 38 testes aprovados: conta e perfil, publicação e pesquisa, interesse e interessados, gerenciar e concluir, administração e telefone de contato (doador informa, troca e remove; formato inválido recusado; visitante sem acesso; só quem manifestou interesse vê; bloqueado e anúncio desativado escondem o número).'],
  ['21/11/2026', 'Verificação de tipos e análise estática do app (npm run typecheck, npm run lint)', 'Sem erros, depois de corrigir dois componentes definidos durante a renderização apontados pelo lint.'],
  ['21/11/2026', 'Testes de unidade do app (npm test, Jest)', '14 de 14 testes aprovados: cadastro e login, troca de senha, anúncio, telefone (validação, máscara, link do WhatsApp), regras de interesse e apresentação.'],
  ['21/11/2026', 'Build Android de depuração (Gradle, x86_64)', 'Concluído em 12 min 9 s neste computador (Core i3-4005U, 8 GB de RAM); APK de depuração com 53,7 MB.'],
  ['21/11/2026', 'Fluxos no emulador Android 15 (Pixel 6, APK de depuração com Metro, contas de teste)', 'Visitante: boas-vindas, Início com categorias e anúncios do banco, busca, detalhe aberto pelo link doaaqui://anuncio, convite para entrar, Esqueci minha senha e aba Conta. Link doaaqui://nova-senha expirado mostra “Link inválido”. Doador: publicação em dois passos com validação e máscara do telefone, confirmação, detalhe com “Seu telefone neste anúncio” e Meus anúncios. Interessado: telefone oculto antes do interesse; depois de confirmar, “Contato de quem anunciou” com Ligar e WhatsApp. Administradora: aba Admin com moderação e lista de usuários; Trocar senha com validações. Anúncio [TESTE] desativado ao final.'],
  ['21/11/2026', 'Build Android de release (APK de apresentação)', 'Concluído em 6 min 34 s para x86_64, com o emulador fechado; APK de 29,1 MB. Instalado no emulador: ícone “Doa Aqui” na lista de apps, abertura em 1,8 s (TotalTime do Android) e boas-vindas exibidas sem o Metro. Uma tentativa anterior, compilando duas arquiteturas com o emulador aberto, esgotou a memória do computador.'],
  ['—', 'E-mail real de redefinição de senha', 'Não executado: depende da cota de e-mails do projeto compartilhado e da lista de URLs de redirecionamento (P-02, P-13).'],
  ['—', 'Login e cadastro digitados na tela', 'Não executados com credenciais pela automação; o login foi verificado pela API e a sessão das contas de teste foi colocada no armazenamento do app.'],
];

// Anexo E
export const PENDENCIAS = [
  ['P-01', 'Definir a conta administradora real do Doa Aqui (papel ADMINISTRADOR atribuído no banco).', 'Equipe', 'Alta'],
  ['P-02', 'Confirmação de e-mail e limite de envio do projeto Supabase compartilhado: decidir entre projeto dedicado, servidor de e-mail próprio (SMTP) ou desligar a confirmação, avaliando o impacto no achado-tecnico.', 'Equipe', 'Alta'],
  ['P-03', 'Executar cadastro e login digitados na tela com uma conta real, depois de resolver P-02.', 'Equipe', 'Alta'],
  ['P-04', 'Ajustar a URL de redirecionamento dos e-mails de confirmação (hoje é a do achado-tecnico).', 'Equipe', 'Média'],
  ['P-05', 'Migrar o banco para um projeto Supabase dedicado ao Doa Aqui usando as migrações versionadas.', 'Equipe', 'Média'],
  ['P-06', 'Corrigir a numeração dos RFs, os rótulos das regras e a menção a trocas no Documento de Visão (Anexo B).', 'Equipe', 'Média'],
  ['P-07', 'Verificar o RNF-001 em telas pequenas (360 dp) e num celular Android real.', 'Equipe', 'Média'],
  ['P-08', 'Medir o tempo de resposta da pesquisa e da consulta num celular real em rede 4G (seção 11).', 'Equipe', 'Baixa'],
  ['P-09', 'Antes da entrega final, remover as contas de teste (bianca@, vitor@ e alfred@doaaqui.com.br), a conta de sondagem (doaaqui.sonda.*) e os anúncios [TESTE], se a equipe preferir um banco limpo.', 'Equipe', 'Baixa'],
  ['P-10', 'Ativar a proteção contra senhas vazadas do Supabase Auth (aviso do Security Advisor, configuração compartilhada).', 'Equipe', 'Baixa'],
  ['P-11', 'Compilar e testar a versão iOS num Mac com Xcode, se a disciplina exigir.', 'Equipe', 'Baixa'],
  ['P-12', 'Avaliar os avisos informativos de desempenho do Supabase: índice próprio para anuncio.categoria_id e uso do índice interesse_usuario_idx com dados reais.', 'Equipe', 'Baixa'],
  ['P-13', 'Incluir doaaqui://nova-senha em Authentication → URL Configuration → Redirect URLs do Supabase, sem remover as do achado-tecnico. Sem isso, o link de redefinição abre a URL padrão do projeto (a do achado-tecnico). Depois, testar um e-mail real de redefinição.', 'Equipe', 'Alta'],
  ['P-14', 'Registrar na Visão e nos Casos de Uso as funcionalidades adicionais: troca e redefinição de senha (DA-09) e telefone de contato do anúncio (DA-10), ajustando o RNF-007 e o UC-06.', 'Equipe', 'Média'],
  ['P-15', 'Atualizar no Documento de Visão o RNF-006 (instalação como app nativo, sem PWA) e o RNF-001 (sem desktop), conforme a decisão DA-11.', 'Equipe', 'Média'],
  ['P-16', 'Gerar o APK de distribuição com uma chave de assinatura própria (hoje é usada a chave de depuração do projeto), se o app for distribuído além da apresentação.', 'Equipe', 'Baixa'],
];

// Anexo F
export const MUDANCAS_30 = [
  ['Backend', 'API REST própria em servidor de aplicação', 'Supabase: Auth, PostgREST e funções no PostgreSQL'],
  ['Banco de dados', 'MySQL', 'PostgreSQL 17 com RLS'],
  ['Autorização', 'Filtro de segurança e serviços no servidor', 'Políticas RLS, permissões por coluna, gatilho e funções'],
  ['Autenticação', 'JWT emitido pela API', 'Supabase Auth (JWT e hash de senha gerenciados)'],
  ['Interface', 'HTML, CSS e JavaScript, com instalação como PWA', 'Aplicativo nativo em React Native CLI (Android e iOS) com React Navigation; sem versão web (DA-11)'],
  ['Implantação', 'Servidor de aplicação e servidor de banco; XAMPP', 'App instalado no celular ou no emulador (APK) e Supabase (backend gerenciado)'],
  ['Visão de implementação', 'frontend/ e backend/', 'app/ (com android/ e ios/), supabase/, docs/ e design/'],
  ['Evidências', 'Não havia', 'Anexo D com testes executados e pendentes'],
];

export const REFERENCIAS = [
  'DOA AQUI. Documento de Visão – Doa Aqui. Versão atualizada. Documento interno do projeto.',
  'DOA AQUI. Casos de Uso – Doa Aqui. Documento interno do projeto.',
  'ISO/IEC. ISO/IEC 25010:2011 – Systems and software engineering — Systems and software Quality Requirements and Evaluation (SQuaRE) — System and software quality models. Geneva: International Organization for Standardization, 2011.',
  'FOWLER, Martin. Patterns of Enterprise Application Architecture. Boston: Addison-Wesley, 2002.',
  'LARMAN, Craig. Utilizando UML e Padrões: uma introdução à análise e ao projeto orientados a objetos e ao desenvolvimento iterativo. 3. ed. Porto Alegre: Bookman, 2007.',
  'OMG – Object Management Group. Unified Modeling Language (UML) Specification. Disponível em: https://www.omg.org/spec/UML/. Acesso em: 13 maio 2026.',
  'JONES, M.; BRADLEY, J.; SAKIMURA, N. RFC 7519: JSON Web Token (JWT). IETF, 2015. Disponível em: https://www.rfc-editor.org/rfc/rfc7519. Acesso em: 20 nov. 2026.',
  'OWASP. Password Storage Cheat Sheet. Disponível em: https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html. Acesso em: 20 nov. 2026.',
  'META PLATFORMS. React Native Documentation. Disponível em: https://reactnative.dev/docs/getting-started. Acesso em: 21 nov. 2026.',
  'META PLATFORMS. React Native: Set Up Your Environment. Disponível em: https://reactnative.dev/docs/set-up-your-environment. Acesso em: 21 nov. 2026.',
  'META PLATFORMS. Hermes. Disponível em: https://reactnative.dev/docs/hermes. Acesso em: 21 nov. 2026.',
  'REACT NAVIGATION. React Navigation 7 Documentation. Disponível em: https://reactnavigation.org/docs/getting-started. Acesso em: 21 nov. 2026.',
  'GOOGLE. Android Developers: Run apps on the Android Emulator. Disponível em: https://developer.android.com/studio/run/emulator. Acesso em: 21 nov. 2026.',
  'GOOGLE. Android Developers: Splash screens. Disponível em: https://developer.android.com/develop/ui/views/launch/splash-screen. Acesso em: 21 nov. 2026.',
  'SUPABASE. Supabase Documentation. Disponível em: https://supabase.com/docs. Acesso em: 20 nov. 2026.',
  'SUPABASE. Row Level Security. Disponível em: https://supabase.com/docs/guides/database/postgres/row-level-security. Acesso em: 20 nov. 2026.',
  'SUPABASE. Auth. Disponível em: https://supabase.com/docs/guides/auth. Acesso em: 20 nov. 2026.',
  'THE POSTGRESQL GLOBAL DEVELOPMENT GROUP. PostgreSQL 17 Documentation. Disponível em: https://www.postgresql.org/docs/17/. Acesso em: 20 nov. 2026.',
  'OPENJS FOUNDATION. Jest Documentation. Disponível em: https://jestjs.io/docs/getting-started. Acesso em: 21 nov. 2026.',
  'MICROSOFT. TypeScript Documentation. Disponível em: https://www.typescriptlang.org/docs/. Acesso em: 20 nov. 2026.',
  'MERMAID. Mermaid Documentation. Disponível em: https://mermaid.js.org/. Acesso em: 20 nov. 2026.',
  'GITHUB. GitHub Docs. Disponível em: https://docs.github.com/. Acesso em: 13 maio 2026.',
];
