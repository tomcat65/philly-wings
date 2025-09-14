# 🦅 Philly Wings - Claude Project Configuration

## Quick Start

To activate Sally (UX Expert):
```
Load the agent from .claude/commands/philly-wings/agents/sally-ux.md
```

## Project Structure

```
.claude/
├── commands/
│   └── philly-wings/
│       └── agents/
│           └── sally-ux.md      # Sally - UX Expert agent
├── prompts/
│   └── startup.md               # Auto-loads Sally on project open
└── memory/                      # Sally's persistent memory
    ├── current-sprint.md        # Active work
    ├── completed-work.md        # Done tasks
    ├── design-decisions.md      # Decision log
    ├── metrics-baseline.md      # Performance data
    ├── ab-tests.md             # Test results
    ├── user-feedback.md        # User insights
    ├── technical-notes.md      # Firebase findings
    └── next-priorities.md      # Upcoming work
```

## Sally's Commands

Once activated, use these commands:

- **\*help** - Show all available commands
- **\*status** - Show current work and priorities
- **\*history** - Review past work and decisions
- **\*analyze** - Analyze current UX issues
- **\*firebase-audit** - Check Firebase Storage performance
- **\*platform-ux** - Optimize platform handoff
- **\*metrics** - Show performance metrics
- **\*complete [task]** - Mark task as done
- **\*decision [what]** - Log a design decision

## About This Project

- **Type:** Firebase-powered marketing site
- **Purpose:** Drive traffic to delivery platforms
- **Architecture:** Firebase Storage + Firestore + Vanilla JS
- **Key Metric:** Platform click-through rate

## Notes

- Sally maintains persistent memory across sessions
- All media assets are served from Firebase Storage
- Orders happen on delivery platforms (DoorDash, UberEats, Grubhub)
- Focus is on conversion optimization, not cart/checkout