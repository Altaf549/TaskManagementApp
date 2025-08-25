import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { useColorScheme, StatusBar } from 'react-native';
import { MD3LightTheme, MD3DarkTheme, adaptNavigationTheme, MD3Theme } from 'react-native-paper';
import { DarkTheme as NavigationDarkTheme, DefaultTheme as NavigationDefaultTheme, Theme as NavigationTheme } from '@react-navigation/native';
import { MD3Colors } from 'react-native-paper/lib/typescript/types';

const { LightTheme: PaperLightTheme, DarkTheme: PaperDarkTheme } = adaptNavigationTheme({
  reactNavigationLight: NavigationDefaultTheme,
  reactNavigationDark: NavigationDarkTheme,
});

// Define your custom colors
const lightColors: MD3Colors = {
  ...MD3LightTheme.colors,
  primary: '#6200ee',
  primaryContainer: '#e6deff',
  secondary: '#625b71',
  secondaryContainer: '#e8def8',
  tertiary: '#7e5260',
  surface: '#ffffff',
  surfaceVariant: '#e7e0ec',
  background: '#f5f5f5',
  error: '#b3261e',
  onPrimary: '#ffffff',
  onSecondary: '#ffffff',
  onSurface: '#1c1b1f',
  onSurfaceVariant: '#49454f',
  onError: '#ffffff',
};

const darkColors: MD3Colors = {
  ...MD3DarkTheme.colors,
  // Primary colors
  primary: '#d0bcff',
  onPrimary: '#381e72',
  primaryContainer: '#4f378b',
  onPrimaryContainer: '#e8ddff',
  // Secondary colors
  secondary: '#cbc2db',
  onSecondary: '#332d41',
  secondaryContainer: '#4a4458',
  onSecondaryContainer: '#e8def8',
  // Tertiary colors
  tertiary: '#efb8c8',
  onTertiary: '#4a2532',
  tertiaryContainer: '#633b48',
  onTertiaryContainer: '#ffd9e3',
  // Surface colors
  surface: '#1c1b1f',
  onSurface: '#e6e1e5',
  surfaceVariant: '#49454f',
  onSurfaceVariant: '#cac4d0',
  // Background colors
  background: '#1c1b1f',
  onBackground: '#e6e1e5',
  // Error colors
  error: '#f2b8b5',
  onError: '#601410',
  errorContainer: '#8c1d18',
  onErrorContainer: '#f9dedc',
  // Outline and surface variants
  outline: '#938f99',
  outlineVariant: '#49454f',
  // Other colors
  inverseSurface: '#e6e1e5',
  inverseOnSurface: '#313033',
  inversePrimary: '#6750a4',
  scrim: '#000000',
  shadow: '#000000',
};

// Create theme objects
export const lightTheme: MD3Theme & { colors: MD3Colors } = {
  ...MD3LightTheme,
  colors: lightColors,
  dark: false,
} as const;

export const darkTheme: MD3Theme & { colors: MD3Colors } = {
  ...MD3DarkTheme,
  colors: darkColors,
  dark: true,
} as const;

type ThemeType = 'light' | 'dark' | 'system';

type ThemeContextType = {
  theme: MD3Theme & { colors: MD3Colors };
  isDark: boolean;
  themePreference: ThemeType;
  setThemePreference: (theme: ThemeType) => void;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [themePreference, setThemePreference] = useState<ThemeType>('system');

  // Determine the current theme based on preference
  const isDark = useMemo(() => {
    if (themePreference === 'system') {
      return systemColorScheme === 'dark';
    }
    return themePreference === 'dark';
  }, [themePreference, systemColorScheme]);

  // Get the current theme
  const theme = isDark ? darkTheme : lightTheme;

  // Update status bar style when theme changes
  useEffect(() => {
    StatusBar.setBarStyle(isDark ? 'light-content' : 'dark-content');
  }, [isDark]);

  const toggleTheme = () => {
    setThemePreference(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  const value = {
    theme,
    isDark,
    themePreference,
    setThemePreference,
    toggleTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useThemeContext = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useThemeContext must be used within a ThemeProvider');
  }
  return context;
};
