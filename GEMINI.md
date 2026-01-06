# Project Context: TBI Admin Dashboard (Market Research Platform)

## Overview
This is a Next.js web application designed for managing and selling market research reports. It functions as both a Content Management System (CMS) for internal admins and an E-commerce platform for users.

**Key Features:**
*   **Report Management:** CRUD operations for market research reports, including categories and press releases.
*   **E-commerce:** Order processing, payment integration (PayPal mentioned in dependencies), and user management.
*   **Localization:** Extensive support for multi-language content (Reports, Blogs, Categories) with dedicated translation workflows.
*   **AI Integration:** Built-in capabilities for AI-assisted content generation and translation (using OpenAI/GPT models).
*   **Admin Dashboard:** A dedicated interface (`/admin`) for managing content, users, and orders.

## Tech Stack
*   **Framework:** Next.js 16 (App Router)
*   **Language:** TypeScript
*   **UI Library:** React 19
*   **Styling:** Tailwind CSS (v4)
*   **Database:** PostgreSQL (via Prisma ORM)
*   **Authentication:** NextAuth.js (v4)
*   **Forms:** React Hook Form + Zod validation
*   **Testing:** Jest + React Testing Library

## Architecture
*   **Routing:** Uses the Next.js App Router.
    *   `src/app/[lang]`: Handles public-facing pages with internationalization.
    *   `src/app/admin`: Contains the admin dashboard routes.
    *   `src/app/api`: Backend API endpoints.
*   **Data Access:** Prisma Client is used for all database interactions.
    *   Schema located at `prisma/schema.prisma`.
*   **Internationalization:** Dynamic routing `[lang]` is used to serve localized content.

## Key Commands

### Development
```bash
# Start the development server
npm run dev

# Run linting
npm run lint

# Run type checking
npm run type-check
```

### Database (Prisma)
```bash
# Push schema changes to the database (prototyping)
npm run db:push

# Create a migration from schema changes
npm run db:migrate

# Generate Prisma Client (run after schema changes)
npm run db:generate

# Seed the database
npm run seed

# Open Prisma Studio (GUI for database)
npm run db:studio
```

### Build & Test
```bash
# Build the application for production
npm run build

# Run unit tests
npm test

# Run tests in watch mode
npm run test:watch
```

## Database Models (Core)
*   **Report:** The central content unit (Market Research Reports).
*   **Category:** Classification for reports.
*   **Order / OrderItem:** E-commerce transactions.
*   **TranslationJob / ReportTranslation:** Handles the localization workflow for reports.
*   **User / Admin:** User roles and authentication.

## Development Conventions
*   **Strict Typing:** Maintain strict TypeScript types. Use Zod schemas for runtime validation, especially for API inputs and forms.
*   **Component Structure:** Components should be small, focused, and located in `src/components`.
*   **Styling:** Use Tailwind CSS utility classes. Avoid custom CSS files unless necessary (`globals.css`).
*   **Testing:** Write unit tests for utility functions and critical components using Jest.
