// “Esqueci minha senha”: pede ao Supabase Auth um e-mail com link de redefinição.
// Funcionalidade adicional pedida pela equipe; a Visão deixava a recuperação de senha fora do MVP.
import { Mail, MailCheck } from 'lucide-react-native';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Botao, Campo, Dica, Texto } from '@/componentes/base';
import { Topo, Vazio } from '@/componentes/estrutura';
import { useNavegacao } from '@/navegacao/acoes';
import type { TelaRaiz } from '@/navegacao/tipos';
import { temErros, validarLogin } from '@/negocio/regras';
import { pedirRedefinicaoSenha } from '@/servicos/autenticacao';
import { cores, fontes, margem } from '@/tema';

export default function RecuperarSenha({ route }: TelaRaiz<'RecuperarSenha'>) {
  const { navigation } = useNavegacao();
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState(route.params?.email ?? '');
  const [tentou, setTentou] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [enviado, setEnviado] = useState(false);
  const erroEmail = validarLogin({ email, senha: '-' }).email;

  const fechar = () => (navigation.canGoBack() ? navigation.goBack() : navigation.replace('Entrar'));
  const topo = Platform.OS === 'ios' ? 8 : insets.top;

  const enviar = async () => {
    setTentou(true);
    setErro(null);
    if (temErros(erroEmail ? { email: erroEmail } : {})) return;
    setEnviando(true);
    try {
      await pedirRedefinicaoSenha(email);
      setEnviado(true);
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Não foi possível enviar o link.');
    } finally {
      setEnviando(false);
    }
  };

  if (enviado) {
    return (
      <View style={{ flex: 1, backgroundColor: cores.creme, paddingTop: topo }}>
        <Topo aoVoltar={fechar} fechar />
        <Vazio
          i={MailCheck}
          titulo="Confira seu e-mail"
          texto={`Se existir uma conta com ${email.trim()}, enviamos um link para criar uma nova senha. Confira também a caixa de spam.`}
          acao={<Botao titulo="Voltar para o login" onPress={() => navigation.replace('Entrar')} style={{ marginTop: 8 }} />}
        />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1, backgroundColor: cores.creme, paddingTop: topo }}>
      <Topo titulo="Esqueci minha senha" aoVoltar={fechar} fechar />
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingHorizontal: margem, paddingBottom: insets.bottom + 24, gap: 14 }}>
        <Texto v="corpo" style={{ color: cores.tintaSuave }}>
          Digite o e-mail da sua conta. Vamos enviar um link para você criar uma senha nova.
        </Texto>
        <Campo rotulo="E-mail" icone={Mail} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" autoComplete="email" textContentType="emailAddress" erro={tentou ? erroEmail : undefined} onSubmitEditing={enviar} />
        {erro && <Text style={s.erro} accessibilityLiveRegion="polite">{erro}</Text>}
        <Botao titulo="Enviar link" carregando={enviando} onPress={enviar} />
        <Dica i={Mail}>Já entrou na sua conta? Você também pode trocar a senha em Conta → Trocar senha.</Dica>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  erro: { fontFamily: fontes.semi, fontSize: 13, color: cores.erro },
});
