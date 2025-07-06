# Project Technology Stack Selection

## Core Language Selection
First, let's identify your primary development languages:

1. Frontend Language:
   - JavaScript/TypeScript
   - Other (please specify)

2. Backend Language:
   - Node.js (JavaScript/TypeScript)
   - Python
   - Java
   - Go
   - Other (please specify)

## Popular Stack Templates
Based on your language choices, here are some popular stack combinations. You can:
- Choose a template as-is
- Modify parts of a template
- Build your own stack piece by piece

### Frontend Stack Templates

#### Modern React Stack
- Framework: React
- Build Tool: Vite
- Styling: Tailwind CSS
- State: Zustand
- Forms: React Hook Form + Zod
- Routing: React Router
- UI Components: Radix UI / Shadcn
- Icons: Lucide/Phosphor

#### Enterprise React Stack
- Framework: React
- Build Tool: Next.js
- Styling: Styled Components
- State: Redux Toolkit
- Forms: Formik + Yup
- Routing: Next.js Router
- UI Components: Material UI
- Icons: Material Icons

#### Minimal React Stack
- Framework: React
- Build Tool: Vite
- Styling: Plain CSS/CSS Modules
- State: React Context/Hooks
- Forms: Native Forms
- Routing: React Router
- UI Components: Custom
- Icons: React Icons

### Backend Stack Templates

#### Node.js API Stack
- Runtime: Node.js
- Framework: Express/Fastify
- Database: PostgreSQL
- ORM: Prisma
- Auth: JWT + bcrypt
- Validation: Zod
- Testing: Jest
- API Style: REST

#### Node.js Full-Stack Stack
- Runtime: Node.js
- Framework: Next.js
- Database: PostgreSQL
- ORM: Prisma
- Auth: NextAuth.js
- Validation: Zod
- Testing: Jest + Playwright
- API Style: tRPC/GraphQL

## Core Areas for Custom Configuration

### Frontend Core Areas
1. Build Tooling
   - Vite
   - Next.js
   - Create React App
   - Remix
   - Astro

2. Styling Approach
   - CSS-in-JS (styled-components, emotion)
   - Utility-First (Tailwind, UnoCSS)
   - CSS Modules
   - Plain CSS/SCSS

3. State Management
   - Local (React Context/Hooks)
   - Simple (Zustand, Jotai, Valtio)
   - Full-Featured (Redux Toolkit, MobX)
   - Server State (React Query, SWR)

4. Form Handling
   - React Hook Form
   - Formik
   - Final Form
   - Native Forms

5. Data Validation
   - Zod
   - Yup
   - Joi
   - Custom

6. Routing
   - React Router
   - Framework Router (Next.js, Remix)
   - TanStack Router

7. UI Components
   - Material UI
   - Chakra UI
   - Radix UI / Shadcn
   - Headless UI
   - Custom Components

8. Testing
   - Unit: Jest/Vitest
   - Component: Testing Library
   - E2E: Playwright/Cypress
   - Visual: Storybook

### Backend Core Areas
1. API Framework
   - REST (Express, Fastify, Koa)
   - GraphQL (Apollo, type-graphql)
   - tRPC
   - gRPC

2. Database
   - SQL (PostgreSQL, MySQL)
   - NoSQL (MongoDB, Redis)
   - Graph (Neo4j)
   - Search (Elasticsearch)

3. ORM/Query Builder
   - Prisma
   - TypeORM
   - Sequelize
   - Knex

4. Authentication
   - JWT
   - OAuth/OIDC
   - Session-based
   - Magic Links

5. API Documentation
   - OpenAPI/Swagger
   - GraphQL Schema
   - tRPC Types

6. Caching Strategy
   - Redis
   - In-memory
   - CDN

7. Job Processing
   - Bull
   - Agenda
   - Custom Solutions

## Response Format
You can respond in multiple ways:

1. Choose a template:
\`\`\`json
{
  "template": "Modern React Stack",
  "modifications": {
    "state": "Redux Toolkit",
    "styling": "Tailwind CSS"
  }
}
\`\`\`

2. Build custom stack:
\`\`\`json
{
  "frontend": {
    "core": {
      "language": "TypeScript",
      "framework": "React"
    },
    "build": "Vite",
    "styling": "Tailwind CSS",
    "state": "Zustand"
  }
}
\`\`\`

## Notes
- You can start with minimal choices and add more later
- Each choice can be changed as the project evolves
- Default best practices will be used for unspecified areas
- Templates are suggestions, not restrictions 