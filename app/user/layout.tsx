"use client";

import { useEffect,useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth.store";
import Sidebar from "@/components/Layout/userSidebar";

export default function UserLayout({children,}: {children: React.ReactNode;}) {
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [isAnimating, setIsAnimating] = useState<boolean>(false);
  const router = useRouter();
  const { user,token, isAuthenticated,pendingVerification,initialize,} = useAuthStore();

useEffect((): (() => void) => {
  const handleResize = (): void => {
    setIsMobile(window.innerWidth < 1024);
  };

  handleResize(); // Initial check

  window.addEventListener("resize", handleResize);

  return (): void => {
    window.removeEventListener("resize", handleResize);
  };
}, []);

const handleSidebarToggle = (): void => {
  if (isAnimating) return;

  setIsAnimating(true);
  setSidebarOpen((prev) => !prev);

  // Reset animation state after animation completes
  window.setTimeout((): void => {
    setIsAnimating(false);
  }, 700); // must match sidebar animation duration
};

  useEffect(() => {
    // 🔄 Rehydrate & validate session on refresh
    initialize();

    // 1️⃣ Not authenticated → login
    if (!token || !isAuthenticated) {
      router.replace("/login");
      return;
    }

    // 2️⃣ OTP ONLY if registration is incomplete
    if (pendingVerification) {
      router.replace("/register");
      return;}

    // 3️⃣ Wrong role → unauthorized
    if (user?.role !== "user") {
      router.replace("/login");
      return;}
  }, [token,isAuthenticated,pendingVerification,user,initialize,router,]);

  // ⛔ Block rendering until checks pass
  if (!token ||!isAuthenticated || pendingVerification ||user?.role !== "user"
  ) {
    return null; // You can render a loader here
  }

  return (
    <section className="flex min-h-screen h-screen w-full overflow-hidden">
      <Sidebar
        sidebarOpen={sidebarOpen}
        isMobile={isMobile}
        setSidebarOpen={setSidebarOpen}
      />

      <main className="flex-1 flex flex-col h-full overflow-hidden transition-all duration-700 ease-in-out">
        {children}
      </main>
    </section>
  );
}
