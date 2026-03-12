'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useParams } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { StarRating } from '@/components/vendeurs/star-rating';
import { vendeursPublicApi, type VendeurPublicDetail } from '@/lib/api';

const LEVEL_LABELS: Record<VendeurPublicDetail['level'], string> = {
  debutant: 'Débutant',
  confirme: 'Confirmé',
  star: 'Star',
};

const LEVEL_COLORS: Record<VendeurPublicDetail['level'], string> = {
  debutant: 'bg-blue-500/15 text-blue-300 border border-blue-500/20',
  confirme: 'bg-primary/15 text-primary border border-primary/20',
  star: 'bg-yellow-500/15 text-yellow-300 border border-yellow-500/20',
};

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export default function VendeurProfilPage() {
  const params = useParams();
  const router = useRouter();
  const id = typeof params.id === 'string' ? params.id : Array.isArray(params.id) ? params.id[0] : '';

  const [vendeur, setVendeur] = useState<VendeurPublicDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!id) return;

    setLoading(true);
    setNotFound(false);

    vendeursPublicApi
      .getOne(id)
      .then((res) => {
        setVendeur(res.data);
      })
      .catch((err) => {
        if (err?.response?.status === 404) {
          setNotFound(true);
        } else {
          setNotFound(true);
        }
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id]);

  const initials = vendeur
    ? (vendeur.firstName?.[0] ?? '') + (vendeur.lastNameInitial?.[0] ?? '')
    : '';

  // Loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  // Error / not found state
  if (notFound || !vendeur) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 px-4">
        <h2 className="text-2xl font-bold text-foreground">Vendeur introuvable</h2>
        <p className="text-foreground-secondary">
          Ce profil n&apos;existe pas ou a été supprimé.
        </p>
        <Button
          variant="outline"
          className="border-border text-foreground hover:bg-primary/10"
          onClick={() => router.push('/vendeurs')}
        >
          Retour à l&apos;annuaire
        </Button>
      </div>
    );
  }

  return (
    <>
      {/* Main content with bottom padding for sticky CTA */}
      <div className="max-w-3xl mx-auto px-4 py-8 pb-28">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-foreground-secondary mb-6">
          <Link href="/" className="hover:text-primary transition-colors">
            Accueil
          </Link>
          <span>/</span>
          <Link href="/vendeurs" className="hover:text-primary transition-colors">
            Annuaire
          </Link>
          <span>/</span>
          <span className="text-foreground font-medium">
            {vendeur.firstName} {vendeur.lastNameInitial}.
          </span>
        </nav>

        {/* Profile header */}
        <div className="bg-card border border-border rounded-xl p-6 sm:p-8 mb-6 shadow-card">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              {vendeur.avatarUrl ? (
                <Image
                  src={vendeur.avatarUrl}
                  alt={`${vendeur.firstName} ${vendeur.lastNameInitial}.`}
                  width={96}
                  height={96}
                  className="rounded-full object-cover ring-2 ring-primary/30"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-3xl">
                  {initials.toUpperCase()}
                </div>
              )}
              {vendeur.isStar && (
                <span className="absolute -top-1 -right-1 bg-yellow-500/20 text-yellow-300 border border-yellow-500/30 text-xs font-bold px-1.5 py-0.5 rounded-full">
                  ⭐
                </span>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 text-center sm:text-left">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 flex-wrap justify-center sm:justify-start">
                <h1 className="text-2xl font-bold text-foreground">
                  {vendeur.firstName} {vendeur.lastNameInitial}.
                </h1>
                {vendeur.isStar && (
                  <span className="inline-flex items-center gap-1 bg-yellow-500/15 text-yellow-300 border border-yellow-500/20 text-xs font-semibold px-2.5 py-1 rounded-full">
                    ⭐ Vendeur STAR
                  </span>
                )}
              </div>

              {/* Niveau badge */}
              <span
                className={`inline-block mt-2 text-xs font-medium px-2.5 py-0.5 rounded-full ${LEVEL_COLORS[vendeur.level]}`}
              >
                {LEVEL_LABELS[vendeur.level]}
              </span>

              {/* Note + missions */}
              <div className="flex items-center gap-2 mt-3 justify-center sm:justify-start">
                <StarRating rating={vendeur.ratingAvg} size="md" />
                <span className="text-sm text-foreground font-medium">
                  {vendeur.ratingAvg.toFixed(1)}
                </span>
                <span className="text-sm text-foreground-secondary">
                  ({vendeur.missionsCount} mission{vendeur.missionsCount > 1 ? 's' : ''})
                </span>
              </div>
            </div>
          </div>

          {/* Bio */}
          {vendeur.bio && (
            <div className="mt-6">
              <h2 className="text-base font-semibold text-foreground mb-2">À propos</h2>
              <p className="text-foreground-secondary leading-relaxed">{vendeur.bio}</p>
            </div>
          )}

          {/* Zones */}
          {vendeur.zones.length > 0 && (
            <div className="mt-5">
              <h2 className="text-base font-semibold text-foreground mb-2">Zones d&apos;intervention</h2>
              <div className="flex flex-wrap gap-2">
                {vendeur.zones.map((zone) => (
                  <Badge key={zone} variant="outline" className="border-border text-foreground-secondary">
                    {zone}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Catégories */}
          {vendeur.categories.length > 0 && (
            <div className="mt-5">
              <h2 className="text-base font-semibold text-foreground mb-2">Spécialités</h2>
              <div className="flex flex-wrap gap-2">
                {vendeur.categories.map((cat) => (
                  <Badge key={cat} className="bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20">
                    {cat}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Section avis */}
        <div className="bg-card border border-border rounded-xl p-6 sm:p-8 shadow-card">
          <h2 className="text-xl font-bold text-foreground mb-5">
            Avis clients
            {vendeur.reviews.length > 0 && (
              <span className="ml-2 text-sm font-normal text-foreground-secondary">
                ({vendeur.reviews.length})
              </span>
            )}
          </h2>

          {vendeur.reviews.length === 0 ? (
            <p className="text-foreground-secondary text-sm">Aucun avis pour le moment.</p>
          ) : (
            <div className="space-y-5">
              {vendeur.reviews.map((review, index) => (
                <div
                  key={index}
                  className="border-b border-border last:border-b-0 pb-5 last:pb-0"
                >
                  <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-semibold text-sm">
                        {review.clientFirstName?.[0]?.toUpperCase() ?? '?'}
                      </div>
                      <span className="font-medium text-foreground text-sm">
                        {review.clientFirstName}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <StarRating rating={review.rating} size="sm" />
                      <span className="text-xs text-foreground-secondary">
                        {formatDate(review.createdAt)}
                      </span>
                    </div>
                  </div>
                  {review.comment && (
                    <p className="text-foreground-secondary text-sm leading-relaxed ml-11">
                      {review.comment}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Sticky CTA */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-sidebar/90 backdrop-blur-md border-t border-border shadow-modal px-4 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-4">
          <div className="hidden sm:block">
            <p className="font-semibold text-foreground">
              {vendeur.firstName} {vendeur.lastNameInitial}.
            </p>
            <p className="text-sm text-foreground-secondary">
              {vendeur.ratingAvg.toFixed(1)} ★ · {vendeur.missionsCount} missions
            </p>
          </div>
          <Button
            size="lg"
            className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-white rounded-lg font-medium transition-colors px-8"
            onClick={() =>
              router.push(`/client/missions/new?vendeur_id=${vendeur.id}`)
            }
          >
            Réserver ce vendeur
          </Button>
        </div>
      </div>
    </>
  );
}
