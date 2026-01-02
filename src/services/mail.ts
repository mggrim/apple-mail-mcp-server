/**
 * Service for Apple Mail operations using AppleScript
 */

import { executeAppleScript, executeAppleScriptFile, ensureMailRunning } from './applescript.js';
import type { 
  EmailMessage, 
  EmailAttachment, 
  Mailbox, 
  EmailAccount,
  DraftEmail,
  SendEmailResult 
} from '../types.js';

/**
 * Search for emails in Apple Mail
 */
export async function searchEmails(params: {
  query?: string;
  sender?: string;
  subject?: string;
  dateFrom?: string;
  dateTo?: string;
  mailbox?: string;
  account?: string;
  unreadOnly?: boolean;
  limit?: number;
}): Promise<EmailMessage[]> {
  await ensureMailRunning();
  
  const { query, sender, subject, mailbox, account, unreadOnly, limit = 50 } = params;
  
  let script = `
tell application "Mail"
  set matchingMessages to {}
  `;
  
  // Determine which mailbox to search
  if (mailbox && account) {
    script += `set targetMailbox to mailbox "${mailbox}" of account "${account}"\n`;
    script += `set allMessages to every message of targetMailbox\n`;
  } else if (mailbox) {
    script += `set targetMailbox to mailbox "${mailbox}"\n`;
    script += `set allMessages to every message of targetMailbox\n`;
  } else if (account) {
    // Search all messages across all mailboxes in the specified account
    script += `set allMessages to every message of account "${account}"\n`;
  } else {
    // Default to inbox if neither mailbox nor account specified
    script += `set targetMailbox to inbox\n`;
    script += `set allMessages to every message of targetMailbox\n`;
  }
  script += `repeat with aMessage in allMessages\n`;
  
  // Build filter conditions
  const conditions: string[] = [];
  
  if (query) {
    conditions.push(`((subject of aMessage contains "${query}") or (content of aMessage contains "${query}"))`);
  }
  if (sender) {
    conditions.push(`(sender of aMessage contains "${sender}")`);
  }
  if (subject) {
    conditions.push(`(subject of aMessage contains "${subject}")`);
  }
  if (unreadOnly) {
    conditions.push(`(read status of aMessage is false)`);
  }
  
  if (conditions.length > 0) {
    script += `if ${conditions.join(' and ')} then\n`;
    script += `set end of matchingMessages to aMessage\n`;
    script += `end if\n`;
  } else {
    script += `set end of matchingMessages to aMessage\n`;
  }
  
  script += `if (count of matchingMessages) ≥ ${limit} then exit repeat\n`;
  script += `end repeat\n`;
  
  // Format output
  script += `
  set output to ""
  repeat with aMessage in matchingMessages
    set msgId to id of aMessage as text
    set msgSubject to subject of aMessage
    set msgSender to sender of aMessage
    set msgDate to date received of aMessage as text
    set msgRead to read status of aMessage as text
    set msgFlagged to flagged status of aMessage as text
    set msgContent to content of aMessage
    
    set output to output & "MESSAGE_START\\n"
    set output to output & "ID:" & msgId & "\\n"
    set output to output & "SUBJECT:" & msgSubject & "\\n"
    set output to output & "SENDER:" & msgSender & "\\n"
    set output to output & "DATE:" & msgDate & "\\n"
    set output to output & "READ:" & msgRead & "\\n"
    set output to output & "FLAGGED:" & msgFlagged & "\\n"
    set output to output & "CONTENT:" & msgContent & "\\n"
    set output to output & "MESSAGE_END\\n"
  end repeat
  
  return output
end tell
  `;
  
  const result = await executeAppleScriptFile(script);
  return parseEmailMessages(result);
}

/**
 * Get full details of a specific email by ID
 */
