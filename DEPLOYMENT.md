# Deployment Guide

## Running Your Apple Mail MCP Server

### Development Environment

For local development and testing:

```bash
# Install dependencies
npm install

# Run in development mode (with auto-reload)
npm run dev
```

### Production Deployment

#### Option 1: Simple Background Process

```bash
# Build
npm run build

# Start in background
nohup npm start > server.log 2>&1 &

# Check if running
ps aux | grep node

# View logs
tail -f server.log

# Stop server
pkill -f "node dist/index.js"
```

#### Option 2: PM2 (Recommended)

PM2 provides process management, auto-restart, and log management:

```bash
# Install PM2 globally
npm install -g pm2

# Build your server
npm run build

# Start with PM2
pm2 start dist/index.js --name apple-mail-mcp

# View status
pm2 status

# View logs
pm2 logs apple-mail-mcp

# Stop
pm2 stop apple-mail-mcp

# Restart
pm2 restart apple-mail-mcp

# Make it start on boot
pm2 startup
pm2 save
```

#### Option 3: LaunchAgent (macOS Native)

Create a LaunchAgent plist file for native macOS integration:

```bash
# Create the plist file
cat > ~/Library/LaunchAgents/com.user.apple-mail-mcp.plist << 'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.user.apple-mail-mcp</string>
    <key>ProgramArguments</key>
    <array>
        <string>/usr/local/bin/node</string>
        <string>/path/to/apple-mail-mcp-server/dist/index.js</string>
    </array>
    <key>RunAtLoad</key>
    <true/>
    <key>KeepAlive</key>
    <true/>
    <key>StandardErrorPath</key>
    <string>/tmp/apple-mail-mcp.err</string>
    <key>StandardOutPath</key>
    <string>/tmp/apple-mail-mcp.out</string>
</dict>
</plist>
EOF

# Update the path in the plist file
# Edit: /path/to/apple-mail-mcp-server to your actual path

# Load the agent
launchctl load ~/Library/LaunchAgents/com.user.apple-mail-mcp.plist

# Unload (to stop)
launchctl unload ~/Library/LaunchAgents/com.user.apple-mail-mcp.plist
```

### Environment Configuration

Create a `.env` file for configuration:

```bash
# Server port (default: 3000)
PORT=3000

# Logging level
LOG_LEVEL=info

# Enable/disable specific features
ENABLE_SEND_EMAIL=true
MAX_SEARCH_RESULTS=100
```

Load environment variables in your code:

```typescript
import dotenv from 'dotenv';
dotenv.config();

const port = parseInt(process.env.PORT || '3000');
```

## Connecting Different Claude Clients

### Claude.ai (Web Browser)

1. Navigate to https://claude.ai
2. Go to Settings → Integrations
3. Click "Add MCP Server"
4. Enter:
   - **URL**: `http://localhost:3000/mcp`
   - **Name**: "Apple Mail"
5. Click "Connect"

**Note**: Your server must be running on your local machine.

### Claude Desktop App

Edit your Claude Desktop configuration file:

**macOS**: `~/Library/Application Support/Claude/config.json`

**Windows**: `%APPDATA%/Claude/config.json`

```json
{
  "mcpServers": {
    "apple-mail": {
      "url": "http://localhost:3000/mcp"
    }
  }
}
```

Restart Claude Desktop after saving.

### Claude Code (CLI)

```bash
# Add MCP server
claude mcp add --transport http apple-mail http://localhost:3000/mcp

# List configured servers
claude mcp list

# Remove server
claude mcp remove apple-mail
```

### VS Code with GitHub Copilot

Add via command line:

```bash
code --add-mcp '{"name":"apple-mail","type":"http","url":"http://localhost:3000/mcp"}'
```

Or manually edit VS Code settings:

```json
{
  "github.copilot.mcpServers": {
    "apple-mail": {
      "url": "http://localhost:3000/mcp"
    }
  }
}
```

### Cursor IDE

Edit Cursor settings (Settings → Extensions → MCP):

```json
{
  "mcpServers": {
    "apple-mail": {
      "url": "http://localhost:3000/mcp"
    }
  }
}
```

## Health Monitoring

### Check Server Health

```bash
# Simple health check
curl http://localhost:3000/health

# Should return:
# {"status":"healthy","server":"apple-mail-mcp-server"}
```

### Test MCP Connection

```bash
# Test with MCP Inspector
npx @modelcontextprotocol/inspector http://localhost:3000/mcp
```

### Monitoring Logs

#### With PM2:
```bash
pm2 logs apple-mail-mcp
```

#### With LaunchAgent:
```bash
tail -f /tmp/apple-mail-mcp.out
tail -f /tmp/apple-mail-mcp.err
```

#### With nohup:
```bash
tail -f server.log
```

