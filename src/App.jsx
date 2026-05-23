import React, { useMemo, useState } from 'react';

const STORAGE_KEY = 'repertorio-state-v1';
const BASE_POINT = 1;

const words = [
  makeWord(1, 'Parco', 'Moderado y escaso en palabras o en acciones.', 'Fue parco en elogios, pero su mirada aprobaba.'),
  makeWord(2, 'Ambivalente', 'Que presenta sentimientos opuestos sobre algo.', 'Se mostró ambivalente ante la propuesta de mudanza.'),
  makeWord(3, 'Acerbo', 'Áspero, duro o crítico en tono.', 'Su comentario acerbo dejó el ambiente tenso.'),
  makeWord(4, 'Lucidez', 'Claridad mental para comprender o explicar.', 'Con gran lucidez, sintetizó el problema en dos ideas.'),
  makeWord(5, 'Rumiación', 'Pensamiento repetitivo sobre un tema inquietante.', 'La rumiación le impedía concentrarse en el presente.'),
  makeWord(6, 'Matizar', 'Aportar matices para precisar o suavizar una idea.', 'Conviene matizar esa afirmación para evitar extremos.'),
  makeWord(7, 'Desasosiego', 'Inquietud o intranquilidad del ánimo.', 'Sintió desasosiego al esperar noticias inciertas.'),
  makeWord(8, 'Inmanencia', 'Cualidad de lo que permanece dentro de sí.', 'La obra explora la inmanencia de la experiencia cotidiana.'),
  makeWord(9, 'Contingencia', 'Posibilidad de que algo ocurra o no.', 'El plan consideraba la contingencia de un corte eléctrico.'),
  makeWord(10, 'Elocuente', 'Que expresa con claridad y eficacia.', 'Su silencio fue más elocuente que cualquier discurso.'),
  makeWord(11, 'Sobrio', 'Sencillo, mesurado y sin exceso.', 'Eligió un diseño sobrio para presentar su tesis.'),
  makeWord(12, 'Susceptible', 'Propenso a recibir la acción de algo o sentirse ofendido.', 'Es susceptible a cambios bruscos de temperatura.')
];

function makeWord(id, term, meaning, example) {
  const genresPool = ['Literarias', 'Filosóficas', 'Psicológicas', 'Artísticas', 'Académicas', 'Emocionales', 'Cotidianas elegantes', 'Argumentativas'];
  const usesPool = ['Para escribir mejor', 'Para sonar más preciso', 'Para describir emociones', 'Para ensayos universitarios', 'Para conversaciones profundas', 'Para argumentar mejor', 'Para describir personas', 'Para narrar experiencias', 'Para expresar conflicto interno'];
  return {
    id,
    term,
    meaning,
    example,
    genres: [genresPool[id % genresPool.length], genresPool[(id + 2) % genresPool.length]],
    uses: [usesPool[id % usesPool.length], usesPool[(id + 3) % usesPool.length]],
    exercises: {
      easy: Array.from({ length: 5 }).map((_, i) => ({
        options: [
          `Usó "${term}" con precisión en su intervención número ${i + 1}.`,
          `La palabra "${term}" se rompió en el suelo número ${i + 1}.`,
          `Compró dos kilos de "${term}" en la feria ${i + 1}.`
        ],
        correct: 0
      })),
      medium: Array.from({ length: 5 }).map((_, i) => `Reescribe: "La idea ${i + 1} necesita mayor precisión" usando "${term}".`),
      hard: Array.from({ length: 3 }).map((_, i) => `Escribe una oración original (${i + 1}/3) usando "${term}".`),
      extra: [
        { context: `En un ensayo formal, quieres precisar una idea con "${term}".`, correct: 'Adecuado' },
        { context: `Hablas de cocinar pasta y metes "${term}" sin relación.`, correct: 'Inadecuado' },
        { context: `Conversación casual donde "${term}" podría caber, pero no es necesario.`, correct: 'Neutral' }
      ]
    }
  };
}

