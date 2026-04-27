import { Injectable } from '@nestjs/common';

/**
 * Generador de códigos de sala para las encuestas con voto público.
 *
 * Usa un alfabeto sin caracteres ambiguos (sin `O`, `0`, `I`, `1`) para
 * evitar errores de transcripción cuando los participantes lo introducen
 * a mano en `EnterRoomPage`. Por defecto genera códigos de 6 caracteres.
 *
 * Si en el futuro se quiere garantizar unicidad fuerte, se puede sustituir
 * la implementación por una basada en `randomBytes` o por una consulta a BD
 * sin afectar al resto del sistema.
 */
@Injectable()
export class SurveyCodeGenerator {
  private static readonly ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

  generar(longitud = 6): string {
    return Array.from({ length: longitud }, () => {
      const idx = Math.floor(Math.random() * SurveyCodeGenerator.ALPHABET.length);
      return SurveyCodeGenerator.ALPHABET[idx];
    }).join('');
  }
}
