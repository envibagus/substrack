import { useState } from 'react';
import { motion, useMotionValue, useTransform, type PanInfo } from 'framer-motion';
import { Trash2, Edit2, Calendar, CreditCard } from 'lucide-react';
import { useApp } from '../context/AppContext';
import type { Subscription } from '../types';
import { CATEGORIES } from '../constants/categories';
import { formatCurrency, formatRelativeDate, getDaysUntilDue, cn, convertCurrency } from '../utils/helpers';

interface SubscriptionCardProps {
  subscription: Subscription;
  onDelete?: (id: string) => void;
  onEdit?: (subscription: Subscription) => void;
  onClick?: (subscription: Subscription) => void;
}

const SWIPE_THRESHOLD = 100;
const SWIPE_LIMIT = 160;

export function SubscriptionCard({
  subscription,
  onDelete,
  onEdit,
  onClick,
}: SubscriptionCardProps) {
  const [isDragging, setIsDragging] = useState(false);
  const { state } = useApp();
  const { currency } = state;

  const x = useMotionValue(0);
  const scale = useTransform(x, [-SWIPE_LIMIT, 0, SWIPE_LIMIT], [0.95, 1, 0.95]);
  const deleteOpacity = useTransform(x, [-SWIPE_THRESHOLD, -SWIPE_LIMIT], [0, 1]);
  const editOpacity = useTransform(x, [SWIPE_THRESHOLD, SWIPE_LIMIT], [0, 1]);

  const category = CATEGORIES.find((c) => c.id === subscription.category) || CATEGORIES[CATEGORIES.length - 1];
  const daysUntilDue = getDaysUntilDue(subscription.nextBillDate);

  // Convert subscription cost to global currency if needed
  const displayCost = subscription.currency && subscription.currency !== currency
    ? convertCurrency(subscription.cost, subscription.currency, currency)
    : subscription.cost;

  const handleDragEnd = (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    setIsDragging(false);
    const offsetX = info.offset.x;

    if (offsetX < -SWIPE_THRESHOLD && onDelete) {
      onDelete(subscription.id);
      return;
    }

    if (offsetX > SWIPE_THRESHOLD && onEdit) {
      onEdit(subscription);
      return;
    }
  };

  const handleDragStart = () => {
    setIsDragging(true);
  };

  return (
    <div className="relative overflow-hidden rounded-2xl">
      {/* Background Actions Layer */}
      <div className="absolute inset-0 flex">
        {/* Delete action (revealed when swiping left) */}
        <motion.div
          className="flex-1 bg-danger-500 flex items-center justify-end pr-6"
          style={{ opacity: deleteOpacity }}
        >
          <div className="flex items-center gap-2 text-white">
            <span className="font-medium">Delete</span>
            <Trash2 size={20} />
          </div>
        </motion.div>

        {/* Edit action (revealed when swiping right) */}
        <motion.div
          className="flex-1 bg-primary-500 flex items-center justify-start pl-6"
          style={{ opacity: editOpacity }}
        >
          <div className="flex items-center gap-2 text-white">
            <Edit2 size={20} />
            <span className="font-medium">Edit</span>
          </div>
        </motion.div>
      </div>

      {/* Main Card Layer */}
      <motion.div
        style={{ x, scale }}
        drag="x"
        dragConstraints={{ left: -SWIPE_LIMIT, right: SWIPE_LIMIT }}
        dragElastic={0.1}
        dragSnapToOrigin={true}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        whileTap={{ scale: 0.98 }}
        className={cn(
          "relative z-10 cursor-grab active:cursor-grabbing",
          "bg-white/90 dark:bg-slate-800/80 backdrop-blur-md shadow-soft-md dark:shadow-lg",
          "border border-surface-100/50 dark:border-white/10 rounded-2xl transition-colors duration-300"
        )}
        onClick={!isDragging ? () => onClick?.(subscription) : undefined}
      >
        <div className="p-4">
          {/* Header: Logo, Name, Cost */}
          <div className="flex items-start gap-3">
            {/* Category Icon/Logo */}
            <div
              className={cn(
                "w-12 h-12 rounded-xl flex items-center justify-center",
                "bg-gradient-to-br", category.gradient,
                "shadow-soft-sm"
              )}
            >
              <span className="text-white font-semibold text-lg">
                {subscription.name.charAt(0).toUpperCase()}
              </span>
            </div>

            {/* Subscription Info */}
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-surface-900 dark:text-slate-50 truncate">
                {subscription.name}
              </h3>
              <p className="text-sm text-surface-500 dark:text-slate-400 truncate">
                {category.name}
              </p>
            </div>

            {/* Cost */}
            <div className="text-right">
              <p className="font-semibold text-surface-900 dark:text-slate-50">
                {formatCurrency(displayCost, currency)}
              </p>
              <p className="text-xs text-surface-500 dark:text-slate-400">
                {subscription.billingCycle === 'monthly' ? '/mo' : subscription.billingCycle === 'yearly' ? '/yr' : ''}
              </p>
            </div>
          </div>

          {/* Footer: Due Date, Payment Method */}
          <div className="mt-3 pt-3 border-t border-surface-100 dark:border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-4 text-sm">
              {/* Due Date */}
              <div className={cn(
                "flex items-center gap-1.5",
                daysUntilDue <= 3 ? "text-danger-600 dark:text-danger-400" : "text-surface-500 dark:text-slate-400"
              )}>
                <Calendar size={16} />
                <span>{formatRelativeDate(subscription.nextBillDate)}</span>
              </div>

              {/* Payment Method */}
              {subscription.paymentMethod && (
                <div className="flex items-center gap-1.5 text-surface-400 dark:text-slate-500">
                  <CreditCard size={16} />
                  <span className="truncate max-w-[120px]">{subscription.paymentMethod}</span>
                </div>
              )}
            </div>

            {/* Swipe hint */}
            <motion.div
              className="text-surface-300 dark:text-white/20"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 5l7 7-7 7" />
              </svg>
            </motion.div>
          </div>

          {/* Description */}
          {subscription.description && (
            <p className="mt-2 text-sm text-surface-400 dark:text-slate-500 line-clamp-2">
              {subscription.description}
            </p>
          )}
        </div>
      </motion.div>
    </div>
  );
}
