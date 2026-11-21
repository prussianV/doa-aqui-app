// Folhas inferiores: filtros da pesquisa, manifestação de interesse, gerenciar anúncio e confirmação.
import { useNavigation } from '@react-navigation/native';
import { Check, Gift, Pencil, Trash2, Users } from 'lucide-react-native';
import type { LucideIcon } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useSessao } from '@/estado/SessaoContexto';
import { ROTULO_STATUS, UFS } from '@/negocio/catalogo';
import { textoInteressados } from '@/negocio/regras';
import type { Anuncio, Filtros } from '@/negocio/tipos';
import { FILTROS_VAZIOS } from '@/negocio/tipos';
import { manifestar } from '@/servicos/interesses';
import { cores, fontes, raio } from '@/tema';
import { ImagemAnuncio } from './anuncio';
import { Botao, Campo, Chip, Icone, Rotulo, Texto } from './base';
import { Folha } from './estrutura';
import { ICONE_CATEGORIA } from './icones';

/* ---------- Filtros da pesquisa (UC-04: categoria e cidade/UF) ---------- */
export function FolhaFiltros({ visivel, filtros, aoFechar, aoAplicar }: { visivel: boolean; filtros: Filtros; aoFechar: () => void; aoAplicar: (f: Filtros) => void }) {
  const { categorias } = useSessao();
  const [f, setF] = useState(filtros);
  // Ao abrir a folha, começa dos filtros atuais (ajuste de estado quando a prop muda).
  const [estavaVisivel, setEstavaVisivel] = useState(visivel);
  if (visivel !== estavaVisivel) {
    setEstavaVisivel(visivel);
    if (visivel) setF(filtros);
  }

  return (
    <Folha visivel={visivel} aoFechar={aoFechar} rolavel>
      <View style={[st.linha, { justifyContent: 'space-between', marginBottom: 14 }]}>
        <Texto v="subtitulo" style={{ fontSize: 19 }}>Filtros</Texto>
        <Pressable onPress={() => setF({ ...FILTROS_VAZIOS, texto: f.texto })} hitSlop={8}>
          <Text style={st.link}>Limpar</Text>
        </Pressable>
      </View>

      <Rotulo>Categoria</Rotulo>
      <View style={st.chips}>
        <Chip rotulo="Todas" ativo={!f.categoriaId} onPress={() => setF({ ...f, categoriaId: null })} />
        {categorias.map((c) => (
          <Chip key={c.id} rotulo={c.nome} icone={ICONE_CATEGORIA[c.slug]} ativo={f.categoriaId === c.id} onPress={() => setF({ ...f, categoriaId: c.id })} />
        ))}
      </View>

      <Rotulo style={st.secao}>Estado (UF)</Rotulo>
      <View style={[st.chips, { gap: 6 }]}>
        <Chip rotulo="Todos" ativo={!f.uf} onPress={() => setF({ ...f, uf: null })} />
        {UFS.map((uf) => (
          <Chip key={uf} rotulo={uf} ativo={f.uf === uf} onPress={() => setF({ ...f, uf })} />
        ))}
      </View>

      <View style={st.secao}>
        <Campo rotulo="Cidade" placeholder="Ex.: Campinas" value={f.cidade} onChangeText={(cidade) => setF({ ...f, cidade })} autoCapitalize="words" />
      </View>

      <Botao style={{ marginTop: 22 }} titulo="Ver anúncios" onPress={() => aoAplicar(f)} />
    </Folha>
  );
}

