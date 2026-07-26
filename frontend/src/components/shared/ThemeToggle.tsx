import { Sun, Moon, Monitor } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';

const ICONS = { light: Sun, dark: Moon, system: Monitor };
const LABELS = { light: 'Light mode', dark: 'Dark mode', system: 'System theme' };

/**
 * Single floating button that cycles Light -> Dark -> System -> Light.
 * Shows the icon for the CURRENT mode (not the resolved theme) so the user
 * can tell "system" apart from a manually chosen light/dark.
 */
export default function ThemeToggle() {
  const { mode, cycleMode } = useTheme();
  const Icon = ICONS[mode];

  return (
    <button
      type="button"
      onClick={cycleMode}
      aria-label={`Theme: ${LABELS[mode]}. Click to change.`}
      title={LABELS[mode]}
      className="w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-white shadow-cardHover backdrop-blur-sm bg-navy/90 dark:bg-white dark:text-navy sm:hover:scale-110 transition-transform duration-200"
    >
      <Icon size={18} />
    </button>
  );
}
