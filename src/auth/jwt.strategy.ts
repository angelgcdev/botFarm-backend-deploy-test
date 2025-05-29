import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, JwtFromRequestFunction, Strategy } from 'passport-jwt';
import { JwtPayload } from './types/jwt-payload.interface';

// Extraer el token desde la cookie
const cookieExtractor: JwtFromRequestFunction = (
  req: Request,
): string | null => {
  const cookies = req?.cookies as { access_token?: string };
  return cookies?.access_token || null;
};

// Extraer token desde el header  Authorization: Bearer TOKEN
const headerExtractor: JwtFromRequestFunction =
  ExtractJwt.fromAuthHeaderAsBearerToken();

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        headerExtractor, // Primero revisa si hay header comentar o borrar esto luego de las pruebas
        cookieExtractor, // Si no, revisa cookies
      ]),
      ignoreExpiration: false,
      secretOrKey: config.get<string>('JWT_SECRET') || 'secreto_super_seguro',
    });
  }

  validate(payload: JwtPayload) {
    // Este objeto estara disponible en req.user
    return { sub: payload.sub, email: payload.email };
  }
}
