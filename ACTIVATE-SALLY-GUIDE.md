# How to Activate Sally

## Automatic (Should work on project open)
The `.claude/prompts/startup.md` file should automatically load Sally.

## Manual Activation (If auto-load fails)

Just say:
```
Load the agent from .claude/commands/philly-wings/agents/sally-ux.md
```

Or:
```
Activate Sally from .claude/commands/philly-wings/agents/sally-ux.md
```

## Sally's Commands (Once Activated)
- *help - Show all commands
- *status - Current work from memory
- *history - Past work and decisions
- *analyze - Review UX issues
- *firebase-audit - Check Storage assets
- *platform-ux - Improve platform handoff
- *metrics - Performance data
- *complete [task] - Mark done
- *decision [what] - Log decision

## File Structure
```
.claude/
├── commands/
│   └── philly-wings/
│       └── agents/
│           └── sally-ux.md      # Sally's agent file
├── prompts/
│   └── startup.md               # Auto-loads Sally
└── memory/                      # Sally's memory files
    ├── current-sprint.md
    ├── completed-work.md
    ├── design-decisions.md
    └── ... (other memory files)
```

## If Claude Tries to Run Setup
Say: "Don't run setup scripts. Just load the agent from .claude/commands/philly-wings/agents/sally-ux.md"