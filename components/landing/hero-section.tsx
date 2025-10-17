import Link from "next/link";
import { Button } from "@/components/ui/button";

interface HeroSectionProps {
  className?: string;
}

export function HeroSection({ className = "" }: HeroSectionProps) {
  return (
    <section
      className={`relative w-full min-h-[600px] flex items-center justify-center bg-gradient-to-br from-[#112117] via-[#1a3526] to-[#112117] ${className}`}
    >
      {/* Background overlay pattern */}
      <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-10"></div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-20 text-center">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 max-w-4xl mx-auto">
          Discover the Impact of Your Meals
        </h1>
        <p className="text-lg md:text-xl text-gray-200 mb-8 max-w-2xl mx-auto">
          Chat with our AI to simulate how your food choices affect your body.
        </p>
        <Button
          size="lg"
          asChild
          className="bg-[#20df6c] hover:bg-[#1bc75f] text-white text-lg px-8 py-6"
        >
          <Link href="/onboarding">Start Your Free Trial</Link>
        </Button>
      </div>

      {/* Decorative gradient orbs */}
      <div className="absolute top-20 left-20 w-64 h-64 bg-[#20df6c] rounded-full blur-3xl opacity-20"></div>
      <div className="absolute bottom-20 right-20 w-64 h-64 bg-[#20df6c] rounded-full blur-3xl opacity-20"></div>
    </section>
  );
}
