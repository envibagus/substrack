import { useState } from 'react';
import { motion } from 'framer-motion';
import { Home, Plus, Calendar } from 'lucide-react';
import { cn } from '../utils/helpers';

/**
 * BottomNav Component
 *
 * 3-item navigation with pill-shaped design:
 * - Home
 * - Calendar
 * - Add (prominent center button)
 */

export type NavItem = 'home' | 'calendar' | 'add';

interface NavItemConfig {
  id: NavItem;
  label: string;
  icon: typeof Home;
  isPrimary?: boolean;
}

const NAV_ITEMS: NavItemConfig[] = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'add', label: 'Add', icon: Plus, isPrimary: true },
  { id: 'calendar', label: 'Calendar', icon: Calendar },
];

interface BottomNavProps {
  activeTab?: NavItem;
  onTabChange?: (tab: NavItem) => void;
}

export function BottomNav({ activeTab = 'home', onTabChange }: BottomNavProps) {
  const [hoveredTab, setHoveredTab] = useState<NavItem | null>(null);

  return (
    <motion.nav
      className="fixed bottom-0 left-0 right-0 z-50 flex justify-center"
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      {/* Compact Apple liquid glass pill container */}
      <div
        className={cn(
          "nav-glass",
          "w-fit mb-4 mt-1",
          "backdrop-blur-2xl",
          "border border-white/40 dark:border-white/10",
          "shadow-[0_4px_20px_rgba(0,0,0,0.06),inset_0_1px_0_rgba(255,255,255,0.3)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.08)]",
          "rounded-2xl",
          "safe-container transition-colors duration-300"
        )}
      >
        <div className="flex items-center justify-around gap-2 px-3 py-3">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            const isHovered = hoveredTab === item.id;

            return (
              <motion.button
                key={item.id}
                className={cn(
                  "relative flex items-center justify-center p-6",
                  item.isPrimary
                    ? "w-11 h-11 rounded-xl"
                    : "flex-1 h-9 rounded-xl",
                  "transition-all duration-ios-fast",
                  item.isPrimary
                    ? "bg-gradient-to-br from-primary-500 to-accent-500 text-white shadow-md"
                    : isActive
                        ? "text-primary-600 dark:text-primary-400"
                        : "text-surface-400 dark:text-white/40"
                )}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onHoverStart={() => setHoveredTab(item.id)}
                onHoverEnd={() => setHoveredTab(null)}
                onClick={() => onTabChange?.(item.id)}
              >
                {/* Active indicator (for non-primary items) */}
                {!item.isPrimary && isActive && (
                  <motion.div
                    className="absolute inset-0 bg-primary-50/80 dark:bg-primary-900/20 backdrop-blur-sm rounded-xl"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.15 }}
                  />
                )}

                {/* Icon */}
                <motion.div
                  className="relative z-10"
                  animate={{
                    scale: isActive || isHovered ? 1.05 : 1,
                  }}
                  transition={{ duration: 0.15 }}
                >
                  <Icon
                    size={item.isPrimary ? 18 : 16}
                    strokeWidth={isActive || item.isPrimary ? 2.5 : 2}
                  />
                </motion.div>
              </motion.button>
            );
          })}
        </div>

        {/* Safe area spacer */}
        <div className="h-safe-bottom" />
      </div>
    </motion.nav>
  );
}
