export interface JwtPayload {
  sub: number; // O el tipo correcto de tu ID de usuario
  email: string;
  // Puedes agregar otras propiedades que estén en tu payload
  iat?: number;
  exp?: number;
}
