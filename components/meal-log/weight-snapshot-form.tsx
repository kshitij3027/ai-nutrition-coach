"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2, AlertCircle } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { weightFormSchema, type WeightFormInput } from "@/lib/validations/weight";
import { getUserTimezone } from "@/lib/utils/timezone";

export function WeightSnapshotForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<WeightFormInput>({
    resolver: zodResolver(weightFormSchema),
    defaultValues: {
      weight_value: undefined,
      weight_unit_hint: "kg",
    },
  });

  async function onSubmit(data: WeightFormInput) {
    setIsSubmitting(true);

    try {
      const timezone = getUserTimezone();

      const response = await fetch("/api/weight/log", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          weight_value: data.weight_value,
          weight_unit_hint: data.weight_unit_hint,
          recorded_at: new Date().toISOString(),
          timezone: timezone,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to log weight");
      }

      toast.success("Weight recorded successfully!");
      reset(); // Clear form
    } catch (err) {
      console.error("Weight logging error:", err);
      toast.error(err instanceof Error ? err.message : "Failed to log weight. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card className="p-4 sm:p-6">
      <div className="space-y-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-semibold">Record Weight Snapshots</h2>
          <p className="text-sm text-gray-600 mt-1">Add a quick weight entry for today.</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Weight Value */}
          <div className="space-y-2">
            <Label htmlFor="weight_value">
              Weight <span className="text-red-500">*</span>
            </Label>
            <Input
              id="weight_value"
              type="number"
              step="0.01"
              placeholder="Enter your weight"
              {...register("weight_value", {
                setValueAs: (v) => (v === "" ? undefined : parseFloat(v)),
              })}
              disabled={isSubmitting}
            />
            {errors.weight_value && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.weight_value.message}
              </p>
            )}
          </div>

          {/* Weight Unit */}
          <div className="space-y-2">
            <Label htmlFor="weight_unit_hint">
              Unit <span className="text-red-500">*</span>
            </Label>
            <select
              id="weight_unit_hint"
              {...register("weight_unit_hint")}
              className="flex h-12 w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
              disabled={isSubmitting}
            >
              <option value="kg">Kilograms (kg)</option>
              <option value="lbs">Pounds (lbs)</option>
            </select>
            {errors.weight_unit_hint && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.weight_unit_hint.message}
              </p>
            )}
            <p className="text-xs text-gray-500">
              Unit is recorded per entry (not a global preference).
            </p>
          </div>

          {/* Helper Text */}
          <p className="text-xs text-gray-500">
            Back-dating and future logging are not supported.
          </p>

          {/* Submit Button */}
          <div className="flex justify-end">
            <Button
              type="submit"
              variant="outline"
              disabled={isSubmitting}
              className="min-w-[140px]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Weight"
              )}
            </Button>
          </div>
        </form>
      </div>
    </Card>
  );
}
