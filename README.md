# Apple Mail MCP Server

MCP (Model Context Protocol) server for integrating Apple Mail with Claude Desktop and Claude Code.

## Features

- 🔍 Search emails by query, sender, subject, mailbox
- 📧 Read full email details including attachments
- 📁 List and manage mailboxes
- ✉️ Create drafts and send emails
- 📌 Mark emails as read/unread
- 🔄 Move emails between folders
- 👤 List email accounts

## Installation

### On Your First Mac

```bash
git clone <your-repo-url>
cd apple-mail-mcp-server
npm install
npm run build
```

### Configure Claude Desktop

Add to `~/Library/Application Support/Claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "apple-mail": {
      "command": "node",
      "args": ["<path-to-repo>/apple-mail-mcp-server/dist/index.js"],
      "env": {
        "TRANSPORT": "stdio"
      }
    }
  }
}
```

### Configure Claude Code

Add to `~/.config/claude/config.json`:

```json
{
  "mcpServers": {
    "apple-mail": {
      "command": "node",
      "args": ["<path-to-repo>/apple-mail-mcp-server/dist/index.js"],
      "env": {
        "TRANSPORT": "stdio"
      }
    }
  }
}
```

## On Additional Macs

1. Clone the repository to the **same path** on each Mac (recommended)
2. Run `npm install && npm run build`
3. Copy your Claude config from the first Mac, or update paths if different

## Development

```bash
npm run dev     # Run with auto-reload
npm run build   # Compile TypeScript
npm start       # Run the server
```

## Available Tools

- `apple_mail_search` - Search for emails
- `apple_mail_get_email` - Get full email details  
- `apple_mail_list_mailboxes` - List all mailboxes
- `apple_mail_get_attachments` - List email attachments
- `apple_mail_move_email` - Move email to folder
- `apple_mail_mark_read` - Mark as read/unread
- `apple_mail_create_draft` - Create draft email
- `apple_mail_send_email` - Send email immediately
- `apple_mail_list_accounts` - List all accounts

## Requirements

- macOS with Apple Mail
- Node.js >= 18
- Claude Desktop or Claude Code

## License

MIT
