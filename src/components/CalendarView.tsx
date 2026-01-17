import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { CATEGORIES } from '../constants/categories';
import { cn, formatDate, formatRelativeDate, getDaysUntilDue, formatCurrency, convertCurrency, getMonthlyCost } from '../utils/helpers';
import type { Subscription } from '../types';

/**
 * Calendar View Component
 *
 * Features:
 * - Monthly scrollable view
 * - Shows upcoming and past subscriptions
 * - Visual indicators for due dates
 * - Click on day to see subscriptions
 */

export function CalendarView() {
  const { state } = useApp();
  const { subscriptions, currency } = state;

  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // Get current month info
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  // Calculate monthly stats
  const monthlySubscriptions = useMemo(() => {
    const now = new Date();
    return subscriptions.filter((sub) => {
      const billDate = new Date(sub.nextBillDate);
      return billDate.getMonth() === now.getMonth() && billDate.getFullYear() === now.getFullYear();
    });
  }, [subscriptions, currentMonth, currentYear]);

  const totalMonthlyAmount = useMemo(() => {
    return monthlySubscriptions.reduce((sum, sub) => {
      const monthlyCost = getMonthlyCost(sub.cost, sub.billingCycle);
      // Convert to global currency if needed
      if (sub.currency && sub.currency !== currency) {
        return sum + convertCurrency(monthlyCost, sub.currency, currency);
      }
      return sum + monthlyCost;
    }, 0);
  }, [monthlySubscriptions, currency]);

  // Calculate upcoming amount in next 7 days
  const upcomingAmount = useMemo(() => {
    const now = new Date();
    const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    return subscriptions
      .filter((sub) => {
        const billDate = new Date(sub.nextBillDate);
        return billDate >= now && billDate <= weekFromNow;
      })
      .reduce((sum, sub) => {
        const monthlyCost = getMonthlyCost(sub.cost, sub.billingCycle);
        // Convert to global currency if needed
        if (sub.currency && sub.currency !== currency) {
          return sum + convertCurrency(monthlyCost, sub.currency, currency);
        }
        return sum + monthlyCost;
      }, 0);
  }, [subscriptions, currency]);

  // Get days in month
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();

  // Generate calendar days
  const calendarDays = useMemo(() => {
    const days: Array<{ date: Date; subscriptions: Subscription[]; isCurrentMonth: boolean }> = [];

    // Previous month days
    const prevMonthDays = new Date(currentYear, currentMonth, 0).getDate();
    for (let i = firstDayOfMonth - 1; i >= 0; i--) {
      const date = new Date(currentYear, currentMonth - 1, prevMonthDays - i);
      days.push({
        date,
        subscriptions: getSubscriptionsForDate(date),
        isCurrentMonth: false,
      });
    }

    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(currentYear, currentMonth, i);
      days.push({
        date,
        subscriptions: getSubscriptionsForDate(date),
        isCurrentMonth: true,
      });
    }

    // Next month days (to fill the grid)
    const remainingDays = 42 - days.length; // 6 rows × 7 days
    for (let i = 1; i <= remainingDays; i++) {
      const date = new Date(currentYear, currentMonth + 1, i);
      days.push({
        date,
        subscriptions: getSubscriptionsForDate(date),
        isCurrentMonth: false,
      });
    }

    return days;
  }, [currentYear, currentMonth, subscriptions]);

  // Get subscriptions for a specific date
  function getSubscriptionsForDate(date: Date): Subscription[] {
    return subscriptions.filter((sub) => {
      const billDate = new Date(sub.nextBillDate);
      return (
        billDate.getDate() === date.getDate() &&
        billDate.getMonth() === date.getMonth() &&
        billDate.getFullYear() === date.getFullYear()
      );
    });
  }

  // Get today's subscriptions
  const todaySubscriptions = useMemo(() => {
    if (!selectedDate) return [];
    return getSubscriptionsForDate(selectedDate);
  }, [selectedDate, subscriptions]);

  // Navigate months
  const prevMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
    setSelectedDate(new Date());
  };

  // Check if date is today
  const isToday = (date: Date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  // Check if date is selected
  const isSelected = (date: Date) => {
    return selectedDate &&
      date.getDate() === selectedDate.getDate() &&
      date.getMonth() === selectedDate.getMonth() &&
      date.getFullYear() === selectedDate.getFullYear();
  };

  // Month name
  const monthName = new Date(currentYear, currentMonth).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-slate-950 px-5 pt-8 pb-40 transition-colors duration-300">
      {/* Header with Stats */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-xl font-bold text-surface-900 dark:text-slate-50">Calendar</h1>
          <motion.button
            className="px-4 py-2 bg-white dark:bg-slate-800 rounded-full text-sm font-medium text-primary-600 shadow-soft-sm dark:shadow-lg border border-surface-100 dark:border-white/10"
            onClick={goToToday}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Today
          </motion.button>
        </div>

        {/* Monthly Stats */}
        <div className="grid grid-cols-2 gap-3">
          <motion.div
            className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-soft-sm dark:shadow-lg border border-surface-100 dark:border-white/10 transition-colors duration-300"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <p className="text-xs font-medium text-surface-500 dark:text-slate-400 mb-1">This Month</p>
            <p className="text-2xl font-bold text-surface-900 dark:text-slate-50">{monthlySubscriptions.length}</p>
            <p className="text-xs text-surface-400 dark:text-slate-500">subscriptions</p>
          </motion.div>

          <motion.div
            className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-soft-sm dark:shadow-lg border border-surface-100 dark:border-white/10 transition-colors duration-300"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <p className="text-xs font-medium text-surface-500 dark:text-slate-400 mb-1">Total Due</p>
            <p className="text-2xl font-bold text-surface-900 dark:text-slate-50">{formatCurrency(totalMonthlyAmount, currency)}</p>
            <p className="text-xs text-surface-400 dark:text-slate-500">this month</p>
          </motion.div>
        </div>

        {/* Upcoming Badge */}
        {upcomingAmount > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-3 bg-gradient-to-r from-primary-500 to-accent-500 rounded-2xl px-4 py-3 flex items-center justify-between shadow-soft-lg"
          >
            <div>
              <p className="text-white/80 text-xs font-medium">Upcoming (7 days)</p>
              <p className="text-white text-lg font-bold">{formatCurrency(upcomingAmount, currency)}</p>
            </div>
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <CalendarIcon size={20} className="text-white" />
            </div>
          </motion.div>
        )}
      </div>

      {/* Month Navigation */}
      <div className="flex items-center justify-between mb-4">
        <motion.button
          className="w-10 h-10 rounded-full bg-white dark:bg-slate-800 shadow-soft-sm dark:shadow-lg flex items-center justify-center border border-surface-100 dark:border-white/10"
          onClick={prevMonth}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <ChevronLeft size={20} className="text-surface-600 dark:text-slate-400" />
        </motion.button>
        <h2 className="text-lg font-semibold text-surface-900 dark:text-slate-50">{monthName}</h2>
        <motion.button
          className="w-10 h-10 rounded-full bg-white dark:bg-slate-800 shadow-soft-sm dark:shadow-lg flex items-center justify-center border border-surface-100 dark:border-white/10"
          onClick={nextMonth}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <ChevronRight size={20} className="text-surface-600 dark:text-slate-400" />
        </motion.button>
      </div>

      {/* Day Headers */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div key={day} className="text-center text-xs font-medium text-surface-500 dark:text-slate-400 py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-soft-lg dark:shadow-lg p-2 mb-4 border border-surface-100 dark:border-white/10 transition-colors duration-300">
        <div className="grid grid-cols-7 gap-1">
          <AnimatePresence mode="popLayout">
            {calendarDays.map((dayInfo, index) => {
              const hasSubscriptions = dayInfo.subscriptions.length > 0;
              const isTodayDate = isToday(dayInfo.date);
              const isSelectedDate = isSelected(dayInfo.date);

              return (
                <motion.button
                  key={`${dayInfo.date.toISOString()}-${index}`}
                  className={cn(
                    "aspect-square rounded-xl flex flex-col items-center justify-center gap-1 relative transition-all",
                    !dayInfo.isCurrentMonth && "opacity-40",
                    isSelectedDate && "bg-primary-500 text-white",
                    isTodayDate && !isSelectedDate && "border-2 border-primary-500",
                    !isSelectedDate && "hover:bg-surface-50"
                  )}
                  onClick={() => setSelectedDate(dayInfo.date)}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: index * 0.01 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span className={cn(
                    "text-sm font-medium",
                    isTodayDate && !isSelectedDate && "text-primary-600"
                  )}>
                    {dayInfo.date.getDate()}
                  </span>

                  {/* Subscription indicators */}
                  {hasSubscriptions && (
                    <div className="flex gap-0.5">
                      {dayInfo.subscriptions.slice(0, 3).map((sub) => {
                        const cat = CATEGORIES.find((c) => c.id === sub.category);
                        return (
                          <div
                            key={sub.id}
                            className="w-1.5 h-1.5 rounded-full"
                            style={{ backgroundColor: cat?.color || '#6b7280' }}
                          />
                        );
                      })}
                      {dayInfo.subscriptions.length > 3 && (
                        <div className="w-1.5 h-1.5 rounded-full bg-surface-300 dark:bg-white/30" />
                      )}
                    </div>
                  )}
                </motion.button>
              );
            })}
          </AnimatePresence>
        </div>
      </div>

      {/* Selected Date Subscriptions */}
      <AnimatePresence>
        {selectedDate && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="bg-white dark:bg-slate-900 rounded-2xl shadow-soft-lg dark:shadow-lg p-5 border border-surface-100 dark:border-white/10 transition-colors duration-300"
          >
            <h3 className="text-lg font-semibold text-surface-900 dark:text-slate-50 mb-4">
              {formatDate(selectedDate.toISOString().split('T')[0])}
            </h3>

            {todaySubscriptions.length > 0 ? (
              <div className="space-y-3">
                {todaySubscriptions.map((subscription) => {
                  const category = CATEGORIES.find((c) => c.id === subscription.category);
                  const daysUntil = getDaysUntilDue(subscription.nextBillDate);

                  return (
                    <div
                      key={subscription.id}
                      className="flex items-center gap-3 p-3 bg-surface-50 dark:bg-slate-800 rounded-xl border border-surface-100 dark:border-white/10 transition-colors duration-300"
                    >
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br ${category?.gradient || 'from-gray-400 to-gray-500'}`}
                      >
                        <span className="text-white font-semibold text-sm">
                          {subscription.name.charAt(0)}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-surface-900 dark:text-slate-50 truncate">{subscription.name}</p>
                        <p className="text-sm text-surface-500 dark:text-slate-400">{category?.name}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-surface-900 dark:text-slate-50">
                          {formatCurrency(
                            subscription.currency && subscription.currency !== currency
                              ? convertCurrency(subscription.cost, subscription.currency, currency)
                              : subscription.cost,
                            currency
                          )}
                        </p>
                        <p className={cn(
                          "text-xs",
                          daysUntil === 0 ? "text-success-600" : daysUntil <= 3 ? "text-danger-600" : "text-surface-500 dark:text-slate-400"
                        )}>
                          {daysUntil === 0 ? "Today" : formatRelativeDate(subscription.nextBillDate)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-surface-500 dark:text-slate-400">No subscriptions due on this date</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
