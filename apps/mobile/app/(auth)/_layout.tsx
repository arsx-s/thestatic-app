import { Stack } from "expo-router";
import { useEffect } from "react";
import { useAuthStore } from "../../src/store/auth";
import { supabase } from "../../src/lib/supabase";

export default function AuthLayout() {
  const { member, clearSession } = useAuthStore();

  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        if (data.session?.access_token && member) {
          // Already have a session in store
          return;
        }
        if (data.session?.access_token) {
          const { data: userData } = await supabase.auth.getUser();
          if (userData.user) {
            // Membership state resolved from members table via protected function
          }
        }
      } catch {
        // No session
      }
    };
    void checkSession();
  }, [member]);

  return (
    <Stack>
      <Stack.Screen name="login" />
      <Stack.Screen name="forgot-password" />
      <Stack.Screen name="account-recovery" />
      <Stack.Screen name="device-verification" />
    </Stack>
  );
}
