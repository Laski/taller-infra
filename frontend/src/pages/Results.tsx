import { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { closeQuestion, getSummary } from "../api";
import type { Question, VoteSummary } from "../api";

const VOTER_URL = `${window.location.origin}/`;

interface Props {
  question: Question;
  onClosed?: () => void; // show "Cerrar encuesta"; omit for read-only
  onNewSurvey?: () => void; // show "Nueva encuesta"; omit when survey still open
}

// Matches the voter color scale for visual consistency
const BAR_COLORS = ["#ef4444", "#f97316", "#eab308", "#84cc16", "#22c55e"];

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

  const counts = summary
    ? ([1, 2, 3, 4, 5].map((v) => summary.counts[String(v)] ?? 0) as number[])
    : null;
  const maxCount = counts ? Math.max(...counts, 1) : 1;

  return (
    <div className="page">
      <div className="results-container">
        <h1 className="results-question">{question.text}</h1>

        {summary && counts ? (
          <>
            <div className="histogram">
              {[1, 2, 3, 4, 5].map((v, i) => {
                const count = counts[i];
                const pct =
                  summary.total > 0
                    ? Math.round((count / summary.total) * 100)
                    : 0;
                const barWidth = (count / maxCount) * 100;

                return (
                  <div key={v} className="histogram-row">
                    <span className="histogram-label">{v}</span>
                    <div className="histogram-track">
                      <div
                        className="histogram-bar"
                        style={{
                          width: `${barWidth}%`,
                          background: BAR_COLORS[i],
                          animationDelay: `${i * 0.08}s`,
                        }}
                      />
                    </div>
                    <span className="histogram-stats">
                      {count}
                      <span className="histogram-pct">({pct}%)</span>
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="results-meta">
              <p className="results-total">{summary.total} votos en total</p>
            </div>
          </>
        ) : (
          <p className="loading-text">Cargando resultados…</p>
        )}

        {onClosed && (
          <div className="qr-block">
            <QRCodeSVG value={VOTER_URL} size={160} />
            <p className="qr-label">{VOTER_URL}</p>
          </div>
        )}

        <div className="results-actions">
          {onClosed && (
            <button className="btn btn-ghost" onClick={handleClose}>
              Cerrar encuesta
            </button>
          )}
          {onNewSurvey && (
            <button className="btn btn-primary" onClick={handleNewSurvey}>
              Nueva encuesta
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
