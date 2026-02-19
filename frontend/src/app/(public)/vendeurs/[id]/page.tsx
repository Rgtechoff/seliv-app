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
  debutant: 'bg-blue-100 text-blue-800',
  confirme: 'bg-purple-100 text-purple-800',
  star: 'bg-yellow-100 text-yellow-800',
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
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-500 border-t-transparent" />
      </div>
    );
  }

  // Error / not found state
  if (notFound || !vendeur) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 px-4">
        <h2 className="text-2xl font-bold text-gray-800">Vendeur introuvable</h2>
        <p className="text-gray-500">
          Ce profil n&apos;existe pas ou a été supprimé.
        </p>
        <Button variant="outline" onClick={() => router.push('/vendeurs')}>
          Retour à l&apos;annuaire
        </Button>
      </div>
    );
  }

  return (
    <>
      {/* Main content with bottom padding for sticky CTA */}
      <div className="max-w-3xl mx-auto px-4 py-8 sm:px-6 lg:px-8 pb-28">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <Link href="/" className="hover:text-indigo-600 transition-colors">
            Accueil
          </Link>
          <span>/</span>
          <Link href="/vendeurs" className="hover:text-indigo-600 transition-colors">
            Annuaire
          </Link>
          <span>/</span>
          <span className="text-gray-800 font-medium">
            {vendeur.firstName} {vendeur.lastNameInitial}.
          </span>
        </nav>

        {/* Profile header */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 sm:p-8 mb-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              {vendeur.avatarUrl ? (
                <Image
                  src={vendeur.avatarUrl}
                  alt={`${vendeur.firstName} ${vendeur.lastNameInitial}.`}
                  width={96}
                  height={96}
                  className="rounded-full object-cover"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-3xl">
                  {initials.toUpperCase()}
                </div>
              )}
              {vendeur.isStar && (
                <span className="absolute -top-1 -right-1 bg-yellow-400 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
                  ⭐
                </span>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 text-center sm:text-left">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 flex-wrap justify-center sm:justify-start">
                <h1 className="text-2xl font-bold text-gray-900">
                  {vendeur.firstName} {vendeur.lastNameInitial}.
                </h1>
                {vendeur.isStar && (
                  <span className="inline-flex items-center gap-1 bg-yellow-100 text-yellow-800 text-xs font-semibold px-2.5 py-1 rounded-full">
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
                <span className="text-sm text-gray-700 font-medium">
                  {vendeur.ratingAvg.toFixed(1)}
                </span>
                <span className="text-sm text-gray-400">
                  ({vendeur.missionsCount} mission{vendeur.missionsCount > 1 ? 's' : ''})
                </span>
              </div>
            </div>
          </div>

          {/* Bio */}
          {vendeur.bio && (
            <div className="mt-6">
              <h2 className="text-base font-semibold text-gray-800 mb-2">À propos</h2>
              <p className="text-gray-600 leading-relaxed">{vendeur.bio}</p>
            </div>
          )}

          {/* Zones */}
          {vendeur.zones.length > 0 && (
            <div className="mt-5">
              <h2 className="text-base font-semibold text-gray-800 mb-2">Zones d&apos;intervention</h2>
              <div className="flex flex-wrap gap-2">
                {vendeur.zones.map((zone) => (
                  <Badge key={zone} variant="outline">
                    {zone}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Catégories */}
          {vendeur.categories.length > 0 && (
            <div className="mt-5">
              <h2 className="text-base font-semibold text-gray-800 mb-2">Spécialités</h2>
              <div className="flex flex-wrap gap-2">
                {vendeur.categories.map((cat) => (
                  <Badge key={cat} className="bg-indigo-50 text-indigo-700 hover:bg-indigo-100">
                    {cat}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Section avis */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 sm:p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-5">
            Avis clients
            {vendeur.reviews.length > 0 && (
              <span className="ml-2 text-sm font-normal text-gray-400">
                ({vendeur.reviews.length})
              </span>
            )}
          </h2>

          {vendeur.reviews.length === 0 ? (
            <p className="text-gray-500 text-sm">Aucun avis pour le moment.</p>
          ) : (
            <div className="space-y-5">
              {vendeur.reviews.map((review, index) => (
                <div
                  key={index}
                  className="border-b border-gray-100 last:border-b-0 pb-5 last:pb-0"
                >
                  <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-semibold text-sm">
                        {review.clientFirstName?.[0]?.toUpperCase() ?? '?'}
                      </div>
                      <span className="font-medium text-gray-800 text-sm">
                        {review.clientFirstName}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <StarRating rating={review.rating} size="sm" />
                      <span className="text-xs text-gray-400">
                        {formatDate(review.createdAt)}
                      </span>
                    </div>
                  </div>
                  {review.comment && (
                    <p className="text-gray-600 text-sm leading-relaxed ml-11">
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
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg px-4 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-4">
          <div className="hidden sm:block">
            <p className="font-semibold text-gray-900">
              {vendeur.firstName} {vendeur.lastNameInitial}.
            </p>
            <p className="text-sm text-gray-500">
              {vendeur.ratingAvg.toFixed(1)} ★ · {vendeur.missionsCount} missions
            </p>
          </div>
          <Button
            size="lg"
            className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-8"
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
