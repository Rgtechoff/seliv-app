# Module vendeurs-public

Annuaire public des vendeurs SELIV. Ce module expose une API permettant aux utilisateurs
authentifiés de consulter les profils vendeurs validés, avec filtrage, tri et pagination.

---

## Endpoints

### GET /api/v1/vendeurs-public

Liste paginée des vendeurs validés.

**Authentification** : JWT requis (tous rôles : client, vendeur, moderateur, admin)

**Query params** :

| Paramètre   | Type   | Description                                                       | Exemple                  |
|-------------|--------|-------------------------------------------------------------------|--------------------------|
| `categories`| string | Catégories séparées par virgule (intersection PostgreSQL `&&`)    | `mode,tech`              |
| `zones`     | string | Zones géographiques séparées par virgule (intersection `&&`)      | `Paris,Lyon`             |
| `level`     | string | Niveaux séparés par virgule (`debutant`, `confirme`, `star`)      | `star,confirme`          |
| `minRating` | number | Note minimale (0–5)                                               | `4`                      |
| `sort`      | string | Tri : `rating_desc`, `missions_desc`, `name_asc` (défaut)        | `rating_desc`            |
| `page`      | number | Numéro de page (défaut : 1)                                       | `2`                      |
| `limit`     | number | Résultats par page (défaut : 20, max : 100)                       | `10`                     |

**Réponse 200** :

```json
{
  "data": [
    {
      "id": "uuid",
      "firstName": "Jean",
      "lastNameInitial": "D.",
      "avatarUrl": "https://...",
      "bio": "Expert en... (tronquée à 150 caractères)",
      "zones": ["Paris", "Ile-de-France"],
      "categories": ["mode", "luxe"],
      "level": "confirme",
      "isStar": false,
      "ratingAvg": 4.7,
      "missionsCount": 12
    }
  ],
  "meta": {
    "total": 42,
    "page": 1,
    "limit": 20,
    "totalPages": 3
  }
}
```

---

### GET /api/v1/vendeurs-public/:id

Profil complet d'un vendeur avec ses avis visibles.

**Authentification** : JWT requis (tous rôles)

**Paramètre URL** : `id` — UUID du vendeur (validé par `ParseUUIDPipe`)

**Réponse 200** :

```json
{
  "id": "uuid",
  "firstName": "Jean",
  "lastNameInitial": "D.",
  "avatarUrl": "https://...",
  "bio": "Biographie complète (non tronquée)",
  "zones": ["Paris", "Ile-de-France"],
  "categories": ["mode", "luxe"],
  "level": "confirme",
  "isStar": false,
  "ratingAvg": 4.7,
  "missionsCount": 12,
  "reviews": [
    {
      "rating": 5,
      "comment": "Excellent travail !",
      "clientFirstName": "Marie",
      "createdAt": "2024-03-15T10:30:00.000Z"
    }
  ]
}
```

**Réponse 404** : Vendeur introuvable ou non validé.

---

## Types TypeScript (pour le frontend)

```typescript
type VendorLevel = 'debutant' | 'confirme' | 'star';

interface VendeurPublicItem {
  id: string;
  firstName: string;
  lastNameInitial: string;       // ex: "D."
  avatarUrl: string | null;
  bio: string | null;            // tronquée à 150 chars dans la liste
  zones: string[];
  categories: string[];
  level: VendorLevel | null;
  isStar: boolean;
  ratingAvg: number;             // 0 si aucun avis, arrondi à 1 décimale
  missionsCount: number;         // missions au statut "completed" uniquement
}

interface ReviewPublic {
  rating: number;
  comment: string | null;
  clientFirstName: string;
  createdAt: string;             // ISO 8601
}

interface VendeurPublicDetail extends VendeurPublicItem {
  bio: string | null;            // complète (non tronquée)
  reviews: ReviewPublic[];
}

interface ListResponse {
  data: VendeurPublicItem[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
```

---

## Regles de securite appliquees

1. **JWT obligatoire** : Tous les endpoints sont protégés par `JwtAuthGuard`. Aucun accès anonyme.

2. **Donnees sensibles jamais exposees** : Les champs `email`, `phoneEncrypted`, `passwordHash` et `lastName` complet ne sont jamais retournés. Seule l'initiale du nom (`lastNameInitial`) est exposée.

3. **Vendeurs Star reserves aux abonnes Pro** :
   - Si l'utilisateur n'a pas d'abonnement actif avec `plan = 'pro'`, les vendeurs `is_star = true` sont **exclus** de la liste et retournent 404 sur le détail.
   - Vérification via `SubscriptionsService.findActiveByUserId()`.

4. **Uniquement les vendeurs valides** : Filtre systématique `is_validated = true` et `role = 'vendeur'`.

5. **Uniquement les avis visibles** : Filtre `is_visible = true` sur les reviews.

6. **Pas de synchronize** : Le module utilise les entités existantes sans créer de nouvelles tables.

---

## Architecture technique

- **Service** : `VendeursPublicService` — utilise `DataSource` pour des raw queries optimisées (évite le problème N+1). Calcul de `ratingAvg` et `missionsCount` via `LEFT JOIN` + `GROUP BY` dans une seule requête SQL.
- **Controller** : `VendeursPublicController` — route `GET /vendeurs-public` et `GET /vendeurs-public/:id`.
- **DTO** : `VendeursQueryDto` — validation via `class-validator`, transformation via `class-transformer`.
- **Module** : importe `SubscriptionsModule` (pour la vérification Pro/Star).

---

## Notes d'integration frontend

- Le champ `bio` est tronqué a 150 caracteres dans la liste (`GET /vendeurs-public`), mais complet dans le detail (`GET /vendeurs-public/:id`).
- `ratingAvg` est `0` (et non `null`) quand le vendeur n'a aucun avis.
- `missionsCount` compte uniquement les missions au statut `completed`.
- `lastNameInitial` est une chaine vide `""` si le champ `lastName` est absent (cas improbable en production).
- Les vendeurs Star (`isStar: true`) n'apparaissent dans les resultats que si le JWT appartient a un utilisateur avec un abonnement Pro actif.
