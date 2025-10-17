import { Card, CardContent } from "@/components/ui/card";
import { User, BookOpen, Eye } from "lucide-react";

interface FeaturesSectionProps {
  className?: string;
}

const features = [
  {
    icon: User,
    title: "Personalized Feedback",
    description: "Get tailored advice based on your unique needs.",
    color: "bg-[#20df6c]/10",
    iconColor: "text-[#20df6c]",
  },
  {
    icon: BookOpen,
    title: "Dialogue-Based Learning",
    description: "Learn about nutrition in an engaging and interactive way.",
    color: "bg-[#20df6c]/10",
    iconColor: "text-[#20df6c]",
  },
  {
    icon: Eye,
    title: "Visualize Your Health",
    description: "See your progress and make informed decisions.",
    color: "bg-[#20df6c]/10",
    iconColor: "text-[#20df6c]",
  },
];

export function FeaturesSection({ className = "" }: FeaturesSectionProps) {
  return (
    <section id="features" className={`w-full py-20 bg-white dark:bg-background ${className}`}>
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Features
          </h2>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card key={index} className="border-2 hover:shadow-lg transition-shadow">
                <CardContent className="pt-6 text-center">
                  {/* Icon Container */}
                  <div className={`w-20 h-20 rounded-full ${feature.color} flex items-center justify-center mx-auto mb-4`}>
                    <Icon className={`w-10 h-10 ${feature.iconColor}`} />
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    {feature.title}
                  </h3>

                  {/* Description */}
                  <p className="text-muted-foreground">
                    {feature.description}
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
