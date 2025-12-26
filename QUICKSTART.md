# Quick Start Guide

## 🚀 Get Running in 5 Minutes

### Step 1: Install Dependencies

```bash
npm install
```

### Step 2: Build the Server

```bash
npm run build
```

### Step 3: Start the Server

```bash
npm start
```

You should see:
```
🚀 Apple Mail MCP Server running on http://localhost:3000/mcp
📧 Available tools:
   - search_emails: Search for emails
   - get_email_content: Get full email details
   - list_attachments: List email attachments
   - list_mailboxes: List all mailboxes
   - move_email: Move email to folder
   - mark_email: Mark as read/unread
   - create_draft: Create draft email
   - send_email: Send draft email
```

### Step 4: Connect to Claude

#### For Claude.ai (Web)

1. Go to claude.ai
2. Settings → Integrations → Add MCP Server
3. Enter URL: `http://localhost:3000/mcp`
4. Name: "Apple Mail"
5. Save

#### For Claude Desktop App

Add to your Claude desktop configuration:

```json
{
  "mcpServers": {
    "apple-mail": {
      "url": "http://localhost:3000/mcp"
    }
  }
}
```

#### For Claude Code (CLI)

```bash
claude mcp add --transport http apple-mail http://localhost:3000/mcp
```

#### For VS Code with Copilot

```bash
code --add-mcp '{"name":"apple-mail","type":"http","url":"http://localhost:3000/mcp"}'
```

### Step 5: Test It Out!

Try asking Claude:

```
"List all my mailboxes"

"Search for emails from Amazon with receipts"

"Find unread emails from this week"
```

## First-Time Setup: Permissions

macOS will likely prompt you to grant permissions:

1. **System Preferences → Security & Privacy → Privacy → Automation**
2. Find "Terminal" or "Node" 
3. Enable "Apple Mail"

If you don't see the prompt:
- Quit Apple Mail
- Restart your MCP server
- Apple Mail will launch automatically when needed

## Common First Commands

### See what mailboxes you have
```
"List all my mailboxes with unread counts"
```

### Find specific emails
```
"Search for emails from john@example.com"
"Find all emails with 'invoice' in the subject"
```

### Organize emails
```
"Move emails from sender@domain.com to Archive"
"Mark all unread emails from yesterday as read"
```

### Create drafts
```
"Create a draft email to team@company.com thanking them for their work on the project"
```

## Running on Different Port

```bash
PORT=8080 npm start
```

Then use `http://localhost:8080/mcp` as your URL.

## Keeping It Running

### Option 1: Run in Background (Terminal)

```bash
npm start &
```

### Option 2: Use PM2 (Recommended for Long-Term)

```bash
# Install PM2 globally
npm install -g pm2

# Start server with PM2
pm2 start dist/index.js --name apple-mail-mcp

# Server will auto-restart if it crashes
pm2 save
pm2 startup

# View logs
pm2 logs apple-mail-mcp
```

### Option 3: Use Screen/Tmux

```bash
# Create a screen session
screen -S mail-mcp

# Start server
npm start

# Detach: Ctrl+A, then D
# Reattach: screen -r mail-mcp
```

## Troubleshooting First Run

### "Cannot find module" error
```bash
npm install
npm run build
```

### "Port already in use"
```bash
# Use different port
PORT=8080 npm start
```

### "Apple Mail not responding"
- Open Apple Mail manually
- Make sure you're signed into your accounts
- Try the server again

### Server starts but Claude can't connect
```bash
# Test server is running
curl http://localhost:3000/health

# Should return: {"status":"healthy","server":"apple-mail-mcp-server"}
```

## Next Steps

Once running, check out:
- [README.md](README.md) - Full documentation
- [Tool Reference](README.md#tool-reference) - Complete tool documentation
- [Usage Examples](README.md#usage-examples) - Real-world examples

## Tips for Best Results

1. **Be specific in searches**: "emails from Amazon about orders" vs "amazon"
2. **Review before bulk operations**: Test on a few emails first
3. **Use message IDs**: Search first, then operate on specific emails
4. **Check mailbox names**: Use `list_mailboxes` to see exact names

Happy emailing! 📧
