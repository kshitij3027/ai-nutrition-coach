"use client";

import { useEffect, useState } from "react";
import { getUserTimezone } from "@/lib/utils/timezone";
import type { DashboardMetrics } from "@/lib/services/dashboard-data";

interface DashboardMetricsProviderProps {
  children: (metrics: DashboardMetrics | null, isLoading: boolean) => React.ReactNode;
}

export function DashboardMetricsProvider({ children }: DashboardMetricsProviderProps) {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchMetrics() {
      try {
        const timezone = getUserTimezone();

        const response = await fetch(
          `/api/dashboard/metrics?timezone=${encodeURIComponent(timezone)}`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch dashboard metrics");
        }

        const data = await response.json();

        // Debug logging
        console.log('🔍 [Provider] Raw API Response:', {
          success: data.success,
          hasMetrics: !!data.metrics,
          fullResponse: data,
        });
        console.log('🔍 [Provider] Metrics values:', {
          calories_today: data.metrics?.calories_today,
          entries_today: data.metrics?.entries_today,
          current_streak: data.metrics?.current_streak,
          weight_trend_length: data.metrics?.weight_trend_7d?.length || 0,
        });

        // Extract metrics from API response and transform weight trend data
        if (data.metrics) {
          const transformedMetrics: DashboardMetrics = {
            ...data.metrics,
            weight_trend_7d: data.metrics.weight_trend_7d?.map((item: {
              date: string;
              weight_kg: number;
              original_value: number;
              original_unit: string;
            }) => ({
              date: item.date,
              weight: item.weight_kg,
              unit: item.original_unit,
            })) || [],
          };
          console.log('🔍 [Provider] Transformed metrics:', transformedMetrics);
          setMetrics(transformedMetrics);
        } else {
          setMetrics(data);
        }
      } catch (error) {
        console.error("Error fetching dashboard metrics:", error);
        // Set null on error so we show empty state
        setMetrics(null);
      } finally {
        setIsLoading(false);
      }
    }

    fetchMetrics();

    // Refetch on window focus for real-time updates
    const handleFocus = () => {
      fetchMetrics();
    };

    window.addEventListener("focus", handleFocus);

    return () => {
      window.removeEventListener("focus", handleFocus);
    };
  }, []);

  return <>{children(metrics, isLoading)}</>;
}
