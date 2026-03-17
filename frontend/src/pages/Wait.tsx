import { useEffect } from "react";
import { getQuestion } from "../api";
import type { Question } from "../api";

interface Props {
  voted?: boolean;
  onClosed: (question: Question) => void;
}

export default function Wait({ voted = false, onClosed }: Props) {
  useEffect(() => {
    const id = setInterval(async () => {
      const q = await getQuestion();
      if (q !== null && !q.is_open) onClosed(q);
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
