"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Image from "next/image";
import { Camera, Sparkles, Loader2, X, AlertCircle } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert } from "@/components/ui/alert";

import { mealFormSchema, type MealFormInput } from "@/lib/validations/meal";
import type { MealTypePreset } from "@/lib/types/meal";
import { getUserTimezone } from "@/lib/utils/timezone";

export function LogMealForm() {
  const router = useRouter();
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [detectionConfidence, setDetectionConfidence] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<MealFormInput>({
    resolver: zodResolver(mealFormSchema),
    defaultValues: {
      description: "",
      meal_type: "Lunch",
      calories: null,
    },
  });

  const mealType = watch("meal_type");

  // Photo upload handler with AI detection
  async function handlePhotoUpload(file: File) {
    const startTime = Date.now();

    console.log('Client: Starting photo upload', {
      fileName: file.name,
      fileSize: file.size,
      fileSizeKB: Math.round(file.size / 1024),
      fileType: file.type,
    });

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      console.error('Client: File too large', {
        fileSize: file.size,
        maxSize: 5 * 1024 * 1024,
      });
      toast.error("Image must be under 5MB");
      return;
    }

    // Validate file type
    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/heic"];
    if (!validTypes.includes(file.type)) {
      console.error('Client: Invalid file type', {
        fileType: file.type,
        validTypes,
      });
      toast.error("Please upload a JPG, PNG, WebP, or HEIC image");
      return;
    }

    // Show preview
    setImagePreview(URL.createObjectURL(file));

    // Start analysis
    setIsAnalyzing(true);
    setError(null);

    try {
      // Call detection API
      console.log('Client: Calling detection API');
      const formData = new FormData();
      formData.append("image", file);

      const detectionResponse = await fetch("/api/food-detection/analyze", {
        method: "POST",
        body: formData,
      });

      const detectionDuration = Date.now() - startTime;
      console.log('Client: Detection response received', {
        status: detectionResponse.status,
        statusText: detectionResponse.statusText,
        duration: `${detectionDuration}ms`,
      });

      if (!detectionResponse.ok) {
        console.error('Client: Detection API error', {
          status: detectionResponse.status,
          statusText: detectionResponse.statusText,
          duration: `${detectionDuration}ms`,
        });
        throw new Error("Failed to analyze image");
      }

      const detectionResult = await detectionResponse.json();

      console.log('Client: Detection result', {
        success: detectionResult.success,
        itemCount: detectionResult.items?.length || 0,
        items: detectionResult.items?.map((i: { name: string; confidence: number }) => ({
          name: i.name,
          confidence: i.confidence,
        })),
        message: detectionResult.message,
      });

      if (!detectionResult.success) {
        console.warn('Client: No food detected', {
          message: detectionResult.message,
          duration: `${Date.now() - startTime}ms`,
        });
        toast.error(detectionResult.message || "No food detected. Please try another photo or enter manually.");
        setIsAnalyzing(false);
        return;
      }

      // Refine with LLM
      console.log('Client: Calling refinement API', {
        itemCount: detectionResult.items.length,
      });
      const refinedResponse = await fetch("/api/food-detection/refine", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          detectedItems: detectionResult.items,
          currentTime: new Date().toISOString(),
        }),
      });

      const refinementDuration = Date.now() - startTime - detectionDuration;
      console.log('Client: Refinement response received', {
        status: refinedResponse.status,
        statusText: refinedResponse.statusText,
        duration: `${refinementDuration}ms`,
      });

      if (!refinedResponse.ok) {
        console.error('Client: Refinement API error', {
          status: refinedResponse.status,
          statusText: refinedResponse.statusText,
          duration: `${refinementDuration}ms`,
        });
        throw new Error("Failed to refine detection");
      }

      const refined = await refinedResponse.json();

      const totalDuration = Date.now() - startTime;
      console.log('Client: Refinement result', {
        description: refined.description,
        totalCalories: refined.total_calories,
        suggestedMealType: refined.suggested_meal_type,
        confidence: refined.confidence,
        totalDuration: `${totalDuration}ms`,
      });

      // Auto-populate form
      setValue("description", refined.description);
      setValue("calories", refined.total_calories);
      setValue("meal_type", refined.suggested_meal_type as MealTypePreset);
      setDetectionConfidence(refined.confidence);

      // Show success message
      console.log('Client: Photo analysis completed successfully', {
        totalDuration: `${totalDuration}ms`,
        confidence: refined.confidence,
      });
      toast.success(`Food detected! (${refined.confidence}% confident) - You can edit before saving.`);
    } catch (err) {
      const totalDuration = Date.now() - startTime;
      console.error('Client: Photo analysis failed', {
        error: err instanceof Error ? err.message : String(err),
        stack: err instanceof Error ? err.stack : undefined,
        totalDuration: `${totalDuration}ms`,
      });
      toast.error("Failed to analyze image. Please enter meal details manually.");
    } finally {
      setIsAnalyzing(false);
    }
  }

  // Form submission handler
  async function onSubmit(data: MealFormInput) {
    const startTime = Date.now();

    console.log('Client: Submitting meal', {
      description: data.description,
      mealType: data.meal_type,
      calories: data.calories,
      hasImage: !!imagePreview,
      confidence: detectionConfidence,
    });

    setIsSubmitting(true);
    setError(null);

    try {
      const timezone = getUserTimezone();

      const response = await fetch("/api/meals/log", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          description: data.description,
          meal_type: data.meal_type,
          calories: data.calories,
          consumed_at: new Date().toISOString(),
          timezone: timezone,
        }),
      });

      const submitDuration = Date.now() - startTime;
      console.log('Client: Meal submission response', {
        status: response.status,
        statusText: response.statusText,
        duration: `${submitDuration}ms`,
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Client: Meal submission failed', {
          status: response.status,
          error: errorData.error,
          duration: `${submitDuration}ms`,
        });
        throw new Error(errorData.error || "Failed to log meal");
      }

      const totalDuration = Date.now() - startTime;
      console.log('Client: Meal logged successfully', {
        totalDuration: `${totalDuration}ms`,
      });

      // Clear preview
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }

      // Navigate to success page
      router.push("/meal-log/success");
    } catch (err) {
      const totalDuration = Date.now() - startTime;
      console.error('Client: Meal logging failed', {
        error: err instanceof Error ? err.message : String(err),
        stack: err instanceof Error ? err.stack : undefined,
        totalDuration: `${totalDuration}ms`,
      });
      setError(err instanceof Error ? err.message : "Failed to log meal");
      toast.error("Failed to log meal. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  // Remove photo
  function handleRemovePhoto() {
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }
    setImagePreview(null);
    setDetectionConfidence(null);
  }

  // Get meal type badge color
  function getMealTypeBadgeColor(type: MealTypePreset) {
    switch (type) {
      case "Breakfast":
        return "bg-yellow-500 text-white hover:bg-yellow-600";
      case "Lunch":
        return "bg-blue-500 text-white hover:bg-blue-600";
      case "Dinner":
        return "bg-purple-500 text-white hover:bg-purple-600";
      case "Snack":
        return "bg-orange-500 text-white hover:bg-orange-600";
    }
  }

  return (
    <Card className="p-4 sm:p-6">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 sm:space-y-6">
        {/* Error Alert */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <div>
              <h3 className="font-semibold">Error</h3>
              <p className="text-sm">{error}</p>
            </div>
          </Alert>
        )}

        {/* Photo Upload Section */}
        <div className="space-y-2">
          <Label>Photo (Optional)</Label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-green-500 transition-colors">
            {!imagePreview ? (
              <>
                <Camera className="w-12 h-12 mx-auto text-gray-400 mb-2" />
                <p className="text-sm text-gray-600 mb-1">Upload a photo to auto-detect food</p>
                <p className="text-xs text-gray-500 mb-3">Max 5MB • JPG, PNG, WebP, HEIC</p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => e.target.files?.[0] && handlePhotoUpload(e.target.files[0])}
                  className="hidden"
                  id="photo-upload"
                  disabled={isAnalyzing || isSubmitting}
                />
                <label htmlFor="photo-upload">
                  <Button
                    type="button"
                    variant="outline"
                    className="cursor-pointer"
                    disabled={isAnalyzing || isSubmitting}
                    asChild
                  >
                    <span>Choose Photo</span>
                  </Button>
                </label>
              </>
            ) : (
              <>
                {/* Image Preview */}
                <div className="relative">
                  <Image
                    src={imagePreview}
                    alt="Meal preview"
                    width={800}
                    height={192}
                    className="w-full h-48 object-cover rounded-md"
                    unoptimized
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={handleRemovePhoto}
                    disabled={isAnalyzing || isSubmitting}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>

                {/* Analysis State */}
                {isAnalyzing && (
                  <div className="mt-3 flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm text-gray-600">Analyzing food...</span>
                  </div>
                )}

                {/* Confidence Badge */}
                {detectionConfidence && !isAnalyzing && (
                  <Badge variant="secondary" className="mt-3">
                    <Sparkles className="w-3 h-3 mr-1" />
                    AI detected ({detectionConfidence}% confident)
                  </Badge>
                )}
              </>
            )}
          </div>
          <p className="text-xs text-gray-500">
            Photo is for detection only and won&apos;t be saved. Only your description will be stored.
          </p>
        </div>

        {/* AI-populated fields indicator */}
        {detectionConfidence && !isAnalyzing && (
          <div className="flex items-center gap-2 text-xs text-green-600 bg-green-50 p-2 rounded-md">
            <Sparkles className="w-4 h-4" />
            <span>Fields auto-filled by AI - feel free to edit before saving</span>
          </div>
        )}

        {/* Description Field */}
        <div className="space-y-2">
          <Label htmlFor="description">
            Meal Description <span className="text-red-500">*</span>
          </Label>
          <Textarea
            id="description"
            placeholder="Describe your meal, e.g., 'Grilled chicken breast with steamed broccoli and brown rice'"
            rows={3}
            {...register("description")}
            disabled={isSubmitting}
          />
          {errors.description && (
            <p className="text-sm text-red-500 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              {errors.description.message}
            </p>
          )}
          <p className="text-xs text-gray-500">1-500 characters</p>
        </div>

        {/* Meal Type Field */}
        <div className="space-y-2">
          <Label htmlFor="meal_type">
            Meal Type <span className="text-red-500">*</span>
          </Label>
          <select
            id="meal_type"
            {...register("meal_type")}
            className="flex h-12 w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
            disabled={isSubmitting}
          >
            <option value="Breakfast">Breakfast</option>
            <option value="Lunch">Lunch</option>
            <option value="Dinner">Dinner</option>
            <option value="Snack">Snack</option>
          </select>
          {mealType && (
            <Badge className={getMealTypeBadgeColor(mealType as MealTypePreset)}>
              {mealType}
            </Badge>
          )}
          {errors.meal_type && (
            <p className="text-sm text-red-500 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              {errors.meal_type.message}
            </p>
          )}
        </div>

        {/* Calories Field */}
        <div className="space-y-2">
          <Label htmlFor="calories">Calories (Optional)</Label>
          <Input
            id="calories"
            type="number"
            placeholder="e.g., 500"
            {...register("calories", {
              setValueAs: (v) => {
                if (v === "" || v === null || v === undefined) return null;
                const parsed = parseFloat(v);
                return isNaN(parsed) ? null : parsed;
              },
            })}
            disabled={isSubmitting}
          />
          {errors.calories && (
            <p className="text-sm text-red-500 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              {errors.calories.message}
            </p>
          )}
          <p className="text-xs text-gray-500">Leave empty if you don&apos;t know</p>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          className="w-full h-12 bg-green-600 hover:bg-green-700 text-white"
          disabled={isSubmitting || isAnalyzing}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Logging Meal...
            </>
          ) : (
            "Log Meal"
          )}
        </Button>
      </form>
    </Card>
  );
}
