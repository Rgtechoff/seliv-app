# Address Masking — CHANGES

Agent: address-masking
Date: 2026-03-12

---

## Files Modified

### Backend

| File | Change |
|------|--------|
| `backend/src/missions/entities/mission.entity.ts` | Added 3 nullable columns: `address_street`, `address_city`, `address_postal_code` |
| `backend/src/missions/dto/create-mission.dto.ts` | Added optional fields: `addressStreet`, `addressCity`, `addressPostalCode` |
| `backend/src/missions/missions.service.ts` | `create()` now persists the 3 new address fields from DTO |
| `backend/src/missions/missions.controller.ts` | All endpoints now apply `serializeAddress()` — viewer-aware masking |

### Backend — New Files

| File | Description |
|------|-------------|
| `backend/src/missions/serializers/address.serializer.ts` | `serializeAddress(mission, viewer?)` — returns `AddressResponse` |

### Frontend

| File | Change |
|------|--------|
| `frontend/src/lib/types.ts` | Added `address_display`, `address_street`, `address_city`, `address_postal_code`, `address_masked` to `Mission` interface |
| `frontend/src/app/(client)/missions/new/page.tsx` | Address field replaced by 3 fields + privacy notice banner |
| `frontend/src/app/(client)/missions/[id]/page.tsx` | Address display uses `address_display` with fallback |
| `frontend/src/app/(vendeur)/vendeur/missions/page.tsx` | Passes `addressSlot` to `MissionCard` with lock icon when masked |
| `frontend/src/app/(vendeur)/vendeur/missions/[id]/page.tsx` | Full address reveal with Copy + Google Maps buttons; amber info-box when masked |
| `frontend/src/components/mission-card.tsx` | Added `addressSlot` prop; uses `address_display` fallback in city row |

---

## AddressResponse Format

```typescript
interface AddressResponse {
  address_display: string;    // City + postal (masked) OR full address (revealed)
  address_street: string | null; // NULL when masked — never sent to unauth viewer
  address_city: string | null;
  address_postal_code: string | null;
  address_masked: boolean;    // true = vendeur cannot see street
}
```

### Masking Rules

| Viewer | address_masked | address_street |
|--------|---------------|----------------|
| No viewer (anonymous) | `true` | `null` |
| Client (own mission) | `false` | full street |
| Admin / Modérateur / Super-admin | `false` | full street |
| Vendeur assigned (`assigned`, `in_progress`, `completed`) | `false` | full street |
| Vendeur not assigned | `true` | `null` |

---

## Fallback Strategy (backward compatibility)

- Entity still has the legacy `address` and `city` columns (not removed)
- `serializeAddress` falls back: `addressStreet ?? address`, `addressCity ?? city`
- New missions created from the updated form send all 3 new fields + legacy `address` computed as `${addressStreet}, ${addressCity} ${addressPostalCode}`
- Old missions in DB (with `address_street = null`) will display `city` as `address_display` when masked — no data loss

---

## API Endpoints Affected

- `POST /missions` — create stores new fields, returns masked/revealed per client
- `GET /missions/my` — client sees full address; vendeur sees own missions with revealed address (assigned/completed)
- `GET /missions/available` — vendeur sees masked address (only city + postal)
- `GET /missions/:id` — vendeur detail: masked until assigned; client/admin: always revealed
- `PATCH /missions/:id/accept` — after accept, response includes revealed address
- `PATCH /missions/:id/complete` — revealed address in response

---

## Notes for chat-frontend teammate

The `address_display` field is always safe to render — it is either:
- The full address (e.g. `42 rue de la Paix, Paris 75011`) when `address_masked === false`
- City + postal only (e.g. `Paris 75011`) when `address_masked === true`

Never read `address_street` directly for display — always use `address_display`.
Check `address_masked` to decide whether to show the lock icon.