const initialState = { learned: {}, postponed: {}, myList: {}, attempts: {} };

const getSavedState = () => {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || initialState; } catch { return initialState; }
};

const persist = (state) => localStorage.setItem(STORAGE_KEY, JSON.stringify(state));

const classify = (score) => score >= 90 ? 'Muy lograda' : score >= 75 ? 'Lograda' : '¡Por los pelos!';

export default function App() {
  const [view, setView] = useState({ name: 'home' });
  const [state, setState] = useState(getSavedState);

  const updateState = (updater) => setState((prev) => {
    const next = updater(prev);
    persist(next);
    return next;
  });

  const dailyWords = useMemo(() => words.slice(0, 3), []);

  const startPractice = (word) => setView({ name: 'practice', word });

  if (view.name === 'practice') {
    return <PracticeMode word={view.word} onBack={() => setView({ name: 'home' })} onDone={(result) => {
      updateState((prev) => {
        const next = { ...prev, attempts: { ...prev.attempts, [view.word.id]: result } };
        if (result.approved) {
          next.learned[view.word.id] = { ...result, reviewedAt: null };
          delete next.postponed[view.word.id];
        }
        return next;
      });
      setView({ name: 'result', word: view.word, result });
    }} />;
  }

  if (view.name === 'result') return <ResultScreen word={view.word} result={view.result} onRepeat={() => setView({ name: 'practice', word: view.word })} onLater={() => {
    updateState((prev) => ({ ...prev, postponed: { ...prev.postponed, [view.word.id]: view.result }, attempts: { ...prev.attempts, [view.word.id]: view.result } }));
    setView({ name: 'repertoire' });
  }} onHome={() => setView({ name: 'home' })} />;

  if (view.name === 'daily') return <div className="container"><button onClick={() => setView({ name: 'home' })}>← Volver</button><DailyWords words={dailyWords} onPractice={(w)=>startPractice(w)} /></div>;
  if (view.name === 'library') return <Library onBack={() => setView({ name: 'home' })} state={state} onPractice={startPractice} onAddList={(word) => updateState((prev) => ({ ...prev, myList: { ...prev.myList, [word.id]: true } }))} />;
  if (view.name === 'repertoire') return <Repertoire onBack={() => setView({ name: 'home' })} state={state} onPractice={startPractice} onReview={(word) => setView({ name: 'review', word })} onQuick={(word) => setView({ name: 'quick', word })} onRemove={(id) => updateState((prev) => { const next = { ...prev, myList: { ...prev.myList } }; delete next.myList[id]; return next; })} />;
  if (view.name === 'review') return <ReviewScreen word={view.word} data={state.learned[view.word.id]} onBack={() => setView({ name: 'repertoire' })} />;
  if (view.name === 'quick') return <QuickReview word={view.word} onBack={() => setView({ name: 'repertoire' })} onDone={() => updateState((prev) => ({ ...prev, learned: { ...prev.learned, [view.word.id]: { ...prev.learned[view.word.id], reviewedAt: new Date().toISOString() } } }))} />;

  return <Home onDaily={() => setView({ name: 'daily' })} onLibrary={() => setView({ name: 'library' })} onRepertoire={() => setView({ name: 'repertoire' })} />;
}

const Home = ({ onDaily, onLibrary, onRepertoire }) => <div className="container"><h1>Repertorio</h1><p>Mejora tu vocabulario, escritura y pensamiento.</p><div className="grid3"><button onClick={onDaily}>Palabras diarias</button><button onClick={onLibrary}>Biblioteca de palabras</button><button onClick={onRepertoire}>Ver mi repertorio</button></div></div>;
const DailyWords = ({ words, onPractice }) => <section><h2>Tus 3 palabras de hoy</h2><div className="cards">{words.map((w) => <WordCard key={w.id} word={w} actions={<button onClick={() => onPractice(w)}>Practicar la palabra</button>} />)}</div></section>;
const WordCard = ({ word, status, actions }) => <article className="card"><h3>{word.term}</h3><p><b>Significado:</b> {word.meaning}</p><p><b>Ejemplo:</b> {word.example}</p>{status && <p><b>Estado:</b> {status}</p>}{actions}</article>;

