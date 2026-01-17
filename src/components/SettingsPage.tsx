import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, ChevronRight, Moon, Sun, Monitor, Info, Github, Twitter,
  Plus, Trash2, Edit2, X, Camera, CreditCard, Tag, Tv, Zap, Cpu,
  Dumbbell, BookOpen, Gamepad2, Music, Cloud, MoreHorizontal, Search,
  Film, Radio, Speaker, Lightbulb, Plug, Wifi, Keyboard, Mouse, Laptop,
  HeartPulse, Activity, GraduationCap, Languages, PenTool,
  Trophy, Target, Headphones, Mic2, Disc3, HardDrive, Database, Server,
  ShoppingBag, ShoppingCart, Package, Truck, Home, Building, Building2,
  Store, Car, Plane, Train, Ship, Coffee, Pizza, Utensils, Cake, Heart,
  Star, Sparkles, Flame, CircleDot, Settings, Wrench,
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useApp } from '../context/AppContext';
import { CATEGORIES, POPULAR_ICONS } from '../constants/categories';
import { cn } from '../utils/helpers';

type ThemeOption = 'light' | 'dark' | 'system';

interface ThemeOptionConfig {
  value: ThemeOption;
  label: string;
  icon: typeof Sun;
  description: string;
}

const THEME_OPTIONS: ThemeOptionConfig[] = [
  {
    value: 'light',
    label: 'Light',
    icon: Sun,
    description: 'Always use light mode',
  },
  {
    value: 'dark',
    label: 'Dark',
    icon: Moon,
    description: 'Always use dark mode',
  },
  {
    value: 'system',
    label: 'System',
    icon: Monitor,
    description: 'Follow device preference',
  },
];

const CURRENCY_OPTIONS = [
  { code: 'IDR', symbol: 'Rp', name: 'Indonesian Rupiah' },
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
];

interface PaymentMethod {
  id: string;
  name: string;
  type: 'card' | 'digital' | 'bank';
  last4?: string;
}

interface CategoryInfoExtended {
  id: string;
  name: string;
  icon: string;
  color: string;
  gradient: string;
}

interface ProfileData {
  username: string;
  picture: string | null;
}

const PROFILE_STORAGE_KEY = 'subtrack-profile';
const CATEGORIES_STORAGE_KEY = 'subtrack-custom-categories';
const PAYMENT_METHODS_STORAGE_KEY = 'subtrack-payment-methods';
const LISTS_STORAGE_KEY = 'subtrack-lists';

// Icon mapping for dynamic rendering
const ICON_MAP: Record<string, React.ComponentType<{ className?: string; size?: number }>> = {
  Tv, Zap, Cpu, Dumbbell, BookOpen, Gamepad2, Music, Cloud, MoreHorizontal,
  Film, Radio, Speaker, Lightbulb, Plug, Wifi, Monitor, Keyboard, Mouse, Laptop,
  HeartPulse, Activity, GraduationCap, Languages, PenTool, Trophy, Target,
  Headphones, Mic2, Disc3, HardDrive, Database, Server, ShoppingBag, ShoppingCart,
  Package, Truck, Home, Building, Building2, Store, Car, Plane, Train, Ship,
  Coffee, Pizza, Utensils, Cake, Heart, Star, Sparkles, Flame, CircleDot, Settings, Wrench,
};

interface SettingsPageProps {
  onBack: () => void;
}

