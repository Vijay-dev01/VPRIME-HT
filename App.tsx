import 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { TabNavigator } from './src/navigation/TabNavigator';
import { useThemeStore } from './src/store/useThemeStore';

export default function App() {
  const accentColor = useThemeStore((s) => s.accentColor);

  const appTheme = {
    ...DarkTheme,
    colors: {
      ...DarkTheme.colors,
      primary: accentColor,
      background: '#0D0D0D',
      card: '#1A1A1A',
      text: '#FFFFFF',
      border: '#2A2A2A',
      notification: accentColor,
    },
  };

  return (
    <SafeAreaProvider>
      <NavigationContainer theme={appTheme}>
        <TabNavigator />
        <StatusBar style="light" />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