function Library({ onBack, state, onPractice, onAddList }) { const [tab, setTab] = useState('genres'); const categories = tab === 'genres' ? [...new Set(words.flatMap((w) => w.genres))] : [...new Set(words.flatMap((w) => w.uses))]; const [selected, setSelected] = useState(categories[0]); const list = words.filter((w) => (tab === 'genres' ? w.genres : w.uses).includes(selected)); return <div className="container"><button onClick={onBack}>← Volver</button><h2>Biblioteca de palabras</h2><div className="tabs"><button onClick={() => setTab('genres')}>Por género</button><button onClick={() => setTab('uses')}>Por uso</button></div><div className="chips">{categories.map((c) => <button key={c} onClick={() => setSelected(c)}>{c}</button>)}</div><div className="cards">{list.map((w) => <WordCard key={w.id} word={w} status={state.learned[w.id] ? state.learned[w.id].category : state.postponed[w.id] ? 'Pospuesta' : 'Nueva'} actions={<div className="row"><button onClick={() => onPractice(w)}>Practicar ahora</button><button onClick={() => onAddList(w)}>Añadir a mi lista</button></div>} />)}</div></div>; }

function PracticeMode({ word, onDone, onBack }) { const [easy, setEasy] = useState(Array(5).fill(null)); const [medium, setMedium] = useState(Array(5).fill('')); const [hard, setHard] = useState(Array(3).fill('')); const [extra, setExtra] = useState(Array(3).fill(null)); const evaluate = () => { const easyPoints = easy.reduce((acc, a, i) => acc + (a === word.exercises.easy[i].correct ? 4 : 0), 0); const mediumPoints = medium.reduce((acc, t) => acc + (t.toLowerCase().includes(word.term.toLowerCase()) && t.length > 24 ? 5 : 0), 0); const hardAccepted = hard.filter((t) => t.toLowerCase().includes(word.term.toLowerCase()) && t.length > 24); const hardPoints = hardAccepted.length * 10; const extraPoints = extra.reduce((acc, a, i) => acc + (a === word.exercises.extra[i].correct ? 8 : 0), 0); const score = BASE_POINT + easyPoints + mediumPoints + hardPoints + extraPoints; const approved = score >= 60 && hardAccepted.length >= 1; onDone({ score, approved, category: approved ? classify(score) : 'No aprendida', hardAnswers: hard, mediumAnswers: medium, date: new Date().toISOString() }); }; return <div className="container"><button onClick={onBack}>← Salir</button><h2>Hazte con esta palabra: {word.term}</h2><section><h3>Nivel fácil</h3>{word.exercises.easy.map((ex, i) => <div key={i} className="card"><p>Ejercicio {i + 1}</p>{ex.options.map((o, idx) => <label key={idx}><input type="radio" name={`easy-${i}`} onChange={() => setEasy((p) => { const n = [...p]; n[i] = idx; return n; })} /> {o}</label>)}</div>)}</section><section><h3>Nivel medio</h3>{word.exercises.medium.map((p, i) => <div key={i} className="card"><p>{p}</p><textarea onChange={(e) => setMedium((prev) => { const n = [...prev]; n[i] = e.target.value; return n; })} /></div>)}</section><section><h3>Nivel difícil</h3>{word.exercises.hard.map((p, i) => <div key={i} className="card"><p>{p}</p><textarea onChange={(e) => setHard((prev) => { const n = [...prev]; n[i] = e.target.value; return n; })} /></div>)}</section><section><h3>Nivel extra</h3>{word.exercises.extra.map((c, i) => <div key={i} className="card"><p>{c.context}</p>{['Adecuado', 'Inadecuado', 'Neutral'].map((o) => <button key={o} onClick={() => setExtra((p) => { const n = [...p]; n[i] = o; return n; })}>{o}</button>)}</div>)}</section><button onClick={evaluate}>Finalizar práctica</button></div>; }

