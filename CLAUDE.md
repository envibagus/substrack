# CLAUDE.md - SubTrack Codebase Guide

## Project Overview

**SubTrack** is a subscription management Progressive Web App (PWA) with an iOS-style design. It helps users track their recurring subscriptions, view spending analytics, and manage payment schedules.

### Key Features
- Track subscriptions with custom categories and payment methods
- View monthly/yearly spending analytics with charts
- Calendar view for upcoming payments
- Dark/light mode with system preference support
- iOS-style UI with smooth animations
- Multi-currency support (IDR, USD, EUR, GBP, JPY, SGD, AUD, CAD)
- Local storage persistence (designed for easy Supabase migration)

## Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| React | 19.2.0 | UI Framework |
| TypeScript | ~5.9.3 | Type Safety |
| Vite | 7.2.4 | Build Tool & Dev Server |
| Tailwind CSS | 3.4.19 | Styling |
| Framer Motion | 12.26.2 | Animations |
| Recharts | 3.6.0 | Charts (PieChart, LineChart) |
| Lucide React | 0.562.0 | Icons |
| clsx + tailwind-merge | - | Class name utilities |
| canvas-confetti | 1.9.4 | Celebration effects |

## Project Structure

```
substrack/
├── src/
│   ├── components/          # React components
│   │   ├── AddSubscriptionModal.tsx   # Add new subscription form
│   │   ├── BottomNav.tsx              # Bottom navigation bar
│   │   ├── CalendarView.tsx           # Calendar view for payments
│   │   ├── Dashboard.tsx              # Main dashboard with analytics
│   │   ├── SettingsModal.tsx          # Settings modal (legacy)
│   │   ├── SettingsPage.tsx           # Full settings page
│   │   ├── SettingsView.tsx           # Settings view (legacy)
│   │   └── SubscriptionCard.tsx       # Individual subscription card
│   ├── constants/
│   │   └── categories.ts              # Category definitions & icons
│   ├── context/
│   │   ├── AppContext.tsx             # Global app state (subscriptions, currency, profile)
│   │   └── ThemeContext.tsx           # Theme state (light/dark/system)
│   ├── types/
│   │   └── index.ts                   # TypeScript type definitions
│   ├── utils/
│   │   └── helpers.ts                 # Utility functions
│   ├── App.tsx                        # Root component
│   ├── App.css                        # App-specific styles
│   ├── index.css                      # Global styles & Tailwind
│   └── main.tsx                       # Entry point
├── public/
│   └── logo.svg                       # App logo
├── index.html                         # HTML template
├── tailwind.config.js                 # Tailwind configuration
├── vite.config.ts                     # Vite configuration
├── tsconfig.json                      # TypeScript config
├── eslint.config.js                   # ESLint configuration
├── netlify.toml                       # Netlify deployment config
└── package.json                       # Dependencies & scripts
```

## Development Commands

```bash
# Start development server
npm run dev

# Build for production (TypeScript check + Vite build)
npm run build

# Run ESLint
npm run lint

# Preview production build
npm run preview
```

## Key Files Reference

### Type Definitions (`src/types/index.ts`)

```typescript
// Main subscription interface
interface Subscription {
  id: string;
  name: string;
  cost: number;
  currency?: string;
  billingCycle: BillingCycle;        // 'monthly' | 'yearly' | 'weekly' | 'quarterly'
  category: SubscriptionCategory;     // 'entertainment' | 'utilities' | etc.
  startDate: string;                  // ISO date
  nextBillDate: string;               // ISO date
  isActive: boolean;
  // Optional fields...
}

// App state interface
interface AppState {
  subscriptions: Subscription[];
  currency: string;
  isLoading: boolean;
  profile: Profile;
}
```

### Context Usage

**AppContext** - Global subscription state:
```typescript
import { useApp } from '../context/AppContext';

function MyComponent() {
  const { state, actions } = useApp();

  // Read state
  const { subscriptions, currency, profile } = state;

  // Use actions
  actions.addSubscription({ ... });
  actions.updateSubscription(id, { ... });
  actions.deleteSubscription(id);
  actions.setCurrency('USD');
  actions.getTotalMonthlySpend();
}
```

**ThemeContext** - Theme management:
```typescript
import { useTheme } from '../context/ThemeContext';

function MyComponent() {
  const { theme, resolvedTheme, setTheme } = useTheme();
  // theme: 'light' | 'dark' | 'system'
  // resolvedTheme: 'light' | 'dark'
}
```

### Utility Functions (`src/utils/helpers.ts`)

| Function | Purpose |
|----------|---------|
| `cn(...classes)` | Merge Tailwind classes (clsx + tailwind-merge) |
| `formatCurrency(amount, currency)` | Format currency with proper symbols |
| `formatDate(dateStr)` | Format date to "Jan 15, 2024" |
| `formatRelativeDate(dateStr)` | Format to "Today", "Tomorrow", "in 3 days" |
| `getDaysUntilDue(dateStr)` | Calculate days until due date |
| `getMonthlyCost(cost, cycle)` | Convert any billing cycle to monthly |
| `convertCurrency(amount, from, to)` | Convert between currencies |

## Coding Conventions

### Component Structure

