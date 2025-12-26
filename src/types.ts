/**
 * Type definitions for Apple Mail MCP Server
 */

export interface EmailMessage {
  id: string;
  subject: string;
  sender: string;
  recipients?: string[];
  date: string;
  read: boolean;
  flagged: boolean;
  mailbox?: string;
  account?: string;
  attachmentCount?: number;
  hasAttachments?: boolean;
  content: string;
}

export interface EmailAttachment {
  name: string;
}

export interface Mailbox {
  name: string;
  account: string;
  unreadCount?: number;
  totalCount?: number;
}

export interface EmailAccount {
  name: string;
  email: string;
  type?: string;
}

export interface DraftEmail {
  subject: string;
  to: string[];
  cc?: string[];
  bcc?: string[];
  content: string;
  account?: string;
}

export interface SendEmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}
