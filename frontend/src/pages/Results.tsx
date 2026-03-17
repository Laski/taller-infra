import { useEffect, useState } from "react";
import { closeQuestion, getSummary } from "../api";
import type { Question, VoteSummary } from "../api";

interface Props {
  question: Question;
  onClosed?: () => void; // show "Cerrar encuesta"; omit for read-only
  onNewSurvey?: () => void; // show "Nueva encuesta"; omit when survey still open
}

export default function Results({ question, onClosed, onNewSurvey }: Props) {
  const [summary, setSummary] = useState<VoteSummary | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchSummary() {
      const data = await getSummary();
      if (!cancelled) setSummary(data);
    }

    fetchSummary();

    if (!question.is_open)
      return () => {
        cancelled = true;
      };

    const id = setInterval(fetchSummary, 2000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [question.is_open]);

  async function handleClose() {
    await closeQuestion();
    onClosed?.();
  }

  async function handleNewSurvey() {
    onNewSurvey?.();
  }

  return (
    <div>
      <h1>{question.text}</h1>
      {summary ? (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {[1, 2, 3, 4, 5].map((v) => (
            <li key={v}>
              {v}: {summary.counts[String(v)] ?? 0} votos
            </li>
          ))}
        </ul>
      ) : (
        <p>Cargando resultados…</p>
      )}
      <p>Total: {summary?.total ?? "—"}</p>
      {onClosed && <button onClick={handleClose}>Cerrar encuesta</button>}
      {onNewSurvey && <button onClick={handleNewSurvey}>Nueva encuesta</button>}
    </div>
  );
}
