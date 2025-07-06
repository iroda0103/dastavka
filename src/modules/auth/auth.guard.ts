import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { FastifyRequest } from 'fastify';
import { ConfigService } from '@nestjs/config';
import { Observable } from 'rxjs';

@Injectable()
export class IsLoggedIn implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException();
    }
    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get<string>('JWT_SECRET'),
      });
      request['user'] = payload['user'];
    } catch (err) {
      throw new UnauthorizedException({
        error: err.message,
        message: err,
      });
    }
    return true;
  }

  private extractTokenFromHeader(request: FastifyRequest): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}

@Injectable()
export class HasRole implements CanActivate {
  constructor(protected roles: string[]) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const request = context.switchToHttp().getRequest<Request>();
      const hasRole = this.roles.some((role) => role === request['user'].role);

      if (!hasRole) throw new ForbiddenException('Access denied');
      return true;
    } catch (err) {
      throw new ForbiddenException('Access denied');
    }
  }
}
