import { Tabs } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, Text } from 'react-native';

function TabIcon({ icon, label, focused }: { icon: string; label: string; focused: boolean }) {
  return (
    <View style={styles.tabIcon}>
      <Text style={[styles.icon, focused && styles.iconFocused]}>{icon}</Text>
      <Text style={[styles.label, focused && styles.labelFocused]}>{label}</Text>
    </View>
  );
}

export default function RootLayout() {
  return (
    <>
      <StatusBar style="dark" />
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: styles.tabBar,
          tabBarShowLabel: false,
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Map',
            tabBarIcon: ({ focused }) => (
              <TabIcon icon="🗺️" label="Map" focused={focused} />
            ),
          }}
        />
        <Tabs.Screen
          name="list"
          options={{
            title: 'List',
            tabBarIcon: ({ focused }) => (
              <TabIcon icon="📋" label="List" focused={focused} />
            ),
          }}
        />
        <Tabs.Screen
          name="saved"
          options={{
            title: 'Saved',
            tabBarIcon: ({ focused }) => (
              <TabIcon icon="♥" label="Saved" focused={focused} />
            ),
          }}
        />
      </Tabs>
    </>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#fdfaf4',
    borderTopColor: 'rgba(30,30,20,0.1)',
    borderTopWidth: 1,
    height: 72,
    paddingBottom: 12,
  },
  tabIcon: {
    alignItems: 'center',
    gap: 2,
  },
  icon: {
    fontSize: 22,
    opacity: 0.4,
  },
  iconFocused: {
    opacity: 1,
  },
  label: {
    fontSize: 10,
    color: '#888880',
    fontWeight: '500',
  },
  labelFocused: {
    color: '#3d7a35',
  },
});
