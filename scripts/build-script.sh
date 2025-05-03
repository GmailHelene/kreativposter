#!/bin/bash
# build-production.sh - Script for å bygge produksjonsversjon av KreativPoster

# Farger for terminalen
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== KreativPoster Produksjonsbygg ===${NC}"
echo -e "${BLUE}======================================${NC}"

# Sjekk at Node.js er installert
if ! command -v node &> /dev/null; then
    echo -e "${RED}Node.js er ikke installert. Vennligst installer Node.js for å fortsette.${NC}"
    exit 1
fi

NODE_VERSION=$(node -v)
echo -e "${GREEN}Bruker Node.js versjon:${NC} $NODE_VERSION"

# Sjekk at npm er installert
if ! command -v npm &> /dev/null; then
    echo -e "${RED}npm er ikke installert. Vennligst installer npm for å fortsette.${NC}"
    exit 1
fi

NPM_VERSION=$(npm -v)
echo -e "${GREEN}Bruker npm versjon:${NC} $NPM_VERSION"

# Lag en timestamped byggmappe
BUILD_DIR="build_$(date +%Y%m%d_%H%M%S)"
echo -e "${BLUE}Byggmappe:${NC} $BUILD_DIR"

# Rydd opp tidligere byggfiler
echo -e "${YELLOW}Rydder tidligere byggfiler...${NC}"
rm -rf dist

# Installer avhengigheter
echo -e "${YELLOW}Installerer avhengigheter...${NC}"
npm ci

# Kjør linting
echo -e "${YELLOW}Kjører linting...${NC}"
npm run lint

# Hvis linting feiler, spør om å fortsette
if [ $? -ne 0 ]; then
    echo -e "${RED}Linting feilet. Vil du fortsette? (y/n)${NC}"
    read -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${RED}Avbryter bygg.${NC}"
        exit 1
    fi
fi

# Kjør tester
echo -e "${YELLOW}Kjører tester...${NC}"
npm test -- --watchAll=false

# Hvis tester feiler, spør om å fortsette
if [ $? -ne 0 ]; then
    echo -e "${RED}Tester feilet. Vil du fortsette? (y/n)${NC}"
    read -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${RED}Avbryter bygg.${NC}"
        exit 1
    fi
fi

# Kjør kodebase cleanup
echo -e "${YELLOW}Rydder kodebasen...${NC}"
node cleanup.js

# Optimaliser bilder
echo -e "${YELLOW}Optimaliserer bilder...${NC}"
node optimize-images.js

# Bygg produksjonsversjon
echo -e "${YELLOW}Bygger produksjonsversjon...${NC}"
NODE_ENV=production npm run build

# Verifiser bygg
if [ ! -d "dist" ]; then
    echo -e "${RED}Bygging feilet. 'dist' mappen ble ikke opprettet.${NC}"
    exit 1
fi

# Lag byggartefakt
echo -e "${YELLOW}Lager byggartefakt...${NC}"
mkdir -p $BUILD_DIR
cp -r dist/* $BUILD_DIR/

# Lag en manifest-fil for denne versjonen
echo -e "${YELLOW}Genererer versjonsinformasjon...${NC}"
VERSION=$(node -p "require('./package.json').version")
BUILD_DATE=$(date +"%Y-%m-%d %H:%M:%S")
GIT_HASH=$(git rev-parse --short HEAD 2>/dev/null || echo "unknown")

cat > $BUILD_DIR/version.json << EOL
{
  "version": "$VERSION",
  "buildDate": "$BUILD_DATE",
  "gitHash": "$GIT_HASH",
  "nodeVersion": "$NODE_VERSION",
  "npmVersion": "$NPM_VERSION"
}
EOL

# Kjør ytelsesanalyse
echo -e "${YELLOW}Kjører ytelsesanalyse...${NC}"
if command -v npx &> /dev/null; then
    echo "Filstørrelser:"
    du -sh $BUILD_DIR
    du -sh $BUILD_DIR/* | sort -hr
    
    echo -e "\nJavaScript-bundles:"
    find $BUILD_DIR -name "*.js" -type f -exec du -sh {} \; | sort -hr | head -10
    
    echo -e "\nCSS-filer:"
    find $BUILD_DIR -name "*.css" -type f -exec du -sh {} \; | sort -hr
    
    echo -e "\nTotal størrelse:"
    du -sh $BUILD_DIR
else
    echo -e "${RED}npx er ikke tilgjengelig, hopper over ytelsesanalyse.${NC}"
fi

# Generer zip-fil av bygget
echo -e "${YELLOW}Genererer distribusjonspakke...${NC}"
ZIP_FILE="kreativposter_v${VERSION}_$(date +%Y%m%d).zip"
if command -v zip &> /dev/null; then
    zip -r $ZIP_FILE $BUILD_DIR
    echo -e "${GREEN}Distribusjonspakke generert:${NC} $ZIP_FILE"
else
    echo -e "${RED}zip-kommandoen er ikke tilgjengelig, hopper over pakking.${NC}"
fi

echo -e "${GREEN}=== Bygging fullført! ===${NC}"
echo -e "${GREEN}Produksjonsfilene er tilgjengelige i:${NC} $BUILD_DIR"
echo -e "${GREEN}For å teste dette bygget lokalt, kjør:${NC} npx serve $BUILD_DIR"
echo
echo -e "${BLUE}Neste steg:${NC}"
echo -e "1. Test bygget på en staging-server"
echo -e "2. Verifiser at alt fungerer som forventet"
echo -e "3. Deploy til produksjon"
echo
echo -e "${YELLOW}Takk for at du bruker KreativPoster!${NC}"