export function SettingsPage({ onBack }: SettingsPageProps) {
  const { theme, setTheme } = useTheme();
  const { state, actions } = useApp();
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [openModal, setOpenModal] = useState<string | null>(null);

  // Profile state with localStorage persistence
  const [profile, setProfile] = useState<ProfileData>({ username: 'User', picture: null });
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [editUsername, setEditUsername] = useState('');

  // Categories state
  const [customCategories, setCustomCategories] = useState<CategoryInfoExtended[]>([]);

  // Settings state
  const [lists, setLists] = useState(['Personal', 'Work', 'Family', 'Business']);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([
    { id: '1', name: 'Visa •••• 4242', type: 'card', last4: '4242' },
    { id: '2', name: 'Mastercard •••• 8888', type: 'card', last4: '8888' },
  ]);

  // Load profile from localStorage on mount
  useEffect(() => {
    const savedProfile = localStorage.getItem(PROFILE_STORAGE_KEY);
    if (savedProfile) {
      try {
        const parsed = JSON.parse(savedProfile);
        setProfile(parsed);
      } catch (e) {
        console.error('Failed to parse profile data:', e);
      }
    }

    // Load custom categories
    const savedCategories = localStorage.getItem(CATEGORIES_STORAGE_KEY);
    if (savedCategories) {
      try {
        setCustomCategories(JSON.parse(savedCategories));
      } catch (e) {
        console.error('Failed to parse categories data:', e);
      }
    }

    // Load payment methods
    const savedPaymentMethods = localStorage.getItem(PAYMENT_METHODS_STORAGE_KEY);
    if (savedPaymentMethods) {
      try {
        setPaymentMethods(JSON.parse(savedPaymentMethods));
      } catch (e) {
        console.error('Failed to parse payment methods data:', e);
      }
    }

    // Load lists
    const savedLists = localStorage.getItem(LISTS_STORAGE_KEY);
    if (savedLists) {
      try {
        setLists(JSON.parse(savedLists));
      } catch (e) {
        console.error('Failed to parse lists data:', e);
      }
    }
  }, []);

  // Save profile to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
  }, [profile]);

  // Save custom categories to localStorage
  useEffect(() => {
    localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(customCategories));
  }, [customCategories]);

  // Save payment methods to localStorage
  useEffect(() => {
    localStorage.setItem(PAYMENT_METHODS_STORAGE_KEY, JSON.stringify(paymentMethods));
  }, [paymentMethods]);

  // Save lists to localStorage
  useEffect(() => {
    localStorage.setItem(LISTS_STORAGE_KEY, JSON.stringify(lists));
  }, [lists]);

  const toggleDropdown = (key: string) => {
    setOpenDropdown(openDropdown === key ? null : key);
  };

  const openEditModal = (modal: string) => {
    setOpenModal(modal);
    setOpenDropdown(null);
  };

  const handleUsernameSave = () => {
    if (editUsername.trim()) {
      setProfile({ ...profile, username: editUsername.trim() });
      setIsEditingUsername(false);
      setEditUsername('');
    }
  };

  const handleProfilePictureChange = () => {
    // Create file input
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setProfile({ ...profile, picture: e.target?.result as string });
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  const allCategories = [...CATEGORIES, ...customCategories];

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-slate-950 px-5 pt-8 pb-40 transition-colors duration-300">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <motion.button
          className="w-9 h-9 rounded-full bg-white dark:bg-slate-800 shadow-soft-sm dark:shadow-lg flex items-center justify-center border border-surface-100 dark:border-white/10"
          onClick={onBack}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <ArrowLeft size={18} className="text-surface-600 dark:text-slate-400" />
        </motion.button>
        <h1 className="text-xl font-bold text-surface-900 dark:text-slate-50">Settings</h1>
      </div>

      {/* Profile Section */}
      <div className="mb-4">
        <h3 className="text-xs font-medium text-surface-500 dark:text-slate-400 px-1 mb-2 uppercase tracking-wide">Profile</h3>
        <div className="ios-list">
          {/* Profile Picture & Name */}
          <div className="ios-list-item flex items-center gap-3">
            <div className="relative">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary-400 to-accent-500 flex items-center justify-center text-white text-lg font-bold overflow-hidden">
                {profile.picture ? (
                  <img src={profile.picture} alt="Profile" className="w-full h-full rounded-full object-cover" />
                ) : (
                  profile.username.charAt(0).toUpperCase()
                )}
              </div>
              <button
                className="absolute -bottom-1 -right-1 w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center text-white shadow-soft-sm hover:bg-primary-600 transition-colors"
                onClick={handleProfilePictureChange}
              >
                <Camera size={12} />
              </button>
            </div>
            <div
              className="flex-1 cursor-pointer"
              onClick={() => {
                setIsEditingUsername(true);
                setEditUsername(profile.username);
              }}
            >
              {isEditingUsername ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={editUsername}
                    onChange={(e) => setEditUsername(e.target.value)}
                    className="flex-1 px-2 py-1 bg-surface-50 dark:bg-slate-800 rounded-lg outline-none focus:ring-2 focus:ring-primary-500 text-surface-900 dark:text-slate-50 font-semibold"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleUsernameSave();
                      if (e.key === 'Escape') {
                        setIsEditingUsername(false);
                        setEditUsername('');
                      }
                    }}
                    onBlur={handleUsernameSave}
                  />
                </div>
              ) : (
                <>
                  <p className="font-semibold text-surface-900 dark:text-slate-50">{profile.username}</p>
                  <p className="text-sm text-surface-500 dark:text-slate-400">Tap to edit profile</p>
                </>
              )}
            </div>
            <ChevronRight size={18} className="text-surface-400 dark:text-slate-500" />
          </div>

          {/* Currency */}
          <div
            className="ios-list-item flex items-center cursor-pointer active:bg-surface-100 dark:active:bg-slate-800"
            onClick={() => toggleDropdown('currency')}
          >
            <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mr-3">
              <span className="text-green-600 dark:text-green-400 font-semibold text-sm">
                {CURRENCY_OPTIONS.find(c => c.code === state.currency)?.symbol || '$'}
              </span>
            </div>
            <span className="flex-1 font-medium text-surface-900 dark:text-slate-50">Currency</span>
            <span className="text-sm text-surface-500 dark:text-slate-400 flex items-center gap-1">
              {CURRENCY_OPTIONS.find(c => c.code === state.currency)?.name}
              <ChevronRight size={16} />
            </span>
          </div>
        </div>
      </div>

      {/* Appearance Section */}
      <div className="mb-6">
        <h3 className="text-sm font-medium text-surface-500 dark:text-slate-400 px-1 mb-2 uppercase tracking-wide">Appearance</h3>
        <div className="ios-list">
          <div className="px-4 py-4">
            <p className="text-sm text-surface-500 dark:text-slate-400 mb-3">Theme</p>
            <div className="grid grid-cols-3 gap-2">
              {THEME_OPTIONS.map((option) => {
                const Icon = option.icon;
                const isActive = theme === option.value;

                return (
                  <motion.button
                    key={option.value}
                    onClick={() => setTheme(option.value)}
                    className={cn(
                      "flex flex-col items-center gap-2 p-3 rounded-2xl border-2 transition-all",
                      isActive
                        ? "bg-primary-50 dark:bg-primary-900/30 border-primary-500"
                        : "bg-white dark:bg-slate-800 border-transparent dark:border-white/10"
                    )}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div
                      className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center transition-colors",
                        isActive
                          ? "bg-primary-500 text-white"
                          : "bg-surface-100 dark:bg-white/10 text-surface-600 dark:text-slate-400"
                      )}
                    >
                      <Icon size={20} />
                    </div>
                    <span
                      className={cn(
                        "text-xs font-medium",
                        isActive
                          ? "text-primary-700 dark:text-primary-300"
                          : "text-surface-700 dark:text-slate-300"
                      )}
                    >
                      {option.label}
                    </span>
                  </motion.button>
                );
              })}
            </div>
            <p className="text-xs text-surface-400 dark:text-slate-500 mt-3">
              {THEME_OPTIONS.find((t) => t.value === theme)?.description}
            </p>
          </div>
        </div>
      </div>

      {/* Organization Section */}
      <div className="mb-6">
        <h3 className="text-sm font-medium text-surface-500 dark:text-slate-400 px-1 mb-2 uppercase tracking-wide">Organization</h3>
        <div className="ios-list">
          {/* Categories */}
          <div
            className="ios-list-item flex items-center justify-between cursor-pointer active:bg-surface-100 dark:active:bg-slate-800"
            onClick={() => openEditModal('categories')}
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                <Tv size={18} className="text-purple-600 dark:text-purple-400" />
              </div>
              <span className="font-medium text-surface-900 dark:text-slate-50">Categories</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-surface-500 dark:text-slate-400">{allCategories.length}</span>
              <ChevronRight size={18} className="text-surface-400 dark:text-slate-500" />
            </div>
          </div>

          {/* Payment Methods */}
          <div
            className="ios-list-item flex items-center justify-between cursor-pointer active:bg-surface-100 dark:active:bg-slate-800"
            onClick={() => openEditModal('paymentMethods')}
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <CreditCard size={18} className="text-blue-600 dark:text-blue-400" />
              </div>
              <span className="font-medium text-surface-900 dark:text-slate-50">Payment Methods</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-surface-500 dark:text-slate-400">{paymentMethods.length}</span>
              <ChevronRight size={18} className="text-surface-400 dark:text-slate-500" />
            </div>
          </div>

          {/* Lists */}
          <div
            className="ios-list-item flex items-center justify-between cursor-pointer active:bg-surface-100 dark:active:bg-slate-800"
            onClick={() => openEditModal('lists')}
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                <Tag size={18} className="text-orange-600 dark:text-orange-400" />
              </div>
              <span className="font-medium text-surface-900 dark:text-slate-50">Lists</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-surface-500 dark:text-slate-400">{lists.length}</span>
              <ChevronRight size={18} className="text-surface-400 dark:text-slate-500" />
            </div>
          </div>
        </div>
      </div>

      {/* General Section */}
      <div className="mb-6">
        <h3 className="text-sm font-medium text-surface-500 dark:text-slate-400 px-1 mb-2 uppercase tracking-wide">General</h3>
        <div className="ios-list">
          <SettingsItem icon={<Info size={18} />} label="About SubTrack" value="v1.0.0" />
          <SettingsItem icon={<Github size={18} />} label="GitHub" onClick={() => window.open('https://github.com', '_blank')} />
          <SettingsItem icon={<Twitter size={18} />} label="Twitter" onClick={() => window.open('https://twitter.com', '_blank')} />
        </div>
      </div>

      {/* Data Section */}
      <div className="mb-6">
        <h3 className="text-sm font-medium text-surface-500 dark:text-slate-400 px-1 mb-2 uppercase tracking-wide">Data</h3>
        <div className="ios-list">
          <SettingsItem
            icon={<CreditCard size={18} />}
            label="Export Data"
            onClick={() => console.log('Export data')}
          />
          <SettingsItem
            icon={<Trash2 size={18} className="text-danger-500" />}
            label="Clear All Data"
            onClick={() => {
              if (confirm('Are you sure you want to clear all data? This cannot be undone.')) {
                localStorage.clear();
                window.location.reload();
              }
            }}
          />
        </div>
      </div>

      {/* Currency Dropdown */}
      <AnimatePresence>
        {openDropdown === 'currency' && (
          <DropdownOverlay
            title="Select Currency"
            onClose={() => setOpenDropdown(null)}
            selected={state.currency}
            options={CURRENCY_OPTIONS.map(c => ({ value: c.code, label: `${c.symbol} ${c.name}` }))}
            onSelect={(v) => { actions.setCurrency(v); setOpenDropdown(null); }}
          />
        )}
      </AnimatePresence>

      {/* Lists Edit Modal */}
      <AnimatePresence>
        {openModal === 'lists' && (
          <EditModal
            title="Manage Lists"
            onClose={() => setOpenModal(null)}
            items={lists.map(l => ({ id: l, name: l }))}
            onAdd={(name) => setLists([...lists, name])}
            onDelete={(id) => setLists(lists.filter(l => l !== id))}
            onRename={(id, name) => setLists(lists.map(l => l === id ? name : l))}
            emptyMessage="No lists yet"
          />
        )}
      </AnimatePresence>

      {/* Payment Methods Edit Modal */}
      <AnimatePresence>
        {openModal === 'paymentMethods' && (
          <PaymentMethodsModal
            title="Payment Methods"
            onClose={() => setOpenModal(null)}
            paymentMethods={paymentMethods}
            onAdd={(pm) => setPaymentMethods([...paymentMethods, pm])}
            onDelete={(id) => setPaymentMethods(paymentMethods.filter(pm => pm.id !== id))}
          />
        )}
      </AnimatePresence>

      {/* Categories Edit Modal */}
      <AnimatePresence>
        {openModal === 'categories' && (
          <CategoriesModal
            title="Manage Categories"
            onClose={() => setOpenModal(null)}
            categories={allCategories}
            customCategories={customCategories}
            onAddCategory={(cat) => setCustomCategories([...customCategories, cat])}
            onEditCategory={(id, name) => {
              setCustomCategories(customCategories.map(cat =>
                cat.id === id ? { ...cat, name } : cat
              ));
            }}
            onDeleteCategory={(id) => setCustomCategories(customCategories.filter(cat => cat.id !== id))}
          />
        )}
      </AnimatePresence>

      {/* Safe area */}
      <div className="h-safe-bottom" />
    </div>
  );
}

