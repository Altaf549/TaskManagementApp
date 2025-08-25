import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Switch, useTheme } from 'react-native-paper';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useThemeContext } from '../../theme/ThemeContext';

const ThemeToggle = () => {
  const { isDark, toggleTheme } = useThemeContext();
  const theme = useTheme();

  return (
    <View style={styles.container}>
      <MaterialIcons 
        name="light-mode" 
        size={24} 
        color={isDark ? theme.colors.primary : theme.colors.onSurface}
      />
      <Switch
        value={isDark}
        onValueChange={toggleTheme}
        color={theme.colors.primary}
        style={styles.switch}
      />
      <MaterialIcons 
        name="dark-mode" 
        size={24} 
        color={isDark ? theme.colors.onSurface : theme.colors.primary}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
  },
  switch: {
    marginHorizontal: 8,
  },
});

export default ThemeToggle;
