import { useState } from "react";
import { castVote } from "../api";
import type { Question } from "../api";

interface Props {
  question: Question;
  onVoted: () => void;
}

export default function Voter({ question, onVoted }: Props) {
  const [loading, setLoading] = useState(false);

  async function handleVote(value: number) {
    setLoading(true);
    try {
      await castVote(value);
      onVoted();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h1>{question.text}</h1>
      <p>Votá del 1 al 5:</p>
      <div>
        {[1, 2, 3, 4, 5].map((v) => (
          <button key={v} onClick={() => handleVote(v)} disabled={loading}>
            {v}
          </button>
        ))}
      </div>
    </div>
  );
}
