'use client';

import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { StarRating } from '@/components/star-rating';

interface Testimonial {
  name: string;
  company: string;
  rating: number;
  quote: string;
}

const TESTIMONIALS: Testimonial[] = [
  {
    name: 'Alice M.',
    company: 'Boutique Alice',
    rating: 5,
    quote:
      'Résultats incroyables dès le premier live ! Notre CA a augmenté de 40% ce mois-ci.',
  },
  {
    name: 'Bruno L.',
    company: 'Bruno Commerce',
    rating: 5,
    quote:
      "L'équipe SELIV est très professionnelle. La mise en relation est rapide et les vendeurs sont au top.",
  },
  {
    name: 'Chloé R.',
    company: 'Mode & Style',
    rating: 5,
    quote:
      'Je recommande SELIV à tous les e-commerçants. Simple, efficace, et les résultats parlent d\'eux-mêmes.',
  },
];

function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
  return (
    <Card className="bg-card border border-border rounded-xl shadow-card hover:shadow-hover transition-shadow">
      <CardContent className="pt-6 pb-6 px-6 flex flex-col gap-4">
        <StarRating value={testimonial.rating} size={18} />
        <blockquote className="text-foreground-secondary text-sm leading-relaxed italic">
          &ldquo;{testimonial.quote}&rdquo;
        </blockquote>
        <div className="flex items-center gap-3 mt-auto">
          <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold text-sm flex-shrink-0 border border-primary/20">
            {testimonial.name.charAt(0)}
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">{testimonial.name}</p>
            <p className="text-xs text-foreground-secondary">{testimonial.company}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function TestimonialsSection() {
  return (
    <section className="py-16 md:py-24 bg-sidebar">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground">
            Ils nous font confiance
          </h2>
          <p className="mt-4 text-lg text-foreground-secondary max-w-2xl mx-auto">
            Des centaines de marques font déjà confiance à SELIV pour booster leurs ventes.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {TESTIMONIALS.map((testimonial, i) => (
            <motion.div
              key={testimonial.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.4, delay: i * 0.1, ease: 'easeOut' }}
            >
              <TestimonialCard testimonial={testimonial} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
