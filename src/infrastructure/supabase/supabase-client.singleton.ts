import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

/**
 * Singleton de Supabase: garantiza una única instancia de `SupabaseClient`
 * en todo el backend.
 *
 * - Usa preferentemente la `SUPABASE_SERVICE_ROLE_KEY` (que el backend tiene
 *   y el frontend nunca debe tener) para poder hacer inserts/upserts sin
 *   topar con políticas RLS pensadas para uso desde el navegador.
 * - Cae en `SUPABASE_ANON_KEY` para entornos donde sólo se quiere leer
 *   datos públicos (p. ej. tests sin permisos elevados).
 * - Desactiva la persistencia de sesión y el refresco automático de tokens:
 *   el backend nunca mantiene sesión, cada request ya viene con `x-user-id`.
 */
@Injectable()
export class SupabaseClientSingleton {
  private client: SupabaseClient | null = null;

  constructor(private readonly config: ConfigService) {}

  getClient(): SupabaseClient {
    if (!this.client) {
      const url = this.config.getOrThrow<string>('SUPABASE_URL');
      const key = this.config.getOrThrow<string>('SUPABASE_SERVICE_ROLE_KEY');
      this.assertServiceRoleKey(key);

      this.client = createClient(url, key, {
        auth: { persistSession: false, autoRefreshToken: false }
      });
    }

    return this.client;
  }

  private assertServiceRoleKey(key: string) {
    const payload = key.split('.')[1];
    if (!payload) {
      throw new Error('SUPABASE_SERVICE_ROLE_KEY no tiene formato JWT valido');
    }

    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
    const padded = normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), '=');
    const decoded = JSON.parse(Buffer.from(padded, 'base64').toString('utf8')) as { role?: string };

    if (decoded.role !== 'service_role') {
      throw new Error('SUPABASE_SERVICE_ROLE_KEY debe ser una key con role service_role para evitar bloqueos RLS');
    }
  }
}
