import React, { useMemo, useState } from 'react';

const STORAGE_KEY = 'repertorio-state-v1';
const BASE_POINT = 1;

const wordData = [
  { id: 1, term: 'Parco', kind: 'adj', meaning: 'Moderado y escaso en palabras o gestos.', example: 'Fue parco al responder: apenas dijo lo necesario.', base: 'respondió con pocas palabras durante la entrevista', wrongUse: 'una comida estaba muy sabrosa' },
  { id: 2, term: 'Ambivalente', kind: 'adj', meaning: 'Que muestra dos sentimientos o posturas opuestas a la vez.', example: 'Se sintió ambivalente: quería aceptar el cargo, pero temía perder libertad.', base: 'tenía sentimientos encontrados ante la propuesta', wrongUse: 'un objeto estaba perfectamente ordenado' },
  { id: 3, term: 'Acerbo', kind: 'adj', meaning: 'Duro, áspero o severo, especialmente al criticar.', example: 'El informe incluyó un juicio acerbo sobre la gestión anterior.', base: 'hizo una crítica muy dura del proyecto', wrongUse: 'un paseo fue relajado y agradable' },
  { id: 4, term: 'Lucidez', kind: 'noun', meaning: 'Claridad mental para comprender, decidir o expresarse.', example: 'En medio de la crisis, conservó la lucidez para ordenar prioridades.', base: 'explicó el problema con mucha claridad', wrongUse: 'una chaqueta era de color azul' },
  { id: 5, term: 'Rumiación', kind: 'noun', meaning: 'Pensamiento repetitivo e insistente sobre una preocupación.', example: 'La rumiación sobre aquel error no le dejó dormir.', base: 'volvía una y otra vez al mismo pensamiento', wrongUse: 'una mesa era resistente' },
  { id: 6, term: 'Matizar', kind: 'verb', meaning: 'Precisar, graduar o suavizar una afirmación añadiendo detalles.', example: 'Quiso matizar su crítica para que no pareciera un ataque personal.', base: 'aclaró una afirmación demasiado tajante con detalles', wrongUse: 'cerrar una ventana' },
  { id: 7, term: 'Desasosiego', kind: 'noun', meaning: 'Inquietud profunda o intranquilidad del ánimo.', example: 'La llamada inesperada le dejó un desasosiego difícil de explicar.', base: 'sintió una inquietud persistente antes del examen', wrongUse: 'un café estaba caliente' },
  { id: 8, term: 'Inmanencia', kind: 'noun', meaning: 'Cualidad de lo que pertenece o permanece dentro de algo, no fuera de ello.', example: 'La obra explora la inmanencia de la experiencia cotidiana.', base: 'el sentido pertenecía al interior de la experiencia', wrongUse: 'un paquete llegó tarde' },
  { id: 9, term: 'Contingencia', kind: 'noun', meaning: 'Hecho posible pero no seguro; eventualidad que puede ocurrir o no.', example: 'El protocolo prevé la contingencia de una falla eléctrica.', base: 'consideraron una eventualidad posible durante la planificación', wrongUse: 'una certeza absoluta' },
  { id: 10, term: 'Elocuente', kind: 'adj', meaning: 'Que expresa o comunica con fuerza, claridad y eficacia.', example: 'Su gesto fue elocuente: todos entendieron su desacuerdo.', base: 'expresó mucho sin necesidad de explicarse', wrongUse: 'una caja estaba cerrada' },
  { id: 11, term: 'Sobrio', kind: 'adj', meaning: 'Mesurado, sencillo y sin adornos o excesos.', example: 'La ceremonia tuvo un tono sobrio y respetuoso.', base: 'eligió un estilo sencillo y sin excesos', wrongUse: 'una fiesta fue ruidosa y recargada' },
  { id: 12, term: 'Susceptible', kind: 'adj', meaning: 'Propenso a verse afectado por algo o a sentirse ofendido.', example: 'El material es susceptible a la humedad si no se protege.', base: 'podía verse afectado por cambios pequeños', wrongUse: 'una ruta era más corta' }
];