Components follow this pattern:
```typescript
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SomeIcon } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { cn } from '../utils/helpers';
import type { SomeType } from '../types';

interface ComponentProps {
  propName: string;
  onAction?: () => void;
}

export function ComponentName({ propName, onAction }: ComponentProps) {
  // Hooks at the top
  const { state, actions } = useApp();
  const [localState, setLocalState] = useState(false);

  // Effects
  useEffect(() => {
    // ...
  }, [dependencies]);

  // Handlers
  const handleClick = () => {
    // ...
  };

  // Render
  return (
    <motion.div className="...">
      {/* JSX */}
    </motion.div>
  );
}
```

### Styling Patterns

1. **Use Tailwind classes** for all styling
2. **Use `cn()` helper** for conditional classes:
   ```typescript
   className={cn(
     "base-classes",
     isActive && "active-classes",
     isDisabled ? "disabled-classes" : "enabled-classes"
   )}
   ```
3. **Dark mode**: Use `dark:` prefix for dark mode variants
   ```typescript
   className="bg-white dark:bg-slate-900 text-surface-900 dark:text-slate-50"
   ```
4. **Custom CSS classes** defined in `src/index.css`:
   - `.ios-list` - iOS-style grouped list container
   - `.ios-list-item` - List item with border
   - `.ios-input` - iOS-style input field
   - `.glass` / `.nav-glass` - Glass morphism effects
   - `.btn-primary` - Primary button gradient
   - `.card-base` - Base card styling

### Color System (Tailwind)

| Semantic | Light Mode | Dark Mode |
|----------|------------|-----------|
| Background | `surface-50` | `slate-950` |
| Card | `white` | `slate-900` |
| Text Primary | `surface-900` | `slate-50` |
| Text Secondary | `surface-500` | `slate-400` |
| Primary | `primary-500` | `primary-400` |
| Accent | `accent-500` | `accent-400` |

### Animation Patterns

Use Framer Motion for all animations:
```typescript
// Page/container animations
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
};

// Item animations
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 300, damping: 24 },
  },
};

// Button interactions
<motion.button
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
>
```

### Modal Pattern

Modals use iOS-style bottom sheet design:
```typescript
<AnimatePresence>
  {isOpen && (
    <motion.div
      className="fixed inset-0 z-50 flex items-end justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Backdrop */}
      <motion.div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      {/* Modal content - slides up from bottom */}
      <motion.div
        className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-t-3xl"
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      >
        {/* Handle bar */}
        <div className="w-12 h-1 bg-surface-300 rounded-full mx-auto mb-6" />
        {/* Content */}
      </motion.div>
    </motion.div>
  )}
</AnimatePresence>
```

## State Persistence

Data is persisted to localStorage with these keys:
- `subtrack_subscriptions` - Subscription list
- `subtrack_theme` - Theme preference
- `subtrack-currency` - Currency preference
- `subtrack-profile` - User profile (username, picture)
- `subtrack-custom-categories` - Custom categories
- `subtrack-payment-methods` - Payment methods
- `subtrack-lists` - Subscription lists/tags

## Important Patterns

### Swipeable Cards
`SubscriptionCard` uses Framer Motion drag for swipe-to-delete/edit:
```typescript
<motion.div
  drag="x"
  dragConstraints={{ left: -SWIPE_LIMIT, right: SWIPE_LIMIT }}
  dragElastic={0.1}
  dragSnapToOrigin={true}
  onDragEnd={handleDragEnd}
>
```

### Logo Fetching
Auto-fetch logos via Clearbit API in `AddSubscriptionModal`:
```typescript
const logoUrl = `https://logo.clearbit.com/${domain}?size=128`;
```

### Currency Conversion
All costs can be converted to the user's selected currency:
```typescript
const displayCost = subscription.currency && subscription.currency !== currency
  ? convertCurrency(subscription.cost, subscription.currency, currency)
  : subscription.cost;
```

## Deployment

- **Platform**: Netlify
- **Build command**: `npm run build`
- **Publish directory**: `dist`

## Testing Guidelines

Currently no test framework is set up. When adding tests:
1. Consider Vitest (Vite-native test runner)
2. Testing Library for component tests
3. Focus on context and utility function unit tests

## Adding New Features

### New Component Checklist
1. Create file in `src/components/`
2. Use TypeScript interfaces for props
3. Import hooks from context as needed
4. Use `cn()` for conditional styling
5. Add Framer Motion for animations
6. Support dark mode with `dark:` variants
7. Follow iOS-style design patterns

### New Subscription Field Checklist
1. Add to `Subscription` interface in `src/types/index.ts`
2. Update `AppContext` reducer if needed
3. Add form field in `AddSubscriptionModal`
4. Display in `SubscriptionCard` and `Dashboard`
5. Handle in localStorage persistence

## Common Issues

1. **Missing useRef import**: `AppContext.tsx` uses `useRef` - ensure it's imported
2. **Date handling**: Always use ISO strings (`YYYY-MM-DD`) for dates
3. **Safe area**: Use `env(safe-area-inset-*)` for iOS notch/home indicator
4. **Theme flash**: Theme is initialized from localStorage in `ThemeContext`
