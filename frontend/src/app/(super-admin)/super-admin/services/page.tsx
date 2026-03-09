'use client';

import * as React from 'react';
import { Plus, Edit2, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';
import { apiClient } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PageHeader } from '@/components/shared/page-header';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { SkeletonCard } from '@/components/shared/skeleton';
import { EmptyState } from '@/components/shared/empty-state';
import { formatPrice } from '@/lib/types';

type ServiceCategory = 'nettoyage' | 'jardinage' | 'bricolage' | 'demenagement' | 'garde' | 'autre';
type PriceType = 'hourly' | 'fixed' | 'per_unit';

interface ServiceItem {
  id: string;
  name: string;
  description: string | null;
  category: ServiceCategory;
  priceCents: number;
  priceType: PriceType;
  unitLabel: string | null;
  minQuantity: number | null;
  maxQuantity: number | null;
  isActive: boolean;
  sortOrder: number;
  legacyKey: string | null;
}

const CATEGORY_LABELS: Record<ServiceCategory, string> = {
  nettoyage: 'Nettoyage',
  jardinage: 'Jardinage',
  bricolage: 'Bricolage',
  demenagement: 'Déménagement',
  garde: 'Garde',
  autre: 'Autre',
};

const PRICE_TYPE_LABELS: Record<PriceType, string> = {
  hourly: 'À l\'heure',
  fixed: 'Forfait',
  per_unit: 'À l\'unité',
};

