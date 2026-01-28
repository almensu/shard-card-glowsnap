
#!/bin/bash

# GlowSnap Professional Starter
echo "🚀 Initializing GlowSnap local environment..."

# Try to source zshrc to get the ZHIPU_API_KEY if not already in environment
if [ -f "$HOME/.zshrc" ]; then
    echo "🔍 Sourcing ~/.zshrc for ZHIPU_API_KEY..."
    # We use a subshell trick to extract the variable without sourcing the whole file which might have side effects
    export ZHIPU_API_KEY=$(zsh -c 'source ~/.zshrc && echo $ZHIPU_API_KEY')
fi

# Map ZHIPU_API_KEY to the application's required API_KEY
if [ ! -z "$ZHIPU_API_KEY" ]; then
    export API_KEY=$ZHIPU_API_KEY
    echo "✅ Successfully mapped ZHIPU_API_KEY to API_KEY."
else
    echo "⚠️  Warning: ZHIPU_API_KEY not found in environment or ~/.zshrc."
fi

# Detect Package Manager and Start
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
