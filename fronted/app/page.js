"use client";

import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import ChatInterface from "../components/chat/ChatInterface";
import { Loader2 } from "lucide-react";

export default function Home() {
  const { isAuthenticated } = useSelector((state) => state.auth);
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Check local storage for token on mount since Redux Provider may be slightly delayed
    const token = localStorage.getItem("token");
    if (!isAuthenticated && !token) {
      router.push("/login");
    } else {
      setIsChecking(false);
    }
  }, [isAuthenticated, router]);

  if (isChecking || !isAuthenticated) {
    return (
      <div className="flex h-screen items-center justify-center bg-stone-50">
        <Loader2 className="w-8 h-8 animate-spin text-stone-500" />
      </div>
    );
  }

  return <ChatInterface />;
}
