"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Input, Label } from "@/components/ui";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/lib/auth";

export default function PasswordChangePage() {
  const router = useRouter();
  const { clearSession } = useAuthStore();
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const validatePassword = (password: string): string | null => {
    if (!password || password.length < 8) {
      return "Password must be at least 8 characters";
    }
    if (!/[A-Z]/.test(password)) {
      return "Password must contain at least one uppercase letter";
    }
    if (!/[a-z]/.test(password)) {
      return "Password must contain at least one lowercase letter";
    }
    if (!/[0-9]/.test(password)) {
      return "Password must contain at least one number";
    }
    if (!/[^A-Za-z0-9]/.test(password)) {
      return "Password must contain at least one special character";
    }
    return null;
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (!oldPassword) {
      setError("Please enter your current/temporary password.");
      return;
    }

    const newPasswordError = validatePassword(newPassword);
    if (newPasswordError) {
      setError(newPasswordError);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match.");
      return;
    }

    if (oldPassword === newPassword) {
      setError("New password must be different from your current password.");
      return;
    }

    setLoading(true);
    try {
      const res = await supabase.functions.invoke("change-password", {
        body: { old_password: oldPassword, new_password: newPassword },
      });

      if (res.error) {
        throw new Error(res.error.message || "Failed to change password");
      }

      setSuccess(true);
      setLoading(false);

      // Redirect to home after a brief delay to show success
      setTimeout(() => {
        router.push("/home");
        router.refresh();
      }, 1500);
    } catch (err: any) {
      setError(err.message || "Password change failed");
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-full flex items-center justify-center bg-[#070707] p-6">
        <div className="w-full max-w-[400px] text-center">
          <div className="text-[#ececec] font-Space-Grotesk font-bold text-[16px] mb-2">
            Password changed successfully
          </div>
          <p className="font-IBM-Plex-Mono text-[#8b8b8b] text-[13px] mb-6">
            You can now access The Static with your new password.
          </p>
          <Button
            variant="primary"
            className="w-full"
            onClick={() => {
              router.push("/home");
              router.refresh();
            }}
          >
            Continue to The Static
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full flex items-center justify-center bg-[#070707] p-6">
      <div className="w-full max-w-[400px]">
        <div className="text-[#ececec] font-Space-Grotesk font-bold text-[16px] mb-2">
          Change your password
        </div>
        <p className="font-IBM-Plex-Mono text-[#8b8b8b] text-[13px] mb-6 text-center">
          Please set a new permanent password. Your temporary password will no
          longer work after this change.
        </p>
        <form onSubmit={handleChangePassword} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label>Current / Temporary Password</Label>
            <Input
              type="password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              placeholder="Enter your temporary password"
              autoComplete="current-password"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label>New Password</Label>
            <Input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="At least 8 characters, with uppercase, lowercase, number, and symbol"
              autoComplete="new-password"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label>Confirm New Password</Label>
            <Input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm your new password"
              autoComplete="new-password"
            />
          </div>
          {error && (
            <p className="text-[#ffffff] font-IBM-Plex-Mono text-[12px] mb-3">
              {error}
            </p>
          )}
          <Button
            type="submit"
            disabled={loading}
            variant="primary"
            className="w-full"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-current rounded-full animate-spin" />
                Changing...
              </span>
            ) : (
              "Change Password"
            )}
          </Button>
        </form>
        <div className="mt-6 text-center">
          <Button
            variant="ghost"
            className="w-full"
            onClick={() => {
              clearSession();
              router.push("/login");
              router.refresh();
            }}
          >
            Cancel and log out
          </Button>
        </div>
      </div>
    </div>
  );
}
