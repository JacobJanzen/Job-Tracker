# JobTrackr

A Kanban-style job search tracker built with React, Express, and PostgreSQL. Prospects are organized into columns by pipeline status and can be created, edited, and deleted through a clean card-based interface.

## Tech Stack

- **Frontend**: React 18 (Vite), Tailwind CSS, shadcn/ui, TanStack React Query, wouter
- **Backend**: Express.js (TypeScript), Drizzle ORM, node-postgres
- **Database**: PostgreSQL

## File Structure

```
shared/schema.ts              - Database table definition, Zod validation, TypeScript types
server/
  index.ts                    - Express app bootstrap, middleware, server start
  db.ts                       - PostgreSQL connection pool (Drizzle)
  routes.ts                   - API route handlers (GET/POST/PATCH/DELETE)
  storage.ts                  - Storage interface + DatabaseStorage class
  prospect-helpers.ts         - Pure helper functions (getNextStatus, validateProspect, isTerminalStatus, filterProspectsByInterest, getOrderedStatusOptions, shouldCelebrate)
  prospect-helpers.test.ts    - Jest tests for prospect helper functions (including status ordering and celebration logic)
  format-pay.test.ts          - Jest tests for pay formatting logic
client/src/
  App.tsx                     - Root component, routing, providers
  pages/home.tsx              - Kanban board with 7 status columns, celebration overlay integration
  components/
    prospect-card.tsx         - Card component with edit/delete/quick-status-change actions, offer glow
    celebration-overlay.tsx   - Full-page confetti + color wash celebration (5 seconds)
    add-prospect-form.tsx     - Dialog form for creating prospects
    edit-prospect-form.tsx    - Dialog form for editing prospects
    ui/                       - shadcn/ui primitives
```

## Database

Single `prospects` table: id, company_name, role_title, job_url, status, interest_level, pay, notes, created_at.

- **Statuses**: Bookmarked, Applied, Phone Screen, Interviewing, Offer, Rejected, Withdrawn
- **Interest levels**: High, Medium, Low

## API

- `GET /api/prospects` - list all, ordered by created_at DESC
- `POST /api/prospects` - create (validated with Zod)
- `PATCH /api/prospects/:id` - partial update with field validation
- `DELETE /api/prospects/:id` - delete

## Running

- `npm run dev` starts the full app (Express + Vite)
- `npm run db:push` syncs schema to database
- `npm test` runs Jest tests (including interest level filter tests)

## Features

- **Per-column interest level filter**: Each Kanban column has a dropdown to filter prospects by interest level (All/High/Medium/Low). Filters are independent per column and operate client-side only (no server calls). Badge counts reflect the filtered view.
- **Target Salary (pay)**: Optional integer field. Displayed as "$X / hr" for values ≤999, or "$Xk" (rounded to tenths) for values ≥1000. Cards without pay show an "Add $" button; cards with pay show formatted salary that opens an inline editor on click. Also editable via add/edit forms.
- **Quick status change**: Hover over a card to see a bidirectional arrow button. Click it to open a dropdown with all other statuses, ordered starting from the next column and wrapping around.
- **Offer celebration**: Moving a job to "Offer" triggers a 5-second full-page confetti + color wash animation. Cards in the Offer column have a pulsing gold/emerald glow on hover.
