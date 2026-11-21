// UC-01 · Cadastrar conta com nome, e-mail único e senha (RF-001, RN-01). Coleta mínima (RNF-007).
import { Lock, Mail, MailCheck, User } from 'lucide-react-native';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Botao, Campo, Segmentado, Texto } from '@/componentes/base';
import { Topo, Vazio } from '@/componentes/estrutura';
import { useSessao } from '@/estado/SessaoContexto';
import { useNavegacao } from '@/navegacao/acoes';
import { LIMITES } from '@/negocio/catalogo';
import { temErros, validarCadastro } from '@/negocio/regras';
import type { TipoConta } from '@/negocio/tipos';
import { cadastrar } from '@/servicos/autenticacao';
import { cores, fontes, margem } from '@/tema';

export default function Cadastro() {
  const { navigation, voltar } = useNavegacao();
  const insets = useSafeAreaInsets();
  const { recarregarPerfil, mostrarAviso } = useSessao();
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [tipo, setTipo] = useState<TipoConta>('PESSOA_FISICA');
  const [tentou, setTentou] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [confirmar, setConfirmar] = useState(false);
  const erros = validarCadastro({ nome, email, senha });

  const fechar = voltar;

  const enviar = async () => {
    setTentou(true);
    setErro(null);
    if (temErros(erros)) return;
    setEnviando(true);
    try {
      const { precisaConfirmar } = await cadastrar({ nome, email, senha, tipo });
      if (precisaConfirmar) {
        setConfirmar(true);
      } else {
        await recarregarPerfil();
        mostrarAviso('Conta criada! Boas-vindas ao Doa Aqui');
        fechar();
      }
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Não foi possível criar a conta.');
    } finally {
      setEnviando(false);
    }
  };

  const topo = Platform.OS === 'ios' ? 8 : insets.top;

  if (confirmar) {
    return (
      <View style={{ flex: 1, backgroundColor: cores.creme, paddingTop: topo }}>
        <Topo aoVoltar={fechar} fechar />
        <Vazio i={MailCheck} titulo="Confirme seu e-mail" texto={`Enviamos um link para ${email.trim()}. Depois de confirmar, volte e entre com sua senha.`} acao={<Botao titulo="Ir para o login" onPress={() => navigation.replace('Entrar')} style={{ marginTop: 8 }} />} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1, backgroundColor: cores.creme, paddingTop: topo }}>
      <Topo titulo="Criar conta" aoVoltar={fechar} fechar />
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingHorizontal: margem, paddingBottom: insets.bottom + 24, gap: 14 }}>
        <View style={{ gap: 8 }}>
          <Text style={s.rotulo}>Você é</Text>
          <Segmentado
            valor={tipo}
            onChange={setTipo}
            opcoes={[
              { id: 'PESSOA_FISICA', nome: 'Pessoa física' },
              { id: 'ONG', nome: 'ONG ou instituição' },
            ]}
          />
          {tipo === 'ONG' && <Texto v="legenda">O cadastro de instituição é autodeclarado: o Doa Aqui não verifica documentos.</Texto>}
        </View>
        <Campo rotulo={tipo === 'ONG' ? 'Nome da instituição' : 'Nome'} icone={User} value={nome} onChangeText={setNome} autoCapitalize="words" autoComplete="name" limite={LIMITES.nome} erro={tentou ? erros.nome : undefined} />
        <Campo rotulo="E-mail" icone={Mail} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" autoComplete="email" textContentType="emailAddress" erro={tentou ? erros.email : undefined} />
        <Campo
          rotulo="Senha"
          icone={Lock}
          value={senha}
          onChangeText={setSenha}
          secureTextEntry
          autoComplete="new-password"
          textContentType="newPassword"
          erro={tentou ? erros.senha : undefined}
          onSubmitEditing={enviar}
        />
        <Texto v="legenda">Mínimo de {LIMITES.senhaMin} caracteres. Pedimos só nome e e-mail: nada de CPF, telefone ou documentos.</Texto>
        {erro && <Text style={s.erro} accessibilityLiveRegion="polite">{erro}</Text>}
        <Botao titulo="Criar conta" carregando={enviando} onPress={enviar} style={{ marginTop: 4 }} />
        <View style={[s.linha, { justifyContent: 'center', marginTop: 8 }]}>
          <Texto v="legenda" style={{ fontSize: 13 }}>Já tem conta? </Texto>
          <Pressable onPress={() => navigation.replace('Entrar')} hitSlop={8}>
            <Text style={s.link}>Entrar</Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  linha: { flexDirection: 'row', alignItems: 'center' },
  rotulo: { fontFamily: fontes.negrito, fontSize: 12, color: cores.tinta },
  erro: { fontFamily: fontes.semi, fontSize: 13, color: cores.erro },
  link: { fontFamily: fontes.negrito, fontSize: 13, color: cores.coral600 },
});
