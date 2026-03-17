import { useEffect, useLayoutEffect, useRef } from "react";
import { getQuestion } from "../api";
import type { Question } from "../api";

interface Props {
  voted?: boolean;
  onOpened: (question: Question) => void; // survey just opened → go vote
  onClosed: (question: Question) => void; // survey closed → go to results
}

export default function Wait({ voted = false, onOpened, onClosed }: Props) {
  const onOpenedRef = useRef(onOpened);
  const onClosedRef = useRef(onClosed);
  const votedRef = useRef(voted);
  useLayoutEffect(() => {
    onOpenedRef.current = onOpened;
    onClosedRef.current = onClosed;
    votedRef.current = voted;
  });

  useEffect(() => {
    const id = setInterval(async () => {
      const q = await getQuestion();
      if (q === null) return;
      if (!votedRef.current && q.is_open) onOpenedRef.current(q);
      else if (votedRef.current && !q.is_open) onClosedRef.current(q);
    }, 2000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="page">
      <div className="wait-container">
        {voted ? (
          <>
            <h1 className="wait-title">¡Gracias por votar!</h1>
            <p className="wait-subtitle">Esperá los resultados…</p>
          </>
        ) : (
          <>
            <h1 className="wait-title">Todavía no hay encuesta activa.</h1>
            <p className="wait-subtitle">
              Esperá a que el presentador lance una encuesta.
            </p>
          </>
        )}
        <div className="wait-dots">
          <span className="wait-dot" />
          <span className="wait-dot" />
          <span className="wait-dot" />
        </div>
      </div>
    </div>
  );
}
