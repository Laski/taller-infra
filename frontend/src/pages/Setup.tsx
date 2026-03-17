import { useState } from "react";
import { createQuestion } from "../api";
import type { Question } from "../api";

interface Props {
  onCreated: (question: Question) => void;
}

export default function Setup({ onCreated }: Props) {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    setLoading(true);
    try {
      const q = await createQuestion(text.trim());
      onCreated(q);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <h1>Nueva encuesta</h1>
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Texto de la pregunta"
        required
      />
      <button type="submit" disabled={loading}>
        Lanzar encuesta
      </button>
    </form>
  );
}
