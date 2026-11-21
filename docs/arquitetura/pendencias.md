# Pendências técnicas · Doa Aqui (DA 3.2)

Itens que ainda precisam ser verificados no código ou no Supabase real. Atualizado em 21/11/2026.

| ID | Pendência | Responsável | Prioridade |
| --- | --- | --- | --- |
| P-01 | Definir a conta administradora real do Doa Aqui (papel ADMINISTRADOR atribuído no banco). | Equipe | Alta |
| P-02 | Confirmação de e-mail e limite de envio do projeto Supabase compartilhado: decidir entre projeto dedicado, servidor de e-mail próprio (SMTP) ou desligar a confirmação, avaliando o impacto no achado-tecnico. | Equipe | Alta |
| P-03 | Executar cadastro e login digitados na tela com uma conta real, depois de resolver P-02. | Equipe | Alta |
| P-04 | Ajustar a URL de redirecionamento dos e-mails de confirmação (hoje é a do achado-tecnico). | Equipe | Média |
| P-05 | Migrar o banco para um projeto Supabase dedicado ao Doa Aqui usando as migrações versionadas. | Equipe | Média |
| P-06 | Corrigir a numeração dos RFs, os rótulos das regras e a menção a trocas no Documento de Visão (Anexo B). | Equipe | Média |
| P-07 | Verificar o RNF-001 em telas pequenas (360 dp) e num celular Android real. | Equipe | Média |
| P-08 | Medir o tempo de resposta da pesquisa e da consulta num celular real em rede 4G (seção 11). | Equipe | Baixa |
| P-09 | Antes da entrega final, remover as contas de teste (bianca@, vitor@ e alfred@doaaqui.com.br), a conta de sondagem (doaaqui.sonda.*) e os anúncios [TESTE], se a equipe preferir um banco limpo. | Equipe | Baixa |
| P-10 | Ativar a proteção contra senhas vazadas do Supabase Auth (aviso do Security Advisor, configuração compartilhada). | Equipe | Baixa |
| P-11 | Compilar e testar a versão iOS num Mac com Xcode, se a disciplina exigir. | Equipe | Baixa |
| P-12 | Avaliar os avisos informativos de desempenho do Supabase: índice próprio para anuncio.categoria_id e uso do índice interesse_usuario_idx com dados reais. | Equipe | Baixa |
| P-13 | Incluir doaaqui://nova-senha em Authentication → URL Configuration → Redirect URLs do Supabase, sem remover as do achado-tecnico. Sem isso, o link de redefinição abre a URL padrão do projeto (a do achado-tecnico). Depois, testar um e-mail real de redefinição. | Equipe | Alta |
| P-14 | Registrar na Visão e nos Casos de Uso as funcionalidades adicionais: troca e redefinição de senha (DA-09) e telefone de contato do anúncio (DA-10), ajustando o RNF-007 e o UC-06. | Equipe | Média |
| P-15 | Atualizar no Documento de Visão o RNF-006 (instalação como app nativo, sem PWA) e o RNF-001 (sem desktop), conforme a decisão DA-11. | Equipe | Média |
| P-16 | Gerar o APK de distribuição com uma chave de assinatura própria (hoje é usada a chave de depuração do projeto), se o app for distribuído além da apresentação. | Equipe | Baixa |
