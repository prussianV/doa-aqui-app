#!/usr/bin/env bash
# Executa um comando com o JDK e o Android SDK no PATH. Ex.: bash scripts/com-ambiente.sh adb devices
source "$(dirname "$0")/ambiente.sh"
exec "$@"
