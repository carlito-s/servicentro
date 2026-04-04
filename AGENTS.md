# AGENTS.md - Servicentro Turn Management System

## Project Overview

React SPA for managing fuel station turns at Servicentro (CUPET/Oro Negro). The system digitizes the queue so customers only arrive when they have a guaranteed slot, optimizing citizen time and station logistics.

**Key Constraints:**
- No backend allowed - all data persisted locally in IndexedDB
- No external APIs (Firebase, Supabase, etc.)
- Works offline after first load

**Tech Stack:**
- Vite + React 18 + TypeScript
- Dexie.js for IndexedDB management
- Tailwind CSS for styling
- react-router-dom for routing
- Vitest + React Testing Library for tests

## Development Commands

```bash
npm install              # Install dependencies
npm run dev              # Start development server (Vite)
npm run build            # Production build
npm run preview          # Preview production build
npm run lint             # ESLint check
npm run typecheck        # TypeScript compiler check
npm run test             # Run all tests (Vitest)
npm run test -- <file>   # Run single test file
```

## Architecture

### Layer Structure

```
src/
├── components/          # Presentational UI components
├── hooks/               # Custom hooks (business logic)
│   ├── useAuth.ts
│   ├── useTurns.ts
│   ├── useReservations.ts
│   └── useStorage.ts
├── contexts/           # React contexts
│   └── AuthContext.tsx
├── layouts/             # Page layouts
│   ├── PublicLayout.tsx
│   └── AdminLayout.tsx
├── pages/               # Route pages
├── db/                  # Dexie database setup
│   └── database.ts
├── types/               # TypeScript interfaces
└── utils/               # Helper functions
```

### Custom Hooks Pattern

All business logic resides in custom hooks, not components:

- `useAuth` - Authentication state and login/logout functions
- `useTurns` - Turn CRUD with overlap validation
- `useReservations` - Reservation management with capacity checks
- `useStorage` - Dexie/IndexedDB interface

### State Management

- **Global Auth State**: `AuthContext` with `useState` + `localStorage` persistence
- **Database State**: Dexie + `useLiveQuery` for reactive queries
- **Local Component State**: `useState` for UI-only state

### Protected Routes

Use `ProtectedRoute` wrapper component to guard admin routes:

```tsx
<Route element={<ProtectedRoute />}>
  <Route path="/admin/turns" element={<TurnsAdmin />} />
</Route>
```

## Naming Conventions

### Code (English)

| Element | Convention | Example |
|---------|------------|---------|
| Components | PascalCase | `TurnForm`, `ReservationList` |
| Hooks | camelCase with `use` prefix | `useTurns`, `useReservations` |
| Pages | PascalCase | `AvailableTurns`, `Login` |
| Types/Interfaces | PascalCase with `I` prefix | `ITurn`, `IReservation`, `IUser` |
| Functions | camelCase | `validateOverlap`, `cancelReservation` |
| Constants | UPPER_SNAKE_CASE | `MAX_CAPACITY`, `DEFAULT_STATUS` |
| Files (components) | PascalCase.tsx | `TurnForm.tsx` |
| Files (hooks/utils) | camelCase.ts | `useTurns.ts` |

### Domain Models (English in code)

- `Turn` (not Turno) - Time block for fuel dispensing
- `Reservation` (not Reserva) - Client booking
- `Client` (not Cliente) - Vehicle owner
- `Capacity` (not Cupo) - Maximum vehicles per turn

### User Interface (Spanish)

UI labels and messages shown to users remain in Spanish:
- "Turno disponible", "Reservar", "Despachado", "Cancelado"

## Import Organization

Order imports in this sequence:

```typescript
// 1. React
import { useState, useEffect } from 'react';

// 2. Third-party libraries
import { useLiveQuery } from 'dexie-react-hooks';
import { useNavigate } from 'react-router-dom';

// 3. Contexts
import { useAuth } from '../contexts/AuthContext';

// 4. Custom hooks
import { useTurns } from '../hooks/useTurns';

// 5. Components
import { TurnForm } from '../components/TurnForm';

// 6. Types
import type { ITurn, IReservation } from '../types';

// 7. Utilities
import { formatDate } from '../utils/date';
```

