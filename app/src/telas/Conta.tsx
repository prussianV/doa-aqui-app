// Conta: dados do usuário logado e logout (UC-03). Visitantes veem o convite para entrar ou se cadastrar.
import { CircleHelp, KeyRound, LogOut, Mail, ShieldCheck, User } from 'lucide-react-native';
import type { LucideIcon } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Avatar, Botao, Campo, Icone, Texto } from '@/componentes/base';
import { ExigeLogin } from '@/componentes/ExigeLogin';
import { Folha } from '@/componentes/estrutura';
import { useSessao } from '@/estado/SessaoContexto';
import { ROTULO_TIPO_CONTA } from '@/negocio/catalogo';
import { iniciais, temErros, validarNovaSenha } from '@/negocio/regras';
import { trocarSenha } from '@/servicos/autenticacao';
import { cores, fontes, margem, raio } from '@/tema';

export default function ContaTela() {
  return (
    <ExigeLogin i={User} titulo="Entre ou crie sua conta" texto="Com uma conta você publica anúncios e demonstra interesse em itens. Para olhar os anúncios não precisa.">
      <Conta />
    </ExigeLogin>
  );
}

function Conta() {
  const insets = useSafeAreaInsets();
  const { perfil, sair, mostrarAviso, ehAdmin } = useSessao();
  const [folha, setFolha] = useState<null | 'ajuda' | 'sair' | 'senha'>(null);
  const [saindo, setSaindo] = useState(false);
  const [senhas, setSenhas] = useState({ atual: '', nova: '', confirmacao: '' });
  const [tentouSenha, setTentouSenha] = useState(false);
  const [salvandoSenha, setSalvandoSenha] = useState(false);
  const [erroSenha, setErroSenha] = useState<string | null>(null);
  const errosSenha = validarNovaSenha(senhas);
  if (!perfil) return null;

  return (
    <ScrollView style={{ backgroundColor: cores.creme }} contentContainerStyle={{ paddingTop: insets.top + 16, paddingHorizontal: margem, paddingBottom: 32, gap: 16 }}>
      <View style={{ alignItems: 'center', gap: 4 }}>
        <Avatar iniciais={iniciais(perfil.nome)} tam={76} tom={perfil.tipo === 'ONG' ? 'verde' : 'coral'} />
        <Texto v="titulo" style={{ fontSize: 21, marginTop: 6 }}>{perfil.nome}</Texto>
        <Texto v="legenda">{ROTULO_TIPO_CONTA[perfil.tipo]}</Texto>
        {ehAdmin && (
          <View style={s.selo}>
            <Icone i={ShieldCheck} tam={13} cor={cores.verde700} />
            <Text style={s.seloTexto}>Administrador</Text>
          </View>
        )}
      </View>

      <View style={s.menu}>
        <Linha i={Mail} titulo="E-mail" detalhe={perfil.email} />
        <Linha i={User} titulo="Tipo de conta" detalhe={perfil.tipo === 'ONG' ? 'ONG (autodeclarada)' : 'Pessoa física'} />
        <Linha
          i={KeyRound}
          titulo="Trocar senha"
          onPress={() => {
            setSenhas({ atual: '', nova: '', confirmacao: '' });
            setTentouSenha(false);
            setErroSenha(null);
            setFolha('senha');
          }}
        />
        <Linha i={CircleHelp} titulo="Ajuda e segurança" onPress={() => setFolha('ajuda')} />
        <Linha i={LogOut} titulo="Sair da conta" onPress={() => setFolha('sair')} ultimo perigo />
      </View>
      <Texto v="legenda" style={{ textAlign: 'center', fontSize: 11.5 }}>
        Guardamos só seu nome e e-mail. Seu e-mail só aparece para quem anunciou quando você autoriza.
      </Texto>

      <Folha visivel={folha === 'ajuda'} aoFechar={() => setFolha(null)}>
        <Texto v="subtitulo" style={{ fontSize: 19, marginBottom: 12 }}>Ajuda e segurança</Texto>
        <View style={{ gap: 10 }}>
          <Dicao titulo="Combine em lugar público">Prefira estações, praças ou a portaria do prédio para a retirada.</Dicao>
          <Dicao titulo="Doação não tem custo">Desconfie de quem pede dinheiro de frete ou taxa antes de entregar.</Dicao>
          <Dicao titulo="Seu endereço fica protegido">Os anúncios mostram só cidade e estado. Você decide o que contar na conversa.</Dicao>
        </View>
        <Botao style={{ marginTop: 18 }} v="secundario" titulo="Entendi" onPress={() => setFolha(null)} />
      </Folha>

      <Folha visivel={folha === 'senha'} aoFechar={() => setFolha(null)}>
        <Texto v="subtitulo" style={{ fontSize: 19 }}>Trocar senha</Texto>
        <Texto v="legenda" style={{ marginTop: 4, marginBottom: 14 }}>Para confirmar que é você, digite a senha atual.</Texto>
        <View style={{ gap: 12 }}>
          <Campo rotulo="Senha atual" value={senhas.atual} onChangeText={(atual) => setSenhas({ ...senhas, atual })} secureTextEntry autoComplete="current-password" textContentType="password" erro={tentouSenha ? errosSenha.atual : undefined} />
          <Campo rotulo="Nova senha" value={senhas.nova} onChangeText={(nova) => setSenhas({ ...senhas, nova })} secureTextEntry autoComplete="new-password" textContentType="newPassword" erro={tentouSenha ? errosSenha.nova : undefined} />
          <Campo rotulo="Repita a nova senha" value={senhas.confirmacao} onChangeText={(confirmacao) => setSenhas({ ...senhas, confirmacao })} secureTextEntry autoComplete="new-password" textContentType="newPassword" erro={tentouSenha ? errosSenha.confirmacao : undefined} />
        </View>
        {erroSenha && <Text style={s.erro} accessibilityLiveRegion="polite">{erroSenha}</Text>}
        <Botao
          style={{ marginTop: 18 }}
          titulo="Salvar nova senha"
          carregando={salvandoSenha}
          onPress={async () => {
            setTentouSenha(true);
            setErroSenha(null);
            if (temErros(errosSenha)) return;
            setSalvandoSenha(true);
            try {
              await trocarSenha(perfil.email, senhas.atual, senhas.nova);
              setFolha(null);
              mostrarAviso('Senha alterada');
            } catch (e) {
              setErroSenha(e instanceof Error ? e.message : 'Não foi possível trocar a senha.');
            } finally {
              setSalvandoSenha(false);
            }
          }}
        />
        <Botao style={{ marginTop: 8 }} v="secundario" titulo="Cancelar" onPress={() => setFolha(null)} />
      </Folha>

      <Folha visivel={folha === 'sair'} aoFechar={() => setFolha(null)}>
        <Texto v="subtitulo" style={{ fontSize: 19 }}>Sair da conta?</Texto>
        <Texto v="corpo" style={{ color: cores.tintaSuave, marginTop: 6 }}>Você continua vendo os anúncios. Para publicar ou demonstrar interesse, entre de novo.</Texto>
        <Botao
          style={{ marginTop: 18 }}
          v="perigo"
          titulo="Sair"
          carregando={saindo}
          onPress={async () => {
            setSaindo(true);
            try {
              await sair();
              setFolha(null);
              mostrarAviso('Você saiu da conta');
            } catch (e) {
              mostrarAviso(e instanceof Error ? e.message : 'Não foi possível sair.');
            } finally {
              setSaindo(false);
            }
          }}
        />
        <Botao style={{ marginTop: 8 }} v="secundario" titulo="Cancelar" onPress={() => setFolha(null)} />
      </Folha>
    </ScrollView>
  );
}

