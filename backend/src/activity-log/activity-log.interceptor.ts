import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request } from 'express';
import { ActivityLogService } from './activity-log.service';
import { User } from '../users/entities/user.entity';

type RouteMapping = [RegExp, string];

const ROUTE_MAPPINGS: RouteMapping[] = [
  [/POST \/api\/v1\/missions$/, 'mission.created'],
  [/PATCH \/api\/v1\/missions\/.+\/accept/, 'mission.assigned'],
  [/PATCH \/api\/v1\/missions\/.+\/complete/, 'mission.completed'],
  [/POST \/api\/v1\/payments\/.+\/cancel/, 'mission.cancelled'],
  [/POST \/api\/v1\/auth\/register/, 'user.created'],
  [/PATCH \/api\/v1\/users\/me/, 'user.updated'],
  [/PATCH \/api\/v1\/admin\/users\/.+\/validate/, 'user.validated'],
  [/POST \/api\/v1\/super-admin\/vendeurs\/.+\/suspend/, 'vendeur.suspended'],
  [/POST \/api\/v1\/super-admin\/vendeurs\/.+\/unsuspend/, 'vendeur.unsuspended'],
  [/PUT \/api\/v1\/super-admin\/vendeurs\/.+\/level/, 'vendeur.level_changed'],
  [/POST \/api\/v1\/super-admin\/clients\/.+\/suspend/, 'client.suspended'],
  [/POST \/api\/v1\/super-admin\/plans$/, 'plan.created'],
  [/PUT \/api\/v1\/super-admin\/plans\/.+/, 'plan.updated'],
  [/DELETE \/api\/v1\/super-admin\/plans\/.+/, 'plan.deleted'],
  [/POST \/api\/v1\/super-admin\/services$/, 'service.created'],
  [/PUT \/api\/v1\/super-admin\/services\/.+/, 'service.updated'],
  [/DELETE \/api\/v1\/super-admin\/services\/.+/, 'service.deleted'],
  [/POST \/api\/v1\/reviews/, 'review.created'],
  [/POST \/api\/v1\/subscriptions\/checkout/, 'subscription.created'],
];

function mapRouteToAction(method: string, path: string): string | null {
  // Skip non-mutation methods and sensitive/noisy paths
  if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) return null;
  if (path.includes('/auth/login') || path.includes('/health') || path.includes('/webhook')) {
    return null;
  }

  const key = `${method} ${path}`;
  for (const [pattern, action] of ROUTE_MAPPINGS) {
    if (pattern.test(key)) return action;
  }

  // Generic fallback
  const resource = path.split('/').filter(Boolean).pop() ?? 'resource';
  if (method === 'POST') return `${resource}.created`;
  if (method === 'DELETE') return `${resource}.deleted`;
  if (method === 'PATCH' || method === 'PUT') return `${resource}.updated`;
  return null;
}

@Injectable()
export class ActivityLogInterceptor implements NestInterceptor {
  constructor(private readonly activityLogService: ActivityLogService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const req = context
      .switchToHttp()
      .getRequest<Request & { user?: User }>();

    const method = req.method;
    const path = req.path;
    const action = mapRouteToAction(method, path);

    if (!action) return next.handle();

    const actor = req.user;
    const ip =
      (req.headers['x-forwarded-for'] as string | undefined)
        ?.split(',')[0]
        ?.trim() ?? req.socket?.remoteAddress ?? null;

    return next.handle().pipe(
      tap(() => {
        void this.activityLogService.log({
          actorId: actor?.id ?? null,
          actorRole: actor?.role ?? null,
          action,
          ipAddress: ip,
        });
      }),
    );
  }
}
