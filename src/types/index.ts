/**
 * Subscription Types
 *
 * These types define the data structure for subscriptions.
 * Designed to be easily swapped with a Supabase backend later.
 */

export type BillingCycle = 'monthly' | 'yearly' | 'weekly' | 'quarterly';

export type SubscriptionCategory =
  | 'entertainment'
  | 'utilities'
  | 'software'
  | 'fitness'
  | 'education'
  | 'gaming'
  | 'music'
  | 'cloud'
  | 'other';

/**
 * Main subscription data structure
 */
export interface Subscription {
  id: string;
  name: string;
  description?: string;
  cost: number;
  currency?: string;
  billingCycle: BillingCycle;
  category: SubscriptionCategory;
  startDate: string; // ISO date string
  nextBillDate: string; // ISO date string
  logoUrl?: string;
  isActive: boolean;
  paymentMethod?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  // New fields for single-page form
  hasFreeTrial?: boolean;
  freeTrialEndDate?: string;
  reminderDays?: number; // Days before to remind
  url?: string; // Website URL
  list?: string; // Personal, Work, etc.
}

/**
 * Category display info for UI
 */
export interface CategoryInfo {
  id: SubscriptionCategory;
  name: string;
  icon: string;
  color: string;
  gradient: string;
}

/**
 * Spending data for charts
 */
export interface SpendingData {
  month: string;
  amount: number;
  subscriptions: number;
}

/**
 * App state structure
 */
export interface AppState {
  subscriptions: Subscription[];
  currency: string;
  isLoading: boolean;
  error?: string | null;
}

/**
 * App actions
 */
export type AppAction =
  | { type: 'SET_SUBSCRIPTIONS'; payload: Subscription[] }
  | { type: 'ADD_SUBSCRIPTION'; payload: Subscription }
  | { type: 'UPDATE_SUBSCRIPTION'; payload: { id: string; updates: Partial<Subscription> } }
  | { type: 'DELETE_SUBSCRIPTION'; payload: string }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_CURRENCY'; payload: string };

/**
 * Context type
 */
export interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  actions: {
    addSubscription: (subscription: Omit<Subscription, 'id' | 'createdAt' | 'updatedAt'>) => void;
    updateSubscription: (id: string, updates: Partial<Subscription>) => void;
    deleteSubscription: (id: string) => void;
    setCurrency: (currency: string) => void;
    getUpcomingSubscriptions: (days?: number) => Subscription[];
    getTotalMonthlySpend: () => number;
  };
}
