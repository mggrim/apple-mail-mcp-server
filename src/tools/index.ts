/**
 * Tool implementations for Apple Mail MCP Server
 */

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import * as mailService from '../services/mail.js';
import * as schemas from '../schemas/index.js';

/**
 * Register all Apple Mail tools with the MCP server
 */
export function registerTools(server: McpServer): void {
  
  // ===== EMAIL SEARCH & READING =====
  
  server.registerTool(
    'apple_mail_search',
    {
      title: 'Search Apple Mail',
      description: `Search for emails in Apple Mail by various criteria.

This tool searches through your Apple Mail messages, supporting multiple filter criteria like sender, subject, content, and mailbox. Perfect for finding specific emails, filtering by sender, or locating receipts and important messages.

Args:
  - query (string, optional): General search text to match against subject and content
  - sender (string, optional): Filter by sender email or name
  - subject (string, optional): Filter by subject line (partial match)
  - mailbox (string, optional): Mailbox name (e.g., 'INBOX', 'Sent', 'Receipts')
  - account (string, optional): Account name to search within
  - unread_only (boolean): Only return unread emails (default: false)
  - limit (number): Maximum results to return, 1-100 (default: 50)

Returns:
  JSON object with schema:
  {
    "count": number,              // Number of emails found
    "query": string,              // Original search query
    "emails": [
      {
        "id": string,             // Message ID for use in other tools
        "subject": string,        // Email subject
        "sender": string,         // Sender address
        "date": string,           // Date received
        "read": boolean,          // Whether email has been read
        "flagged": boolean,       // Whether email is flagged
        "content": string         // Email body (first 500 chars)
      }
    ]
  }

Examples:
  - Find receipts: {"query": "receipt", "unread_only": true}
  - Emails from boss: {"sender": "boss@company.com", "limit": 20}
  - Search in folder: {"mailbox": "Work", "subject": "meeting"}
  
Error Handling:
  - Returns empty results if no matches found
  - Returns error if Apple Mail is not accessible`,
      inputSchema: schemas.SearchEmailsSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true
      }
    },
    // @ts-expect-error - Complex Zod schema types cause TypeScript to hit type instantiation depth limit
    async (params: schemas.SearchEmailsInput): Promise<CallToolResult> => {
      try {
        const emails = await mailService.searchEmails({
          query: params.query,
          sender: params.sender,
          subject: params.subject,
          mailbox: params.mailbox,
          account: params.account,
          unreadOnly: params.unread_only,
          limit: params.limit
        });
        
        // Truncate content for search results
        const truncatedEmails = emails.map(email => ({
          id: email.id,
          subject: email.subject,
          sender: email.sender,
          date: email.date,
          read: email.read,
          flagged: email.flagged,
          content: email.content.substring(0, 500) + (email.content.length > 500 ? '...' : '')
        }));
        
        const output = {
          count: emails.length,
          query: params.query || 'all',
          emails: truncatedEmails
        };
        
        return {
          content: [
            {
              type: 'text' as const,
              text: JSON.stringify(output, null, 2)
            }
          ],
          structuredContent: output
        };
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error';
        return {
          content: [{
            type: 'text' as const,
            text: `Error searching emails: ${errorMsg}`
          }],
          isError: true
        };
      }
    }
  );
  
  server.registerTool(
    'apple_mail_get_email',
    {
      title: 'Get Email Details',
      description: `Get full details of a specific email by its message ID.

This tool retrieves the complete information for a single email message, including full content, all recipients, attachments info, and metadata. Use this after searching to get the complete email.

Args:
  - message_id (string): Message ID from search results
  - mailbox (string, optional): Mailbox name for faster lookup
  - account (string, optional): Account name for faster lookup

Returns:
  JSON object with schema:
  {
    "id": string,                 // Message ID
    "subject": string,            // Email subject
    "sender": string,             // Sender address
    "recipients": string[],       // List of recipient addresses
    "date": string,               // Date received
    "read": boolean,              // Read status
    "flagged": boolean,           // Flagged status
    "mailbox": string,            // Mailbox name
    "account": string,            // Account name
    "hasAttachments": boolean,    // Whether email has attachments
    "attachmentCount": number,    // Number of attachments
    "content": string             // Full email body
  }

Examples:
  - Get email details: {"message_id": "12345"}
  - With mailbox hint: {"message_id": "12345", "mailbox": "INBOX"}

Error Handling:
  - Returns null if message not found
  - Returns error if Apple Mail is not accessible`,
      inputSchema: schemas.GetEmailSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false
      }
    },
    // @ts-expect-error - Complex Zod schema types cause TypeScript to hit type instantiation depth limit
    async (params: schemas.GetEmailInput): Promise<CallToolResult> => {
      try {
        const email = await mailService.getEmailById(
          params.message_id,
          params.mailbox,
          params.account
        );
        
        if (!email) {
          return {
            content: [{
              type: 'text' as const,
              text: `Email with ID ${params.message_id} not found`
            }],
            isError: true
          };
        }
        
        return {
          content: [
            {
              type: 'text' as const,
              text: JSON.stringify(email, null, 2)
            }
          ],
          structuredContent: email as unknown as { [x: string]: unknown }
        };
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error';
        return {
          content: [{
            type: 'text' as const,
            text: `Error getting email: ${errorMsg}`
          }],
          isError: true
        };
      }
    }
  );
  
  server.registerTool(
    'apple_mail_list_mailboxes',
    {
      title: 'List Mailboxes',
      description: `Get a list of all mailboxes/folders across all accounts.

This tool retrieves all available mailboxes in Apple Mail, including folder names, associated accounts, and message counts. Useful for understanding mail organization and choosing targets for search or move operations.

Returns:
  JSON object with schema:
  {
    "count": number,              // Total number of mailboxes
    "mailboxes": [
      {
        "name": string,           // Mailbox/folder name
        "account": string,        // Associated account name
        "unreadCount": number,    // Number of unread messages
        "totalCount": number      // Total messages in mailbox
      }
    ]
  }

Examples:
  - List all folders: {} (no parameters needed)

Error Handling:
  - Returns error if Apple Mail is not accessible`,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false
      }
    },
    async (): Promise<CallToolResult> => {
      try {
        const mailboxes = await mailService.listMailboxes();
        
        const output = {
          count: mailboxes.length,
          mailboxes
        };
        
        return {
          content: [
            {
              type: 'text' as const,
              text: JSON.stringify(output, null, 2)
            }
          ],
          structuredContent: output
        };
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error';
        return {
          content: [{
            type: 'text' as const,
            text: `Error listing mailboxes: ${errorMsg}`
          }],
          isError: true
        };
      }
    }
  );
  
  server.registerTool(
    'apple_mail_get_attachments',
    {
      title: 'Get Email Attachments',
      description: `Get list of attachments for a specific email.

This tool retrieves information about attachments in an email without downloading them. Useful for checking what files are attached before deciding to process them.

Args:
  - message_id (string): Message ID from search results

Returns:
  JSON object with schema:
  {
    "count": number,              // Number of attachments
    "messageId": string,          // Original message ID
    "attachments": [
      {
        "name": string,           // Attachment filename
        "size": number,           // File size (if available)
        "type": string            // File type (if available)
      }
    ]
  }

Examples:
  - List attachments: {"message_id": "12345"}

Error Handling:
  - Returns empty array if no attachments
  - Returns error if message not found or Apple Mail is not accessible`,
      inputSchema: schemas.GetAttachmentsSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false
      }
    },
    // @ts-expect-error - Complex Zod schema types cause TypeScript to hit type instantiation depth limit
    async (params: schemas.GetAttachmentsInput): Promise<CallToolResult> => {
      try {
        const attachments = await mailService.getAttachments(params.message_id);
        
        const output = {
          count: attachments.length,
          messageId: params.message_id,
          attachments
        };
        
        return {
          content: [
            {
              type: 'text' as const,
              text: JSON.stringify(output, null, 2)
            }
          ],
          structuredContent: output
        };
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error';
        return {
          content: [{
            type: 'text' as const,
            text: `Error getting attachments: ${errorMsg}`
          }],
          isError: true
        };
      }
    }
  );
  
  // ===== EMAIL MANAGEMENT =====
  
  server.registerTool(
    'apple_mail_move_email',
    {
      title: 'Move Email to Folder',
      description: `Move an email to a different mailbox/folder.

This tool moves an email from its current location to a different mailbox. Useful for organizing emails, filing receipts, or archiving messages.

Args:
  - message_id (string): Message ID to move
  - target_mailbox (string): Destination mailbox name (e.g., 'Archive', 'Receipts')
  - target_account (string, optional): Destination account if moving between accounts

Returns:
  JSON object with schema:
  {
    "success": boolean,           // Whether move succeeded
    "messageId": string,          // Original message ID
    "targetMailbox": string       // Destination mailbox
  }

Examples:
  - Archive email: {"message_id": "12345", "target_mailbox": "Archive"}
  - Move to receipts: {"message_id": "67890", "target_mailbox": "Receipts"}

Error Handling:
  - Returns success: false if move fails
  - Returns error if message or mailbox not found`,
      inputSchema: schemas.MoveEmailSchema,
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false
      }
    },
    // @ts-expect-error - Complex Zod schema types cause TypeScript to hit type instantiation depth limit
    async (params: schemas.MoveEmailInput): Promise<CallToolResult> => {
      try {
        const success = await mailService.moveEmail(
          params.message_id,
          params.target_mailbox,
          params.target_account
        );
        
        const output = {
          success,
          messageId: params.message_id,
          targetMailbox: params.target_mailbox
        };
        
        return {
          content: [
            {
              type: 'text' as const,
              text: JSON.stringify(output, null, 2)
            }
          ],
          structuredContent: output
        };
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error';
        return {
          content: [{
            type: 'text' as const,
            text: `Error moving email: ${errorMsg}`
          }],
          isError: true
        };
      }
    }
  );
  
  server.registerTool(
    'apple_mail_mark_read',
    {
      title: 'Mark Email Read/Unread',
      description: `Mark an email as read or unread.

This tool changes the read status of an email. Useful for marking important emails as unread for follow-up or marking batch emails as read.

Args:
  - message_id (string): Message ID to update
  - read (boolean): true to mark as read, false to mark as unread

Returns:
  JSON object with schema:
  {
    "success": boolean,           // Whether update succeeded
    "messageId": string,          // Original message ID
    "read": boolean               // New read status
  }

Examples:
  - Mark as read: {"message_id": "12345", "read": true}
  - Mark as unread: {"message_id": "67890", "read": false}

Error Handling:
  - Returns success: false if update fails
  - Returns error if message not found`,
      inputSchema: schemas.SetReadStatusSchema,
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false
      }
    },
    // @ts-expect-error - Complex Zod schema types cause TypeScript to hit type instantiation depth limit
    async (params: schemas.SetReadStatusInput): Promise<CallToolResult> => {
      try {
        const success = await mailService.setReadStatus(
          params.message_id,
          params.read
        );
        
        const output = {
          success,
          messageId: params.message_id,
          read: params.read
        };
        
        return {
          content: [
            {
              type: 'text' as const,
              text: JSON.stringify(output, null, 2)
            }
          ],
          structuredContent: output
        };
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error';
        return {
          content: [{
            type: 'text' as const,
            text: `Error updating read status: ${errorMsg}`
          }],
          isError: true
        };
      }
    }
  );
  
  // ===== EMAIL CREATION =====
  
  server.registerTool(
    'apple_mail_create_draft',
    {
      title: 'Create Draft Email',
      description: `Create a new draft email in Apple Mail.

This tool creates a draft email that can be reviewed and edited in Apple Mail before sending. The draft is saved but not sent, giving you full control over when to send it.

Args:
  - subject (string): Email subject line
  - to (string[]): List of recipient email addresses (required)
  - cc (string[], optional): CC recipients
  - bcc (string[], optional): BCC recipients
  - content (string): Email body content
  - account (string, optional): Account to create draft in (uses default if not specified)

Returns:
  JSON object with schema:
  {
    "success": boolean,           // Whether draft was created
    "messageId": string,          // Draft message ID
    "subject": string,            // Email subject
    "recipientCount": number      // Total number of recipients
  }

Examples:
  - Simple draft: {
      "subject": "Meeting Follow-up",
      "to": ["colleague@company.com"],
      "content": "Thanks for the great meeting today..."
    }
  - With CC: {
      "subject": "Project Update",
      "to": ["team@company.com"],
      "cc": ["manager@company.com"],
      "content": "Here's the latest progress..."
    }

Error Handling:
  - Returns error if recipient email addresses are invalid
  - Returns error if Apple Mail is not accessible`,
      inputSchema: schemas.CreateDraftSchema,
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: false,
        openWorldHint: false
      }
    },
    // @ts-expect-error - Complex Zod schema types cause TypeScript to hit type instantiation depth limit
    async (params: schemas.CreateDraftInput): Promise<CallToolResult> => {
      try {
        const messageId = await mailService.createDraft({
          subject: params.subject,
          to: params.to,
          cc: params.cc,
          bcc: params.bcc,
          content: params.content,
          account: params.account
        });
        
        const recipientCount = params.to.length + 
                             (params.cc?.length || 0) + 
                             (params.bcc?.length || 0);
        
        const output = {
          success: true,
          messageId,
          subject: params.subject,
          recipientCount
        };
        
        return {
          content: [
            {
              type: 'text' as const,
              text: JSON.stringify(output, null, 2)
            }
          ],
          structuredContent: output
        };
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error';
        return {
          content: [{
            type: 'text' as const,
            text: `Error creating draft: ${errorMsg}`
          }],
          isError: true
        };
      }
    }
  );
  
  server.registerTool(
    'apple_mail_send_email',
    {
      title: 'Send Email',
      description: `Send an email immediately through Apple Mail.

IMPORTANT: This tool sends emails immediately without further confirmation. Use with caution and only when you're certain the email should be sent.

This tool creates and sends an email in one operation. For drafts that need review before sending, use apple_mail_create_draft instead.

Args:
  - subject (string): Email subject line
  - to (string[]): List of recipient email addresses (required)
  - cc (string[], optional): CC recipients
  - bcc (string[], optional): BCC recipients
  - content (string): Email body content
  - account (string, optional): Account to send from (uses default if not specified)

Returns:
  JSON object with schema:
  {
    "success": boolean,           // Whether email was sent
    "messageId": string,          // Sent message ID (if successful)
    "error": string,              // Error message (if failed)
    "subject": string,            // Email subject
    "recipientCount": number      // Total number of recipients
  }

Examples:
  - Send email: {
      "subject": "Quick Question",
      "to": ["colleague@company.com"],
      "content": "Could you send me the report?"
    }

Error Handling:
  - Returns success: false with error message if send fails
  - Returns error if recipient email addresses are invalid
  - Returns error if Apple Mail is not accessible

WARNING: This sends emails immediately. Double-check all parameters before calling.`,
      inputSchema: schemas.SendEmailSchema,
      annotations: {
        readOnlyHint: false,
        destructiveHint: true,  // Sending email is destructive
        idempotentHint: false,  // Can't unsend
        openWorldHint: false
      }
    },
    async (params: schemas.SendEmailInput): Promise<CallToolResult> => {
      try {
        const result = await mailService.sendEmail({
          subject: params.subject,
          to: params.to,
          cc: params.cc,
          bcc: params.bcc,
          content: params.content,
          account: params.account
        });
        
        const recipientCount = params.to.length + 
                             (params.cc?.length || 0) + 
                             (params.bcc?.length || 0);
        
        const output = {
          success: result.success,
          messageId: result.messageId || '',
          error: result.error,
          subject: params.subject,
          recipientCount
        };
        
        return {
          content: [
            {
              type: 'text' as const,
              text: JSON.stringify(output, null, 2)
            }
          ],
          structuredContent: output
        };
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error';
        return {
          content: [{
            type: 'text' as const,
            text: `Error sending email: ${errorMsg}`
          }],
          isError: true
        };
      }
    }
  );
  
  server.registerTool(
    'apple_mail_list_accounts',
    {
      title: 'List Email Accounts',
      description: `Get a list of all email accounts configured in Apple Mail.

This tool retrieves information about all email accounts, useful for understanding available accounts when creating drafts or searching specific accounts.

Returns:
  JSON object with schema:
  {
    "count": number,              // Number of accounts
    "accounts": [
      {
        "name": string,           // Account name/label
        "type": string,           // Account type (imap, pop, exchange, etc.)
        "email": string           // Email address
      }
    ]
  }

Examples:
  - List accounts: {} (no parameters needed)

Error Handling:
  - Returns error if Apple Mail is not accessible`,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false
      }
    },
    async (): Promise<CallToolResult> => {
      try {
        const accounts = await mailService.listAccounts();
        
        const output = {
          count: accounts.length,
          accounts
        };
        
        return {
          content: [
            {
              type: 'text' as const,
              text: JSON.stringify(output, null, 2)
            }
          ],
          structuredContent: output
        };
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error';
        return {
          content: [{
            type: 'text' as const,
            text: `Error listing accounts: ${errorMsg}`
          }],
          isError: true
        };
      }
    }
  );
}
