#!/usr/bin/env node

/**
 * Apple Mail MCP Server
 * 
 * Provides MCP tools for interacting with Apple Mail:
 * - Search emails by various criteria
 * - Read email content and attachments
 * - Create drafts and send emails  
 * - Organize emails (move, mark read/unread)
 * - Manage mailboxes and accounts
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import express from 'express';
import { registerTools } from './tools/index.js';

/**
 * Create and configure the MCP server
 */
function createServer(): McpServer {
  const server = new McpServer({
    name: 'apple-mail-mcp-server',
    version: '1.0.0'
  });
  
  // Register all tools
  registerTools(server);
  
  return server;
}

/**
 * Run server with stdio transport (for local CLI usage)
 */
async function runStdio(): Promise<void> {
  const server = createServer();
  const transport = new StdioServerTransport();
  
  await server.connect(transport);
  
  console.error('Apple Mail MCP Server running on stdio');
  console.error('Connected and ready to receive requests');
}

/**
 * Run server with HTTP transport (for remote access)
 */
async function runHTTP(): Promise<void> {
  const app = express();
  app.use(express.json());
  
  const server = createServer();
  
  // Health check endpoint
  app.get('/health', (_req, res) => {
    res.json({ 
      status: 'healthy',
      server: 'apple-mail-mcp-server',
      version: '1.0.0'
    });
  });
  
  // Main MCP endpoint
  app.post('/mcp', async (req, res) => {
    // Create new transport for each request to prevent request ID collisions
    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: undefined,
      enableJsonResponse: true
    });
    
    res.on('close', () => {
      transport.close();
    });
    
    await server.connect(transport);
    await transport.handleRequest(req, res, req.body);
  });
  
  const port = parseInt(process.env.PORT || '3000');
  
  app.listen(port, () => {
    console.error(`\n🚀 Apple Mail MCP Server v1.0.0`);
    console.error(`📧 Running on http://localhost:${port}/mcp`);
    console.error(`💚 Health check: http://localhost:${port}/health`);
    console.error(`\n📝 Available Tools:`);
    console.error(`   • apple_mail_search - Search for emails`);
    console.error(`   • apple_mail_get_email - Get full email details`);
    console.error(`   • apple_mail_list_mailboxes - List all mailboxes`);
    console.error(`   • apple_mail_get_attachments - List email attachments`);
    console.error(`   • apple_mail_move_email - Move email to folder`);
    console.error(`   • apple_mail_mark_read - Mark as read/unread`);
    console.error(`   • apple_mail_create_draft - Create draft email`);
    console.error(`   • apple_mail_send_email - Send email immediately`);
    console.error(`   • apple_mail_list_accounts - List all accounts`);
    console.error(`\n✨ Ready to connect in Claude.ai!\n`);
  }).on('error', (error) => {
    console.error('Server error:', error);
    process.exit(1);
  });
}

/**
 * Main entry point
 */
async function main(): Promise<void> {
  const transport = process.env.TRANSPORT || 'http';
  
  if (process.argv.includes('--help') || process.argv.includes('-h')) {
    console.log(`
╔══════════════════════════════════════════════════════════════╗
║           Apple Mail MCP Server v1.0.0                       ║
║   Model Context Protocol server for Apple Mail integration   ║
╚══════════════════════════════════════════════════════════════╝

USAGE:
  npm start                    # Run with HTTP transport (default)
  npm run dev                  # Development mode with auto-reload
  TRANSPORT=stdio npm start    # Run with stdio transport
  
ENVIRONMENT VARIABLES:
  TRANSPORT   Transport type: 'stdio' or 'http' (default: http)
  PORT        HTTP server port (default: 3000, only for HTTP transport)

AVAILABLE TOOLS:
  Search & Read:
    • apple_mail_search          Search emails by query, sender, subject
    • apple_mail_get_email       Get full details of specific email
    • apple_mail_list_mailboxes  List all mailboxes/folders
    • apple_mail_get_attachments List email attachments
    
  Organization:
    • apple_mail_move_email      Move email to different folder
    • apple_mail_mark_read       Mark email as read/unread
    
  Composition:
    • apple_mail_create_draft    Create new draft email
    • apple_mail_send_email      Send email immediately
    
  Account Management:
    • apple_mail_list_accounts   List all email accounts

CONNECTION:
  To connect in Claude.ai:
  1. Start the server: npm start
  2. Add connector in Claude.ai settings
  3. Use HTTP URL: http://localhost:3000/mcp

For more information:
  https://github.com/yourusername/apple-mail-mcp-server
    `);
    process.exit(0);
  }
  
  try {
    if (transport === 'http') {
      await runHTTP();
    } else {
      await runStdio();
    }
  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  }
}

// Run the server
main().catch((error) => {
  console.error('Unhandled error:', error);
  process.exit(1);
});
