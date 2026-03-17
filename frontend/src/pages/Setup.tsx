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
    <div className="page">
      <form className="setup-form" onSubmit={handleSubmit}>
        <h1 className="setup-title">Nueva encuesta</h1>
        <input
          className="setup-input"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Escribí tu pregunta…"
          required
          autoFocus
        />
        <button className="btn btn-primary" type="submit" disabled={loading}>
          {loading ? "Lanzando…" : "Lanzar encuesta"}
        </button>
      </form>
    </div>
  );
}
