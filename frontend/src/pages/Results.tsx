import { useEffect, useState } from "react";
import { closeQuestion, deleteQuestion, getSummary } from "../api";
import type { Question, VoteSummary } from "../api";

interface Props {
  question: Question;
  onClosed?: () => void; // show "Cerrar encuesta"; omit for read-only
  onNewSurvey?: () => void; // show "Nueva encuesta"; omit when survey still open
}

export default function Results({ question, onClosed, onNewSurvey }: Props) {
  const [summary, setSummary] = useState<VoteSummary | null>(null);

  async function refresh() {
    setSummary(await getSummary());
  }

  useEffect(() => {
    refresh();
    if (question.is_open) {
      const id = setInterval(refresh, 2000);
      return () => clearInterval(id);
    }
  }, []);

  async function handleClose() {
    await closeQuestion();
    onClosed?.();
  }

  async function handleNewSurvey() {
    await deleteQuestion();
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
