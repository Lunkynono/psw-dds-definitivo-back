import { SupabaseAdapter } from '../supabase/supabase.adapter';

/**
 * Clase base para los repositorios que trabajan sobre una única tabla.
 *
 * Aporta el acceso protegido al `SupabaseAdapter` y un helper `table()` que
 * devuelve la query builder apuntando a la tabla del repositorio. Las
 * subclases sólo tienen que implementar los métodos específicos del agregado.
 */
export abstract class BaseRepository {
  protected constructor(
    protected readonly supabase: SupabaseAdapter,
    protected readonly tableName: string
  ) {}

  /** Query builder de Supabase apuntado a la tabla del repositorio. */
  protected table() {
    return this.supabase.from(this.tableName);
  }
}
