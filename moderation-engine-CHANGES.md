# moderation-engine — CHANGES

## Agent: moderation-engine
## Date: 2026-03-12

---

## Files Created

### New directory: `backend/src/chat/moderation/`

| File | Description |
|------|-------------|
| `backend/src/chat/moderation/entities/moderation-log.entity.ts` | TypeORM entity for `moderation_logs` table — stores all analysis results (allow, flag, block) |
| `backend/src/chat/moderation/normalizer.service.ts` | Text normalization pipeline: strip separators, homoglyph/leet-speak substitution, accent removal, French number-word → digit conversion |
| `backend/src/chat/moderation/detectors/phone.detector.ts` | Detects French mobile/landline phone numbers (direct and obfuscated via normalizer) |
| `backend/src/chat/moderation/detectors/email.detector.ts` | Detects email addresses (direct regex, obfuscated, textual descriptions with at/dot/domain keywords) |
| `backend/src/chat/moderation/detectors/social.detector.ts` | Detects messaging app names (WhatsApp, Telegram, etc.), social networks, invite phrases, pseudo @mentions, direct URLs |
| `backend/src/chat/moderation/detectors/split.detector.ts` | Detects split-message evasion: combines the last 5 non-flagged messages (3-min window) with the current message and re-runs phone/email detectors on the concatenation |
| `backend/src/chat/moderation/moderation.service.ts` | Main service: orchestrates all detectors, computes score, determines action, logs every analysis to `moderation_logs` |
| `backend/src/chat/moderation/moderation.module.ts` | NestJS module — registers `ModerationLog` and `ChatMessage` repos, provides and exports `ModerationService` |

---

## Files Modified

### `backend/src/chat/chat.module.ts`
- Added `import { ModerationModule }` from `./moderation/moderation.module`
- Added `ModerationModule` to `imports[]`
- Added `ModerationModule` to `exports[]` (consumers of `ChatModule` can inject `ModerationService`)

### `backend/src/chat/entities/chat-message.entity.ts`
- Added `chatPhase: string` column (`chat_phase VARCHAR(20) DEFAULT 'post_acceptance'`)
- Added `moderationAction: string` column (`moderation_action VARCHAR(10) DEFAULT 'allow'`)
- Added `moderationScore: number` column (`moderation_score INT DEFAULT 0`)

---

## Database

New table auto-created by TypeORM `synchronize: true`:

```
moderation_logs
  id               UUID PK
  mission_id       VARCHAR nullable
  sender_id        VARCHAR nullable
  original_message TEXT
  normalized_message TEXT
  action           VARCHAR(10)   -- 'allow' | 'flag' | 'block'
  score            INT
  reasons          TEXT[]
  phase            VARCHAR(20)   -- 'pre_acceptance' | 'post_acceptance'
  created_at       TIMESTAMPTZ
```

New columns added to `chat_messages`:
```
  chat_phase        VARCHAR(20) DEFAULT 'post_acceptance'
  moderation_action VARCHAR(10) DEFAULT 'allow'
  moderation_score  INT         DEFAULT 0
```

---

## ModerationService Public Interface

### `analyze()`

```typescript
ModerationService.analyze(
  content: string,
  senderId: string,
  missionId: string,
  phase: 'pre_acceptance' | 'post_acceptance'
): Promise<ModerationResult>

interface ModerationResult {
  action: 'allow' | 'flag' | 'block';
  score: number;
  reasons: string[];        // list of triggered detector type strings
  phase: 'pre_acceptance' | 'post_acceptance';
}
```

Every call is logged to `moderation_logs`, including `allow` results.

### `getLogs(filters)`

```typescript
ModerationService.getLogs(filters: {
  action?: string;
  senderId?: string;
  phase?: string;
  limit?: number;   // default 50
  offset?: number;  // default 0
}): Promise<[ModerationLog[], number]>
```

### `getStats()`

```typescript
ModerationService.getStats(): Promise<{
  blockedToday: number;
  flaggedToday: number;
  totalLogs: number;
}>
```

---

## Scoring Thresholds

| Phase | block | flag |
|-------|-------|------|
| `pre_acceptance` | score >= 35 | score >= 15 |
| `post_acceptance` | score >= 50 | score >= 25 |

Pre-acceptance is stricter because the mission has not started yet — the platform has no obligation to allow contact information exchange at that stage.

---

## Detector Score Reference

| Detector | Type | Score |
|----------|------|-------|
| PhoneDetector | phone_mobile | 60 |
| PhoneDetector | phone_mobile_intl | 60 |
| PhoneDetector | phone_fixe | 55 |
| PhoneDetector | phone_fixe_intl | 55 |
| PhoneDetector | phone_long | 40 |
| PhoneDetector | phone_partial | 20 |
| EmailDetector | email_direct | 60 |
| EmailDetector | email_obfuscated | 60 |
| EmailDetector | email_textual | 55 |
| EmailDetector | email_domain | 50 |
| EmailDetector | email_brackets | 55 |
| EmailDetector | email_domain_dot | 25 |
| SocialDetector | messaging_app | 40–60 |
| SocialDetector | social_network | 30–50 |
| SocialDetector | invite_phrase | 35 |
| SocialDetector | pseudo | 30 |
| SocialDetector | url_direct | 50 |
| SocialDetector | url_social | 50 |
| SplitDetector | split_phone | base + 10 |
| SplitDetector | split_email | base + 10 |

---

## Usage (for chat-system agent)

To use `ModerationService` in another module that already imports `ChatModule`:

```typescript
// In any module that imports ChatModule:
import { ModerationService } from '../chat/moderation/moderation.service';

// Inject:
constructor(private readonly moderationService: ModerationService) {}

// Call before saving a message:
const result = await this.moderationService.analyze(
  content,
  senderId,
  missionId,
  missionAccepted ? 'post_acceptance' : 'pre_acceptance',
);

if (result.action === 'block') {
  throw new ForbiddenException('Message bloqué par la modération');
}
// result.action === 'flag' → save with isFlagged: true, moderationAction: 'flag'
// result.action === 'allow' → save normally
```

Note: `ModerationModule` is exported from `ChatModule`. Any module that imports `ChatModule` can inject `ModerationService` directly without re-importing `ModerationModule`.

---

## False-Positive Philosophy

Scores are cumulative across 4 detectors. A single low-score signal (e.g., `email_domain_dot` = 25 in post_acceptance) will NOT block. The system is tuned so that:

- "J'ai 100 articles en stock" → score 0 (no detector fires) → allow
- "mon 06 12 34 56 78" → score 60 (phone_mobile) → block (both phases)
- "point gmail" alone → score 25 (email_domain_dot) → flag pre_acceptance, allow post_acceptance
