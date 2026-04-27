import { createHash } from 'node:crypto';
import { Injectable } from '@nestjs/common';

/**
 * Genera el "voter hash" determinista que identifica unívocamente al voto
 * de un juez en una encuesta concreta.
 *
 * El hash es `SHA-256(userId + encuestaId)` y se almacena en la columna
 * `voter_hash` de la tabla `voto`. Su uso es doble:
 *  - Permitir UNIQUE(`encuesta_id`, `voter_hash`) para impedir doble voto.
 *  - No exponer en BD el `userId` real del juez asociado a cada voto.
 *
 * El algoritmo es idéntico al del frontend del monorepo original
 * (`src/utils/hash.js`) — los hashes generados aquí coinciden con los
 * que ya hubiera podido escribir la app legacy.
 */
@Injectable()
export class VoterHashService {
  generar(userId: string, encuestaId: number): string {
    return createHash('sha256').update(`${userId}${encuestaId}`).digest('hex');
  }
}
