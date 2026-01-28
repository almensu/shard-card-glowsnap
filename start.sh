
#!/bin/bash

# GlowSnap Professional Starter
echo "🚀 Initializing GlowSnap local environment..."

# 1. Port Management: Ensure port 3000 is available
PORT=3000
echo "🔍 Checking if port $PORT is occupied..."

# Check for process on port 3000 (cross-platform approach)
if command -v lsof &> /dev/null; then
    OCCUPIED_PID=$(lsof -ti :$PORT)
    if [ ! -z "$OCCUPIED_PID" ]; then
        echo "⚠️  Port $PORT is occupied by PID $OCCUPIED_PID. Attempting to free it..."
        kill -9 $OCCUPIED_PID
        sleep 1 # Wait for port to clear
        echo "✅ Port $PORT is now free."
    fi
else
    echo "ℹ️  'lsof' not found, skipping port check. If port $PORT is busy, the start might fail."
fi

# 2. Dependency Management & Tool Detection
# Determine package manager based on lockfiles or availability
if [ -f "bun.lockb" ] || command -v bun &> /dev/null; then
    PKG_MANAGER="bun"
    INSTALL_CMD="bun install"
    DEV_CMD="bun dev"
elif [ -f "package-lock.json" ] || command -v npm &> /dev/null; then
    PKG_MANAGER="npm"
    INSTALL_CMD="npm install"
    DEV_CMD="npm run dev"
else
    echo "❌ Error: No modern package manager (bun/npm) found."
    exit 1
fi

echo "📦 Using $PKG_MANAGER as the package manager."

# 3. Ensure Dependencies are installed
if [ ! -d "node_modules" ]; then
    echo "📡 node_modules not found. Installing dependencies..."
    $INSTALL_CMD
else
    echo "✅ node_modules found. Verifying dependencies..."
    # Run install anyway to ensure everything is up to date (usually fast if no changes)
    $INSTALL_CMD
fi

# 4. Start Development Server
echo "🚀 Starting development server on port $PORT..."
$DEV_CMD
