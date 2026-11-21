/**
 * Ponto de entrada do app Doa Aqui (React Native).
 * O polyfill de URL precisa vir antes de tudo: o supabase-js usa a API URL do navegador.
 * @format
 */
import 'react-native-url-polyfill/auto';
import { AppRegistry } from 'react-native';

import App from './src/App';
import { name as appName } from './app.json';

AppRegistry.registerComponent(appName, () => App);
