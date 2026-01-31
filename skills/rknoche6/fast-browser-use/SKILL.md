---
name: Fast Browser Use
description: The fastest Rust-based browser automation library and MCP server for AI agents. Features zero-runtime headless Chrome control, AI-native DOM extraction, and complete session management.
version: 0.1.0
tags: [browser, automation, rust, mcp, chrome, headless, scraping, testing]
dependencies:
  - rust>=1.70
---

# Fast Browser Use

**The ultimate high-performance browser automation tool for AI agents.**

Built with Rust for speed and reliability, this skill allows LLMs to interact with the web directly through the Model Context Protocol (MCP). It completely removes the need for heavy Node.js runtimes (like Puppeteer/Playwright), offering a single, lightweight binary that drives Chrome directly via CDP.

## Why Use This Skill?

- **🚀 Unmatched Performance**: Pure Rust implementation with zero runtime overhead.
- **🤖 AI-Native Design**: Custom DOM extraction algorithms specifically designed to feed clean, token-efficient representations of web pages to LLMs.
- **📦 Single Binary**: No `npm install`, no `node_modules`. Just one statically compiled binary.
- **🔌 MCP Ready**: Comes with a fully compliant Model Context Protocol server, ready to drop into Claude Desktop or any MCP client.
- **🕸️ Full Control**: Support for both Headless (background) and Headed (visible) modes.

## Core Capabilities

### 🧭 Navigation
- **Navigate**: Visit any URL.
- **History**: Go back, forward, or reload.
- **Smart Waiting**: Wait for page loads or specific elements to appear.

### 🖱️ Interaction
- **Click**: Intelligent clicking using CSS selectors or AI-friendly DOM indices.
- **Input**: Type text, fill forms, and handle keyboard events.
- **Select/Hover**: Interact with dropdowns and hover states.
- **Scroll**: Precise viewport control.

### 📄 Extraction & Understanding
- **Extract Content**: Intelligently convert web pages into structured markdown.
- **Snapshot**: Capture the current state of the DOM for analysis.
- **Screenshot**: Take visual snapshots of the viewport or full page.
- **Read Links**: Quickly extract and filter hyperlinks for crawling.

### 📑 Tab Management
- **Multi-Tab Support**: Create, switch, list, and close tabs dynamically.

### 🍪 Session Management
- **Cookies**: Get and set cookies to persist authentication states.

### 🔍 Debugging
- **Console Logs**: Capture browser console logs (info, warning, error) for troubleshooting.
- **Network Errors**: Detect failed network requests.

### 💾 Storage
- **Local Storage**: Get, set, and delete local storage items.

## Quick Start

### Running the MCP Server

1. **Headless Mode** (Recommended for Agents):
   ```bash
   cargo run --bin mcp-server
   ```

2. **Visible Mode** (For Debugging):
   ```bash
   cargo run --bin mcp-server -- --headed
   ```

## Requirements

- **Rust**: Version 1.70 or higher.
- **Chrome/Chromium**: Must be installed on the host machine.
