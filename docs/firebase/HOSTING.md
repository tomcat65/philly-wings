# Hosting Redirects

Goal: Canonical redirect from apex `phillywingsexpress.com` to `https://www.phillywingsexpress.com` (preserve path and query).

Recommended (Console UI)
- Firebase Console → Hosting → Custom domains → `phillywingsexpress.com` → Add redirect to `https://www.phillywingsexpress.com` (301, include path & query).
- This avoids global redirects that can affect the `www` host.

Alternative (firebase.json) — multi-site only
- If using multi-site Hosting (separate targets for apex and www), add a `redirects` block under the apex site:

```
{
  "hosting": [
    {
      "site": "philly-wings-apex",
      "public": "dist",
      "redirects": [
        { "source": "/**", "destination": "https://www.phillywingsexpress.com/**", "type": 301 }
      ]
    },
    {
      "site": "philly-wings-www",
      "public": "dist"
    }
  ]
}
```

Caution
- Do not add a global `redirects` rule to a single-site `firebase.json` — it will also fire on the `www` host and can prevent content from serving.

