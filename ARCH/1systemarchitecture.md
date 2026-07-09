                                     INTERNET
                                         │
                                         ▼
                                DNS (akshaytiwari.dev)
                                         │
                                         ▼
                                ┌──────────────────┐
                                │      Vercel      │
                                │ Next.js 15 App   │
                                └────────┬─────────┘
                                         │
                  ┌──────────────────────┼──────────────────────┐
                  │                      │                      │
                  ▼                      ▼                      ▼
          Public Portfolio       Admin Dashboard        API Routes /
            (Everyone)             (Only You)          Server Actions
                  │                      │
                  └──────────────┬───────┘
                                 ▼
                         Prisma ORM Layer
                                 │
                                 ▼
                      PostgreSQL (Supabase)
                                 │
         ┌───────────────────────┼────────────────────────┐
         │                       │                        │
         ▼                       ▼                        ▼
     Projects DB           Certificates DB          Blogs DB
     Skills DB             Experience DB            Messages DB
                                 │
                                 ▼
                            Cloudinary
                 Images • PDFs • Videos • Resume