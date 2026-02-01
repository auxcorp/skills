---
name: ez-google
description: Google Workspace tools for Gmail, Calendar, Drive, Docs, Sheets, Slides, Contacts, and Chat.
metadata: {"openclaw":{"emoji":"📧"}}
---

# ez-google

## Auth (do this first)

```bash
uv run scripts/auth.py status        # Check: AUTHENTICATED or NOT_AUTHENTICATED
uv run scripts/auth.py login         # Get URL → send to user
uv run scripts/auth.py complete 'URL'  # User pastes redirect URL back
```

**Auth flow:** `login` → user clicks link → user pastes URL back → `complete 'URL'`

---

## Gmail

```bash
gmail.py list [-n 10] [-q "query"]   # List emails
gmail.py search "query"              # Search emails
gmail.py get MESSAGE_ID              # Read email
gmail.py send "to" "subject" "body"  # Send email
gmail.py draft "to" "subject" "body" # Create draft
gmail.py labels                      # List labels
```

## Calendar

```bash
gcal.py list [DATE]                  # List events (DATE: YYYY-MM-DD or "today")
gcal.py create "title" "START" "END" # Create event (START/END: YYYY-MM-DDTHH:MM)
gcal.py get EVENT_ID                 # Event details
gcal.py delete EVENT_ID              # Delete event
gcal.py calendars                    # List calendars
```

## Drive

```bash
drive.py list [-n 20]                # List files
drive.py search "query"              # Search by name
drive.py get FILE_ID                 # File metadata
drive.py download FILE_ID            # File content
drive.py create-folder "name"        # Create folder
```

## Docs

```bash
docs.py create "title"               # Create doc
docs.py get DOC_ID                   # Read content
docs.py find "query"                 # Find by title
docs.py append DOC_ID "text"         # Append text
docs.py insert DOC_ID "text"         # Insert at start
docs.py replace DOC_ID "old" "new"   # Replace text
```

## Sheets

```bash
sheets.py create "title"             # Create spreadsheet
sheets.py get ID "Sheet!A1:D10"      # Read data
sheets.py info ID                    # Sheet metadata
sheets.py find "query"               # Find by name
sheets.py write ID "Sheet!A1" "a,b;c,d"   # Write (rows separated by ;)
sheets.py append ID "Sheet!A:B" "a,b;c,d" # Append rows
```

## Slides

```bash
slides.py find "query"               # Find presentations
slides.py get PRESENTATION_ID        # Get slides info
slides.py text PRESENTATION_ID       # Extract all text
slides.py create "title"             # Create presentation
```

## People/Contacts

```bash
people.py me                         # Current user profile
people.py contacts [-n 100]          # List contacts
people.py search "name"              # Search contacts
people.py get CONTACT_ID             # Contact details
```

## Chat (Workspace only)

```bash
chat.py spaces                       # List spaces
chat.py messages SPACE_ID [-n 20]    # List messages
chat.py send SPACE_ID "text"         # Send message
chat.py get SPACE_ID                 # Space details
```

---

All commands: `uv run scripts/<script>.py <command> [args]`

Note: After adding new services, run `auth.py logout` then `login` again to grant new permissions.
