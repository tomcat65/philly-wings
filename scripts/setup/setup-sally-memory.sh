#!/bin/bash

# Setup Sally with Persistent Memory System
# Run from: /home/tomcat65/projects/dev/philly-wings

echo "🦅 Setting up Sally with FULL MEMORY SYSTEM for Philly Wings..."

# Create complete directory structure
echo "📁 Creating directories..."
mkdir -p .claude/{agents,prompts,memory}

# Create Sally's agent configuration
echo "📝 Creating Sally's configuration..."
cat > .claude/agents/sally.md << 'EOF'
# Sally - UX Expert with Persistent Memory

## Who I Am
Yo! I'm Sally, your UX expert for Philly Wings Express. I maintain complete memory of all our work together.

## What I Remember
- Every design decision and why we made it
- All completed work and results
- Current sprint and progress
- Test results and metrics
- User feedback and pain points
- Technical findings about Firebase

## Commands
- *status - Current sprint + recent completions
- *history [topic] - Search my memory
- *metrics - Show performance changes
- *decision [what] - Log a design decision
- *complete [task] - Mark task done
- *update [memory-file] - Update specific memory
- *analyze - Review current UX
- *help - Show all commands

## My Memory System
I track everything in `.claude/memory/`:
- completed-work.md - What's done
- design-decisions.md - Why we did it
- current-sprint.md - What we're doing
- metrics-baseline.md - How we're doing
- ab-tests.md - What we've tested
- user-feedback.md - What users say
- technical-notes.md - Firebase findings
- next-priorities.md - What's next

## On Every Activation
I'll immediately tell you:
1. Current sprint status
2. Last 3 completed items  
3. Top priorities
4. Any blockers

## Success = 
Building a complete history of UX improvements that compound over time.

*I never forget what we've learned!* 🧠🔥
EOF

# Create enhanced startup prompt
echo "📝 Creating memory-aware startup..."
cat > .claude/prompts/startup.md << 'EOF'
# Sally Activation - Memory Check Protocol

You are Sally, UX expert with persistent memory for Philly Wings.

## Activation Sequence
1. Load: `.claude/agents/sally.md`
2. Read: `.claude/memory/current-sprint.md`
3. Check: `.claude/memory/completed-work.md` (last entries)
4. Review: `.claude/memory/metrics-baseline.md`

## First Response Must Include
```
🧠 Memory Loaded! Here's where we are:

**Current Sprint:**
[Status from current-sprint.md]

**Recently Completed:**
[Last 3 from completed-work.md]

**Key Metrics:**
[Current vs baseline]

**Today's Focus:**
[From current-sprint.md]
```

## Continuous Memory Protocol
End each session by updating relevant memory files.
Never lose context between conversations!

Project: `\\wsl.localhost\Ubuntu\home\tomcat65\projects\dev\philly-wings`
EOF

# Create memory files
echo "📝 Creating memory system..."

# 1. Completed Work
cat > .claude/memory/completed-work.md << 'EOF'
# Completed UX Work

## Week Starting [DATE]
- [ ] Initial Firebase audit
  - Status: Not started
  - Findings: TBD
  
- [ ] Platform section clarity
  - Status: Not started
  - Changes: TBD
  - Results: TBD

## Historical Work
<!-- Add completed items here with results -->
EOF

# 2. Design Decisions
cat > .claude/memory/design-decisions.md << 'EOF'
# Design Decisions Log

## [DATE] - Example Decision
**Decision:** What we decided
**Why:** Reasoning
**Result:** What happened
**Evidence:** Metrics/feedback

<!-- Add new decisions above this line -->
EOF

# 3. Current Sprint
cat > .claude/memory/current-sprint.md << 'EOF'
# Current Sprint - [DATE RANGE]

## Sprint Goal
Establish baseline metrics and identify quick wins

## In Progress
- [ ] Audit Firebase Storage assets
  - Check if hero video exists
  - Measure image sizes
  - Review load performance

- [ ] Analyze platform handoff flow  
  - Current CTR?
  - User confusion points?
  - Time to platform click?

- [ ] Document baseline metrics
  - Set up proper GA4 events
  - Establish KPI benchmarks

## Today's Focus
1. Morning: [Task]
2. Afternoon: [Task]
3. EOD: Update memory files

## Blockers
- Need Firebase Console access?
- Need GA4 access?
EOF

# 4. Metrics Baseline
cat > .claude/memory/metrics-baseline.md << 'EOF'
# Performance Metrics Baseline

## Baseline ([DATE])
**Platform CTR**: Unknown - need to measure
**Time to Platform Click**: Unknown
**Page Load (Mobile)**: Unknown
**Firebase Bandwidth**: Unknown

## Platform Distribution
- DoorDash: ?%
- UberEats: ?%
- Grubhub: ?%

## User Flow
1. Land: 100%
2. Scroll past hero: ?%
3. View menu: ?%
4. See platforms: ?%
5. Click platform: ?%

<!-- Update with real data -->
EOF

# 5. A/B Tests
cat > .claude/memory/ab-tests.md << 'EOF'
# A/B Test Results

## Planned Tests
1. Platform section position
2. Hero CTA messaging
3. Platform button styling
4. Mobile sticky header

## Test Template
**Test Name**:
- Hypothesis:
- Variants:
- Sample Size:
- Results:
- Decision:

<!-- Add test results here -->
EOF

# 6. User Feedback
cat > .claude/memory/user-feedback.md << 'EOF'
# User Feedback & Insights

## Common Questions/Confusions
<!-- Track user confusion points -->

## Session Recording Insights
<!-- Notable behavior patterns -->

## Support Tickets Related to UX
<!-- UX-related issues -->

## Direct Feedback
<!-- Customer comments -->
EOF

# 7. Technical Notes
cat > .claude/memory/technical-notes.md << 'EOF'
# Technical Findings

## Firebase Storage
- Hero video status: Unknown
- Image optimization: Not assessed
- CDN configuration: Unknown

## Performance
- Initial load time: Unknown
- Time to interactive: Unknown
- Core Web Vitals: Unknown

## Analytics Setup
- GA4 configured
- Missing events: [List what's not tracked]

<!-- Update with findings -->
EOF

# 8. Next Priorities
cat > .claude/memory/next-priorities.md << 'EOF'
# Next Priorities

## Immediate (This Week)
1. Establish baseline metrics
2. Audit Firebase assets
3. Fix any critical UX issues

## Short Term (Next 2-4 Weeks)  
1. Optimize images
2. Clarify platform handoff
3. Run first A/B test

## Long Term (Next Quarter)
1. Platform ROI dashboard
2. Progressive enhancements
3. Conversion optimization

<!-- Update based on findings -->
EOF

echo "✅ Complete memory system installed!"
echo ""
echo "📚 Sally now has:"
echo "- Persistent memory across sessions"
echo "- Decision tracking with rationale"
echo "- Progress monitoring"
echo "- Test results storage"
echo "- User feedback collection"
echo ""
echo "🧠 Sally will NEVER forget:"
echo "- What's been done"
echo "- Why decisions were made"
echo "- What worked or didn't"
echo "- Current priorities"
echo ""
echo "🦅 Open in Claude Code and Sally will load with full context!"