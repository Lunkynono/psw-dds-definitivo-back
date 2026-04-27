# Votify Backend

API REST de Votify separada del frontend.

## Stack

- NestJS + TypeScript
- Controllers REST
- Services de aplicación
- Domain entities
- Factories migradas desde el proyecto original
- Facades para coordinar casos de uso
- Repositories para aislar persistencia
- Adapter + Singleton para Supabase

## Capas

- `modules`: controllers y services por caso de uso.
- `domain`: entidades, factories, policies, strategies y lógica propia del dominio.
- `infrastructure`: Supabase y repositorios.
- `shared`: DTOs, mappers, facades y utilidades.

## Patrones visibles

- Factory Method: `VotanteJuezCreator`, `VotantePublicoCreator`.
- Simple Factory: `CriterioFactory`, `VotanteFactory`.
- Template Method base: `VotanteBase`, `Criterio`.
- Facade: `VotingFacade`, `ResultsFacade`, `CompetitionFacade`.
- Singleton: `SupabaseClientSingleton`.
- Repository: repositorios de evento, competición, encuesta, voto y resultado.
- Adapter: `SupabaseAdapter`.
- Strategy: estrategias de cálculo de resultados.

## Variables

Copiar `.env.example` a `.env` y completar valores reales. No subir claves reales a GitHub.