/* ---------- UC-06 · Manifestar interesse (com consentimento do e-mail, RN-07) ---------- */
export function FolhaInteresse({ anuncio, visivel, aoFechar, aoRegistrar }: { anuncio: Anuncio; visivel: boolean; aoFechar: () => void; aoRegistrar: () => void }) {
  const [autoriza, setAutoriza] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [feito, setFeito] = useState(false);
  const anunciante = anuncio.usuario?.nome ?? 'quem anunciou';

  // Ao abrir a folha, volta ao estado inicial.
  const [estavaVisivel, setEstavaVisivel] = useState(visivel);
  if (visivel !== estavaVisivel) {
    setEstavaVisivel(visivel);
    if (visivel) {
      setAutoriza(false);
      setErro(null);
      setFeito(false);
    }
  }

  const confirmar = async () => {
    setEnviando(true);
    setErro(null);
    try {
      await manifestar(anuncio.id, autoriza);
      setFeito(true);
      aoRegistrar();
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Não foi possível registrar o interesse.');
    } finally {
      setEnviando(false);
    }
  };

  if (feito) {
    return (
      <Folha visivel={visivel} aoFechar={aoFechar}>
        <View style={st.icone}>
          <Icone i={Check} tam={32} cor={cores.verde600} espessura={2.4} />
        </View>
        <Texto v="titulo" style={{ textAlign: 'center', marginTop: 12 }}>Interesse registrado!</Texto>
        <Texto v="corpo" style={{ textAlign: 'center', color: cores.tintaSuave, marginTop: 6 }}>
          {autoriza
            ? `${anunciante} vai ver seu nome e seu e-mail na lista de interessados e pode entrar em contato.`
            : `${anunciante} vai ver seu nome na lista de interessados. Você não autorizou mostrar seu e-mail.`}
        </Texto>
        <Botao style={{ marginTop: 18 }} titulo="Continuar explorando" onPress={aoFechar} />
      </Folha>
    );
  }

  return (
    <Folha visivel={visivel} aoFechar={aoFechar}>
      <Texto v="titulo" style={{ fontSize: 21 }}>Tenho interesse</Texto>
      <Texto v="corpo" style={{ color: cores.tintaSuave, marginTop: 6 }}>
        Vamos avisar {anunciante} que você quer “{anuncio.titulo}”. A entrega é combinada entre vocês, fora do app.
      </Texto>

      <Pressable
        onPress={() => setAutoriza(!autoriza)}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: autoriza }}
        style={[st.consentimento, autoriza && { borderColor: cores.coral500, backgroundColor: cores.coral50 }]}
      >
        <View style={[st.caixa, autoriza && st.caixaOn]}>{autoriza && <Icone i={Check} tam={14} cor={cores.branco} espessura={3} />}</View>
        <View style={{ flex: 1 }}>
          <Text style={st.consentimentoTitulo}>Autorizo mostrar meu e-mail para quem anunciou</Text>
          <Text style={st.consentimentoTexto}>Sem essa autorização, o anunciante vê só o seu nome.</Text>
        </View>
      </Pressable>

      {erro && <Text style={st.erro} accessibilityLiveRegion="polite">{erro}</Text>}
      <Botao style={{ marginTop: 16 }} titulo="Confirmar interesse" carregando={enviando} onPress={confirmar} />
      <Botao v="fantasma" titulo="Cancelar" onPress={aoFechar} style={{ marginTop: 4 }} />
    </Folha>
  );
}

/* ---------- UC-08, UC-09, UC-10 · Gerenciar o próprio anúncio ---------- */
export function FolhaGerenciar({
  anuncio,
  visivel,
  aoFechar,
  aoConcluir,
  aoDesativar,
}: {
  anuncio: Anuncio | null;
  visivel: boolean;
  aoFechar: () => void;
  aoConcluir: (a: Anuncio) => void;
  aoDesativar: (a: Anuncio) => void;
}) {
  const navigation = useNavigation();
  if (!anuncio) return null;
  const disponivel = anuncio.status === 'DISPONIVEL';

  return (
    <Folha visivel={visivel} aoFechar={aoFechar}>
      <View style={[st.linha, { gap: 12 }]}>
        <ImagemAnuncio slug={anuncio.categoria?.slug} style={{ width: 52, height: 52, borderRadius: 12 }} />
        <View style={{ flex: 1 }}>
          <Text style={st.acaoTitulo} numberOfLines={1}>{anuncio.titulo}</Text>
          <Texto v="legenda">{ROTULO_STATUS[anuncio.status]} · {textoInteressados(anuncio.total_interesses ?? 0)}</Texto>
        </View>
      </View>
      <View style={st.divisor} />
      <Acao
        i={Users}
        titulo="Ver interessados"
        sub="Nomes e, quando autorizado, e-mails"
        onPress={() => {
          aoFechar();
          navigation.navigate('Interessados', { id: anuncio.id });
        }}
      />
      {disponivel ? (
        <>
          <Acao
            i={Pencil}
            titulo="Editar anúncio"
            sub="Título, descrição, categoria e local"
            onPress={() => {
              aoFechar();
              navigation.navigate('Anunciar', { editar: anuncio.id });
            }}
          />
          <Acao i={Gift} tom="ok" titulo="Marcar como doado" sub="Sai da pesquisa e vai para Doados" onPress={() => aoConcluir(anuncio)} />
          <Acao i={Trash2} tom="perigo" titulo="Desativar anúncio" sub="Sai da pesquisa. Não dá para reativar" onPress={() => aoDesativar(anuncio)} />
        </>
      ) : (
        <Texto v="legenda" style={{ marginTop: 6, marginBottom: 4 }}>
          {anuncio.status === 'DOADO' ? 'Anúncio concluído como doado.' : anuncio.inativado_por === 'ADMINISTRADOR' ? 'Desativado pela moderação.' : 'Anúncio desativado.'} Não pode mais ser editado.
        </Texto>
      )}
      <Botao v="secundario" titulo="Fechar" onPress={aoFechar} style={{ marginTop: 8 }} />
    </Folha>
  );
}

