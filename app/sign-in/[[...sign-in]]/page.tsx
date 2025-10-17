"use client";

import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-[#f6f8f7] flex items-center justify-center p-4">
      <SignIn
        appearance={{
          elements: {
            rootBox: "mx-auto",
            card: "bg-white shadow-lg rounded-xl border border-[#dce5df]",
            headerTitle: "text-[#111714] text-[32px] font-bold",
            headerSubtitle: "text-[#111714] text-base",
            socialButtonsBlockButton:
              "border border-[#dce5df] rounded-lg h-14 hover:bg-gray-50 transition-colors",
            socialButtonsBlockButtonText: "text-[#111714] font-medium",
            formButtonPrimary:
              "bg-[#4CAF50] hover:bg-[#45a049] text-white rounded-lg h-14 font-medium transition-colors",
            formFieldInput:
              "rounded-lg border-[#dce5df] focus:ring-2 focus:ring-[#4CAF50]/50 h-14 px-4",
            formFieldLabel: "text-[#111714] font-medium mb-2",
            footerActionLink: "text-[#4CAF50] hover:text-[#45a049] font-medium",
            identityPreviewText: "text-[#111714]",
            identityPreviewEditButton: "text-[#4CAF50] hover:text-[#45a049]",
            formFieldAction: "text-[#4CAF50] hover:text-[#45a049]",
            dividerLine: "bg-[#dce5df]",
            dividerText: "text-[#648772]",
            footer: "hidden",
            logoBox: "h-16 flex items-center justify-center mb-2",
            logoImage: "h-14 w-14",
          },
          layout: {
            logoPlacement: "inside",
            socialButtonsPlacement: "bottom",
            socialButtonsVariant: "blockButton",
          },
        }}
        redirectUrl="/dashboard"
        afterSignInUrl="/dashboard"
        signUpUrl="/sign-up"
      />
    </div>
  );
}
