
#!/bin/bash

# GlowSnap CLI Automation Script
# Usage: ./download_png.sh "Markdown Content" config --p 20 --r 20 ...

CONTENT="$1"
shift # Remove content from args

# Optional: Skip the "config" keyword if present in the user's command
if [[ "$1" == "config" ]]; then
    shift
fi

# Base64 encode the content for URL safety (UTF-8 compatible)
ENCODED_CONTENT=$(echo -n "$CONTENT" | base64 | tr -d '\n' | tr '+' '-' | tr '/' '_')

# Start building the URL
BASE_URL="http://localhost:3000"
URL="${BASE_URL}/?export=true&content=${ENCODED_CONTENT}"

# Parse the remaining flags into URL parameters
while [[ "$#" -gt 0 ]]; do
    case $1 in
        --p) URL="${URL}&p=$2"; shift ;;
        --r) URL="${URL}&r=$2"; shift ;;
        --f) URL="${URL}&f=$2"; shift ;;
        --a) URL="${URL}&a=$2"; shift ;;
        --s) URL="${URL}&s=${2//#/}"; shift ;; # Remove # from hex
        --e) URL="${URL}&e=${2//#/}"; shift ;; # Remove # from hex
        --c) URL="${URL}&c=${2//#/}"; shift ;; # Remove # from hex
        --cr) URL="${URL}&cr=$2"; shift ;;
        --cx) URL="${URL}&cx=$2"; shift ;;
        --cy) URL="${URL}&cy=$2"; shift ;;
        *) echo "Unknown flag: $1" ;;
    esac
    shift
done

echo "🔗 Generating mockup with URL: $URL"
echo "🚀 Opening browser to trigger automated export..."

# Open in default browser
if [[ "$OSTYPE" == "darwin"* ]]; then
    open "$URL"
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    xdg-open "$URL"
else
    echo "Please open this URL manually: $URL"
fi

echo "✅ Done. Check your downloads folder for the PNG file."
