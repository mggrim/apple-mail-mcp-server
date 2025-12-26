#!/bin/bash

# Apple Mail MCP Server - Quick Install Script
# Usage: ./install.sh [--claude-desktop] [--claude-code]

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "🚀 Installing Apple Mail MCP Server..."

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build
echo "🔨 Building..."
npm run build

# Function to update Claude Desktop config
setup_claude_desktop() {
    CONFIG_FILE="$HOME/Library/Application Support/Claude/claude_desktop_config.json"
    
    if [ ! -f "$CONFIG_FILE" ]; then
        echo "⚠️  Claude Desktop config not found. Creating..."
        mkdir -p "$(dirname "$CONFIG_FILE")"
        echo '{}' > "$CONFIG_FILE"
    fi
    
    echo "⚙️  Configuring Claude Desktop..."
    
    # Use jq if available, otherwise manual edit
    if command -v jq &> /dev/null; then
        tmp=$(mktemp)
        jq --arg path "$SCRIPT_DIR/dist/index.js" \
           '.mcpServers["apple-mail"] = {
              "command": "node",
              "args": [$path],
              "env": {"TRANSPORT": "stdio"}
            }' "$CONFIG_FILE" > "$tmp"
        mv "$tmp" "$CONFIG_FILE"
        echo "✅ Claude Desktop configured!"
    else
        echo "⚠️  jq not found. Please manually add this to $CONFIG_FILE:"
        echo ""
        echo '{
  "mcpServers": {
    "apple-mail": {
      "command": "node",
      "args": ["'$SCRIPT_DIR'/dist/index.js"],
      "env": {"TRANSPORT": "stdio"}
    }
  }
}'
    fi
}

# Function to update Claude Code config
setup_claude_code() {
    CONFIG_FILE="$HOME/.config/claude/config.json"
    
    if [ ! -f "$CONFIG_FILE" ]; then
        echo "⚠️  Claude Code config not found. Creating..."
        mkdir -p "$(dirname "$CONFIG_FILE")"
        echo '{}' > "$CONFIG_FILE"
    fi
    
    echo "⚙️  Configuring Claude Code..."
    
    if command -v jq &> /dev/null; then
        tmp=$(mktemp)
        jq --arg path "$SCRIPT_DIR/dist/index.js" \
           '.mcpServers["apple-mail"] = {
              "command": "node",
              "args": [$path],
              "env": {"TRANSPORT": "stdio"}
            }' "$CONFIG_FILE" > "$tmp"
        mv "$tmp" "$CONFIG_FILE"
        echo "✅ Claude Code configured!"
    else
        echo "⚠️  jq not found. Please manually add config to $CONFIG_FILE"
    fi
}

# Parse arguments
SETUP_DESKTOP=false
SETUP_CODE=false

if [ $# -eq 0 ]; then
    # No arguments, ask user
    read -p "Configure for Claude Desktop? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        SETUP_DESKTOP=true
    fi
    
    read -p "Configure for Claude Code? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        SETUP_CODE=true
    fi
else
    # Process command line arguments
    for arg in "$@"; do
        case $arg in
            --claude-desktop)
                SETUP_DESKTOP=true
                ;;
            --claude-code)
                SETUP_CODE=true
                ;;
        esac
    done
fi

# Run setup
if [ "$SETUP_DESKTOP" = true ]; then
    setup_claude_desktop
fi

if [ "$SETUP_CODE" = true ]; then
    setup_claude_code
fi

echo ""
echo "✨ Installation complete!"
echo ""
echo "📍 Server installed at: $SCRIPT_DIR"
echo ""

if [ "$SETUP_DESKTOP" = true ]; then
    echo "🔄 Please restart Claude Desktop for changes to take effect"
fi

if [ "$SETUP_CODE" = true ]; then
    echo "🔄 Claude Code will pick up changes automatically"
fi

echo ""
echo "📚 For more info, see: $SCRIPT_DIR/README.md"
