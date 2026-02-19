'use client';

import { useState, useCallback } from 'react';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { VendeurCard } from '@/components/vendeurs/vendeur-card';
import {
  vendeursPublicApi,
  type VendeurPublicItem,
  type VendeursPublicMeta,
  type VendeursPublicParams,
} from '@/lib/api';

const CATEGORIES = ['Mode', 'Tech', 'Bijoux', 'Sport', 'Maison', 'Beauté', 'Autre'];

const LEVEL_OPTIONS = [
  { value: '', label: 'Tous' },
  { value: 'debutant', label: 'Débutant' },
  { value: 'confirme', label: 'Confirmé' },
  { value: 'star', label: 'Star' },
] as const;

const RATING_OPTIONS = [
  { value: '', label: 'Tous' },
  { value: '4', label: '4+' },
  { value: '4.5', label: '4.5+' },
] as const;

const SORT_OPTIONS = [
  { value: 'rating', label: 'Note' },
  { value: 'missions', label: 'Missions' },
  { value: 'recent', label: 'Récent' },
] as const;

interface FilterState {
  categories: string[];
  zone: string;
  level: string;
  minRating: string;
  sort: string;
}

const DEFAULT_FILTERS: FilterState = {
  categories: [],
  zone: '',
  level: '',
  minRating: '',
  sort: 'rating',
};

export default function VendeursPage() {
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [pendingFilters, setPendingFilters] = useState<FilterState>(DEFAULT_FILTERS);

  const [vendeurs, setVendeurs] = useState<VendeurPublicItem[]>([]);
  const [meta, setMeta] = useState<VendeursPublicMeta | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchVendeurs = useCallback(async (currentFilters: FilterState, currentPage: number) => {
    setLoading(true);
    setError(null);

    const params: VendeursPublicParams = {
      page: currentPage,
      limit: 12,
    };

    if (currentFilters.categories.length > 0) {
      params.categories = currentFilters.categories.join(',');
    }
    if (currentFilters.zone.trim()) {
      params.zones = currentFilters.zone.trim();
    }
    if (currentFilters.level) {
      params.level = currentFilters.level as VendeursPublicParams['level'];
    }
    if (currentFilters.minRating) {
      params.minRating = parseFloat(currentFilters.minRating);
    }
    if (currentFilters.sort) {
      params.sort = currentFilters.sort as VendeursPublicParams['sort'];
    }

    try {
      const res = await vendeursPublicApi.getAll(params);
      setVendeurs(res.data.data);
      setMeta(res.data.meta);
    } catch {
      setError('Impossible de charger les vendeurs. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVendeurs(filters, page);
  }, [filters, page, fetchVendeurs]);

  const handleApplyFilters = () => {
    setPage(1);
    setFilters({ ...pendingFilters });
  };

  const handleCategoryToggle = (cat: string) => {
    setPendingFilters((prev) => ({
      ...prev,
      categories: prev.categories.includes(cat)
        ? prev.categories.filter((c) => c !== cat)
        : [...prev.categories, cat],
    }));
  };

  const handlePrev = () => {
    if (page > 1) setPage((p) => p - 1);
  };

  const handleNext = () => {
    if (meta && page < meta.totalPages) setPage((p) => p + 1);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Trouvez votre vendeur live
        </h1>
        <p className="mt-2 text-gray-500">
          {meta ? `${meta.total} vendeur${meta.total > 1 ? 's' : ''} disponible${meta.total > 1 ? 's' : ''}` : ''}
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar filtres */}
        <aside className="w-full lg:w-64 flex-shrink-0">
          <div className="bg-white border border-gray-200 rounded-lg p-5 space-y-5 sticky top-4">
            <h2 className="font-semibold text-gray-800 text-base">Filtres</h2>

            {/* Catégories */}
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-2 block">
                Catégories
              </Label>
              <div className="space-y-2">
                {CATEGORIES.map((cat) => (
                  <label key={cat} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={pendingFilters.categories.includes(cat)}
                      onChange={() => handleCategoryToggle(cat)}
                      className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-sm text-gray-700">{cat}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Zone */}
            <div>
              <Label htmlFor="zone-input" className="text-sm font-medium text-gray-700 mb-1 block">
                Zone géographique
              </Label>
              <Input
                id="zone-input"
                placeholder="Ex : Paris"
                value={pendingFilters.zone}
                onChange={(e) =>
                  setPendingFilters((prev) => ({ ...prev, zone: e.target.value }))
                }
                className="text-sm"
              />
            </div>

            {/* Niveau */}
            <div>
              <Label htmlFor="level-select" className="text-sm font-medium text-gray-700 mb-1 block">
                Niveau
              </Label>
              <select
                id="level-select"
                value={pendingFilters.level}
                onChange={(e) =>
                  setPendingFilters((prev) => ({ ...prev, level: e.target.value }))
                }
                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {LEVEL_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Note minimale */}
            <div>
              <Label htmlFor="rating-select" className="text-sm font-medium text-gray-700 mb-1 block">
                Note minimale
              </Label>
              <select
                id="rating-select"
                value={pendingFilters.minRating}
                onChange={(e) =>
                  setPendingFilters((prev) => ({ ...prev, minRating: e.target.value }))
                }
                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {RATING_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Trier par */}
            <div>
              <Label htmlFor="sort-select" className="text-sm font-medium text-gray-700 mb-1 block">
                Trier par
              </Label>
              <select
                id="sort-select"
                value={pendingFilters.sort}
                onChange={(e) =>
                  setPendingFilters((prev) => ({ ...prev, sort: e.target.value }))
                }
                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <Button
              onClick={handleApplyFilters}
              className="w-full"
              disabled={loading}
            >
              Appliquer les filtres
            </Button>
          </div>
        </aside>

        {/* Contenu principal */}
        <div className="flex-1 min-w-0">
          {/* Loading */}
          {loading && (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-10 w-10 border-4 border-indigo-500 border-t-transparent" />
            </div>
          )}

          {/* Erreur */}
          {!loading && error && (
            <div className="text-center py-20">
              <p className="text-red-500">{error}</p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => fetchVendeurs(filters, page)}
              >
                Réessayer
              </Button>
            </div>
          )}

          {/* Empty state */}
          {!loading && !error && vendeurs.length === 0 && (
            <div className="text-center py-20">
              <p className="text-gray-500 text-lg">
                Aucun vendeur trouvé pour ces critères.
              </p>
            </div>
          )}

          {/* Grille */}
          {!loading && !error && vendeurs.length > 0 && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {vendeurs.map((vendeur) => (
                  <VendeurCard key={vendeur.id} vendeur={vendeur} />
                ))}
              </div>

              {/* Pagination */}
              {meta && meta.totalPages > 1 && (
                <div className="mt-8 flex items-center justify-center gap-4">
                  <Button
                    variant="outline"
                    onClick={handlePrev}
                    disabled={page <= 1}
                  >
                    Précédent
                  </Button>
                  <span className="text-sm text-gray-600">
                    Page {meta.page} sur {meta.totalPages}
                  </span>
                  <Button
                    variant="outline"
                    onClick={handleNext}
                    disabled={page >= meta.totalPages}
                  >
                    Suivant
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
