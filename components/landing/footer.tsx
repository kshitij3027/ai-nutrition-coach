interface FooterProps {
  className?: string;
}

export function Footer({ className = "" }: FooterProps) {
  return (
    <footer className={`w-full border-t bg-white dark:bg-background-dark-custom ${className}`}>
      <div className="container mx-auto px-4 py-8">
        {/* Top Row */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-6">
          {/* Logo and Copyright */}
          <div className="flex items-center gap-2">
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
            <span className="text-sm text-muted-foreground">
              © 2024 NutriCoach AI. All rights reserved.
            </span>
          </div>
        </div>

        {/* Bottom Row - Links */}
        <div className="flex flex-col md:flex-row items-center justify-center gap-6 pt-6 border-t">
          <a
            href="#"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Terms of Service
          </a>
          <a
            href="#"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Privacy Policy
          </a>
        </div>
      </div>
    </footer>
  );
}
