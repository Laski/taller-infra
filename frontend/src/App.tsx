import { useEffect, useState } from 'react';
import { deleteQuestion, getQuestion } from './api';
import type { Question } from './api';
import Setup from './pages/Setup';
import Voter from './pages/Voter';
import Wait from './pages/Wait';
import Results from './pages/Results';

// /new  → presenter: create question, view results, close or reset survey
// /     → voter: vote on the active question, see results when closed
const isPresenter = window.location.pathname === '/new';

type View = 'loading' | 'setup' | 'voter' | 'wait' | 'results';

export default function App() {
  const [view, setView] = useState<View>('loading');
  const [question, setQuestion] = useState<Question | null>(null);

  useEffect(() => {
    getQuestion()
      .then((q) => {
        if (q === null) {
          setView(isPresenter ? 'setup' : 'wait');
        } else if (q.is_open) {
          setQuestion(q);
          setView(isPresenter ? 'results' : 'voter');
        } else {
          setQuestion(q);
          setView('results');
        }
      })
      .catch(() => setView(isPresenter ? 'setup' : 'wait'));
  }, []);

  if (view === 'loading') return <p>Cargando…</p>;

  if (view === 'setup')
    return (
      <Setup
        onCreated={(q) => {
          setQuestion(q);
          setView('results');
        }}
      />
    );

  if (view === 'voter')
    return <Voter question={question!} onVoted={() => setView('wait')} />;

  if (view === 'results') {
    const q = question!;
    return (
      <Results
        question={q}
        onClosed={isPresenter && q.is_open ? () => {
          setQuestion({ ...q, is_open: false });
          setView('results');
        } : undefined}
        onNewSurvey={isPresenter && !q.is_open ? () => deleteQuestion().then(() => setView('setup')) : undefined}
      />
    );
  }

  return <Wait />;
}
