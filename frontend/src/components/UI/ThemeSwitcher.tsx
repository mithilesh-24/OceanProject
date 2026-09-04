import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { Button } from './Button';

export const ThemeSwitcher: React.FC<{ size?: 'sm' | 'md'; className?: string }> = ({
  size = 'md',
  className = '',
}) => {
  const { theme, toggleTheme } = useTheme();
  const isLight = theme === 'light';

  return (
    <Button
      variant="outline"
      size={size}
      onClick={toggleTheme}
      className={`relative ${className}`}
      title={isLight ? 'Switch to Dark Mode (Research Night)' : 'Switch to Light Mode (Default GIS)'}
      aria-label={isLight ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
      leftIcon={
        isLight ? (
          <Sun className="w-4 h-4 text-amber-600" />
        ) : (
          <Moon className="w-4 h-4 text-sky-300" />
        )
      }
    >
      <span className="text-xs font-medium uppercase tracking-wider">
        {isLight ? 'Light' : 'Dark'}
      </span>
    </Button>
  );
};
