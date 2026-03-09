export type UserRole = 'client' | 'vendeur' | 'moderateur' | 'admin' | 'super_admin';
export type VendorLevel = 'debutant' | 'confirme' | 'star';
export type SubscriptionPlan = 'basic' | 'pro';
export type MissionStatus =
  | 'draft'
  | 'pending_payment'
  | 'paid'
  | 'assigned'
  | 'in_progress'
  | 'completed'
  | 'cancelled';
export type VolumeEnum = '30' | '50' | '100' | '200';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  firstName: string;
  lastName: string;
  companyName?: string | null;
  siret?: string | null;
  zones: string[];
  categories: string[];
  level?: VendorLevel | null;
  isStar: boolean;
  isValidated: boolean;
  bio?: string | null;
  avatarUrl?: string | null;
  stripeCustomerId?: string | null;
  createdAt: string;
}

export interface Mission {
  id: string;
  clientId: string;
  vendeurId?: string | null;
  status: MissionStatus;
  date: string;
  startTime: string;
  durationHours: number;
  address: string;
  city: string;
  category: string;
  volume: VolumeEnum;
  basePrice: number;
  optionsPrice: number;
  discount: number;
  totalPrice: number;
  stripePaymentId?: string | null;
  paidAt?: string | null;
  cancelledAt?: string | null;
  cancellationReason?: string | null;
  completedAt?: string | null;
  createdAt: string;
  client?: Partial<User>;
  vendeur?: Partial<User>;
}

export interface Subscription {
  id: string;
  userId: string;
  plan: SubscriptionPlan;
  status: string;
  currentPeriodStart?: string | null;
  currentPeriodEnd?: string | null;
  hourlyDiscount: number;
}

export interface Review {
  id: string;
  missionId: string;
  clientId: string;
  vendeurId: string;
  rating: number;
  comment?: string | null;
  isVisible: boolean;
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  body: string;
  missionId?: string | null;
  isRead: boolean;
  createdAt: string;
}

export interface ApiResponse<T> {
  data: T;
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
    totalPages?: number;
    average?: number;
    count?: number;
  };
  error?: string;
}

// Utilities
export function centimesToEuros(centimes: number): number {
  return centimes / 100;
}

export function formatPrice(centimes: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
  }).format(centimesToEuros(centimes));
}

export const MISSION_STATUS_LABELS: Record<MissionStatus, string> = {
  draft: 'Brouillon',
  pending_payment: 'En attente de paiement',
  paid: 'Payée',
  assigned: 'Vendeur assigné',
  in_progress: 'En cours',
  completed: 'Terminée',
  cancelled: 'Annulée',
};

export const CATEGORIES = [
  'Mode',
  'Tech',
  'Bijoux',
  'Sport',
  'Maison',
  'Beauté',
  'Autre',
];

export const VOLUMES: { value: VolumeEnum; label: string; rate: number }[] = [
  { value: '30', label: '30 articles', rate: 80 },
  { value: '50', label: '50 articles', rate: 90 },
  { value: '100', label: '100 articles', rate: 110 },
  { value: '200', label: '200+ articles', rate: 140 },
];

export const OPTIONS_CATALOG = [
  { key: 'prep_30', label: 'Préparation Pack 30', price: 4900 },
  { key: 'prep_50', label: 'Préparation Pack 50', price: 7900 },
  { key: 'prep_100', label: 'Préparation Pack 100', price: 12900 },
  { key: 'prep_200', label: 'Préparation Pack 200-500', price: 19900 },
  { key: 'etiquetage_30', label: 'Étiquetage 30 articles', price: 1500 },
  { key: 'etiquetage_50', label: 'Étiquetage 50 articles', price: 2500 },
  { key: 'etiquetage_100', label: 'Étiquetage 100 articles', price: 5000 },
  { key: 'conditionnement', label: 'Conditionnement léger (≤5kg)', price: 2900 },
  { key: 'creation_compte', label: 'Création compte Whatnot/TikTok', price: 3900 },
  { key: 'script_live', label: 'Script / Organisation Live', price: 5900 },
];
