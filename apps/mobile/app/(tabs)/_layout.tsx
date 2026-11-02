import { Tabs } from "expo-router";
import { useColorScheme } from "react-native";
import { Layout, Search, SquarePlus, Inbox, User } from "lucide-react-native";

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#ececec",
        tabBarShowLabel: false,
        tabBarItemStyle: { width: 80, alignItems: "center" },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ focused }: { focused: boolean }) => (
            <Layout
              size={22}
              strokeWidth={2}
              color={focused ? "#ececec" : "#8b8b8b"}
            />
          ),
          title: "Home",
        }}
      />
      <Tabs.Screen
        name="discover"
        options={{
          tabBarIcon: ({ focused }: { focused: boolean }) => (
            <Search
              size={22}
              strokeWidth={2}
              color={focused ? "#ececec" : "#8b8b8b"}
            />
          ),
          title: "Discover",
        }}
      />
      <Tabs.Screen
        name="create"
        options={{
          tabBarIcon: ({ focused }: { focused: boolean }) => (
            <SquarePlus
              size={22}
              strokeWidth={2}
              color={focused ? "#ececec" : "#8b8b8b"}
            />
          ),
          title: "Create",
        }}
      />
      <Tabs.Screen
        name="inbox"
        options={{
          tabBarIcon: ({ focused }: { focused: boolean }) => (
            <Inbox
              size={22}
              strokeWidth={2}
              color={focused ? "#ececec" : "#8b8b8b"}
            />
          ),
          title: "Inbox",
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ focused }: { focused: boolean }) => (
            <User
              size={22}
              strokeWidth={2}
              color={focused ? "#ececec" : "#8b8b8b"}
            />
          ),
          title: "Profile",
        }}
      />
    </Tabs>
  );
}
