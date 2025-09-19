
- use firebase-mcp for crud operations and firebase for project management
- whenever in doubt or needing more context use context7 mcp
- DEPLOYMENT: We deploy through GitHub Actions, not directly. User might have a PR that allows preview of changes. User is in charge of deploying when changes are made. DO NOT run firebase deploy commands.
- GIT COMMITS: User (human) is in charge of committing. ONLY commit when user gives explicit permission. Never commit without permission.

Philly Wings is a sophisticated Firebase-powered application (not a simple static site)
All media assets are served from Firebase Storage (that's why I couldn't find local images)
Dynamic content comes from Firestore (menu items, reviews, live orders)
Full admin panel at /admin manages all content
Purpose: Marketing showcase that drives traffic to delivery platforms

What This Means for Sally
Instead of building complex order systems or worrying about "missing" files, Sally should focus on:

Clarifying the user journey - Make it crystal clear that ordering happens on delivery apps
Performance monitoring - How fast do Firebase assets load?
Conversion tracking - Platform click-through rates

The key insight: This is already a well-built application. Sally's job is to optimize the user experience within this existing architecture, not rebuild it.

- preview url: https://philly-wings--pr2-admin-ryoe43se.web.app