export async function getEmailById(messageId: string, mailbox?: string, account?: string): Promise<EmailMessage | null> {
  await ensureMailRunning();
  
  let script = `
tell application "Mail"
  `;
  
  if (mailbox && account) {
    script += `set msgs to (every message of mailbox "${mailbox}" of account "${account}" whose id is ${messageId})\n`;
  } else if (mailbox) {
    script += `set msgs to (every message of mailbox "${mailbox}" whose id is ${messageId})\n`;
  } else {
    script += `set msgs to (every message whose id is ${messageId})\n`;
  }
  
  script += `
  if (count of msgs) = 0 then
    return "NOT_FOUND"
  end if
  
  set aMessage to item 1 of msgs
  set msgId to id of aMessage as text
  set msgSubject to subject of aMessage
  set msgSender to sender of aMessage
  set msgDate to date received of aMessage as text
  set msgRead to read status of aMessage as text
  set msgFlagged to flagged status of aMessage as text
  set msgContent to content of aMessage
  set msgMailbox to name of mailbox of aMessage
  set msgAccount to name of account of mailbox of aMessage
  
  set recipientList to ""
  repeat with recip in to recipients of aMessage
    set recipientList to recipientList & address of recip & ","
  end repeat
  
  set attachCount to count of mail attachments of aMessage
  
  set output to "MESSAGE_START\\n"
  set output to output & "ID:" & msgId & "\\n"
  set output to output & "SUBJECT:" & msgSubject & "\\n"
  set output to output & "SENDER:" & msgSender & "\\n"
  set output to output & "RECIPIENTS:" & recipientList & "\\n"
  set output to output & "DATE:" & msgDate & "\\n"
  set output to output & "READ:" & msgRead & "\\n"
  set output to output & "FLAGGED:" & msgFlagged & "\\n"
  set output to output & "MAILBOX:" & msgMailbox & "\\n"
  set output to output & "ACCOUNT:" & msgAccount & "\\n"
  set output to output & "ATTACHMENT_COUNT:" & attachCount & "\\n"
  set output to output & "CONTENT:" & msgContent & "\\n"
  set output to output & "MESSAGE_END\\n"
  
  return output
end tell
  `;
  
  const result = await executeAppleScriptFile(script);
  
  if (result === 'NOT_FOUND') {
    return null;
  }
  
  const emails = parseEmailMessages(result);
  return emails[0] || null;
}

/**
 * Get list of all mailboxes
 */
export async function listMailboxes(): Promise<Mailbox[]> {
  await ensureMailRunning();
  
  const script = `
tell application "Mail"
  set output to ""
  repeat with anAccount in accounts
    set accountName to name of anAccount
    repeat with aMailbox in mailboxes of anAccount
      set mailboxName to name of aMailbox
      set unreadCount to unread count of aMailbox
      set totalCount to count of messages of aMailbox
      
      set output to output & "MAILBOX_START\\n"
      set output to output & "NAME:" & mailboxName & "\\n"
      set output to output & "ACCOUNT:" & accountName & "\\n"
      set output to output & "UNREAD:" & unreadCount & "\\n"
      set output to output & "TOTAL:" & totalCount & "\\n"
      set output to output & "MAILBOX_END\\n"
    end repeat
  end repeat
  return output
end tell
  `;
  
  const result = await executeAppleScriptFile(script);
  return parseMailboxes(result);
}

/**
 * List email accounts
 */
export async function listAccounts(): Promise<EmailAccount[]> {
  await ensureMailRunning();
  
  const script = `
tell application "Mail"
  set output to ""
  repeat with anAccount in accounts
    set accountName to name of anAccount
    set accountType to account type of anAccount as text
    
    set output to output & "ACCOUNT_START\\n"
    set output to output & "NAME:" & accountName & "\\n"
    set output to output & "TYPE:" & accountType & "\\n"
    set output to output & "ACCOUNT_END\\n"
  end repeat
  return output
end tell
  `;
  
  const result = await executeAppleScriptFile(script);
  return parseAccounts(result);
}

/**
 * Create a draft email
 */
