export class CreateActivityLogDto {
  actorId?: string | null;
  actorRole?: string | null;
  action: string;
  targetType?: string | null;
  targetId?: string | null;
  details?: Record<string, unknown> | null;
  ipAddress?: string | null;
}
