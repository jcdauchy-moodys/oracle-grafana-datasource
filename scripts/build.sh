#/bin/sh
# Installing mage
go install github.com/magefile/mage
# Load project version
PKG_VERSION=$(cat ./package.json | jq -r ".version")
# First, clean the project and prevous releases
echo "Removing old files..."
rm -rf ./dist/ ./node_modules/ ./*.tar.gz
# Compile it again
echo "Compiling code..."
npm ci && npm run build && mage -v