## Security Considerations

### Local-Only Access (Default)

By default, the server only listens on `localhost` and is not accessible from other machines. This is secure for personal use.

### Network Access (Advanced)

If you need to access from other machines on your network (e.g., from iPad to Mac):

**NOT RECOMMENDED for general use - exposes your email**

```typescript
// In src/index.ts, change:
app.listen(port, '0.0.0.0', () => {
  // Server accessible on network
});
```

Add basic authentication:

```bash
npm install express-basic-auth
```

```typescript
import basicAuth from 'express-basic-auth';

app.use(basicAuth({
  users: { 'username': 'password' },
  challenge: true
}));
```

### macOS Permissions

Required permissions:
- **Automation**: Terminal/Node → Apple Mail
- **Full Disk Access**: May be needed for some operations

Grant in: **System Preferences → Security & Privacy → Privacy**

## Troubleshooting

### Server Won't Start

**Port in use:**
```bash
# Find process using port 3000
lsof -i :3000

# Kill it
kill -9 <PID>

# Or use different port
PORT=8080 npm start
```

**Permission denied:**
```bash
# System Preferences → Security & Privacy → Automation
# Enable: Terminal → Apple Mail
```

**Module not found:**
```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Connection Issues

**Claude can't connect:**

1. Verify server is running:
   ```bash
   curl http://localhost:3000/health
   ```

2. Check firewall:
   ```bash
   # macOS firewall might block
   # System Preferences → Security & Privacy → Firewall → Firewall Options
   # Allow: node
   ```

3. Check port:
   ```bash
   netstat -an | grep 3000
   ```

### AppleScript Errors

**"Apple Mail got an error":**
- Open Apple Mail manually
- Ensure you're signed in
- Try again

**"Not authorized to send Apple events":**
- System Preferences → Security & Privacy → Automation
- Enable automation for Terminal/Node → Mail

## Performance Tuning

### Optimize Search Results

Limit search results for better performance:

```typescript
// In mail-tools.ts
const DEFAULT_LIMIT = 25; // Reduce from 50
```

### Enable Caching (Advanced)

Add simple caching for mailbox lists:

```typescript
let mailboxCache: MailboxInfo[] | null = null;
let cacheTime = 0;
const CACHE_TTL = 60000; // 1 minute

export async function listMailboxes(): Promise<MailboxInfo[]> {
  if (mailboxCache && Date.now() - cacheTime < CACHE_TTL) {
    return mailboxCache;
  }
  
  mailboxCache = await _listMailboxesInternal();
  cacheTime = Date.now();
  return mailboxCache;
}
```

## Backup & Recovery

### Backup Configuration

```bash
# Backup your configuration
cp package.json package.json.backup
cp tsconfig.json tsconfig.json.backup
```

### Export Server Logs

With PM2:
```bash
pm2 save
pm2 logs apple-mail-mcp --lines 1000 > logs-backup.txt
```

## Updates & Maintenance

### Update Dependencies

```bash
# Check for updates
npm outdated

# Update packages
npm update

# Update MCP SDK specifically
npm install @modelcontextprotocol/sdk@latest

# Rebuild
npm run build
```

### Server Updates

```bash
# Stop server
pm2 stop apple-mail-mcp

# Pull updates / make changes
git pull  # if using git

# Install dependencies
npm install

# Build
npm run build

# Start server
pm2 restart apple-mail-mcp
```

## Uninstallation

### Stop Server

```bash
# PM2
pm2 stop apple-mail-mcp
pm2 delete apple-mail-mcp
pm2 save

# LaunchAgent
launchctl unload ~/Library/LaunchAgents/com.user.apple-mail-mcp.plist
rm ~/Library/LaunchAgents/com.user.apple-mail-mcp.plist
```

### Remove from Claude

**Claude.ai**: Settings → Integrations → Remove "Apple Mail"

**Claude Desktop**: Edit config.json and remove the apple-mail entry

**Claude Code**: `claude mcp remove apple-mail`

### Delete Files

```bash
cd ~
rm -rf apple-mail-mcp-server
```

---

## Quick Reference Commands

```bash
# Development
npm run dev                    # Run with auto-reload
npm run build                  # Build TypeScript
npm start                      # Run production build

# PM2
pm2 start dist/index.js --name apple-mail-mcp
pm2 status                     # Check status
pm2 logs apple-mail-mcp       # View logs
pm2 restart apple-mail-mcp    # Restart
pm2 stop apple-mail-mcp       # Stop

# Health Checks
curl http://localhost:3000/health
npx @modelcontextprotocol/inspector http://localhost:3000/mcp

# Troubleshooting
lsof -i :3000                 # Check what's on port 3000
ps aux | grep node            # Find Node processes
tail -f server.log            # View logs
```
