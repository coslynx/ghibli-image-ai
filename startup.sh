#!/bin/bash

# Ghibli Image Generator MVP - Local Development Startup Script
# This script checks prerequisites, installs dependencies if needed,
# checks for the OpenAI API key in .env, and starts the development server using 'vercel dev'.

# Exit immediately if a command exits with a non-zero status.
set -e
# Treat unset variables as an error when substituting.
set -u
# Return value of a pipeline is the status of the last command to exit with a non-zero status,
# or zero if no command exited with a non-zero status.
set -o pipefail

# --- Prerequisite Checks ---
echo "Checking prerequisites..."

# 1. Check Node.js version (must be >= 18)
if command -v node >/dev/null 2>&1; then
    NODE_VERSION_MAJOR=$(node --version | cut -d. -f1 | sed 's/v//')
    if [ "$NODE_VERSION_MAJOR" -lt 18 ]; then
        echo "Error: Node.js version 18 or higher is required. Found version: $(node --version)" >&2
        echo "Please update Node.js." >&2
        exit 1
    fi
    echo "  [✓] Node.js version: $(node --version) (>= v18 required)"
else
    echo "Error: Node.js not found. Please install Node.js version 18 or higher." >&2
    exit 1
fi

# 2. Check Vercel CLI
if ! command -v vercel >/dev/null 2>&1; then
    echo "Error: Vercel CLI not found. Please install it globally using 'npm install -g vercel'." >&2
    exit 1
fi
echo "  [✓] Vercel CLI found: $(vercel --version)"

# 3. Detect Package Manager and check availability
PACKAGE_MANAGER=""
INSTALL_COMMAND=""
if [ -f "yarn.lock" ]; then
    PACKAGE_MANAGER="yarn"
    INSTALL_COMMAND="yarn install"
    if ! command -v yarn >/dev/null 2>&1; then
        echo "Error: yarn.lock found, but 'yarn' command not found. Please install yarn." >&2
        exit 1
    fi
    echo "  [✓] Package manager: yarn (yarn.lock found)"
elif [ -f "package-lock.json" ]; then
    PACKAGE_MANAGER="npm"
    INSTALL_COMMAND="npm install"
    if ! command -v npm >/dev/null 2>&1; then
        echo "Error: package-lock.json found, but 'npm' command not found. Please install npm (usually comes with Node.js)." >&2
        exit 1
    fi
     echo "  [✓] Package manager: npm (package-lock.json found)"
else
    # Default to npm if no lock file, but still check command
    PACKAGE_MANAGER="npm"
    INSTALL_COMMAND="npm install"
    echo "  [!] No lockfile (yarn.lock or package-lock.json) found. Defaulting to npm." >&2
     if ! command -v npm >/dev/null 2>&1; then
        echo "Error: Defaulting to npm, but 'npm' command not found. Please install npm or create a lock file (yarn.lock/package-lock.json)." >&2
        exit 1
    fi
     echo "  [✓] Package manager: npm (default)"
fi


# --- Dependency Installation ---
# Check if node_modules exists. If not, run the install command.
if [ ! -d "node_modules" ]; then
    echo "Directory 'node_modules' not found. Installing dependencies using ${PACKAGE_MANAGER}..."
    ${INSTALL_COMMAND}
    echo "Dependencies installed successfully."
else
    echo "Directory 'node_modules' found. Skipping dependency installation."
fi

# --- Environment Variable Check ---
# Check for .env file and the presence/value of OPENAI_API_KEY
if [ -f ".env" ]; then
    # Check if the key is the placeholder OR if it's NOT defined uncommented
    # Regex checks:
    # 1. ^ *OPENAI_API_KEY=['\"]?your_openai_api_key_here['\"]? *$ : Matches placeholder, allowing optional quotes/spaces
    # 2. ^ *OPENAI_API_KEY=([^#].*) *$ : Matches defined key (not starting with #), allowing optional spaces
    if grep -Eq "^ *OPENAI_API_KEY=['\"]?your_openai_api_key_here['\"]? *$" ".env" || \
       ! grep -Eq "^ *OPENAI_API_KEY=([^#].*) *$" ".env"; then
        echo ""
        echo "---------------------------------------------------------------------------------" >&2
        echo "Warning: OPENAI_API_KEY is missing, commented out, or uses the placeholder" >&2
        echo "         value ('your_openai_api_key_here') in the '.env' file." >&2
        echo "         Image generation via the API (/api/generate) will likely fail." >&2
        echo "         Please add your actual OpenAI API key to the .env file." >&2
        echo "---------------------------------------------------------------------------------" >&2
        echo ""
    else
         echo "  [✓] Found configured OPENAI_API_KEY in .env"
    fi
else
    echo ""
    echo "---------------------------------------------------------------------------------" >&2
    echo "Warning: '.env' file not found. The backend API (/api/generate) requires an" >&2
    echo "         OPENAI_API_KEY defined in this file to function correctly." >&2
    echo "         Image generation will likely fail." >&2
    echo "---------------------------------------------------------------------------------" >&2
    echo ""
fi

# --- Start Development Server ---
echo "Starting development server with 'vercel dev'..."
echo "(This will run the Vite frontend and Vercel Functions locally)"
echo "Press Ctrl+C to stop."

# Execute vercel dev, handing over control
vercel dev