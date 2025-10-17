import { Card, CardContent } from "@/components/ui/card";
import { Star } from "lucide-react";

interface Testimonial {
  name: string;
  date: string;
  rating: number;
  quote: string;
  avatar?: string;
}

interface TestimonialsSectionProps {
  testimonials?: Testimonial[];
  className?: string;
}

const defaultTestimonials: Testimonial[] = [
  {
    name: "Sarah J.",
    date: "Oct 26, 2023",
    rating: 5,
    quote: "NutriCoach AI helped me finally understand how food affects my energy levels. It's like having a nutritionist in my pocket!",
  },
  {
    name: "Mike R.",
    date: "Nov 12, 2023",
    rating: 4,
    quote: "The dialogue-based learning is a game changer. It's so much more engaging than just reading articles.",
  },
  {
    name: "Emily C.",
    date: "Dec 02, 2023",
    rating: 4.5,
    quote: "I love visualizing my health progress. It keeps me motivated to make better choices every day.",
  },
];

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`w-4 h-4 ${
            star <= rating
              ? "fill-yellow-400 text-yellow-400"
              : star - 0.5 <= rating
              ? "fill-yellow-400/50 text-yellow-400"
              : "fill-gray-200 text-gray-200 dark:fill-gray-700 dark:text-gray-700"
          }`}
        />
      ))}
    </div>
  );
}

export function TestimonialsSection({
  testimonials = defaultTestimonials,
  className = "",
}: TestimonialsSectionProps) {
  return (
    <section className={`w-full py-20 bg-background-light dark:bg-background ${className}`}>
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            What Our Users Say
          </h2>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => {
            const initials = testimonial.name
              .split(" ")
              .map((n) => n[0])
              .join("");

            return (
              <Card key={index} className="border-2 hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  {/* User Info */}
                  <div className="flex items-center gap-3 mb-4">
                    {/* Avatar */}
                    <div className="w-12 h-12 rounded-full bg-[#20df6c] flex items-center justify-center text-white font-semibold">
                      {initials}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-foreground">{testimonial.name}</p>
                      <p className="text-sm text-muted-foreground">{testimonial.date}</p>
                    </div>
                  </div>

                  {/* Rating */}
                  <div className="mb-3">
                    <StarRating rating={testimonial.rating} />
                  </div>

                  {/* Quote */}
                  <p className="text-muted-foreground italic">
                    &quot;{testimonial.quote}&quot;
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
