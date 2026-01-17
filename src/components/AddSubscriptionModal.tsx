import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronDown, Calendar as CalendarIcon, CreditCard, Tag, Bell, Link as LinkIcon, Image } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { CATEGORIES } from '../constants/categories';
import { cn } from '../utils/helpers';
import type { BillingCycle, SubscriptionCategory } from '../types';

// Storage keys
const CATEGORIES_STORAGE_KEY = 'subtrack-custom-categories';
const PAYMENT_METHODS_STORAGE_KEY = 'subtrack-payment-methods';
const LISTS_STORAGE_KEY = 'subtrack-lists';

interface CategoryInfoExtended {
  id: string;
  name: string;
  icon: string;
  color: string;
  gradient: string;
}

/**
 * Add Subscription Modal
 *
 * Single-page iOS-styled form for adding subscriptions with:
 * - Auto-fetch logo via Clearbit API
 * - All fields in one place
 * - iOS list style grouping
 */

interface AddSubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const BILLING_CYCLES: { value: BillingCycle; label: string }[] = [
  { value: 'monthly', label: 'Monthly' },
  { value: 'yearly', label: 'Yearly' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'quarterly', label: 'Quarterly' },
];

const REMINDER_OPTIONS = [
  { value: 0, label: 'Same day' },
  { value: 1, label: '1 day before' },
  { value: 3, label: '3 days before' },
  { value: 7, label: '1 week before' },
];

