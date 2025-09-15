- remember to use the firebase mcp when dealing with firebase
- remember use firebase-mcp for crud operations and firebase for project management
- remember whenever in doubt or needing more context use context7 mcp
- remember The Reality
- DEPLOYMENT: We deploy through GitHub Actions, not directly. User has a PR that allows preview of changes. User is in charge of deploying when changes are made. DO NOT run firebase deploy commands.

Philly Wings is a sophisticated Firebase-powered application (not a simple static site)
All media assets are served from Firebase Storage (that's why I couldn't find local images)
Dynamic content comes from Firestore (menu items, reviews, live orders)
Full admin panel at /admin manages all content
Purpose: Marketing showcase that drives traffic to delivery platforms

What This Means for Sally
Instead of building complex order systems or worrying about "missing" files, Sally should focus on:

Optimizing Firebase assets - Check if that hero video exists and how large media files are
Clarifying the user journey - Make it crystal clear that ordering happens on delivery apps
Performance monitoring - How fast do Firebase assets load?
Conversion tracking - Platform click-through rates

Simple Setup
Just run the setup script above, and Sally will be configured with the correct understanding of your Firebase-powered marketing site.
The key insight: This is already a well-built application. Sally's job is to optimize the user experience within this existing architecture, not rebuild it.
- remember we are deploying through github actions, i have a PR that let's us preview the changes. I am in charge of deploying when changes are made.