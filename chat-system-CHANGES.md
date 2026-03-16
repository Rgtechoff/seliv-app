# chat-system — CHANGES

Agent: chat-system
Date: 2026-03-12

---

## Files Created

| File | Description |
|------|-------------|
| `backend/src/chat/entities/mission-interest.entity.ts` | TypeORM entity for `mission_interests` table — tracks which vendeurs have shown interest in a paid mission (unique constraint on missionId + vendeurId) |
| `backend/src/chat/chat-phase.service.ts` | Service that determines chat phase (pre/post acceptance), enforces 10-message pre-acceptance limit per sender (excluding presets and blocked messages), exposes `canSendMessage` and `getRemainingMessages` |

---

## Files Modified

| File | Changes |
|------|---------|
| `backend/src/chat/chat.gateway.ts` | Complete rewrite — added `ChatPhaseService` + `ModerationService` injection, `leaveMission` event, phase-aware message flow, `message_blocked` / `message_limit_reached` events, `remaining_messages` field on broadcast, `onMissionAccepted()` method that emits system message + `phaseChanged` event |
| `backend/src/chat/chat.service.ts` | Added `MissionInterest` repo injection; added methods: `getMissionById`, `registerInterest`, `getInterestedVendeurs`, `createSystemMessage`, `createMessage` (phase-aware, blocked messages not persisted) |
| `backend/src/chat/chat.module.ts` | Added `ChatPhaseService` to providers; added `MissionInterest` to `TypeOrmModule.forFeature`; added `forwardRef(() => MissionsModule)` to imports; exports `ChatGateway` so `MissionsModule` can inject it |
| `backend/src/chat/chat.controller.ts` | Added `ChatPhaseService` injection; added `GET :missionId/phase` endpoint; added `GET :missionId/interests` endpoint |
| `backend/src/missions/missions.service.ts` | Injected `ChatGateway` via `forwardRef`; `assignVendeur` now calls `chatGateway.onMissionAccepted()` after status transition to `assigned` |
| `backend/src/missions/missions.module.ts` | Added `forwardRef(() => ChatModule)` to imports to resolve circular dependency with ChatModule |

---

## WebSocket Events (namespace `/chat`)

### Client → Server (emit)

| Event | Payload | Description |
|-------|---------|-------------|
| `joinMission` | `string` missionId | Join the mission room. If sender is a vendeur on a `paid` mission, registers interest automatically |
| `leaveMission` | `string` missionId | Leave the mission room |
| `sendMessage` | `{ missionId: string, content: string, isPreset?: boolean, senderId: string }` | Send a message — goes through phase check, limit check, and moderation |
| `typing` | `{ missionId: string, userId: string }` | Typing indicator broadcast to other room members |

### Server → Client (on)

| Event | Payload | Description |
|-------|---------|-------------|
| `receiveMessage` | `MessagePayload` (see below) | New message broadcast to all room members |
| `message_blocked` | `{ missionId: string, reason: string }` | Message was blocked by moderation (score >= threshold). Message is NOT saved to DB |
| `message_limit_reached` | `{ missionId: string, reason: string, remaining: 0 }` | Sender has reached the 10-message pre-acceptance limit |
| `phaseChanged` | `{ missionId: string, newPhase: 'post_acceptance' }` | Emitted when a mission transitions from `paid` to `assigned` |
| `userTyping` | `{ userId: string }` | Typing indicator from another user |
| `newChatNotification:{userId}` | `{ missionId: string }` | Real-time badge update for the message recipient |
| `error` | `{ message: string }` | Generic error (invalid payload, unauthorized, mission not found) |

### MessagePayload shape

```typescript
{
  id: string,                                           // 'blocked' if message was blocked (won't reach client via receiveMessage)
  missionId: string,
  senderId: string,
  content: string,
  isPreset: boolean,
  isFlagged: boolean,                                   // true if moderationAction === 'flag'
  isSystem: boolean,                                    // true for system messages (e.g. phase transition)
  chatPhase: 'pre_acceptance' | 'post_acceptance',
  moderationAction: 'allow' | 'flag' | 'block',
  moderationScore: number,
  remaining_messages: number | null,                    // null = unlimited (post_acceptance or preset)
  chat_phase: 'pre_acceptance' | 'post_acceptance',     // redundant alias for frontend convenience
  createdAt: string,                                    // ISO date
}
```

---

## REST Endpoints Added

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/chat/conversations` | JWT | List all conversations for the current user (existing, unchanged) |
| `GET` | `/chat/:missionId/messages` | JWT | Message history for a mission (existing, unchanged) |
| `GET` | `/chat/presets` | JWT | Preset messages list (existing, unchanged) |
| `GET` | `/chat/:missionId/phase` | JWT | Returns `{ phase, remaining, missionId }` — phase is `pre_acceptance` or `post_acceptance`; `remaining` is null when unlimited |
| `GET` | `/chat/:missionId/interests` | JWT | Returns vendeurs who have shown interest in a mission (for client view). Each entry: `{ vendeurId, firstName, lastName (initial only), avatarUrl, createdAt }` |

---

## Business Rules Implemented

1. **Pre-acceptance phase** — missions in status `draft`, `pending_payment`, `paid` are in `pre_acceptance`. Chat is limited to **10 messages per sender** (presets excluded from count, blocked messages excluded from count).
2. **Post-acceptance phase** — missions in status `assigned`, `in_progress`, `completed` are in `post_acceptance`. Chat is unlimited.
3. **Moderation** — every non-preset message passes through `ModerationService.analyze()`. Blocked messages are NOT saved to DB (only logged by ModerationService in `moderation_logs`). Flagged messages ARE saved and broadcast but marked `isFlagged: true`.
4. **Interest tracking** — when a vendeur joins a `paid` mission room, they are automatically registered in `mission_interests`.
5. **Phase transition event** — when `MissionsService.assignVendeur()` is called, `ChatGateway.onMissionAccepted()` is triggered, which posts a system message and emits `phaseChanged` to all room members.
6. **Access control** — only the mission's client, assigned vendeur, or a browsing vendeur (on `paid` missions) can send messages. A vendeur is blocked if the mission is already assigned to another vendeur.

---

## Circular Dependency Resolution

`ChatModule` and `MissionsModule` have a circular dependency:
- `ChatModule` uses `Mission` entity (TypeORM)
- `MissionsModule` needs `ChatGateway` to fire `onMissionAccepted`

Resolved with `forwardRef(() => ...)` on both sides:
- `ChatModule` imports `forwardRef(() => MissionsModule)`
- `MissionsModule` imports `forwardRef(() => ChatModule)`
- `MissionsService` injects `ChatGateway` with `@Inject(forwardRef(() => ChatGateway))`
- `ChatModule` exports `ChatGateway` so it is accessible from `MissionsModule`

---

## DB Tables Auto-Created (TypeORM synchronize: true)

- `mission_interests` — new table with columns: `id` (uuid pk), `mission_id` (uuid fk), `vendeur_id` (uuid fk), `created_at` (timestamp). Unique constraint on `(mission_id, vendeur_id)`.