function SettingsItem({
  icon,
  label,
  value,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  value?: string;
  onClick?: () => void;
}) {
  return (
    <motion.button
      className="ios-list-item flex items-center gap-3 w-full text-left"
      onClick={onClick}
      whileHover={{ backgroundColor: 'rgba(0,0,0,0.02)' }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="w-8 h-8 rounded-full bg-surface-100 dark:bg-white/10 flex items-center justify-center text-surface-600 dark:text-slate-400">
        {icon}
      </div>
      <span className="flex-1 font-medium text-surface-900 dark:text-slate-50">{label}</span>
      {value && <span className="text-sm text-surface-500 dark:text-slate-400">{value}</span>}
      {!value && <ChevronRight size={18} className="text-surface-400 dark:text-slate-500" />}
    </motion.button>
  );
}

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
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="relative z-10 w-full bg-white dark:bg-slate-900 rounded-t-3xl transition-colors duration-300"
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white dark:bg-slate-900 border-b border-surface-200 dark:border-white/10 px-4 py-3 flex items-center justify-between transition-colors duration-300">
          <span className="text-primary-500 font-medium" onClick={onClose}>Cancel</span>
          <h3 className="text-lg font-semibold text-surface-900 dark:text-slate-50">{title}</h3>
          <span className="w-16" />
        </div>
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
        <div className="h-safe-bottom" />
      </motion.div>
    </motion.div>
  );
}

