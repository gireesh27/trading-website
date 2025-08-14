"use client";
import react from "react";
import CommunityPage from "@/components/Community/Reddit";
import RedditImageFeed from "@/components/Community/Images";
import Loader from "@/components/loader";
import { useAuth } from "@/contexts/auth-context";
export default function Community() {
    const { user, isLoading: authLoading } = useAuth();
  if (authLoading || !user) {
    return (
      <div className="bg-[#131722] flex flex-col items-center justify-center pt-20">
        <Loader />
      </div>
    );
  }
  return (
    <div className="w-full bg-gradient ">
      <CommunityPage />
    </div>
  );
}
