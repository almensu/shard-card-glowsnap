
#!/bin/bash

# GlowSnap Professional Starter
echo "🚀 Initializing GlowSnap local environment..."

# 1. Port Management: Ensure port 3000 is available
PORT=3000
echo "🔍 Checking if port $PORT is occupied..."

# Check for process on port 3000 (cross-platform approach)
if [[ "$OSTYPE" == "darwin"* ]] || [[ "$OSTYPE" == "linux-gnu"* ]]; then
    OCCUPIED_PID=$(lsof -ti :$PORT)
    if [ ! -z "$OCCUPIED_PID" ]; then
        echo "⚠️  Port $PORT is occupied by PID $OCCUPIED_PID. Attempting to free it..."
        kill -9 $OCCUPIED_PID
        sleep 1 # Wait for port to clear
        echo "✅ Port $PORT is now free."
    else
        echo "✅ Port $PORT is available."
    fi
fi

# 2. API Key Management
# Try to source zshrc to get the ZHIPU_API_KEY if not already in environment
if [ -f "$HOME/.zshrc" ]; then
    echo "🔍 Sourcing ~/.zshrc for ZHIPU_API_KEY..."
    # Extract the variable without full sourcing to avoid script side-effects
    export ZHIPU_API_KEY=$(zsh -c 'source ~/.zshrc && echo $ZHIPU_API_KEY')
fi

# Map ZHIPU_API_KEY to the application's required API_KEY
if [ ! -z "$ZHIPU_API_KEY" ]; then
    export API_KEY=$ZHIPU_API_KEY
    echo "✅ Successfully mapped ZHIPU_API_KEY to API_KEY."
else
    echo "⚠️  Warning: ZHIPU_API_KEY not found in environment or ~/.zshrc."
fi

# 3. Detect Package Manager and Start
if command -v bun &> /dev/null; then
    echo "📦 Using Bun to start development server..."
    bun install && bun dev
elif command -v npm &> /dev/null; then
    echo "📦 Using NPM to start development server..."
    npm install && npm run dev
else
    echo "❌ Error: No modern package manager (bun/npm) found."
    exit 1
fi
