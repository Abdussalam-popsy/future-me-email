# Preview / Staging Workflow

Use the **`staging`** branch to share work-in-progress without affecting the live design on `main`.

## Quick reference

| Branch   | Use for                          |
|----------|-----------------------------------|
| `main`   | Production / current live design  |
| `staging`| Preview: share new work before merging |

## How to push to preview (staging)

When you have changes you want to share as a preview:

```bash
# 1. Commit your changes (if not already)
git add -A && git commit -m "your message"

# 2. Push to staging (creates/updates the preview branch)
git push origin HEAD:staging
```

Or work on the staging branch directly:

```bash
git checkout staging
git merge main          # bring in latest from main
# make edits...
git add -A && git commit -m "preview: describe changes"
git push origin staging
```

## Getting a shareable preview URL

- **GitHub:** Share the branch: `https://github.com/Abdussalam-popsy/future-me-email/tree/staging`
- **Cloudflare Pages / Vercel / Netlify:** If you connect the repo, they often build each branch. Check your dashboard for a preview URL for the `staging` branch (e.g. `staging--your-project.pages.dev`).

## When preview looks good

Merge staging into main and push:

```bash
git checkout main
git merge staging
git push origin main
```

Then optionally keep staging in sync: `git checkout staging && git merge main && git push origin staging`.
