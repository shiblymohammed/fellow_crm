# Fellow CRM API

NestJS backend for Fellow CRM.

## Setup

```bash
# Install dependencies
pnpm install

# Generate Prisma Client
pnpm prisma:generate

# Run migrations
pnpm prisma:migrate

# Seed database
pnpm prisma:seed

# Start development server
pnpm dev
```

## API Documentation

Once running, visit: http://localhost:3001/api/docs

## Database

- Prisma Studio: `pnpm prisma:studio`
- Create migration: `pnpm prisma migrate dev --name migration_name`

## Environment Variables

See `.env.example` for required variables.
