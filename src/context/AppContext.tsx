import React, { createContext, useContext, useReducer, useEffect, useRef } from 'react';
import type { AppContextType, AppState, AppAction, Subscription, Profile } from '../types';
import { STORAGE_KEY } from '../constants/categories';
import { getMonthlyCost } from '../utils/helpers';

const PROFILE_STORAGE_KEY = 'subtrack-profile';

/**
 * App Context for managing subscription state
 * Uses Local Storage for persistence (easily swappable with Supabase)
 */

// Initial state
const initialState: AppState = {
  subscriptions: [],
  currency: 'IDR',
  isLoading: true,
  error: null,
  profile: { username: 'User', picture: null },
};

// Reducer
function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_SUBSCRIPTIONS':
      return {
        ...state,
        subscriptions: action.payload,
        isLoading: false,
      };
    case 'ADD_SUBSCRIPTION':
      return {
        ...state,
        subscriptions: [...state.subscriptions, action.payload],
      };
    case 'UPDATE_SUBSCRIPTION':
      return {
        ...state,
        subscriptions: state.subscriptions.map((sub) =>
          sub.id === action.payload.id
            ? { ...sub, ...action.payload.updates, updatedAt: new Date().toISOString() }
            : sub
        ),
      };
    case 'DELETE_SUBSCRIPTION':
      return {
        ...state,
        subscriptions: state.subscriptions.filter((sub) => sub.id !== action.payload),
      };
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        isLoading: false,
      };
    case 'SET_CURRENCY':
      return {
        ...state,
        currency: action.payload,
      };
    case 'SET_PROFILE':
      return {
        ...state,
        profile: action.payload,
      };
    default:
      return state;
  }
}

// Create context
const AppContext = createContext<AppContextType | undefined>(undefined);

// Provider component
export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Load subscriptions from local storage on mount
  useEffect(() => {
    const loadSubscriptions = () => {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          dispatch({ type: 'SET_SUBSCRIPTIONS', payload: parsed });
        } else {
          // Start with empty array for first-time users
          dispatch({ type: 'SET_SUBSCRIPTIONS', payload: [] });
        }
      } catch (error) {
        console.error('Failed to load subscriptions:', error);
        dispatch({ type: 'SET_ERROR', payload: 'Failed to load subscriptions' });
      }
    };

    loadSubscriptions();
  }, []);

  // Load currency from local storage on mount
  useEffect(() => {
    const loadCurrency = () => {
      try {
        const storedCurrency = localStorage.getItem('subtrack-currency');
        if (storedCurrency) {
          dispatch({ type: 'SET_CURRENCY', payload: storedCurrency });
        }
      } catch (error) {
        console.error('Failed to load currency:', error);
      }
    };

    loadCurrency();
  }, []);

  // Load profile from local storage on mount
  useEffect(() => {
    const loadProfile = () => {
      try {
        const storedProfile = localStorage.getItem(PROFILE_STORAGE_KEY);
        if (storedProfile) {
          const parsed = JSON.parse(storedProfile);
          dispatch({ type: 'SET_PROFILE', payload: parsed });
        }
      } catch (error) {
        console.error('Failed to load profile:', error);
      }
    };

    loadProfile();
  }, []);

  // Save to local storage whenever subscriptions change
  useEffect(() => {
    if (state.subscriptions.length > 0) {
      saveToLocalStorage(state.subscriptions);
    }
  }, [state.subscriptions]);

  // Save currency to local storage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('subtrack-currency', state.currency);
    } catch (error) {
      console.error('Failed to save currency:', error);
    }
  }, [state.currency]);

  // Save profile to local storage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(state.profile));
    } catch (error) {
      console.error('Failed to save profile:', error);
    }
  }, [state.profile]);

  // Helper to save to local storage
  const saveToLocalStorage = (subscriptions: Subscription[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(subscriptions));
    } catch (error) {
      console.error('Failed to save subscriptions:', error);
    }
  };

  // Actions
  const actions = {
    addSubscription: (subscription: Omit<Subscription, 'id' | 'createdAt' | 'updatedAt'>) => {
      const newSubscription: Subscription = {
        ...subscription,
        id: `sub-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      dispatch({ type: 'ADD_SUBSCRIPTION', payload: newSubscription });
    },

    updateSubscription: (id: string, updates: Partial<Subscription>) => {
      dispatch({ type: 'UPDATE_SUBSCRIPTION', payload: { id, updates } });
    },

    deleteSubscription: (id: string) => {
      dispatch({ type: 'DELETE_SUBSCRIPTION', payload: id });
    },

    setCurrency: (currency: string) => {
      dispatch({ type: 'SET_CURRENCY', payload: currency });
    },

    setProfile: (profile: Profile) => {
      dispatch({ type: 'SET_PROFILE', payload: profile });
    },

    getUpcomingSubscriptions: (days: number = 7) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const futureDate = new Date(today);
      futureDate.setDate(futureDate.getDate() + days);

      return state.subscriptions
        .filter((sub) => {
          const billDate = new Date(sub.nextBillDate);
          return billDate >= today && billDate <= futureDate;
        })
        .sort((a, b) => {
          const dateA = new Date(a.nextBillDate);
          const dateB = new Date(b.nextBillDate);
          return dateA.getTime() - dateB.getTime();
        });
    },

    getTotalMonthlySpend: () => {
      return state.subscriptions
        .filter((sub) => sub.isActive)
        .reduce((total, sub) => {
          return total + getMonthlyCost(sub.cost, sub.billingCycle);
        }, 0);
    },
  };

  const value: AppContextType = {
    state,
    dispatch,
    actions,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

// Custom hook to use the context
export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
