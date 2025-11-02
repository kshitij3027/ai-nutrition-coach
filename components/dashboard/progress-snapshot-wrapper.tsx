"use client";

import { DashboardMetricsProvider } from "./dashboard-metrics-provider";
import { ProgressSnapshot } from "./progress-snapshot";

export function ProgressSnapshotWrapper() {
  return (
    <DashboardMetricsProvider>
      {(metrics, isLoading) => (
        <ProgressSnapshot metrics={metrics} isLoading={isLoading} />
      )}
    </DashboardMetricsProvider>
  );
}