export async function createDraft(draft: DraftEmail): Promise<string> {
  await ensureMailRunning();
  
  const toList = draft.to.map((addr: string) => `"${addr}"`).join(', ');
  const ccList = draft.cc ? draft.cc.map((addr: string) => `"${addr}"`).join(', ') : '';
  const bccList = draft.bcc ? draft.bcc.map((addr: string) => `"${addr}"`).join(', ') : '';
  
  let script = `
tell application "Mail"
  set newMessage to make new outgoing message with properties {subject:"${draft.subject}", content:"${draft.content}", visible:false}
  
  tell newMessage
    `;
  
  // Add recipients
  for (const addr of draft.to) {
    script += `make new to recipient with properties {address:"${addr}"}\n`;
  }
  
  if (draft.cc) {
    for (const addr of draft.cc) {
      script += `make new cc recipient with properties {address:"${addr}"}\n`;
    }
  }
  
  if (draft.bcc) {
    for (const addr of draft.bcc) {
      script += `make new bcc recipient with properties {address:"${addr}"}\n`;
    }
  }
  
  script += `
  end tell
  
  return id of newMessage as text
end tell
  `;
  
  const messageId = await executeAppleScriptFile(script);
  return messageId;
}

/**
 * Send an email (creates and sends immediately)
 */