// Clearbit Logo API helper
const fetchLogo = async (domain: string): Promise<string | null> => {
  try {
    const cleanDomain = domain.toLowerCase()
      .replace(/^https?:\/\//, '')
      .replace(/\/.*$/, '')
      .replace(/^www\./, '');

    const logoUrl = `https://logo.clearbit.com/${cleanDomain}?size=128`;

    // Check if image exists
    return new Promise((resolve) => {
      const img = document.createElement('img');
      img.onload = () => resolve(logoUrl);
      img.onerror = () => resolve(null);
      img.src = logoUrl;
    });
  } catch {
    return null;
  }
};

// Domain extraction from subscription name
const extractDomain = (name: string): string => {
  const commonDomains: Record<string, string> = {
    'netflix': 'netflix.com',
    'spotify': 'spotify.com',
    'youtube': 'youtube.com',
    'google': 'google.com',
    'amazon': 'amazon.com',
    'apple': 'apple.com',
    'microsoft': 'microsoft.com',
    'adobe': 'adobe.com',
    'dropbox': 'dropbox.com',
    'github': 'github.com',
    'slack': 'slack.com',
    'zoom': 'zoom.us',
    'notion': 'notion.so',
    'figma': 'figma.com',
    'canva': 'canva.com',
    'discord': 'discord.com',
    'twitch': 'twitch.tv',
    'hulu': 'hulu.com',
    'disney': 'disneyplus.com',
    'hbo': 'hbo.com',
    'peacock': 'peacocktv.com',
    'paramount': 'paramountplus.com',
  };

  const lowerName = name.toLowerCase().trim();

  // Direct match
  if (commonDomains[lowerName]) {
    return commonDomains[lowerName];
  }

  // Partial match
  for (const [key, domain] of Object.entries(commonDomains)) {
    if (lowerName.includes(key)) {
      return domain;
    }
  }

  return `${lowerName.replace(/\s+/g, '')}.com`;
};

export function AddSubscriptionModal({ isOpen, onClose }: AddSubscriptionModalProps) {
  const { actions, state } = useApp();

  // Dynamic data from localStorage
  const [customCategories, setCustomCategories] = useState<CategoryInfoExtended[]>([]);
  const [paymentMethodsList, setPaymentMethodsList] = useState<string[]>(['None']);
  const [listsList, setListsList] = useState<string[]>(['Personal']);

  // Load data from localStorage on mount
  useEffect(() => {
    // Load custom categories
    const savedCategories = localStorage.getItem(CATEGORIES_STORAGE_KEY);
    if (savedCategories) {
      try {
        setCustomCategories(JSON.parse(savedCategories));
      } catch (e) {
        console.error('Failed to parse categories:', e);
      }
    }

    // Load payment methods
    const savedPaymentMethods = localStorage.getItem(PAYMENT_METHODS_STORAGE_KEY);
    if (savedPaymentMethods) {
      try {
        const parsed = JSON.parse(savedPaymentMethods);
        setPaymentMethodsList(['None', ...parsed.map((pm: any) => pm.name)]);
      } catch (e) {
        console.error('Failed to parse payment methods:', e);
      }
    }

    // Load lists
    const savedLists = localStorage.getItem(LISTS_STORAGE_KEY);
    if (savedLists) {
      try {
        setListsList(JSON.parse(savedLists));
      } catch (e) {
        console.error('Failed to parse lists:', e);
      }
    }
  }, []);

  // Combine default and custom categories
  const allCategories = useMemo(() => {
    return [...CATEGORIES, ...customCategories];
  }, [customCategories]);

  // Form state
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('monthly');
  const [category, setCategory] = useState<SubscriptionCategory>('entertainment');
  const [firstBillDate, setFirstBillDate] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('None');
  const [notes, setNotes] = useState('');
  const [hasFreeTrial, setHasFreeTrial] = useState(false);
  const [freeTrialEndDate, setFreeTrialEndDate] = useState('');
  const [reminderDays, setReminderDays] = useState(1);
  const [url, setUrl] = useState('');
  const [list, setList] = useState(listsList[0] || 'Personal');

  // Update list when listsList changes
  useEffect(() => {
    if (listsList.length > 0 && !listsList.includes(list)) {
      setList(listsList[0]);
    }
  }, [listsList]);

  // Logo state
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [isFetchingLogo, setIsFetchingLogo] = useState(false);

  // Dropdown states
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  // Auto-fetch logo when name changes
  useEffect(() => {
    if (name.length > 2) {
      const delayDebounce = setTimeout(async () => {
        setIsFetchingLogo(true);
        const domain = extractDomain(name);
        const logo = await fetchLogo(domain);
        if (logo) {
          setLogoUrl(logo);
        }
        setIsFetchingLogo(false);
      }, 500);

      return () => clearTimeout(delayDebounce);
    } else {
      setLogoUrl(null);
    }
  }, [name]);

  // Set default date to today
  useEffect(() => {
    if (!firstBillDate) {
      const today = new Date().toISOString().split('T')[0];
      setFirstBillDate(today);
    }
  }, []);

  const handleSubmit = () => {
    if (!name || !price || !firstBillDate) return;

    actions.addSubscription({
      name,
      description: notes,
      cost: parseFloat(price),
      currency: state.currency,
      billingCycle,
      category,
      startDate: hasFreeTrial && freeTrialEndDate ? freeTrialEndDate : firstBillDate,
      nextBillDate: hasFreeTrial && freeTrialEndDate ? freeTrialEndDate : firstBillDate,
      logoUrl: logoUrl || undefined,
      isActive: true,
      paymentMethod: paymentMethod === 'None' ? undefined : paymentMethod,
      notes,
      hasFreeTrial,
      freeTrialEndDate: hasFreeTrial ? freeTrialEndDate : undefined,
      reminderDays,
      url: url || undefined,
      list,
    });

    // Reset form
    setName('');
    setPrice('');
    setBillingCycle('monthly');
    setCategory('entertainment');
    setFirstBillDate('');
    setPaymentMethod('None');
    setNotes('');
    setHasFreeTrial(false);
    setFreeTrialEndDate('');
    setReminderDays(1);
    setUrl('');
    setList('Personal');
    setLogoUrl(null);
    onClose();
  };

  const toggleDropdown = (key: string) => {
    setOpenDropdown(openDropdown === key ? null : key);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-end justify-center">
            <motion.div
              className="relative z-10 w-full max-w-lg bg-surface-50 dark:bg-slate-900 rounded-t-3xl max-h-[92vh] overflow-hidden transition-colors duration-300"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            >
              {/* Header */}
              <div className="sticky top-0 bg-surface-50 dark:bg-slate-900 border-b border-surface-200 dark:border-white/10 px-4 py-3 flex items-center justify-between transition-colors duration-300 z-20">
                <motion.button
                  className="w-10 h-10 flex items-center justify-center text-surface-600 dark:text-slate-400"
                  onClick={onClose}
                  whileTap={{ scale: 0.95 }}
                >
                  <X size={24} />
                </motion.button>
                <h2 className="text-lg font-semibold text-surface-900 dark:text-slate-50">Add Subscription</h2>
                <motion.button
                  className={cn(
                    "px-4 py-2 rounded-full text-sm font-medium",
                    (!name || !price || !firstBillDate)
                      ? "bg-surface-200 dark:bg-slate-800 text-surface-400 dark:text-slate-500"
                      : "bg-primary-500 text-white"
                  )}
                  disabled={!name || !price || !firstBillDate}
                  onClick={handleSubmit}
                  whileTap={{ scale: 0.95 }}
                >
                  Save
                </motion.button>
              </div>

              {/* Scrollable Content */}
              <div className="overflow-y-auto max-h-[calc(92vh-60px)] pb-8">
                {/* Logo Section */}
                <div className="flex justify-center py-6">
                  <div className="relative">
                    <div className={cn(
                      "w-20 h-20 rounded-2xl flex items-center justify-center",
                      "bg-gradient-to-br shadow-soft-lg",
                      logoUrl ? "bg-white dark:bg-slate-800" : category ? allCategories.find(c => c.id === category)?.gradient : 'from-gray-400 to-gray-500'
                    )}>
                      {logoUrl ? (
                        <img src={logoUrl} alt={name} className="w-14 h-14 object-contain" />
                      ) : (
                        <span className="text-white font-bold text-2xl">
                          {name ? name.charAt(0).toUpperCase() : <Image size={32} className="text-white/50" />}
                        </span>
                      )}
                    </div>
                    {isFetchingLogo && (
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center">
                        <motion.div
                          className="w-3 h-3 bg-white rounded-full"
                          animate={{ scale: [1, 0.5, 1] }}
                          transition={{ duration: 0.8, repeat: Infinity }}
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Subscription Details Section */}
                <div className="px-4 mb-4">
                  <div className="ios-list">
                    {/* Name Input */}
                    <div className="ios-list-item">
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Subscription name"
                        className="flex-1 bg-transparent outline-none text-surface-900 dark:text-slate-50 placeholder:text-surface-400"
                        autoFocus
                      />
                    </div>

                    {/* Price Input */}
                    <div className="ios-list-item">
                      <span className="text-surface-500 dark:text-slate-400 w-12">
                        {state.currency === 'IDR' ? 'Rp' :
                         state.currency === 'USD' ? '$' :
                         state.currency === 'EUR' ? '€' :
                         state.currency === 'GBP' ? '£' :
                         state.currency === 'JPY' ? '¥' :
                         state.currency === 'SGD' ? 'S$' :
                         state.currency === 'AUD' ? 'A$' :
                         state.currency === 'CAD' ? 'C$' : '$'}
                      </span>
                      <input
                        type="number"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        placeholder="0.00"
                        step="0.01"
                        className="flex-1 bg-transparent outline-none text-surface-900 dark:text-slate-50 placeholder:text-surface-400"
                      />
                    </div>
                  </div>
                </div>

                {/* Billing Section */}
                <div className="px-4 mb-2">
                  <h3 className="text-xs font-semibold text-surface-500 dark:text-slate-500 uppercase tracking-wide mb-2 px-2">Billing</h3>
                  <div className="ios-list">
                    {/* First Bill Date */}
                    <div
                      className="ios-list-item flex items-center cursor-pointer active:bg-surface-100 dark:active:bg-slate-800"
                      onClick={() => document.getElementById('firstBillDate')?.click()}
                    >
                      <CalendarIcon size={20} className="text-surface-500 dark:text-slate-400 mr-3" />
                      <span className="flex-1 text-surface-900 dark:text-slate-50">First payment</span>
                      <input
                        id="firstBillDate"
                        type="date"
                        value={firstBillDate}
                        onChange={(e) => setFirstBillDate(e.target.value)}
                        className="bg-transparent outline-none text-surface-600 dark:text-slate-400 text-right"
                      />
                    </div>

                    {/* Billing Cycle */}
                    <div
                      className="ios-list-item flex items-center cursor-pointer active:bg-surface-100 dark:active:bg-slate-800"
                      onClick={() => toggleDropdown('billingCycle')}
                    >
                      <Tag size={20} className="text-surface-500 dark:text-slate-400 mr-3" />
                      <span className="flex-1 text-surface-900 dark:text-slate-50">Cycle</span>
                      <span className="text-surface-600 dark:text-slate-400 flex items-center gap-1">
                        {BILLING_CYCLES.find(c => c.value === billingCycle)?.label}
                        <ChevronDown size={16} />
                      </span>
                    </div>

                    {/* Free Trial Toggle */}
                    <div className="ios-list-item flex items-center justify-between">
                      <div className="flex items-center">
                        <span className="text-surface-900 dark:text-slate-50">Free trial</span>
                      </div>
                      <button
                        onClick={() => setHasFreeTrial(!hasFreeTrial)}
                        className={cn(
                          "w-12 h-7 rounded-full transition-colors duration-200 relative",
                          hasFreeTrial ? "bg-primary-500" : "bg-surface-300 dark:bg-slate-700"
                        )}
                      >
                        <motion.div
                          className="absolute top-1 w-5 h-5 bg-white rounded-full shadow-soft-sm"
                          animate={{ left: hasFreeTrial ? 26 : 4 }}
                          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                        />
                      </button>
                    </div>

                    {/* Free Trial End Date (conditional) */}
                    {hasFreeTrial && (
                      <div
                        className="ios-list-item flex items-center cursor-pointer active:bg-surface-100 dark:active:bg-slate-800"
                        onClick={() => document.getElementById('freeTrialDate')?.click()}
                      >
                        <CalendarIcon size={20} className="text-surface-500 dark:text-slate-400 mr-3" />
                        <span className="flex-1 text-surface-900 dark:text-slate-50">Trial ends</span>
                        <input
                          id="freeTrialDate"
                          type="date"
                          value={freeTrialEndDate}
                          onChange={(e) => setFreeTrialEndDate(e.target.value)}
                          className="bg-transparent outline-none text-surface-600 dark:text-slate-400 text-right"
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Organization Section */}
                <div className="px-4 mb-2">
                  <h3 className="text-xs font-semibold text-surface-500 dark:text-slate-500 uppercase tracking-wide mb-2 px-2">Organization</h3>
                  <div className="ios-list">
                    {/* List/Tag */}
                    <div
                      className="ios-list-item flex items-center cursor-pointer active:bg-surface-100 dark:active:bg-slate-800"
                      onClick={() => toggleDropdown('list')}
                    >
                      <Tag size={20} className="text-surface-500 dark:text-slate-400 mr-3" />
                      <span className="flex-1 text-surface-900 dark:text-slate-50">List</span>
                      <span className="text-surface-600 dark:text-slate-400 flex items-center gap-1">
                        {list}
                        <ChevronDown size={16} />
                      </span>
                    </div>

                    {/* Category */}
                    <div
                      className="ios-list-item flex items-center cursor-pointer active:bg-surface-100 dark:active:bg-slate-800"
                      onClick={() => toggleDropdown('category')}
                    >
                      <Tag size={20} className="text-surface-500 dark:text-slate-400 mr-3" />
                      <span className="flex-1 text-surface-900 dark:text-slate-50">Category</span>
                      <span className="text-surface-600 dark:text-slate-400 flex items-center gap-1">
                        {allCategories.find(c => c.id === category)?.name}
                        <ChevronDown size={16} />
                      </span>
                    </div>

                    {/* Payment Method */}
                    <div
                      className="ios-list-item flex items-center cursor-pointer active:bg-surface-100 dark:active:bg-slate-800"
                      onClick={() => toggleDropdown('paymentMethod')}
                    >
                      <CreditCard size={20} className="text-surface-500 dark:text-slate-400 mr-3" />
                      <span className="flex-1 text-surface-900 dark:text-slate-50">Payment</span>
                      <span className="text-surface-600 dark:text-slate-400 flex items-center gap-1">
                        {paymentMethod}
                        <ChevronDown size={16} />
                      </span>
                    </div>
                  </div>
                </div>

                {/* Notifications Section */}
                <div className="px-4 mb-2">
                  <h3 className="text-xs font-semibold text-surface-500 dark:text-slate-500 uppercase tracking-wide mb-2 px-2">Notifications</h3>
                  <div className="ios-list">
                    <div
                      className="ios-list-item flex items-center cursor-pointer active:bg-surface-100 dark:active:bg-slate-800"
                      onClick={() => toggleDropdown('reminder')}
                    >
                      <Bell size={20} className="text-surface-500 dark:text-slate-400 mr-3" />
                      <span className="flex-1 text-surface-900 dark:text-slate-50">Remind me</span>
                      <span className="text-surface-600 dark:text-slate-400 flex items-center gap-1">
                        {REMINDER_OPTIONS.find(r => r.value === reminderDays)?.label}
                        <ChevronDown size={16} />
                      </span>
                    </div>
                  </div>
                </div>

                {/* Optional Section */}
                <div className="px-4 mb-2">
                  <h3 className="text-xs font-semibold text-surface-500 dark:text-slate-500 uppercase tracking-wide mb-2 px-2">Optional</h3>
                  <div className="ios-list">
                    {/* Notes */}
                    <div className="ios-list-item">
                      <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Notes"
                        rows={2}
                        className="flex-1 bg-transparent outline-none text-surface-900 dark:text-slate-50 placeholder:text-surface-400 resize-none"
                      />
                    </div>

                    {/* URL */}
                    <div className="ios-list-item flex items-center">
                      <LinkIcon size={20} className="text-surface-500 dark:text-slate-400 mr-3" />
                      <input
                        type="url"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        placeholder="Website URL"
                        className="flex-1 bg-transparent outline-none text-surface-900 dark:text-slate-50 placeholder:text-surface-400"
                      />
                    </div>
                  </div>
                </div>

                {/* Billing History & Price History Links */}
                <div className="px-4 py-4">
                  <div className="ios-list">
                    <div className="ios-list-item flex items-center justify-center text-primary-500 font-medium">
                      <span>Billing history</span>
                    </div>
                    <div className="ios-list-item flex items-center justify-center text-primary-500 font-medium">
                      <span>Price history</span>
                    </div>
                  </div>
                </div>

                {/* Extra padding for safe area */}
                <div className="h-safe-bottom" />
              </div>

              {/* Dropdown Overlays */}
              <AnimatePresence>
                {openDropdown === 'billingCycle' && (
                  <DropdownOverlay
                    title="Billing Cycle"
                    onClose={() => setOpenDropdown(null)}
                    selected={billingCycle}
                    options={BILLING_CYCLES.map(c => ({ value: c.value, label: c.label }))}
                    onSelect={(v) => { setBillingCycle(v as BillingCycle); setOpenDropdown(null); }}
                  />
                )}

                {openDropdown === 'category' && (
                  <DropdownOverlay
                    title="Category"
                    onClose={() => setOpenDropdown(null)}
                    selected={category}
                    options={allCategories.map(c => ({ value: c.id, label: c.name }))}
                    onSelect={(v) => { setCategory(v as SubscriptionCategory); setOpenDropdown(null); }}
                  />
                )}

                {openDropdown === 'paymentMethod' && (
                  <DropdownOverlay
                    title="Payment Method"
                    onClose={() => setOpenDropdown(null)}
                    selected={paymentMethod}
                    options={paymentMethodsList.map(m => ({ value: m, label: m }))}
                    onSelect={(v) => { setPaymentMethod(v); setOpenDropdown(null); }}
                  />
                )}

                {openDropdown === 'reminder' && (
                  <DropdownOverlay
                    title="Reminder"
                    onClose={() => setOpenDropdown(null)}
                    selected={reminderDays.toString()}
                    options={REMINDER_OPTIONS.map(r => ({ value: r.value.toString(), label: r.label }))}
                    onSelect={(v) => { setReminderDays(parseInt(v)); setOpenDropdown(null); }}
                  />
                )}

                {openDropdown === 'list' && (
                  <DropdownOverlay
                    title="List"
                    onClose={() => setOpenDropdown(null)}
                    selected={list}
                    options={listsList.map(l => ({ value: l, label: l }))}
                    onSelect={(v) => { setList(v); setOpenDropdown(null); }}
                  />
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

/**
 * Dropdown overlay for iOS-style pickers
 */
function DropdownOverlay({
  title,
  options,
  selected,
  onSelect,
  onClose,
}: {
  title: string;
  options: { value: string; label: string }[];
  selected: string;
  onSelect: (value: string) => void;
  onClose: () => void;
}) {
  return (
    <motion.div
      className="fixed inset-0 z-30 flex items-end justify-center bg-black/50 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="relative z-10 w-full max-w-lg bg-white dark:bg-slate-900 rounded-t-3xl transition-colors duration-300"
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-slate-900 border-b border-surface-200 dark:border-white/10 px-4 py-3 flex items-center justify-between transition-colors duration-300">
          <span className="text-primary-500 font-medium" onClick={onClose}>Cancel</span>
          <h3 className="text-lg font-semibold text-surface-900 dark:text-slate-50">{title}</h3>
          <span className="w-16" />
        </div>

        {/* Options */}
        <div className="max-h-[60vh] overflow-y-auto">
          {options.map((option) => (
            <button
              key={option.value}
              onClick={() => onSelect(option.value)}
              className={cn(
                "w-full px-6 py-4 flex items-center justify-between border-b border-surface-100 dark:border-white/5 transition-colors duration-300",
                "active:bg-surface-100 dark:active:bg-slate-800"
              )}
            >
              <span className="text-surface-900 dark:text-slate-50">{option.label}</span>
              {selected === option.value && (
                <div className="w-6 h-6 rounded-full bg-primary-500 flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full" />
                </div>
              )}
            </button>
          ))}
        </div>

        {/* Safe area */}
        <div className="h-safe-bottom" />
      </motion.div>
    </motion.div>
  );
}
