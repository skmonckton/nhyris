# Original code: Copyright (c) 2018 Dirk Schumacher, Noam Ross, Rich FitzJohn
# Updated code: Copyright (c) 2023 Jinhwan Kim
# Further updates by Spencer K. Monckton
#!/usr/bin/env bash
set -e

# Detect operating system
OS_TYPE="unknown"
if [ "$OSTYPE" != "" ] && echo "$OSTYPE" | grep -q "^darwin"; then
    OS_TYPE="macos"
elif [ "$OSTYPE" = "msys" ] || [ "$OSTYPE" = "cygwin" ] || echo "$OSTYPE" | grep -q "^win"; then
    OS_TYPE="windows"
elif [ "$(uname)" = "Linux" ]; then
    OS_TYPE="linux"
fi

# Define the R version explicitly
# Chosen for compatibility with specific dependencies
R_VERSION="4.5.0"
R_DIR="r-nhyris"
mkdir -p "$R_DIR"
cd "$R_DIR"

if [ "$OS_TYPE" = "macos" ]; then
    # macOS installation
    R_URL="https://cloud.r-project.org/bin/macosx/big-sur-arm64/base/R-${R_VERSION}-arm64.pkg"
    echo "Installing R version: $R_VERSION for macOS (arm64)"
    # Download and extract the main Mac Resources directory
    curl -o latest_r.pkg "$R_URL"
    xar -xf latest_r.pkg
    rm -r Resources tcltk.pkg texinfo.pkg Distribution latest_r.pkg
    cat R-fw.pkg/Payload | gunzip -dc | cpio -i
    mv R.framework/Versions/Current/Resources/* .
    rm -r R-fw.pkg R.framework
    # Remove the hardcoded R_HOME_DIR conditional and replace with dynamic assignment
    sed -i.bak '/^if test "\${R_HOME_DIR}"/,/^fi$/d' bin/R
    sed -i.bak 's;/Library/Frameworks/R.framework/Resources;${R_HOME_DIR};g' bin/R
    # Insert R_HOME_DIR assignment at the top of the script after the shebang
    sed -i.bak "2a\\
R_HOME_DIR=\$(cd \"\$(dirname \"\$0\")/..\" && pwd)
" bin/R
    chmod +x bin/R
    rm -f bin/R.bak
    # Remove unnecessary files
    rm -r doc tests
    rm -r lib/*.dSYM

elif [ "$OS_TYPE" = "windows" ]; then
    # Windows installation
    R_WIN_URL="https://cloud.r-project.org/bin/windows/base/old/${R_VERSION}/R-${R_VERSION}-win.exe"
    echo "Installing R version: $R_VERSION for Windows"
    # Download R installer
    curl -L -o R-installer.exe "$R_WIN_URL"
    # Innoextract for Windows (unzip the installer)
    if [ ! -d "innoextract_dir" ]; then
        curl -L -o innoextract.zip "https://constexpr.org/innoextract/files/innoextract-1.9-windows.zip"
        unzip innoextract.zip -d innoextract_dir
        rm innoextract.zip
        ./innoextract_dir/innoextract.exe --silent R-installer.exe
        mv app/* .
        rm -r innoextract_dir
    fi
    rm -r app R-installer.exe
    rm -r doc tests Tcl

    elif [ "$OS_TYPE" = "linux" ]; then
        # Linux (Ubuntu) installation
        echo "Installing R version: $R_VERSION for Linux (prebuilt)"
        R_URL="https://cdn.posit.co/r/ubuntu-2404/R-${R_VERSION}-ubuntu-2404.tar.gz"
        curl -L -o r-prebuilt.tar.gz "$R_URL"
        mkdir -p r-extracted
        tar -xzf r-prebuilt.tar.gz -C r-extracted
        cp -r r-extracted/${R_VERSION}/lib/R/* .
        # Create directory structure the binary expects
        sudo mkdir -p /opt/R/${R_VERSION}/lib
        sudo ln -s "$(pwd)" /opt/R/${R_VERSION}/lib/R
        rm -rf r-extracted r-prebuilt.tar.gz
    fi