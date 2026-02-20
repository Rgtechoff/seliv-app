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
    <section id="how-it-works" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">Comment ça marche ?</h2>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
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
              <Card className="relative border border-gray-100 hover:border-indigo-200 hover:shadow-md transition-all group h-full">
                <CardContent className="pt-6 pb-6 px-6 flex flex-col gap-4">
                  {/* Step number */}
                  <div className="flex items-center gap-3">
                    <span className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-600 text-white text-sm font-bold flex items-center justify-center">
                      {step}
                    </span>
                    <Icon className="w-5 h-5 text-indigo-500 group-hover:text-indigo-600 transition-colors" />
                  </div>

                  {/* Emoji + Title */}
                  <div>
                    <span className="text-2xl" aria-hidden="true">
                      {emoji}
                    </span>
                    <h3 className="mt-2 text-base font-semibold text-gray-900">{title}</h3>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-gray-500 leading-relaxed">{description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
