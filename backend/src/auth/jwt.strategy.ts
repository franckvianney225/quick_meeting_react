import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';

interface JwtPayload {
  sub: number;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    console.log('=== JWT STRATEGY CONSTRUCTOR ===');
    console.log('JWT_SECRET from env:', process.env.JWT_SECRET ? 'PRESENT' : 'MISSING');
    console.log('Using secret key:', process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production');
    
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production',
    });
    
    console.log('=== JWT STRATEGY INITIALIZED ===');
  }

  async validate(payload: JwtPayload) {
    console.log('=== JWT VALIDATION START ===');
    console.log('JWT Payload received:', payload);
    console.log('Token expiration:', payload.exp ? new Date(payload.exp * 1000) : 'No expiration');
    console.log('Current time:', new Date());
    
    try {
      const user = await this.authService.validateToken(payload);
      
      console.log('JWT VALIDATION SUCCESS: User found:', { id: user.id, email: user.email });
      console.log('=== JWT VALIDATION END ===');
      
      return {
        id: user.id,
        email: user.email,
        role: user.role
      };
    } catch (error) {
      console.log('JWT VALIDATION FAILED:', error.message);
      console.log('=== JWT VALIDATION END WITH ERROR ===');
      throw new UnauthorizedException();
    }
  }
}