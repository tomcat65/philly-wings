# Admin Subdomain Setup Guide

## Overview
To set up admin.phillywingsexpress.com for the admin panel, you'll need to configure your DNS and hosting settings.

## Option 1: Firebase Hosting with Multiple Sites (Recommended)

### 1. Add a new site in Firebase Console
```bash
firebase hosting:sites:create admin-philly-wings
firebase hosting:channel:deploy admin --site admin-philly-wings
```

### 2. Update firebase.json
```json
{
  "hosting": [
    {
      "site": "philly-wings-main",
      "public": "dist",
      "rewrites": [
        {
          "source": "**",
          "destination": "/index.html"
        }
      ]
    },
    {
      "site": "admin-philly-wings",
      "public": "dist",
      "rewrites": [
        {
          "source": "**",
          "destination": "/admin/index.html"
        }
      ]
    }
  ]
}
```

### 3. Configure DNS
Add a CNAME record in your DNS provider:
- Type: CNAME
- Name: admin
- Value: admin-philly-wings.web.app

## Option 2: Nginx Reverse Proxy

If you're using your own server with Nginx:

```nginx
server {
    listen 80;
    server_name admin.phillywingsexpress.com;
    
    location / {
        proxy_pass http://localhost:3000/admin/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## Option 3: Cloudflare Workers

Create a Cloudflare Worker to route admin subdomain:

```javascript
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  const url = new URL(request.url)
  
  if (url.hostname === 'admin.phillywingsexpress.com') {
    url.pathname = '/admin' + url.pathname
    url.hostname = 'phillywingsexpress.com'
  }
  
  return fetch(url, request)
}
```

## Option 4: Simple Redirect

Add this to your main site's scripts:

```javascript
// Check if on admin subdomain
if (window.location.hostname === 'admin.phillywingsexpress.com') {
  if (!window.location.pathname.startsWith('/admin')) {
    window.location.pathname = '/admin' + window.location.pathname;
  }
}
```

## Security Considerations

1. **HTTPS**: Ensure SSL certificates cover both domains
2. **CORS**: Configure Firebase to accept requests from admin subdomain
3. **Authentication**: Admin panel already uses Firebase Auth

## Testing

After setup, test these URLs:
- https://phillywingsexpress.com (main site)
- https://admin.phillywingsexpress.com (admin panel)

Both should work with proper SSL certificates.