# Relatório de auditoria e correções · Doa Aqui (DA 3.2)

Data: 21/11/2026. Base: Documento de Visão atualizado, Casos de Uso (UC-01 a UC-12), DA 3.0, MER lógico e o código do repositório (app React Native e migrações do Supabase).

## Resumo

- O Doa Aqui é um aplicativo nativo em React Native (React Native CLI), executado no Android e preparado para iOS. A versão web e o PWA foram descontinuados por decisão da equipe em 21/11/2026 (DA-11); o RNF-006 da Visão passa a ser atendido pela instalação do app nativo e precisa ser atualizado na Visão (P-15).
- O DA 3.0 descrevia MySQL, API REST própria, controllers, repositórios, JWT emitido por servidor e XAMPP. Nada disso existe no projeto: o backend é o Supabase (Auth, PostgREST e PostgreSQL com RLS, gatilho e funções).
- O app foi refeito com React Navigation (pilha, abas e links doaaqui://), projetos android/ e ios/, ícone adaptativo e tela de abertura nativos, mantendo todas as funcionalidades e a identidade visual: cadastro e login, pesquisa por categoria e cidade/UF, interesse com consentimento de e-mail, telefone de contato para quem manifestou interesse, lista de interessados, conclusão e desativação, moderação, bloqueio de usuários e troca e redefinição de senha.
- O banco está no projeto Supabase compartilhado achado-tecnico, sem alterar os objetos existentes (sem gatilho em auth.users e com funções internas no esquema doaaqui_privado).
- Os 38 testes de autorização passaram contra o banco real e os 14 testes de unidade do app passaram. Cadastro e login digitados na tela ainda dependem da decisão sobre a confirmação de e-mail (P-02 e P-03).
- Troca e redefinição de senha (DA-09) e telefone de contato (DA-10) são funcionalidades adicionais pedidas pela equipe e precisam ser registradas na Visão (P-14). O e-mail real de redefinição depende de P-02 e P-13.

## Tecnologias confirmadas no código

| Tecnologia | Por que foi adotada | Limitação |
| --- | --- | --- |
| React Native 0.88 (CLI) | App nativo com uma base de código para Android e iOS; atende a disciplina de Desenvolvimento Mobile. Projetos android/ e ios/ abertos no Android Studio e no Xcode. | O build nativo exige Android SDK, JDK e NDK; o primeiro build é demorado em computadores modestos. |
| React Navigation 7 | Pilha nativa (native-stack), abas inferiores e links doaaqui:// com rotas e parâmetros tipados. | As rotas são declaradas no código (src/navegacao), não por arquivos. |
| TypeScript 6 | Tipos verificados em tempo de compilação (npm run typecheck) e tipos que espelham as tabelas. | Os tipos do banco são mantidos à mão; não há geração automática. |
| Hermes | Motor JavaScript do React Native: no APK de release o código vai pré-compilado em bytecode, o que acelera a abertura. | Depuração diferente da de um navegador. |
| Android SDK, Gradle e emulador | Compilação do APK e execução do app no computador para desenvolvimento e apresentação. | O emulador exige virtualização (KVM) e cerca de 2 GB de RAM. |
| Supabase Auth | Cadastro, login, sessão, hash de senha, troca e redefinição de senha sem servidor próprio (RF-001, RF-002, RNF-002). | Configuração de e-mail compartilhada com o projeto achado-tecnico (Anexo E). |
| PostgreSQL + RLS (Supabase) | Persistência real, integridade por restrições e autorização aplicada no próprio banco (RNF-003, RNF-004). | Regras em SQL exigem conhecimento de políticas RLS e testes específicos; dependência do fornecedor. |
| AsyncStorage | Guarda a sessão do Supabase e a preferência de boas-vindas no aparelho (RNF-004). | Não guarda dados de negócio: sem internet, as listas não carregam. |
| Jest e node:test | Testes de unidade das regras do app (Jest) e testes de autorização contra o banco real (node --test). | Não há testes automatizados de interface; as telas foram verificadas no emulador. |
| Mermaid | Diagramas em texto, versionados junto ao código e importáveis no Draw.io. | Notação UML aproximada em casos de uso, componentes e implantação. |

## Divergências e correções

| Item | Origem | Divergência | Correção |
| --- | --- | --- | --- |
| Numeração dos RFs | Documento de Visão atualizado | A Visão pula o RF-009 e vai até RF-012; os Casos de Uso e o DA 3.0 usam RF-001 a RF-011. | Adotado RF-001 a RF-011 neste documento. Renumerar a Visão: RF-010→RF-009, RF-011→RF-010, RF-012→RF-011. |
| Rótulos das regras de negócio | Documento de Visão atualizado | A tabela de regras usa os identificadores RNF-001 a RNF-008, embora o texto comece com “RN-01”. | Usar RN-01 a RN-08 na Visão, como feito aqui. |
| Trocas em “Alternativas e Competição” | Documento de Visão atualizado | O texto ainda cita trocas, fora do escopo. | Remover a menção a trocas na Visão. |
| Banco MySQL, API REST própria, controllers e repositórios | DA 3.0 | Não existem na implementação; o backend é o Supabase. | Substituído nesta versão pelas seções 3, 6 a 10. |
| MER conceitual | MER_Conceitual.png | O arquivo é de outro sistema (cliente, conta, transação, parcela). | Descartado; usar o DER da seção 10. |
| MER lógico | MER_Logico.png | Relações 1:N modeladas com tabelas associativas (publica, classifica, recebe, registra) que repetem FKs; campo imagem_anuncio; faltam consentimento de e-mail, papel e situação. | Substituído pelo DER da seção 10. |
| Fotos dos anúncios | MER lógico × Visão (RF-003) | O MER prevê imagem; a Visão não. | Seguida a Visão: sem fotos; o app mostra a ilustração da categoria. |
| Localização | MVP anterior (código) | O código anterior usava bairro e distância. | Corrigido para cidade/UF. |
| Trocas, dados no aparelho e perfil com telefone | MVP anterior (código) | O código anterior guardava tudo no AsyncStorage, tinha trocas e telefone. | Corrigido: Supabase, só doações, coleta mínima. |
| Projeto Supabase | Arquitetura planejada × ambiente | O banco está num projeto compartilhado (achado-tecnico), não num projeto dedicado. | Migrar para projeto próprio quando possível (Anexo E). |
| Recuperação e troca de senha | Documento de Visão × implementação | A Visão deixa a recuperação de senha fora do MVP. Em 20/11/2026 a equipe pediu a troca de senha na conta e o “Esqueci minha senha” no login. | Implementado como funcionalidade adicional, sem RF próprio (DA-09). Registrar na Visão um novo RF ou retirar o item da lista de fora do escopo. |
| Telefone de contato | Documento de Visão (RNF-007) × implementação | A Visão limita a coleta a nome e e-mail, e o telefone do perfil do código anterior foi removido nesta reformulação. Em 20/11/2026 a equipe pediu um telefone para o interessado falar com o doador. | Implementado como opcional, por anúncio, visível só ao doador, a quem manifestou interesse e ao administrador (DA-10). Registrar no RNF-007 e no UC-06 da Visão e dos Casos de Uso (P-14). |
| Versão web e PWA (RNF-006) | Documento de Visão × implementação | A Visão pede um PWA com manifesto, ícones e instalação. Em 21/11/2026 a equipe decidiu descontinuar a versão web e manter somente o aplicativo React Native. | Instalação como app nativo Android (APK), com ícone e tela de abertura (DA-11). Atualizar o RNF-006 na Visão (P-15). |
| Largura de desktop (RNF-001) | Documento de Visão × implementação | A Visão pede funcionamento em desktop de 1280 px; sem versão web, o app roda só em celulares. | Verificar em telas de 360 dp e num celular real (P-07); atualizar o RNF-001 na Visão (P-15). |
| PlantUML / Draw.io | Pedido de entrega dos diagramas | O download do PlantUML foi bloqueado na máquina de desenvolvimento. | Diagramas em Mermaid (.mmd), importáveis no Draw.io. |

## Situação dos requisitos não funcionais

| ID | Requisito | Decisão | Verificação | Situação |
| --- | --- | --- | --- | --- |
| RNF-001 | Interface funcional e sem rolagem horizontal indevida em largura móvel de 360 px e desktop de 1280 px. | Interface mobile-first em React Native, com layouts flexíveis (flexbox), áreas seguras e orientação retrato. Sem versão web, a largura de desktop deixa de se aplicar (DA-11). | Fluxos executados no emulador Android (Pixel 6, 411 dp de largura) sem rolagem horizontal. A largura de 360 dp e um celular real ainda não foram verificados (P-07). | Parcialmente verificado |
| RNF-002 | Senhas nunca armazenadas em texto puro e nunca retornadas pela API; autenticação protegida. | Senhas tratadas apenas pelo Supabase Auth, que guarda o hash e emite JWT. O app nunca lê a senha armazenada; as funções do banco não retornam campos de senha. Comunicação somente em HTTPS. | Testes aprovados: meu_perfil() devolve apenas id, nome, e-mail, tipo, papel, situação e data; visitante não executa a função (Anexo D). | Implementado e verificado |
| RNF-003 | Backend valida identidade e propriedade antes de criar, editar, desativar ou concluir anúncio. | Sem servidor próprio: a validação acontece no PostgreSQL. Políticas RLS comparam usuario_id com auth.uid(); o gatilho validar_anuncio() controla as transições; funções administrativas conferem o papel. | 38 testes de autorização aprovados contra o banco real, incluindo propriedade, transições, interesse, telefone de contato, moderação e bloqueio (Anexo D). | Implementado e verificado |
| RNF-004 | Dados persistem após atualização da página e reinicialização do cliente; consultas leem dados do banco real. | Dados de negócio somente no PostgreSQL do Supabase. O aparelho guarda apenas a sessão (token, no AsyncStorage) e a preferência de boas-vindas; ao fechar e reabrir o app, a sessão é restaurada e os dados são lidos de novo do banco. | Categorias, anúncios e perfil lidos do banco real no app em execução no emulador (Anexo D). | Implementado e verificado |
| RNF-005 | Campos inválidos e falhas de rede apresentam mensagens compreensíveis ao usuário. | Validação no cliente (negocio/regras.ts) e tradução de erros do Supabase e do PostgreSQL (servicos/erros.ts); telas com estados de carregamento, erro e “Tentar de novo”. | 14 testes de unidade das validações (Jest); mensagens conferidas nas telas do emulador. Falhas de rede não foram simuladas. | Parcialmente verificado |
| RNF-006 | PWA fornece manifesto/ícones e instalação quando compatível; conectividade online exigida para funções de servidor. | Por decisão da equipe (DA-11), a instalação é feita como aplicativo nativo Android (APK), com ícone adaptativo, nome “Doa Aqui” e tela de abertura do sistema; não há versão web. Conectividade continua exigida para as funções de servidor. | APK instalado e aberto no emulador Android 15 com ícone e tela de abertura (Anexo D). Atualizar o RNF-006 na Visão (P-15). | Atendido de outra forma (DA-11) |
| RNF-007 | Coleta mínima: nome e e-mail; localização aproximada, sem CPF/CNPJ ou documentos pessoais obrigatórios. | Modelo de dados limitado a nome, e-mail (no Supabase Auth), tipo autodeclarado e cidade/UF do anúncio. O único dado extra é um telefone de contato opcional por anúncio, pedido pela equipe (DA-10), visível só ao doador, aos interessados e ao administrador. Não há campos de CPF, CNPJ, endereço, imagens ou documentos. | Conferido no esquema aplicado (seção 10) e nos testes do telefone (Anexo D). O telefone opcional precisa ser registrado na Visão (P-14). | Implementado e verificado |

## Evidências de teste

| Data | Verificação | Resultado |
| --- | --- | --- |
| 20/11/2026 | Migrações aplicadas no Supabase | Quatro migrações aplicadas sem erro. |
| 20/11/2026 | Security Advisor do Supabase | Apenas avisos esperados de funções SECURITY DEFINER executáveis por usuários logados (cada função verifica o chamador) e avisos que já existiam no projeto achado-tecnico. |
| 20/11/2026 | Leitura anônima de categorias pela API | 5 categorias retornadas. |
| 20/11/2026 | Cadastro pela API do Supabase Auth (sondagem) | Conta criada sem sessão e e-mail de confirmação enviado: a confirmação de e-mail está ligada no projeto. Novos cadastros esbarraram no limite de envio de e-mails por hora. |
| 20/11/2026 | Contas de teste | Três contas confirmadas (administrador, doador e interessado) criadas no banco com autorização da equipe, com hash bcrypt e sem envio de e-mail; perfis criados por criar_meu_perfil() no primeiro login. |
| 20/11/2026 | Integridade: migrações do repositório x banco aplicado | As funções têm o mesmo código (hash idêntico); restrições, índices, RLS e permissões por tabela, coluna e função conferem com as migrações. Nomes dos arquivos alinhados às versões registradas no Supabase. |
| 20/11/2026 | Integridade dos dados | Nenhum interesse em anúncio do próprio usuário, nenhum perfil sem conta, datas coerentes e as 5 categorias corretas. Objetos do achado-tecnico (tabelas admins e produtos, funções, gatilho e políticas) inalterados. |
| 20/11/2026 | Troca de senha pela API (conta de teste interessado) | Troca para senha temporária aceita; senha antiga recusada; login com a nova aceito; mesma senha recusada (same_password); senha original restaurada e login com ela aceito. |
| 20/11/2026 | Contas de teste renomeadas | E-mails trocados para bianca@, vitor@ e alfred@doaaqui.com.br (administradora, doador e interessado) direto no Supabase Auth, mantendo senhas e perfis. O domínio não tem servidor de e-mail. |
| 21/11/2026 | Migração doaaqui_contato_anuncio aplicada | Tabela anuncio_contato, duas funções auxiliares, permissões por coluna e quatro políticas; Security Advisor sem avisos novos. |
| 21/11/2026 | Suíte de autorização (node --test supabase/testes/) | 38 de 38 testes aprovados: conta e perfil, publicação e pesquisa, interesse e interessados, gerenciar e concluir, administração e telefone de contato (doador informa, troca e remove; formato inválido recusado; visitante sem acesso; só quem manifestou interesse vê; bloqueado e anúncio desativado escondem o número). |
| 21/11/2026 | Verificação de tipos e análise estática do app (npm run typecheck, npm run lint) | Sem erros, depois de corrigir dois componentes definidos durante a renderização apontados pelo lint. |
| 21/11/2026 | Testes de unidade do app (npm test, Jest) | 14 de 14 testes aprovados: cadastro e login, troca de senha, anúncio, telefone (validação, máscara, link do WhatsApp), regras de interesse e apresentação. |
| 21/11/2026 | Build Android de depuração (Gradle, x86_64) | Concluído em 12 min 9 s neste computador (Core i3-4005U, 8 GB de RAM); APK de depuração com 53,7 MB. |
| 21/11/2026 | Fluxos no emulador Android 15 (Pixel 6, APK de depuração com Metro, contas de teste) | Visitante: boas-vindas, Início com categorias e anúncios do banco, busca, detalhe aberto pelo link doaaqui://anuncio, convite para entrar, Esqueci minha senha e aba Conta. Link doaaqui://nova-senha expirado mostra “Link inválido”. Doador: publicação em dois passos com validação e máscara do telefone, confirmação, detalhe com “Seu telefone neste anúncio” e Meus anúncios. Interessado: telefone oculto antes do interesse; depois de confirmar, “Contato de quem anunciou” com Ligar e WhatsApp. Administradora: aba Admin com moderação e lista de usuários; Trocar senha com validações. Anúncio [TESTE] desativado ao final. |
| 21/11/2026 | Build Android de release (APK de apresentação) | Concluído em 6 min 34 s para x86_64, com o emulador fechado; APK de 29,1 MB. Instalado no emulador: ícone “Doa Aqui” na lista de apps, abertura em 1,8 s (TotalTime do Android) e boas-vindas exibidas sem o Metro. Uma tentativa anterior, compilando duas arquiteturas com o emulador aberto, esgotou a memória do computador. |
| — | E-mail real de redefinição de senha | Não executado: depende da cota de e-mails do projeto compartilhado e da lista de URLs de redirecionamento (P-02, P-13). |
| — | Login e cadastro digitados na tela | Não executados com credenciais pela automação; o login foi verificado pela API e a sessão das contas de teste foi colocada no armazenamento do app. |

## Decisões arquiteturais

| ID | Decisão | Motivo | Consequência |
| --- | --- | --- | --- |
| DA-01 | Usar Supabase (BaaS) em vez de servidor próprio | Prazo e tamanho de um MVP acadêmico; autenticação e banco gerenciados. | Dependência do fornecedor; regras escritas em SQL. |
| DA-02 | Autorização por RLS, permissões por coluna e funções SECURITY DEFINER | RNF-003 exige validação no backend; sem servidor, o banco é o backend. | Funções expostas na API geram avisos do Security Advisor, aceitos e documentados. |
| DA-03 | Perfil criado pela função criar_meu_perfil() em vez de gatilho em auth.users | O projeto é compartilhado; um gatilho global afetaria os cadastros da outra aplicação. | O app precisa chamar a função no primeiro acesso. |
| DA-04 | React Native CLI, sem Expo | A equipe pediu um app somente React Native, aberto no Android Studio e executado no emulador, com os projetos nativos versionados. | O build exige Android SDK, JDK 17, NDK e Gradle; navegação com React Navigation; iOS só com macOS. |
| DA-05 | Distribuição por APK e apresentação no emulador Android | A publicação nas lojas está fora do escopo; o APK de release leva o JavaScript pré-compilado e funciona sem o computador. | Sem atualização automática: cada versão gera um novo APK; chave de assinatura própria pendente (P-16). |
| DA-06 | Sem fotos no MVP | RF-003 da Visão não prevê imagens; evita armazenamento de arquivos. | Ilustração por categoria no lugar de foto. |
| DA-07 | Sem exclusão física de anúncios | Histórico de doações e coerência dos interesses. | Anúncios inativos permanecem no banco. |
| DA-08 | Diagramas em Mermaid | Texto versionado; renderização local; PlantUML indisponível. | Notação UML aproximada. |
| DA-09 | Troca e redefinição de senha pelo próprio Supabase Auth | Pedido da equipe; o Auth já oferece updateUser e resetPasswordForEmail, sem tabela nova, servidor ou alteração no banco. | A troca na conta confirma a senha atual com um novo login antes de gravar. O link de redefinição (doaaqui://nova-senha) depende do envio de e-mails e da lista de URLs de redirecionamento do projeto compartilhado (P-02, P-13). |
| DA-10 | Telefone de contato opcional numa tabela separada (anuncio_contato) protegida por RLS | Pedido da equipe. A tabela anuncio é pública; com o telefone separado, o RLS esconde o número de visitantes e de quem não manifestou interesse sem mudar as permissões de anuncio. | Publicar ou editar com telefone faz duas gravações (anúncio e contato); se a segunda falhar, o app avisa e o doador edita de novo. O número some para interessados bloqueados ou quando o anúncio é desativado. |
| DA-11 | Descontinuar a versão web/PWA e manter só o aplicativo React Native | Decisão da equipe em 21/11/2026: o Doa Aqui é apresentado e avaliado como aplicativo de celular. | O RNF-006 passa a ser atendido pela instalação do app nativo e o RNF-001 deixa de cobrir desktop (P-15); a hospedagem web foi encerrada e o código anterior ficou arquivado. |
