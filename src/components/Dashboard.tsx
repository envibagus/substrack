import { useState, useMemo, useEffect } from 'react';
import { motion, type Variants, AnimatePresence } from 'framer-motion';
import { TrendingUp, TrendingDown, ChevronRight, Calendar, CreditCard, BarChart3, Clock, AlertCircle, X, ChevronLeft, ChevronRight as ChevronRightIcon } from 'lucide-react';
import { XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Area } from 'recharts';
import confetti from 'canvas-confetti';
import { useApp } from '../context/AppContext';
import { SubscriptionCard } from './SubscriptionCard';
import { CATEGORIES } from '../constants/categories';
import { formatCurrency, cn, getDaysUntilDue, formatRelativeDate, formatDate, getMonthlyCost, convertCurrency } from '../utils/helpers';
import type { Subscription } from '../types';

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring' as const,
      stiffness: 300,
      damping: 24,
    },
  },
};

type View = 'dashboard' | 'analytics';
type FilterType = 'upcoming' | 'thisMonth' | 'all';

interface DashboardProps {
  onOpenSettings?: () => void;
  onModalOpenChange?: (isOpen: boolean) => void;
}

export function Dashboard({ onOpenSettings, onModalOpenChange }: DashboardProps) {
  const { state, actions } = useApp();
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(null);
  const [filterType, setFilterType] = useState<FilterType>('upcoming');
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [historyMonth, setHistoryMonth] = useState(new Date());
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);

  // Notify parent when modals open/close
  useEffect(() => {
    const hasOpenModal = showHistoryModal || selectedSubscription !== null;
    onModalOpenChange?.(hasOpenModal);
  }, [showHistoryModal, selectedSubscription, onModalOpenChange]);

  const { subscriptions, isLoading, currency, profile } = state;

  const activeSubscriptions = subscriptions.filter((s) => s.isActive);

  // Calculate total monthly spend with currency conversion
  const totalMonthlySpend = useMemo(() => {
    return activeSubscriptions.reduce((total, sub) => {
      const monthlyCost = getMonthlyCost(sub.cost, sub.billingCycle);
      // Convert to global currency if needed
      if (sub.currency && sub.currency !== currency) {
        return total + convertCurrency(monthlyCost, sub.currency, currency);
      }
      return total + monthlyCost;
    }, 0);
  }, [activeSubscriptions, currency]);

  // Generate dynamic chart data based on actual subscriptions
  const chartData = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    return months.map((month) => ({
      month,
      amount: totalMonthlySpend * (0.8 + Math.random() * 0.4), // Simulated data based on actual spend
    }));
  }, [totalMonthlySpend]);

  // Generate dynamic category data based on actual subscriptions
  const categoryData = useMemo(() => {
    const categoryMap = new Map<string, number>();
    activeSubscriptions.forEach((sub) => {
      const monthlyCost = getMonthlyCost(sub.cost, sub.billingCycle);
      categoryMap.set(sub.category, (categoryMap.get(sub.category) || 0) + monthlyCost);
    });

    const total = Array.from(categoryMap.values()).reduce((sum, val) => sum + val, 0);
    return Array.from(categoryMap.entries())
      .map(([category, amount]) => {
        const catInfo = CATEGORIES.find((c) => c.id === category);
        return {
          name: catInfo?.name || category,
          value: Math.round((amount / total) * 100),
          color: catInfo?.color || '#6b7280',
        };
      })
      .sort((a, b) => b.value - a.value);
  }, [activeSubscriptions]);

  // Filter subscriptions based on selected filter
  const filteredSubscriptions = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const thirtyDaysFromNow = new Date(today);
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    const thisMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const thisMonthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    switch (filterType) {
      case 'upcoming':
        return subscriptions
          .filter((s) => s.isActive)
          .filter((sub) => {
            const billDate = new Date(sub.nextBillDate);
            return billDate >= today && billDate <= thirtyDaysFromNow;
          })
          .sort((a, b) => new Date(a.nextBillDate).getTime() - new Date(b.nextBillDate).getTime());

      case 'thisMonth':
        return subscriptions
          .filter((s) => s.isActive)
          .filter((sub) => {
            const billDate = new Date(sub.nextBillDate);
            return billDate >= thisMonthStart && billDate <= thisMonthEnd;
          })
          .sort((a, b) => new Date(a.nextBillDate).getTime() - new Date(b.nextBillDate).getTime());

      case 'all':
        return subscriptions
          .filter((s) => s.isActive)
          .sort((a, b) => new Date(a.nextBillDate).getTime() - new Date(b.nextBillDate).getTime());

      default:
        return subscriptions;
    }
  }, [subscriptions, filterType]);

  // Get subscriptions for history (for a specific month)
  const getSubscriptionsForMonth = useMemo(() => {
    const monthStart = new Date(historyMonth.getFullYear(), historyMonth.getMonth(), 1);
    const monthEnd = new Date(historyMonth.getFullYear(), historyMonth.getMonth() + 1, 0);

    return subscriptions
      .filter((s) => s.isActive)
      .filter((sub) => {
        const billDate = new Date(sub.nextBillDate);
        return billDate >= monthStart && billDate <= monthEnd;
      })
      .sort((a, b) => new Date(a.nextBillDate).getTime() - new Date(b.nextBillDate).getTime());
  }, [subscriptions, historyMonth]);

  // Calculate total spent in selected history month
  const totalSpentInMonth = useMemo(() => {
    return getSubscriptionsForMonth.reduce((total, sub) => {
      return total + sub.cost;
    }, 0);
  }, [getSubscriptionsForMonth]);

  // Calculate yearly total
  const totalYearlySpend = useMemo(() => {
    return activeSubscriptions.reduce((sum, sub) => {
      const monthlyCost = getMonthlyCost(sub.cost, sub.billingCycle);
      // Convert to global currency if needed
      const convertedCost = sub.currency && sub.currency !== currency
        ? convertCurrency(monthlyCost, sub.currency, currency)
        : monthlyCost;
      return sum + (convertedCost * 12);
    }, 0);
  }, [activeSubscriptions, currency]);

  // Calculate category spending for bar chart visualization
  const categorySpending = useMemo(() => {
    const categoryMap = new Map<string, number>();
    activeSubscriptions.forEach((sub) => {
      const monthlyCost = getMonthlyCost(sub.cost, sub.billingCycle);
      // Convert to global currency if needed
      const convertedCost = sub.currency && sub.currency !== currency
        ? convertCurrency(monthlyCost, sub.currency, currency)
        : monthlyCost;

      categoryMap.set(sub.category, (categoryMap.get(sub.category) || 0) + (convertedCost * 12));
    });

    const totalYearly = Array.from(categoryMap.values()).reduce((sum, val) => sum + val, 0);

    return Array.from(categoryMap.entries())
      .map(([category, amount]) => {
        const catInfo = CATEGORIES.find((c) => c.id === category);
        const monthlyAmount = amount / 12;
        const percentage = totalYearly > 0 ? (amount / totalYearly) * 100 : 0;
        return {
          category,
          amount,
          monthlyAmount,
          percentage,
          name: catInfo?.name || category,
          color: catInfo?.color || '#6b7280',
        };
      })
      .sort((a, b) => b.amount - a.amount);
  }, [activeSubscriptions, currency]);

  const lastMonthSpend = totalMonthlySpend * 0.92;
  const percentChange = ((totalMonthlySpend - lastMonthSpend) / lastMonthSpend) * 100;

  const handleDelete = (id: string) => {
    if (confirm('Delete this subscription?')) {
      actions.deleteSubscription(id);
    }
  };

  const handleEdit = (subscription: Subscription) => {
    setSelectedSubscription(subscription);
  };

  const handleClick = (subscription: Subscription) => {
    setSelectedSubscription(subscription);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-surface-50 dark:bg-slate-950">
        <motion.div
          className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-slate-950 transition-colors duration-300">
      <AnimatePresence mode="wait">
        {currentView === 'dashboard' ? (
          <motion.div
            key="dashboard"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit={{ opacity: 0, x: -20 }}
          >
            {/* Hero Section - Subtle gradient with light/dark mode support */}
            <motion.div
              variants={itemVariants}
              className="relative overflow-hidden bg-gradient-to-br from-primary-500/10 to-accent-500/10 dark:from-primary-500/20 dark:to-accent-500/20"
            >
              <div className="relative z-10 px-5 pt-8 pb-12">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-surface-500 dark:text-slate-400 text-xs font-medium">Monthly Spend</p>
                    <motion.h1
                      className="text-3xl font-bold tracking-tight mt-0.5 text-surface-900 dark:text-slate-50"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                    >
                      {formatCurrency(totalMonthlySpend, currency)}
                    </motion.h1>
                    <p className="text-surface-400 dark:text-slate-500 text-xs mt-0.5">
                      Yearly: {formatCurrency(totalYearlySpend, currency)}/year
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div
                      className={cn(
                        "flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium",
                        percentChange > 0
                          ? "bg-success-100 dark:bg-success-900/30 text-success-700 dark:text-success-300"
                          : "bg-danger-100 dark:bg-danger-900/30 text-danger-700 dark:text-danger-300"
                      )}
                    >
                      {percentChange > 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                      <span>{Math.abs(percentChange).toFixed(1)}%</span>
                    </div>
                    <motion.button
                      className="w-9 h-9 rounded-full bg-white dark:bg-slate-800 shadow-soft-sm dark:shadow-lg flex items-center justify-center border border-surface-100 dark:border-white/10"
                      onClick={() => setShowHistoryModal(true)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Clock size={18} className="text-surface-600 dark:text-slate-400" />
                    </motion.button>
                    <motion.button
                      className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-400 to-accent-500 shadow-soft-sm dark:shadow-lg flex items-center justify-center border-2 border-white dark:border-white/10 overflow-hidden"
                      onClick={() => onOpenSettings?.()}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {profile.picture ? (
                        <img src={profile.picture} alt="Profile" className="w-full h-full rounded-full object-cover" />
                      ) : (
                        <span className="text-white text-sm font-bold">
                          {profile.username.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </motion.button>
                  </div>
                </div>

                {/* Category Bar Chart */}
                {categorySpending.length > 0 && (
                  <div className="mt-4 relative">
                    <div className="flex items-end justify-between gap-2 h-20">
                      {categorySpending.map((cat, index) => {
                        const maxAmount = Math.max(...categorySpending.map(c => c.amount));
                        const barHeight = (cat.amount / maxAmount) * 100;
                        const isHovered = hoveredCategory === cat.category;

                        return (
                          <motion.div
                            key={cat.category}
                            className="flex-1 flex flex-col items-center justify-end gap-1 cursor-pointer relative h-full"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            onHoverStart={() => setHoveredCategory(cat.category)}
                            onHoverEnd={() => setHoveredCategory(null)}
                          >
                            {/* Tooltip - positioned above each bar */}
                            <AnimatePresence>
                              {isHovered && (
                                <motion.div
                                  initial={{ opacity: 0, y: 5 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  exit={{ opacity: 0, y: 5 }}
                                  className="absolute -top-14 left-1/2 -translate-x-1/2 z-30 pointer-events-none"
                                >
                                  <div className="bg-surface-900 dark:bg-white text-white dark:text-surface-900 px-2 py-1.5 rounded-lg shadow-lg whitespace-nowrap">
                                    <div className="text-center">
                                      <p className="text-[10px] opacity-80">{cat.name}</p>
                                      <p className="text-xs font-bold">{formatCurrency(cat.monthlyAmount, currency)}/mo</p>
                                      <p className="text-[10px]">{cat.percentage.toFixed(1)}%</p>
                                    </div>
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>

                            <motion.div
                              initial={{ height: 0 }}
                              animate={{ height: `${barHeight}%` }}
                              transition={{ delay: index * 0.05, duration: 0.5 }}
                              className="w-full rounded-lg shadow-sm relative transition-all duration-200 min-h-[12px]"
                              style={{
                                background: `linear-gradient(180deg, ${cat.color} 0%, ${cat.color}cc 100%)`,
                                transform: isHovered ? 'scaleY(1.05)' : 'scaleY(1)',
                              }}
                            />
                            <span className={cn(
                              "text-[10px] font-medium text-center truncate w-full transition-colors leading-tight",
                              isHovered ? "text-surface-900 dark:text-white" : "text-surface-600 dark:text-slate-400"
                            )}>
                              {cat.name}
                            </span>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Quick Actions Menu */}
            <motion.div variants={itemVariants} className="px-5 -mt-4 relative z-20">
              <div className="ios-list p-2">
                <motion.button
                  className="w-full flex items-center justify-between p-4 rounded-xl hover:bg-surface-50 dark:hover:bg-white/5 transition-colors"
                  onClick={() => setCurrentView('analytics')}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary-50 dark:bg-primary-900/30 flex items-center justify-center">
                      <BarChart3 size={20} className="text-primary-600 dark:text-primary-400" />
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-surface-900 dark:text-white">Analytics</p>
                      <p className="text-sm text-surface-500 dark:text-white/50">View spending insights</p>
                    </div>
                  </div>
                  <ChevronRight size={20} className="text-surface-400 dark:text-white/30" />
                </motion.button>
              </div>
            </motion.div>

            {/* Filter Chips - Pill-style buttons */}
            <motion.div variants={itemVariants} className="px-5 mt-6">
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => setFilterType('upcoming')}
                  className={cn(
                    "px-4 py-2 rounded-full text-sm font-medium transition-all duration-200",
                    filterType === 'upcoming'
                      ? "bg-primary-500 text-white shadow-sm"
                      : "bg-surface-100 dark:bg-slate-800 text-surface-600 dark:text-slate-400 hover:bg-surface-200 dark:hover:bg-slate-700"
                  )}
                >
                  Upcoming
                </button>
                <button
                  onClick={() => setFilterType('thisMonth')}
                  className={cn(
                    "px-4 py-2 rounded-full text-sm font-medium transition-all duration-200",
                    filterType === 'thisMonth'
                      ? "bg-primary-500 text-white shadow-sm"
                      : "bg-surface-100 dark:bg-slate-800 text-surface-600 dark:text-slate-400 hover:bg-surface-200 dark:hover:bg-slate-700"
                  )}
                >
                  This Month
                </button>
                <button
                  onClick={() => setFilterType('all')}
                  className={cn(
                    "px-4 py-2 rounded-full text-sm font-medium transition-all duration-200",
                    filterType === 'all'
                      ? "bg-primary-500 text-white shadow-sm"
                      : "bg-surface-100 dark:bg-slate-800 text-surface-600 dark:text-slate-400 hover:bg-surface-200 dark:hover:bg-slate-700"
                  )}
                >
                  All
                </button>
              </div>
            </motion.div>

            {/* Filtered Subscriptions List */}
            <motion.div variants={itemVariants} className="px-5 mt-6 pb-40">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold text-surface-900 dark:text-white">
                  {filterType === 'upcoming' && 'Upcoming (30 Days)'}
                  {filterType === 'thisMonth' && 'This Month'}
                  {filterType === 'all' && 'All Subscriptions'}
                </h2>
                <span className="text-sm text-surface-500 dark:text-white/50">{filteredSubscriptions.length} subscriptions</span>
              </div>
              <div className="space-y-3">
                {filteredSubscriptions.length > 0 ? (
                  filteredSubscriptions.map((subscription) => (
                    <SubscriptionCard
                      key={subscription.id}
                      subscription={subscription}
                      onDelete={handleDelete}
                      onEdit={handleEdit}
                      onClick={handleClick}
                    />
                  ))
                ) : (
                  <div className="text-center py-12">
                    <p className="text-surface-400 dark:text-slate-500">No subscriptions found</p>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        ) : (
          <AnalyticsView key="analytics" onBack={() => setCurrentView('dashboard')} chartData={chartData} categoryData={categoryData} />
        )}
      </AnimatePresence>

      {/* Subscription Detail Modal */}
      <AnimatePresence>
        {selectedSubscription && (
          <SubscriptionDetailModal
            subscription={selectedSubscription}
            onClose={() => setSelectedSubscription(null)}
            onDelete={handleDelete}
            onMarkPaid={(id) => {
              // Trigger confetti celebration
              confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ec4899'],
                zIndex: 9999,
              });

              // Update subscription - calculate next bill date
              const sub = subscriptions.find(s => s.id === id);
              if (sub) {
                const nextDate = new Date(sub.nextBillDate);
                switch (sub.billingCycle) {
                  case 'monthly':
                    nextDate.setMonth(nextDate.getMonth() + 1);
                    break;
                  case 'yearly':
                    nextDate.setFullYear(nextDate.getFullYear() + 1);
                    break;
                  case 'weekly':
                    nextDate.setDate(nextDate.getDate() + 7);
                    break;
                  case 'quarterly':
                    nextDate.setMonth(nextDate.getMonth() + 3);
                    break;
                }
                actions.updateSubscription(id, {
                  nextBillDate: nextDate.toISOString().split('T')[0]
                });
              }

              // Close modal after a short delay
              setTimeout(() => {
                setSelectedSubscription(null);
              }, 1500);
            }}
            onMarkCancelled={(id) => {
              actions.updateSubscription(id, { isActive: false });
              setSelectedSubscription(null);
            }}
          />
        )}
      </AnimatePresence>

      {/* History Modal */}
      <AnimatePresence>
        {showHistoryModal && (
          <HistoryModal
            onClose={() => setShowHistoryModal(false)}
            historyMonth={historyMonth}
            onMonthChange={setHistoryMonth}
            subscriptions={getSubscriptionsForMonth}
            totalSpent={totalSpentInMonth}
            currency={currency}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * Analytics View Component
 */
function AnalyticsView({ onBack, chartData, categoryData }: { onBack: () => void; chartData: Array<{ month: string; amount: number }>; categoryData: Array<{ name: string; value: number; color: string }> }) {
  const { actions, state } = useApp();
  const totalMonthlySpend = actions.getTotalMonthlySpend();
  const { currency } = state;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="px-5 pt-12 pb-40 bg-surface-50 dark:bg-slate-950 min-h-screen transition-colors duration-300"
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <motion.button
          className="w-10 h-10 rounded-full bg-white dark:bg-slate-800 border-2 border-transparent dark:border-white/10 shadow-soft-md dark:shadow-lg flex items-center justify-center"
          onClick={onBack}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <ChevronRight size={20} className="text-surface-600 dark:text-slate-400 rotate-180" />
        </motion.button>
        <h1 className="text-2xl font-bold text-surface-900 dark:text-slate-50">Analytics</h1>
      </div>

      {/* Spending Overview */}
      <div className="ios-list p-5 mb-4">
        <h3 className="text-sm font-medium text-surface-500 dark:text-slate-400 mb-4">Monthly Spending Trend</h3>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <defs>
                <linearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0ea5e9" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#0ea5e9" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#737373', fontSize: 12 }}
              />
              <YAxis hide />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg px-3 py-2 border border-surface-100 dark:border-white/10">
                        <p className="text-sm font-medium text-surface-900 dark:text-slate-50">
                          {formatCurrency(payload[0].value as number, currency)}
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Line
                type="monotone"
                dataKey="amount"
                stroke="#0ea5e9"
                strokeWidth={3}
                dot={{ fill: '#0ea5e9', r: 4 }}
                activeDot={{ r: 6 }}
              />
              <Area type="monotone" dataKey="amount" fill="url(#lineGradient)" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="ios-list p-5 mb-4">
        <h3 className="text-sm font-medium text-surface-500 dark:text-slate-400 mb-4">By Category</h3>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={70}
                paddingAngle={2}
                dataKey="value"
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg px-3 py-2 border border-surface-100 dark:border-white/10">
                        <p className="text-sm font-medium text-surface-900 dark:text-slate-50">
                          {payload[0].name}: {payload[0].value}%
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 space-y-2">
          {categoryData.map((item) => (
            <div key={item.name} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-sm text-surface-700 dark:text-slate-300">{item.name}</span>
              </div>
              <span className="text-sm font-medium text-surface-900 dark:text-slate-50">{item.value}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* Insights */}
      <div className="bg-gradient-to-br from-primary-50 to-accent-50 dark:from-primary-900/30 dark:to-accent-900/30 rounded-2xl p-5">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/50 flex items-center justify-center flex-shrink-0">
            <AlertCircle size={20} className="text-primary-600 dark:text-primary-400" />
          </div>
          <div>
            <h4 className="font-semibold text-surface-900 dark:text-slate-50 mb-1">Insight</h4>
            <p className="text-sm text-surface-600 dark:text-slate-400">
              Your spending increased by {Math.round(((totalMonthlySpend - 150) / 150) * 100)}% this month.
              Consider reviewing your entertainment subscriptions.
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/**
 * History Modal Component
 */
function HistoryModal({
  onClose,
  historyMonth,
  onMonthChange,
  subscriptions,
  totalSpent,
  currency,
}: {
  onClose: () => void;
  historyMonth: Date;
  onMonthChange: (date: Date) => void;
  subscriptions: Subscription[];
  totalSpent: number;
  currency: string;
}) {
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const goToPreviousMonth = () => {
    const newDate = new Date(historyMonth);
    newDate.setMonth(newDate.getMonth() - 1);
    onMonthChange(newDate);
  };

  const goToNextMonth = () => {
    const newDate = new Date(historyMonth);
    newDate.setMonth(newDate.getMonth() + 1);
    onMonthChange(newDate);
  };

  const goToCurrentMonth = () => {
    onMonthChange(new Date());
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-end justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      {/* Backdrop */}
      <motion.div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      />

      {/* Modal */}
      <motion.div
        className="relative z-10 w-full max-w-lg bg-white dark:bg-slate-900 border-t border-surface-100 dark:border-white/10 rounded-t-3xl p-6 pb-10 max-h-[85vh] overflow-y-auto"
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle */}
        <div className="w-12 h-1 bg-surface-300 dark:bg-white/20 rounded-full mx-auto mb-6" />

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-surface-900 dark:text-slate-50">History</h2>
          <button
            className="w-8 h-8 rounded-full bg-surface-100 dark:bg-white/10 flex items-center justify-center"
            onClick={onClose}
          >
            <X size={20} className="text-surface-600 dark:text-slate-400" />
          </button>
        </div>

        {/* Month Selector */}
        <div className="flex items-center justify-between mb-6 p-4 bg-surface-50 dark:bg-slate-800 rounded-2xl">
          <motion.button
            className="w-10 h-10 rounded-full bg-white dark:bg-slate-700 flex items-center justify-center shadow-sm"
            onClick={goToPreviousMonth}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <ChevronLeft size={20} className="text-surface-600 dark:text-slate-400" />
          </motion.button>

          <div className="text-center">
            <p className="text-2xl font-bold text-surface-900 dark:text-slate-50">
              {monthNames[historyMonth.getMonth()]}
            </p>
            <p className="text-sm text-surface-500 dark:text-slate-400">
              {historyMonth.getFullYear()}
            </p>
          </div>

          <motion.button
            className="w-10 h-10 rounded-full bg-white dark:bg-slate-700 flex items-center justify-center shadow-sm"
            onClick={goToNextMonth}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <ChevronRightIcon size={20} className="text-surface-600 dark:text-slate-400" />
          </motion.button>
        </div>

        {/* Current Month Button */}
        <motion.button
          className="w-full mb-6 py-3 rounded-xl bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 font-medium text-sm"
          onClick={goToCurrentMonth}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          Jump to Current Month
        </motion.button>

        {/* Summary Card */}
        <div className="bg-gradient-to-br from-primary-50 to-accent-50 dark:from-primary-900/30 dark:to-accent-900/30 rounded-2xl p-5 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-surface-600 dark:text-slate-400 mb-1">Total Spent</p>
              <p className="text-3xl font-bold text-surface-900 dark:text-slate-50">
                {formatCurrency(totalSpent, currency)}
              </p>
            </div>
            <div className="w-12 h-12 rounded-full bg-primary-100 dark:bg-primary-900/50 flex items-center justify-center">
              <Clock size={24} className="text-primary-600 dark:text-primary-400" />
            </div>
          </div>
        </div>

        {/* Subscriptions List */}
        <div>
          <h3 className="text-lg font-semibold text-surface-900 dark:text-slate-50 mb-4">
            Subscriptions ({subscriptions.length})
          </h3>
          {subscriptions.length > 0 ? (
            <div className="space-y-3">
              {subscriptions.map((subscription) => {
                const category = CATEGORIES.find((c) => c.id === subscription.category);
                // Convert subscription cost to global currency if needed
                const displayCost = subscription.currency && subscription.currency !== currency
                  ? convertCurrency(subscription.cost, subscription.currency, currency)
                  : subscription.cost;
                return (
                  <div
                    key={subscription.id}
                    className="bg-surface-50 dark:bg-slate-800 rounded-2xl p-4 border border-surface-100 dark:border-white/10"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br ${category?.gradient || 'from-gray-400 to-gray-500'}`}
                      >
                        <span className="text-white font-semibold text-lg">
                          {subscription.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-surface-900 dark:text-slate-50 truncate">
                          {subscription.name}
                        </h4>
                        <p className="text-sm text-surface-500 dark:text-slate-400">
                          {formatDate(subscription.nextBillDate)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-surface-900 dark:text-slate-50">
                          {formatCurrency(displayCost, currency)}
                        </p>
                        <p className="text-xs text-surface-500 dark:text-slate-400">
                          {category?.name}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <Clock size={48} className="text-surface-300 dark:text-slate-600 mx-auto mb-4" />
              <p className="text-surface-400 dark:text-slate-500">No subscriptions this month</p>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

/**
 * Subscription Detail Modal
 */
function SubscriptionDetailModal({
  subscription,
  onClose,
  onDelete,
  onMarkPaid,
  onMarkCancelled,
}: {
  subscription: Subscription;
  onClose: () => void;
  onDelete: (id: string) => void;
  onMarkPaid: (id: string) => void;
  onMarkCancelled: (id: string) => void;
}) {
  const { state } = useApp();
  const { currency } = state;
  const category = CATEGORIES.find((c) => c.id === subscription.category);
  const daysUntilDue = getDaysUntilDue(subscription.nextBillDate);

  // Convert subscription cost to global currency if needed
  const displayCost = subscription.currency && subscription.currency !== currency
    ? convertCurrency(subscription.cost, subscription.currency, currency)
    : subscription.cost;

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-end justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      {/* Backdrop */}
      <motion.div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      />

      {/* Modal */}
      <motion.div
        className="relative z-10 w-full max-w-lg bg-white dark:bg-slate-900 border-t border-surface-100 dark:border-white/10 rounded-t-3xl p-6 pb-10"
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle */}
        <div className="w-12 h-1 bg-surface-300 dark:bg-white/20 rounded-full mx-auto mb-6" />

        {/* Header */}
        <div className="flex items-start gap-4 mb-6">
          <div
            className={`w-16 h-16 rounded-2xl flex items-center justify-center bg-gradient-to-br ${category?.gradient || 'from-gray-400 to-gray-500'}`}
          >
            <span className="text-white font-bold text-2xl">
              {subscription.name.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-surface-900 dark:text-slate-50">{subscription.name}</h2>
            <p className="text-surface-500 dark:text-slate-400">{category?.name}</p>
          </div>
          <button
            className="w-8 h-8 rounded-full bg-surface-100 dark:bg-white/10 flex items-center justify-center"
            onClick={onClose}
          >
            ×
          </button>
        </div>

        {/* Price */}
        <div className="bg-surface-50 dark:bg-slate-800 rounded-2xl p-4 mb-6 border border-surface-100 dark:border-white/10">
          <p className="text-sm text-surface-500 dark:text-slate-400 mb-1">Cost</p>
          <p className="text-3xl font-bold text-surface-900 dark:text-slate-50">
            {formatCurrency(displayCost, currency)}
            <span className="text-base font-normal text-surface-500 dark:text-slate-400">
              /{subscription.billingCycle === 'monthly' ? 'mo' : subscription.billingCycle === 'yearly' ? 'yr' : ''}
            </span>
          </p>
        </div>

        {/* Details */}
        <div className="space-y-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-surface-600 dark:text-slate-400">
              <Calendar size={18} />
              <span className="text-sm">Next payment</span>
            </div>
            <span className={cn(
              "font-medium",
              daysUntilDue <= 3 ? "text-danger-600 dark:text-danger-400" : "text-surface-900 dark:text-slate-50"
            )}>
              {formatRelativeDate(subscription.nextBillDate)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-surface-600 dark:text-slate-400">
              <Clock size={18} />
              <span className="text-sm">Billing cycle</span>
            </div>
            <span className="font-medium text-surface-900 dark:text-slate-50 capitalize">
              {subscription.billingCycle}
            </span>
          </div>
          {subscription.paymentMethod && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 text-surface-600 dark:text-slate-400">
                <CreditCard size={18} />
                <span className="text-sm">Payment method</span>
              </div>
              <span className="font-medium text-surface-900 dark:text-slate-50">{subscription.paymentMethod}</span>
            </div>
          )}
        </div>

        {/* Notes */}
        {(subscription.description || subscription.notes) && (
          <div className="bg-surface-50 dark:bg-slate-800 rounded-2xl p-4 mb-6 border border-surface-100 dark:border-white/10">
            <p className="text-sm text-surface-500 dark:text-slate-400 mb-1">Notes</p>
            <p className="text-surface-700 dark:text-slate-300">
              {subscription.notes || subscription.description}
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="space-y-3">
          {subscription.isActive ? (
            <motion.button
              className="w-full py-4 rounded-2xl bg-surface-100 dark:bg-slate-800 text-surface-600 dark:text-slate-300 font-medium border border-surface-200 dark:border-white/10"
              onClick={() => onMarkCancelled(subscription.id)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Mark as Cancelled
            </motion.button>
          ) : (
            <motion.button
              className="w-full py-4 rounded-2xl bg-success-500 text-white font-medium"
              onClick={() => onMarkCancelled(subscription.id)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Reactivate Subscription
            </motion.button>
          )}
          <motion.button
            className="w-full py-4 rounded-2xl bg-primary-500 text-white font-medium dark:shadow-glow-dark"
            onClick={() => onMarkPaid(subscription.id)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Mark as Paid
          </motion.button>
          <motion.button
            className="w-full py-4 rounded-2xl bg-danger-500 text-white font-medium"
            onClick={() => {
              onDelete(subscription.id);
              onClose();
            }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Delete Subscription
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}
