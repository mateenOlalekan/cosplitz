"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth.store";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  const {
    user,
    token,
    isAuthenticated,
    pendingVerification,
    initialize,
  } = useAuthStore();

  useEffect(() => {
    // 🔄 Rehydrate auth state on refresh
    initialize();

    // 1️⃣ Not authenticated → login
    if (!token || !isAuthenticated) {
      router.replace("/login");
      return;
    }

    // 2️⃣ OTP ONLY during registration flow
    if (pendingVerification) {
      router.replace("/verify-otp");
      return;
    }

    // 3️⃣ Not admin → block
    if (user?.role !== "admin") {
      router.replace("/unauthorized");
      return;
    }
  }, [
    token,
    isAuthenticated,
    pendingVerification,
    user,
    initialize,
    router,
  ]);

  // ⛔ Block render until all checks pass
  if (
    !token ||
    !isAuthenticated ||
    pendingVerification ||
    user?.role !== "admin"
  ) {
    return null; // replace with loader if needed
  }

  return (
    <section className="min-h-screen flex">
      {/* 🔐 Admin Sidebar */}
      <aside className="w-64 border-r p-4">
        <h2 className="font-semibold text-lg">Admin Dashboard</h2>
        {/* admin navigation */}
      </aside>

      {/* 🧠 Admin Content */}
      <main className="flex-1 p-6">
        {children}
      </main>
    </section>
  );
}
