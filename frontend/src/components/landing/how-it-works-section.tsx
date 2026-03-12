'use client';

import { Target, UserCheck, Video, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';

const STEPS = [
  {
    icon: Target,
    emoji: '🎯',
    title: 'Décrivez votre besoin',
    description: 'Choisissez votre catégorie, volume de produits et date souhaitée.',
    step: 1,
  },
  {
    icon: UserCheck,
    emoji: '👤',
    title: 'On vous assigne un vendeur',
    description: 'Notre équipe sélectionne le meilleur profil disponible pour votre mission.',
    step: 2,
  },
  {
    icon: Video,
    emoji: '📺',
    title: 'Le live a lieu',
    description: 'Votre vendeur présente vos produits en direct sur la plateforme choisie.',
    step: 3,
  },
  {
    icon: TrendingUp,
    emoji: '💰',
    title: 'Récoltez les ventes',
    description: 'Analysez vos résultats et mesurez l\'impact de votre session live.',
    step: 4,
  },
] as const;

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-16 md:py-24 bg-background">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground">Comment ça marche ?</h2>
          <p className="mt-4 text-lg text-foreground-secondary max-w-2xl mx-auto">
            De la réservation aux résultats, SELIV gère tout pour vous.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {STEPS.map(({ icon: Icon, emoji, title, description, step }) => (
            <motion.div
              key={step}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.4, delay: (step - 1) * 0.1, ease: 'easeOut' }}
            >
              <Card className="relative bg-card border border-border rounded-xl shadow-card hover:shadow-hover hover:border-primary/30 transition-all group h-full">
                <CardContent className="pt-6 pb-6 px-6 flex flex-col gap-4">
                  {/* Step number */}
                  <div className="flex items-center gap-3">
                    <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-white text-sm font-bold flex items-center justify-center">
                      {step}
                    </span>
                    <Icon className="w-5 h-5 text-primary/70 group-hover:text-primary transition-colors" />
                  </div>

                  {/* Emoji + Title */}
                  <div>
                    <span className="text-2xl" aria-hidden="true">
                      {emoji}
                    </span>
                    <h3 className="mt-2 text-base font-semibold text-foreground">{title}</h3>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-foreground-secondary leading-relaxed">{description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
