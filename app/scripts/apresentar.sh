#!/usr/bin/env bash
# Apresentação do Doa Aqui no computador: abre o emulador Android, instala o APK de release
# (que já leva o JavaScript dentro, sem precisar do Metro) e abre o app.
# Uso: npm run apresentar   (na pasta app/)
set -euo pipefail
cd "$(dirname "$0")/.."
source scripts/ambiente.sh

AVD="${AVD:-DoaAqui_Pixel}"
APK=android/app/build/outputs/apk/release/app-release.apk

if [ ! -f "$APK" ]; then
  echo "Gerando o APK de release (na primeira vez leva alguns minutos)..."
  (cd android && ./gradlew assembleRelease)
fi

if ! adb devices | grep -q "^emulator-"; then
  echo "Abrindo o emulador $AVD..."
  nohup emulator -avd "$AVD" -no-boot-anim > /tmp/doaaqui-emulador.log 2>&1 &
fi

echo "Esperando o Android iniciar..."
adb wait-for-device
until [ "$(adb shell getprop sys.boot_completed 2>/dev/null | tr -d '\r')" = "1" ]; do sleep 2; done

echo "Instalando o Doa Aqui..."
adb install -r "$APK" > /dev/null
adb shell am start -n br.fatec.doaaqui/.MainActivity > /dev/null
echo "Pronto: o Doa Aqui está aberto no emulador."
