'use client';

import * as React from 'react';
import {
  Plus, Edit2, Trash2, ToggleLeft, ToggleRight,
  GripVertical, Users, Check, Star,
} from 'lucide-react';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { apiClient } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PageHeader } from '@/components/shared/page-header';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { SkeletonCard } from '@/components/shared/skeleton';
import { formatPrice } from '@/lib/types';

interface Plan {
  id: string;
  name: string;
  slug: string;
  priceCents: number;
  billingPeriod: 'monthly' | 'yearly';
  features: string[];
  hourlyDiscountCents: number;
  canAccessStar: boolean;
  maxMissionsPerMonth: number | null;
  isActive: boolean;
  sortOrder: number;
  subscriberCount?: number;
}

// ─── Live Preview Card ────────────────────────────────────────────────────────

function PlanPreviewCard({ form }: { form: PlanFormState }) {
  const features = form.features.split('\n').map((f) => f.trim()).filter(Boolean);
  return (
    <div className="rounded-xl border-2 border-primary/30 bg-card p-5 flex flex-col h-full">
      <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-2">Aperçu</p>
      <h3 className="font-bold text-lg text-foreground">{form.name || 'Nom du plan'}</h3>
      <p className="text-2xl font-bold mt-1">
        {formatPrice(Number(form.priceCents))}
        <span className="text-sm font-normal text-muted-foreground">
          /{form.billingPeriod === 'monthly' ? 'mois' : 'an'}
        </span>
      </p>
      {form.canAccessStar && (
        <p className="flex items-center gap-1 text-xs text-amber-500 mt-1">
          <Star className="w-3 h-3" /> Accès vendeurs Star
        </p>
      )}
      <ul className="mt-3 space-y-1.5 flex-1">
        {features.slice(0, 5).map((f, i) => (
          <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
            <Check className="w-3.5 h-3.5 text-primary flex-shrink-0" />
            {f}
          </li>
        ))}
        {features.length === 0 && (
          <li className="text-sm text-muted-foreground/40 italic">Aucune feature</li>
        )}
      </ul>
      {Number(form.hourlyDiscountCents) > 0 && (
        <p className="text-xs text-green-600 dark:text-green-400 mt-3">
          -{formatPrice(Number(form.hourlyDiscountCents))}/h de réduction
        </p>
      )}
      {form.maxMissionsPerMonth && (
        <p className="text-xs text-muted-foreground mt-1">
          Max {form.maxMissionsPerMonth} missions/mois
        </p>
      )}
    </div>
  );
}

// ─── Form Modal ───────────────────────────────────────────────────────────────

interface PlanFormState {
  name: string;
  priceCents: number;
  billingPeriod: 'monthly' | 'yearly';
  features: string;
  hourlyDiscountCents: number;
  canAccessStar: boolean;
  maxMissionsPerMonth: string;
}

