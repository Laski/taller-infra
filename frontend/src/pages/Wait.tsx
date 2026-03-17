import { useEffect, useLayoutEffect, useRef } from "react";
import { getQuestion } from "../api";
import type { Question } from "../api";

interface Props {
  voted?: boolean;
  onClosed: (question: Question) => void;
}

export default function Wait({ voted = false, onClosed }: Props) {
  // Ref so the interval always calls the latest onClosed without restarting.
  const onClosedRef = useRef(onClosed);
  useLayoutEffect(() => {
    onClosedRef.current = onClosed;
  });

  useEffect(() => {
    const id = setInterval(async () => {
      const q = await getQuestion();
      if (q !== null && !q.is_open) onClosedRef.current(q);
    }, 2000);
    return () => clearInterval(id);
  }, []);

  return (
    <div>
      {voted ? (
        <>
          <h1>¡Gracias por votar!</h1>
          <p>Esperá los resultados.</p>
        </>
      ) : (
        <h1>Todavía no hay encuesta activa.</h1>
      )}
    </div>
  );
}