function Acao({ i, titulo, sub, tom, onPress }: { i: LucideIcon; titulo: string; sub: string; tom?: 'ok' | 'perigo'; onPress: () => void }) {
  const fundo = tom === 'ok' ? cores.verde50 : tom === 'perigo' ? cores.erro50 : cores.areia;
  const cor = tom === 'ok' ? cores.verde700 : tom === 'perigo' ? cores.erro : cores.tinta;
  return (
    <Pressable onPress={onPress} accessibilityRole="button" style={({ pressed }) => [st.acao, pressed && { opacity: 0.6 }]}>
      <View style={[st.acaoIcone, { backgroundColor: fundo }]}>
        <Icone i={i} tam={19} cor={cor} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[st.acaoTitulo, tom === 'perigo' && { color: cores.erro }]}>{titulo}</Text>
        <Texto v="legenda" style={{ fontSize: 11.5 }}>{sub}</Texto>
      </View>
    </Pressable>
  );
}

/* ---------- Confirmação genérica (ações que não têm volta) ---------- */
export function FolhaConfirmar({
  visivel,
  titulo,
  texto,
  rotuloConfirmar,
  perigo,
  aoConfirmar,
  aoFechar,
}: {
  visivel: boolean;
  titulo: string;
  texto: string;
  rotuloConfirmar: string;
  perigo?: boolean;
  aoConfirmar: () => Promise<void>;
  aoFechar: () => void;
}) {
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [estavaVisivel, setEstavaVisivel] = useState(visivel);
  if (visivel !== estavaVisivel) {
    setEstavaVisivel(visivel);
    if (visivel) setErro(null);
  }

  return (
    <Folha visivel={visivel} aoFechar={aoFechar}>
      <Texto v="titulo" style={{ fontSize: 21 }}>{titulo}</Texto>
      <Texto v="corpo" style={{ color: cores.tintaSuave, marginTop: 6 }}>{texto}</Texto>
      {erro && <Text style={st.erro}>{erro}</Text>}
      <Botao
        style={{ marginTop: 18 }}
        v={perigo ? 'perigo' : 'primario'}
        titulo={rotuloConfirmar}
        carregando={enviando}
        onPress={async () => {
          setEnviando(true);
          setErro(null);
          try {
            await aoConfirmar();
            aoFechar();
          } catch (e) {
            setErro(e instanceof Error ? e.message : 'Não foi possível concluir.');
          } finally {
            setEnviando(false);
          }
        }}
      />
      <Botao v="secundario" style={{ marginTop: 8 }} titulo="Cancelar" onPress={aoFechar} />
    </Folha>
  );
}

const st = StyleSheet.create({
  linha: { flexDirection: 'row', alignItems: 'center' },
  link: { fontFamily: fontes.negrito, fontSize: 13, color: cores.coral600 },
  secao: { marginTop: 18 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  icone: { width: 64, height: 64, borderRadius: 32, backgroundColor: cores.verde50, alignSelf: 'center', alignItems: 'center', justifyContent: 'center' },
  consentimento: {
    flexDirection: 'row', gap: 12, alignItems: 'flex-start', marginTop: 16, padding: 14,
    borderRadius: raio.lg, borderWidth: 1.5, borderColor: cores.linha, backgroundColor: cores.branco,
  },
  caixa: { width: 22, height: 22, borderRadius: 6, borderWidth: 2, borderColor: cores.linhaForte, alignItems: 'center', justifyContent: 'center', marginTop: 1 },
  caixaOn: { backgroundColor: cores.coral500, borderColor: cores.coral500 },
  consentimentoTitulo: { fontFamily: fontes.negrito, fontSize: 14, color: cores.tinta },
  consentimentoTexto: { fontFamily: fontes.medio, fontSize: 12, color: cores.tintaSuave, marginTop: 2 },
  erro: { fontFamily: fontes.semi, fontSize: 13, color: cores.erro, marginTop: 12 },
  divisor: { height: 1, backgroundColor: cores.linha, marginVertical: 10 },
  acao: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10 },
  acaoIcone: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  acaoTitulo: { fontFamily: fontes.negrito, fontSize: 14.5, color: cores.tinta },
});
