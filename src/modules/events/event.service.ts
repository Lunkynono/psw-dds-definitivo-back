import { Injectable } from '@nestjs/common';
import { CompeticionRepository } from '../../infrastructure/repositories/competicion.repository';
import { EventoRepository } from '../../infrastructure/repositories/evento.repository';
import { SupabaseAdapter } from '../../infrastructure/supabase/supabase.adapter';
import { PremioRepository } from '../../infrastructure/repositories/premio.repository';
import { CreateEventDto, UpdateEventDto } from '../../shared/dto/event.dto';

const EVENTOS_BUCKET = 'eventos';

@Injectable()
export class EventService {
  constructor(
    private readonly eventos: EventoRepository,
    private readonly competiciones: CompeticionRepository,
    private readonly premios: PremioRepository,
    private readonly supabase: SupabaseAdapter
  ) {}

  listByOrganizer(userId: string) {
    return this.eventos.findByOrganizador(userId);
  }

  listPublicOptions() {
    return this.eventos.findPublicOptions();
  }

  async create(userId: string, dto: CreateEventDto) {
    const evento = await this.eventos.create({
      organizador_id: userId,
      nombre: dto.nombre,
      lugar: dto.lugar ?? null,
      descripcion: dto.descripcion ?? null
    });

    for (const competicion of dto.competiciones.filter((item) => item.nombre.trim())) {
      await this.competiciones.create({
        evento_id: evento.id,
        nombre: competicion.nombre,
        descripcion: competicion.descripcion ?? null
      });
    }

    return evento;
  }

  update(eventId: number, dto: UpdateEventDto) {
    const { imagenUrl, ...rest } = dto as any;
    const payload: Record<string, unknown> = { ...rest };
    if (imagenUrl !== undefined) payload.imagen_url = imagenUrl;
    return this.eventos.update(eventId, payload);
  }

  get(eventId: number) {
    return this.eventos.findById(eventId);
  }

  async delete(eventId: number) {
    await this.premios.deleteByEvento(eventId);
    const competiciones = await this.competiciones.findByEvento(eventId);
    for (const competicion of competiciones) {
      await this.competiciones.delete(competicion.id);
    }
    return this.eventos.delete(eventId);
  }

  async uploadImage(eventId: number, userId: string, base64: string, contentType: string, extension: string) {
    const buffer = Buffer.from(base64, 'base64');
    const nombre = `${userId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${extension}`;

    const { error } = await this.supabase.storage()
      .from(EVENTOS_BUCKET)
      .upload(nombre, buffer, { contentType, cacheControl: '3600', upsert: false });

    if (error) {
      const msg = `${error.message || ''} ${(error as any).name || ''}`.toLowerCase();
      if (msg.includes('bucket') && msg.includes('not found')) {
        throw new Error('No existe el bucket "eventos" en Supabase Storage. Créalo como bucket público y vuelve a intentarlo.');
      }
      throw error;
    }

    const { data } = this.supabase.storage().from(EVENTOS_BUCKET).getPublicUrl(nombre);
    const imagenUrl = data.publicUrl;
    await this.eventos.updateImagenUrl(eventId, imagenUrl);
    return { imagenUrl };
  }
}
