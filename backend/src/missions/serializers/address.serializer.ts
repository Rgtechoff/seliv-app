import { Mission } from '../entities/mission.entity';
import { UserRole } from '../../common/enums/user-role.enum';

export interface AddressResponse {
  address_display: string;
  address_street: string | null;
  address_city: string | null;
  address_postal_code: string | null;
  address_masked: boolean;
}

export function serializeAddress(
  mission: Mission,
  viewer?: { id: string; role: string } | null,
): AddressResponse {
  const street = mission.addressStreet ?? mission.address ?? null; // fallback ancien champ
  const city = mission.addressCity ?? mission.city ?? null;
  const postalCode = mission.addressPostalCode ?? null;

  const cityDisplay = [city, postalCode].filter(Boolean).join(' ');
  const fullDisplay = [street, cityDisplay].filter(Boolean).join(', ');
  const maskedDisplay = cityDisplay || street || 'Adresse non renseignée';

  if (!viewer) {
    return {
      address_display: maskedDisplay,
      address_street: null,
      address_city: city,
      address_postal_code: postalCode,
      address_masked: true,
    };
  }

  const isClient = viewer.id === mission.clientId;
  const isAdmin = [
    UserRole.ADMIN,
    UserRole.SUPER_ADMIN,
    UserRole.MODERATEUR,
  ].includes(viewer.role as UserRole);
  const isAssignedVendeur =
    viewer.id === mission.vendeurId &&
    ['assigned', 'in_progress', 'completed'].includes(mission.status);

  if (isClient || isAdmin || isAssignedVendeur) {
    return {
      address_display: fullDisplay,
      address_street: street,
      address_city: city,
      address_postal_code: postalCode,
      address_masked: false,
    };
  }

  // Vendeur non-assigné ou autre rôle non autorisé
  return {
    address_display: maskedDisplay,
    address_street: null,
    address_city: city,
    address_postal_code: postalCode,
    address_masked: true,
  };
}
