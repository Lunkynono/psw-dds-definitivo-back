import { Injectable } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { SupabaseClientSingleton } from './supabase-client.singleton';

/**
 * Adapter sobre `SupabaseClient`.
 *
 * Centraliza el acceso al cliente para que el resto del código (sobre todo
 * los repositorios) hable con esta clase y no directamente con la SDK de
 * Supabase. Si en algún momento se quiere migrar a Postgres directo o
 * añadir métricas/logging por cada consulta, este adapter es el único
 * punto que habría que tocar.
 */
@Injectable()
export class SupabaseAdapter {
  constructor(private readonly singleton: SupabaseClientSingleton) {}

  /** Acceso a una tabla concreta para encadenar la API fluent de Supabase. */
  from(table: string) {
    return this.singleton.getClient().from(table);
  }

  /** Acceso a la API de auth (registro, login, etc.). */
  auth(): SupabaseClient['auth'] {
    return this.singleton.getClient().auth;
  }

  /** Llamada a una RPC de Postgres. */
  rpc(fn: string, params?: Record<string, unknown>) {
    return this.singleton.getClient().rpc(fn, params);
  }

  /** Acceso a Supabase Storage. */
  storage() {
    return this.singleton.getClient().storage;
  }
}
