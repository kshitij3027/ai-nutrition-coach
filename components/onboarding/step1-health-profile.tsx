"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Info } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

import {
  healthProfileSchema,
  type HealthProfileFormData,
} from "@/lib/validations/onboarding"
import {
  cmToFeetInches,
  feetInchesToCm,
  kgToLbs,
  lbsToKg,
  getActivityLevelLabel,
} from "@/lib/utils/onboarding"
import type { UnitSystem } from "@/lib/types/onboarding"

interface Step1HealthProfileProps {
  onSubmit: (data: HealthProfileFormData) => Promise<void>
  defaultValues?: Partial<HealthProfileFormData>
  isLoading?: boolean
}

export function Step1HealthProfile({
  onSubmit,
  defaultValues,
  isLoading = false,
}: Step1HealthProfileProps) {
  const [unitSystem, setUnitSystem] = React.useState<UnitSystem>(
    defaultValues?.unit_system || "metric"
  )

  // For imperial height display
  const [heightFeet, setHeightFeet] = React.useState<number>(5)
  const [heightInches, setHeightInches] = React.useState<number>(0)

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    setValue,
    watch,
  } = useForm<HealthProfileFormData>({
    resolver: zodResolver(healthProfileSchema),
    mode: "onChange",
    defaultValues: {
      full_name: defaultValues?.full_name ?? "",
      age: defaultValues?.age,
      biological_sex: defaultValues?.biological_sex,
      height_cm: defaultValues?.height_cm,
      weight_kg: defaultValues?.weight_kg,
      target_weight_kg: defaultValues?.target_weight_kg ?? null,
      activity_level: defaultValues?.activity_level,
      consent_given: defaultValues?.consent_given ?? false,
      unit_system: unitSystem ?? 'metric',
    },
  })

  const currentHeightCm = watch("height_cm")
  const currentWeightKg = watch("weight_kg")
  const currentTargetWeightKg = watch("target_weight_kg")
  const currentAge = watch("age")
  const consentGiven = watch("consent_given")

  // Initialize imperial height from cm on mount
  React.useEffect(() => {
    if (defaultValues?.height_cm) {
      const { feet, inches } = cmToFeetInches(defaultValues.height_cm)
      setHeightFeet(feet)
      setHeightInches(inches)
    }
  }, [defaultValues?.height_cm])

  // Update height_cm when imperial values change
  React.useEffect(() => {
    if (unitSystem === "imperial") {
      const cm = feetInchesToCm(heightFeet, heightInches)
      setValue("height_cm", cm, { shouldValidate: true })
    }
  }, [heightFeet, heightInches, unitSystem, setValue])

  const handleUnitToggle = () => {
    const newUnit: UnitSystem = unitSystem === "metric" ? "imperial" : "metric"
    setUnitSystem(newUnit)
    setValue("unit_system", newUnit)

    // Convert current values to new unit (for display only - we always store in metric)
    if (newUnit === "imperial" && currentHeightCm) {
      const { feet, inches } = cmToFeetInches(currentHeightCm)
      setHeightFeet(feet)
      setHeightInches(inches)
    } else if (newUnit === "metric") {
      // When switching back to metric, ensure all values are refreshed
      const cm = feetInchesToCm(heightFeet, heightInches)
      setValue("height_cm", cm, { shouldValidate: true })

      // Force update weight fields to trigger re-render of metric inputs
      if (currentWeightKg !== undefined) {
        setValue("weight_kg", currentWeightKg, { shouldValidate: true })
      }
      if (currentTargetWeightKg !== undefined) {
        setValue("target_weight_kg", currentTargetWeightKg, { shouldValidate: true })
      }
    }
  }

  const onFormSubmit = async (data: HealthProfileFormData) => {
    // Ensure we're always submitting metric values
    const submitData: HealthProfileFormData = {
      ...data,
      unit_system: "metric", // This is UI-only, reset to metric for API
    }
    await onSubmit(submitData)
  }

  return (
    <TooltipProvider>
      <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Health Profile</h1>
          <p className="text-muted-foreground">
            Tell us about yourself so we can personalize your nutrition coaching
            experience.
          </p>
        </div>

        {/* Unit System Toggle */}
        <div className="flex items-center justify-end gap-2">
          <Label htmlFor="unit-toggle" className="text-sm text-muted-foreground">
            Unit System:
          </Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleUnitToggle}
            id="unit-toggle"
          >
            {unitSystem === "metric" ? "Metric (cm, kg)" : "Imperial (ft, lbs)"}
          </Button>
        </div>

        {/* Form Fields */}
        <div className="space-y-6">
          {/* Full Name */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label htmlFor="full_name">
                Full Name <span className="text-destructive">*</span>
              </Label>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="size-4 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>We use your name to personalize your coaching experience</p>
                </TooltipContent>
              </Tooltip>
            </div>
            <Input
              id="full_name"
              placeholder="John Doe"
              {...register("full_name")}
              aria-invalid={!!errors.full_name}
              disabled={isLoading}
            />
            {errors.full_name && (
              <p className="text-sm text-destructive">{errors.full_name.message}</p>
            )}
          </div>

          {/* Age */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label htmlFor="age">
                Age <span className="text-destructive">*</span>
              </Label>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="size-4 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Age helps us calculate your nutritional needs accurately</p>
                </TooltipContent>
              </Tooltip>
            </div>
            <Input
              id="age"
              type="number"
              placeholder="25"
              value={currentAge ?? ""}
              onChange={(e) => {
                const value = e.target.value
                setValue("age", (value === "" ? undefined : Number(value)) as number, { shouldValidate: true })
              }}
              aria-invalid={!!errors.age}
              disabled={isLoading}
            />
            {errors.age && (
              <p className="text-sm text-destructive">{errors.age.message}</p>
            )}
          </div>

          {/* Biological Sex */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label>
                Biological Sex <span className="text-destructive">*</span>
              </Label>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="size-4 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Biological sex affects metabolic calculations and nutritional requirements</p>
                </TooltipContent>
              </Tooltip>
            </div>
            <RadioGroup
              onValueChange={(value) =>
                setValue("biological_sex", value as HealthProfileFormData["biological_sex"], {
                  shouldValidate: true,
                })
              }
              defaultValue={defaultValues?.biological_sex}
              disabled={isLoading}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="male" id="male" />
                <Label htmlFor="male" className="font-normal cursor-pointer">
                  Male
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="female" id="female" />
                <Label htmlFor="female" className="font-normal cursor-pointer">
                  Female
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="other" id="other" />
                <Label htmlFor="other" className="font-normal cursor-pointer">
                  Other
                </Label>
              </div>
            </RadioGroup>
            {errors.biological_sex && (
              <p className="text-sm text-destructive">{errors.biological_sex.message}</p>
            )}
          </div>

          {/* Height */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label htmlFor="height">
                Height <span className="text-destructive">*</span>
              </Label>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="size-4 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Height is used to calculate your Body Mass Index (BMI) and caloric needs</p>
                </TooltipContent>
              </Tooltip>
            </div>

            {unitSystem === "metric" ? (
              <div className="flex items-center gap-2">
                <Input
                  id="height"
                  type="number"
                  step="0.1"
                  placeholder="170"
                  value={currentHeightCm ?? ""}
                  onChange={(e) => {
                    const value = e.target.value
                    setValue("height_cm", (value === "" ? undefined : Number(value)) as number, { shouldValidate: true })
                  }}
                  aria-invalid={!!errors.height_cm}
                  disabled={isLoading}
                />
                <span className="text-sm text-muted-foreground whitespace-nowrap">cm</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Input
                  id="height-feet"
                  type="number"
                  placeholder="5"
                  value={heightFeet ?? ""}
                  onChange={(e) => setHeightFeet(Number(e.target.value) || 0)}
                  aria-label="Height in feet"
                  disabled={isLoading}
                />
                <span className="text-sm text-muted-foreground">ft</span>
                <Input
                  id="height-inches"
                  type="number"
                  placeholder="7"
                  value={heightInches ?? ""}
                  onChange={(e) => setHeightInches(Number(e.target.value) || 0)}
                  aria-label="Height in inches"
                  disabled={isLoading}
                />
                <span className="text-sm text-muted-foreground">in</span>
              </div>
            )}
            {errors.height_cm && (
              <p className="text-sm text-destructive">{errors.height_cm.message}</p>
            )}
          </div>

          {/* Weight */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label htmlFor="weight">
                Current Weight <span className="text-destructive">*</span>
              </Label>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="size-4 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Your current weight helps us track progress and calculate nutritional needs</p>
                </TooltipContent>
              </Tooltip>
            </div>

            {unitSystem === "metric" ? (
              <div className="flex items-center gap-2">
                <Input
                  id="weight"
                  type="number"
                  step="0.1"
                  placeholder="70"
                  value={currentWeightKg ?? ""}
                  onChange={(e) => {
                    const value = e.target.value
                    setValue("weight_kg", (value === "" ? undefined : Number(value)) as number, { shouldValidate: true })
                  }}
                  aria-invalid={!!errors.weight_kg}
                  disabled={isLoading}
                />
                <span className="text-sm text-muted-foreground whitespace-nowrap">kg</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Input
                  id="weight"
                  type="number"
                  step="0.1"
                  placeholder="154"
                  value={currentWeightKg != null ? kgToLbs(currentWeightKg).toFixed(1) : ""}
                  onChange={(e) => {
                    const lbs = Number(e.target.value)
                    setValue("weight_kg", lbsToKg(lbs), { shouldValidate: true })
                  }}
                  aria-invalid={!!errors.weight_kg}
                  disabled={isLoading}
                />
                <span className="text-sm text-muted-foreground whitespace-nowrap">lbs</span>
              </div>
            )}
            {errors.weight_kg && (
              <p className="text-sm text-destructive">{errors.weight_kg.message}</p>
            )}
          </div>

          {/* Target Weight */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label htmlFor="target_weight">Target Weight (Optional)</Label>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="size-4 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Your target weight helps us create a personalized nutrition plan</p>
                </TooltipContent>
              </Tooltip>
            </div>

            {unitSystem === "metric" ? (
              <div className="flex items-center gap-2">
                <Input
                  id="target_weight"
                  type="number"
                  step="0.1"
                  placeholder="65"
                  value={currentTargetWeightKg ?? ""}
                  onChange={(e) => {
                    const value = e.target.value
                    setValue("target_weight_kg", (value === "" ? undefined : Number(value)) as number | undefined, { shouldValidate: true })
                  }}
                  aria-invalid={!!errors.target_weight_kg}
                  disabled={isLoading}
                />
                <span className="text-sm text-muted-foreground whitespace-nowrap">kg</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Input
                  id="target_weight"
                  type="number"
                  step="0.1"
                  placeholder="143"
                  value={
                    currentTargetWeightKg != null ? kgToLbs(currentTargetWeightKg).toFixed(1) : ""
                  }
                  onChange={(e) => {
                    const lbs = Number(e.target.value)
                    setValue("target_weight_kg", lbs ? lbsToKg(lbs) : undefined, {
                      shouldValidate: true,
                    })
                  }}
                  aria-invalid={!!errors.target_weight_kg}
                  disabled={isLoading}
                />
                <span className="text-sm text-muted-foreground whitespace-nowrap">lbs</span>
              </div>
            )}
            {errors.target_weight_kg && (
              <p className="text-sm text-destructive">{errors.target_weight_kg.message}</p>
            )}
          </div>

          {/* Activity Level */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label htmlFor="activity_level">
                Activity Level <span className="text-destructive">*</span>
              </Label>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="size-4 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Your activity level helps us calculate your daily caloric needs</p>
                </TooltipContent>
              </Tooltip>
            </div>

            <Select
              onValueChange={(value) =>
                setValue("activity_level", value as HealthProfileFormData["activity_level"], {
                  shouldValidate: true,
                })
              }
              defaultValue={defaultValues?.activity_level}
              disabled={isLoading}
            >
              <SelectTrigger
                id="activity_level"
                className="w-full"
                aria-invalid={!!errors.activity_level}
              >
                <SelectValue placeholder="Select your activity level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sedentary">
                  {getActivityLevelLabel("sedentary")}
                </SelectItem>
                <SelectItem value="lightly_active">
                  {getActivityLevelLabel("lightly_active")}
                </SelectItem>
                <SelectItem value="moderately_active">
                  {getActivityLevelLabel("moderately_active")}
                </SelectItem>
                <SelectItem value="very_active">
                  {getActivityLevelLabel("very_active")}
                </SelectItem>
                <SelectItem value="extremely_active">
                  {getActivityLevelLabel("extremely_active")}
                </SelectItem>
              </SelectContent>
            </Select>
            {errors.activity_level && (
              <p className="text-sm text-destructive">{errors.activity_level.message}</p>
            )}
          </div>

          {/* Consent Checkbox */}
          <div className="space-y-2">
            <div className="flex items-start space-x-2">
              <Checkbox
                id="consent"
                checked={consentGiven}
                onCheckedChange={(checked) =>
                  setValue("consent_given", checked === true, { shouldValidate: true })
                }
                aria-invalid={!!errors.consent_given}
                disabled={isLoading}
              />
              <div className="grid gap-1.5 leading-none">
                <Label
                  htmlFor="consent"
                  className="text-sm font-normal cursor-pointer leading-relaxed"
                >
                  I consent to sharing my health data for personalized nutrition coaching{" "}
                  <span className="text-destructive">*</span>
                </Label>
                <p className="text-xs text-muted-foreground">
                  Your data is encrypted and never shared with third parties
                </p>
              </div>
            </div>
            {errors.consent_given && (
              <p className="text-sm text-destructive">{errors.consent_given.message}</p>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <Button
            type="submit"
            size="lg"
            disabled={!isValid || !consentGiven || isLoading}
            className="min-w-[200px] bg-[#20df6c] hover:bg-[#20df6c]/90 text-black"
          >
            {isLoading ? "Saving..." : "Continue"}
          </Button>
        </div>
      </form>
    </TooltipProvider>
  )
}
