'use client';

import { motion } from 'framer-motion';

interface Stat {
  value: string;
  label: string;
}

const STATS: Stat[] = [
  { value: '500+', label: 'lives réalisés' },
  { value: '150+', label: 'vendeurs actifs' },
  { value: '98%', label: 'satisfaction client' },
  { value: '2 min', label: "temps d'assignation moyen" },
];

export function StatsSection() {
  return (
    <section className="py-16 md:py-24 bg-gradient-to-br from-primary/20 via-background to-background">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
          {STATS.map((stat, i) => (
            <motion.div
              key={stat.label}
              className="flex flex-col items-center gap-2"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.4, delay: i * 0.08, ease: 'easeOut' }}
            >
              <span className="text-4xl sm:text-5xl font-bold text-foreground">{stat.value}</span>
              <span className="text-foreground-secondary text-sm sm:text-base">{stat.label}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