## TypeScript Conventions

```typescript
// Strict mode enabled in tsconfig.json

// Interfaces for domain models
interface ITurn {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  maxCapacity: number;
  status: 'active' | 'cancelled' | 'completed';
}

// Explicit return types for functions
export function validateOverlap(turns: ITurn[], newTurn: ITurn): boolean {
  return turns.some(turn => 
    turn.date === newTurn.date && 
    timesOverlap(turn, newTurn)
  );
}

// Type unions for literal types
type ReservationStatus = 'pending' | 'dispatched' | 'cancelled';

// Avoid any - use unknown when type uncertain
function handleError(error: unknown): string {
  if (error instanceof Error) return error.message;
  return 'Unknown error';
}
```

## Error Handling

### Async Operations

```typescript
async function createTurn(turn: ITurn): Promise<void> {
  try {
    await db.turns.add(turn);
  } catch (error) {
    console.error('Failed to create turn:', error);
    throw new Error('No se pudo crear el turno. Intente nuevamente.');
  }
}
```

### Form Validation

```typescript
function validateReservation(data: IReservation): string | null {
  if (!data.clientName.trim()) return 'El nombre es requerido';
  if (!data.idCard.trim()) return 'El carné es requerido';
  return null;
}
```

### User-Facing Errors

All error messages shown to users must be in Spanish. Never expose technical details or stack traces.

## Tailwind CSS Conventions (v4)

### Setup

Tailwind v4 uses the Vite plugin. No separate config files needed:

```typescript
// vite.config.ts
import tailwindcss from '@tailwindcss/vite'
export default defineConfig({
  plugins: [react(), tailwindcss()],
})
```

```css
/* src/styles.css */
@import "tailwindcss";
```

### Class Organization

```jsx
<div className="flex flex-col gap-4 p-6 bg-white rounded-lg shadow-md">
```

Order: Layout → Spacing → Sizing → Typography → Background → Border → Effects

### Responsive Design

Use Tailwind breakpoints:

```jsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
```

### Component Patterns

```tsx
// Extract repeated patterns to constants or utility functions
const statusStyles: Record<string, string> = {
  active: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
  completed: 'bg-gray-100 text-gray-800',
};

<span className={`px-2 py-1 rounded ${statusStyles[status]}`}>
```

## Testing Conventions

### File Location

Place test files adjacent to source files:

```
src/components/TurnForm.tsx
src/components/TurnForm.test.tsx
```

### Test Structure

```typescript
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect } from 'vitest';

describe('US-03: Turn Management', () => {
  it('should create a turn without overlap', async () => {
    // Arrange
    const user = userEvent.setup();
    
    // Act
    render(<TurnForm />);
    await user.type(screen.getByLabelText(/fecha/i), '2025-01-15');
    
    // Assert
    expect(screen.getByText('Turno creado')).toBeInTheDocument();
  });
});
```

### User Story Mapping

Prefix describe blocks with user story ID: `US-01`, `US-02`, etc. (see `doc/Planning/User-Stories/`)

## File Structure Reference

```
doc/
├── ADRs/                    # Architecture Decision Records
├── Architecture/            # System diagrams
├── Domain/                   # Database schema
├── Planning/
│   ├── Task-Backlog/        # Technical breakdown
│   └── User-Stories/        # US-01 through US-04
├── Requirements/            # Functional/Non-functional
└── Use Cases/               # Use case documentation
```

## Key Business Rules

1. **Overlap Validation**: Admin cannot create two turns on the same pump at the same time
2. **Capacity Guarantee**: A successful reservation guarantees fuel availability
3. **Transparency**: Client always sees remaining capacity before booking
4. **No Backend**: All data lives in IndexedDB - no external APIs

## Development Workflow

1. Read relevant User Story in `doc/Planning/User-Stories/`
2. Review ADRs in `doc/ADRs/` for architectural decisions
3. Implement feature following hook → component pattern
4. Write tests adjacent to source files
5. Run `npm run lint && npm run typecheck && npm run test`