function ResultScreen({ word, result, onRepeat, onLater, onHome }) { return <div className="container"><h2>Resultado: {word.term}</h2><p>Puntaje: {result.score}/100</p><p>Estado: {result.approved ? result.category : 'Todavía no está lista. Puedes intentarlo más tarde'}</p>{result.approved ? <p>Esta palabra ya forma parte de tu repertorio.</p> : <><p>Todavía no cumples los requisitos para dar esta palabra como aprendida.</p><button onClick={onRepeat}>Repetir ejercicios</button><button onClick={onLater}>Intentarlo más tarde</button></>}<button onClick={onHome}>Volver al inicio</button></div>; }

function Repertoire({ onBack, state, onPractice, onReview, onQuick, onRemove }) { const learnedItems = words.filter((w) => state.learned[w.id]); const postponedItems = words.filter((w) => state.postponed[w.id]); const listItems = words.filter((w) => state.myList[w.id]); return <div className="container"><button onClick={onBack}>← Volver</button><h2>Ver mi repertorio</h2><h3>Aprendidas</h3>{['Muy lograda', 'Lograda', '¡Por los pelos!'].map((cat) => <section key={cat}><h4>{cat}</h4><div className="cards">{learnedItems.filter((w) => state.learned[w.id].category === cat).map((w) => <article className="card" key={w.id}><h4>{w.term}</h4><p>{w.meaning}</p><p>Puntaje: {state.learned[w.id].score}</p><p>Fecha: {new Date(state.learned[w.id].date).toLocaleDateString()}</p><button onClick={() => onReview(w)}>Revisar</button><button onClick={() => onQuick(w)}>Repaso rápido</button></article>)}</div></section>)}<h3>Pospuestas</h3><div className="cards">{postponedItems.map((w) => <article key={w.id} className="card"><h4>{w.term}</h4><p>{w.meaning}</p><p>Último puntaje: {state.postponed[w.id].score ?? '—'}</p><button onClick={() => onPractice(w)}>Intentar de nuevo</button></article>)}</div><h3>Mi lista</h3><div className="cards">{listItems.map((w) => <article key={w.id} className="card"><h4>{w.term}</h4><p>{w.meaning}</p><button onClick={() => onPractice(w)}>Practicar ahora</button><button onClick={() => onRemove(w.id)}>Quitar de la lista</button></article>)}</div></div>; }

const ReviewScreen = ({ word, data, onBack }) => <div className="container"><button onClick={onBack}>← Volver</button><h2>Revisar</h2><p><b>{word.term}</b> — {word.meaning}</p><p>{word.example}</p><p>Puntaje: {data.score} | {data.category}</p><h3>Tus oraciones</h3><ul>{data.hardAnswers?.map((a, i) => <li key={i}>{a || '(sin respuesta)'}</li>)}</ul></div>;

function QuickReview({ word, onBack, onDone }) { const [rw, setRw] = useState(''); const [own, setOwn] = useState(''); return <div className="container"><button onClick={onBack}>← Volver</button><h2>Repaso rápido: {word.term}</h2><div className="card"><p>Reconocimiento: selecciona el uso correcto.</p><p>{word.exercises.easy[0].options[0]}</p></div><div className="card"><p>Reescritura</p><textarea value={rw} onChange={(e) => setRw(e.target.value)} /></div><div className="card"><p>Oración propia</p><textarea value={own} onChange={(e) => setOwn(e.target.value)} /></div><div className="card"><p>Contexto/matiz: {word.exercises.extra[0].context}</p></div><button onClick={onDone}>Guardar último repaso</button></div>; }
