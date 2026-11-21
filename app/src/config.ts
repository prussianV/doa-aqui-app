// Endereço do backend (Supabase) usado pelo app.
// A chave abaixo é a chave PÚBLICA (publishable) do projeto: ela vai dentro de qualquer APK e não dá
// acesso privilegiado. O que cada pessoa pode ler ou alterar é decidido pelas políticas RLS do banco
// (supabase/migrations). Nunca coloque aqui a chave secreta (service_role / sb_secret_...).
export const SUPABASE_URL = 'https://epdzocxxbmxnxresotrh.supabase.co';
export const SUPABASE_CHAVE_PUBLICA = 'sb_publishable_nGGpnaUNMH10vjBujfStkw_JpQTMu3k';

/** Endereço que o e-mail de redefinição de senha abre (intent-filter no AndroidManifest e URL Types no iOS). */
export const LINK_NOVA_SENHA = 'doaaqui://nova-senha';
