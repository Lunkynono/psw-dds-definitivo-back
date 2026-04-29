/**
 * Policy de errores de unicidad para votos.
 *
 * El backend de Supabase devuelve `code: '23505'` cuando se viola una
 * restricción `unique` (típicamente: el mismo juez intentando votar dos
 * veces el mismo proyecto, o el mismo correo público registrándose dos
 * veces en una sala).
 *
 * Aislar la traducción aquí evita repetir el "magic number" en los
 * servicios y permite re-mapear el mensaje de cara al usuario en un
 * único punto.
 */
export class DuplicateVotePolicy {
  static traducirError(error: unknown): never {
    const maybeError = error as { code?: string; message?: string };
    if (maybeError?.code === '23505') {
      throw new Error('Ya has votado en esta encuesta');
    }
    throw error instanceof Error ? error : new Error(maybeError?.message ?? 'No se pudo guardar el voto');
  }
}
