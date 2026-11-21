#!/usr/bin/env bash
# Ferramentas Android usadas pelos scripts do projeto. Só vale enquanto o script roda:
# o terminal e o ~/.bashrc da pessoa não são alterados.
# JDK 17 e Android SDK instalados na pasta do usuário (veja app/README.md).
export JAVA_HOME="${JAVA_HOME:-$HOME/.local/share/jdk-17}"
export ANDROID_HOME="${ANDROID_HOME:-$HOME/Android/Sdk}"
export PATH="$JAVA_HOME/bin:$ANDROID_HOME/platform-tools:$ANDROID_HOME/emulator:$ANDROID_HOME/cmdline-tools/latest/bin:$PATH"
