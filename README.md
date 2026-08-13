# AgentWorkspace AI

Full Lovable Prompt — Agentic Real Estate Chatbot Frontend (ChatGPT-Level UX + Streaming + Empty-State Transition)

Objective

Design and generate a modern, production-ready frontend for an agentic real estate chatbot with:

ChatGPT / Claude–level UX

Real-time streaming (tokens + tool events)

Empty state → conversation transition

Support for custom UI components (property cards, analytics, etc.)

Fully extensible architecture for future agent capabilities

This is NOT a basic chatbot UI.
It must feel like a next-generation AI CRM workspace.

🧠 Core UX Principles

Minimal, clean, premium design

Conversation-first interface

Real-time feedback (no blocking)

Transparent AI behavior (tool calls, reasoning)

Extensible for domain-specific UI (real estate)

🧱 Layout Structure

1. Sidebar (Left Panel)

Collapsible

Contains:

Conversation history

“New Chat” button

Search bar

Each conversation:

Title (auto-generated)

Timestamp

Actions:

Delete

Pin

🟢 Phase 1 — Empty State (Before First Message)

Behavior

When user clicks “New Chat”:

DO NOT show chat messages

DO NOT show empty chat bubbles

Show only a centered prompt experience

UI Layout

Centered Input Area

Large, centered input box

Rounded, modern (ChatGPT/Claude style)

Placeholder:

“Ask about properties, clients, or deals…”

Optional Enhancements

Suggested prompts (clickable chips):

“Find apartments in Tunis under 300k”

“Add a new property”

“Match a client to houses”

Subtle illustration or branding

🔄 Transition (CRITICAL UX)

When the user sends the first message:

MUST:

Animate transition:

Input moves from center → bottom

Chat layout fades in

First user message appears instantly

Conversation starts

🔵 Phase 2 — Active Conversation UI

Layout

Header

Chat title

Agent/model indicator

Settings menu

Message Area (Center)

Scrollable message list

User messages → right

Assistant → left

Smooth animations

Input Area (Bottom)

Fixed at bottom

Multi-line input

Enter = send, Shift+Enter = newline

⚡ Streaming System (CRITICAL FEATURE)

The UI must support real-time streaming events, not just final text.

Event Types to Render

1. Thinking / Reasoning

{ "type": "thought", "content": "Searching for properties..." }


UI:

“Thinking…” indicator

Optional expandable reasoning panel

2. Tool Call

{ "type": "tool_call", "tool": "search_properties", "args": {...} }


UI:

Card:

🔧 Calling: search_properties

Show arguments (formatted)

3. Tool Result

{ "type": "tool_result", "data": [...] }


UI:

Render dynamically (NOT raw JSON when possible)

4. Final Response

{ "type": "final", "content": "Here are matching properties" }


UI:

Stream text token-by-token

🏠 Custom UI Components (VERY IMPORTANT)

The system must support dynamic rendering of structured outputs.

Property Cards

Image

Price

Location

Key attributes (rooms, size)

Click → open details

Property List / Grid

Responsive grid

Infinite scroll

Map View (Future-ready)

Show property locations

Analytics Panels

Charts

KPIs (price trends, area insights)

🧩 Component Architecture

MessageRenderer (core)

Detects type:

text

tool_call

tool_result

custom_ui

Components:

ToolEventCard

PropertyCard

PropertyGrid

StreamingText

LoadingIndicator

🧠 State Management

Must handle:

messages

streaming state

active conversation

tool events

Support:

partial updates (streaming)

real-time rendering

🎨 Design System

Light + Dark mode

Soft shadows, rounded corners

Smooth transitions:

fade-in messages

typing effect

layout transitions

📱 Responsiveness

Desktop-first

Mobile-friendly

Sidebar collapses on small screens

⚡ Performance

Fast load

Virtualized message list (important for long chats)

Efficient rendering

🚫 Avoid

Static chatbot UI

Blocking UI during responses

Hardcoded layouts

Showing empty chat before first message

✅ Final Product Vision

The UI should feel like:

👉 ChatGPT-level chat experience
👉 Combined with a visual real estate dashboard
👉 Where the user can talk, see, and act in one place

🔥 Final Instruction

Prioritize:

Real-time feedback

Smooth transitions

Visual clarity of agent actions

Extensibility

Build it like a top-tier AI product, not a prototype.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/d8ac50cb-ccc9-4358-9b66-942316d3d8ba).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
