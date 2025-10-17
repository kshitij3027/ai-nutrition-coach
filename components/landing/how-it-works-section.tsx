import { Card, CardContent } from "@/components/ui/card";
import { PenLine, MessageSquare, TrendingUp } from "lucide-react";

interface HowItWorksSectionProps {
  className?: string;
}

const steps = [
  {
    icon: PenLine,
    title: "Describe Your Meal",
    description: "Simply type or speak to describe your meal.",
    color: "bg-blue-100 dark:bg-blue-900/20",
    iconColor: "text-blue-600 dark:text-blue-400",
  },
  {
    icon: MessageSquare,
    title: "Chat with the AI",
    description: "Our AI will ask you questions to understand your meal.",
    color: "bg-green-100 dark:bg-green-900/20",
    iconColor: "text-green-600 dark:text-green-400",
  },
  {
    icon: TrendingUp,
    title: "See the Simulation",
    description: "Visualize the impact of your meal on your body.",
    color: "bg-purple-100 dark:bg-purple-900/20",
    iconColor: "text-purple-600 dark:text-purple-400",
  },
];

export function HowItWorksSection({ className = "" }: HowItWorksSectionProps) {
  return (
    <section id="how-it-works" className={`w-full py-20 bg-background-light dark:bg-background ${className}`}>
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            How it Works
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            A step-by-step visual guide explaining the dialogue-based simulation.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <Card key={index} className="border-2 hover:shadow-lg transition-shadow">
                <CardContent className="pt-6 text-center">
                  {/* Icon Container */}
                  <div className={`w-16 h-16 rounded-full ${step.color} flex items-center justify-center mx-auto mb-4`}>
                    <Icon className={`w-8 h-8 ${step.iconColor}`} />
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    {step.title}
                  </h3>

                  {/* Description */}
                  <p className="text-muted-foreground">
                    {step.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
