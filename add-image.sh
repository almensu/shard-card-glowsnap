#!/bin/bash

# GlowSnap Image Mode CLI Script
# Usage: ./add-image.sh /path/to/image.png [--p 60] [--r 16] [--s 3b82f6] [--e 9333ea] [--a 135] ...

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if image path is provided
if [[ -z "$1" ]]; then
    echo -e "${RED}❌ Error: No image path provided${NC}"
    echo ""
    echo "Usage: ./add-image.sh <path-to-image> [options]"
    echo ""
    echo "Example:"
    echo "  ./add-image.sh ./photo.png --p 60 --r 20 --s ff0000 --e 0000ff"
    echo ""
    echo "Options:"
    echo "  --p <value>   Padding (default: 60)"
    echo "  --r <value>   Border radius (default: 16)"
    echo "  --a <value>   Gradient angle (default: 135)"
    echo "  --s <hex>     Start color (default: 3b82f6)"
    echo "  --e <hex>     End color (default: 9333ea)"
    echo "  --c <hex>     Accent color (enables Color C)"
    echo "  --cr <value>  Accent color range (default: 50)"
    echo "  --cx <value>  Accent color X position (default: 50)"
    echo "  --cy <value>  Accent color Y position (default: 50)"
    exit 1
fi

IMAGE_PATH="$1"
shift # Remove image path from args

# Check if file exists
if [[ ! -f "$IMAGE_PATH" ]]; then
    echo -e "${RED}❌ Error: File not found: $IMAGE_PATH${NC}"
    exit 1
fi

# Get file extension and mime type
FILE_EXTENSION="${IMAGE_PATH##*.}"
case "$FILE_EXTENSION" in
    png) MIME_TYPE="image/png" ;;
    jpg|jpeg) MIME_TYPE="image/jpeg" ;;
    gif) MIME_TYPE="image/gif" ;;
    webp) MIME_TYPE="image/webp" ;;
    *)
        echo -e "${YELLOW}⚠️  Warning: Unknown file type .$FILE_EXTENSION, trying PNG${NC}"
        MIME_TYPE="image/png"
        ;;
esac

# Build URL parameters
BASE_URL="http://localhost:3001"
URL_PARAMS="?mode=image&export=true"

# Parse flags into URL parameters
while [[ "$#" -gt 0 ]]; do
    case $1 in
        --p) URL_PARAMS="${URL_PARAMS}&p=$2"; shift ;;
        --r) URL_PARAMS="${URL_PARAMS}&r=$2"; shift ;;
        --f) URL_PARAMS="${URL_PARAMS}&f=$2"; shift ;;
        --a) URL_PARAMS="${URL_PARAMS}&a=$2"; shift ;;
        --s) URL_PARAMS="${URL_PARAMS}&s=${2//#/}"; shift ;;
        --e) URL_PARAMS="${URL_PARAMS}&e=${2//#/}"; shift ;;
        --c) URL_PARAMS="${URL_PARAMS}&c=${2//#/}"; shift ;;
        --cr) URL_PARAMS="${URL_PARAMS}&cr=$2"; shift ;;
        --cx) URL_PARAMS="${URL_PARAMS}&cx=$2"; shift ;;
        --cy) URL_PARAMS="${URL_PARAMS}&cy=$2"; shift ;;
        *)
            echo -e "${YELLOW}⚠️  Unknown flag: $1 (skipping)${NC}"
            ;;
    esac
    shift
done

# Create temp directory
TEMP_DIR=$(mktemp -d)
DATA_FILE="$TEMP_DIR/image_data.json"
SERVER_PORT=19567

# Convert image to base64 and create JSON
echo -e "${GREEN}📷 Reading image: $IMAGE_PATH${NC}"
IMAGE_BASE64=$(base64 -i "$IMAGE_PATH")

# Create JSON file with image data
cat > "$DATA_FILE" << EOF
{
  "mimeType": "${MIME_TYPE}",
  "imageData": "${IMAGE_BASE64}",
  "baseUrl": "${BASE_URL}",
  "urlParams": "${URL_PARAMS}"
}
EOF