function PlanFormModal({
  plan,
  onClose,
  onSaved,
}: {
  plan?: Plan;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = React.useState<PlanFormState>({
    name: plan?.name ?? '',
    priceCents: plan?.priceCents ?? 0,
    billingPeriod: plan?.billingPeriod ?? 'monthly',
    features: plan?.features?.join('\n') ?? '',
    hourlyDiscountCents: plan?.hourlyDiscountCents ?? 0,
    canAccessStar: plan?.canAccessStar ?? false,
    maxMissionsPerMonth: plan?.maxMissionsPerMonth?.toString() ?? '',
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
        priceCents: Number(form.priceCents),
        billingPeriod: form.billingPeriod,
        features: form.features.split('\n').map((f) => f.trim()).filter(Boolean),
        hourlyDiscountCents: Number(form.hourlyDiscountCents),
        canAccessStar: form.canAccessStar,
        maxMissionsPerMonth: form.maxMissionsPerMonth ? Number(form.maxMissionsPerMonth) : null,
      };
      if (plan) {
        await apiClient.put(`/super-admin/plans/${plan.id}`, payload);
      } else {
        await apiClient.post('/super-admin/plans', payload);
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
      <div className="bg-card rounded-xl border border-border w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-lg font-semibold mb-4">{plan ? 'Modifier le plan' : 'Nouveau plan'}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Form */}
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
                  <label className="block text-sm font-medium mb-1">Période</label>
                  <select
                    className="w-full border border-input rounded-lg px-3 py-2 bg-background text-sm"
                    value={form.billingPeriod}
                    onChange={(e) => setForm((f) => ({ ...f, billingPeriod: e.target.value as 'monthly' | 'yearly' }))}
                  >
                    <option value="monthly">Mensuel</option>
                    <option value="yearly">Annuel</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Features (une par ligne)</label>
                <textarea
                  className="w-full border border-input rounded-lg px-3 py-2 bg-background text-sm h-24 resize-none"
                  value={form.features}
                  onChange={(e) => setForm((f) => ({ ...f, features: e.target.value }))}
                  placeholder={'Accès illimité\nSupport prioritaire\n...'}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Réduction horaire (cts)</label>
                  <input
                    type="number"
                    className="w-full border border-input rounded-lg px-3 py-2 bg-background text-sm"
                    value={form.hourlyDiscountCents}
                    onChange={(e) => setForm((f) => ({ ...f, hourlyDiscountCents: Number(e.target.value) }))}
                    min={0}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Max missions/mois</label>
                  <input
                    type="number"
                    className="w-full border border-input rounded-lg px-3 py-2 bg-background text-sm"
                    value={form.maxMissionsPerMonth}
                    onChange={(e) => setForm((f) => ({ ...f, maxMissionsPerMonth: e.target.value }))}
                    placeholder="illimité"
                    min={1}
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="canAccessStar"
                  checked={form.canAccessStar}
                  onChange={(e) => setForm((f) => ({ ...f, canAccessStar: e.target.checked }))}
                  className="w-4 h-4"
                />
                <label htmlFor="canAccessStar" className="text-sm font-medium">Accès vendeurs Star</label>
              </div>
              {error && <p className="text-sm text-red-500">{error}</p>}
              <div className="flex gap-2 pt-2">
                <Button type="button" variant="outline" onClick={onClose} className="flex-1">Annuler</Button>
                <Button type="submit" disabled={saving} className="flex-1">
                  {saving ? 'Sauvegarde...' : plan ? 'Modifier' : 'Créer'}
                </Button>
              </div>
            </form>

            {/* Live Preview */}
            <PlanPreviewCard form={form} />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Sortable Plan Card ───────────────────────────────────────────────────────

function SortablePlanCard({
  plan,
  onEdit,
  onDelete,
  onToggle,
}: {
  plan: Plan;
  onEdit: (p: Plan) => void;
  onDelete: (id: string) => void;
  onToggle: (p: Plan) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: plan.id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : undefined,
  };

  return (
    <div ref={setNodeRef} style={style} className="bg-card rounded-xl border border-border p-5">
      <div className="flex items-start gap-2">
        {/* Drag handle */}
        <button
          {...attributes}
          {...listeners}
          className="mt-1 cursor-grab active:cursor-grabbing text-muted-foreground/40 hover:text-muted-foreground transition-colors touch-none"
          aria-label="Réordonner"
        >
          <GripVertical className="w-4 h-4" />
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-3">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-foreground">{plan.name}</h3>
                {plan.canAccessStar && (
                  <Star className="w-3.5 h-3.5 text-amber-400" fill="currentColor" />
                )}
              </div>
              <p className="text-2xl font-bold mt-1">
                {formatPrice(plan.priceCents)}
                <span className="text-sm font-normal text-muted-foreground">
                  /{plan.billingPeriod === 'monthly' ? 'mois' : 'an'}
                </span>
              </p>
            </div>
            <div className="flex flex-col items-end gap-1">
              <Badge variant={plan.isActive ? 'default' : 'secondary'}>
                {plan.isActive ? 'Actif' : 'Inactif'}
              </Badge>
              {plan.subscriberCount !== undefined && (
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Users className="w-3 h-3" />
                  {plan.subscriberCount} abonné{plan.subscriberCount !== 1 ? 's' : ''}
                </span>
              )}
            </div>
          </div>

          <ul className="space-y-1.5 mb-4">
            {plan.features.slice(0, 4).map((f, i) => (
              <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                {f}
              </li>
            ))}
            {plan.features.length > 4 && (
              <li className="text-xs text-muted-foreground">+{plan.features.length - 4} autres</li>
            )}
          </ul>

          {plan.hourlyDiscountCents > 0 && (
            <p className="text-xs text-green-600 dark:text-green-400 mb-3">
              -{formatPrice(plan.hourlyDiscountCents)}/h de réduction
            </p>
          )}

          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="flex-1" onClick={() => onEdit(plan)}>
              <Edit2 className="w-3 h-3 mr-1" /> Modifier
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onToggle(plan)}
              title={plan.isActive ? 'Désactiver' : 'Activer'}
            >
              {plan.isActive
                ? <ToggleRight className="w-4 h-4 text-green-500" />
                : <ToggleLeft className="w-4 h-4" />}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(plan.id)}
              className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SuperAdminPlansPage() {
  const [plans, setPlans] = React.useState<Plan[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [showForm, setShowForm] = React.useState(false);
  const [editingPlan, setEditingPlan] = React.useState<Plan | undefined>();
  const [deletingId, setDeletingId] = React.useState<string | null>(null);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const load = () => {
    apiClient.get('/super-admin/plans').then((res) => {
      setPlans(res.data as Plan[]);
    }).catch(console.error).finally(() => setLoading(false));
  };

  React.useEffect(() => { load(); }, []);

  const handleToggleActive = async (plan: Plan) => {
    await apiClient.put(`/super-admin/plans/${plan.id}`, { isActive: !plan.isActive });
    load();
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    await apiClient.delete(`/super-admin/plans/${deletingId}`);
    setDeletingId(null);
    load();
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = plans.findIndex((p) => p.id === active.id);
    const newIndex = plans.findIndex((p) => p.id === over.id);
    const reordered = arrayMove(plans, oldIndex, newIndex);

    // Optimistic update
    setPlans(reordered);

    try {
      await apiClient.patch('/super-admin/plans/reorder', { ids: reordered.map((p) => p.id) });
    } catch {
      // Rollback on error
      load();
    }
  };

  return (
    <div>
      <PageHeader
        title="Plans & Abonnements"
        description="Gérez les formules d'abonnement proposées aux clients. Glissez pour réordonner."
        actions={
          <Button onClick={() => { setEditingPlan(undefined); setShowForm(true); }}>
            <Plus className="w-4 h-4 mr-2" />
            Nouveau plan
          </Button>
        }
      />

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={(e) => void handleDragEnd(e)}>
          <SortableContext items={plans.map((p) => p.id)} strategy={verticalListSortingStrategy}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {plans.map((plan) => (
                <SortablePlanCard
                  key={plan.id}
                  plan={plan}
                  onEdit={(p) => { setEditingPlan(p); setShowForm(true); }}
                  onDelete={(id) => setDeletingId(id)}
                  onToggle={(p) => void handleToggleActive(p)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {showForm && (
        <PlanFormModal
          plan={editingPlan}
          onClose={() => setShowForm(false)}
          onSaved={load}
        />
      )}

      <ConfirmDialog
        open={!!deletingId}
        onClose={() => setDeletingId(null)}
        onConfirm={handleDelete}
        title="Désactiver ce plan ?"
        description="Les abonnés actuels garderont leur plan jusqu'à expiration."
        confirmLabel="Désactiver"
        variant="destructive"
      />
    </div>
  );
}
