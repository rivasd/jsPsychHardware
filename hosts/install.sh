#!/bin/bash

# Hello! this bash script is meant to install our extension and native app at the right place 
# and set the right entries in their respective manifest files.

# The code is copied almost verbatim from https://chromium.googlesource.com/chromium/src/+/master/chrome/common/extensions/docs/examples/api/nativeMessaging/host/install_host.sh

set -e

DIR="$( cd "$( dirname "$0" )" && pwd )"
if [ "$(uname -s)" == "Darwin" ]; then
  if [ "$(whoami)" == "root" ]; then
    TARGET_DIR="/Library/Google/Chrome/NativeMessagingHosts"
  else
    TARGET_DIR="$HOME/Library/Application Support/Google/Chrome/NativeMessagingHosts"
  fi
else
  if [ "$(whoami)" == "root" ]; then
	echo "You are root! destroyer of worlds!"
    TARGET_DIR="/etc/opt/chrome/native-messaging-hosts"
  else
	echo "You are but a measly peasant, user"
    TARGET_DIR="$HOME/.config/google-chrome/NativeMessagingHosts"
  fi
fi

HOST_NAME=com.cogcommtl.hardware
# Create directory to store native messaging host.
mkdir -p "$TARGET_DIR"
# Copy native messaging host manifest.
cp "$DIR/$HOST_NAME.json" "$TARGET_DIR"
# Update host path in the manifest.o "the host name is $HOST_NAME"


# Set directory paths
HOST_PATH=$DIR/testnative.py
ESCAPED_HOST_PATH=${HOST_PATH////\\/}

echo "the target directory is $TARGET_DIR"
echo "the host name is $HOST_NAME"

sed -i -e "s/HOST_PATH/$ESCAPED_HOST_PATH/" "$TARGET_DIR/$HOST_NAME.json"
# Set permissions for the manifest so that all users can read it.
chmod o+r "$TARGET_DIR/$HOST_NAME.json"

# Our messaging host will need to have root privileges in order to directly take control of the ports (e.g. the parallel port)
# There is simply no way around that. Since non-root users will run the host, I will use the setuid bit on the executable, meaning that if
# I change the owner of our executable to root, then it will execute AS root even if a simple user runs it. This means that this install script
# must be run as root using sudo.
# chown root "$HOST_PATH"
# chmod +s "$HOST_PATH"
chmod a+x "$HOST_PATH"

echo "Native messaging host $HOST_NAME has been installed."
