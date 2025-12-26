# Usage Examples

Real-world examples for using the Apple Mail MCP Server with Claude.

## 📧 Receipt Management & Expense Tracking

### Find and Organize All Receipts

**You:** "Search my emails for receipts from the last month and tell me what I need to file"

**Claude will:**
1. Search for emails with "receipt", "invoice", "order confirmation"
2. Get full content of relevant emails
3. List attachments (PDF receipts)
4. Summarize what needs to be filed

**You can then:** "Move all these receipt emails to my Receipts folder"

### Extract Expense Data

**You:** "Find all receipt emails from Amazon, Uber, and hotels from Q4 2024 and create a summary of expenses"

**Claude will:**
1. Search for each sender
2. Get email content and attachments
3. Extract amounts and dates
4. Create an organized summary

### Weekly Receipt Roundup

**You:** "What receipts came in this week? List them with amounts if visible"

**Claude will:**
1. Search emails from the past 7 days
2. Filter for common receipt senders
3. Read email content for amounts
4. Create weekly summary

## 🎓 Academic Email Management

### Managing PhD Student Communications

**You:** "Show me all unread emails from my PhD students this week"

**Claude will:**
1. Search for emails from specific senders
2. Filter for unread status
3. List by student with subjects

**Follow-up:** "Create draft responses acknowledging receipt and asking for specific details about [topic]"

### Conference & Workshop Coordination

**You:** "Find all emails about the Qatar Leadership Centre workshop and summarize the key action items"

**Claude will:**
1. Search subject/content for "Qatar Leadership Centre"
2. Get full email content
3. Extract action items and deadlines
4. Create organized summary

### Manuscript Review Management

**You:** "Search for emails about manuscript submissions to AMJ and show me which ones need responses"

**Claude will:**
1. Search for "manuscript", "AMJ", "submission"
2. Check read/unread status
3. Identify which need action
4. Create priority list

## 📊 Research & Reference Management

### Finding Research Correspondence

**You:** "Find emails from Dr. Smith about the innovation platforms research from 2024"

**Claude will:**
1. Search sender + keywords
2. Filter by date range
3. Get full email content
4. Organize chronologically

### Literature Sharing & Collaboration

**You:** "Find emails where colleagues shared PDFs about entrepreneurial ecosystems"

**Claude will:**
1. Search for keywords
2. Check for attachments
3. List emails with PDF attachments
4. Summarize papers shared

## 🤝 Administrative Tasks

### Meeting Coordination

**You:** "Find all meeting requests from this week and create a summary with times and topics"

**Claude will:**
1. Search for "meeting", "calendar", "schedule"
2. Extract dates, times, topics
3. Organize into coherent schedule

**Follow-up:** "Create draft responses accepting the meetings and proposing agenda items"

### Grant & Funding Communications

**You:** "Search for emails about grant funding from UK research councils in 2024"

**Claude will:**
1. Search keywords + date range
2. Get full content
3. Summarize status of each grant
4. Flag any deadlines

## 💼 Professional Networking

### Following Up on Connections

**You:** "Find emails from people I met at the Academy of Management conference but haven't responded to"

**Claude will:**
1. Search date range around conference
2. Filter for unread or unreplied
3. Get email content
4. Create follow-up list

**Then:** "Create draft responses referencing our conversation about [topic]"

### Managing Speaking Invitations

**You:** "Find all speaking or presentation invitations from the last 3 months"

**Claude will:**
1. Search for keywords like "speak", "present", "keynote"
2. Extract event details
3. Check response status
4. Create summary with dates

## 🔍 Email Archaeology

### Finding Old Conversations

**You:** "I discussed a specific entrepreneurship framework with someone in 2023 but can't remember who. Search for emails mentioning 'possibilistic reasoning'"

**Claude will:**
1. Search all emails for specific term
2. Get relevant email content
3. Show conversation thread
4. Identify correspondent

### Recovering Information

**You:** "Someone sent me a hotel recommendation in London but I can't find it. Search for emails with 'hotel' and 'London' from the past year"

**Claude will:**
1. Search keywords + date range
2. Find relevant emails
3. Extract hotel names
4. Present findings

## 🚀 Automation Workflows

### Morning Email Triage

**You:** "What are the high-priority emails I need to handle today?"

**Claude will:**
1. Search unread emails from last 24 hours
2. Identify urgent senders (students, editors, admin)
3. List with priority ranking
4. Suggest responses for quick replies

### Weekly Cleanup

**You:** "Find all read emails from last week that are newsletters or promotional and move them to Archive"

**Claude will:**
1. Search read emails from date range
2. Identify newsletters/promotional content
3. Move to Archive folder
4. Report on cleanup

### Inbox Zero Workflow

**You:** "Help me get to inbox zero. Show me all emails in inbox grouped by action needed"

**Claude will:**
1. List all inbox emails
2. Analyze for action type (respond, file, delete, defer)
3. Group by category
4. Suggest workflow

**Follow-up commands:**
- "Move all newsletters to Archive"
- "Mark all announcements as read"
- "Create draft responses for the 'respond' group"

## 🎯 Specific Task Examples

### Example 1: Expense Report Preparation

**Complete workflow:**

1. "Search for receipt emails from November 2024"
2. "List all the attachments from these emails"
3. "Create a summary table with: date, vendor, amount (if visible), attachment name"
4. "Move all these to my Receipts-Nov2024 folder"

### Example 2: Student Communication

**Complete workflow:**

1. "Show unread emails from Sienna Parker and Ece Kaynak"
2. "Get the full content of each email"
3. "Create draft responses addressing their questions and asking for progress updates"
4. "Don't send yet - I'll review them first"

### Example 3: Conference Paper Submissions

**Complete workflow:**

1. "Find all emails about paper submissions in the last month"
2. "Get the full content and check for any attachments"
3. "Create a status summary: which are accepted, under review, or need revisions"
4. "Flag any that need immediate action"

## 💡 Pro Tips

### Chaining Commands

Instead of multiple separate requests, you can chain:

**You:** "Search for Amazon receipt emails from December, list their attachments, move them to Receipts folder, and mark them as read"

### Using Context

Claude remembers the conversation:

**You:** "Search for emails from journal editors"
**Claude:** [returns results]
**You:** "Now show me just the ones that need responses"
**Claude:** [filters previous results]
**You:** "Create draft responses for the first three"

### Specific Message IDs

After searching, you get message IDs. Use them:

**You:** "Get the full content of message ID 12345"
**You:** "Move message 12345 to Archive"
**You:** "Mark messages 12345, 12346, and 12347 as read"

### Iterative Refinement

Start broad, then narrow:

**You:** "Search emails from 2024"
[Too many results]
**You:** "Only show November 2024"
[Still too many]
**You:** "Only from universities"
[Better]
**You:** "Just the unread ones about conferences"
[Perfect]

## 🎨 Creative Uses

### Email-Based Research

**You:** "Find all emails where colleagues recommended books or papers, and create a reading list"

### Contact Discovery

**You:** "Who are the people I've emailed most frequently about AI and entrepreneurship?"

### Trend Analysis

**You:** "Show me how my email volume from students has changed month-by-month this year"

### Auto-Categorization

**You:** "Find all emails that look like meeting notes or summaries and move them to my Notes folder"

---

**Remember:** Always review before:
- Sending emails
- Moving large numbers of emails
- Marking many emails as read/unread

**Start small:** Test with 1-2 emails before bulk operations!
