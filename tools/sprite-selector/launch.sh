#!/bin/bash
# Lane B Sprite Selector — Launch Script

echo "========================================"
echo "Lane B Sprite Selector Tool"
echo "WattWise — Pixel Art Sprite Mapping"
echo "========================================"
echo ""
echo "Starting local HTTP server..."
echo ""

cd /Users/ayushmanchaudhuri/LifeHack2026

echo "Server starting on http://localhost:8765"
echo ""
echo "Open this URL in your browser:"
echo ""
echo "  http://localhost:8765/tools/sprite-selector/"
echo ""
echo "Press Ctrl+C to stop the server"
echo "========================================"
echo ""

python3 -m http.server 8765
