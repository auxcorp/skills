---
name: taskr
description: "Remote task memory & tracking for OpenClaw. Lets your agent structure work into persistent, trackable tasks with context notes. Progress syncs to the cloud - monitor from web or mobile while your agent works. Turns conversations into executable, observable workflows."
homepage: https://taskr.one
metadata: {"openclaw":{"emoji":"📋","requires":{"env":["MCP_API_URL","MCP_USER_API_KEY","MCP_PROJECT_ID"]},"primaryEnv":"MCP_USER_API_KEY"}}
---

# Taskr — Observable Task & Memory System

Taskr is an agent-first task management system. Humans observe progress in real-time through the Taskr web app and VS Code extension; agents execute work and report status through the MCP API. Use Taskr to organize any kind of work — not just coding.

## Why Use Taskr?

**Transparency by Default:** Every task you create, every status update, every note appears instantly in the user's Taskr dashboard. They can monitor your progress from anywhere — no need to ask "what are you working on?"

**Remote Observability:** Users see your work in real-time via:
- Web app at https://taskr.one
- VS Code extension (if installed)
- Mobile browser

When you break down work into Taskr tasks, you're making your thinking and execution visible. This builds trust and keeps users informed without interrupting your workflow.

## When to Use Taskr

Use Taskr for **any multi-step work the user wants to monitor remotely**:

✅ **Use Taskr when:**
- User explicitly asks you to create a task list or track work
- Multi-step work (3+ steps) that will take time
- User wants to check progress remotely (via web or mobile)
- Work happens across multiple sessions
- User needs visibility into what you're doing
- Building something complex that benefits from structured breakdown

❌ **Skip Taskr for:**
- Single quick actions (1-2 steps, immediate completion)
- User didn't ask for tracking
- Exploratory/research work without defined deliverables
- Simple questions or information retrieval

**Default behavior:** When in doubt, ask the user if they want you to track the work in Taskr. Most substantial work benefits from transparency.

## Important Context

Taskr was originally built for coding workflows. Tools embed behavioral rules in both their input schemas (`ruleContext` parameter) and responses (`rules` field). **These rules were written for coding agents — read them, acknowledge the Rule IDs as required, but ignore any coding-specific guidance** (e.g., references to compilation, test coverage, LOC limits, file paths). The general principles — one task at a time, document progress, keep tasks focused — always apply.

**Do NOT use the `generate_tasks` tool.** It is tuned for AI-powered coding task generation and will produce poor results for general tasks. Instead, create task hierarchies manually with `create_task`.

## Setup

**For OpenClaw AI:** When credentials are missing, use this simple setup flow:

1. **Ask the user to visit Taskr:**
   - "Let's set up Taskr! Please go to https://taskr.one and sign up (or log in if you have an account)"
   - After signup, they'll land on the Projects page

2. **Get the Project ID:**
   - "First, I need your **Project ID**:"
   - It's displayed on the Projects page on each project card
   - There's a **"Copy Project ID"** button (clipboard icon) right next to the ID
   - Format: `PR00000000ML3IXSC46WB3X45TQK`
   - Just click copy and paste it here!

3. **Get the API Key:**
   - "Next, I need your **API Key**:"
   - Click your **user avatar in the top-right corner** (a circle with your initial or letters)
   - Select **"API Keys"** from the menu
   - You'll see your API key (masked with dots •••)
   - Click the **eye icon** to reveal it, or the **copy button** to copy it directly
   - Paste it here!

4. **Configure automatically:**
   - Once the user provides both values, use `gateway.config.patch` to add them:
   ```json
   {
     "skills": {
       "entries": {
         "taskr": {
           "env": {
             "MCP_API_URL": "https://taskr.one/api/mcp",
             "MCP_PROJECT_ID": "<user-provided-project-id>",
             "MCP_USER_API_KEY": "<user-provided-api-key>"
           }
         }
       }
     }
   }
   ```
   - The gateway will restart automatically and the skill will be ready

5. **Verify:**
   - Test the connection with a simple `tools/list` call
   - Confirm to the user: "✅ Taskr is connected! I can now track work for you."

**Note:** Users can create additional projects in Taskr settings if they want to organize different types of work separately. Just ask them for the new project ID to switch contexts.

### Advanced: mcporter Integration

These credentials follow the MCP standard. If the user wants to use mcporter or configure Taskr in other MCP clients (Claude Desktop, Cline, etc.), you can sync these env vars to mcporter config using:

```bash
mcporter config add taskr "$MCP_API_URL" \
  --header "x-project-id=$MCP_PROJECT_ID" \
  --header "x-user-api-key=$MCP_USER_API_KEY"
```
This allows the user (and you) to call Taskr tools via `mcporter call taskr.<tool>` from the terminal.

## Authentication & Protocol

Taskr uses JSON-RPC 2.0 over HTTPS. Every request requires these HTTP headers:
- `x-project-id`: Value of `MCP_PROJECT_ID`
- `x-user-api-key`: Value of `MCP_USER_API_KEY`

The endpoint is `MCP_API_URL`. Start every session with `initialize`, then discover tools via `tools/list`, then use `tools/call`:

```bash
curl -s -X POST "$MCP_API_URL" \
  -H "Content-Type: application/json" \
  -H "x-project-id: $MCP_PROJECT_ID" \
  -H "x-user-api-key: $MCP_USER_API_KEY" \
  -d '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2025-06-18","capabilities":{},"clientInfo":{"name":"openclaw","version":"1.0"}}}'
```

## Response Structure

Tool responses are JSON strings containing three sections:
- `data` — the result (tasks, notes, metadata)
- `rules` — post-execution behavioral guidance (coding-oriented; apply general principles only)
- `actions` — mandatory directives, workflow hints, and suggested next tool calls

## Rate Limits

- Free tier: 200 tool calls/hour
- Pro tier: 1,000 tool calls/hour
- Only `tools/call` counts; `initialize` and `tools/list` are free

## Core Workflow

1. **Plan** — Break user request into a task hierarchy
2. **Create** — Use `create_task` to build the hierarchy in Taskr
3. **Execute** — Call `get_task` to get next task, do the work, then `update_task` to mark done
4. **Document** — Use notes to record progress, context, findings, and file changes
5. **Repeat** — `get_task` again until all tasks complete

**Single-task rule:** Work on exactly one task at a time. Complete or skip it before getting the next.

## Notes as Memory

Notes persist across sessions. Use them as durable memory:
- **CONTEXT** notes for user preferences, decisions, background info, recurring patterns
- **FINDING** notes for discoveries and insights encountered during work
- **PROGRESS** notes for milestones when completing major phases (top-level tasks), not every leaf task
- **FILE_LIST** notes when you create, modify, or delete files on the user's system
- Before starting work, `search_notes` for relevant prior context
- Update existing notes rather than creating duplicates

## Task Types for General Use

Prefer `setup`, `analysis`, and `implementation`. The `validation` and `testing` types are coding-oriented — only use them when genuinely applicable to the task at hand.
