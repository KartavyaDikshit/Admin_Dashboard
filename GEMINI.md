# Project Overview

This is a Next.js project that serves as an admin dashboard for managing content, users, and orders. It utilizes Prisma as an ORM for database management and integrates with the OpenAI API for AI-powered content generation and translation. The application supports multiple languages and has a role-based access control system for admins.

## Key Technologies

*   **Framework:** Next.js
*   **Language:** TypeScript
*   **Styling:** Tailwind CSS
*   **Database:** PostgreSQL with Prisma
*   **Authentication:** NextAuth.js
*   **API Communication:** Axios
*   **AI:** OpenAI (gpt-4o-mini)
*   **UI Components:** Recharts for charts

# Building and Running

## Prerequisites

*   Node.js
*   pnpm
*   PostgreSQL

## Installation

1.  Install dependencies:
    ```bash
    pnpm install
    ```

2.  Set up the database:
    *   Ensure your PostgreSQL database is running.
    *   Create a `.env` file and set the `DATABASE_URL`, `NEXTAUTH_URL`, and `OPENAI_API_KEY` environment variables.
    *   Run the following command to create and seed the database:
        ```bash
        pnpm db:migrate
        pnpm db:seed
        ```

## Running the Application

To run the application in development mode, use the following command:

```bash
pnpm dev
```

The application will be available at [http://localhost:3000](http://localhost:3000).

## Building for Production

To build the application for production, use the following command:

```bash
pnpm build
```

## Testing

To run the tests, use the following command:

```bash
pnpm test
```

# Development Conventions

*   **Linting:** The project uses ESLint for code linting. Run `pnpm lint` to check for linting errors.
*   **Type Checking:** The project uses TypeScript for type checking. Run `pnpm type-check` to check for type errors.
*   **Database Migrations:** Database migrations are managed with Prisma. To create a new migration, run `pnpm db:migrate`.
*   **Seeding:** The database is seeded with initial data using `pnpm db:seed`. The seed script is located at `prisma/seed.ts`.

# AI Services

The application uses two main AI services for translation:

*   **`AITranslationService`:** This service translates the entire content of a report or category.
*   **`OptimizedAiTranslationService`:** This service is designed to be more efficient by only translating the sections of a report that have been edited.

Both services use the `gpt-4o-mini` model from OpenAI.