interface EditableItem {
  id: string;
  name: string;
}

function EditModal({
  title,
  items,
  onClose,
  onAdd,
  onDelete,
  onRename,
  emptyMessage,
}: {
  title: string;
  items: EditableItem[];
  onClose: () => void;
  onAdd: (name: string) => void;
  onDelete: (id: string) => void;
  onRename: (id: string, name: string) => void;
  emptyMessage: string;
}) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [newValue, setNewValue] = useState('');

  const handleSave = () => {
    if (editingId && editValue.trim()) {
      onRename(editingId, editValue.trim());
      setEditingId(null);
      setEditValue('');
    }
  };

  const handleAdd = () => {
    if (newValue.trim()) {
      onAdd(newValue.trim());
      setNewValue('');
      setIsAdding(false);
    }
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="relative z-10 w-full bg-white dark:bg-slate-900 rounded-t-3xl transition-colors duration-300"
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Add button */}
        <div className="sticky top-0 bg-white dark:bg-slate-900 border-b border-surface-200 dark:border-white/10 px-4 py-3 flex items-center justify-between transition-colors duration-300">
          <span className="text-primary-500 font-medium" onClick={onClose}>Done</span>
          <h3 className="text-lg font-semibold text-surface-900 dark:text-slate-50">{title}</h3>
          <motion.button
            onClick={() => setIsAdding(!isAdding)}
            className="w-7 h-7 rounded-full bg-primary-500 text-white flex items-center justify-center"
            whileTap={{ scale: 0.9 }}
          >
            <Plus size={16} />
          </motion.button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-4">
          {/* Add new item inline */}
          {isAdding && (
            <div className="mb-4 flex gap-2">
              <input
                type="text"
                value={newValue}
                onChange={(e) => setNewValue(e.target.value)}
                placeholder="Enter name..."
                className="flex-1 px-4 py-3 bg-surface-50 dark:bg-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-primary-500 text-surface-900 dark:text-slate-50"
                autoFocus
                onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
              />
              <button
                onClick={handleAdd}
                className="px-4 py-3 bg-primary-500 text-white rounded-xl font-medium"
              >
                Add
              </button>
              <button
                onClick={() => {
                  setIsAdding(false);
                  setNewValue('');
                }}
                className="px-4 py-3 bg-surface-200 dark:bg-slate-700 rounded-xl font-medium text-surface-700 dark:text-slate-300"
              >
                Cancel
              </button>
            </div>
          )}

          {/* Items list */}
          {items.length === 0 ? (
            <div className="text-center py-8 text-surface-400 dark:text-slate-500">
              {emptyMessage}
            </div>
          ) : (
            <div className="ios-list">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="ios-list-item flex items-center gap-3"
                >
                  {editingId === item.id ? (
                    <>
                      <input
                        type="text"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="flex-1 px-3 py-2 bg-surface-50 dark:bg-slate-800 rounded-lg outline-none focus:ring-2 focus:ring-primary-500 text-surface-900 dark:text-slate-50"
                        autoFocus
                        onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                      />
                      <button
                        onClick={handleSave}
                        className="px-3 py-2 bg-primary-500 text-white rounded-lg text-sm font-medium"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => { setEditingId(null); setEditValue(''); }}
                        className="p-2 text-surface-400"
                      >
                        <X size={18} />
                      </button>
                    </>
                  ) : (
                    <>
                      <span className="flex-1 font-medium text-surface-900 dark:text-slate-50">{item.name}</span>
                      <button
                        onClick={() => { setEditingId(item.id); setEditValue(item.name); }}
                        className="p-2 text-surface-400"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => onDelete(item.id)}
                        className="p-2 text-danger-500"
                      >
                        <Trash2 size={16} />
                      </button>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="h-safe-bottom" />
      </motion.div>
    </motion.div>
  );
}

