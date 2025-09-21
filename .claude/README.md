# 🦅 Philly Wings - Claude Project Configuration

## Quick Start

To activate an agent, load their file from `.claude/agents/` or `.claude/commands/philly-wings/agents/`:

- **Sally** - UX Expert: `sally.md` or `sally-ux.md`
- **Erika** - Nutrition & FDA Expert: `erika.md`  
- **Richard** - Pricing Strategy Expert: `richard.md`
- **TomCat65** - Full Stack Developer: `tomcat65.md`

## Project Agents

### 🎨 Sally - UX Expert
Focuses on user experience, conversion optimization, and Firebase performance.

### 🥗 Erika - Nutrition & FDA Compliance Expert  
Manages nutrition data, FDA compliance, allergen information, and food safety.

### 💰 Richard - Pricing Strategy Expert
Optimizes pricing across delivery platforms, analyzes margins, and manages promotions.

### 💻 TomCat65 - Full Stack Developer
Implements features, optimizes Firebase performance, and maintains platform integrations.

## Project Structure

```
.claude/
├── agents/
│   ├── sally.md         # Sally - UX Expert
│   ├── erika.md         # Erika - Nutrition Expert
│   ├── richard.md       # Richard - Pricing Expert
│   └── tomcat65.md      # TomCat65 - Full Stack Developer
├── commands/
│   └── philly-wings/
│       └── agents/
│           ├── sally-ux.md
│           ├── erika.md
│           ├── richard.md
│           └── tomcat65.md
├── prompts/
│   └── startup.md       # Auto-loads on project open
└── memory/              # Persistent memory for all agents
    ├── current-sprint.md
    ├── completed-work.md
    ├── design-decisions.md
    ├── metrics-baseline.md
    ├── ab-tests.md
    ├── user-feedback.md
    ├── technical-notes.md
    ├── next-priorities.md
    ├── allergen-matrix.md
    ├── compliance-status.md
    ├── nutrition-updates.md
    ├── erika-coordination.md
    ├── supplier-costs.md      # Richard's files
    ├── competitor-pricing.md
    ├── pricing-decisions.md
    ├── platform-fees.md
    ├── margin-analysis.md
    ├── promotion-history.md
    ├── market-trends.md
    ├── bundle-performance.md
    ├── development-tasks.md    # TomCat65's files
    ├── technical-decisions.md
    ├── implementation-notes.md
    ├── firebase-optimizations.md
    ├── platform-integrations.md
    ├── code-reviews.md
    ├── deployment-history.md
    └── performance-metrics.md
```

## Agent Commands

### Sally's Commands
- `*help` - Show all available commands
- `*status` - Show current work and priorities
- `*history` - Review past work and decisions
- `*analyze` - Analyze current UX issues
- `*firebase-audit` - Check Firebase Storage performance
- `*platform-ux` - Optimize platform handoff
- `*metrics` - Show performance metrics
- `*complete [task]` - Mark task as done
- `*decision [what]` - Log a design decision

### Erika's Commands
(FDA compliance and nutrition management - check her file for details)

### Richard's Commands
- `*analyze-invoice [supplier]` - Parse supplier invoice for COGS
- `*calculate-margins [item]` - Full margin analysis with platform fees
- `*competitor-scan` - Check current competitor pricing
- `*optimize-bundle` - Design profitable combo deals
- `*platform-compare` - Compare margins across all platforms
- `*price-test [strategy]` - Set up A/B pricing test
- `*promo-impact [offer]` - Calculate promotion profitability
- `*status` - Current pricing strategy overview
- `*help` - Show all commands

### TomCat65's Commands
- `*implement [story]` - Start coding a user story
- `*fix [issue]` - Debug and fix production issues
- `*optimize [area]` - Performance tune specific areas
- `*deploy [feature]` - Push to production with confidence
- `*test [component]` - Run comprehensive tests
- `*audit-firebase` - Check costs and optimization opportunities  
- `*platform-check` - Verify all platform integrations
- `*admin-feature` - Add/update admin panel functionality
- `*sync-team` - Get latest from Sally/Erika/Richard
- `*history [topic]` - Search development memory
- `*status` - Current sprint and system health
- `*help` - Show all commands

## About This Project

- **Type:** Firebase-powered marketing site
- **Purpose:** Drive traffic to delivery platforms
- **Architecture:** Firebase Storage + Firestore + Vanilla JS
- **Business Model:** Platform delivery (DoorDash, UberEats, Grubhub)
- **Key Metrics:** 
  - Platform click-through rate (Sally)
  - FDA compliance status (Erika)
  - Margin after platform fees (Richard)
  - Page load speed & Firebase costs (TomCat65)

## Agent Coordination

The four agents work together as a complete team:
- **Sally** optimizes the customer journey and conversions
- **Erika** ensures all nutrition info is accurate and compliant  
- **Richard** sets profitable prices that beat competition
- **TomCat65** builds the tech that makes it all work

Example workflow: Richard calculates optimal bundle pricing → Sally designs the UI to highlight value → Erika ensures nutrition info is displayed correctly → TomCat65 implements everything with blazing-fast performance.

## Notes

- All agents maintain persistent memory across sessions
- Agents can reference each other's memory files for coordination
- Orders happen on delivery platforms (we don't process payments)
- Focus is on driving profitable platform orders