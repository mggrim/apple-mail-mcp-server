/**
 * Zod schemas for input validation
 */

import { z } from 'zod';

/**
 * Schema for searching emails
 */
export const SearchEmailsSchema = z.object({
  query: z.string()
    .min(1, "Query must be at least 1 character")
    .max(500, "Query must not exceed 500 characters")
    .optional()
    .describe("General search query to match against subject and content"),
  
  sender: z.string()
    .optional()
    .describe("Filter by sender email address or name"),
  
  subject: z.string()
    .optional()
    .describe("Filter by subject line (partial match)"),
  
  mailbox: z.string()
    .optional()
    .describe("Mailbox/folder name to search in (e.g., 'INBOX', 'Sent', 'Archive')"),
  
  account: z.string()
    .optional()
    .describe("Account name to search in"),
  
  unread_only: z.boolean()
    .default(false)
    .describe("Only return unread emails"),
  
  limit: z.number()
    .int()
    .min(1)
    .max(100)
    .default(50)
    .describe("Maximum number of emails to return")
}).strict();

export type SearchEmailsInput = z.infer<typeof SearchEmailsSchema>;

/**
 * Schema for getting email by ID
 */
export const GetEmailSchema = z.object({
  message_id: z.string()
    .describe("Unique message ID from search results"),
  
  mailbox: z.string()
    .optional()
    .describe("Mailbox name where the message is located"),
  
  account: z.string()
    .optional()
    .describe("Account name where the message is located")
}).strict();

export type GetEmailInput = z.infer<typeof GetEmailSchema>;

/**
 * Schema for creating a draft email
 */
export const CreateDraftSchema = z.object({
  subject: z.string()
    .min(1, "Subject is required")
    .max(500, "Subject too long")
    .describe("Email subject line"),
  
  to: z.array(z.string().email("Invalid email address"))
    .min(1, "At least one recipient required")
    .describe("List of recipient email addresses"),
  
  cc: z.array(z.string().email("Invalid email address"))
    .optional()
    .describe("CC recipients (optional)"),
  
  bcc: z.array(z.string().email("Invalid email address"))
    .optional()
    .describe("BCC recipients (optional)"),
  
  content: z.string()
    .describe("Email body content"),
  
  account: z.string()
    .optional()
    .describe("Account to send from (uses default if not specified)")
}).strict();

export type CreateDraftInput = z.infer<typeof CreateDraftSchema>;

/**
 * Schema for sending an email
 */
export const SendEmailSchema = CreateDraftSchema.extend({
  // Same as CreateDraftSchema
});

export type SendEmailInput = z.infer<typeof SendEmailSchema>;

/**
 * Schema for moving an email
 */
export const MoveEmailSchema = z.object({
  message_id: z.string()
    .describe("Message ID to move"),
  
  target_mailbox: z.string()
    .describe("Destination mailbox name"),
  
  target_account: z.string()
    .optional()
    .describe("Destination account (optional)")
}).strict();

export type MoveEmailInput = z.infer<typeof MoveEmailSchema>;

/**
 * Schema for marking emails as read/unread
 */
export const SetReadStatusSchema = z.object({
  message_id: z.string()
    .describe("Message ID to update"),
  
  read: z.boolean()
    .describe("Set to true to mark as read, false for unread")
}).strict();

export type SetReadStatusInput = z.infer<typeof SetReadStatusSchema>;

/**
 * Schema for getting attachments
 */
export const GetAttachmentsSchema = z.object({
  message_id: z.string()
    .describe("Message ID to get attachments from")
}).strict();

export type GetAttachmentsInput = z.infer<typeof GetAttachmentsSchema>;