function PaymentMethodsModal({
  title,
  onClose,
  paymentMethods,
  onAdd,
  onDelete,
}: {
  title: string;
  onClose: () => void;
  paymentMethods: PaymentMethod[];
  onAdd: (pm: PaymentMethod) => void;
  onDelete: (id: string) => void;
}) {
  const [isAdding, setIsAdding] = useState(false);
  const [newMethod, setNewMethod] = useState('');

  const handleAdd = () => {
    if (newMethod.trim()) {
      onAdd({
        id: Date.now().toString(),
        name: newMethod.trim(),
        type: 'card',
      });
      setNewMethod('');
      setIsAdding(false);
    }
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="relative z-10 w-full bg-white dark:bg-slate-900 rounded-t-3xl transition-colors duration-300"
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white dark:bg-slate-900 border-b border-surface-200 dark:border-white/10 px-4 py-3 flex items-center justify-between transition-colors duration-300">
          <span className="text-primary-500 font-medium" onClick={onClose}>Done</span>
          <h3 className="text-lg font-semibold text-surface-900 dark:text-slate-50">{title}</h3>
          <motion.button
            onClick={() => setIsAdding(!isAdding)}
            className="w-7 h-7 rounded-full bg-primary-500 text-white flex items-center justify-center"
            whileTap={{ scale: 0.9 }}
          >
            <Plus size={16} />
          </motion.button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-4">
          {/* Add new payment method */}
          {isAdding && (
            <div className="mb-4 flex gap-2">
              <input
                type="text"
                value={newMethod}
                onChange={(e) => setNewMethod(e.target.value)}
                placeholder="e.g., Visa •••• 4242"
                className="flex-1 px-4 py-3 bg-surface-50 dark:bg-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-primary-500 text-surface-900 dark:text-slate-50"
                autoFocus
                onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
              />
              <button
                onClick={handleAdd}
                className="px-4 py-3 bg-primary-500 text-white rounded-xl font-medium"
              >
                Add
              </button>
              <button
                onClick={() => {
                  setIsAdding(false);
                  setNewMethod('');
                }}
                className="px-4 py-3 bg-surface-200 dark:bg-slate-700 rounded-xl font-medium text-surface-700 dark:text-slate-300"
              >
                Cancel
              </button>
            </div>
          )}

          {/* Payment methods list */}
          {paymentMethods.length === 0 ? (
            <div className="text-center py-8 text-surface-400 dark:text-slate-500">
              No payment methods yet
            </div>
          ) : (
            <div className="ios-list">
              {paymentMethods.map((pm) => (
                <div
                  key={pm.id}
                  className="ios-list-item flex items-center gap-3"
                >
                  <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                    <CreditCard size={20} className="text-blue-600 dark:text-blue-400" />
                  </div>
                  <span className="flex-1 font-medium text-surface-900 dark:text-slate-50">{pm.name}</span>
                  <button
                    onClick={() => onDelete(pm.id)}
                    className="p-2 text-danger-500"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="h-safe-bottom" />
      </motion.div>
    </motion.div>
  );
}

interface CategoriesModalProps {
  title: string;
  onClose: () => void;
  categories: CategoryInfoExtended[];
  customCategories: CategoryInfoExtended[];
  onAddCategory: (category: CategoryInfoExtended) => void;
  onEditCategory: (id: string, name: string) => void;
  onDeleteCategory: (id: string) => void;
}

function CategoriesModal({
  title,
  onClose,
  categories,
  customCategories,
  onAddCategory,
  onEditCategory,
  onDeleteCategory,
}: CategoriesModalProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('Folder');
  const [iconSearch, setIconSearch] = useState('');
  const [showIconSelector, setShowIconSelector] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  const filteredIcons = iconSearch
    ? POPULAR_ICONS.filter(icon => icon.toLowerCase().includes(iconSearch.toLowerCase()))
    : POPULAR_ICONS;

  const handleAddCategory = () => {
    if (newCategoryName.trim() && selectedIcon) {
      onAddCategory({
        id: `custom-${Date.now()}`,
        name: newCategoryName.trim(),
        icon: selectedIcon,
        color: '#6b7280',
        gradient: 'from-gray-400 to-slate-500',
      });
      setNewCategoryName('');
      setSelectedIcon('Folder');
      setIsAdding(false);
    }
  };

  const renderIcon = (iconName: string, className: string = '') => {
    const IconComponent = ICON_MAP[iconName];
    if (IconComponent) {
      return <IconComponent className={className} size={20} />;
    }
    return <span className={className}>{iconName.charAt(0)}</span>;
  };

  const handleEditSave = () => {
    if (editingId && editName.trim()) {
      onEditCategory(editingId, editName.trim());
      setEditingId(null);
      setEditName('');
    }
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="relative z-10 w-full bg-white dark:bg-slate-900 rounded-t-3xl transition-colors duration-300"
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white dark:bg-slate-900 border-b border-surface-200 dark:border-white/10 px-4 py-3 flex items-center justify-between transition-colors duration-300">
          <span className="text-primary-500 font-medium" onClick={onClose}>Done</span>
          <h3 className="text-lg font-semibold text-surface-900 dark:text-slate-50">{title}</h3>
          <motion.button
            onClick={() => setIsAdding(!isAdding)}
            className="w-7 h-7 rounded-full bg-primary-500 text-white flex items-center justify-center"
            whileTap={{ scale: 0.9 }}
          >
            <Plus size={16} />
          </motion.button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-4">
          {/* Add new category */}
          {isAdding && (
            <div className="mb-4 p-4 bg-surface-50 dark:bg-slate-800 rounded-xl space-y-3">
              <input
                type="text"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="Category name..."
                className="w-full px-4 py-3 bg-white dark:bg-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-primary-500 text-surface-900 dark:text-slate-50"
                autoFocus
              />

              <div>
                <label className="text-sm text-surface-600 dark:text-slate-400 mb-2 block">Select Icon</label>
                <button
                  onClick={() => setShowIconSelector(!showIconSelector)}
                  className="w-full px-4 py-3 bg-white dark:bg-slate-700 rounded-xl flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                      {renderIcon(selectedIcon, 'text-primary-600 dark:text-primary-400')}
                    </div>
                    <span className="text-surface-900 dark:text-slate-50">{selectedIcon}</span>
                  </div>
                  <ChevronRight size={18} className="text-surface-400" />
                </button>
              </div>

              {showIconSelector && (
                <div className="mt-3 p-3 bg-white dark:bg-slate-700 rounded-xl">
                  <div className="relative mb-3">
                    <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" />
                    <input
                      type="text"
                      value={iconSearch}
                      onChange={(e) => setIconSearch(e.target.value)}
                      placeholder="Search icons..."
                      className="w-full pl-10 pr-4 py-2 bg-surface-50 dark:bg-slate-800 rounded-lg outline-none focus:ring-2 focus:ring-primary-500 text-surface-900 dark:text-slate-50"
                    />
                  </div>
                  <div className="grid grid-cols-6 gap-2 max-h-48 overflow-y-auto">
                    {filteredIcons.map((icon) => (
                      <button
                        key={icon}
                        onClick={() => {
                          setSelectedIcon(icon);
                          setShowIconSelector(false);
                          setIconSearch('');
                        }}
                        className={cn(
                          "w-10 h-10 rounded-lg flex items-center justify-center transition-colors",
                          selectedIcon === icon
                            ? "bg-primary-500 text-white"
                            : "bg-surface-100 dark:bg-slate-800 text-surface-600 dark:text-slate-400 hover:bg-surface-200 dark:hover:bg-slate-700"
                        )}
                      >
                        {renderIcon(icon)}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <button
                  onClick={handleAddCategory}
                  className="flex-1 px-4 py-3 bg-primary-500 text-white rounded-xl font-medium"
                >
                  Add Category
                </button>
                <button
                  onClick={() => {
                    setIsAdding(false);
                    setNewCategoryName('');
                    setSelectedIcon('Folder');
                    setShowIconSelector(false);
                  }}
                  className="px-4 py-3 bg-surface-200 dark:bg-slate-700 rounded-xl font-medium text-surface-700 dark:text-slate-300"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Categories list */}
          <div className="ios-list mt-4">
            {categories.map((cat) => {
              const isCustom = customCategories.some(c => c.id === cat.id);

              return (
                <div
                  key={cat.id}
                  className="ios-list-item flex items-center gap-3"
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br ${cat.gradient}`}>
                    {renderIcon(cat.icon, 'text-white')}
                  </div>

                  {editingId === cat.id ? (
                    <>
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="flex-1 px-3 py-2 bg-surface-50 dark:bg-slate-800 rounded-lg outline-none focus:ring-2 focus:ring-primary-500 text-surface-900 dark:text-slate-50"
                        autoFocus
                        onKeyDown={(e) => e.key === 'Enter' && handleEditSave()}
                      />
                      <button
                        onClick={handleEditSave}
                        className="px-3 py-2 bg-primary-500 text-white rounded-lg text-sm font-medium"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => { setEditingId(null); setEditName(''); }}
                        className="p-2 text-surface-400"
                      >
                        <X size={18} />
                      </button>
                    </>
                  ) : (
                    <>
                      <span className="flex-1 font-medium text-surface-900 dark:text-slate-50">{cat.name}</span>
                      {isCustom && (
                        <>
                          <button
                            onClick={() => { setEditingId(cat.id); setEditName(cat.name); }}
                            className="p-2 text-surface-400"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => onDeleteCategory(cat.id)}
                            className="p-2 text-danger-500"
                          >
                            <Trash2 size={16} />
                          </button>
                        </>
                      )}
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="h-safe-bottom" />
      </motion.div>
    </motion.div>
  );
}
