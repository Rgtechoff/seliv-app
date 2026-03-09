import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { UserRole } from '../enums/user-role.enum';
import { User } from '../../users/entities/user.entity';

@Injectable()
export class SuperAdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<{ user: User }>();
    if (request.user?.role !== UserRole.SUPER_ADMIN) {
      throw new ForbiddenException('Super admin access required');
    }
    return true;
  }
}