export async function sendEmail(draft: DraftEmail): Promise<SendEmailResult> {
  await ensureMailRunning();
  
  try {
    let script = `
tell application "Mail"
  set newMessage to make new outgoing message with properties {subject:"${draft.subject}", content:"${draft.content}", visible:false}
  
  tell newMessage
    `;
    
    // Add recipients
    for (const addr of draft.to) {
      script += `make new to recipient with properties {address:"${addr}"}\n`;
    }
    
    if (draft.cc) {
      for (const addr of draft.cc) {
        script += `make new cc recipient with properties {address:"${addr}"}\n`;
      }
    }
    
    if (draft.bcc) {
      for (const addr of draft.bcc) {
        script += `make new bcc recipient with properties {address:"${addr}"}\n`;
      }
    }
    
    script += `
    send
  end tell
  
  return id of newMessage as text
end tell
    `;
    
    const messageId = await executeAppleScriptFile(script);
    
    return {
      success: true,
      messageId
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Move email to a different mailbox
 */
export async function moveEmail(messageId: string, targetMailbox: string, targetAccount?: string): Promise<boolean> {
  await ensureMailRunning();
  
  let script = `
tell application "Mail"
  set theMessage to first message whose id is ${messageId}
  `;
  
  if (targetAccount) {
    script += `set targetBox to mailbox "${targetMailbox}" of account "${targetAccount}"\n`;
  } else {
    script += `set targetBox to mailbox "${targetMailbox}"\n`;
  }
  
  script += `
  set mailbox of theMessage to targetBox
  return "SUCCESS"
end tell
  `;
  
  try {
    await executeAppleScriptFile(script);
    return true;
  } catch {
    return false;
  }
}

/**
 * Mark email as read or unread
 */
export async function setReadStatus(messageId: string, read: boolean): Promise<boolean> {
  await ensureMailRunning();
  
  const script = `
tell application "Mail"
  set theMessage to first message whose id is ${messageId}
  set read status of theMessage to ${read}
  return "SUCCESS"
end tell
  `;
  
  try {
    await executeAppleScriptFile(script);
    return true;
  } catch {
    return false;
  }
}

/**
 * Get list of attachments for an email
 */
export async function getAttachments(messageId: string): Promise<EmailAttachment[]> {
  await ensureMailRunning();
  
  const script = `
tell application "Mail"
  set theMessage to first message whose id is ${messageId}
  set output to ""
  
  repeat with anAttachment in mail attachments of theMessage
    set attachName to name of anAttachment
    set output to output & "ATTACHMENT_START\\n"
    set output to output & "NAME:" & attachName & "\\n"
    set output to output & "ATTACHMENT_END\\n"
  end repeat
  
  return output
end tell
  `;
  
  const result = await executeAppleScriptFile(script);
  return parseAttachments(result);
}

// Parser functions

function parseEmailMessages(output: string): EmailMessage[] {
  const messages: EmailMessage[] = [];
  const messageBlocks = output.split('MESSAGE_START\n').filter(Boolean);
  
  for (const block of messageBlocks) {
    if (!block.includes('MESSAGE_END')) continue;
    
    const content = block.substring(0, block.indexOf('MESSAGE_END'));
    const lines = content.split('\n').filter(Boolean);
    
    const message: Partial<EmailMessage> = {};
    
    for (const line of lines) {
      const [key, ...valueParts] = line.split(':');
      const value = valueParts.join(':').trim();
      
      switch (key) {
        case 'ID':
          message.id = value;
          break;
        case 'SUBJECT':
          message.subject = value;
          break;
        case 'SENDER':
          message.sender = value;
          break;
        case 'RECIPIENTS':
          message.recipients = value.split(',').filter(Boolean);
          break;
        case 'DATE':
          message.date = value;
          break;
        case 'READ':
          message.read = value === 'true';
          break;
        case 'FLAGGED':
          message.flagged = value === 'true';
          break;
        case 'MAILBOX':
          message.mailbox = value;
          break;
        case 'ACCOUNT':
          message.account = value;
          break;
        case 'ATTACHMENT_COUNT':
          message.attachmentCount = parseInt(value);
          message.hasAttachments = parseInt(value) > 0;
          break;
        case 'CONTENT':
          message.content = value;
          break;
      }
    }
    
    if (message.id && message.subject) {
      messages.push(message as EmailMessage);
    }
  }
  
  return messages;
}

function parseMailboxes(output: string): Mailbox[] {
  const mailboxes: Mailbox[] = [];
  const mailboxBlocks = output.split('MAILBOX_START\n').filter(Boolean);
  
  for (const block of mailboxBlocks) {
    if (!block.includes('MAILBOX_END')) continue;
    
    const content = block.substring(0, block.indexOf('MAILBOX_END'));
    const lines = content.split('\n').filter(Boolean);
    
    const mailbox: Partial<Mailbox> = {};
    
    for (const line of lines) {
      const [key, ...valueParts] = line.split(':');
      const value = valueParts.join(':').trim();
      
      switch (key) {
        case 'NAME':
          mailbox.name = value;
          break;
        case 'ACCOUNT':
          mailbox.account = value;
          break;
        case 'UNREAD':
          mailbox.unreadCount = parseInt(value);
          break;
        case 'TOTAL':
          mailbox.totalCount = parseInt(value);
          break;
      }
    }
    
    if (mailbox.name && mailbox.account !== undefined) {
      mailboxes.push(mailbox as Mailbox);
    }
  }
  
  return mailboxes;
}

function parseAccounts(output: string): EmailAccount[] {
  const accounts: EmailAccount[] = [];
  const accountBlocks = output.split('ACCOUNT_START\n').filter(Boolean);
  
  for (const block of accountBlocks) {
    if (!block.includes('ACCOUNT_END')) continue;
    
    const content = block.substring(0, block.indexOf('ACCOUNT_END'));
    const lines = content.split('\n').filter(Boolean);
    
    const account: Partial<EmailAccount> = { email: '' };
    
    for (const line of lines) {
      const [key, ...valueParts] = line.split(':');
      const value = valueParts.join(':').trim();
      
      switch (key) {
        case 'NAME':
          account.name = value;
          break;
        case 'TYPE':
          account.type = value;
          break;
      }
    }
    
    if (account.name && account.type) {
      accounts.push(account as EmailAccount);
    }
  }
  
  return accounts;
}

function parseAttachments(output: string): EmailAttachment[] {
  const attachments: EmailAttachment[] = [];
  const attachmentBlocks = output.split('ATTACHMENT_START\n').filter(Boolean);
  
  for (const block of attachmentBlocks) {
    if (!block.includes('ATTACHMENT_END')) continue;
    
    const content = block.substring(0, block.indexOf('ATTACHMENT_END'));
    const lines = content.split('\n').filter(Boolean);
    
    const attachment: Partial<EmailAttachment> = {};
    
    for (const line of lines) {
      const [key, ...valueParts] = line.split(':');
      const value = valueParts.join(':').trim();
      
      if (key === 'NAME') {
        attachment.name = value;
      }
    }
    
    if (attachment.name) {
      attachments.push(attachment as EmailAttachment);
    }
  }
  
  return attachments;
}
