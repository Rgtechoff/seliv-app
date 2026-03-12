'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { StarRating } from '@/components/vendeurs/star-rating';
import type { VendeurPublicItem } from '@/lib/api';

const LEVEL_LABELS: Record<VendeurPublicItem['level'], string> = {
  debutant: 'Débutant',
  confirme: 'Confirmé',
  star: 'Star',
};

const LEVEL_COLORS: Record<VendeurPublicItem['level'], string> = {
  debutant: 'bg-blue-500/15 text-blue-300 border border-blue-500/20',
  confirme: 'bg-primary/15 text-primary border border-primary/20',
  star: 'bg-yellow-500/15 text-yellow-300 border border-yellow-500/20',
};

interface VendeurCardProps {
  vendeur: VendeurPublicItem;
  index?: number;
}

export function VendeurCard({ vendeur, index = 0 }: VendeurCardProps) {
  const initials =
    (vendeur.firstName?.[0] ?? '') + (vendeur.lastNameInitial?.[0] ?? '');

  const displayedZones = vendeur.zones.slice(0, 2);
  const extraZones = vendeur.zones.length - 2;

  const displayedCategories = vendeur.categories.slice(0, 2);
  const extraCategories = vendeur.categories.length - 2;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.07, ease: 'easeOut' }}
      whileHover={{ y: -3, transition: { duration: 0.15 } }}
      className="flex flex-col h-full"
    >
    <Card className="relative flex flex-col h-full bg-card border border-border rounded-xl shadow-card hover:shadow-hover hover:border-primary/30 transition-all duration-200">
      {/* Star badge overlay */}
      {vendeur.isStar && (
        <span className="absolute top-3 right-3 z-10 bg-yellow-500/20 text-yellow-300 border border-yellow-500/30 text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
          ⭐ STAR
        </span>
      )}

      <CardContent className="flex flex-col items-center pt-6 pb-4 gap-3">
        {/* Avatar */}
        <div className="relative">
          {vendeur.avatarUrl ? (
            <Image
              src={vendeur.avatarUrl}
              alt={`${vendeur.firstName} ${vendeur.lastNameInitial}.`}
              width={64}
              height={64}
              className="rounded-full object-cover ring-2 ring-primary/20"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-xl">
              {initials.toUpperCase()}
            </div>
          )}
        </div>

        {/* Nom */}
        <div className="text-center">
          <p className="font-semibold text-foreground text-base">
            {vendeur.firstName} {vendeur.lastNameInitial}.
          </p>
        </div>

        {/* Niveau */}
        <span
          className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${LEVEL_COLORS[vendeur.level]}`}
        >
          {LEVEL_LABELS[vendeur.level]}
        </span>

        {/* Note + missions */}
        <div className="flex items-center gap-2">
          <StarRating rating={vendeur.ratingAvg} size="sm" />
          <span className="text-sm text-foreground-secondary">
            {vendeur.ratingAvg.toFixed(1)}{' '}
            <span className="text-foreground-secondary/60">({vendeur.missionsCount} missions)</span>
          </span>
        </div>

        {/* Zones */}
        {vendeur.zones.length > 0 && (
          <div className="flex flex-wrap justify-center gap-1">
            {displayedZones.map((zone) => (
              <Badge key={zone} variant="outline" className="text-xs border-border text-foreground-secondary">
                {zone}
              </Badge>
            ))}
            {extraZones > 0 && (
              <Badge variant="outline" className="text-xs border-border text-foreground-secondary/60">
                +{extraZones}
              </Badge>
            )}
          </div>
        )}

        {/* Catégories */}
        {vendeur.categories.length > 0 && (
          <div className="flex flex-wrap justify-center gap-1">
            {displayedCategories.map((cat) => (
              <Badge key={cat} className="text-xs bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20">
                {cat}
              </Badge>
            ))}
            {extraCategories > 0 && (
              <Badge className="text-xs bg-muted text-foreground-secondary">
                +{extraCategories}
              </Badge>
            )}
          </div>
        )}
      </CardContent>

      <CardFooter className="pt-0 pb-4 px-4">
        <Button
          asChild
          className="w-full bg-primary hover:bg-primary/90 text-white rounded-lg font-medium transition-colors"
        >
          <Link href={`/vendeurs/${vendeur.id}`}>Voir le profil</Link>
        </Button>
      </CardFooter>
    </Card>
    </motion.div>
  );
}
