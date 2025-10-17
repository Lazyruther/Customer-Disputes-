# Customer Dispute Portal

A fully redesigned customer dispute operations portal built with the modern Next.js app router, Prisma ORM, a PostgreSQL data model, and Tailwind CSS. The experience provides a live dashboard for customer success teams to monitor dispute pipelines, resolution velocity, and backlog health.

## Tech Stack

- **Next.js 14** (App Router) with **TypeScript**
- **Prisma** ORM targeting **PostgreSQL**
- **Tailwind CSS** for utility-first styling
- **React 18** server components

## Getting Started

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Configure environment**

   Create a `.env` file based on `.env.example` and set the `DATABASE_URL` to a reachable PostgreSQL instance.

3. **Generate Prisma client & run migrations**

   ```bash
   npm run prisma:generate
   npm run prisma:migrate
   ```

4. **Start the development server**

   ```bash
   npm run dev
   ```

   The dashboard will be available at [http://localhost:3000](http://localhost:3000).

## Project Structure

```
app/             # Next.js server components and routing
components/      # Reusable React components
lib/             # Prisma client singleton
prisma/          # Prisma schema and migrations
public/          # Static assets
styles/          # Shared styling resources
```

## Database Model

```prisma
model Dispute {
  id           Int           @id @default(autoincrement())
  customerName String
  issue        String
  status       DisputeStatus @default(OPEN)
  createdAt    DateTime      @default(now())
  updatedAt    DateTime      @updatedAt
}

enum DisputeStatus {
  OPEN
  IN_PROGRESS
  RESOLVED
}
```

## Tailwind CSS

Tailwind is configured through `tailwind.config.ts` and applied via `app/globals.css`. Adjust the `brand` color palette or extend the theme as needed for future UI work.

## Scripts

- `npm run dev` – Start the Next.js development server.
- `npm run build` – Generate a production build.
- `npm run start` – Run the production build.
- `npm run lint` – Execute Next.js linting rules.
- `npm run prisma:generate` – Generate Prisma client from the schema.
- `npm run prisma:migrate` – Apply schema migrations to the configured database.

## Deployment

When deploying, ensure the `DATABASE_URL` environment variable is set and accessible. Run migrations before launching the production server to keep the database schema up to date.