IMAGE_SIZE=${#IMAGE_BASE64}

# Create a simple HTTP server in Python
PYTHON_SERVER="$TEMP_DIR/server.py"
cat > "$PYTHON_SERVER" << 'PYEOF'
import http.server
import socketserver
import json
import os
from urllib.parse import parse_qs

PORT = 19567
DATA_FILE = None  # Will be set below

class ImageHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        if self.path == '/image-data':
            # Read and return the JSON data
            if DATA_FILE and os.path.exists(DATA_FILE):
                with open(DATA_FILE, 'r') as f:
                    data = f.read()
                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(data.encode())
            else:
                self.send_error(404, "Data file not found")
        elif self.path == '/' or self.path == '/index.html':
            # Serve the launcher page
            html = '''<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>GlowSnap - Processing...</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 100vh;
            margin: 0;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
        }
        .spinner {
            border: 4px solid rgba(255,255,255,0.3);
            border-top: 4px solid white;
            border-radius: 50%;
            width: 50px;
            height: 50px;
            animation: spin 1s linear infinite;
        }
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        p { margin-top: 20px; font-size: 18px; }
        #status { font-size: 14px; opacity: 0.8; margin-top: 10px; }
    </style>
</head>
<body>
    <div class="spinner"></div>
    <p id="message">Loading GlowSnap...</p>
    <p id="status">Fetching image data...</p>

    <script>
        async function loadImageData() {
            try {
                const response = await fetch('/image-data');
                const data = await response.json();

                document.getElementById('status').textContent = 'Opening application...';

                const iframe = document.createElement('iframe');
                iframe.style.position = 'fixed';
                iframe.style.top = '0';
                iframe.style.left = '0';
                iframe.style.width = '100%';
                iframe.style.height = '100%';
                iframe.style.border = 'none';
                iframe.style.zIndex = '1000';

                iframe.onload = function() {
                    document.getElementById('message').textContent = 'Processing image...';
                    document.getElementById('status').textContent = 'Sending image to GlowSnap...';

                    const dataUrl = "data:" + data.mimeType + ";base64," + data.imageData.trim();
                    iframe.contentWindow.postMessage({
                        type: 'glowsnap_image',
                        imageData: dataUrl
                    }, '*');

                    setTimeout(() => {
                        document.body.innerHTML = '<div class="spinner"></div><p>Processing complete!</p><p style="font-size:14px;opacity:0.8">Your image is being downloaded...</p>';
                        setTimeout(() => window.close(), 3000);
                    }, 2000);
                };

                iframe.src = data.baseUrl + "/" + data.urlParams;
                document.body.appendChild(iframe);

            } catch (error) {
                document.body.innerHTML = '<p style="color:#ff6b6b">Error: ' + error.message + '</p>';
            }
        }

        loadImageData();
    </script>
</body>
</html>'''
            self.send_response(200)
            self.send_header('Content-Type', 'text/html')
            self.end_headers()
            self.wfile.write(html.encode())
        else:
            self.send_error(404)

    def log_message(self, format, *args):
        pass  # Suppress log messages

if __name__ == '__main__':
    import sys
    DATA_FILE = sys.argv[1] if len(sys.argv) > 1 else 'image_data.json'
    with socketserver.TCPServer(("", PORT), ImageHandler) as httpd:
        httpd.serve_forever()
PYEOF

# Update DATA_FILE path in Python script
echo "DATA_FILE = '$DATA_FILE'" >> "$PYTHON_SERVER"

echo -e "${GREEN}🔗 Generating mockup...${NC}"
echo -e "${BLUE}📦 Image size: ${IMAGE_SIZE} characters${NC}"
echo -e "${GREEN}🚀 Starting local server and opening browser...${NC}"
echo ""

# Start Python server in background
python3 "$PYTHON_SERVER" "$DATA_FILE" > /dev/null 2>&1 &
SERVER_PID=$!

# Wait for server to start
sleep 1

# Open browser to the local server
if [[ "$OSTYPE" == "darwin"* ]]; then
    open "http://localhost:$SERVER_PORT/"
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    xdg-open "http://localhost:$SERVER_PORT/"
else
    echo -e "${YELLOW}Open: http://localhost:$SERVER_PORT/${NC}"
fi

# Clean up after delay
(sleep 15 && kill $SERVER_PID 2>/dev/null && rm -rf "$TEMP_DIR") &

echo ""
echo -e "${GREEN}✅ Browser opened! Processing and downloading...${NC}"
echo -e "${YELLOW}💡 The image will be saved to your Downloads folder.${NC}"
