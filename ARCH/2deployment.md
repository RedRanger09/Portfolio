                        Git Push
                           │
                           ▼
                      GitHub Repository
                           │
                   Automatic Webhook
                           │
                           ▼
                         Vercel
                   Build + Deployment
                           │
             ┌─────────────┴─────────────┐
             │                           │
             ▼                           ▼
      Production Website          Preview Deployments
             │
             ▼
      Connected Services
             │
     ┌───────┼────────┬─────────────┐
     ▼       ▼        ▼             ▼
 PostgreSQL Cloudinary Clerk     Analytics