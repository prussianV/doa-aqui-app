# Matriz de rastreabilidade · Doa Aqui (DA 3.2)

Requisitos (numeração RF-001 a RF-011 dos Casos de Uso), casos de uso, componentes e entidades. Situação em 21/11/2026.

| RF | Requisito | UC | Telas | Serviço | Entidades | Situação |
| --- | --- | --- | --- | --- | --- | --- |
| RF-001 | Cadastrar conta | UC-01 | Cadastro.tsx | servicos/autenticacao | auth.users, usuario | Parcialmente verificado |
| RF-002 | Autenticar usuário | UC-02, UC-03 | Entrar.tsx, Conta.tsx | servicos/autenticacao | auth.users, usuario | Parcialmente verificado |
| RF-003 | Publicar anúncio | UC-07 | anunciar/* | servicos/anuncios | anuncio, categoria | Implementado e verificado |
| RF-004 | Pesquisar anúncios | UC-04 | Inicio.tsx, Busca.tsx | servicos/anuncios | anuncio, categoria | Implementado e verificado |
| RF-005 | Consultar anúncio | UC-05 | DetalheAnuncio.tsx | servicos/anuncios | anuncio, categoria, usuario | Implementado e verificado |
| RF-006 | Manifestar interesse | UC-06 | DetalheAnuncio.tsx | servicos/interesses | interesse | Implementado e verificado |
| RF-007 | Ver interessados | UC-09 | Interessados.tsx | servicos/interesses | interesse, usuario, auth.users | Implementado e verificado |
| RF-008 | Gerenciar anúncio | UC-08 | MeusItens.tsx, anunciar/* | servicos/anuncios | anuncio | Implementado e verificado |
| RF-009 | Concluir doação | UC-10 | MeusItens.tsx, DetalheAnuncio.tsx | servicos/anuncios | anuncio | Implementado e verificado |
| RF-010 | Moderação de anúncios | UC-11 | Admin.tsx | servicos/administracao | anuncio | Implementado e verificado |
| RF-011 | Gerenciamento de usuários | UC-12 | Admin.tsx | servicos/administracao | usuario, auth.users | Implementado e verificado |
| Adicional (DA-09) | Trocar e redefinir senha | — | Conta.tsx, RecuperarSenha.tsx, NovaSenha.tsx | servicos/autenticacao | auth.users | Parcialmente verificado |
| Adicional (DA-10) | Telefone de contato do anúncio | UC-05 a UC-08 | anunciar/Local.tsx, DetalheAnuncio.tsx | servicos/anuncios | anuncio_contato | Implementado e verificado |

## Casos de uso e componentes

| Caso de uso | Ator | RF | Telas | Serviço e objetos do banco | Situação |
| --- | --- | --- | --- | --- | --- |
| UC-01 – Cadastrar conta | Visitante | RF-001 | telas/Cadastro.tsx | autenticacao.cadastrar(); Supabase Auth signUp; criar_meu_perfil() | Parcialmente verificado |
| UC-02 – Realizar login | Visitante | RF-002 | telas/Entrar.tsx | autenticacao.entrar(); signInWithPassword; meu_perfil() | Parcialmente verificado |
| UC-03 – Realizar logout | Usuário Autenticado | RF-002 | telas/Conta.tsx | autenticacao.sair(); signOut | Implementado e verificado |
| UC-04 – Pesquisar anúncios | Visitante | RF-004 | telas/Inicio.tsx, telas/Busca.tsx | anuncios.pesquisar(); SELECT anuncio (RLS) | Implementado e verificado |
| UC-05 – Consultar anúncio | Visitante | RF-005 | telas/DetalheAnuncio.tsx | anuncios.obter(); SELECT anuncio + categoria + usuario; obterContato() para o dono e os interessados (DA-10) | Implementado e verificado |
| UC-06 – Manifestar interesse | Usuário Autenticado | RF-006 | telas/DetalheAnuncio.tsx (FolhaInteresse) | interesses.manifestar(); INSERT interesse (RLS + UNIQUE); depois, SELECT anuncio_contato (telefone do doador, se informado) | Implementado e verificado |
| UC-07 – Publicar anúncio | Usuário Autenticado | RF-003 | telas/anunciar/Detalhes.tsx, Local.tsx, Publicado.tsx | anuncios.publicar(); INSERT anuncio (RLS + CHECK); salvarContato(): INSERT anuncio_contato, opcional | Implementado e verificado |
| UC-08 – Gerenciar anúncio | Usuário Autenticado | RF-008 | telas/MeusItens.tsx (FolhaGerenciar), telas/anunciar (edição) | anuncios.meus(), editar(), salvarContato(), desativar(); gatilho validar_anuncio() | Implementado e verificado |
| UC-09 – Ver interessados | Usuário Autenticado | RF-007 | telas/Interessados.tsx | interesses.listarInteressados(); listar_interessados() | Implementado e verificado |
| UC-10 – Concluir doação | Usuário Autenticado | RF-009 | telas/MeusItens.tsx, telas/DetalheAnuncio.tsx | anuncios.concluir(); UPDATE status DOADO (gatilho) | Implementado e verificado |
| UC-11 – Moderar anúncios | Administrador | RF-010 | telas/Admin.tsx (Anúncios) | administracao.listarAnuncios(), desativarAnuncio(); admin_desativar_anuncio() | Implementado e verificado |
| UC-12 – Gerenciar usuários | Administrador | RF-011 | telas/Admin.tsx (Usuários) | administracao.listarUsuarios(), definirSituacao(); admin_listar_usuarios(), admin_definir_situacao() | Implementado e verificado |
