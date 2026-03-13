import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { HabitMatrixScreen } from '../screens/HabitMatrixScreen';
import { DailyOpsScreen } from '../screens/DailyOpsScreen';
import { AnalyticsScreen } from '../screens/AnalyticsScreen';
import { colors } from '../theme/colors';

const Tab = createBottomTabNavigator();

function TabIcon({
  name,
  focused,
}: {
  name: string;
  focused: boolean;
}) {
  return (
    <View style={[styles.iconWrap, focused && styles.iconWrapActive]}>
      <Text style={[styles.iconText, focused && styles.iconTextActive]}>
        {name.charAt(0)}
      </Text>
    </View>
  );
}

export function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: colors.primaryRed,
        tabBarInactiveTintColor: colors.subText,
        tabBarLabelStyle: styles.tabLabel,
        tabBarItemStyle: styles.tabItem,
      }}
    >
      <Tab.Screen
        name="HabitMatrix"
        component={HabitMatrixScreen}
        options={{
          title: 'Matrix',
          tabBarIcon: ({ focused }) => (
            <TabIcon name="Matrix" focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="DailyOps"
        component={DailyOpsScreen}
        options={{
          title: 'Daily Ops',
          tabBarIcon: ({ focused }) => (
            <TabIcon name="Daily" focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="Analytics"
        component={AnalyticsScreen}
        options={{
          title: 'Analytics',
          tabBarIcon: ({ focused }) => (
            <TabIcon name="Stats" focused={focused} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: colors.card,
    borderTopColor: colors.border,
    borderTopWidth: 1,
    height: 64,
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  tabItem: {
    paddingTop: 8,
  },
  iconWrap: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapActive: {
    backgroundColor: colors.primaryRed,
  },
  iconText: {
    color: colors.subText,
    fontSize: 14,
    fontWeight: '800',
  },
  iconTextActive: {
    color: colors.text,
  },
});
