#!/bin/bash

############################################ CONSTANTS #############################################

readonly CYAN='\033[1;36m'   # light cyan
readonly GRAY='\033[0;90m'   # dark gray
readonly GREEN='\033[1;32m'  # light green
readonly NC='\033[0m'        # default color
readonly RED='\033[0;31m'    # red
readonly YELLOW='\033[1;33m' # yellow

############################################### INIT ###############################################

if [ `whoami` = root ]; then
  echo -e "${RED}Please run this script with normal privileges.${NC}"
  exit 1
fi

if ! command -v mkcert &> /dev/null; then
  # Print error in red text
  echo "Error: mkcert command not found!"
  echo "Please install mkcert to continue."
  echo "Installation instructions:"
  echo "  macOS: brew install mkcert"
  echo "  Debian: apt-get install mkcert libnss3-tools -y"
  echo "  Linux: See https://github.com/FiloSottile/mkcert#installation"
  echo "  Windows: choco install mkcert"
  exit 1
fi

############################################### MAIN ###############################################

mkdir -p cert
cd cert
mkcert -install
mkcert -key-file localhost-key.pem -cert-file localhost.pem localhost

####################################################################################################
