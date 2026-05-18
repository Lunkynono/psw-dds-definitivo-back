export type CommentForSummary = {
  texto: string;
  criterio: string;
  origen: string;
};

export function buildProjectSummaryPrompt(input: {
  projectName: string;
  teamName?: string | null;
  comments: CommentForSummary[];
}) {
  const comments = input.comments
    .map((comment, index) => `${index + 1}. [${comment.origen} - ${comment.criterio}] ${comment.texto}`)
    .join('\n');

  return `
Eres un analista neutral de feedback para concursos, hackathones y evaluaciones de proyectos.
Tu tarea es resumir de forma clara lo que opinan las personas sobre un proyecto a partir de comentarios de jurado y/o publico.

Proyecto: ${input.projectName}
Equipo: ${input.teamName ?? 'No indicado'}

Comentarios:
${comments}

Instrucciones estrictas:
- No inventes datos, premios, puntuaciones ni hechos que no aparezcan en los comentarios.
- Distingue patrones repetidos de comentarios aislados.
- Si hay comentarios contradictorios, reflejalo como opinion mixta.
- Mantén un tono profesional, útil y accionable.
- No cites nombres de personas ni correos aunque aparezcan.
- Evita frases vagas como "buen proyecto" si puedes explicar por qué.
- Responde siempre en español.
- Devuelve únicamente JSON válido, sin markdown ni texto adicional.

Formato JSON exacto:
{
  "resumen": "Resumen de 3 a 5 frases sobre la percepcion general.",
  "fortalezas": ["3 a 5 puntos fuertes concretos"],
  "mejoras": ["2 a 5 oportunidades de mejora concretas"],
  "sentimiento": "positivo | mixto | critico | insuficiente",
  "temas": ["3 a 6 temas recurrentes"]
}
`.trim();
}
