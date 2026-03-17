import { useState } from "react";
import { castVote } from "../api";
import type { Question } from "../api";

interface Props {
  question: Question;
  onVoted: () => void;
}

// Color scale: low (red) → mid (amber) → high (green)
const VOTE_COLORS = ["#ef4444", "#f97316", "#eab308", "#84cc16", "#22c55e"];

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
    <div className="page">
      <div className="voter-container">
        <h1 className="voter-question">{question.text}</h1>
        <div>
          <p
            className="voter-scale-label"
            style={{ textAlign: "center", marginBottom: "1rem" }}
          >
            Votá del 1 al 5
          </p>
          <div className="voter-buttons">
            {[1, 2, 3, 4, 5].map((v) => (
              <button
                key={v}
                className="vote-btn"
                style={{ background: VOTE_COLORS[v - 1] }}
                onClick={() => handleVote(v)}
                disabled={loading}
              >
                {v}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
