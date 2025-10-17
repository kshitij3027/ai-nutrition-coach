"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { useAuth, UserButton } from "@clerk/nextjs";

interface HeaderProps {
  className?: string;
}

export function Header({ className = "" }: HeaderProps) {
  const { isLoaded, userId } = useAuth();

  return (
    <header className={`w-full border-b bg-white dark:bg-background-dark-custom ${className}`}>
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo and Brand */}
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-[#20df6c] flex items-center justify-center">
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle cx="10" cy="10" r="8" fill="white" opacity="0.9" />
            </svg>
          </div>
          <span className="text-xl font-bold text-foreground">NutriCoach AI</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          <a
            href="#features"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Features
          </a>
          <a
            href="#how-it-works"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            How it Works
          </a>
          <a
            href="#pricing"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Pricing
          </a>
        </nav>

        {/* CTA Buttons / User Menu */}
        <div className="hidden md:flex items-center gap-3">
          {!isLoaded ? (
            // Show nothing while loading to prevent layout shift
            <div className="w-32 h-10" />
          ) : userId ? (
            // Show user button when authenticated
            <UserButton
              appearance={{
                elements: {
                  avatarBox: "w-10 h-10",
                },
              }}
            />
          ) : (
            // Show login buttons when not authenticated
            <>
              <Button variant="outline" asChild>
                <Link href="/sign-in">Login</Link>
              </Button>
              <Button
                asChild
                className="bg-[#20df6c] hover:bg-[#1bc75f] text-white"
              >
                <Link href="/sign-in">Start Your Free Trial</Link>
              </Button>
            </>
          )}
        </div>

        {/* Mobile Menu Icon */}
        <button
          className="md:hidden p-2"
          aria-label="Toggle menu"
        >
          <Menu className="w-6 h-6" />
        </button>
      </div>
    </header>
  );
}
