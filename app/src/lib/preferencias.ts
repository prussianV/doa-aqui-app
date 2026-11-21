// Preferências locais do aparelho (não são dados de negócio; esses ficam no Supabase, RNF-004).
import AsyncStorage from '@react-native-async-storage/async-storage';

export const CHAVE_BOAS_VINDAS = '@doaaqui/boas-vindas-vista';

export const marcarBoasVindasVista = () => AsyncStorage.setItem(CHAVE_BOAS_VINDAS, '1').catch(() => {});
