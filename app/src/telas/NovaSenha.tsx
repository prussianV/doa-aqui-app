// Tela aberta pelo link do e-mail de redefinição (doaaqui://nova-senha): cria a sessão de recuperação
// e grava a nova senha.
import { KeyRound, Link2Off } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Linking, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Botao, Campo, Texto } from '@/componentes/base';
import { Carregando, Topo, Vazio } from '@/componentes/estrutura';
import { useSessao } from '@/estado/SessaoContexto';
import { useNavegacao } from '@/navegacao/acoes';
import type { TelaRaiz } from '@/navegacao/tipos';
import { temErros, validarNovaSenha } from '@/negocio/regras';
import { abrirSessaoDeRecuperacao, definirNovaSenha } from '@/servicos/autenticacao';
import { cores, fontes, margem } from '@/tema';

type Etapa = 'verificando' | 'formulario' | 'link_invalido';

export default function NovaSenha({ route }: TelaRaiz<'NovaSenha'>) {
  const { navigation } = useNavegacao();
  const link = route.params?.link;
  const insets = useSafeAreaInsets();
  const { recarregarPerfil, mostrarAviso } = useSessao();
  const [etapa, setEtapa] = useState<Etapa>('verificando');
  const [motivo, setMotivo] = useState('');
  const [senhas, setSenhas] = useState({ nova: '', confirmacao: '' });
  const [tentou, setTentou] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const erros = validarNovaSenha(senhas);

  useEffect(() => {
    let ativo = true;
    (async () => {
      try {
        // O link chega pela navegação (app já aberto) ou como endereço de abertura do app.
        await abrirSessaoDeRecuperacao(link ?? (await Linking.getInitialURL()) ?? '');
        // Os tokens não ficam guardados nos parâmetros da tela depois de usados.
        navigation.setParams({ link: undefined });
        if (ativo) setEtapa('formulario');
      } catch (e) {
        if (!ativo) return;
        setMotivo(e instanceof Error ? e.message : 'Link inválido.');
        setEtapa('link_invalido');
      }
    })();
    return () => {
      ativo = false;
    };
  }, [link, navigation]);

  const salvar = async () => {
    setTentou(true);
    setErro(null);
    if (temErros(erros)) return;
    setSalvando(true);
    try {
      await definirNovaSenha(senhas.nova);
      await recarregarPerfil();
      mostrarAviso('Senha alterada. Você já está na sua conta');
      navigation.reset({ index: 0, routes: [{ name: 'Abas' }] });
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Não foi possível salvar a nova senha.');
    } finally {
      setSalvando(false);
    }
  };

  const topo = insets.top;

  if (etapa === 'verificando') {
    return (
      <View style={{ flex: 1, backgroundColor: cores.creme, paddingTop: topo + 40 }}>
        <Carregando texto="Conferindo o link…" />
      </View>
    );
  }

  if (etapa === 'link_invalido') {
    return (
      <View style={{ flex: 1, backgroundColor: cores.creme, paddingTop: topo }}>
        <Topo aoVoltar={() => navigation.replace('Entrar')} fechar />
        <Vazio
          i={Link2Off}
          titulo="Link inválido"
          texto={motivo}
          acao={<Botao titulo="Pedir um novo link" onPress={() => navigation.replace('RecuperarSenha')} style={{ marginTop: 8 }} />}
        />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1, backgroundColor: cores.creme, paddingTop: topo }}>
      <Topo titulo="Nova senha" />
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingHorizontal: margem, paddingBottom: insets.bottom + 24, gap: 14 }}>
        <View style={s.icone}>
          <KeyRound size={28} color={cores.coral600} />
        </View>
        <Texto v="titulo">Crie sua nova senha</Texto>
        <Campo rotulo="Nova senha" value={senhas.nova} onChangeText={(nova) => setSenhas({ ...senhas, nova })} secureTextEntry autoComplete="new-password" textContentType="newPassword" erro={tentou ? erros.nova : undefined} />
        <Campo rotulo="Repita a nova senha" value={senhas.confirmacao} onChangeText={(confirmacao) => setSenhas({ ...senhas, confirmacao })} secureTextEntry autoComplete="new-password" textContentType="newPassword" erro={tentou ? erros.confirmacao : undefined} onSubmitEditing={salvar} />
        {erro && <Text style={s.erro} accessibilityLiveRegion="polite">{erro}</Text>}
        <Botao titulo="Salvar nova senha" carregando={salvando} onPress={salvar} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  icone: { width: 60, height: 60, borderRadius: 20, backgroundColor: cores.coral50, alignItems: 'center', justifyContent: 'center' },
  erro: { fontFamily: fontes.semi, fontSize: 13, color: cores.erro },
});
