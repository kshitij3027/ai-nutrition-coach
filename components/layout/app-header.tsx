"use client";

import { Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { SignOutButton, useUser } from "@clerk/nextjs";
import { MainNav } from "./main-nav";
import Link from "next/link";

export function AppHeader() {
  const { user } = useUser();

  const initials = (user?.firstName?.[0] || "") + (user?.lastName?.[0] || "");

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white shadow-sm">
      <div className="container mx-auto flex h-14 sm:h-16 items-center justify-between px-4 sm:px-6 max-w-7xl">
        {/* Logo */}
        <Link href="/dashboard" className="flex items-center gap-2 transition-opacity hover:opacity-80">
          <Activity className="h-5 w-5 sm:h-6 sm:w-6 text-[#16a34a]" />
          <span className="text-lg sm:text-xl font-bold text-gray-900">NutriCoach AI</span>
        </Link>

        {/* Center Navigation */}
        <MainNav />

        {/* Right Section */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-9 w-9 sm:h-10 sm:w-10 rounded-full transition-transform hover:scale-105">
                <Avatar className="h-9 w-9 sm:h-10 sm:w-10">
                  <AvatarFallback className="bg-[#16a34a] text-white text-sm">
                    {initials}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>
                {user?.firstName} {user?.lastName}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/settings">Settings</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <SignOutButton>
                  <button className="w-full text-left">Sign Out</button>
                </SignOutButton>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
