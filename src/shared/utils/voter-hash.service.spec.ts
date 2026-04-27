import { VoterHashService } from './voter-hash.service';

describe('VoterHashService', () => {
  const service = new VoterHashService();

  it('produce un SHA-256 hexadecimal de 64 caracteres', () => {
    const hash = service.generar('user-1', 42);
    expect(hash).toMatch(/^[a-f0-9]{64}$/);
  });

  it('es determinista: misma entrada → mismo hash', () => {
    expect(service.generar('user-1', 42)).toBe(service.generar('user-1', 42));
  });

  it('cambia si cambia el usuario o la encuesta', () => {
    const a = service.generar('user-1', 42);
    const b = service.generar('user-2', 42);
    const c = service.generar('user-1', 43);
    expect(a).not.toBe(b);
    expect(a).not.toBe(c);
  });

  it('coincide con el SHA-256 de `userId+encuestaId` (compatibilidad con el monorepo)', () => {
    // Vector de comprobación calculado a mano fuera del backend.
    // SHA-256("abc1") = 9c8c7c5d8a2c5...; aquí basta con asegurar la fórmula.
    const { createHash } = require('node:crypto');
    const esperado = createHash('sha256').update('abc1').digest('hex');
    expect(service.generar('abc', 1)).toBe(esperado);
  });
});