const genresPool = ['Literarias', 'Filosóficas', 'Psicológicas', 'Artísticas', 'Académicas', 'Emocionales', 'Cotidianas elegantes', 'Argumentativas'];
const usesPool = ['Para escribir mejor', 'Para sonar más preciso', 'Para describir emociones', 'Para ensayos universitarios', 'Para conversaciones profundas', 'Para argumentar mejor', 'Para describir personas', 'Para narrar experiencias', 'Para expresar conflicto interno'];

const words = wordData.map((word) => ({
  ...word,
  genres: [genresPool[word.id % genresPool.length], genresPool[(word.id + 2) % genresPool.length]],
  uses: [usesPool[word.id % usesPool.length], usesPool[(word.id + 3) % usesPool.length]],
  exercises: createExercises(word)
}));

function createExercises({ term, kind, base, wrongUse }) {
  const lower = term.toLowerCase();
  const easyByKind = {
    adj: [
      [`Su respuesta fue ${lower}: precisa, breve y sin adornos.`, `Su respuesta fue ${lower} porque estaba escrita en tinta negra.`, `Su respuesta fue ${lower} al llegar dentro de un sobre.`],
      [`El tono del informe resultó ${lower} y cambió la lectura del caso.`, `El tono del informe resultó ${lower} porque tenía muchas páginas.`, `El tono del informe resultó ${lower} al imprimirse en la oficina.`],
      [`La actitud ${lower} del personaje explica mejor la escena.`, `La actitud ${lower} del personaje se guardó en un cajón.`, `La actitud ${lower} del personaje midió varios centímetros.`],
      [`En ese contexto, decir que fue ${lower} añade un matiz preciso.`, `En ese contexto, decir que fue ${lower} sirve para nombrar un color.`, `En ese contexto, decir que fue ${lower} indica que compró fruta.`],
      [`La descripción es ${lower} porque comunica exactamente esa cualidad.`, `La descripción es ${lower} porque la calle estaba mojada.`, `La descripción es ${lower} porque el vaso estaba lleno.`]
    ],
    noun: [
      [`La ${lower} le permitió entender mejor lo que ocurría.`, `La ${lower} quedó sobre la mesa junto a las llaves.`, `La ${lower} tenía un precio rebajado en la tienda.`],
      [`Sintió ${lower} al notar que la situación no estaba resuelta.`, `Sintió ${lower} porque la silla era de madera.`, `Sintió ${lower} al cambiar una bombilla.`],
      [`El texto presenta la ${lower} como una experiencia reconocible.`, `El texto presenta la ${lower} como un utensilio de cocina.`, `El texto presenta la ${lower} como una calle cerrada.`],
      [`Hablar de ${lower} ayuda a nombrar ese proceso interno.`, `Hablar de ${lower} ayuda a pesar la bolsa del mercado.`, `Hablar de ${lower} ayuda a describir una pared recién pintada.`],
      [`La escena transmite ${lower} sin decirlo de manera explícita.`, `La escena transmite ${lower} porque el tren salió a tiempo.`, `La escena transmite ${lower} al servir café con leche.`]
    ],
    verb: [
      [`Conviene ${lower} la afirmación para evitar una conclusión extrema.`, `Conviene ${lower} la maleta antes de subir al tren.`, `Conviene ${lower} la puerta con una llave nueva.`],
      [`La autora decide ${lower} su postura después de revisar los datos.`, `La autora decide ${lower} las plantas del balcón.`, `La autora decide ${lower} una taza rota.`],
      [`Puedes ${lower} esa crítica si añades una excepción importante.`, `Puedes ${lower} esa crítica si cambias la batería del reloj.`, `Puedes ${lower} esa crítica si compras pan.`],
      [`El debate mejoró cuando alguien quiso ${lower} la acusación inicial.`, `El debate mejoró cuando alguien quiso ${lower} una silla plegable.`, `El debate mejoró cuando alguien quiso ${lower} el paraguas.`],
      [`Antes de responder, intentó ${lower} lo que había dicho.`, `Antes de responder, intentó ${lower} la ventana cerrada.`, `Antes de responder, intentó ${lower} una receta de sopa.`]
    ]
  };

  return {
    easy: easyByKind[kind].map((options) => ({ options, correct: 0 })),
    medium: [
      `Reescribe usando "${term}": "La persona ${base}."`,
      `Reescribe usando "${term}": "El texto muestra que alguien ${base}."`,
      `Reescribe usando "${term}": "Durante la conversación se notó que alguien ${base}."`,
      `Reescribe usando "${term}": "La situación puede describirse así: alguien ${base}."`,
      `Reescribe usando "${term}": "Quiero expresar con más precisión que alguien ${base}."`
    ],
    hard: [
      `Escribe una oración cotidiana usando "${term}".`,
      `Escribe una oración formal usando "${term}".`,
      `Escribe una oración personal o reflexiva usando "${term}".`
    ],
    extra: [
      { context: `Estás describiendo una situación realista en la que alguien ${base}.`, correct: 'Adecuado' },
      { context: `Quieres hablar de ${wrongUse}; usar "${lower}" desviaría el sentido.`, correct: 'Inadecuado' },
      { context: `Conversas con un amigo y usas "${lower}" para precisar la idea, aunque podrías decirlo de forma más simple.`, correct: 'Neutral' }
    ]
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

function PracticeMode({ word, onDone, onBack }) { const [easy, setEasy] = useState(Array(5).fill(null)); const [medium, setMedium] = useState(Array(5).fill('')); const [hard, setHard] = useState(Array(3).fill('')); const [extra, setExtra] = useState(Array(3).fill(null)); const evaluate = () => { const easyPoints = easy.reduce((acc, a, i) => acc + (a === word.exercises.easy[i].correct ? 4 : 0), 0); const mediumPoints = medium.reduce((acc, t) => acc + (t.toLowerCase().includes(word.term.toLowerCase()) && t.length > 24 ? 5 : 0), 0); const hardAccepted = hard.filter((t) => t.toLowerCase().includes(word.term.toLowerCase()) && t.length > 24); const hardPoints = hardAccepted.length * 10; const extraPoints = extra.reduce((acc, a, i) => acc + (a === word.exercises.extra[i].correct ? 8 : 0), 0); const score = BASE_POINT + easyPoints + mediumPoints + hardPoints + extraPoints; const approved = score >= 60 && hardAccepted.length >= 1; onDone({ score, approved, category: approved ? classify(score) : 'No aprendida', hardAnswers: hard, mediumAnswers: medium, date: new Date().toISOString() }); }; return <div className="container"><button onClick={onBack}>← Salir</button><h2>Hazte con esta palabra: {word.term}</h2><section><h3>Nivel fácil</h3>{word.exercises.easy.map((ex, i) => <div key={i} className="card"><p>Elige la opción correcta.</p>{ex.options.map((o, idx) => <label key={idx} className="option"><input type="radio" name={`easy-${i}`} onChange={() => setEasy((p) => { const n = [...p]; n[i] = idx; return n; })} /> <span>{o}</span></label>)}</div>)}</section><section><h3>Nivel medio</h3>{word.exercises.medium.map((p, i) => <div key={i} className="card"><p>{p}</p><textarea onChange={(e) => setMedium((prev) => { const n = [...prev]; n[i] = e.target.value; return n; })} /></div>)}</section><section><h3>Nivel difícil</h3>{word.exercises.hard.map((p, i) => <div key={i} className="card"><p>{p}</p><textarea onChange={(e) => setHard((prev) => { const n = [...prev]; n[i] = e.target.value; return n; })} /></div>)}</section><section><h3>Nivel extra</h3>{word.exercises.extra.map((c, i) => <div key={i} className="card"><p>{c.context}</p>{['Adecuado', 'Inadecuado', 'Neutral'].map((o) => <button key={o} onClick={() => setExtra((p) => { const n = [...p]; n[i] = o; return n; })}>{o}</button>)}</div>)}</section><button onClick={evaluate}>Finalizar práctica</button></div>; }

function ResultScreen({ word, result, onRepeat, onLater, onHome }) { return <div className="container"><h2>Resultado: {word.term}</h2><p>Puntaje: {result.score}/100</p><p>Estado: {result.approved ? result.category : 'Todavía no está lista. Puedes intentarlo más tarde'}</p>{result.approved ? <p>Esta palabra ya forma parte de tu repertorio.</p> : <><p>Todavía no cumples los requisitos para dar esta palabra como aprendida.</p><button onClick={onRepeat}>Repetir ejercicios</button><button onClick={onLater}>Intentarlo más tarde</button></>}<button onClick={onHome}>Volver al inicio</button></div>; }

function Repertoire({ onBack, state, onPractice, onReview, onQuick, onRemove }) { const learnedItems = words.filter((w) => state.learned[w.id]); const postponedItems = words.filter((w) => state.postponed[w.id]); const listItems = words.filter((w) => state.myList[w.id]); return <div className="container"><button onClick={onBack}>← Volver</button><h2>Ver mi repertorio</h2><h3>Aprendidas</h3>{['Muy lograda', 'Lograda', '¡Por los pelos!'].map((cat) => <section key={cat}><h4>{cat}</h4><div className="cards">{learnedItems.filter((w) => state.learned[w.id].category === cat).map((w) => <article className="card" key={w.id}><h4>{w.term}</h4><p>{w.meaning}</p><p>Puntaje: {state.learned[w.id].score}</p><p>Fecha: {new Date(state.learned[w.id].date).toLocaleDateString()}</p><button onClick={() => onReview(w)}>Revisar</button><button onClick={() => onQuick(w)}>Repaso rápido</button></article>)}</div></section>)}<h3>Pospuestas</h3><div className="cards">{postponedItems.map((w) => <article key={w.id} className="card"><h4>{w.term}</h4><p>{w.meaning}</p><p>Último puntaje: {state.postponed[w.id].score ?? '—'}</p><button onClick={() => onPractice(w)}>Intentar de nuevo</button></article>)}</div><h3>Mi lista</h3><div className="cards">{listItems.map((w) => <article key={w.id} className="card"><h4>{w.term}</h4><p>{w.meaning}</p><button onClick={() => onPractice(w)}>Practicar ahora</button><button onClick={() => onRemove(w.id)}>Quitar de la lista</button></article>)}</div></div>; }

const ReviewScreen = ({ word, data, onBack }) => <div className="container"><button onClick={onBack}>← Volver</button><h2>Revisar</h2><p><b>{word.term}</b> — {word.meaning}</p><p>{word.example}</p><p>Puntaje: {data.score} | {data.category}</p><h3>Tus oraciones</h3><ul>{data.hardAnswers?.map((a, i) => <li key={i}>{a || '(sin respuesta)'}</li>)}</ul></div>;

function QuickReview({ word, onBack, onDone }) { const [rw, setRw] = useState(''); const [own, setOwn] = useState(''); return <div className="container"><button onClick={onBack}>← Volver</button><h2>Repaso rápido: {word.term}</h2><div className="card"><p>Reconocimiento: selecciona el uso correcto.</p><p>{word.exercises.easy[0].options[0]}</p></div><div className="card"><p>Reescritura</p><textarea value={rw} onChange={(e) => setRw(e.target.value)} /></div><div className="card"><p>Oración propia</p><textarea value={own} onChange={(e) => setOwn(e.target.value)} /></div><div className="card"><p>Contexto/matiz: {word.exercises.extra[0].context}</p></div><button onClick={onDone}>Guardar último repaso</button></div>; }