const Linha = ({ i, titulo, detalhe, onPress, ultimo, perigo }: { i: LucideIcon; titulo: string; detalhe?: string; onPress?: () => void; ultimo?: boolean; perigo?: boolean }) => (
  <Pressable disabled={!onPress} onPress={onPress} accessibilityRole={onPress ? 'button' : undefined} style={({ pressed }) => [s.item, !ultimo && s.itemBorda, pressed && { backgroundColor: cores.areia }]}>
    <View style={[s.itemIcone, perigo && { backgroundColor: cores.erro50 }]}>
      <Icone i={i} tam={17} cor={perigo ? cores.erro : cores.tinta} />
    </View>
    <Text style={[s.itemTitulo, perigo && { color: cores.erro }]}>{titulo}</Text>
    {detalhe && <Texto v="legenda" numberOfLines={1} style={{ maxWidth: 190 }}>{detalhe}</Texto>}
  </Pressable>
);

const Dicao = ({ titulo, children }: { titulo: string; children: string }) => (
  <View style={s.dica}>
    <Text style={s.dicaTitulo}>{titulo}</Text>
    <Texto v="legenda" style={{ fontSize: 12.5, lineHeight: 17 }}>{children}</Texto>
  </View>
);

const s = StyleSheet.create({
  selo: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: cores.verde50, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 5, marginTop: 6 },
  seloTexto: { fontFamily: fontes.negrito, fontSize: 11, color: cores.verde700 },
  menu: { backgroundColor: cores.branco, borderRadius: raio.lg, borderWidth: 1, borderColor: cores.linha, overflow: 'hidden' },
  item: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 14, paddingVertical: 13 },
  itemBorda: { borderBottomWidth: 1, borderBottomColor: cores.linha },
  itemIcone: { width: 32, height: 32, borderRadius: 10, backgroundColor: cores.areia, alignItems: 'center', justifyContent: 'center' },
  itemTitulo: { flex: 1, fontFamily: fontes.semi, fontSize: 14, color: cores.tinta },
  dica: { backgroundColor: cores.areia, borderRadius: raio.md, padding: 12, gap: 2 },
  dicaTitulo: { fontFamily: fontes.negrito, fontSize: 13.5, color: cores.tinta },
  erro: { fontFamily: fontes.semi, fontSize: 13, color: cores.erro, marginTop: 12 },
});
