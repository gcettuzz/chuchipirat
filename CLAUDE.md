# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Chuchipirat is a German-language event and recipe management web application. It allows users to plan events with menus, generate shopping lists, manage recipes, and export documents as PDFs.

## Commands

- **Dev server**: `npm start` (port 3000)
- **Build**: `npm run build` (production), `npm run build:dev`, `npm run build:test`
- **Lint**: `npm run lint`
- **Test**: `npm run test` (Jest with watch mode)
- **Bundle analysis**: `npm run analyze`

Environment-specific builds use `env-cmd` with `.env.development`, `.env.test`, `.env.production`.

## Tech Stack

- **React 17** with **TypeScript 4.5**, bootstrapped with CRA (react-scripts 4)
- **MUI v5** (@mui/material) with Emotion for styling
- **React Router v5** with lazy-loaded routes and role-based authorization
- **Firebase v10** — Firestore, Authentication, Storage, Analytics, Cloud Functions
- **@react-pdf/renderer** for PDF export (menu plans, recipes, shopping/material lists)
- **@atlaskit/pragmatic-drag-and-drop** for drag-and-drop reordering
- **Fuse.js** for fuzzy search, **date-fns** for dates, **Sentry** for error monitoring

## Architecture

### State Management

React Context API only (no Redux). Four contexts:

- `FirebaseContext` — singleton Firebase instance
- `AuthUserContext` — authenticated user state
- `CustomDialogContext` — dialog management with Promise-based confirmation API
- `NavigationValuesContext` — navigation state

HOCs (`withAuthentication`, `withAuthorization`, `withFirebase`) wrap components to inject context.

### Service Layer

`src/components/Firebase/` contains the entire Firebase abstraction:

- `firebase.class.ts` — main Firebase wrapper, single entry point
- `Db/firebase.db.*.class.ts` — ~77 specialized database operation classes (events, recipes, users, products, etc.)
- `Storage/` — file upload/download
- `Authentication/` — auth state management
- `Analytics/` — event tracking

### Component Pattern

- **Feature-based folders**: `Event/`, `Recipe/`, `User/`, `Admin/`, etc.
- **Class-based models** (`.class.ts`) for business logic — `Recipe`, `Event`, `Menuplan`, `ShoppingListCollection`, `User`, `Product`, `Material`, `Unit`, `Department`
- **Functional React components** with hooks for UI
- Shared utilities in `src/components/Shared/utils.class.ts`

### Constants

All in `src/constants/`:

- `text.ts` — German UI text (all `TEXT_*` constants)
- `routes.ts` — route path definitions
- `styles.ts` — theme/styling constants
- `defaultValues.ts` — default configuration
- `firebaseEvent.ts` — analytics event names
- `styles*Pdf.ts` — PDF-specific styling

### PDF Generation

React-PDF renderer creates exportable documents: menu plans, scaled recipes, shopping lists, material lists, event receipts. Each has dedicated style constants.

## Conventions

- **File naming**: `.class.ts` for model/logic classes, `.tsx` for components, `firebase.db.*.class.ts` for DB operations
- **All UI text is German** — centralized in `text.ts` as exported constants
- **Git branches**: `<issue-number>-<description>`, commits reference GitHub issues
- **TypeScript strict mode** enabled with `strictNullChecks`
- **Three Firebase environments**: dev (`chuchipirat-dev`), test (`chuchipirat-tst`), prod (`chuchipirat`)
- **Clean Code**: use clean-code principles.

## Refactoring Guidelines

When asked to refactor a file or component, apply these checks:

### Code Organization & Structure
- Component size and single responsibility — are components doing too much?
- Proper separation of concerns (UI vs logic vs data fetching)
- File/folder structure and naming conventions

### Type Safety
- Proper TypeScript usage — avoid `any`, prefer `unknown` when the type is truly unknown
- Props interfaces well-defined and documented
- Generic types used appropriately
- Type inference vs explicit typing balance

### Performance
- Unnecessary re-renders (missing memoization with `useMemo`, `useCallback`, `React.memo`)
- Heavy computations that should be memoized

### State Management
- Is state at the right level? (avoiding prop drilling vs over-centralization)
- Could `useReducer` replace complex `useState` logic?
- Are derived values computed instead of stored?
- Proper use of refs vs state

### Side Effects & Data Flow
- `useEffect` dependencies correct and minimal
- No missing cleanup functions
- Async operations handled properly
- Clear data flow (unidirectional)

### React Best Practices
- Key props on lists
- Controlled vs uncontrolled components used appropriately
- Custom hooks to extract reusable logic
- Proper error boundaries
- Prefer early returns to reduce nesting

### Code Quality
- DRY principle — reusable components/hooks
- Readable variable/function names
- Comments where complexity requires explanation
- Consistent code style

### Testability
- The code must be testable by unit tests
- If unit tests are missing, create them for the refactored code
- Database access and API calls must be mocked