function ServiceFormModal({
  service,
  onClose,
  onSaved,
}: {
  service?: ServiceItem;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = React.useState({
    name: service?.name ?? '',
    description: service?.description ?? '',
    category: service?.category ?? 'autre' as ServiceCategory,
    priceCents: service?.priceCents ?? 0,
    priceType: service?.priceType ?? 'hourly' as PriceType,
    unitLabel: service?.unitLabel ?? '',
    minQuantity: service?.minQuantity?.toString() ?? '',
    maxQuantity: service?.maxQuantity?.toString() ?? '',
    legacyKey: service?.legacyKey ?? '',
  });
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const payload = {
        name: form.name,
        description: form.description || null,
        category: form.category,
        priceCents: Number(form.priceCents),
        priceType: form.priceType,
        unitLabel: form.unitLabel || null,
        minQuantity: form.minQuantity ? Number(form.minQuantity) : null,
        maxQuantity: form.maxQuantity ? Number(form.maxQuantity) : null,
        legacyKey: form.legacyKey || null,
      };
      if (service) {
        await apiClient.put(`/super-admin/services/${service.id}`, payload);
      } else {
        await apiClient.post('/super-admin/services', payload);
      }
      onSaved();
      onClose();
    } catch {
      setError('Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-card rounded-xl border border-border w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-lg font-semibold mb-4">
            {service ? 'Modifier le service' : 'Nouveau service'}
          </h2>
          <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Nom</label>
              <input
                className="w-full border border-input rounded-lg px-3 py-2 bg-background text-sm"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea
                className="w-full border border-input rounded-lg px-3 py-2 bg-background text-sm h-20 resize-none"
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1">Catégorie</label>
                <select
                  className="w-full border border-input rounded-lg px-3 py-2 bg-background text-sm"
                  value={form.category}
                  onChange={(e) => setForm((f) => ({ ...f, category: e.target.value as ServiceCategory }))}
                >
                  {Object.entries(CATEGORY_LABELS).map(([k, v]) => (
                    <option key={k} value={k}>{v}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Type de prix</label>
                <select
                  className="w-full border border-input rounded-lg px-3 py-2 bg-background text-sm"
                  value={form.priceType}
                  onChange={(e) => setForm((f) => ({ ...f, priceType: e.target.value as PriceType }))}
                >
                  {Object.entries(PRICE_TYPE_LABELS).map(([k, v]) => (
                    <option key={k} value={k}>{v}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1">Prix (centimes)</label>
                <input
                  type="number"
                  className="w-full border border-input rounded-lg px-3 py-2 bg-background text-sm"
                  value={form.priceCents}
                  onChange={(e) => setForm((f) => ({ ...f, priceCents: Number(e.target.value) }))}
                  min={0}
                  required
                />
                <p className="text-xs text-muted-foreground mt-1">{formatPrice(Number(form.priceCents))}</p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Libellé unité</label>
                <input
                  className="w-full border border-input rounded-lg px-3 py-2 bg-background text-sm"
                  value={form.unitLabel}
                  onChange={(e) => setForm((f) => ({ ...f, unitLabel: e.target.value }))}
                  placeholder="heure, m², pièce..."
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1">Qté min</label>
                <input
                  type="number"
                  className="w-full border border-input rounded-lg px-3 py-2 bg-background text-sm"
                  value={form.minQuantity}
                  onChange={(e) => setForm((f) => ({ ...f, minQuantity: e.target.value }))}
                  min={1}
                  placeholder="1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Qté max</label>
                <input
                  type="number"
                  className="w-full border border-input rounded-lg px-3 py-2 bg-background text-sm"
                  value={form.maxQuantity}
                  onChange={(e) => setForm((f) => ({ ...f, maxQuantity: e.target.value }))}
                  min={1}
                  placeholder="illimité"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Clé legacy (migration)</label>
              <input
                className="w-full border border-input rounded-lg px-3 py-2 bg-background text-sm font-mono"
                value={form.legacyKey}
                onChange={(e) => setForm((f) => ({ ...f, legacyKey: e.target.value }))}
                placeholder="ex: nettoyage_domicile"
              />
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <div className="flex gap-2 pt-2">
              <Button type="button" variant="outline" onClick={onClose} className="flex-1">Annuler</Button>
              <Button type="submit" disabled={saving} className="flex-1">
                {saving ? 'Sauvegarde...' : service ? 'Modifier' : 'Créer'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function SuperAdminServicesPage() {
  const [services, setServices] = React.useState<ServiceItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [showForm, setShowForm] = React.useState(false);
  const [editingService, setEditingService] = React.useState<ServiceItem | undefined>();
  const [deletingId, setDeletingId] = React.useState<string | null>(null);
  const [activeCategory, setActiveCategory] = React.useState<ServiceCategory | 'all'>('all');

  const load = () => {
    apiClient.get('/super-admin/services').then((res) => {
      setServices(res.data as ServiceItem[]);
    }).catch(console.error).finally(() => setLoading(false));
  };

  React.useEffect(() => { load(); }, []);

  const handleToggleActive = async (service: ServiceItem) => {
    await apiClient.put(`/super-admin/services/${service.id}`, { isActive: !service.isActive });
    load();
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    await apiClient.delete(`/super-admin/services/${deletingId}`);
    setDeletingId(null);
    load();
  };

  const filtered = activeCategory === 'all'
    ? services
    : services.filter((s) => s.category === activeCategory);

  const categories = ['all', ...Array.from(new Set(services.map((s) => s.category)))] as Array<ServiceCategory | 'all'>;

  return (
    <div>
      <PageHeader
        title="Catalogue de services"
        description="Gérez les services proposés lors de la création de missions"
        actions={
          <Button onClick={() => { setEditingService(undefined); setShowForm(true); }}>
            <Plus className="w-4 h-4 mr-2" />
            Nouveau service
          </Button>
        }
      />

      {/* Category filter */}
      <div className="flex gap-2 flex-wrap mb-6">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              activeCategory === cat
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            {cat === 'all' ? 'Tous' : CATEGORY_LABELS[cat]}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          title="Aucun service"
          description="Commencez par créer votre premier service."
          action={{ label: 'Créer un service', onClick: () => setShowForm(true) }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((service) => (
            <div key={service.id} className="bg-card rounded-xl border border-border p-5">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-foreground truncate">{service.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-xs">
                      {CATEGORY_LABELS[service.category]}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {PRICE_TYPE_LABELS[service.priceType]}
                    </Badge>
                  </div>
                </div>
                <Badge variant={service.isActive ? 'default' : 'secondary'} className="ml-2 flex-shrink-0">
                  {service.isActive ? 'Actif' : 'Inactif'}
                </Badge>
              </div>

              {service.description && (
                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{service.description}</p>
              )}

              <p className="text-xl font-bold mb-1">
                {formatPrice(service.priceCents)}
                {service.unitLabel && (
                  <span className="text-sm font-normal text-muted-foreground">/{service.unitLabel}</span>
                )}
              </p>

              {(service.minQuantity || service.maxQuantity) && (
                <p className="text-xs text-muted-foreground mb-3">
                  Qté: {service.minQuantity ?? 1} – {service.maxQuantity ?? '∞'}
                </p>
              )}

              {service.legacyKey && (
                <p className="text-xs font-mono text-muted-foreground mb-3 bg-muted px-2 py-1 rounded">
                  {service.legacyKey}
                </p>
              )}

              <div className="flex gap-2 mt-3">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => { setEditingService(service); setShowForm(true); }}
                >
                  <Edit2 className="w-3 h-3 mr-1" /> Modifier
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => void handleToggleActive(service)}
                  title={service.isActive ? 'Désactiver' : 'Activer'}
                >
                  {service.isActive
                    ? <ToggleRight className="w-4 h-4 text-green-500" />
                    : <ToggleLeft className="w-4 h-4" />}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setDeletingId(service.id)}
                  className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <ServiceFormModal
          service={editingService}
          onClose={() => setShowForm(false)}
          onSaved={load}
        />
      )}

      <ConfirmDialog
        open={!!deletingId}
        onClose={() => setDeletingId(null)}
        onConfirm={handleDelete}
        title="Supprimer ce service ?"
        description="Le service sera désactivé et ne sera plus proposé dans les nouvelles missions."
        confirmLabel="Supprimer"
        variant="destructive"
      />
    </div>
  );
}
