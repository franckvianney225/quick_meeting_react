import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    console.log('=== JWT GUARD ACTIVATED ===');
    console.log('Request URL:', request.url);
    console.log('Request Method:', request.method);
    const headers = request.headers;
    console.log('Authorization header present:', !!headers.authorization);
    if (headers.authorization) {
      console.log('Authorization header:', headers.authorization.substring(0, 50) + '...');
      
      // Vérifier le format du header
      if (!headers.authorization.startsWith('Bearer ')) {
        console.log('ERROR: Authorization header does not start with "Bearer "');
        throw new UnauthorizedException('Invalid authorization format');
      }
      
      const token = headers.authorization.substring(7);
      console.log('Token extracted:', token.substring(0, 20) + '...');
      console.log('Token length:', token.length);
    }
    
    try {
      const result = await super.canActivate(context);
      console.log('Guard canActivate result:', result);
      return result as boolean;
    } catch (error) {
      console.log('Guard canActivate ERROR:', error.message);
      console.log('Error stack:', error.stack);
      throw error;
    }
  }
}