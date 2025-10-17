"use client";

import { useEffect } from "react";

export function SyncProfile() {
  useEffect(() => {
    const syncProfile = async () => {
      try {
        const response = await fetch("/api/sync-profile", {
          method: "POST",
        });

        if (!response.ok) {
          console.error("Failed to sync profile:", await response.text());
        }
      } catch (error) {
        console.error("Error syncing profile:", error);
      }
    };

    syncProfile();
  }, []);

  return null;
}
