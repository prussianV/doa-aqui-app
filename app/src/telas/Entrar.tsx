// UC-02 · Realizar login com e-mail e senha (RF-002). Contas bloqueadas são recusadas (RF-011).
import { Lock, Mail } from 'lucide-react-native';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Botao, Campo, Texto } from '@/componentes/base';
import { Topo } from '@/componentes/estrutura';
import { Marca } from '@/componentes/Ilustracoes';
import { useSessao } from '@/estado/SessaoContexto';
import { useNavegacao } from '@/navegacao/acoes';
import type { TelaRaiz } from '@/navegacao/tipos';
import { temErros, validarLogin } from '@/negocio/regras';
import { entrar } from '@/servicos/autenticacao';
import { cores, fontes, margem } from '@/tema';

const MOTIVOS: Record<string, string> = {
  anunciar: 'Entre para anunciar um item.',
  interesse: 'Entre para demonstrar interesse no item.',
};

export default function Entrar({ route }: TelaRaiz<'Entrar'>) {
  const { navigation, voltar } = useNavegacao();
  const insets = useSafeAreaInsets();
  const motivo = route.params?.motivo;
  const { definirPerfil, mostrarAviso } = useSessao();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [tentou, setTentou] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const erros = validarLogin({ email, senha });

  const fechar = voltar;

  const enviar = async () => {
    setTentou(true);
    setErro(null);
    if (temErros(erros)) return;
    setEnviando(true);
    try {
      const perfil = await entrar(email, senha);
      definirPerfil(perfil);
      mostrarAviso(`Olá, ${perfil.nome.split(' ')[0]}!`);
      fechar();
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Não foi possível entrar.');
    } finally {
      setEnviando(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1, backgroundColor: cores.creme, paddingTop: Platform.OS === 'ios' ? 8 : insets.top }}>
      <Topo aoVoltar={fechar} fechar />
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingHorizontal: margem, paddingBottom: insets.bottom + 24, gap: 14 }}>
        <Marca tamanho={52} />
        <View style={{ gap: 6 }}>
          <Texto v="display" style={{ fontSize: 26, lineHeight: 31 }}>Que bom te ver de novo</Texto>
          <Texto v="corpo" style={{ color: cores.tintaSuave }}>{(motivo && MOTIVOS[motivo]) || 'Entre para anunciar e demonstrar interesse em itens.'}</Texto>
        </View>
        <Campo rotulo="E-mail" icone={Mail} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" autoComplete="email" textContentType="emailAddress" erro={tentou ? erros.email : undefined} />
        <Campo rotulo="Senha" icone={Lock} value={senha} onChangeText={setSenha} secureTextEntry autoComplete="current-password" textContentType="password" erro={tentou ? erros.senha : undefined} onSubmitEditing={enviar} />
        <Pressable onPress={() => navigation.navigate('RecuperarSenha', email.trim() ? { email: email.trim() } : undefined)} hitSlop={8} style={{ alignSelf: 'flex-end' }} accessibilityRole="link">
          <Text style={s.link}>Esqueci minha senha</Text>
        </Pressable>
        {erro && <Text style={s.erro} accessibilityLiveRegion="polite">{erro}</Text>}
        <Botao titulo="Entrar" carregando={enviando} onPress={enviar} style={{ marginTop: 4 }} />
        <Botao titulo="Continuar sem conta" v="fantasma" onPress={fechar} />
        <View style={[s.linha, { justifyContent: 'center', marginTop: 8 }]}>
          <Texto v="legenda" style={{ fontSize: 13 }}>Ainda não tem conta? </Texto>
          <Pressable onPress={() => navigation.replace('Cadastro')} hitSlop={8}>
            <Text style={s.link}>Criar conta</Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  linha: { flexDirection: 'row', alignItems: 'center' },
  erro: { fontFamily: fontes.semi, fontSize: 13, color: cores.erro },
  link: { fontFamily: fontes.negrito, fontSize: 13, color: cores.coral600 },
});
