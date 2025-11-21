# Project: TBI Admin Dashboard

## Project Overview

This is a Next.js project bootstrapped with `create-next-app`. It serves as an admin dashboard for an AI pipeline that generates reports. The project uses TypeScript, Tailwind CSS, and Prisma for database management with a PostgreSQL database. Authentication is handled by NextAuth.js. The application is designed to manage content, users, orders, and other aspects of the AI report generation pipeline.

### Key Technologies

*   **Framework:** Next.js 15.5.3
*   **Language:** TypeScript
*   **Styling:** Tailwind CSS
*   **Database:** PostgreSQL
*   **ORM:** Prisma
*   **Authentication:** NextAuth.js
*   **API:** OpenAI
*   **UI Components:** Recharts for charts

## Building and Running

### Prerequisites

*   Node.js
*   pnpm (or npm/yarn)
*   PostgreSQL database

### Installation

1.  Clone the repository.
2.  Install dependencies:
    ```bash
    pnpm install
    ```
3.  Set up your environment variables by creating a `.env` file. A sample `.env.example` file should be created with the following content:
    ```
    DATABASE_URL="postgresql://tbi_user:karta123@localhost:5432/tbi_db"
    NEXTAUTH_URL="http://localhost:3000"
    OPENAI_API_KEY="your-openai-api-key"
    ```
4.  Generate Prisma client:
    ```bash
    pnpm db:generate
    ```
5.  Run database migrations:
    ```bash
    pnpm db:migrate
    ```
6. Seed the database (optional):
   ```bash
   pnpm seed
   ```

### Running the application

To run the development server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Available Scripts

*   `pnpm dev`: Starts the development server.
*   `pnpm build`: Creates a production build.
*   `pnpm start`: Starts the production server.
*   `pnpm lint`: Lints the code.
*   `pnpm test`: Runs API tests using Jest.
*   `pnpm test:watch`: Runs tests in watch mode.
*   `pnpm test:coverage`: Generates a test coverage report.
*   `pnpm db:generate`: Generates the Prisma client.
*   `pnpm db:push`: Pushes the Prisma schema to the database.
*   `pnpm db:migrate`: Runs database migrations.
*   `pnpm db:studio`: Opens the Prisma Studio.
*   `pnpm seed`: Seeds the database.
*   `pnpm build:analyze`: Analyzes the bundle size.
*   `pnpm type-check`: Checks for TypeScript errors.

## Development Conventions

*   **Authentication:** Authentication is handled by NextAuth.js with a credentials provider. The `Admin` model is used for authentication. The session is managed with JWT.
*   **Database:** The database schema is managed with Prisma. Migrations are located in the `prisma/migrations` directory.
*   **API Routes:** API routes are located in the `src/app/api` directory.
*   **Components:** Reusable components are located in the `src/components` directory.
*   **Types:** TypeScript types are defined in the `src/types` directory.
*   **Styling:** Tailwind CSS is used for styling.
*   **Linting:** ESLint is used for linting.
*   **Testing:** Jest is used for testing. API tests are located in `src/__tests__/api` and component tests in `src/__tests__/components`.
*   **Build-time type errors**: The project is configured to ignore TypeScript errors during the build process (`ignoreBuildErrors: true` in `next.config.mjs`). It is recommended to use `pnpm type-check` to check for type errors before committing code.

This `GEMINI.md` file provides a comprehensive overview of the project, including its purpose, technologies, and development conventions. It should be a useful resource for future interactions.
