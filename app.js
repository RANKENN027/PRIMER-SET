(function () {
'use strict';

/* ---------- Utilidades ---------- */
var KEY = 'primerset.v1';
var DAYS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
var DS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
var MONTHS = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
var SLOTS = [['manana', 'Mañana'], ['tarde', 'Tarde'], ['noche', 'Noche']];
var SLOT_EMOJI = { manana: '🌅', tarde: '☀️', noche: '🌙' };
function slotEmoji(v) { return SLOT_EMOJI[v] || '☀️'; }

function slotName(v) {
  for (var i = 0; i < SLOTS.length; i++) { if (SLOTS[i][0] === v) return SLOTS[i][1]; }
  return 'Tarde';
}
function $(s, r) { return (r || document).querySelector(s); }
function esc(s) {
  return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
  });
}
function pad(n) { return n < 10 ? '0' + n : '' + n; }
function dkey(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
function parseKey(k) { var p = String(k).split('-'); return new Date(+p[0], +p[1] - 1, +p[2]); }
function wd(d) { return (d.getDay() + 6) % 7; }
function addDays(d, n) { return new Date(d.getFullYear(), d.getMonth(), d.getDate() + n); }
function mondayOf(d) { return addDays(d, -wd(d)); }
function uid() { return 'e' + Math.random().toString(36).slice(2, 9); }
function num(v, min, max, dflt) {
  var n = parseInt(v, 10);
  if (isNaN(n)) return dflt;
  return Math.max(min, Math.min(max, n));
}
function longDate(d) { return DAYS[wd(d)] + ' ' + d.getDate() + ' de ' + MONTHS[d.getMonth()]; }
/* Minutos -> "45 min". Si pasa de 60 min se muestra en horas y minutos: 80 -> "1:20 h" */
function fmtMin(m) {
  m = Math.max(0, Math.round(m));
  if (m <= 60) return m + ' min';
  return Math.floor(m / 60) + ':' + pad(m % 60) + ' h';
}
function fmtClock(s) {
  s = Math.max(0, Math.round(s));
  if (s >= 3600) return Math.floor(s / 3600) + ':' + pad(Math.floor(s % 3600 / 60)) + ':' + pad(s % 60);
  return pad(Math.floor(s / 60)) + ':' + pad(s % 60);
}
/* Duración guardada en segundos, mostrada en minutos: 90 -> "1,5 min". Más de 60 min: 4800 -> "1:20 h" */
function fmtDur(secs) {
  var m = secs / 60;
  if (m > 60) return fmtMin(m);
  m = Math.round(m * 100) / 100;
  return String(m).replace('.', ',') + ' min';
}
/* Valor para un campo numérico en minutos: 90 -> "1.5" */
function toMinInput(secs) { return String(Math.round(secs / 60 * 100) / 100); }
function plain(s) { return String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase(); }

window.PS = window.PS || {};
PS.k = { KEY: KEY, DAYS: DAYS, DS: DS, MONTHS: MONTHS, SLOTS: SLOTS, slotName: slotName, slotEmoji: slotEmoji };
PS.u = { $: $, esc: esc, pad: pad, dkey: dkey, parseKey: parseKey, wd: wd, addDays: addDays, mondayOf: mondayOf, uid: uid, num: num, longDate: longDate, fmtMin: fmtMin, fmtClock: fmtClock, fmtDur: fmtDur, toMinInput: toMinInput, plain: plain };
})();

(function () {
'use strict';
var U = PS.u;

/* ---------- Biblioteca de ejercicios, por grupo, con emoji e indicación de técnica ----------
   t: 'reps' o 'time'. d: valores iniciales [series, repeticiones o segundos, descanso en segundos].
   lv: nivel mínimo recomendado (1 principiante, 2 intermedio, 3 avanzado). */
var GROUPS = ['Piernas y glúteos', 'Pecho', 'Espalda', 'Hombros', 'Brazos', 'Abdomen', 'Cardio', 'Cuerpo completo'];
var GROUP_EMOJI = { 'Piernas y glúteos': '🦵', 'Pecho': '🏋️', 'Espalda': '🧗', 'Hombros': '🤸', 'Brazos': '💪', 'Abdomen': '🔥', 'Cardio': '🏃', 'Cuerpo completo': '⚡' };
function L(g, n, e, t, lv, tip, d, m) { return { g: g, n: n, e: e || GROUP_EMOJI[g], t: t, lv: lv, tip: tip, d: d || (t === 'time' ? [1, 600, 0] : [3, 10, 60]), m: m || '' }; }
var LIB = [
  L('Piernas y glúteos', 'Sentadilla goblet con mancuerna', '🏋️', 'reps', 1, 'Sostén la mancuerna junto al pecho y baja con la espalda recta hasta que los muslos queden paralelos al suelo.', [3, 10, 90]),
  L('Piernas y glúteos', 'Prensa de piernas', '🦵', 'reps', 1, 'Pies al ancho de hombros, baja hasta unos 90° de rodilla y empuja sin bloquear.', [3, 12, 90]),
  L('Piernas y glúteos', 'Zancadas', '🚶', 'reps', 1, 'Da un paso largo, baja la rodilla de atrás hacia el suelo y mantén el torso erguido.', [3, 8, 90]),
  L('Piernas y glúteos', 'Peso muerto rumano con mancuernas', '🏋️', 'reps', 1, 'Rodillas apenas flexionadas, lleva la cadera hacia atrás y baja las mancuernas pegadas a las piernas.', [3, 10, 90]),
  L('Piernas y glúteos', 'Puente de glúteo', '🍑', 'reps', 1, 'Acostado con los pies apoyados, sube la cadera apretando los glúteos.', [3, 12, 60]),
  L('Piernas y glúteos', 'Extensión de piernas en máquina', '🦵', 'reps', 1, 'Ajusta el respaldo, sube hasta estirar la rodilla sin bloquearla y baja despacio.', [3, 12, 60]),
  L('Piernas y glúteos', 'Curl femoral en máquina', '🦵', 'reps', 1, 'Lleva los talones hacia los glúteos de forma controlada, sin despegar la cadera del asiento.', [3, 12, 60]),
  L('Piernas y glúteos', 'Elevación de talones', '🦶', 'reps', 1, 'De pie, sube sobre las puntas de los pies, pausa un segundo arriba y baja lento.', [3, 15, 45]),
  L('Piernas y glúteos', 'Sentadilla con barra', '🏋️', 'reps', 2, 'Barra sobre la parte alta de la espalda, pecho arriba, baja hasta que los muslos queden paralelos y sube empujando el suelo.', [4, 8, 120]),
  L('Piernas y glúteos', 'Hip thrust con barra', '🍑', 'reps', 2, 'Espalda alta apoyada en un banco, barra sobre la cadera; sube apretando los glúteos y baja controlado.', [4, 10, 90]),
  L('Piernas y glúteos', 'Sentadilla búlgara', '🦵', 'reps', 3, 'Pie de atrás apoyado en un banco, baja en vertical y empuja con la pierna de adelante.', [3, 10, 90]),
  L('Piernas y glúteos', 'Zancada caminando', '🚶', 'reps', 2, 'Avanza con pasos largos alternando piernas, torso erguido y rodilla sin pasar la punta del pie.', [3, 12, 75]),
  L('Piernas y glúteos', 'Peso muerto convencional', '🏋️', 'reps', 3, 'Barra pegada a las piernas, espalda neutra; empuja el suelo con las piernas y estira la cadera al final.', [4, 5, 150]),
  L('Pecho', 'Press de pecho con mancuernas', '💪', 'reps', 1, 'Acostado, baja las mancuernas a la altura del pecho y empuja sin bloquear los codos.', [3, 10, 90]),
  L('Pecho', 'Press de pecho en máquina', '🏋️', 'reps', 1, 'Ajusta el asiento para que las manos queden a la altura del pecho y empuja de forma controlada.', [3, 12, 90]),
  L('Pecho', 'Flexiones inclinadas', '🙌', 'reps', 1, 'Manos en un banco o pared, cuerpo recto, y baja el pecho hacia el apoyo.', [3, 10, 90]),
  L('Pecho', 'Aperturas en máquina (pec deck)', '🦅', 'reps', 1, 'Codos ligeramente flexionados, junta las manos al frente sin encoger los hombros.', [3, 12, 60]),
  L('Pecho', 'Press inclinado con mancuernas', '💪', 'reps', 2, 'Banco inclinado unos 30°, baja hasta la parte alta del pecho y empuja en línea recta.', [4, 10, 90]),
  L('Pecho', 'Press de banca con barra', '🏋️', 'reps', 3, 'Omóplatos juntos, pies firmes; baja la barra al pecho con control y empuja sin despegar la cadera.', [4, 6, 120]),
  L('Pecho', 'Fondos en paralelas', '🤸', 'reps', 3, 'Torso ligeramente inclinado, baja hasta unos 90° de codo y sube sin encoger los hombros.', [3, 10, 75]),
  L('Espalda', 'Remo con mancuerna', '🧗', 'reps', 1, 'Apoya una mano en el banco, espalda plana, y lleva el codo hacia la cadera.', [3, 10, 90]),
  L('Espalda', 'Remo en máquina sentado', '🧗', 'reps', 1, 'Pecho apoyado y omóplatos juntos al tirar.', [3, 12, 90]),
  L('Espalda', 'Jalón al pecho', '🧲', 'reps', 1, 'Agarre un poco más ancho que los hombros y lleva la barra a la parte alta del pecho.', [3, 10, 90]),
  L('Espalda', 'Remo en polea baja', '🚣', 'reps', 2, 'Sentado, espalda recta; tira del agarre hacia el abdomen juntando los omóplatos.', [3, 10, 75]),
  L('Espalda', 'Remo con barra', '🚣', 'reps', 3, 'Torso inclinado con la espalda neutra y lleva la barra hacia el abdomen.', [4, 8, 90]),
  L('Espalda', 'Dominadas', '🧗', 'reps', 3, 'Agarre ancho, sube hasta pasar la barbilla de la barra y baja controlado. Usa banda de ayuda si lo necesitas.', [4, 8, 90]),
  L('Hombros', 'Press de hombros sentado', '🤸', 'reps', 1, 'Empuja las mancuernas sobre la cabeza sin arquear la zona lumbar.', [3, 10, 90]),
  L('Hombros', 'Elevaciones laterales', '🕊️', 'reps', 1, 'Sube los brazos hasta la altura de los hombros con un peso ligero.', [3, 12, 60]),
  L('Hombros', 'Press militar con barra', '🏋️', 'reps', 3, 'De pie, glúteos y abdomen firmes; empuja la barra sobre la cabeza sin inclinar la espalda.', [4, 6, 120]),
  L('Hombros', 'Face pull', '🎯', 'reps', 2, 'Con cuerda en polea alta, tira hacia la cara abriendo los codos; ideal para cuidar los hombros.', [3, 15, 45]),
  L('Brazos', 'Curl de bíceps con mancuernas', '💪', 'reps', 1, 'Codos pegados al cuerpo; sube sin balancear el tronco.', [3, 12, 60]),
  L('Brazos', 'Extensión de tríceps en polea', '💪', 'reps', 1, 'Codos fijos a los costados; extiende hasta casi bloquear.', [3, 12, 60]),
  L('Brazos', 'Fondos en banco (tríceps)', '🪑', 'reps', 1, 'Manos en el borde del banco, baja flexionando los codos hacia atrás y sube sin encoger los hombros.', [3, 8, 60]),
  L('Brazos', 'Curl martillo', '🔨', 'reps', 2, 'Palmas enfrentadas, sube la mancuerna sin girar la muñeca y con los codos quietos.', [3, 12, 60]),
  L('Brazos', 'Curl con barra', '💪', 'reps', 2, 'Agarre al ancho de hombros, sube la barra sin balancear y baja despacio.', [3, 10, 60]),
  L('Abdomen', 'Plancha', '🧘', 'time', 1, 'Cuerpo en línea recta de cabeza a talones, abdomen firme y respiración tranquila.', [3, 30, 60]),
  L('Abdomen', 'Plancha lateral', '🧘', 'time', 1, 'Apoya el antebrazo y los pies de lado, cadera arriba y cuerpo en línea recta.', [2, 30, 60]),
  L('Abdomen', 'Abdominales crunch', '🔥', 'reps', 1, 'Eleva solo los hombros del suelo, sin jalar el cuello con las manos.', [3, 12, 45]),
  L('Abdomen', 'Elevación de piernas acostado', '🦵', 'reps', 1, 'Espalda baja pegada al suelo; sube las piernas casi rectas y baja sin tocar el piso.', [3, 10, 60]),
  L('Abdomen', 'Bird dog', '🐕', 'reps', 1, 'En cuatro apoyos, estira brazo y pierna contrarios sin mover la espalda.', [2, 10, 30]),
  L('Abdomen', 'Elevación de piernas colgado', '🔥', 'reps', 3, 'Colgado de la barra, sube las piernas con el abdomen sin balancearte.', [3, 10, 60]),
  L('Abdomen', 'Rueda abdominal', '🛞', 'reps', 3, 'De rodillas, rueda hacia adelante con el abdomen firme y regresa sin hundir la espalda.', [3, 10, 60]),
  L('Cardio', 'Caminata inclinada en cinta', '🚶', 'time', 1, 'Inclinación suave y un ritmo que te permita hablar con frases cortas.', [1, 1500, 0]),
  L('Cardio', 'Bicicleta estática', '🚴', 'time', 1, 'Resistencia baja o media y pedaleo constante.', [1, 600, 0]),
  L('Cardio', 'Caminata suave', '🚶', 'time', 1, 'Ritmo cómodo con respiración tranquila.', [1, 1200, 0]),
  L('Cardio', 'Trote suave', '🏃', 'time', 1, 'Ritmo en el que puedas conversar; alterna con caminata si lo necesitas.', [1, 900, 0]),
  L('Cardio', 'Elíptica', '🏃', 'time', 1, 'Postura erguida, movimiento fluido y resistencia baja o media.', [1, 900, 0]),
  L('Cuerpo completo', 'Sentadilla con press de hombros', '⚡', 'reps', 1, 'Baja en sentadilla con las mancuernas a los hombros y, al subir, empuja las mancuernas sobre la cabeza en un solo movimiento.', [3, 10, 75], 'Piernas, glúteos y hombros'),
  L('Cuerpo completo', 'Caminata del granjero', '🧳', 'time', 1, 'Camina con una mancuerna pesada en cada mano, pecho arriba, hombros atrás y pasos cortos.', [3, 60, 60], 'Agarre, hombros, espalda y abdomen'),
  L('Cuerpo completo', 'Escaladores (mountain climbers)', '🧗', 'time', 1, 'En posición de plancha con las manos firmes, lleva una rodilla al pecho y alterna a ritmo constante.', [3, 30, 45], 'Abdomen, hombros, pecho y piernas'),
  L('Cuerpo completo', 'Burpees', '🔄', 'reps', 2, 'Baja al suelo, empuja con el pecho, vuelve a ponerte de pie y salta. Hazlo a tu ritmo, sin perder la técnica.', [3, 8, 75], 'Piernas, pecho, hombros y abdomen'),
  L('Cuerpo completo', 'Thruster con mancuernas', '⚡', 'reps', 2, 'Sentadilla profunda con las mancuernas en los hombros y empuje explosivo hasta arriba al subir.', [4, 8, 90], 'Piernas, glúteos, hombros y tríceps'),
  L('Cuerpo completo', 'Swing con kettlebell', '🔔', 'reps', 2, 'Lleva la cadera hacia atrás y empújala con fuerza para subir la pesa hasta el pecho; los brazos solo guían.', [4, 12, 60], 'Glúteos, espalda baja, piernas y hombros'),
  L('Cuerpo completo', 'Peso muerto con encogimiento y press', '🏋️', 'reps', 3, 'Sube la barra desde el suelo, llévala a los hombros y empújala sobre la cabeza con el cuerpo firme.', [4, 6, 120], 'Espalda, piernas, glúteos y hombros'),
  L('Cuerpo completo', 'Remo renegado', '🧗', 'reps', 3, 'En posición de plancha sobre dos mancuernas, rema una a la vez sin girar la cadera.', [3, 8, 75], 'Espalda, abdomen y hombros')
];
var BY = {};
LIB.forEach(function (l) { BY[l.n] = l; });
function libFind(name) { return BY[name] || null; }
function libSearch(q, g) {
  var p = U.plain(q || '').trim();
  return LIB.filter(function (l) {
    if (g && l.g !== g) return false;
    return !p || U.plain(l.n).indexOf(p) >= 0 || U.plain(l.g).indexOf(p) >= 0;
  });
}
/* Dosis inicial de un ejercicio de la biblioteca, lista para mostrar: "3 × 10" o "10 min" */
function libDose(l) {
  if (l.t === 'time') return (l.d[0] > 1 ? l.d[0] + ' × ' : '') + U.fmtDur(l.d[1]);
  return l.d[0] + ' × ' + l.d[1];
}
var LV_INFO = { 1: '🌱 Principiante', 2: '💪 Intermedio', 3: '🔥 Avanzado' };
var GROUP_SHORT = { 'Piernas y glúteos': 'Piernas', 'Cuerpo completo': 'Completo' };
/* Emoji de un ejercicio por nombre (los propios usan 💪) */
function emojiFor(name) { var l = BY[name]; return l ? l.e : '💪'; }

/* ---------- Calentamiento (antes de cada sesión, unos 10 minutos) ---------- */
var WARM = [
  { id: 'w0', e: '🚴', n: 'Cardio suave: caminata o bicicleta', secs: 300, meta: '5 min', tip: 'Sube poco a poco el ritmo hasta sentir calor, sin llegar a cansarte.' },
  { id: 'w1', e: '🔄', n: 'Círculos de brazos y hombros', secs: 60, meta: '1 min', tip: 'Medio minuto hacia adelante y medio hacia atrás, con círculos amplios y lentos.' },
  { id: 'w2', e: '🌀', n: 'Rotación de cadera y de torso', secs: 60, meta: '1 min', tip: 'Gira con control, sin forzar el final del movimiento.' },
  { id: 'w3', e: '🦵', n: 'Sentadilla con peso corporal', secs: 0, meta: '2 × 10 repeticiones', tip: 'Espalda recta y rodillas en dirección de los pies.' },
  { id: 'w4', e: '🍑', n: 'Puente de glúteo', secs: 0, meta: '1 × 12 repeticiones', tip: 'Activa glúteos antes de cargar peso.' },
  { id: 'w5', e: '🐈', n: 'Gato-camello (movilidad de espalda)', secs: 0, meta: '1 × 8 repeticiones', tip: 'Alterna espalda curvada y espalda hundida despacio.' },
  { id: 'w6', e: '🏋️', n: 'Series de aproximación', secs: 0, meta: '1-2 series con la mitad del peso × 8', tip: 'Haz el primer ejercicio del día con poco peso antes de las series reales.' }
];

/* ---------- Frases motivacionales (una distinta cada día) ---------- */
var PHRASES = [
  'Hoy no tienes que ser perfecto, solo constante.',
  'Cada repetición te acerca a la persona que quieres ser.',
  'Empezar es lo más difícil. Ya lo lograste.',
  'Tu cuerpo escucha todo lo que tu mente le promete.',
  'Un día a la vez, una serie a la vez.',
  'La disciplina es hacerlo incluso cuando no hay ganas.',
  'Entrenar es un regalo que le haces a tu yo del futuro.',
  'No compares tu primer capítulo con el capítulo veinte de otro.',
  'Pequeños avances, repetidos cada día, se vuelven grandes cambios.',
  'Hoy suma. Aunque sea poco, suma.',
  'La técnica primero, el peso después.',
  'Descansar también es parte del entrenamiento.',
  'Tu único rival es quien fuiste ayer.',
  'Respira, concéntrate y empuja.',
  'El progreso no siempre se ve, pero siempre se siente.',
  'Haz hoy lo que tu yo de mañana te va a agradecer.',
  'Si fuera fácil, todos lo harían. Tú sí lo estás haciendo.',
  'La motivación te trae, el hábito te mantiene.',
  'Entrena con paciencia: los resultados llegan con el tiempo.',
  'Cada gota de sudor es una promesa cumplida.',
  'Tu cuerpo puede más de lo que tu mente cree.',
  'Menos excusas, más series.',
  'Hoy es un buen día para superar tu marca de ayer.',
  'Constancia vence a intensidad.',
  'Cuida tu cuerpo, es el único lugar donde vas a vivir toda la vida.',
  'No hace falta ir rápido, hace falta no parar.',
  'Cada día que entrenas, te eliges.',
  'La fuerza se construye en los días en que no querías ir.',
  'Sonríe, ya estás haciendo más que quien se quedó en casa.',
  'Un mal entrenamiento es mejor que ninguno.',
  'Tu propósito pesa más que tu pereza.',
  'Sigue. El primer mes es el que más cuesta.',
  'Escucha a tu cuerpo, pero no te dejes convencer por tus excusas.',
  'Hoy construyes la energía de toda tu semana.',
  'Un paso, una serie, una victoria.',
  'No esperes motivación: crea el hábito.',
  'Lo que hoy cuesta, mañana se vuelve tu normalidad.',
  'Hidrátate, respira y confía en el proceso.',
  'Tu ritmo es el correcto, mientras no te detengas.',
  'La mejor versión de ti se construye con decisiones diarias.',
  'Cada serie terminada es una pequeña victoria.',
  'Entrenar duele menos que arrepentirse.',
  'Hoy te mueves, mañana lo notas.',
  'Que el cansancio de hoy sea la fuerza de mañana.',
  'Un cuerpo fuerte empieza con una mente decidida.',
  'Haz que tu yo de hace un mes se sienta orgulloso.',
  'Sé paciente: los músculos se construyen en semanas, no en horas.',
  'Cuando sientas que no puedes más, haz una repetición más con buena técnica.',
  'No es castigo por lo que comiste, es celebración de lo que tu cuerpo puede hacer.',
  'Tu energía mejora cada vez que te mueves.',
  'Termina lo que empezaste hoy.',
  'Nadie empieza siendo experto. Todos empezaron como tú.',
  'Hoy es un día más para demostrarte de qué estás hecho.',
  'Entrena para sentirte bien, no solo para verte bien.',
  'Cada semana que cumples, tu hábito se hace más fuerte.',
  'Con calma y con ganas: así se llega lejos.',
  'Tu salud es una inversión, no un gasto.',
  'El mejor momento para empezar fue ayer. El segundo mejor es ahora.',
  'La constancia convierte lo difícil en rutina.',
  'Respeta tus descansos y verás cómo rinden tus entrenamientos.',
  'Tú decides cómo termina el día: con una excusa o con una serie.',
  'Hoy gana quien aparece.',
  'Un poco de esfuerzo diario supera mucho esfuerzo ocasional.',
  'Confía en el proceso, tu cuerpo ya está cambiando.',
  'Hazlo por ti, hazlo con ganas, hazlo hoy.'
];
function phraseOf(d) {
  var day = Math.floor(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / 86400000);
  return PHRASES[((day % PHRASES.length) + PHRASES.length) % PHRASES.length];
}

function mk(name, sets, reps, rest) { return { id: U.uid(), name: name, type: 'reps', sets: sets, reps: reps, secs: 0, rest: rest }; }
function mkT(name, sets, secs, rest) { return { id: U.uid(), name: name, type: 'time', sets: sets, reps: 0, secs: secs, rest: rest }; }
function fromLib(l) { return l.t === 'time' ? mkT(l.n, l.d[0], l.d[1], l.d[2]) : mk(l.n, l.d[0], l.d[1], l.d[2]); }

PS.d = { LIB: LIB, GROUPS: GROUPS, GROUP_EMOJI: GROUP_EMOJI, libFind: libFind, libSearch: libSearch, libDose: libDose, LV_INFO: LV_INFO, GROUP_SHORT: GROUP_SHORT, emojiFor: emojiFor,
  WARM: WARM, WARM_TOTAL: '10 min', PHRASES: PHRASES, phraseOf: phraseOf, mk: mk, mkT: mkT, fromLib: fromLib };
})();

(function () {
'use strict';
var D = PS.d, mk = D.mk, mkT = D.mkT;

/* ---------- Niveles ---------- */
var LEVELS = [
  { id: 'principiante', e: '🌱', name: 'Principiante', days: '3 días por semana',
    desc: 'Cuerpo completo, 3 series de 10 a 12 repeticiones, máquinas y mancuernas ligeras, descansos largos. Ideal si empiezas o vuelves después de una pausa.' },
  { id: 'intermedio', e: '💪', name: 'Intermedio', days: '4 días por semana',
    desc: 'Torso y pierna en días separados, 3 a 4 series de 8 a 12 repeticiones y algunos ejercicios con barra. Para quien ya entrena con regularidad hace varios meses.' },
  { id: 'avanzado', e: '🔥', name: 'Avanzado', days: '5 días por semana',
    desc: 'Empuje, tirón y pierna, 4 series de 5 a 10 repeticiones con barra y pesos altos, descansos más exigentes. Recomendado con al menos un año de experiencia.' }
];
function levelOf(id) {
  for (var i = 0; i < LEVELS.length; i++) { if (LEVELS[i].id === id) return LEVELS[i]; }
  return LEVELS[0];
}

function rest7() { var a = []; for (var i = 0; i < 7; i++) a.push({ rest: true, slot: 'tarde', label: '', ex: [] }); return a; }
function setDay(days, i, label, ex) { days[i].rest = false; days[i].label = label; days[i].ex = ex; }

/* ---------- Principiante: cuerpo completo ---------- */
function begA(build) {
  if (build === 'delgada') return [mk('Sentadilla goblet con mancuerna', 3, 10, 90), mk('Press de pecho con mancuernas', 3, 10, 90), mk('Remo con mancuerna', 3, 10, 90), mk('Press de hombros sentado', 3, 10, 90), mkT('Plancha', 3, 30, 60)];
  if (build === 'robusta') return [mk('Prensa de piernas', 3, 12, 90), mk('Press de pecho en máquina', 3, 12, 90), mk('Jalón al pecho', 3, 12, 90), mk('Puente de glúteo', 3, 12, 60), mkT('Plancha', 3, 30, 60)];
  return [mk('Sentadilla goblet con mancuerna', 3, 10, 90), mk('Press de pecho con mancuernas', 3, 10, 90), mk('Remo con mancuerna', 3, 10, 90), mk('Puente de glúteo', 3, 12, 60), mkT('Plancha', 3, 30, 60), mkT('Bicicleta estática', 1, 600, 0)];
}
function begB(build) {
  if (build === 'delgada') return [mk('Peso muerto rumano con mancuernas', 3, 10, 90), mk('Flexiones inclinadas', 3, 10, 90), mk('Jalón al pecho', 3, 10, 90), mk('Zancadas', 3, 8, 90), mk('Curl de bíceps con mancuernas', 2, 12, 60)];
  if (build === 'robusta') return [mk('Sentadilla goblet con mancuerna', 3, 12, 90), mk('Remo en máquina sentado', 3, 12, 90), mk('Press de hombros sentado', 3, 12, 90), mk('Bird dog', 2, 10, 30), mk('Abdominales crunch', 2, 12, 30)];
  return [mk('Peso muerto rumano con mancuernas', 3, 10, 90), mk('Press de hombros sentado', 3, 10, 90), mk('Jalón al pecho', 3, 10, 90), mk('Zancadas', 3, 8, 90), mk('Abdominales crunch', 2, 12, 30), mkT('Bicicleta estática', 1, 600, 0)];
}
function planBeg(build) {
  var d = rest7();
  if (build === 'robusta') {
    setDay(d, 0, 'Pesas A', begA(build)); setDay(d, 1, 'Cardio suave', [mkT('Caminata inclinada en cinta', 1, 1500, 0)]);
    setDay(d, 3, 'Pesas B', begB(build)); setDay(d, 5, 'Cardio suave', [mkT('Bicicleta estática', 1, 1800, 0)]);
  } else {
    setDay(d, 0, 'Cuerpo completo A', begA(build)); setDay(d, 2, 'Cuerpo completo B', begB(build)); setDay(d, 4, 'Cuerpo completo A', begA(build));
  }
  return d;
}

/* ---------- Intermedio: torso y pierna, 4 días ---------- */
function planMid(build) {
  var d = rest7();
  setDay(d, 0, 'Torso A', [mk('Press de pecho con mancuernas', 4, 10, 90), mk('Remo con mancuerna', 4, 10, 90), mk('Press de hombros sentado', 3, 10, 75), mk('Jalón al pecho', 3, 12, 75), mk('Curl de bíceps con mancuernas', 3, 12, 60), mk('Extensión de tríceps en polea', 3, 12, 60)]);
  setDay(d, 1, 'Pierna A', [mk('Sentadilla con barra', 4, 8, 120), mk('Peso muerto rumano con mancuernas', 3, 10, 90), mk('Prensa de piernas', 3, 12, 90), mk('Curl femoral en máquina', 3, 12, 60), mk('Elevación de talones', 3, 15, 45), mkT('Plancha', 3, 45, 45)]);
  setDay(d, 3, 'Torso B', [mk('Press inclinado con mancuernas', 4, 10, 90), mk('Remo en máquina sentado', 4, 10, 90), mk('Elevaciones laterales', 3, 15, 45), mk('Aperturas en máquina (pec deck)', 3, 12, 60), mk('Curl martillo', 3, 12, 60), mk('Fondos en banco (tríceps)', 3, 10, 60)]);
  setDay(d, 4, 'Pierna B', [mk('Zancadas', 3, 10, 90), mk('Hip thrust con barra', 4, 10, 90), mk('Extensión de piernas en máquina', 3, 12, 60), mk('Curl femoral en máquina', 3, 12, 60), mk('Abdominales crunch', 3, 15, 45), mk('Elevación de piernas acostado', 3, 12, 45)]);
  if (build === 'robusta') {
    setDay(d, 2, 'Cardio suave', [mkT('Caminata inclinada en cinta', 1, 1500, 0)]);
    setDay(d, 5, 'Cardio suave', [mkT('Bicicleta estática', 1, 1800, 0)]);
  }
  return d;
}

/* ---------- Avanzado: empuje, tirón y pierna, 5 días ---------- */
function planAdv(build) {
  var d = rest7();
  setDay(d, 0, 'Empuje', [mk('Press de banca con barra', 4, 6, 120), mk('Press inclinado con mancuernas', 4, 8, 90), mk('Press militar con barra', 4, 6, 120), mk('Elevaciones laterales', 4, 15, 45), mk('Fondos en paralelas', 3, 10, 75), mk('Extensión de tríceps en polea', 3, 12, 60)]);
  setDay(d, 1, 'Tirón', [mk('Peso muerto convencional', 4, 5, 150), mk('Dominadas', 4, 8, 90), mk('Remo con barra', 4, 8, 90), mk('Remo en polea baja', 3, 10, 75), mk('Face pull', 3, 15, 45), mk('Curl con barra', 3, 10, 60)]);
  setDay(d, 2, 'Pierna', [mk('Sentadilla con barra', 5, 5, 150), mk('Peso muerto rumano con mancuernas', 4, 8, 90), mk('Sentadilla búlgara', 3, 10, 90), mk('Curl femoral en máquina', 4, 10, 60), mk('Elevación de talones', 4, 15, 45), mk('Rueda abdominal', 3, 10, 60)]);
  setDay(d, 4, 'Torso', [mk('Press inclinado con mancuernas', 4, 8, 90), mk('Remo con mancuerna', 4, 8, 90), mk('Press de hombros sentado', 4, 8, 90), mk('Jalón al pecho', 4, 10, 75), mk('Curl de bíceps con mancuernas', 3, 12, 60), mk('Fondos en banco (tríceps)', 3, 12, 60)]);
  setDay(d, 5, 'Pierna y glúteo', [mk('Hip thrust con barra', 4, 8, 90), mk('Prensa de piernas', 4, 10, 90), mk('Zancada caminando', 3, 12, 75), mk('Extensión de piernas en máquina', 3, 12, 60), mk('Elevación de piernas colgado', 3, 10, 60), mkT('Plancha lateral', 3, 45, 45)]);
  if (build === 'robusta') setDay(d, 3, 'Cardio suave', [mkT('Caminata inclinada en cinta', 1, 1500, 0)]);
  return d;
}

function buildPlan(level, build) {
  var b = (build === 'delgada' || build === 'robusta') ? build : 'media';
  if (level === 'avanzado') return planAdv(b);
  if (level === 'intermedio') return planMid(b);
  return planBeg(b);
}

/* ---------- Recomendación por contextura ---------- */
var REC = {
  delgada: { e: '🧱', title: 'Construir fuerza y masa',
    text: 'Con contextura delgada rinde más enfocarte en pesas, con poco cardio, buen descanso y comida suficiente para sostener el entrenamiento.' },
  media: { e: '⚖️', title: 'Fuerza general con algo de cardio',
    text: 'Con contextura media funciona una rutina equilibrada de fuerza con un poco de cardio. Sube el peso solo cuando completes todas las series con buena técnica.' },
  robusta: { e: '🫀', title: 'Fuerza, cardio y cuidado de articulaciones',
    text: 'Con contextura robusta conviene combinar pesas con cardio de bajo impacto (caminata inclinada o bicicleta) y usar máquinas guiadas al inicio para cuidar rodillas y espalda.' }
};
function bmi(h, w) { return w / Math.pow(h / 100, 2); }
function bmiRange(b) {
  if (b < 18.5) return 'por debajo del rango de referencia';
  if (b < 25) return 'dentro del rango de referencia';
  if (b < 30) return 'por encima del rango de referencia';
  return 'bastante por encima del rango de referencia';
}
function bmiAdvice(b) {
  if (b < 18.5) return 'Prioriza descansar bien y comer suficiente; evita sumar cardio extra al principio.';
  if (b >= 30) return 'Empieza con cardio de bajo impacto y aumenta el tiempo de a poco; escucha a tu cuerpo.';
  return '';
}

D.LEVELS = LEVELS; D.levelOf = levelOf; D.buildPlan = buildPlan; D.REC = REC;
D.bmi = bmi; D.bmiRange = bmiRange; D.bmiAdvice = bmiAdvice;
})();

(function () {
'use strict';
var U = PS.u, D = PS.d, mk = D.mk, mkT = D.mkT;

/* =====================================================================
   Sección Calistenia: biblioteca progresiva (casa / parque), niveles,
   calentamiento sin material y recomendaciones. Todo es independiente
   de la sección Gimnasio; D.use(sec) cambia los datos activos.
   Lugar de cada ejercicio: 🏠 casa, 🌳 parque (necesita barra o banco), 🏠🌳 ambos.
   ===================================================================== */
var GROUPS = ['Piernas y glúteos', 'Empuje', 'Tirón', 'Hombros', 'Core', 'Cardio', 'Cuerpo completo'];
var GROUP_EMOJI = { 'Piernas y glúteos': '🦵', 'Empuje': '🙌', 'Tirón': '🧗', 'Hombros': '🤸', 'Core': '🔥', 'Cardio': '🏃', 'Cuerpo completo': '⚡' };
function L(g, n, e, t, lv, place, tip, d, m) {
  return { g: g, n: n, e: e || GROUP_EMOJI[g], t: t, lv: lv, tip: place + ' ' + tip, d: d || (t === 'time' ? [3, 30, 45] : [3, 10, 60]), m: m || '' };
}
var H = '🏠', P = '🌳', HP = '🏠🌳';
var LIB = [
  /* Piernas y glúteos */
  L('Piernas y glúteos', 'Sentadilla con peso corporal', '🦵', 'reps', 1, HP, 'Pies al ancho de hombros, pecho arriba; baja como si te sentaras y sube empujando el suelo. Más difícil: sentadilla con pausa de 2 s abajo.', [3, 12, 45], 'Cuádriceps, glúteos y core'),
  L('Piernas y glúteos', 'Sentadilla isométrica en pared', '🧱', 'time', 1, H, 'Espalda pegada a la pared y muslos paralelos al suelo; aguanta respirando con calma. Más fácil: sube un poco la cadera.', [3, 30, 45], 'Cuádriceps y glúteos'),
  L('Piernas y glúteos', 'Puente de glúteo', '🍑', 'reps', 1, H, 'Acostado con los pies apoyados, sube la cadera apretando los glúteos y baja sin tocar el suelo. Más difícil: puente a una pierna.', [3, 15, 45], 'Glúteos e isquiotibiales'),
  L('Piernas y glúteos', 'Zancada atrás', '🚶', 'reps', 1, HP, 'Da un paso largo hacia atrás y baja la rodilla casi al suelo; alterna las piernas. Más difícil: zancada búlgara.', [3, 10, 45], 'Cuádriceps, glúteos y equilibrio'),
  L('Piernas y glúteos', 'Elevación de talones', '🦶', 'reps', 1, HP, 'De pie, sube sobre las puntas, pausa un segundo arriba y baja lento. Apóyate en una pared si necesitas equilibrio.', [3, 20, 30], 'Pantorrillas'),
  L('Piernas y glúteos', 'Sentadilla con salto', '🦘', 'reps', 2, HP, 'Baja en sentadilla y salta con fuerza; aterriza suave, con las rodillas flexionadas. Más fácil: sentadilla sin salto.', [3, 10, 60], 'Piernas, glúteos y potencia'),
  L('Piernas y glúteos', 'Zancada búlgara', '🦵', 'reps', 2, HP, 'Pie de atrás apoyado en un banco, silla firme o escalón; baja en vertical y empuja con la pierna de adelante.', [3, 8, 60], 'Cuádriceps, glúteos y equilibrio'),
  L('Piernas y glúteos', 'Puente a una pierna', '🍑', 'reps', 2, H, 'Una pierna estirada al aire y la otra apoyada; sube la cadera sin girarla. Haz las mismas repeticiones por lado.', [3, 8, 45], 'Glúteos e isquiotibiales'),
  L('Piernas y glúteos', 'Elevación de talones a una pierna', '🦶', 'reps', 2, HP, 'Sube y baja sobre una sola pierna, con una mano apoyada en la pared para el equilibrio.', [3, 12, 45], 'Pantorrillas'),
  L('Piernas y glúteos', 'Zancada con salto', '🦘', 'reps', 3, HP, 'Desde la zancada, salta y cambia de pierna en el aire. Aterriza suave. Más fácil: zancada atrás.', [3, 10, 75], 'Piernas, glúteos y potencia'),
  L('Piernas y glúteos', 'Sentadilla pistol asistida', '🔥', 'reps', 3, HP, 'Sentadilla a una pierna sujetándote de una puerta, poste o banda. Baja controlado y usa cada vez menos ayuda.', [3, 5, 90], 'Cuádriceps, glúteos y equilibrio'),
  L('Piernas y glúteos', 'Curl nórdico asistido', '🪢', 'reps', 3, H, 'De rodillas con los pies sujetos bajo un sofá pesado; baja el torso lo más lento que puedas y ayúdate con las manos.', [3, 5, 90], 'Isquiotibiales'),
  /* Empuje */
  L('Empuje', 'Flexiones inclinadas', '🙌', 'reps', 1, HP, 'Manos en una mesa firme, banco o pared, cuerpo recto; baja el pecho hacia el apoyo. Más difícil: baja la altura de las manos hasta el suelo.', [3, 8, 60], 'Pecho, hombros y tríceps'),
  L('Empuje', 'Flexiones de rodillas', '🙌', 'reps', 1, H, 'Rodillas en el suelo y cuerpo recto de cabeza a rodillas; baja el pecho casi al suelo y sube sin arquear la espalda.', [3, 8, 60], 'Pecho, hombros y tríceps'),
  L('Empuje', 'Fondos en banco', '🪑', 'reps', 1, HP, 'Manos en el borde de un banco o silla firme, piernas dobladas; baja flexionando los codos hacia atrás. Más difícil: estira las piernas.', [3, 8, 60], 'Tríceps y hombros'),
  L('Empuje', 'Flexiones', '💪', 'reps', 2, HP, 'Cuerpo recto, manos bajo los hombros; baja el pecho hasta casi tocar el suelo y empuja. Si no llegas, vuelve a rodillas o inclinadas.', [4, 10, 60], 'Pecho, hombros y tríceps'),
  L('Empuje', 'Flexiones diamante', '💎', 'reps', 2, HP, 'Manos juntas formando un rombo bajo el pecho; codos cerca del cuerpo. Más fácil: hazlas de rodillas.', [3, 8, 60], 'Tríceps y pecho'),
  L('Empuje', 'Flexiones declinadas', '📐', 'reps', 2, HP, 'Pies sobre una silla, banco o escalón y manos en el suelo; baja el pecho con el cuerpo recto.', [3, 8, 60], 'Pecho alto y hombros'),
  L('Empuje', 'Fondos en paralelas', '🤸', 'reps', 3, P, 'Sostenido en barras paralelas, baja hasta unos 90° de codo y sube sin encoger los hombros. Más fácil: fondos en banco.', [4, 8, 90], 'Pecho, tríceps y hombros'),
  L('Empuje', 'Flexiones arqueras', '🏹', 'reps', 3, HP, 'Manos muy abiertas: baja hacia un lado manteniendo el otro brazo estirado y alterna. Más fácil: flexiones normales anchas.', [4, 6, 90], 'Pecho y tríceps unilateral'),
  L('Empuje', 'Flexiones explosivas', '💥', 'reps', 3, HP, 'Empuja tan fuerte que las manos se despegan del suelo (o da una palmada). Aterriza con los codos suaves.', [3, 6, 90], 'Pecho, hombros y potencia'),
  /* Tirón */
  L('Tirón', 'Remo con mochila', '🎒', 'reps', 1, H, 'Inclinado hacia adelante con la espalda recta y una mochila con libros; llévala hacia el abdomen juntando los omóplatos.', [3, 12, 60], 'Espalda y bíceps'),
  L('Tirón', 'Superman', '🦸', 'reps', 1, H, 'Boca abajo, levanta brazos y piernas del suelo a la vez, pausa un segundo y baja lento.', [3, 12, 45], 'Espalda baja y glúteos'),
  L('Tirón', 'Colgarse de la barra', '🪝', 'time', 1, P, 'Cuélgate de una barra con los hombros activos (no encogidos). Mejora el agarre y prepara las dominadas.', [3, 20, 60], 'Antebrazos, espalda y hombros'),
  L('Tirón', 'Curl de bíceps con mochila', '💪', 'reps', 1, H, 'Mochila cargada en las manos, codos pegados al cuerpo; sube sin balancear y baja despacio.', [3, 12, 45], 'Bíceps y antebrazos'),
  L('Tirón', 'Remo invertido', '🚣', 'reps', 2, HP, 'Bajo una mesa muy firme o una barra baja, con el cuerpo recto y los talones en el suelo; lleva el pecho hacia la barra. Más fácil: dobla las rodillas.', [4, 8, 75], 'Espalda, bíceps y core'),
  L('Tirón', 'Dominadas negativas', '⬇️', 'reps', 2, P, 'Salta a la posición alta con la barbilla sobre la barra y baja en 4 a 5 segundos. Es la mejor forma de lograr tu primera dominada.', [3, 5, 90], 'Espalda y bíceps'),
  L('Tirón', 'Dominadas asistidas con banda', '🧗', 'reps', 2, P, 'Pie sobre una banda elástica o con los pies apoyados en un escalón; sube hasta pasar la barbilla de la barra.', [3, 6, 90], 'Espalda y bíceps'),
  L('Tirón', 'Remo invertido con pies elevados', '🚣', 'reps', 2, HP, 'Igual que el remo invertido, pero con los pies sobre una silla o banco; el cuerpo trabaja más horizontal.', [3, 10, 75], 'Espalda, bíceps y core'),
  L('Tirón', 'Dominadas', '🧗', 'reps', 3, P, 'Agarre un poco más ancho que los hombros; sube hasta pasar la barbilla de la barra y baja controlado. Más fácil: dominadas asistidas.', [4, 6, 120], 'Espalda, bíceps y core'),
  L('Tirón', 'Dominadas con agarre cerrado', '🧗', 'reps', 3, P, 'Palmas hacia ti y manos al ancho de hombros: más trabajo para el bíceps. Baja completo y sin balanceo.', [4, 6, 120], 'Bíceps y espalda'),
  /* Hombros */
  L('Hombros', 'Elevaciones laterales con mochila', '🕊️', 'reps', 1, H, 'Sostén una mochila ligera con ambas manos y sube los brazos al lado hasta la altura de los hombros.', [3, 12, 45], 'Hombros'),
  L('Hombros', 'Plancha con toque de hombro', '🤸', 'reps', 1, HP, 'En plancha alta, toca un hombro con la mano contraria sin mover la cadera; alterna.', [3, 10, 45], 'Hombros, core y estabilidad'),
  L('Hombros', 'Flexión en pica', '⛰️', 'reps', 2, HP, 'Cuerpo en V invertida, cadera alta; baja la cabeza entre las manos y empuja. Más fácil: manos en una silla.', [3, 8, 60], 'Hombros y tríceps'),
  L('Hombros', 'Pica con pies elevados', '⛰️', 'reps', 3, HP, 'Como la flexión en pica, pero con los pies sobre una silla o banco: más carga sobre los hombros.', [3, 8, 75], 'Hombros y tríceps'),
  L('Hombros', 'Parada de manos contra la pared', '🤸', 'time', 3, HP, 'Sube con los pies a la pared, cuerpo en línea y abdomen firme; aguanta lo que puedas. Empieza con la cadera baja.', [3, 20, 90], 'Hombros, core y equilibrio'),
  /* Core */
  L('Core', 'Plancha', '🧘', 'time', 1, HP, 'Cuerpo en línea recta de cabeza a talones, abdomen firme y respiración tranquila. Más fácil: apoya las rodillas.', [3, 20, 45], 'Abdomen y hombros'),
  L('Core', 'Plancha lateral', '🧘', 'time', 1, HP, 'Apoya el antebrazo y los pies de lado, cadera arriba y cuerpo recto. Haz el mismo tiempo por cada lado.', [2, 20, 45], 'Oblicuos y cadera'),
  L('Core', 'Bird dog', '🐕', 'reps', 1, H, 'En cuatro apoyos, estira brazo y pierna contrarios sin mover la espalda.', [3, 10, 30], 'Core y espalda baja'),
  L('Core', 'Dead bug', '🪲', 'reps', 1, H, 'Boca arriba con brazos y rodillas al cielo; baja brazo y pierna contrarios sin despegar la espalda baja del suelo.', [3, 8, 30], 'Abdomen profundo'),
  L('Core', 'Abdominales crunch', '🔥', 'reps', 1, H, 'Eleva solo los hombros del suelo, sin jalar el cuello con las manos.', [3, 15, 30], 'Abdomen'),
  L('Core', 'Elevación de piernas acostado', '🦵', 'reps', 1, H, 'Espalda baja pegada al suelo; sube las piernas casi rectas y baja sin tocar el piso.', [3, 10, 45], 'Abdomen bajo'),
  L('Core', 'Hollow hold', '🛶', 'time', 2, H, 'Boca arriba, hombros y piernas ligeramente elevados con la espalda baja pegada al suelo. Más fácil: dobla las rodillas.', [3, 20, 45], 'Abdomen completo'),
  L('Core', 'Elevación de rodillas colgado', '🪝', 'reps', 2, P, 'Colgado de una barra, sube las rodillas al pecho sin balancearte.', [3, 8, 60], 'Abdomen bajo y agarre'),
  L('Core', 'Escaladores', '🧗', 'time', 1, HP, 'En plancha alta, lleva una rodilla al pecho y alterna a ritmo constante.', [3, 30, 30], 'Abdomen, hombros y piernas'),
  L('Core', 'V-ups', '✌️', 'reps', 3, H, 'Boca arriba, sube brazos y piernas a la vez hasta formar una V y baja controlado.', [3, 10, 60], 'Abdomen completo'),
  L('Core', 'Elevación de piernas colgado', '🔥', 'reps', 3, P, 'Colgado de una barra, sube las piernas rectas hasta la altura de la cadera o más, sin balanceo.', [4, 8, 75], 'Abdomen y flexores de cadera'),
  /* Cardio */
  L('Cardio', 'Jumping jacks', '⭐', 'time', 1, HP, 'Salta abriendo piernas y brazos a la vez; ritmo constante y aterrizaje suave.', [3, 30, 30], 'Cardio y piernas'),
  L('Cardio', 'Rodillas altas', '🏃', 'time', 1, HP, 'Corre en el sitio llevando las rodillas a la altura de la cadera.', [3, 30, 30], 'Cardio, piernas y core'),
  L('Cardio', 'Caminata rápida', '🚶', 'time', 1, P, 'Ritmo vivo en el que aún puedas hablar con frases cortas.', [1, 1200, 0], 'Cardio de bajo impacto'),
  L('Cardio', 'Trote suave', '🏃', 'time', 1, P, 'Ritmo en el que puedas conversar; alterna con caminata si lo necesitas.', [1, 900, 0], 'Cardio y piernas'),
  L('Cardio', 'Patinadores', '⛸️', 'time', 2, HP, 'Salta de lado a lado aterrizando en una pierna, con el torso ligeramente inclinado.', [3, 30, 30], 'Piernas, glúteos y cardio'),
  L('Cardio', 'Saltar la cuerda', '🪢', 'time', 2, HP, 'Saltos pequeños sobre las puntas. Si no tienes cuerda, imita el movimiento sin ella.', [3, 60, 30], 'Pantorrillas y cardio'),
  L('Cardio', 'Sprints de 20 segundos', '⚡', 'time', 3, P, 'Corre a máxima velocidad durante 20 s y camina para recuperar. Calienta bien antes.', [6, 20, 40], 'Piernas y cardio'),
  /* Cuerpo completo */
  L('Cuerpo completo', 'Gusano (inchworm)', '🐛', 'reps', 1, HP, 'De pie, baja las manos al suelo, camina hacia una plancha, regresa y sube. Con las piernas casi rectas.', [3, 8, 45], 'Hombros, core e isquiotibiales'),
  L('Cuerpo completo', 'Burpees sin salto', '🔄', 'reps', 1, HP, 'Baja al suelo, vuelve a ponerte de pie sin saltar y sube los brazos. Hazlo a tu ritmo.', [3, 6, 60], 'Piernas, pecho, hombros y core'),
  L('Cuerpo completo', 'Oso caminando', '🐻', 'time', 1, HP, 'En cuatro apoyos con las rodillas apenas despegadas, avanza con brazo y pierna contrarios.', [3, 30, 45], 'Hombros, core y piernas'),
  L('Cuerpo completo', 'Burpees', '🔄', 'reps', 2, HP, 'Baja al suelo, empuja con el pecho, vuelve a ponerte de pie y salta. Mantén la técnica aunque te canses.', [3, 8, 60], 'Piernas, pecho, hombros y core'),
  L('Cuerpo completo', 'Plancha con descenso (up-down)', '⬆️', 'reps', 2, HP, 'De plancha en antebrazos sube a plancha alta y baja, alternando el brazo que empieza.', [3, 8, 45], 'Hombros, tríceps y core'),
  L('Cuerpo completo', 'Burpee con flexión', '🔥', 'reps', 3, HP, 'Burpee completo con una flexión en el suelo antes de volver a levantarte y saltar.', [4, 8, 75], 'Todo el cuerpo')
];
var BY = {};
LIB.forEach(function (l) { BY[l.n] = l; });
function libFind(name) { return BY[name] || null; }
function libSearch(q, g) {
  var p = U.plain(q || '').trim();
  return LIB.filter(function (l) {
    if (g && l.g !== g) return false;
    return !p || U.plain(l.n).indexOf(p) >= 0 || U.plain(l.g).indexOf(p) >= 0;
  });
}
function emojiFor(name) { var l = BY[name]; return l ? l.e : '💪'; }
var GROUP_SHORT = { 'Piernas y glúteos': 'Piernas', 'Cuerpo completo': 'Completo' };

/* ---------- Calentamiento sin material (unos 8 minutos) ---------- */
var WARM = [
  { id: 'w0', e: '🏃', n: 'Trote suave o marcha en el sitio', secs: 180, meta: '3 min', tip: 'Sube poco a poco el ritmo hasta sentir calor, sin llegar a cansarte.' },
  { id: 'w1', e: '🔄', n: 'Círculos de brazos y hombros', secs: 60, meta: '1 min', tip: 'Medio minuto hacia adelante y medio hacia atrás, con círculos amplios y lentos.' },
  { id: 'w2', e: '🤲', n: 'Círculos de muñecas y tobillos', secs: 60, meta: '1 min', tip: 'Muy importante en calistenia: tus muñecas y tobillos sostienen tu peso.' },
  { id: 'w3', e: '🌀', n: 'Rotación de cadera y de torso', secs: 60, meta: '1 min', tip: 'Gira con control, sin forzar el final del movimiento.' },
  { id: 'w4', e: '🐈', n: 'Gato-camello (movilidad de espalda)', secs: 0, meta: '1 × 8 repeticiones', tip: 'Alterna espalda curvada y espalda hundida despacio.' },
  { id: 'w5', e: '🦵', n: 'Sentadilla con peso corporal', secs: 0, meta: '2 × 10 repeticiones', tip: 'Espalda recta y rodillas en dirección de los pies.' },
  { id: 'w6', e: '🙌', n: 'Flexiones lentas inclinadas', secs: 0, meta: '1 × 8 repeticiones', tip: 'Activa pecho, hombros y brazos antes del trabajo principal.' }
];

/* ---------- Niveles ---------- */
var LEVELS = [
  { id: 'principiante', e: '🌱', name: 'Principiante', days: '3 días por semana',
    desc: 'Cuerpo completo con tu peso corporal: sentadillas, flexiones inclinadas, remo con mochila y core. Descansos de 30 a 60 s. Se hace en casa, sin material.' },
  { id: 'intermedio', e: '💪', name: 'Intermedio', days: '4 días por semana',
    desc: 'Empuje, piernas, tirón y cuerpo completo. Flexiones completas, saltos y dominadas asistidas. Descansos de 45 a 90 s. Casa y parque con barra.' },
  { id: 'avanzado', e: '🔥', name: 'Avanzado', days: '5 días por semana',
    desc: 'Dominadas, fondos, flexiones arqueras, pistol y core colgado. Más series y descansos de 60 a 120 s. Ideal con barra y paralelas en un parque.' }
];
function levelOf(id) {
  for (var i = 0; i < LEVELS.length; i++) { if (LEVELS[i].id === id) return LEVELS[i]; }
  return LEVELS[0];
}
function rest7() { var a = []; for (var i = 0; i < 7; i++) a.push({ rest: true, slot: 'tarde', label: '', ex: [] }); return a; }
function setDay(days, i, label, ex) { days[i].rest = false; days[i].label = label; days[i].ex = ex; }

/* Versión de bajo impacto (contextura robusta): sin saltos */
var LOW = {
  'Sentadilla con salto': ['reps', 'Sentadilla con peso corporal'], 'Zancada con salto': ['reps', 'Zancada atrás'], 'Burpees': ['reps', 'Burpees sin salto'],
  'Burpee con flexión': ['reps', 'Burpees sin salto'], 'Saltar la cuerda': ['time', 'Caminata rápida'], 'Patinadores': ['time', 'Rodillas altas'],
  'Jumping jacks': ['time', 'Rodillas altas'], 'Sprints de 20 segundos': ['time', 'Caminata rápida'], 'Flexiones explosivas': ['reps', 'Flexiones']
};
/* Lugar de entreno: 'casa' o 'parque' (lo fija el estado con D.ctx.place) */
var HOME_MAP = {
  'Fondos en paralelas': ['Fondos en banco', 12], 'Colgarse de la barra': ['Superman', 15],
  'Dominadas negativas': ['Remo invertido con pies elevados', 8], 'Dominadas asistidas con banda': ['Remo invertido', 8],
  'Dominadas': ['Remo invertido con pies elevados', 10], 'Dominadas con agarre cerrado': ['Curl de bíceps con mochila', 15],
  'Elevación de rodillas colgado': ['Elevación de piernas acostado', 12], 'Elevación de piernas colgado': ['Elevación de piernas acostado', 15],
  'Sprints de 20 segundos': ['Rodillas altas', 30], 'Caminata rápida': ['Rodillas altas', 60, 3, 30], 'Trote suave': ['Rodillas altas', 60, 3, 30]
};
var PARK_MAP = { 'Patinadores': ['Sprints de 20 segundos', 20, 6, 40] };
function place() { return (D.ctx && D.ctx.place === 'parque') ? 'parque' : 'casa'; }
/* Convierte una lista [nombre, series, cantidad, descanso] en ejercicios */
function build(list, build) {
  var pl = place(), map = pl === 'casa' ? HOME_MAP : PARK_MAP, seen = {}, out = [];
  list.forEach(function (r0) {
    var r = r0.slice(), m = map[r[0]];
    if (m) r = [m[0], m[2] || r[1], m[1], m[3] != null ? m[3] : r[3]];
    if (build === 'robusta' && LOW[r[0]]) {
      var lo = LOW[r[0]], rep = BY[lo[1]];
      r = (rep && rep.t === 'time' && rep.d[1] >= 600) ? [lo[1], 1, 1200, 0] : [lo[1], r[1], r[2], r[3]];
    }
    if (seen[r[0]] || !BY[r[0]]) return;
    seen[r[0]] = true; out.push(r);
  });
  return out.map(function (r) { return BY[r[0]].t === 'time' ? mkT(r[0], r[1], r[2], r[3]) : mk(r[0], r[1], r[2], r[3]); });
}
function planBeg(b) {
  var d = rest7(), park = place() === 'parque';
  var A = [['Sentadilla con peso corporal', 3, 12, 45], [park ? 'Remo invertido' : 'Remo con mochila', 3, park ? 8 : 12, 60], ['Flexiones inclinadas', 3, 8, 60], ['Puente de glúteo', 3, 15, 45], ['Plancha', 3, 20, 45], ['Jumping jacks', 2, 30, 30]];
  var B = [['Zancada atrás', 3, 8, 45], ['Flexiones de rodillas', 3, 8, 60], park ? ['Colgarse de la barra', 3, 20, 60] : ['Superman', 3, 12, 45], ['Fondos en banco', 3, 8, 60], ['Dead bug', 3, 8, 30], ['Elevación de talones', 3, 15, 30]];
  if (b === 'delgada') { A.pop(); A[0] = ['Sentadilla con peso corporal', 4, 12, 45]; }
  setDay(d, 0, 'Cuerpo completo A', build(A, b)); setDay(d, 2, 'Cuerpo completo B', build(B, b)); setDay(d, 4, 'Cuerpo completo A', build(A, b));
  if (b === 'robusta') { setDay(d, 1, 'Cardio suave', build([['Caminata rápida', 1, 1200, 0]], b)); setDay(d, 5, 'Cardio suave', build([['Caminata rápida', 1, 1500, 0]], b)); }
  return d;
}
function planMid(b) {
  var d = rest7(), home = place() === 'casa';
  setDay(d, 0, 'Empuje y core', build([['Flexiones', 4, 10, 60], ['Flexiones declinadas', 3, 8, 60], ['Fondos en banco', 3, 12, 60], ['Flexión en pica', 3, 8, 60], ['Plancha con toque de hombro', 3, 10, 45], ['Hollow hold', 3, 20, 45]], b));
  setDay(d, 1, 'Piernas', build([['Sentadilla con salto', 4, 10, 60], ['Zancada búlgara', 3, 8, 60], ['Puente a una pierna', 3, 8, 45], ['Elevación de talones a una pierna', 3, 12, 45], ['Sentadilla isométrica en pared', 3, 45, 45], ['Saltar la cuerda', 3, 60, 30]], b));
  setDay(d, 3, 'Tirón y core', build(home
    ? [['Remo invertido con pies elevados', 4, 8, 75], ['Remo invertido', 4, 10, 75], ['Remo con mochila', 3, 12, 60], ['Curl de bíceps con mochila', 3, 12, 45], ['Superman', 3, 12, 45], ['Elevación de piernas acostado', 3, 12, 45], ['Plancha lateral', 3, 30, 45]]
    : [['Dominadas asistidas con banda', 4, 6, 90], ['Remo invertido', 4, 8, 75], ['Curl de bíceps con mochila', 3, 12, 45], ['Superman', 3, 12, 45], ['Elevación de rodillas colgado', 3, 8, 60], ['Plancha lateral', 3, 30, 45]], b));
  setDay(d, 4, 'Cuerpo completo', build([['Burpees', 4, 8, 60], ['Flexiones diamante', 3, 8, 60], ['Zancada atrás', 3, 10, 45], ['Dominadas negativas', 3, 5, 90], ['Escaladores', 3, 30, 30], ['Patinadores', 3, 30, 30]], b));
  if (b === 'robusta') setDay(d, 5, 'Cardio suave', build([['Caminata rápida', 1, 1500, 0]], b));
  return d;
}
function planAdv(b) {
  var d = rest7(), home = place() === 'casa';
  setDay(d, 0, 'Empuje', build([['Flexiones arqueras', 4, 6, 90], ['Fondos en paralelas', 4, 8, 90], ['Pica con pies elevados', 4, 8, 75], ['Flexiones declinadas', 3, 12, 60], ['Flexiones explosivas', 3, 6, 90], ['Parada de manos contra la pared', 3, 20, 90]], b));
  setDay(d, 1, 'Tirón', build(home
    ? [['Remo invertido con pies elevados', 5, 10, 75], ['Remo invertido', 4, 12, 75], ['Remo con mochila', 4, 15, 60], ['Curl de bíceps con mochila', 4, 15, 45], ['Superman', 3, 15, 45], ['Plancha lateral', 3, 30, 45]]
    : [['Dominadas', 5, 6, 120], ['Dominadas con agarre cerrado', 4, 6, 120], ['Remo invertido con pies elevados', 4, 10, 75], ['Colgarse de la barra', 3, 30, 60], ['Curl de bíceps con mochila', 3, 15, 45], ['Superman', 3, 15, 45]], b));
  setDay(d, 2, 'Piernas', build([['Sentadilla pistol asistida', 4, 5, 90], ['Zancada con salto', 4, 10, 75], ['Zancada búlgara', 4, 10, 75], ['Curl nórdico asistido', 3, 5, 90], ['Puente a una pierna', 3, 12, 45], ['Elevación de talones a una pierna', 4, 15, 45]], b));
  setDay(d, 4, 'Core y cardio', build([['Elevación de piernas colgado', 4, 8, 75], ['V-ups', 4, 10, 60], ['Hollow hold', 4, 30, 45], ['Plancha lateral', 3, 45, 45], ['Sprints de 20 segundos', 6, 20, 40], ['Escaladores', 4, 40, 30]], b));
  setDay(d, 5, 'Cuerpo completo', build([['Burpee con flexión', 4, 8, 75], ['Dominadas', 4, 5, 90], ['Flexiones', 4, 15, 60], ['Sentadilla con salto', 4, 12, 60], ['Plancha', 3, 60, 45], ['Oso caminando', 3, 40, 45]], b));
  if (b === 'robusta') setDay(d, 3, 'Cardio suave', build([['Caminata rápida', 1, 1500, 0]], b));
  return d;
}
function buildPlan(level, bd) {
  var b = (bd === 'delgada' || bd === 'robusta') ? bd : 'media';
  if (level === 'avanzado') return planAdv(b);
  if (level === 'intermedio') return planMid(b);
  return planBeg(b);
}
var REC = {
  delgada: { e: '🧱', title: 'Construir fuerza y músculo',
    text: 'Con contextura delgada rinde más avanzar despacio en las progresiones, descansar bien y comer lo suficiente. Haz pocas series de cardio y busca llegar a las repeticiones altas antes de pasar al ejercicio más difícil.' },
  media: { e: '⚖️', title: 'Fuerza, control y resistencia',
    text: 'Con contextura media funciona un plan equilibrado de fuerza y core con algo de cardio. Pasa al ejercicio más difícil cuando completes todas las series con buena técnica.' },
  robusta: { e: '🫀', title: 'Fuerza con bajo impacto',
    text: 'Con contextura robusta te conviene empezar con ejercicios sin saltos, cuidar rodillas y muñecas (usa flexiones inclinadas) y sumar caminatas rápidas. Los saltos llegan después, poco a poco.' }
};

var CALI = {
  LIB: LIB, GROUPS: GROUPS, GROUP_EMOJI: GROUP_EMOJI, libFind: libFind, libSearch: libSearch, libDose: D.libDose, LV_INFO: D.LV_INFO,
  GROUP_SHORT: GROUP_SHORT, emojiFor: emojiFor, WARM: WARM, WARM_TOTAL: '8 min', LEVELS: LEVELS, levelOf: levelOf, buildPlan: buildPlan, REC: REC,
  T: {
    id: 'cali', brand: '🤸 Primer Set', name: 'Calistenia', emoji: '🤸', themeColor: '#C62828',
    welcome: 'Tu rutina de calistenia paso a paso, en casa o en el parque. Primero, escribe en una frase por qué quieres entrenar. La verás cada vez que abras la sección.',
    ph: 'Ej.: lograr mi primera dominada', liftW: 'Carga extra (kg, opcional)', liftSum: '📝 Anotar repeticiones y carga extra', liftHint: 'Anota tu mejor serie de hoy. Si no usas carga extra, deja el peso en 0.',
    goalW: 'Carga extra que quiero lograr (kg)', goalWT: 'Subir la carga extra de', rutEmoji: '🤸',
    rutHint: 'Ejercicios con tu peso corporal. Cada uno indica si se hace en 🏠 casa o 🌳 parque.'
  }
};

/* Paquete del gimnasio: lo que ya existía, tal cual */
var GYM = {
  LIB: D.LIB, GROUPS: D.GROUPS, GROUP_EMOJI: D.GROUP_EMOJI, libFind: D.libFind, libSearch: D.libSearch, libDose: D.libDose, LV_INFO: D.LV_INFO,
  GROUP_SHORT: D.GROUP_SHORT, emojiFor: D.emojiFor, WARM: D.WARM, WARM_TOTAL: D.WARM_TOTAL, LEVELS: D.LEVELS, levelOf: D.levelOf, buildPlan: D.buildPlan, REC: D.REC,
  T: {
    id: 'gym', brand: '🏋️ Primer Set', name: 'Gimnasio', emoji: '🏋️', themeColor: '#0E7C70',
    welcome: 'Tu rutina de gym paso a paso. Primero, escribe en una frase por qué quieres entrenar. La verás cada vez que abras la app.',
    ph: 'Ej.: tener más energía y fuerza para mi día a día', liftW: 'Peso (kg)', liftSum: '📝 Anotar peso y repeticiones', liftHint: 'Anota tu mejor serie de hoy. Así ves cómo subes con el tiempo.',
    goalW: 'Peso que quiero levantar (kg)', goalWT: 'Subir', rutEmoji: '🏋️',
    rutHint: ''
  }
};
D.ctx = { place: 'casa' };
D.packs = { gym: GYM, cali: CALI };
D.use = function (sec) {
  var p = D.packs[sec] || GYM;
  Object.keys(p).forEach(function (k) { D[k] = p[k]; });
  D.SEC = p.T.id;
};

/* Comprobación: todo ejercicio de los planes debe existir en la biblioteca */
D.checkCali = function () {
  var bad = [];
  ['principiante', 'intermedio', 'avanzado'].forEach(function (lv) {
    ['delgada', 'media', 'robusta'].forEach(function (b) {
      ['casa', 'parque'].forEach(function (pl) {
        D.ctx.place = pl;
        buildPlan(lv, b).forEach(function (day) { day.ex.forEach(function (e) { if (!BY[e.name]) bad.push(e.name); }); });
      });
    });
  });
  return bad;
};
})();

(function () {
'use strict';
var U = PS.u, D = PS.d;

/* =====================================================================
   Calentamiento y estiramiento según lo que se entrena ese día:
   tren superior, tren inferior, cuerpo completo o cardio.
   ===================================================================== */
function w(id, e, n, secs, meta, tip) { return { id: id, e: e, n: n, secs: secs, meta: meta, tip: tip }; }

var TIP = {
  arms: 'Medio minuto hacia adelante y medio hacia atrás, con círculos amplios y lentos.',
  hip: 'Gira con control, sin forzar el final del movimiento.',
  cat: 'Alterna espalda curvada y espalda hundida despacio.',
  sq: 'Espalda recta y rodillas en dirección de los pies.',
  bridge: 'Activa los glúteos antes de cargar peso.',
  scap: 'Junta los omóplatos como si quisieras sostener un lápiz entre ellos.',
  leg: 'Mantente de pie, agárrate de una pared y balancea la pierna adelante y atrás sin forzar.',
  ankle: 'Dibuja círculos lentos con la punta del pie, a cada lado.',
  wrist: 'Muy importante en calistenia: tus muñecas sostienen tu peso. Gira, flexiona y estira con suavidad.'
};
var rep = function (n) { return n; };

var BANK = {
  gym: {
    warm: {
      upper: [
        w('w0', '🚴', 'Cardio suave: caminata o bicicleta', 300, '5 min', 'Sube poco a poco el ritmo hasta sentir calor, sin llegar a cansarte.'),
        w('w1', '🔄', 'Círculos de brazos y hombros', 60, '1 min', TIP.arms),
        w('wu2', '🌀', 'Rotación de torso', 60, '1 min', TIP.hip),
        w('w5', '🐈', 'Gato-camello (movilidad de espalda)', 0, '1 × 8 repeticiones', TIP.cat),
        w('wu4', '🧲', 'Retracción de omóplatos', 0, '1 × 12 repeticiones', TIP.scap),
        w('w6', '🏋️', 'Series de aproximación', 0, '1-2 series con la mitad del peso × 8', 'Haz el primer ejercicio del día con poco peso antes de las series reales.')
      ],
      lower: [
        w('w0', '🚴', 'Cardio suave: caminata o bicicleta', 300, '5 min', 'Sube poco a poco el ritmo hasta sentir calor, sin llegar a cansarte.'),
        w('wl1', '🌀', 'Rotación de cadera', 60, '1 min', TIP.hip),
        w('wl2', '🦵', 'Balanceo de piernas', 0, '1 × 10 por pierna', TIP.leg),
        w('w3', '🦵', 'Sentadilla con peso corporal', 0, '2 × 10 repeticiones', TIP.sq),
        w('w4', '🍑', 'Puente de glúteo', 0, '1 × 12 repeticiones', TIP.bridge),
        w('w6', '🏋️', 'Series de aproximación', 0, '1-2 series con la mitad del peso × 8', 'Haz el primer ejercicio del día con poco peso antes de las series reales.')
      ],
      full: null, cardio: [
        w('w0', '🚴', 'Cardio suave: caminata o bicicleta', 300, '5 min', 'Sube poco a poco el ritmo hasta sentir calor, sin llegar a cansarte.'),
        w('wc1', '🦶', 'Movilidad de tobillos y cadera', 60, '1 min', TIP.ankle),
        w('wc2', '🏃', 'Rodillas altas suaves', 60, '1 min', 'Ritmo tranquilo, solo para activar las piernas.')
      ]
    }
  },
  cali: {
    warm: {
      upper: [
        w('w0', '🏃', 'Trote suave o marcha en el sitio', 180, '3 min', 'Sube poco a poco el ritmo hasta sentir calor, sin llegar a cansarte.'),
        w('w1', '🔄', 'Círculos de brazos y hombros', 60, '1 min', TIP.arms),
        w('w2', '🤲', 'Círculos de muñecas', 60, '1 min', TIP.wrist),
        w('w5', '🐈', 'Gato-camello (movilidad de espalda)', 0, '1 × 8 repeticiones', TIP.cat),
        w('cu4', '🧲', 'Retracción de omóplatos en plancha', 0, '1 × 8 repeticiones', 'En plancha alta, hunde y sube el pecho entre los brazos sin doblar los codos.'),
        w('w6', '🙌', 'Flexiones lentas inclinadas', 0, '1 × 8 repeticiones', 'Activa pecho, hombros y brazos antes del trabajo principal.')
      ],
      lower: [
        w('w0', '🏃', 'Trote suave o marcha en el sitio', 180, '3 min', 'Sube poco a poco el ritmo hasta sentir calor, sin llegar a cansarte.'),
        w('wl1', '🌀', 'Rotación de cadera', 60, '1 min', TIP.hip),
        w('cl2', '🦶', 'Círculos de tobillos', 60, '1 min', TIP.ankle),
        w('wl2', '🦵', 'Balanceo de piernas', 0, '1 × 10 por pierna', TIP.leg),
        w('w3', '🦵', 'Sentadilla con peso corporal', 0, '2 × 10 repeticiones', TIP.sq),
        w('w4', '🍑', 'Puente de glúteo', 0, '1 × 12 repeticiones', TIP.bridge)
      ],
      full: null, cardio: [
        w('w0', '🏃', 'Trote suave o marcha en el sitio', 180, '3 min', 'Sube poco a poco el ritmo hasta sentir calor, sin llegar a cansarte.'),
        w('cl2', '🦶', 'Círculos de tobillos', 60, '1 min', TIP.ankle),
        w('wc2', '🏃', 'Rodillas altas suaves', 60, '1 min', 'Ritmo tranquilo, solo para activar las piernas.')
      ]
    }
  }
};
/* Cuerpo completo = la lista general de cada bloque */
BANK.gym.warm.full = D.packs.gym.WARM;
BANK.cali.warm.full = D.packs.cali.WARM;

/* Estiramientos finales (3 a 5 minutos) */
function cool(sec) {
  var chest = w('kp1', '🧍', 'Estiramiento de pecho en la pared', 60, '30 s por lado', 'Apoya el antebrazo en la pared o en el marco de una puerta y gira el cuerpo hacia el lado contrario.');
  var child = w('kp2', '🧘', 'Postura del niño (espalda)', 60, '1 min', 'De rodillas, siéntate sobre los talones y estira los brazos al frente, con la frente al suelo.');
  var shoulder = w('kp3', '🤗', 'Estiramiento de hombro', 60, '30 s por lado', 'Cruza un brazo por delante del pecho y sujétalo con el otro, sin encoger los hombros.');
  var tri = w('kp4', '💪', 'Estiramiento de tríceps', 60, '30 s por lado', 'Lleva una mano a la espalda por detrás de la cabeza y empuja suave el codo con la otra.');
  var wrist = w('kp6', '🤲', 'Estiramiento de muñecas y antebrazos', 60, '30 s por lado', 'Con el brazo estirado, lleva la mano hacia ti con la otra y luego hacia abajo.');
  var quad = w('kl1', '🦵', 'Estiramiento de cuádriceps', 60, '30 s por pierna', 'De pie, lleva el talón al glúteo sujetando el pie, con las rodillas juntas.');
  var ham = w('kl2', '🦵', 'Estiramiento de isquiotibiales', 60, '30 s por pierna', 'Sentado, estira una pierna e inclínate desde la cadera con la espalda recta.');
  var glute = w('kl3', '🍑', 'Estiramiento de glúteo (figura 4)', 60, '30 s por lado', 'Acostado, cruza un tobillo sobre la rodilla contraria y tira del muslo hacia el pecho.');
  var calf = w('kl4', '🦶', 'Estiramiento de gemelos en la pared', 60, '30 s por pierna', 'Manos en la pared, una pierna atrás con el talón en el suelo, y empuja la cadera hacia adelante.');
  var breath = w('kz1', '🌬️', 'Respiración profunda', 60, '1 min', 'Inhala por la nariz en 4 tiempos y suelta el aire despacio. Baja las pulsaciones.');
  var walk = w('kc1', '🚶', 'Caminata lenta', 120, '2 min', 'Camina despacio hasta que tu respiración vuelva a la normalidad.');
  return {
    upper: sec === 'cali' ? [chest, child, shoulder, tri, wrist, breath] : [chest, child, shoulder, tri, breath],
    lower: [quad, ham, glute, calf, breath],
    full: [chest, quad, ham, child, breath],
    cardio: [walk, calf, quad, breath]
  };
}
BANK.gym.cool = cool('gym'); BANK.cali.cool = cool('cali');

/* Qué se entrena ese día */
function focusOf(plan) {
  var lo = 0, up = 0, fu = 0, ca = 0, co = 0;
  ((plan && plan.ex) || []).forEach(function (e) {
    var l = D.libFind(e.name);
    if (!l) return;
    var g = l.g;
    if (g === 'Piernas y glúteos') lo++;
    else if (g === 'Cuerpo completo') fu++;
    else if (g === 'Cardio') ca++;
    else if (g === 'Abdomen' || g === 'Core') co++;
    else up++;
  });
  if (fu || (lo && up)) return 'full';
  if (lo) return 'lower';
  if (up) return 'upper';
  if (ca && !co) return 'cardio';
  return 'full';
}
var FOCUS_TXT = { upper: 'tren superior', lower: 'tren inferior', full: 'cuerpo completo', cardio: 'cardio' };
function bank() { return BANK[D.SEC === 'cali' ? 'cali' : 'gym']; }
function secsOf(list) { var t = 0; list.forEach(function (x) { t += x.secs > 0 ? x.secs : 45; }); return t; }
function minTxt(secs) { return Math.max(1, Math.round(secs / 60)) + ' min'; }

D.focusOf = focusOf;
D.focusName = function (plan) { return FOCUS_TXT[focusOf(plan)]; };
D.warmFor = function (plan) { return bank().warm[focusOf(plan)]; };
D.coolFor = function (plan) { return bank().cool[focusOf(plan)]; };
D.warmSecs = function (plan) { return secsOf(D.warmFor(plan)); };
D.coolSecs = function (plan) { return secsOf(D.coolFor(plan)); };
D.warmTotal = function (plan) { return minTxt(D.warmSecs(plan)); };
D.coolTotal = function (plan) { return minTxt(D.coolSecs(plan)); };
D.overheadMin = function (plan) { return Math.max(1, Math.round((D.warmSecs(plan) + D.coolSecs(plan)) / 60)); };
void U; void rep;
})();

(function () {
'use strict';
var K = PS.k, U = PS.u, D = PS.d;

/* ---------- Estado ---------- */
function defState() {
  return {
    v: 1, updatedAt: 0, purpose: '', level: 'principiante', duration: 0, place: 'casa',
    profile: { height: '', weight: '', build: 'media' },
    routine: { days: D.buildPlan('principiante', 'media') },
    logs: {},
    goals: [],
    medals: { since: '', bal: 0, weeks: {}, redeems: [] },
    achv: {},
    sg: {}
  };
}
var DK = /^\d{4}-\d{2}-\d{2}$/;
function dk(v) { return (typeof v === 'string' && DK.test(v)) ? v : ''; }
function numIn(v, lo, hi, dflt, dec) {
  var n = parseFloat(v);
  if (isNaN(n)) return dflt;
  n = Math.max(lo, Math.min(hi, n));
  return dec ? Math.round(n * 10) / 10 : Math.round(n);
}
function normLifts(o) {
  var out = {};
  if (!o || typeof o !== 'object') return out;
  Object.keys(o).slice(0, 60).forEach(function (n) {
    var v = o[n] || {};
    var w = numIn(v.w, 0, 1000, 0, true), r = numIn(v.r, 0, 1000, 0, false);
    if ((w || r) && n.length <= 80) out[n] = { w: w, r: r };
  });
  return out;
}
var PRIZE_IDS = { ex1: 5, rest10: 10, ex2: 15, day: 20 };
function normExtras(o, s) {
  if (Array.isArray(o.goals)) {
    s.goals = o.goals.slice(0, 20).map(function (g) {
      var t = (g && (g.type === 'weight' || g.type === 'reps' || g.type === 'streak')) ? g.type : '';
      if (!t) return null;
      var out = { id: (g && typeof g.id === 'string' && g.id) ? g.id.slice(0, 20) : U.uid(), type: t, name: String(g.name || '').slice(0, 80),
        target: t === 'weight' ? numIn(g.target, 1, 1000, 0, true) : t === 'reps' ? numIn(g.target, 1, 1000, 0, false) : numIn(g.target, 1, 7, 0, false),
        weeks: t === 'streak' ? numIn(g.weeks, 1, 52, 4, false) : 0, createdAt: dk(g.createdAt), doneAt: dk(g.doneAt) };
      if (!out.target || (t !== 'streak' && !out.name)) return null;
      return out;
    }).filter(Boolean);
  }
  var m = o.medals;
  if (m && typeof m === 'object') {
    s.medals.since = dk(m.since);
    s.medals.bal = numIn(m.bal, 0, 40, 0, false);
    if (m.weeks && typeof m.weeks === 'object') {
      Object.keys(m.weeks).slice(0, 400).forEach(function (k) {
        var w = m.weeks[k];
        if (!DK.test(k) || !w || typeof w !== 'object') return;
        s.medals.weeks[k] = { d: numIn(w.d, -7, 2, 0, false), f: numIn(w.f, 0, 7, 0, false), s: numIn(w.s, 0, 7, 0, false), p: numIn(w.p, 0, 7, 0, false) };
      });
    }
    if (Array.isArray(m.redeems)) {
      s.medals.redeems = m.redeems.slice(-200).map(function (r) {
        if (!r || !PRIZE_IDS[r.prize]) return null;
        return { id: (typeof r.id === 'string' && r.id) ? r.id.slice(0, 20) : U.uid(), prize: r.prize, cost: PRIZE_IDS[r.prize], wk: dk(r.wk), date: dk(r.date), tk: dk(r.tk),
          ids: Array.isArray(r.ids) ? r.ids.filter(function (x) { return typeof x === 'string'; }).slice(0, 2) : [], used: !!r.used, undone: !!r.undone };
      }).filter(Boolean);
    }
  }
  if (o.sg && typeof o.sg === 'object') {
    Object.keys(o.sg).slice(0, 80).forEach(function (k) { var d = dk(o.sg[k]); if (d && k.length <= 120) s.sg[k] = d; });
  }
  if (o.achv && typeof o.achv === 'object') {
    Object.keys(o.achv).slice(0, 40).forEach(function (k) { var d = dk(o.achv[k]); if (d && k.length <= 30) s.achv[k] = d; });
  }
}
function norm(o) {
  var s = defState();
  if (!o || typeof o !== 'object') return s;
  s.updatedAt = +o.updatedAt || 0;
  s.purpose = typeof o.purpose === 'string' ? o.purpose.slice(0, 140) : '';
  s.level = (o.level === 'intermedio' || o.level === 'avanzado') ? o.level : 'principiante';
  s.place = o.place === 'parque' ? 'parque' : 'casa';
  s.duration = (+o.duration >= 15 && +o.duration <= 180) ? Math.round(+o.duration) : 0;
  if (o.profile && typeof o.profile === 'object') {
    s.profile.height = o.profile.height === '' || o.profile.height == null ? '' : +o.profile.height || '';
    s.profile.weight = o.profile.weight === '' || o.profile.weight == null ? '' : +o.profile.weight || '';
    s.profile.build = (o.profile.build === 'delgada' || o.profile.build === 'robusta') ? o.profile.build : 'media';
  }
  if (o.routine && Array.isArray(o.routine.days) && o.routine.days.length === 7) {
    s.routine.days = o.routine.days.map(function (day) {
      var ex = Array.isArray(day && day.ex) ? day.ex.slice(0, 60) : [];
      var sl = day && day.slot;
      return {
        rest: !!(day && day.rest),
        slot: (sl === 'manana' || sl === 'tarde' || sl === 'noche') ? sl : 'tarde',
        label: (day && typeof day.label === 'string') ? day.label.slice(0, 40) : '',
        ex: ex.map(function (e) {
          var t = e && e.type === 'time' ? 'time' : 'reps';
          return {
            id: (e && typeof e.id === 'string' && e.id) ? e.id : U.uid(),
            name: String((e && e.name) || 'Ejercicio').slice(0, 80),
            type: t,
            sets: U.num(e && e.sets, 1, 10, 3),
            reps: U.num(e && e.reps, 0, 100, 10),
            secs: U.num(e && e.secs, 0, 7200, 30),
            rest: U.num(e && e.rest, 0, 600, 60)
          };
        })
      };
    });
  }
  if (o.logs && typeof o.logs === 'object') {
    Object.keys(o.logs).forEach(function (k) {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(k)) return;
      var l = o.logs[k] || {};
      s.logs[k] = {
        status: (l.status === 'done' || l.status === 'missed' || l.status === 'skip' || l.status === 'sick') ? l.status : '',
        minutes: U.num(l.minutes, 0, 600, 0),
        checks: Array.isArray(l.checks) ? l.checks.filter(function (x) { return typeof x === 'string'; }).slice(0, 80) : [],
        lifts: normLifts(l.lifts)
      };
    });
  }
  normExtras(o, s);
  return s;
}

/* ---------- Secciones: Gimnasio y Calistenia, con datos totalmente separados ---------- */
var SEC_KEY = 'primerset.section';
var KEYS = { gym: K.KEY, cali: 'primerset.cali.v1' };
var DOCS = { gym: 'app', cali: 'cali' };
function readSec() {
  try { return localStorage.getItem(SEC_KEY) === 'cali' ? 'cali' : 'gym'; } catch (e) { return 'gym'; }
}
var SEC = readSec();
D.use(SEC);
function loadSec(sec) {
  try {
    var r = localStorage.getItem(KEYS[sec]);
    if (r) return norm(JSON.parse(r));
  } catch (e) { /* sin almacenamiento local */ }
  return defState();
}
var S = loadSec(SEC);
/* El lugar de entreno (casa/parque) lo usa el generador de rutinas de Calistenia */
function syncCtx() { D.ctx.place = S.place === 'parque' ? 'parque' : 'casa'; }
syncCtx();

var hooks = { onRemote: function () {} };

var dirty = false, persistT = null;
function persistLocal() {
  dirty = false; clearTimeout(persistT);
  try { localStorage.setItem(KEYS[SEC], JSON.stringify(S)); } catch (e) { /* ignorar */ }
}
function flush() { if (dirty) persistLocal(); }
window.addEventListener('pagehide', flush);
document.addEventListener('visibilitychange', function () { if (document.visibilityState === 'hidden') flush(); });

/* ---------- Tema: sistema, claro u oscuro ---------- */
var THEME_KEY = 'primerset.theme';
function getTheme() {
  try { var t = localStorage.getItem(THEME_KEY); if (t === 'light' || t === 'dark') return t; } catch (e) { /* ignorar */ }
  return 'system';
}
function applyTheme(t) {
  var root = document.documentElement;
  if (t === 'light' || t === 'dark') root.setAttribute('data-theme', t);
  else root.removeAttribute('data-theme');
}
function setTheme(t) {
  if (t !== 'light' && t !== 'dark') t = 'system';
  try { if (t === 'system') localStorage.removeItem(THEME_KEY); else localStorage.setItem(THEME_KEY, t); } catch (e) { /* ignorar */ }
  applyTheme(t);
}
if (getTheme() !== 'system') applyTheme(getTheme());

/* ---------- Copia en la nube (solo si el visor la permite) ---------- */
var REF = null, COL = null, pushing = false, again = false, timer = null;
function pushRemote() {
  if (!REF) return;
  if (pushing) { again = true; return; }
  pushing = true;
  var ref = REF;
  var done = function () { pushing = false; if (again) { again = false; pushRemote(); } };
  try {
    ref.set({ json: JSON.stringify(S), updatedAt: S.updatedAt }).then(done, done);
  } catch (e) { done(); }
}
function save() {
  S.updatedAt = Date.now();
  dirty = true; clearTimeout(persistT); persistT = setTimeout(persistLocal, 250);
  if (REF) { clearTimeout(timer); timer = setTimeout(pushRemote, 1200); }
}
/* Copia en la nube de una sección: la más reciente gana */
function pullSection(sec) {
  var ref = COL.doc(DOCS[sec]);
  return ref.get().then(function (snap) {
    var active = sec === SEC;
    var localT = active ? S.updatedAt : (function () { try { return +(JSON.parse(localStorage.getItem(KEYS[sec]) || '{}').updatedAt) || 0; } catch (e) { return 0; } })();
    if (snap.exists) {
      var d = snap.data() || {}, o = null;
      try { o = JSON.parse(d.json); } catch (e) { o = null; }
      if (o && +o.updatedAt > localT && o.routine) {
        if (active) { S = norm(o); syncCtx(); persistLocal(); hooks.onRemote(); }
        else { try { localStorage.setItem(KEYS[sec], JSON.stringify(o)); } catch (e) { /* ignorar */ } }
      } else if (active && localT > 0) { pushRemote(); }
    } else if (active && localT > 0) { pushRemote(); }
  }).catch(function () { /* ignorar */ });
}
function initRemote() {
  try {
    if (!window.claude || typeof window.claude.use !== 'function') return;
    Promise.all([window.claude.use('db'), window.claude.use('user')]).then(function (r) {
      var db = r[0], user = r[1];
      if (!db || !user) return null;
      return user.id().then(function (id) {
        if (!id) return null;
        COL = db.collection('data/users/' + id);
        REF = COL.doc(DOCS[SEC]);
        return pullSection(SEC).then(function () { return pullSection(SEC === 'gym' ? 'cali' : 'gym'); });
      });
    }).catch(function () { /* sin nube: se usa solo el navegador */ });
  } catch (e) { /* ignorar */ }
}

/* ---------- Cambio de sección (guarda lo actual y carga la otra, sin recargar la página) ---------- */
function applySection() {
  var root = document.documentElement;
  if (SEC === 'cali') root.setAttribute('data-section', 'cali'); else root.removeAttribute('data-section');
  try {
    var m = document.querySelector('meta[name="theme-color"]');
    if (m) m.setAttribute('content', D.packs[SEC].T.themeColor);
    document.title = SEC === 'cali' ? 'Primer Set · Calistenia' : 'Primer Set';
  } catch (e) { /* ignorar */ }
}
function setSection(sec) {
  sec = sec === 'cali' ? 'cali' : 'gym';
  if (sec === SEC) return false;
  if (REF) { clearTimeout(timer); if (dirty) { persistLocal(); } pushRemote(); } else { flush(); }
  SEC = sec;
  try { localStorage.setItem(SEC_KEY, SEC); } catch (e) { /* ignorar */ }
  D.use(SEC);
  S = loadSec(SEC); syncCtx();
  if (COL) REF = COL.doc(DOCS[SEC]);
  applySection();
  if (COL) pullSection(SEC);
  return true;
}
applySection();

/* ---------- Registros y estadísticas ---------- */
function getLog(k) { return S.logs[k] || null; }
function ensureLog(k) {
  if (!S.logs[k]) S.logs[k] = { status: '', minutes: 0, checks: [], lifts: {} };
  if (!S.logs[k].lifts) S.logs[k].lifts = {};
  return S.logs[k];
}
function dayPlan(d) { return S.routine.days[U.wd(d)]; }
function isTrain(day) { return !!day && !day.rest && day.ex.length > 0; }
/* Duración en segundos de un ejercicio (sin calentamiento) */
function exSec(e) {
  return e.type === 'time' ? e.sets * e.secs + Math.max(0, e.sets - 1) * e.rest : e.sets * (40 + e.rest);
}
function mainSec(day) { var t = 0; day.ex.forEach(function (e) { t += exSec(e); }); return t; }
function isCardio(e) { return e.type === 'time' && e.sets === 1; }
function estMin(day) {
  return Math.max(10, Math.round((D.warmSecs(day) + D.coolSecs(day) + mainSec(day)) / 60 / 5) * 5);
}
function pickBy(list, test, score) {
  var best = null;
  list.forEach(function (e) { if (test(e) && (best === null || score(e) > score(best))) best = e; });
  return best;
}
/* Ajusta series, descansos y tiempos de un día para que la sesión (con calentamiento) dure unos targetMin minutos */
function fitDay(day, targetMin) {
  var W = Math.max(10, targetMin - D.overheadMin(day)) * 60, guard = 0;
  while (guard++ < 400) {
    var d = W - mainSec(day);
    if (Math.abs(d) <= 90) break;
    var e = null, ex = day.ex;
    if (d < 0) {
      e = pickBy(ex, function (x) { return !isCardio(x) && x.sets > 1 && x.rest > 30; }, function (x) { return x.rest; });
      if (e) { e.rest = Math.max(30, e.rest - 15); continue; }
      e = pickBy(ex, function (x) { return !isCardio(x) && x.sets > 2; }, function (x) { return x.sets; });
      if (e) { e.sets -= 1; continue; }
      e = pickBy(ex, function (x) { return isCardio(x) && x.secs > 300; }, function (x) { return x.secs; });
      if (e) { e.secs = Math.max(300, e.secs - 60); continue; }
      e = pickBy(ex, function (x) { return x.type === 'time' && x.sets > 1 && x.secs > 20; }, function (x) { return x.secs; });
      if (e) { e.secs = Math.max(20, e.secs - 10); continue; }
      break;
    } else {
      e = pickBy(ex, function (x) { return !isCardio(x) && x.sets > 1 && x.rest < 90; }, function (x) { return -x.rest; });
      if (e) { e.rest = Math.min(90, e.rest + 15); continue; }
      e = pickBy(ex, function (x) { return !isCardio(x) && x.sets < 4; }, function (x) { return -x.sets; });
      if (e) { e.sets += 1; continue; }
      e = pickBy(ex, function (x) { return !isCardio(x) && x.sets > 1 && x.rest < 120; }, function (x) { return -x.rest; });
      if (e) { e.rest = Math.min(120, e.rest + 15); continue; }
      e = pickBy(ex, function (x) { return !isCardio(x) && x.sets < 5; }, function (x) { return -x.sets; });
      if (e) { e.sets += 1; continue; }
      e = pickBy(ex, function (x) { return !isCardio(x) && x.sets > 1 && x.rest < 150; }, function (x) { return -x.rest; });
      if (e) { e.rest = Math.min(150, e.rest + 15); continue; }
      e = pickBy(ex, function (x) { return isCardio(x) && x.secs < 3600; }, function (x) { return -x.secs; });
      if (e) { e.secs = Math.min(3600, e.secs + 60); continue; }
      break;
    }
  }
}
function fitAll(days, targetMin) {
  days.forEach(function (day) { if (day.ex.length) fitDay(day, targetMin); });
}
/* Rutina nueva según nivel y contextura, ajustada a la duración elegida */
function makePlan(level, build, duration) {
  var plan = D.buildPlan(level, build);
  if (duration) fitAll(plan, duration);
  return plan;
}
function fmtEx(e) {
  var rest = e.rest ? ' · descanso ' + U.fmtDur(e.rest) : '';
  if (e.type === 'time') return e.sets + ' × ' + U.fmtDur(e.secs) + (e.sets > 1 ? rest : '');
  return e.sets + ' × ' + e.reps + ' repeticiones' + rest;
}
function streak(today) {
  var n = 0, d = today;
  for (var i = 0; i < 400; i++) {
    var l = getLog(U.dkey(d)), st = l ? l.status : '';
    if (st === 'done') n++;
    else if (st === 'missed') { if (i === 0) { d = U.addDays(d, -1); continue; } break; }
    else if (st === 'skip' || st === 'sick') { /* descanso ganado o enfermedad: no suma ni rompe la racha */ }
    else if (i === 0) { /* hoy aún sin registro */ }
    else if (isTrain(dayPlan(d))) break;
    d = U.addDays(d, -1);
  }
  return n;
}
function weekStats(monday, today) {
  var out = { done: 0, planned: 0, minutes: 0, days: [] };
  for (var i = 0; i < 7; i++) {
    var d = U.addDays(monday, i), l = getLog(U.dkey(d)), plan = dayPlan(d);
    var st = l ? l.status : '';
    var min = st === 'done' ? l.minutes : 0;
    if (isTrain(plan) && st !== 'skip' && st !== 'sick') out.planned++;
    if (st === 'done') { out.done++; out.minutes += min; }
    out.days.push({ date: d, status: st, minutes: min, planned: isTrain(plan), future: d > today });
  }
  return out;
}
function adherence(today) {
  var planned = 0, done = 0;
  for (var i = 0; i < 28; i++) {
    var d = U.addDays(today, -i), l = getLog(U.dkey(d));
    if (isTrain(dayPlan(d))) {
      if (l && (l.status === 'skip' || l.status === 'sick')) continue;
      if (i === 0 && !(l && l.status)) continue;
      planned++;
      if (l && l.status === 'done') done++;
    }
  }
  return planned ? Math.min(100, Math.round(done / planned * 100)) : 0;
}

PS.s = {
  get: function () { return S; },
  set: function (o) { S = norm(o); syncCtx(); persistLocal(); },
  getSection: function () { return SEC; }, setSection: setSection, syncCtx: syncCtx, reset: function () { S = defState(); syncCtx(); S.updatedAt = Date.now(); persistLocal(); if (REF) pushRemote(); },
  norm: norm, save: save, hooks: hooks, initRemote: initRemote,
  getLog: getLog, ensureLog: ensureLog, dayPlan: dayPlan, isTrain: isTrain,
  estMin: estMin, fitDay: fitDay, fitAll: fitAll, makePlan: makePlan, mainSec: mainSec, getTheme: getTheme, setTheme: setTheme, flush: flush, fmtEx: fmtEx, streak: streak, weekStats: weekStats, adherence: adherence
};
})();

(function () {
'use strict';
var U = PS.u, D = PS.d, ST = PS.s;
function S() { return ST.get(); }
function dk(d) { return U.dkey(d); }

/* ================= Peso y repeticiones reales ================= */
function getLift(k, name) { var l = ST.getLog(k); return (l && l.lifts && l.lifts[name]) || null; }
function setLift(k, name, w, r) {
  var l = ST.ensureLog(k);
  if (!w && !r) delete l.lifts[name]; else l.lifts[name] = { w: w || 0, r: r || 0 };
}
/* Historial de un ejercicio, de la fecha más antigua a la más nueva */
function liftHistory(name) {
  var out = [], logs = S().logs;
  Object.keys(logs).sort().forEach(function (k) {
    var v = logs[k].lifts && logs[k].lifts[name];
    if (v && (v.w || v.r)) out.push({ k: k, w: v.w, r: v.r });
  });
  return out;
}
/* ¿Es un récord personal? (compara con el historial SIN contar ese mismo día) */
function isPR(k, name, w, r) {
  var prev = liftHistory(name).filter(function (h) { return h.k !== k; });
  if (!prev.length || (!w && !r)) return false;
  var bw = 0, br = 0;
  prev.forEach(function (h) { if (h.w > bw) bw = h.w; });
  if (w > 0) {
    if (w > bw) return true;
    if (w === bw) { prev.forEach(function (h) { if (h.w === w && h.r > br) br = h.r; }); return r > br && br > 0; }
    return false;
  }
  if (bw > 0) return false;
  prev.forEach(function (h) { if (h.r > br) br = h.r; });
  return r > br && br > 0;
}
function liftNames() {
  var seen = {}, logs = S().logs;
  Object.keys(logs).forEach(function (k) { Object.keys(logs[k].lifts || {}).forEach(function (n) { seen[n] = true; }); });
  return Object.keys(seen).sort();
}
function bestLift(name, f) {
  var m = 0;
  liftHistory(name).forEach(function (h) { if (h[f] > m) m = h[f]; });
  return m;
}
function anyLift() {
  var logs = S().logs;
  return Object.keys(logs).some(function (k) { return Object.keys(logs[k].lifts || {}).length > 0; });
}
function exNames() {
  var seen = {}, out = [];
  D.LIB.forEach(function (l) { seen[l.n] = true; out.push(l.n); });
  S().routine.days.forEach(function (d) { d.ex.forEach(function (e) { if (e.name && !seen[e.name]) { seen[e.name] = true; out.push(e.name); } }); });
  return out;
}
function fmtNum(n) { return String(Math.round(n * 10) / 10).replace('.', ','); }

/* ================= Metas ================= */
function goalTitle(g) {
  if (g.type === 'weight') return D.T.goalWT + ' ' + g.name + ' a ' + fmtNum(g.target) + ' kg';
  if (g.type === 'reps') return g.name + ': ' + g.target + ' repeticiones';
  return 'Entrenar ' + g.target + (g.target === 1 ? ' día' : ' días') + ' por semana durante ' + g.weeks + (g.weeks === 1 ? ' semana' : ' semanas');
}
function goalInfo(g, today) {
  var cur = 0, tgt = g.target, txt;
  if (g.type === 'weight') { cur = bestLift(g.name, 'w'); txt = fmtNum(cur) + ' / ' + fmtNum(tgt) + ' kg'; }
  else if (g.type === 'reps') { cur = bestLift(g.name, 'r'); txt = cur + ' / ' + tgt + ' repeticiones'; }
  else {
    var start = U.mondayOf(U.parseKey(g.createdAt || dk(today))), end = U.mondayOf(today), n = 0, guard = 0;
    for (var w = start; w <= end && guard++ < 80; w = U.addDays(w, 7)) {
      var c = 0;
      for (var i = 0; i < 7; i++) { var l = ST.getLog(dk(U.addDays(w, i))); if (l && l.status === 'done') c++; }
      if (c >= g.target) n++;
    }
    cur = Math.min(n, g.weeks); tgt = g.weeks;
    txt = cur + ' / ' + g.weeks + ' semanas cumplidas';
  }
  return { cur: cur, tgt: tgt, txt: txt, pct: Math.max(0, Math.min(100, Math.round(cur / tgt * 100))), done: !!g.doneAt || cur >= tgt };
}
function addGoal(g) {
  var s = S();
  if (s.goals.length >= 20) return false;
  g.id = U.uid(); g.createdAt = dk(new Date()); g.doneAt = '';
  s.goals.push(g);
  return true;
}
/* Marca como cumplidas las metas que ya llegaron y devuelve las nuevas */
function checkGoals(today) {
  var out = [];
  S().goals.forEach(function (g) {
    if (!g.doneAt && goalInfo(g, today).cur >= goalInfo(g, today).tgt) { g.doneAt = dk(today); out.push(g); }
  });
  return out;
}

/* ================= Medallas y premios ================= */
var MAX = 40, AWARD = 2, SICK_MAX = 3;
var PRIZES = [
  { id: 'ex1', cost: 5, e: '⏭️', name: 'Saltar 1 ejercicio', desc: 'Elige 1 ejercicio de un día de esta semana; cuenta como hecho.', n: 1 },
  { id: 'rest10', cost: 10, e: '😴', name: 'Descansar 10 minutos', desc: 'Un descanso extra de 10 minutos en una sesión de esta semana.', n: 0 },
  { id: 'ex2', cost: 15, e: '⏭️', name: 'Saltar 2 ejercicios', desc: 'Elige 2 ejercicios de un día de esta semana; cuentan como hechos.', n: 2 },
  { id: 'day', cost: 20, e: '🎁', name: 'Saltar un día de entreno', desc: 'Un día de entreno de esta semana pasa a descanso ganado.', n: 0 }
];
function prizeOf(id) { for (var i = 0; i < PRIZES.length; i++) { if (PRIZES[i].id === id) return PRIZES[i]; } return null; }

/* Resultado de una semana ya terminada */
function evalWeek(mon) {
  var planned = 0, fails = 0, sick = 0;
  for (var i = 0; i < 7; i++) {
    var d = U.addDays(mon, i);
    if (!ST.isTrain(ST.dayPlan(d))) continue;
    planned++;
    var l = ST.getLog(dk(d)), st = l ? l.status : '';
    if (st === 'sick') sick++;
    else if (st !== 'done' && st !== 'skip') fails++;
  }
  var delta = fails > 0 ? -fails : (sick > 0 || !planned ? 0 : AWARD);
  return { d: delta, f: fails, s: sick, p: planned };
}
/* Cierra las semanas pasadas (los lunes) y ajusta las medallas. Devuelve un texto si hubo cambios. */
function medalSync(today) {
  var M = S().medals, changed = false, msg = '', total = 0, guard = 0;
  var cur = U.mondayOf(today);
  if (!M.since) { M.since = dk(cur); changed = true; }
  for (var w = U.parseKey(M.since); w < cur && guard++ < 120; w = U.addDays(w, 7)) {
    var key = dk(w);
    if (M.weeks[key]) continue;
    var r = evalWeek(w);
    M.weeks[key] = r;
    var before = M.bal;
    M.bal = Math.max(0, Math.min(MAX, M.bal + r.d));
    total += M.bal - before;
    changed = true;
  }
  if (total > 0) msg = '🏅 Semana completa: +' + total + (total === 1 ? ' medalla' : ' medallas');
  else if (total < 0) msg = 'Semana cerrada: ' + total + (total === -1 ? ' medalla' : ' medallas') + ' por días sin entrenar';
  if (changed) ST.save();
  return msg;
}
function fullWeeks() {
  var n = 0, w = S().medals.weeks;
  Object.keys(w).forEach(function (k) { if (w[k].f === 0 && w[k].s === 0 && w[k].p > 0) n++; });
  return n;
}
function weekRedeem(today) {
  var wk = dk(U.mondayOf(today)), list = S().medals.redeems;
  for (var i = 0; i < list.length; i++) { if (!list[i].undone && list[i].wk === wk) return list[i]; }
  return null;
}
function canRedeem(prizeId, today) {
  var p = prizeOf(prizeId), M = S().medals;
  if (!p) return 'Premio no válido';
  if (weekRedeem(today)) return 'Ya usaste un premio esta semana';
  if (M.bal < p.cost) return 'Te faltan ' + (p.cost - M.bal) + (p.cost - M.bal === 1 ? ' medalla' : ' medallas');
  return '';
}
/* Días de entreno desde hoy hasta el domingo */
function redeemDays(today) {
  var out = [], mon = U.mondayOf(today);
  for (var i = 0; i < 7; i++) {
    var d = U.addDays(mon, i);
    if (d < today) continue;
    var plan = ST.dayPlan(d), l = ST.getLog(dk(d)), st = l ? l.status : '';
    if (ST.isTrain(plan) && st !== 'done' && st !== 'skip' && st !== 'sick') out.push({ k: dk(d), d: d, plan: plan });
  }
  return out;
}
function redeem(prizeId, tk, ids, today) {
  var p = prizeOf(prizeId), M = S().medals;
  if (canRedeem(prizeId, today)) return false;
  var day = null;
  redeemDays(today).forEach(function (x) { if (x.k === tk) day = x; });
  if (!day) return false;
  if (p.n && ids.length !== p.n) return false;
  M.bal -= p.cost;
  M.redeems.push({ id: U.uid(), prize: p.id, cost: p.cost, wk: dk(U.mondayOf(today)), date: dk(today), tk: tk, ids: ids.slice(0, 2), used: false, undone: false });
  if (p.id === 'day') { var l = ST.ensureLog(tk); l.status = 'skip'; l.minutes = 0; }
  return true;
}
function undoRedeem(id, today) {
  var M = S().medals, r = null;
  M.redeems.forEach(function (x) { if (x.id === id) r = x; });
  if (!r || r.undone || r.used || r.date !== dk(today)) return false;
  r.undone = true;
  M.bal = Math.min(MAX, M.bal + r.cost);
  if (r.prize === 'day') {
    var l = ST.getLog(r.tk);
    if (l && l.status === 'skip') { l.status = ''; if (!l.checks.length && !Object.keys(l.lifts || {}).length) delete S().logs[r.tk]; }
  }
  return true;
}
/* Ejercicios saltados con premio en una fecha (ids) */
function skippedIds(k) {
  var out = {};
  S().medals.redeems.forEach(function (r) {
    if (!r.undone && r.tk === k && (r.prize === 'ex1' || r.prize === 'ex2')) r.ids.forEach(function (id) { out[id] = true; });
  });
  return out;
}
function restRedeem(k) {
  var list = S().medals.redeems;
  for (var i = 0; i < list.length; i++) { if (!list[i].undone && !list[i].used && list[i].prize === 'rest10' && list[i].tk === k) return list[i]; }
  return null;
}
function sickCount(mondayKey, exceptKey) {
  var mon = U.parseKey(mondayKey), n = 0;
  for (var i = 0; i < 7; i++) {
    var k = dk(U.addDays(mon, i)), l = ST.getLog(k);
    if (k !== exceptKey && l && l.status === 'sick') n++;
  }
  return n;
}

/* ================= Logros ================= */
function sessions() {
  var n = 0, logs = S().logs;
  Object.keys(logs).forEach(function (k) { if (logs[k].status === 'done') n++; });
  return n;
}
var ACH = [
  { id: 's1', e: '🥇', n: 'Primera sesión', d: 'Registra tu primer entrenamiento', t: function () { return sessions() >= 1; } },
  { id: 's10', e: '🏅', n: '10 sesiones', d: 'Completa 10 entrenamientos', t: function () { return sessions() >= 10; } },
  { id: 's25', e: '🎖️', n: '25 sesiones', d: 'Completa 25 entrenamientos', t: function () { return sessions() >= 25; } },
  { id: 's50', e: '🏆', n: '50 sesiones', d: 'Completa 50 entrenamientos', t: function () { return sessions() >= 50; } },
  { id: 's100', e: '👑', n: '100 sesiones', d: 'Completa 100 entrenamientos', t: function () { return sessions() >= 100; } },
  { id: 'w1', e: '📅', n: 'Primera semana completa', d: 'Cumple todos tus días de entreno de una semana', t: function () { return fullWeeks() >= 1; } },
  { id: 'w4', e: '🗓️', n: '4 semanas completas', d: 'Cumple 4 semanas completas', t: function () { return fullWeeks() >= 4; } },
  { id: 'r7', e: '🔥', n: 'Racha de 7 días', d: 'Llega a 7 días seguidos', t: function (t) { return ST.streak(t) >= 7; } },
  { id: 'l1', e: '🏋️', n: 'Primer peso anotado', d: 'Anota el peso de un ejercicio', t: function () { return anyLift(); } },
  { id: 'g1', e: '🎯', n: 'Primera meta cumplida', d: 'Cumple una de tus metas', t: function () { return S().goals.some(function (g) { return g.doneAt; }); } },
  { id: 'p1', e: '🎁', n: 'Primer premio canjeado', d: 'Canjea un premio con tus medallas', t: function () { return S().medals.redeems.some(function (r) { return !r.undone; }); } },
  { id: 'm10', e: '💎', n: '10 medallas', d: 'Junta 10 medallas', t: function () { return S().medals.bal >= 10; } }
];
function checkAch(today) {
  var s = S(), out = [];
  ACH.forEach(function (a) {
    if (!s.achv[a.id] && a.t(today)) { s.achv[a.id] = dk(today); out.push(a); }
  });
  return out;
}

Object.assign(ST, {
  getLift: getLift, setLift: setLift, isPR: isPR, liftHistory: liftHistory, liftNames: liftNames, bestLift: bestLift, exNames: exNames, fmtNum: fmtNum,
  goalTitle: goalTitle, goalInfo: goalInfo, addGoal: addGoal, checkGoals: checkGoals,
  PRIZES: PRIZES, prizeOf: prizeOf, MAX: MAX, AWARD: AWARD, SICK_MAX: SICK_MAX,
  medalSync: medalSync, weekRedeem: weekRedeem, canRedeem: canRedeem, redeemDays: redeemDays, redeem: redeem, undoRedeem: undoRedeem,
  skippedIds: skippedIds, restRedeem: restRedeem, sickCount: sickCount, ACH: ACH, checkAch: checkAch, sessions: sessions
});
})();

(function () {
'use strict';
var U = PS.u, D = PS.d, ST = PS.s;
function S() { return ST.get(); }

/* =====================================================================
   Sugerencias de progresión.
   - Peso (Bloque A, y carga extra en B): dos sesiones seguidas con todas las
     repeticiones de la meta -> sugiere subir un poco el peso.
   - Cadena de ejercicios (Bloque B): dos sesiones seguidas completadas ->
     sugiere pasar al ejercicio un poco más difícil.
   ===================================================================== */
var NEXT = {
  'Flexiones inclinadas': 'Flexiones', 'Flexiones de rodillas': 'Flexiones', 'Flexiones': 'Flexiones diamante', 'Flexiones diamante': 'Flexiones declinadas',
  'Flexiones declinadas': 'Flexiones arqueras', 'Flexiones arqueras': 'Flexiones explosivas', 'Fondos en banco': 'Fondos en paralelas',
  'Sentadilla con peso corporal': 'Sentadilla con salto', 'Sentadilla con salto': 'Sentadilla pistol asistida', 'Zancada atrás': 'Zancada búlgara',
  'Zancada búlgara': 'Zancada con salto', 'Puente de glúteo': 'Puente a una pierna', 'Elevación de talones': 'Elevación de talones a una pierna',
  'Remo con mochila': 'Remo invertido', 'Remo invertido': 'Remo invertido con pies elevados', 'Remo invertido con pies elevados': 'Dominadas negativas',
  'Colgarse de la barra': 'Dominadas negativas', 'Dominadas negativas': 'Dominadas asistidas con banda', 'Dominadas asistidas con banda': 'Dominadas',
  'Dominadas': 'Dominadas con agarre cerrado', 'Plancha con toque de hombro': 'Flexión en pica', 'Flexión en pica': 'Pica con pies elevados',
  'Pica con pies elevados': 'Parada de manos contra la pared', 'Abdominales crunch': 'Elevación de piernas acostado', 'Elevación de piernas acostado': 'V-ups',
  'Dead bug': 'Hollow hold', 'Plancha': 'Plancha con descenso (up-down)', 'Elevación de rodillas colgado': 'Elevación de piernas colgado',
  'Burpees sin salto': 'Burpees', 'Burpees': 'Burpee con flexión', 'Jumping jacks': 'Saltar la cuerda', 'Curl de bíceps con mochila': 'Dominadas con agarre cerrado'
};
var LOWER = { 'Piernas y glúteos': 1, 'Cuerpo completo': 1 };

/* Últimas sesiones registradas (días "entrenado") donde se hizo ese ejercicio, de la más nueva a la más vieja */
function sessionsOf(ex) {
  var ids = {};
  S().routine.days.forEach(function (d) { d.ex.forEach(function (e) { if (e.name === ex.name) ids[e.id] = true; }); });
  var logs = S().logs, keys = Object.keys(logs).filter(function (k) { return logs[k].status === 'done'; }).sort().reverse(), out = [];
  for (var i = 0; i < keys.length && out.length < 3; i++) {
    var l = logs[keys[i]], hit = l.checks.some(function (c) { return ids[c]; });
    if (!hit) continue;
    var lf = l.lifts && l.lifts[ex.name];
    out.push({ k: keys[i], w: lf ? lf.w : 0, r: lf ? lf.r : 0, has: !!lf });
  }
  return out;
}
function okReps(ex, s) { return ex.type === 'time' ? true : (!s.has || s.r >= ex.reps); }
function allowedHere(name) {
  var l = D.libFind(name);
  if (!l) return false;
  return (D.ctx && D.ctx.place === 'parque') || l.tip.indexOf('🏠') >= 0;
}
function incFor(ex) {
  var l = D.libFind(ex.name);
  if (D.SEC === 'cali') return 2;
  return l && LOWER[l.g] ? 5 : 2.5;
}
function sugFor(ex, plan, today) {
  var ss = sessionsOf(ex);
  if (ss.length < 2) return null;
  var a = ss[0], b = ss[1], key;
  if (ex.type !== 'time' && a.w > 0 && b.w > 0 && a.r >= ex.reps && b.r >= ex.reps) {
    var to = Math.round((a.w + incFor(ex)) * 10) / 10;
    key = ex.name + '|w|' + to;
    return { key: key, id: ex.id, name: ex.name, kind: 'weight', to: to, text: 'Sacaste ' + ex.reps + ' o más repeticiones con ' + ST.fmtNum(a.w) + ' kg dos sesiones seguidas. Hoy prueba con ' + ST.fmtNum(to) + ' kg.' };
  }
  var nx = NEXT[ex.name];
  if (nx && D.SEC === 'cali' && okReps(ex, a) && okReps(ex, b) && allowedHere(nx)) {
    var dup = plan.ex.some(function (e) { return e.name === nx; });
    if (dup) return null;
    key = ex.name + '|c|' + nx;
    return { key: key, id: ex.id, name: ex.name, kind: 'chain', to: nx, text: 'Completaste «' + ex.name + '» dos sesiones seguidas con todas las repeticiones. ¿Pasas a «' + nx + '»?' };
  }
  return null;
}
/* Semanas seguidas entrenando (sin contar la actual) desde la última descarga */
function streakWeeks(today) {
  var logs = S().logs, since = (S().sg || {})['dl|done'] || '', m = U.mondayOf(today), n = 0, i, j, ok, k;
  for (i = 1; i <= 12; i++) {
    ok = false;
    for (j = 0; j < 7; j++) {
      k = U.dkey(U.addDays(m, -7 * i + j));
      if (k <= since) { return n; }
      if (logs[k] && logs[k].status === 'done') ok = true;
    }
    if (!ok) break;
    n++;
  }
  return n;
}
function deloadSug(today) {
  var need = D.SEC === 'cali' ? 4 : 5, w = streakWeeks(today);
  if (w < need) return null;
  return { key: 'dl|' + U.dkey(U.mondayOf(today)), name: 'Semana de descarga', kind: 'deload', weeks: w,
    text: 'Llevas ' + w + ' semanas seguidas entrenando. Esta semana baja un poco: 1 serie menos por ejercicio y menos carga (cerca del 80 %). Tu cuerpo se recupera y vuelves más fuerte.' };
}
function deloadDone(today) {
  var sg = S().sg = S().sg || {};
  sg['dl|done'] = U.dkey(today);
  ST.save();
}
function suggest(today) {
  var plan = ST.dayPlan(today), out = [], dis = S().sg || {}, tk = U.dkey(today);
  if (!ST.isTrain(plan)) return out;
  var dl = deloadSug(today);
  if (dl && !(dis[dl.key] && dis[dl.key] >= tk)) out.push(dl);
  plan.ex.forEach(function (e) {
    var s = sugFor(e, plan, today);
    if (s && !(dis[s.key] && dis[s.key] >= tk)) out.push(s);
  });
  return out.slice(0, 3);
}
function dismiss(key, today) {
  var sg = S().sg = S().sg || {};
  sg[key] = U.dkey(U.addDays(today, 14));
  var keys = Object.keys(sg);
  if (keys.length > 60) keys.sort(function (x, y) { return sg[x] < sg[y] ? -1 : 1; }).slice(0, keys.length - 60).forEach(function (k) { delete sg[k]; });
  ST.save();
}
/* Cambia el ejercicio por el siguiente de la cadena en toda la rutina (conserva las series) */
function applyChain(key, today) {
  var s = null;
  suggest(today).forEach(function (x) { if (x.key === key) s = x; });
  if (!s || s.kind !== 'chain') return false;
  var lib = D.libFind(s.to);
  if (!lib) return false;
  S().routine.days.forEach(function (d) {
    d.ex.forEach(function (e) {
      if (e.name !== s.name) return;
      e.id = U.uid(); /* historial nuevo: la siguiente sugerencia llega tras 2 sesiones con este ejercicio */
      e.name = lib.n; e.type = lib.t; e.rest = lib.d[2];
      if (lib.t === 'time') { e.secs = lib.d[1]; e.reps = 0; } else { e.reps = lib.d[1]; e.secs = 0; }
    });
  });
  ST.save();
  return s;
}
Object.assign(ST, { deloadDone: deloadDone, streakWeeks: streakWeeks, suggest: suggest, dismissSug: dismiss, applyChain: applyChain, NEXT: NEXT });
})();

(function () {
'use strict';
var K = PS.k, U = PS.u, D = PS.d, ST = PS.s;
var esc = U.esc, $ = U.$;

PS.ui = {
  tab: 'hoy',
  month: '',       // 'YYYY-MM-01' del mes mostrado en el calendario
  sel: '',         // fecha elegida en el calendario
  week: '',        // lunes ('YYYY-MM-DD') de la semana mostrada en progreso
  pickG: '',       // filtro de grupo en el selector de ejercicios
  goalForm: { open: false, type: 'weight' }, // formulario de nueva meta
  liftEx: '',      // ejercicio elegido en la gráfica de peso
  rw: { v: 'list' }, // paso actual de la hoja de medallas
  imp: null,       // copia de seguridad leída, pendiente de confirmar
  impErr: '',
  pending: '',     // aviso para mostrar tras dibujar
  cbBlank: {},     // ejercicios con el nombre borrado mientras se edita (id -> true)
  undo: null,      // copia para deshacer el último cambio de nivel o contextura
  step: 1,         // paso de la ventana de bienvenida
  confirmApply: false,
  confirmReset: false,
  rutDay: -1,      // día mostrado en el editor de rutina (0 = lunes)
  pickDay: 0,      // día al que se añaden ejercicios desde el selector
  pickQ: '',       // texto del buscador de ejercicios
  bump: false,     // anima la racha tras registrar un entrenamiento
  islandOpen: false
};
var UI0 = JSON.stringify({ month: '', sel: '', week: '', pickG: '', goalForm: { open: false, type: 'weight' }, liftEx: '', rw: { v: 'list' }, imp: null, impErr: '', pending: '', cbBlank: {}, undo: null, step: 1, confirmApply: false, confirmReset: false, rutDay: -1, pickDay: 0, pickQ: '', bump: false, islandOpen: false, goalErr: '', perErr: '', mErr: '', prevState: null });
PS.ui.resetSection = function () { var o = JSON.parse(UI0); Object.keys(o).forEach(function (k) { PS.ui[k] = o[k]; }); PS.ui.tab = 'hoy'; };

function today() { var n = new Date(); return new Date(n.getFullYear(), n.getMonth(), n.getDate()); }
function S() { return ST.get(); }
function em(e) { return '<span class="em" aria-hidden="true">' + e + '</span>'; }

function pill(l) {
  if (l && l.status === 'done') return '<span class="pill done">✅ Entrenado · ' + U.fmtMin(l.minutes) + '</span>';
  if (l && l.status === 'skip') return '<span class="pill done">🎁 Descanso ganado</span>';
  if (l && l.status === 'sick') return '<span class="pill warm">🤒 Enfermo o lesionado</span>';
  if (l && l.status === 'missed') return '<span class="pill missed">❌ No entrenado</span>';
  return '<span class="pill">⏳ Sin registrar</span>';
}
function slotPill(day) {
  return ST.isTrain(day) ? '<span class="pill warm">' + K.slotEmoji(day.slot) + ' ' + esc(K.slotName(day.slot)) + '</span>' : '';
}

/* Controles para registrar un día (minutos + botones) */
function ctl(k, inputId, def, hasLog, canSick) {
  return '<div class="stack">' +
    '<label class="field" style="max-width:220px"><span class="label">⏱️ Minutos entrenados</span>' +
    '<input type="number" id="' + inputId + '" inputmode="numeric" min="0" max="600" value="' + def + '"></label>' +
    '<div class="rowflex">' +
    '<button type="button" class="btn primary" data-act="done" data-k="' + k + '" data-in="' + inputId + '">✅ Marcar como entrenado</button>' +
    '<button type="button" class="btn" data-act="missed" data-k="' + k + '">No pude entrenar</button>' +
    (canSick ? '<button type="button" class="btn" data-act="sick" data-k="' + k + '">🤒 Estoy enfermo o lesionado</button>' : '') +
    (hasLog ? '<button type="button" class="btn ghost" data-act="clear" data-k="' + k + '">Borrar registro</button>' : '') +
    '</div></div>';
}

/* Botón redondo para cambiar de bloque: solo aparece en Ajustes, junto al botón de tema */
function secBtn() {
  var cali = ST.getSection() === 'cali', to = cali ? 'gym' : 'cali', nm = cali ? 'Gimnasio' : 'Calistenia';
  return '<button type="button" class="iconbtn secbtn" data-act="secset" data-v="' + to + '" aria-label="Ir a ' + nm + '" title="Ir a ' + nm + '">' + (cali ? '🏋️' : '🤸') + '</button>';
}
var THEME_ICON = { system: '🌗', light: '☀️', dark: '🌙' };
var THEME_NAME = { system: 'del sistema', light: 'claro', dark: 'oscuro' };
function renderHeader() {
  var msg = ST.medalSync(today());
  if (msg) PS.ui.pending = msg;
  var st = ST.streak(today()), s = S(), lv = D.levelOf(s.level), th = ST.getTheme();
  $('#top').innerHTML =
    '<div class="top-row"><span class="brand">' + D.T.brand + '</span>'+ (D.T.id === 'cali' ? '<span class="secpill">Calistenia · ' + (s.place === 'parque' ? '🌳 Parque' : '🏠 Casa') + '</span>' : '') + '<div class="rowflex" style="gap:8px">' +
    '<span class="streak' + (PS.ui.bump ? ' bump' : '') + '"><span aria-hidden="true">🔥</span><b class="num">' + st + '</b> ' + (st === 1 ? 'día seguido' : 'días seguidos') + '</span>' +
    '<button type="button" class="medalbtn" data-act="rwopen" aria-label="Medallas: ' + s.medals.bal + ' de ' + ST.MAX + '. Ver premios" title="Medallas y premios"><span aria-hidden="true">🏅</span><b class="num">' + s.medals.bal + '</b></button>' +
    '<button type="button" class="iconbtn" data-act="themecycle" aria-label="Tema ' + THEME_NAME[th] + '. Pulsa para cambiar" title="Tema ' + THEME_NAME[th] + '">' + THEME_ICON[th] + '</button>' + (PS.ui.tab === 'per' ? secBtn() : '') + '</div></div>' +
    '<div class="purpose"><div class="card-head"><span class="label">🎯 Mi propósito</span><span class="pill">' + lv.e + ' ' + lv.name + '</span></div><q>' +
    esc(s.purpose || 'Escribe en Ajustes por qué quieres entrenar') + '</q></div>';
  PS.ui.bump = false;
}

/* ---------- Hoy ---------- */
function liftBox(e, k) {
  if (e.type === 'time') return '';
  var v = ST.getLift(k, e.name), sum = v ? ((v.w ? ST.fmtNum(v.w) + ' kg' : '') + (v.w && v.r ? ' × ' : '') + (v.r ? v.r + ' rep.' : '')) : '';
  return '<details class="lift"><summary data-lsum="' + esc(e.id) + '">' + (sum ? '📝 ' + esc(sum) : D.T.liftSum) + '</summary>' +
    '<div class="lift-grid"><label class="field"><span class="label">' + D.T.liftW + '</span><input type="number" inputmode="decimal" min="0" max="1000" step="0.5" placeholder="0" value="' + (v && v.w ? v.w : '') + '" data-f="liftw" data-k="' + k + '" data-n="' + esc(e.name) + '" data-x="' + esc(e.id) + '"></label>' +
    '<label class="field"><span class="label">Repeticiones</span><input type="number" inputmode="numeric" min="0" max="1000" placeholder="0" value="' + (v && v.r ? v.r : '') + '" data-f="liftr" data-k="' + k + '" data-n="' + esc(e.name) + '" data-x="' + esc(e.id) + '"></label></div>' +
    '<p class="muted small">' + D.T.liftHint + '</p></details>';
}
function exRow(e, k, checked, skipped) {
  var lib = D.libFind(e.name);
  var tip = lib ? '<div class="ex-tip">' + esc(lib.tip) + '</div>' : '';
  var timer = (e.type === 'time' && e.secs > 0 && !skipped)
    ? '<button type="button" class="btn sm" data-act="timer" data-s="' + e.secs + '" data-n="' + esc(e.name) + '">⏱️ Cronometrar</button>' : '';
  var badge = skipped ? '<div class="ex-skip">⏭️ Saltado con premio</div>' : '';
  return '<div class="ex' + (skipped ? ' skipped' : '') + '"><label class="chk"><input type="checkbox" data-act="chk" data-k="' + k + '" data-id="' + esc(e.id) + '"' + ((checked || skipped) ? ' checked' : '') + (skipped ? ' disabled' : '') + '>' +
    '<span class="box"></span><span class="ex-emoji" aria-hidden="true">' + D.emojiFor(e.name) + '</span><span class="ex-body"><span class="ex-name">' + esc(e.name) + '</span>' +
    '<div class="ex-meta">' + esc(ST.fmtEx(e)) + '</div>' + badge + tip + '</span></label>' + timer + '</div>' + (skipped ? '' : liftBox(e, k));
}
function warmRow(w, k, checked) {
  var timer = w.secs > 0
    ? '<button type="button" class="btn sm" data-act="timer" data-s="' + w.secs + '" data-n="' + esc(w.n) + '">⏱️ Cronometrar</button>' : '';
  return '<div class="ex"><label class="chk"><input type="checkbox" data-act="chk" data-k="' + k + '" data-id="' + w.id + '"' + (checked ? ' checked' : '') + '>' +
    '<span class="box"></span><span class="ex-emoji" aria-hidden="true">' + w.e + '</span><span class="ex-body"><span class="ex-name">' + esc(w.n) + '</span>' +
    '<div class="ex-meta">' + esc(w.meta) + '</div><div class="ex-tip">' + esc(w.tip) + '</div></span></label>' + timer + '</div>';
}
function timerCard() {
  var rests = [[30, '0,5'], [60, '1'], [90, '1,5'], [120, '2']], r = '';
  rests.forEach(function (x) { r += '<button type="button" class="btn sm" data-act="trest" data-s="' + x[0] + '">' + x[1] + ' min</button>'; });
  return '<div class="card timer-card"><div class="card-head"><span class="label" id="clockLabel">⏱️ Cronómetro</span><span class="live" id="liveDot" hidden>En marcha</span></div>' +
    '<div class="clock" id="clock" role="timer" aria-live="off">00:00</div>' +
    '<div class="rowflex"><button type="button" class="btn primary go" data-act="tgo" id="tgo">▶ Iniciar</button>' +
    '<button type="button" class="btn" data-act="treset">↺ Reiniciar</button>' +
    '<button type="button" class="btn ghost" data-act="tuse" id="tuse" hidden>Usar en mis minutos</button></div>' +
    '<div class="rowflex"><span class="label">😴 Descanso</span>' + r + '</div></div>';
}

function renderHoy() {
  var t = today(), k = U.dkey(t), plan = ST.dayPlan(t), log = ST.getLog(k);
  var checks = log ? log.checks : [];
  var isSkip = !!(log && log.status === 'skip'), isSick = !!(log && log.status === 'sick');
  var train = ST.isTrain(plan) && !isSkip && !isSick;
  var sk = ST.skippedIds(k), rr = ST.restRedeem(k);
  var h = '<div class="card"><div class="card-head"><div><span class="label">📅 Hoy</span><h2>' + esc(U.longDate(t)) + '</h2></div>' +
    '<div class="rowflex">' + slotPill(plan) + pill(log) + '</div></div>';
  if (train) {
    h += '<p class="muted">' + (plan.label ? '<b>' + esc(plan.label) + '</b> · ' : '') + 'Sesión de unos <b class="num">' + U.fmtMin(ST.estMin(plan)) + '</b>, con calentamiento y estiramiento. Hoy: ' + esc(D.focusName(plan)) + '.</p>' +
      '<button type="button" class="btn primary g-open" data-act="gopen">▶ Empezar sesión guiada</button>';
  }
  h += '</div>';
  h += '<div class="card soft quote"><span class="label">💬 Frase del día</span><p class="quote-t">' + esc(D.phraseOf(t)) + '</p></div>';
  h += timerCard();
  if (train && rr) {
    h += '<div class="card soft"><h3>😴 Descanso extra ganado</h3><p class="muted small">Tienes 10 minutos de descanso extra para esta sesión. Púlsalo cuando lo necesites.</p><div><button type="button" class="btn primary" data-act="rwrest" data-v="' + esc(rr.id) + '">Empezar descanso de 10 min</button></div></div>';
  }
  if (train) h += PS.v.sugCard(t);
  if (train) {
    h += '<div class="card"><div class="card-head"><div><span class="label">Primero</span><h3>🤸 Calentamiento · ' + D.warmTotal(plan) + '</h3></div></div>' +
      '<p class="muted small">Hoy trabajas ' + esc(D.focusName(plan)) + ': este calentamiento prepara justo esa zona y protege tus articulaciones.</p>';
    D.warmFor(plan).forEach(function (w) { h += warmRow(w, k, checks.indexOf(w.id) >= 0); });
    h += '</div>';
    h += '<div class="card"><div class="card-head"><div><span class="label">Después</span><h3>🏋️ Entrenamiento</h3></div><span class="pill warm num" id="progTxt"></span></div>' +
      '<div class="bar-prog"><i id="progBar"></i></div>';
    plan.ex.forEach(function (e) { h += exRow(e, k, checks.indexOf(e.id) >= 0, !!sk[e.id]); });
    h += '</div><div class="card"><div class="card-head"><div><span class="label">Al final</span><h3>🧘 Estiramiento · ' + D.coolTotal(plan) + '</h3></div></div><p class="muted small">Baja las pulsaciones y estira lo que trabajaste. Sin rebotes ni dolor.</p>';
    D.coolFor(plan).forEach(function (w) { h += warmRow(w, k, checks.indexOf(w.id) >= 0); });
    h += '</div>';
    h += '<div class="card"><h3>📝 Registrar el día</h3>' + ctl(k, 'minToday', (log && log.minutes) || ST.estMin(plan), !!(log && log.status), true) + '</div>';
  } else if (isSkip) {
    h += '<div class="card"><h3>🎁 Descanso ganado</h3><p class="muted">Hoy usas un premio de tus medallas: no cuenta como día fallado y tu racha sigue igual. Si te equivocaste, puedes deshacer el canje hoy desde el botón 🏅 de arriba.</p></div>';
  } else if (isSick) {
    h += '<div class="card"><h3>🤒 Hoy toca recuperarte</h3><p class="muted">Descansar también es entrenar. Hoy no cuenta como día fallado, no quita medallas y no rompe tu racha.</p><div><button type="button" class="btn ghost" data-act="clear" data-k="' + k + '">Ya me siento bien: borrar registro</button></div></div>';
  } else {
    h += '<div class="card"><h3>😴 Día de descanso</h3><p class="muted">Hoy no tienes ejercicios en tu rutina. Descansar es parte del entrenamiento: el músculo se recupera en estos días. Puedes caminar 20 minutos o hacer estiramientos suaves.</p></div>';
    h += '<div class="card"><h3>¿Entrenaste igual?</h3>' + ctl(k, 'minToday', (log && log.minutes) || 30, !!(log && log.status), false) + '</div>';
  }
  $('#v-hoy').innerHTML = h;
  updateProg();
  if (PS.timerSync) PS.timerSync();
}
function updateProg() {
  var t = today(), plan = ST.dayPlan(t), log = ST.getLog(U.dkey(t));
  var bar = $('#progBar'), txt = $('#progTxt');
  if (!bar || !txt || !ST.isTrain(plan)) return;
  var n = 0;
  var sk = ST.skippedIds(U.dkey(t));
  plan.ex.forEach(function (e) { if ((log && log.checks.indexOf(e.id) >= 0) || sk[e.id]) n++; });
  bar.style.width = Math.round(n / plan.ex.length * 100) + '%';
  txt.textContent = n + ' de ' + plan.ex.length;
}

/* ---------- Calendario ---------- */
function renderCal() {
  var ui = PS.ui, t = today();
  if (!ui.month) ui.month = U.dkey(new Date(t.getFullYear(), t.getMonth(), 1));
  if (!ui.sel) ui.sel = U.dkey(t);
  var first = U.parseKey(ui.month), y = first.getFullYear(), m = first.getMonth();
  var off = U.wd(first), dim = new Date(y, m + 1, 0).getDate();
  var h = '<div class="card"><div class="card-head"><h2>📅 ' + K.MONTHS[m].charAt(0).toUpperCase() + K.MONTHS[m].slice(1) + ' ' + y + '</h2>' +
    '<div class="rowflex"><button type="button" class="btn sm" data-act="calprev" aria-label="Mes anterior">Anterior</button>' +
    '<button type="button" class="btn sm" data-act="calnow">Hoy</button>' +
    '<button type="button" class="btn sm" data-act="calnext" aria-label="Mes siguiente">Siguiente</button></div></div>' +
    '<div class="cal-scroll"><div class="cal">';
  K.DS.forEach(function (n) { h += '<div class="dow">' + n + '</div>'; });
  for (var b = 0; b < off; b++) h += '<span class="cell blank" aria-hidden="true"></span>';
  for (var i = 1; i <= dim; i++) {
    var d = new Date(y, m, i), k = U.dkey(d), l = ST.getLog(k), plan = ST.dayPlan(d);
    var dot = 'none', word = 'sin ejercicios';
    if (l && l.status === 'done') { dot = 'done'; word = 'entrenado'; }
    else if (l && l.status === 'missed') { dot = 'missed'; word = 'no entrenado'; }
    else if (l && l.status === 'skip') { dot = 'skip'; word = 'descanso ganado'; }
    else if (l && l.status === 'sick') { dot = 'sick'; word = 'enfermo o lesionado'; }
    else if (ST.isTrain(plan)) { dot = 'plan'; word = (d < t ? 'pendiente de registrar' : 'planeado') + ', ' + K.slotName(plan.slot).toLowerCase(); }
    var cls = 'cell' + (k === U.dkey(t) ? ' today' : '') + (k === ui.sel ? ' sel' : '');
    h += '<button type="button" class="' + cls + '" data-act="seldate" data-k="' + k + '" aria-label="' + esc(U.longDate(d) + ', ' + word) + '"' +
      (k === ui.sel ? ' aria-current="date"' : '') + '><span class="d num">' + i + '</span><span class="dot ' + dot + '"></span></button>';
  }
  h += '</div></div><div class="legend"><span><i class="dot done"></i>Entrenado</span><span><i class="dot missed"></i>No entrenado</span><span><i class="dot plan"></i>Planeado o pendiente</span><span><i class="dot skip"></i>Descanso ganado</span><span><i class="dot sick"></i>Enfermo</span></div></div>';

  var sd = U.parseKey(ui.sel), sl = ST.getLog(ui.sel), sp = ST.dayPlan(sd);
  h += '<div class="card"><div class="card-head"><div><span class="label">Día elegido</span><h3>' + esc(U.longDate(sd)) + '</h3></div><div class="rowflex">' + slotPill(sp) + pill(sl) + '</div></div>';
  if (ST.isTrain(sp)) {
    h += '<p class="muted small">' + (sp.label ? '<b>' + esc(sp.label) + '</b> · ' : '') + 'Sesión de unos ' + U.fmtMin(ST.estMin(sp)) + ' con calentamiento y estiramiento.</p>';
    sp.ex.forEach(function (e) {
      h += '<div class="ex"><span class="ex-emoji" aria-hidden="true">' + D.emojiFor(e.name) + '</span><div class="ex-body"><div class="ex-name">' + esc(e.name) + '</div><div class="ex-meta">' + esc(ST.fmtEx(e)) + '</div></div></div>';
    });
  } else {
    h += '<p class="muted">😴 Día de descanso según tu rutina.</p>';
  }
  if (sl && sl.status === 'skip') h += '<p class="muted small">🎁 Este día es un descanso ganado con tus medallas. Para deshacerlo, abre 🏅 el mismo día en que lo canjeaste.</p>';
  else if (sd <= t) h += ctl(ui.sel, 'minSel', (sl && sl.minutes) || (ST.isTrain(sp) ? ST.estMin(sp) : 30), !!(sl && sl.status), ST.isTrain(sp));
  else h += '<p class="muted small">Podrás registrar este día cuando llegue.</p>';
  h += '</div>' + weekCard();
  $('#v-cal').innerHTML = h;
}
function weekCard() {
  var h = '<div class="card"><div><span class="label">🗓️ Mi semana</span><h3>Días y horario de entreno</h3>' +
    '<p class="muted small">Elige qué días entrenas y en qué momento del día. El cambio vale para todas las semanas.</p></div><div class="stack">';
  S().routine.days.forEach(function (day, di) {
    h += '<div class="wk-row"><span class="dname">' + K.DS[di] + '</span>' +
      '<button type="button" class="btn sm" data-act="daytrain" data-d="' + di + '" aria-pressed="' + (!day.rest) + '" aria-label="' + K.DAYS[di] + ': ' + (day.rest ? 'descanso' : 'entreno') + '">' + (day.rest ? '😴 Descanso' : '💪 Entreno') + '</button>' +
      '<select data-f="slot" data-d="' + di + '" aria-label="Horario del ' + K.DAYS[di].toLowerCase() + '"' + (day.rest ? ' disabled' : '') + '>';
    K.SLOTS.forEach(function (o) { h += '<option value="' + o[0] + '"' + (day.slot === o[0] ? ' selected' : '') + '>' + K.slotEmoji(o[0]) + ' ' + o[1] + '</option>'; });
    h += '</select></div>';
  });
  return h + '</div></div>';
}

PS.v = { today: today, pill: pill, ctl: ctl, em: em, renderHeader: renderHeader, renderHoy: renderHoy, renderCal: renderCal, updateProg: updateProg };
})();

(function () {
'use strict';
var K = PS.k, U = PS.u, D = PS.d, ST = PS.s, V = PS.v;
var esc = U.esc, $ = U.$;
function S() { return ST.get(); }

var DURS = [30, 45, 60, 75, 90];
function durCard() {
  var cur = S().duration, h = '<div class="card soft"><div><span class="label">⏱️ Duración del entrenamiento</span>' +
    '<p class="muted small" style="margin-top:4px">Elige cuánto tiempo tienes. Las series, los descansos y los minutos de cada ejercicio se ajustan solos, calentamiento y estiramiento incluidos.</p></div>' +
    '<div class="chips" role="group" aria-label="Duración de la sesión">' +
    '<button type="button" class="chip" data-act="dur" data-v="0" aria-pressed="' + (!cur) + '">Automático</button>';
  DURS.forEach(function (m) { h += '<button type="button" class="chip" data-act="dur" data-v="' + m + '" aria-pressed="' + (cur === m) + '">' + U.fmtMin(m) + '</button>'; });
  h += '</div><label class="field" style="max-width:240px"><span class="label">Otra duración (min)</span>' +
    '<input type="number" id="durIn" inputmode="numeric" min="15" max="180" placeholder="Ej.: 50" value="' + (cur && DURS.indexOf(cur) < 0 ? cur : '') + '" data-f="dur"></label></div>';
  return h;
}

/* ---------- Rutina: un día a la vez (cómodo en el celular) ---------- */
function editRow(e, di, ei, n) {
  var a = ' data-d="' + di + '" data-i="' + ei + '"';
  var third = e.type === 'time'
    ? '<label class="field"><span class="label">Minutos por serie</span><input type="number" inputmode="decimal" min="0.5" max="120" step="0.5" value="' + U.toMinInput(e.secs) + '" data-f="secs"' + a + '></label>'
    : '<label class="field"><span class="label">Repeticiones</span><input type="number" inputmode="numeric" min="1" max="100" value="' + e.reps + '" data-f="reps"' + a + '></label>';
  return '<div class="edit-ex" data-id="' + esc(e.id) + '">' +
    '<div class="field cb"><span class="label cb-lab">' + D.emojiFor(e.name) + ' Ejercicio</span>' +
    '<div class="cb-wrap"><input type="text" class="cb-in" role="combobox" aria-autocomplete="list" aria-expanded="false" aria-label="Nombre del ejercicio" autocomplete="off" autocapitalize="off" spellcheck="false" maxlength="80" placeholder="Escribe o elige un ejercicio" value="' + esc(e.name) + '" data-f="name" data-cb="1"' + a + '>' +
    '<button type="button" class="cb-btn" data-act="cbtoggle" aria-label="Ver la lista de ejercicios" tabindex="-1">▾</button></div>' +
    '<div class="cb-list" role="listbox" hidden></div></div>' +
    '<div class="edit-grid">' +
    '<label class="field"><span class="label">Medida</span><select data-f="type"' + a + '><option value="reps"' + (e.type === 'reps' ? ' selected' : '') + '>Repeticiones</option><option value="time"' + (e.type === 'time' ? ' selected' : '') + '>Tiempo</option></select></label>' +
    '<label class="field"><span class="label">Series</span><input type="number" inputmode="numeric" min="1" max="10" value="' + e.sets + '" data-f="sets"' + a + '></label>' +
    third +
    '<label class="field"><span class="label">Descanso (min)</span><input type="number" inputmode="decimal" min="0" max="10" step="0.5" value="' + U.toMinInput(e.rest) + '" data-f="rest"' + a + '></label>' +
    '</div><div class="tools">' +
    '<button type="button" class="btn sm" data-act="exup"' + a + (ei === 0 ? ' disabled' : '') + '>⬆ Subir</button>' +
    '<button type="button" class="btn sm" data-act="exdown"' + a + (ei === n - 1 ? ' disabled' : '') + '>⬇ Bajar</button>' +
    '<button type="button" class="btn sm warn" data-act="exdel"' + a + '>Quitar</button></div></div>';
}

/* ---------- Lista desplegable del nombre del ejercicio (combo) ---------- */
function cbOption(l, di, ei) {
  return '<button type="button" class="cb-opt" role="option" data-act="cbpick" data-n="' + esc(l.n) + '" data-d="' + di + '" data-i="' + ei + '">' +
    '<span class="cb-e" aria-hidden="true">' + l.e + '</span>' +
    '<span class="cb-t"><b>' + esc(l.n) + '</b><small>' + (l.m ? esc(l.m) : esc(D.GROUP_SHORT[l.g] || l.g)) + ' · ' + esc(D.libDose(l)) + '</small></span></button>';
}
/* Dibuja la lista según lo escrito. Con el nombre sin tocar muestra todo el catálogo por grupos. */
function cbRender(input) {
  var box = input.closest('.cb'), list = box && box.querySelector('.cb-list');
  if (!list) return;
  var di = input.getAttribute('data-d'), ei = input.getAttribute('data-i');
  var q = input.getAttribute('data-touched') === '1' ? input.value.trim() : '';
  var items = D.libSearch(q), h = '', exact = false;
  if (q) items.forEach(function (l) { if (U.plain(l.n) === U.plain(q)) exact = true; });
  if (!items.length) {
    h += '<p class="cb-empty muted small">No hay ejercicios con ese nombre en la lista.</p>';
  } else if (q) {
    items.forEach(function (l) { h += cbOption(l, di, ei); });
  } else {
    D.GROUPS.forEach(function (g) {
      var gi = items.filter(function (l) { return l.g === g; });
      if (!gi.length) return;
      h += '<div class="cb-grp label">' + D.GROUP_EMOJI[g] + ' ' + esc(g) + '</div>';
      gi.forEach(function (l) { h += cbOption(l, di, ei); });
    });
  }
  if (q && !exact) h += '<button type="button" class="cb-opt own" role="option" data-act="cbown" data-d="' + di + '" data-i="' + ei + '"><span class="cb-e" aria-hidden="true">➕</span><span class="cb-t"><b>Usar «' + esc(q.slice(0, 40)) + '»</b><small>Ejercicio propio</small></span></button>';
  list.innerHTML = h;
  list.hidden = false;
  input.setAttribute('aria-expanded', 'true');
}
function cbClose(root) {
  var lists = (root || document).querySelectorAll('.cb-list');
  for (var i = 0; i < lists.length; i++) {
    if (!lists[i].hidden) {
      lists[i].hidden = true; lists[i].innerHTML = '';
      var inp = lists[i].parentNode.querySelector('.cb-in');
      if (inp) inp.setAttribute('aria-expanded', 'false');
    }
  }
}
/* Mueve la opción resaltada con las flechas */
function cbMove(input, dir) {
  var list = input.closest('.cb').querySelector('.cb-list');
  if (!list || list.hidden) { cbRender(input); list = input.closest('.cb').querySelector('.cb-list'); }
  var opts = list.querySelectorAll('.cb-opt');
  if (!opts.length) return;
  var cur = -1, i;
  for (i = 0; i < opts.length; i++) { if (opts[i].classList.contains('act')) cur = i; }
  if (cur >= 0) opts[cur].classList.remove('act');
  cur = (cur + dir + opts.length) % opts.length;
  opts[cur].classList.add('act');
  if (opts[cur].scrollIntoView) opts[cur].scrollIntoView({ block: 'nearest' });
}
/* Deja la fila sin información mientras el nombre está vacío */
function cbBlankRow(input) {
  var row = input.closest('.edit-ex');
  if (!row) return;
  row.classList.add('is-blank');
  var f = row.querySelectorAll('.edit-grid input, .edit-grid select');
  for (var i = 0; i < f.length; i++) {
    if (f[i].tagName === 'INPUT') { f[i].value = ''; f[i].placeholder = '—'; }
    f[i].disabled = true;
  }
  var lab = row.querySelector('.cb-lab');
  if (lab) lab.textContent = '💪 Ejercicio';
}

function renderRut() {
  var ui = PS.ui, s = S(), days = s.routine.days;
  if (ui.rutDay < 0 || ui.rutDay > 6) ui.rutDay = U.wd(V.today());
  var di = ui.rutDay, day = days[di], lv = D.levelOf(s.level);
  var h = '<div class="card soft"><div class="card-head"><h2>' + D.T.rutEmoji + ' Mi rutina</h2><span class="pill">' + lv.e + ' ' + lv.name + '</span></div>' +
    '<p class="muted">Elige un día y cambia sus ejercicios, series, repeticiones y tiempos cuando quieras. Todo se guarda solo.</p>' + (D.T.rutHint ? '<p class="muted small">' + esc(D.T.rutHint) + '</p>' : '') +
    '<div class="dchips" role="group" aria-label="Día de la semana">';
  days.forEach(function (d, i) {
    var train = !d.rest;
    h += '<button type="button" class="dchip" data-act="rutday" data-d="' + i + '" aria-pressed="' + (i === di) + '" aria-label="' + K.DAYS[i] + (train ? ', entreno' : ', descanso') + '">' +
      '<span>' + K.DS[i] + '</span><i class="dot ' + (train ? 'plan' : 'none') + '"></i></button>';
  });
  h += '</div></div>' + durCard();
  h += '<div class="card"><div class="card-head"><h3>' + K.DAYS[di] + '</h3><button type="button" class="btn sm" data-act="daytrain" data-d="' + di + '" aria-pressed="' + (!day.rest) + '">' + (day.rest ? '😴 Descanso' : '💪 Entreno') + '</button></div>';
  if (day.rest) {
    h += '<p class="muted small">Este día es de descanso. Pulsa «Descanso» para convertirlo en día de entreno.</p>';
  } else {
    h += '<div class="edit-grid">' +
      '<label class="field"><span class="label">Nombre del día</span><input type="text" maxlength="40" placeholder="Ej.: Torso A" value="' + esc(day.label || '') + '" data-f="label" data-d="' + di + '"></label>' +
      '<label class="field"><span class="label">Horario</span><select data-f="slot" data-d="' + di + '">';
    K.SLOTS.forEach(function (o) { h += '<option value="' + o[0] + '"' + (day.slot === o[0] ? ' selected' : '') + '>' + K.slotEmoji(o[0]) + ' ' + o[1] + '</option>'; });
    h += '</select></label></div>';
    if (day.ex.length) {
      var est = ST.estMin(day);
      h += '<div class="rowflex"><span class="pill warm num">⏱️ ~' + est + ' min con calentamiento</span>';
      if (s.duration && Math.abs(est - s.duration) > 5) h += '<button type="button" class="btn sm" data-act="fitday" data-d="' + di + '">Ajustar a ' + s.duration + ' min</button>';
      h += '</div>';
    } else {
      h += '<p class="muted small">Aún no hay ejercicios en este día. Añade el primero.</p>';
    }
    day.ex.forEach(function (e, ei) { h += editRow(e, di, ei, day.ex.length); });
    h += '<button type="button" class="btn primary" data-act="openpick" data-d="' + di + '">➕ Añadir ejercicio</button>';
  }
  h += '</div>';
  $('#v-rut').innerHTML = h;
}

/* ---------- Selector de ejercicios: tarjetas con buscador y filtro por grupo ---------- */
function pickCard(l, taken) {
  var lv = l.lv > 1 ? '<span class="tag lv' + l.lv + '">' + D.LV_INFO[l.lv] + '</span>' : '';
  return '<button type="button" class="pk-card' + (taken ? ' taken' : '') + '" data-act="pickadd" data-n="' + esc(l.n) + '"' + (taken ? ' disabled' : '') + '>' +
    '<span class="pk-tile" aria-hidden="true">' + l.e + '</span>' +
    '<span class="pk-name">' + esc(l.n) + '</span>' +
    '<span class="pk-meta">' + (l.m ? '💥 ' + esc(l.m) : esc(D.GROUP_SHORT[l.g] || l.g) + ' · ' + (l.t === 'time' ? 'Por tiempo' : 'Repeticiones')) + '</span>' +
    '<span class="pk-foot"><span class="tag">' + esc(D.libDose(l)) + '</span>' + lv + '</span>' +
    (taken ? '<span class="pk-state">✓ Añadido</span>' : '<span class="pk-add" aria-hidden="true">+</span>') + '</button>';
}
function renderPickChips() {
  var box = $('#pickChips');
  if (!box) return;
  var cur = PS.ui.pickG || '', h = '<button type="button" class="chip" data-act="pickgrp" data-v="" aria-pressed="' + (!cur) + '">Todos</button>';
  D.GROUPS.forEach(function (g) {
    h += '<button type="button" class="chip" data-act="pickgrp" data-v="' + esc(g) + '" aria-pressed="' + (cur === g) + '">' + D.GROUP_EMOJI[g] + ' ' + esc(D.GROUP_SHORT[g] || g) + '</button>';
  });
  box.innerHTML = h;
}
function renderPickList() {
  var ui = PS.ui, day = S().routine.days[ui.pickDay], q = (ui.pickQ || '').trim(), box = $('#pickList');
  if (!day || !box) return;
  var names = {};
  day.ex.forEach(function (e) { names[e.name] = true; });
  var list = D.libSearch(q, ui.pickG || ''), h = '';
  h += '<button type="button" class="pick-own" data-act="pickown">➕ Crear ejercicio propio' + (q ? ': «' + esc(q.slice(0, 40)) + '»' : '') + '</button>';
  if (!list.length) {
    h += '<p class="muted small pk-empty">No hay ejercicios con esa búsqueda. Puedes crear uno propio con el botón de arriba.</p>';
  } else if (q || ui.pickG) {
    h += '<div class="pk-grid">';
    list.forEach(function (l) { h += pickCard(l, !!names[l.n]); });
    h += '</div>';
  } else {
    D.GROUPS.forEach(function (g) {
      var items = list.filter(function (l) { return l.g === g; });
      if (!items.length) return;
      h += '<div class="pick-group label">' + D.GROUP_EMOJI[g] + ' ' + esc(g) + '</div><div class="pk-grid">';
      items.forEach(function (l) { h += pickCard(l, !!names[l.n]); });
      h += '</div>';
    });
  }
  box.innerHTML = h;
  renderPickChips();
}
function openPicker(di) {
  var ui = PS.ui;
  ui.pickDay = di; ui.pickQ = ''; ui.pickG = '';
  var m = $('#picker');
  m.innerHTML = '<div class="sheet pick" role="dialog" aria-modal="true" aria-labelledby="pkTitle">' +
    '<div class="card-head"><h2 id="pkTitle">➕ Añadir ejercicio</h2><button type="button" class="btn primary sm" data-act="pickclose">Listo</button></div>' +
    '<input type="text" id="pickQ" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="🔍 Buscar: sentadilla, pecho, cardio…" aria-label="Buscar ejercicio">' +
    '<div class="pk-chips" id="pickChips" role="group" aria-label="Filtrar por grupo"></div>' +
    '<div class="pick-list" id="pickList"></div></div>';
  m.hidden = false;
  document.body.classList.add('noscroll');
  renderPickList();
}
function closePicker() {
  var m = $('#picker');
  m.hidden = true; m.innerHTML = '';
  document.body.classList.remove('noscroll');
}

V.cbRender = cbRender; V.cbClose = cbClose; V.cbMove = cbMove; V.cbBlankRow = cbBlankRow;
V.renderRut = renderRut; V.openPicker = openPicker; V.closePicker = closePicker; V.renderPickList = renderPickList;
})();

(function () {
'use strict';
var K = PS.k, U = PS.u, D = PS.d, ST = PS.s, V = PS.v;
var esc = U.esc, $ = U.$;
function S() { return ST.get(); }
function dm(k) { var d = U.parseKey(k); return d.getDate() + '/' + (d.getMonth() + 1); }

/* ---------- Metas ---------- */
function metasCard() {
  var s = S(), t = V.today(), f = PS.ui.goalForm;
  var h = '<div class="card"><div class="card-head"><h3>🎯 Mis metas</h3><button type="button" class="btn sm" data-act="goalnew">' + (f.open ? 'Cerrar' : '➕ Nueva meta') + '</button></div>';
  if (!s.goals.length && !f.open) h += '<p class="muted small">Aún no tienes metas. Crea una de peso, de repeticiones o de constancia y mira cómo avanzas.</p>';
  s.goals.forEach(function (g) {
    var inf = ST.goalInfo(g, t);
    h += '<div class="goal' + (inf.done ? ' done' : '') + '"><div class="goal-top"><b>' + esc(ST.goalTitle(g)) + '</b>' +
      '<button type="button" class="btn sm ghost" data-act="goaldel" data-v="' + esc(g.id) + '" aria-label="Quitar meta">✕</button></div>' +
      '<div class="bar-prog"><i style="width:' + inf.pct + '%"></i></div>' +
      '<div class="muted small">' + esc(inf.txt) + (inf.done ? ' · ✅ Cumplida' : ' · ' + inf.pct + '%') + '</div></div>';
  });
  if (f.open) {
    h += '<div class="goal-form"><span class="label">Tipo de meta</span><div class="chips" role="group" aria-label="Tipo de meta">' +
      [['weight', D.T.id === 'cali' ? '➕ Carga extra' : '🏋️ Peso'], ['reps', '🔁 Repeticiones'], ['streak', '📆 Constancia']].map(function (o) {
        return '<button type="button" class="chip" data-act="goaltype" data-v="' + o[0] + '" aria-pressed="' + (f.type === o[0]) + '">' + o[1] + '</button>';
      }).join('') + '</div>';
    if (f.type === 'streak') {
      h += '<div class="grid2"><label class="field"><span class="label">Días por semana</span><select id="gDays">';
      for (var i = 1; i <= 7; i++) h += '<option value="' + i + '"' + (i === 3 ? ' selected' : '') + '>' + i + (i === 1 ? ' día' : ' días') + '</option>';
      h += '</select></label><label class="field"><span class="label">Durante (semanas)</span><input type="number" id="gWeeks" inputmode="numeric" min="1" max="52" value="4"></label></div>';
    } else {
      h += '<label class="field"><span class="label">Ejercicio</span><select id="gEx">';
      ST.exNames().forEach(function (n) { h += '<option value="' + esc(n) + '">' + esc(n) + '</option>'; });
      h += '</select></label><label class="field"><span class="label">' + (f.type === 'weight' ? D.T.goalW : 'Repeticiones que quiero lograr') + '</span>' +
        '<input type="number" id="gTarget" inputmode="decimal" min="1" max="1000" placeholder="' + (f.type === 'weight' ? 'Ej.: 60' : 'Ej.: 10') + '"></label>';
    }
    if (PS.ui.goalErr) h += '<p class="err" role="alert">' + esc(PS.ui.goalErr) + '</p>';
    h += '<div class="rowflex"><button type="button" class="btn primary" data-act="goalsave">Guardar meta</button><button type="button" class="btn ghost" data-act="goalnew">Cancelar</button></div></div>';
  }
  return h + '</div>';
}

/* ---------- Peso levantado ---------- */
function liftCard() {
  var ui = PS.ui, names = ST.liftNames(), h = '<div class="card"><h3>🏋️ Peso levantado</h3>';
  if (!names.length) return h + '<p class="muted small">Cuando anotes el peso o las repeticiones de un ejercicio (📝 debajo de cada ejercicio en Inicio), aquí verás cómo avanzas.</p></div>';
  if (names.indexOf(ui.liftEx) < 0) ui.liftEx = names[0];
  h += '<label class="field"><span class="label">Ejercicio</span><select data-f="liftsel">';
  names.forEach(function (n) { h += '<option value="' + esc(n) + '"' + (n === ui.liftEx ? ' selected' : '') + '>' + esc(n) + '</option>'; });
  h += '</select></label>';
  var hist = ST.liftHistory(ui.liftEx), useW = hist.some(function (x) { return x.w > 0; }), f = useW ? 'w' : 'r';
  var last = hist.slice(-10), items = [], parts = [];
  last.forEach(function (x, i) { items.push({ label: dm(x.k), value: x[f], cur: i === last.length - 1 }); parts.push(dm(x.k) + ': ' + x[f]); });
  var rec = 0; hist.forEach(function (x) { if (x[f] > rec) rec = x[f]; });
  var first = hist[0][f], lastv = hist[hist.length - 1][f], diff = Math.round((lastv - first) * 10) / 10, unit = useW ? 'kg' : 'repeticiones';
  h += '<div class="tiles"><div class="tile"><span class="label">🏆 Récord</span><b>' + ST.fmtNum(rec) + '</b></div>' +
    '<div class="tile"><span class="label">Último</span><b>' + ST.fmtNum(lastv) + '</b></div>' +
    '<div class="tile"><span class="label">Cambio</span><b>' + (diff > 0 ? '+' : '') + ST.fmtNum(diff) + '</b></div></div>' +
    '<p class="muted small">' + (useW ? 'Peso en kg' : 'Repeticiones') + ' de tus últimos ' + last.length + ' registros.</p>' +
    V.barChart(items, 'Evolución de ' + ui.liftEx + ' en ' + unit + '. ' + parts.join('; '), unit);
  return h + '</div>';
}

/* ---------- Logros ---------- */
function logrosCard() {
  var s = S(), got = 0, h = '';
  ST.ACH.forEach(function (a) {
    var d = s.achv[a.id];
    if (d) got++;
    h += '<div class="badge' + (d ? ' on' : '') + '"><span class="badge-e" aria-hidden="true">' + (d ? a.e : '🔒') + '</span><b>' + esc(a.n) + '</b><small>' + (d ? 'Logrado el ' + dm(d) : esc(a.d)) + '</small></div>';
  });
  return '<div class="card"><div class="card-head"><h3>🏅 Mis logros</h3><span class="pill">' + got + ' / ' + ST.ACH.length + '</span></div><div class="badges">' + h + '</div></div>';
}
function proExtras() { return metasCard() + liftCard() + logrosCard(); }

/* ---------- Copia de seguridad ---------- */
function backupCard() {
  var ui = PS.ui, h = '<div class="card"><h3>💾 Copia de seguridad</h3>' +
    '<p class="muted small">Guarda todos tus datos en un archivo. Sirve para pasarlos a otro celular o por si borras los datos del navegador.</p>' +
    '<div class="rowflex"><button type="button" class="btn primary" data-act="bkexport">⬇️ Exportar mis datos</button><button type="button" class="btn" data-act="bkimport">⬆️ Importar copia</button></div>' +
    '<input type="file" id="impFile" accept=".json,application/json" hidden>';
  if (ui.impErr) h += '<p class="err" role="alert">' + esc(ui.impErr) + '</p>';
  if (ui.imp) {
    var d = ui.imp, ses = 0;
    Object.keys(d.logs).forEach(function (k) { if (d.logs[k].status === 'done') ses++; });
    h += '<div class="stack"><p>Archivo válido: <b>' + ses + (ses === 1 ? ' sesión' : ' sesiones') + '</b> registradas, nivel ' + esc(D.levelOf(d.level).name.toLowerCase()) + ', ' + d.goals.length + (d.goals.length === 1 ? ' meta' : ' metas') + ' y ' + d.medals.bal + ' medallas.</p>' +
      '<p class="muted small">Al importar se reemplazan los datos actuales de este dispositivo. Podrás deshacerlo justo después.</p>' +
      '<div class="rowflex"><button type="button" class="btn warn" data-act="bkconfirm">Reemplazar mis datos</button><button type="button" class="btn ghost" data-act="bkcancel">Cancelar</button></div></div>';
  }
  return h + '</div>';
}

/* ---------- Hoja de medallas y premios ---------- */
function prizeText(r) {
  var p = ST.prizeOf(r.prize), day = U.parseKey(r.tk), out = p.name, names = [];
  if (r.ids && r.ids.length) {
    var plan = ST.dayPlan(day);
    plan.ex.forEach(function (e) { if (r.ids.indexOf(e.id) >= 0) names.push(e.name); });
    if (names.length) out += ' (' + names.join(', ') + ')';
  }
  return out + ' · ' + K.DAYS[U.wd(day)];
}
function rwBody() {
  var s = S(), t = V.today(), M = s.medals, rw = PS.ui.rw, p, h = '';
  if (rw.v === 'target' || rw.v === 'confirm') {
    p = ST.prizeOf(rw.prize);
    var days = ST.redeemDays(t);
    if (rw.v === 'confirm') {
      var dayO = null; days.forEach(function (x) { if (x.k === rw.day) dayO = x; });
      var exn = dayO ? dayO.plan.ex.filter(function (e) { return rw.ids.indexOf(e.id) >= 0; }).map(function (e) { return e.name; }) : [];
      return '<h3>' + p.e + ' ' + esc(p.name) + '</h3><p>¿Canjear <b>' + p.cost + ' medallas</b> por este premio' + (dayO ? ' el <b>' + K.DAYS[U.wd(dayO.d)].toLowerCase() + '</b>' : '') + (exn.length ? ' (' + esc(exn.join(', ')) + ')' : '') + '?</p>' +
        '<p class="muted small">Solo sirve esta semana y no se devuelve si no lo usas. Si te equivocas, puedes deshacerlo hoy mismo.</p>' +
        '<div class="rowflex"><button type="button" class="btn primary" data-act="rwgo">Sí, canjear</button><button type="button" class="btn ghost" data-act="rwback">Atrás</button></div>';
    }
    h += '<h3>' + p.e + ' ' + esc(p.name) + '</h3><p class="muted small">' + esc(p.desc) + '</p>';
    if (!days.length) return h + '<p class="rw-note">No quedan días de entreno esta semana para aplicar el premio.</p><div><button type="button" class="btn" data-act="rwback">Volver</button></div>';
    h += '<span class="label">Elige el día</span><div class="chips" role="group" aria-label="Día">';
    days.forEach(function (x) { h += '<button type="button" class="chip" data-act="rwday" data-v="' + x.k + '" aria-pressed="' + (rw.day === x.k) + '">' + K.DS[U.wd(x.d)] + ' ' + x.d.getDate() + '</button>'; });
    h += '</div>';
    if (p.n && rw.day) {
      var dd = null; days.forEach(function (x) { if (x.k === rw.day) dd = x; });
      h += '<span class="label">Elige ' + p.n + (p.n === 1 ? ' ejercicio' : ' ejercicios') + '</span><div class="rw-ex">';
      dd.plan.ex.forEach(function (e) { h += '<button type="button" class="chip" data-act="rwex" data-v="' + esc(e.id) + '" aria-pressed="' + (rw.ids.indexOf(e.id) >= 0) + '">' + D.emojiFor(e.name) + ' ' + esc(e.name) + '</button>'; });
      h += '</div>';
    }
    var ok = rw.day && (!p.n || rw.ids.length === p.n);
    return h + '<div class="rowflex"><button type="button" class="btn primary" data-act="rwnext"' + (ok ? '' : ' disabled') + '>Continuar</button><button type="button" class="btn ghost" data-act="rwback">Atrás</button></div>';
  }
  var wr = ST.weekRedeem(t);
  h += '<div class="rw-sum"><div class="rw-big"><b class="num">' + M.bal + '</b><span>/ ' + ST.MAX + ' medallas</span></div><div class="bar-prog"><i style="width:' + Math.round(M.bal / ST.MAX * 100) + '%"></i></div>' +
    '<p class="muted small">Semana completa: +' + ST.AWARD + ' medallas. Cada día de entreno fallado: −1. La semana se cierra el lunes.</p></div>';
  h += wr ? '<p class="rw-note">✅ Esta semana ya usaste un premio: <b>' + esc(ST.prizeOf(wr.prize).name) + '</b>. El siguiente, desde el lunes.</p>' : '<p class="rw-note">Puedes canjear <b>1 premio</b> esta semana.</p>';
  ST.PRIZES.forEach(function (pz) {
    var why = ST.canRedeem(pz.id, t);
    h += '<div class="prize' + (why ? ' off' : '') + '"><span class="prize-e" aria-hidden="true">' + pz.e + '</span><div class="prize-t"><b>' + esc(pz.name) + '</b><small>' + pz.cost + ' medallas · ' + esc(pz.desc) + '</small></div>' +
      (why ? '<span class="pill">' + esc(why) + '</span>' : '<button type="button" class="btn primary sm" data-act="rwprize" data-v="' + pz.id + '">Canjear</button>') + '</div>';
  });
  var hist = M.redeems.slice(-8).reverse();
  if (hist.length) {
    h += '<h3>Historial de canjes</h3>';
    hist.forEach(function (r) {
      var canUndo = !r.undone && !r.used && r.date === U.dkey(t);
      h += '<div class="rw-h' + (r.undone ? ' undone' : '') + '"><span>' + dm(r.date) + ' · ' + esc(prizeText(r)) + (r.undone ? ' · deshecho' : r.used ? ' · usado' : '') + '</span>' +
        (canUndo ? '<button type="button" class="btn sm" data-act="rwundo" data-v="' + esc(r.id) + '">Deshacer</button>' : '') + '</div>';
    });
  }
  return h;
}
function renderRewards() { var b = $('#rwBody'); if (b) b.innerHTML = rwBody(); }
function openRewards() {
  PS.ui.rw = { v: 'list' };
  var m = $('#picker');
  m.innerHTML = '<div class="sheet pick" role="dialog" aria-modal="true" aria-labelledby="pkTitle"><div class="card-head"><h2 id="pkTitle">🏅 Medallas y premios</h2>' +
    '<button type="button" class="btn primary sm" data-act="rwclose">Cerrar</button></div><div class="pick-list rw-body" id="rwBody"></div></div>';
  m.hidden = false; document.body.classList.add('noscroll');
  renderRewards();
}

V.proExtras = proExtras; V.backupCard = backupCard; V.openRewards = openRewards; V.renderRewards = renderRewards;
})();

(function () {
'use strict';
var K = PS.k, U = PS.u, D = PS.d, ST = PS.s, V = PS.v;
var esc = U.esc, $ = U.$;
function S() { return ST.get(); }

/* ---------- Progreso ---------- */
function niceStep(max) {
  var steps = [10, 15, 20, 30, 60, 90, 120, 180, 240, 300, 600];
  for (var i = 0; i < steps.length; i++) { if (max / steps[i] <= 5) return steps[i]; }
  return 600;
}
function barChart(items, desc, unit) {
  var W = 640, H = 240, ml = 54, mr = 10, mt = 24, mb = 32;
  var iw = W - ml - mr, ih = H - mt - mb, max = 30;
  items.forEach(function (it) { if (it.value > max) max = it.value; });
  var step = niceStep(max), top = Math.ceil(max / step) * step;
  function y(v) { return mt + ih - (v / top) * ih; }
  var slot = iw / items.length, bw = Math.min(46, slot * 0.58);
  var s = '<svg class="chart" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="' + esc(desc) + '">';
  s += '<text x="' + ml + '" y="12">' + (unit || 'minutos (más de 60 en h:min)') + '</text>';
  for (var v = 0; v <= top; v += step) {
    s += '<line class="grid" x1="' + ml + '" x2="' + (W - mr) + '" y1="' + y(v) + '" y2="' + y(v) + '"/>' +
      '<text x="' + (ml - 6) + '" y="' + (y(v) + 4) + '" text-anchor="end">' + (v > 60 && !unit ? U.fmtMin(v) : v) + '</text>';
  }
  items.forEach(function (it, i) {
    var cx = ml + slot * i + slot / 2, x = cx - bw / 2;
    if (it.value > 0) {
      s += '<rect class="cbar' + (it.cur ? ' cur' : '') + '" x="' + x + '" y="' + y(it.value) + '" width="' + bw + '" height="' + (y(0) - y(it.value)) + '" rx="4" fill="currentColor"/>' +
        '<text class="val" x="' + cx + '" y="' + (y(it.value) - 6) + '" text-anchor="middle">' + (it.value > 60 && !unit ? U.fmtMin(it.value) : it.value) + '</text>';
    } else if (it.miss) {
      s += '<line class="x" x1="' + (cx - 7) + '" y1="' + (y(0) - 18) + '" x2="' + (cx + 7) + '" y2="' + (y(0) - 4) + '"/>' +
        '<line class="x" x1="' + (cx + 7) + '" y1="' + (y(0) - 18) + '" x2="' + (cx - 7) + '" y2="' + (y(0) - 4) + '"/>';
    }
    s += '<text x="' + cx + '" y="' + (H - 10) + '" text-anchor="middle">' + esc(it.label) + '</text>';
  });
  return s + '</svg>';
}
function renderPro() {
  var ui = PS.ui, t = V.today();
  if (!ui.week) ui.week = U.dkey(U.mondayOf(t));
  var mon = U.parseKey(ui.week), ws = ST.weekStats(mon, t), sun = U.addDays(mon, 6);
  var range = mon.getDate() + ' ' + K.MONTHS[mon.getMonth()].slice(0, 3) + ' – ' + sun.getDate() + ' ' + K.MONTHS[sun.getMonth()].slice(0, 3);
  var h = '<div class="card"><div class="card-head"><div><span class="label">📊 Semana</span><h2>' + esc(range) + '</h2></div>' +
    '<div class="rowflex"><button type="button" class="btn sm" data-act="wprev">Anterior</button><button type="button" class="btn sm" data-act="wnow">Esta semana</button><button type="button" class="btn sm" data-act="wnext">Siguiente</button></div></div>';
  h += '<div class="tiles">' +
    '<div class="tile"><span class="label">🏋️ Sesiones</span><b>' + ws.done + ' / ' + ws.planned + '</b></div>' +
    '<div class="tile"><span class="label">⏱️ Tiempo entrenado</span><b>' + esc(U.fmtMin(ws.minutes)) + '</b></div>' +
    '<div class="tile"><span class="label">🔥 Racha</span><b>' + ST.streak(t) + ' d</b></div>' +
    '<div class="tile"><span class="label">🎯 Cumplimiento 4 semanas</span><b>' + ST.adherence(t) + '%</b></div></div>';
  var items = [], parts = [];
  ws.days.forEach(function (d) {
    var miss = d.status === 'missed';
    items.push({ label: K.DS[U.wd(d.date)], value: d.minutes, miss: miss });
    parts.push(K.DS[U.wd(d.date)] + ': ' + (d.status === 'done' ? U.fmtMin(d.minutes) : miss ? 'no entrenado' : 'sin registro'));
  });
  h += '<h3>📈 Minutos por día</h3>' + barChart(items, 'Minutos entrenados por día. ' + parts.join('; ')) +
    '<div class="legend"><span><i class="dot done"></i>Minutos entrenados</span><span><i class="dot missed"></i>Día que no pudiste entrenar (marca ×)</span></div></div>';
  h += V.proExtras();

  var cur = U.mondayOf(t), wk = [], wparts = [];
  for (var i = 7; i >= 0; i--) {
    var m = U.addDays(cur, -7 * i), st = ST.weekStats(m, t);
    wk.push({ label: m.getDate() + '/' + (m.getMonth() + 1), value: st.minutes, cur: i === 0 });
    wparts.push('semana del ' + m.getDate() + '/' + (m.getMonth() + 1) + ': ' + U.fmtMin(st.minutes));
  }
  h += '<div class="card"><h3>🗓️ Tiempo total por semana</h3><p class="muted small">Últimas 8 semanas. La barra ámbar es la semana actual.</p>' +
    barChart(wk, 'Minutos totales por semana. ' + wparts.join('; ')) + '</div>';

  h += '<div class="card"><h3>📋 Detalle de la semana</h3><div class="table-scroll"><table><thead><tr><th>Día</th><th>Estado</th><th>Minutos</th></tr></thead><tbody>';
  ws.days.forEach(function (d) {
    var plan = ST.dayPlan(d.date), l = ST.getLog(U.dkey(d.date));
    var st = d.status === 'done' ? '<span class="pill done">✅ Entrenado</span>' : d.status === 'missed' ? '<span class="pill missed">❌ No entrenado</span>' : d.status === 'skip' ? '<span class="pill done">🎁 Descanso ganado</span>' : d.status === 'sick' ? '<span class="pill warm">🤒 Enfermo</span>' :
      (d.planned ? (d.future ? '<span class="pill">Por hacer</span>' : '<span class="pill warm">Sin registrar</span>') : '<span class="pill">😴 Descanso</span>');
    h += '<tr><td><b>' + K.DS[U.wd(d.date)] + ' ' + d.date.getDate() + '</b>' + (d.planned ? '<div class="muted small">' + esc(K.slotName(plan.slot)) + ' · ' + plan.ex.length + ' ejercicios</div>' : '') + '</td><td>' + st +
      '</td><td class="num">' + (l && l.status === 'done' ? U.fmtMin(l.minutes) : '—') + '</td></tr>';
  });
  h += '</tbody></table></div></div>';
  $('#v-pro').innerHTML = h;
}

/* ---------- Perfil y recomendación ---------- */
function readNum(v) { var n = parseFloat(String(v).replace(',', '.')); return isNaN(n) ? 0 : n; }
function validProfile(p) { return p.height >= 100 && p.height <= 230 && p.weight >= 30 && p.weight <= 250; }
function planPreview(s) {
  var plan = ST.makePlan(s.level, s.profile.build, s.duration), h = '<div class="plan-list">';
  plan.forEach(function (d, i) {
    if (!d.ex.length || d.rest) return;
    h += '<div class="plan-row"><span class="dname">' + K.DS[i] + '</span><span class="pr-t">' + esc(d.label || 'Entrenamiento') + '</span><span class="pill num">~' + ST.estMin(d) + ' min</span></div>';
  });
  return h + '</div>';
}
function recBlock(s) {
  var p = s.profile, r = D.REC[p.build] || D.REC.media, lv = D.levelOf(s.level), h = '<div class="stack">';
  if (validProfile(p)) {
    var b = D.bmi(p.height, p.weight), adv = D.bmiAdvice(b);
    h += '<div class="rowflex"><span class="pill warm">IMC ' + b.toFixed(1) + '</span><span class="muted small">' + esc(D.bmiRange(b)) + '</span></div>';
    h += '<h3>' + r.e + ' ' + esc(r.title) + '</h3><p>' + esc(r.text) + '</p>' + (adv ? '<p>' + esc(adv) + '</p>' : '');
  } else {
    h += '<p class="muted small">Completa altura y peso en Ajustes para ver recomendaciones según tu contextura.</p>';
  }
  if (D.T.id === 'cali') h += '<p><span class="pill warm">' + (s.place === 'parque' ? '🌳 Entrenas en el parque' : '🏠 Entrenas en casa') + '</span></p>';
  h += '<h3>' + lv.e + ' Nivel ' + esc(lv.name.toLowerCase()) + ' · ' + esc(lv.days) + '</h3>' + planPreview(s);
  if (s.duration) h += '<p class="muted small">⏱️ Ajustada a sesiones de unos ' + U.fmtMin(s.duration) + '.</p>';
  h += '<p class="muted small">El IMC es solo una guía y no mide el músculo. Si tienes alguna condición de salud o dolor, consulta a un profesional antes de empezar.</p></div>';
  return h;
}
function placeButtons(act, cur) {
  var h = '<div class="seg" role="group" aria-label="Lugar de entrenamiento">';
  [['casa', '🏠 En casa'], ['parque', '🌳 En el parque']].forEach(function (o) {
    h += '<button type="button" class="btn" data-act="' + act + '" data-v="' + o[0] + '" aria-pressed="' + (cur === o[0]) + '">' + o[1] + '</button>';
  });
  return h + '</div>';
}
function buildButtons(act, cur) {
  var h = '<div class="seg" role="group" aria-label="Contextura">';
  [['delgada', '🧱 Delgada'], ['media', '⚖️ Media'], ['robusta', '🫀 Robusta']].forEach(function (o) {
    h += '<button type="button" class="btn" data-act="' + act + '" data-v="' + o[0] + '" aria-pressed="' + (cur === o[0]) + '">' + o[1] + '</button>';
  });
  return h + '</div>';
}
function levelButtons(act, cur) {
  var h = '<div class="lvls" role="group" aria-label="Nivel">';
  D.LEVELS.forEach(function (l) {
    h += '<button type="button" class="lvl" data-act="' + act + '" data-v="' + l.id + '" aria-pressed="' + (cur === l.id) + '">' +
      '<span class="lvl-e" aria-hidden="true">' + l.e + '</span><span class="lvl-b"><b>' + l.name + '</b><small>' + esc(l.days) + '</small><span class="lvl-d">' + esc(l.desc) + '</span></span></button>';
  });
  return h + '</div>';
}
function durChips(act, cur) {
  var h = '<div class="chips" role="group" aria-label="Duración de la sesión"><button type="button" class="chip" data-act="' + act + '" data-v="0" aria-pressed="' + (!cur) + '">Automático</button>';
  [30, 45, 60, 75, 90].forEach(function (m) { h += '<button type="button" class="chip" data-act="' + act + '" data-v="' + m + '" aria-pressed="' + (cur === m) + '">' + U.fmtMin(m) + '</button>'; });
  return h + '</div>';
}
function themeButtons(cur) {
  var h = '<div class="seg" role="group" aria-label="Tema">';
  [['system', '🌗 Sistema'], ['light', '☀️ Claro'], ['dark', '🌙 Oscuro']].forEach(function (o) {
    h += '<button type="button" class="btn" data-act="themeset" data-v="' + o[0] + '" aria-pressed="' + (cur === o[0]) + '">' + o[1] + '</button>';
  });
  return h + '</div>';
}
function renderPer() {
  var s = S(), p = s.profile, ui = PS.ui;
  var h = '<div class="card"><h2>🎯 Mi propósito</h2><label class="field"><span class="label">¿Por qué quieres entrenar?</span>' +
    '<textarea id="purposeIn" maxlength="140" placeholder="' + esc(D.T.ph) + '">' + esc(s.purpose) + '</textarea></label>' +
    '<div><button type="button" class="btn primary" data-act="savepurpose">Guardar propósito</button></div></div>';
  h += '<div class="card"><h3>🎨 Apariencia</h3><p class="muted small">Elige claro, oscuro o que siga el modo de tu celular.</p>' + themeButtons(ST.getTheme()) + '<p class="muted small sec-hint"><span class="secdot" aria-hidden="true">' + (PS.s.getSection() === 'cali' ? '🏋️' : '🤸') + '</span> Para pasar a ' + (PS.s.getSection() === 'cali' ? 'Gimnasio' : 'Calistenia') + ' toca el botón redondo de arriba, junto al tema. Cada una guarda sus datos por separado.</p></div>';
  h += '<div class="card"><h2>📏 Mis datos</h2><div class="grid2">' +
    '<label class="field"><span class="label">Altura (cm)</span><input type="number" id="hIn" inputmode="decimal" min="100" max="230" value="' + esc(p.height) + '"></label>' +
    '<label class="field"><span class="label">Peso (kg)</span><input type="number" id="wIn" inputmode="decimal" min="30" max="250" step="0.1" value="' + esc(p.weight) + '"></label></div>' +
    '<div class="stack"><span class="label">Contextura</span><span class="muted small">Al tocarla, tu rutina se ajusta al instante.</span>' + buildButtons('build', p.build) + '</div>' +
    (ui.perErr ? '<p class="err" role="alert">' + esc(ui.perErr) + '</p>' : '') +
    '<div><button type="button" class="btn primary" data-act="calc">Guardar mis datos</button></div></div>';
  if (D.T.id === 'cali') h += '<div class="card"><h2>📍 ¿Dónde entrenas?</h2><p class="muted small">Tus entrenamientos se adaptan al lugar. En casa no necesitas barra ni parque; en el parque usamos barras y bancos. Puedes deshacerlo.</p>' + placeButtons('place', s.place) + '</div>';
  h += '<div class="card"><h2>🎚️ Mi nivel</h2><p class="muted small">Toca un nivel y tu rutina cambia al instante. Si no te gusta, puedes deshacerlo.</p>' + levelButtons('level', s.level) + PS.v.levelTestBtn() + '</div>';
  h += '<div class="card soft"><span class="label">✨ Tu rutina según tus datos</span>' + recBlock(s) + '<div class="rowflex">' +
    (ui.confirmApply
      ? '<button type="button" class="btn warn" data-act="apply">Confirmar: restablecer mi rutina</button><button type="button" class="btn ghost" data-act="applycancel">Cancelar</button>'
      : '<button type="button" class="btn primary" data-act="apply">Restablecer rutina del nivel</button>') + '</div></div>';
  h += V.backupCard();
  if (PS.install && PS.install.can) {
    h += '<div class="card soft"><h3>📲 Instalar en tu celular</h3><p class="muted small">Añade Primer Set a tu pantalla de inicio y ábrela como una app, también sin internet.</p>' +
      '<div><button type="button" class="btn primary" data-act="install">Instalar app</button></div></div>';
  }
  h += '<div class="card"><h3>💾 Mis datos guardados</h3><p class="muted small">Tu avance se guarda en este navegador y, si has iniciado sesión, también en tu cuenta.</p><div class="rowflex">' +
    (ui.confirmReset
      ? '<button type="button" class="btn warn" data-act="reset">Confirmar: borrar todo</button><button type="button" class="btn ghost" data-act="resetcancel">Cancelar</button>'
      : '<button type="button" class="btn" data-act="reset">Borrar todos mis datos</button>') + '</div></div>';
  h += V.legalCard();
  $('#v-per').innerHTML = h;
}

/* ---------- Ventana de bienvenida: propósito, nivel y tiempo, datos, rutina ---------- */
function renderModal() {
  var ui = PS.ui, s = S(), p = s.profile, m = $('#modal'), dots = '<div class="steps" aria-hidden="true">';
  for (var i = 1; i <= 4; i++) dots += '<i' + (ui.step >= i ? ' class="on"' : '') + '></i>';
  dots += '</div>';
  var err = ui.mErr ? '<p class="err" role="alert">' + esc(ui.mErr) + '</p>' : '';
  var h = '<div class="sheet" role="dialog" aria-modal="true" aria-labelledby="mTitle">' + dots;
  if (ui.step === 1) {
    h += '<div class="stack"><span class="label">Paso 1 de 4</span><h2 id="mTitle">👋 Bienvenido a Primer Set</h2>' +
      '<p class="muted">' + esc(D.T.welcome) + '</p></div>' +
      '<label class="field"><span class="label">🎯 Mi propósito</span><textarea id="mPurpose" maxlength="140" placeholder="' + esc(D.T.ph) + '">' + esc(s.purpose) + '</textarea></label>' + err +
      '<button type="button" class="btn primary" data-act="m1">Continuar</button>';
  } else if (ui.step === 2) {
    h += '<div class="stack"><span class="label">Paso 2 de 4</span><h2 id="mTitle">🎚️ Tu nivel y tu tiempo</h2><p class="muted">Cada nivel trae entrenamientos distintos. Elige el que más se parezca a ti.</p></div>' +
      levelButtons('mlevel', s.level) + PS.v.levelTestBtn() +
      '<div class="stack"><span class="label">⏱️ ¿Cuánto tiempo tienes por sesión?</span>' + durChips('mdur', s.duration) + '</div>' + err +
      '<div class="rowflex"><button type="button" class="btn primary" data-act="m1b">Continuar</button><button type="button" class="btn ghost" data-act="mback">Atrás</button></div>';
  } else if (ui.step === 3) {
    h += '<div class="stack"><span class="label">Paso 3 de 4</span><h2 id="mTitle">📏 Cuéntanos de ti</h2><p class="muted">Con tu altura, peso y contextura afinamos la recomendación.</p></div>' +
      '<div class="grid2"><label class="field"><span class="label">Altura (cm)</span><input type="number" id="mH" inputmode="decimal" min="100" max="230" value="' + esc(p.height) + '"></label>' +
      '<label class="field"><span class="label">Peso (kg)</span><input type="number" id="mW" inputmode="decimal" min="30" max="250" step="0.1" value="' + esc(p.weight) + '"></label></div>' +
      (D.T.id === 'cali' ? '<div class="stack"><span class="label">📍 ¿Dónde vas a entrenar?</span><span class="muted small">Tus entrenamientos serán de acuerdo a esta opción.</span>' + placeButtons('mplace', s.place) + '</div>' : '') +
      '<div class="stack"><span class="label">Contextura</span>' + buildButtons('mbuild', p.build) + '</div>' + err +
      '<div class="rowflex"><button type="button" class="btn primary" data-act="m2">Ver mi rutina</button><button type="button" class="btn ghost" data-act="mskip">Omitir por ahora</button><button type="button" class="btn ghost" data-act="mback">Atrás</button></div>';
  } else {
    h += '<div class="stack"><span class="label">Paso 4 de 4</span><h2 id="mTitle">🚀 Tu punto de partida</h2></div>' + recBlock(s) +
      '<div class="rowflex"><button type="button" class="btn primary" data-act="mapply">Empezar con esta rutina</button><button type="button" class="btn ghost" data-act="mback">Atrás</button></div>';
  }
  m.innerHTML = h + '</div>';
  m.hidden = false;
  var f = m.querySelector('textarea,input');
  if (f && ui.step === 1) { try { f.focus({ preventScroll: true }); } catch (e) { /* ignorar */ } }
}
function closeModal() { var m = $('#modal'); m.hidden = true; m.innerHTML = ''; }

V.barChart = barChart; V.renderPro = renderPro; V.renderPer = renderPer;
V.renderModal = renderModal; V.closeModal = closeModal;
V.validProfile = validProfile; V.readNum = readNum;
})();

(function () {
'use strict';
var U = PS.u, V = PS.v, $ = U.$, esc = U.esc;

/* =====================================================================
   Términos y condiciones + Política de seguridad y privacidad.
   Se muestran una vez antes de entrar a la app y se pueden releer en Ajustes.
   ===================================================================== */
var LEGAL_V = 1, LEGAL_DATE = '30 de octubre de 2026', LKEY = 'primerset.legal';
var mem = null;

var DOCS = {
  tos: { e: '📜', name: 'Términos y condiciones', body: [
    ['1. Qué es Primer Set', 'Primer Set es una aplicación gratuita para organizar y registrar tus rutinas de entrenamiento, con dos bloques: Gimnasio y Calistenia. Es una herramienta de apoyo personal; no es un servicio médico, de fisioterapia ni de entrenamiento personalizado.'],
    ['2. Tu salud es lo primero', 'Las rutinas, los niveles, las progresiones, el IMC y las recomendaciones son orientativos y no sustituyen el consejo de un profesional de la salud. Antes de empezar, y sobre todo si tienes una condición médica, una lesión, dolor, estás embarazada o llevas tiempo sin entrenar, consulta a un médico. Detente si sientes dolor, mareo, falta de aire o malestar.'],
    ['3. Riesgos del ejercicio', 'Entrenar implica riesgo de lesión. Haces los ejercicios bajo tu propia responsabilidad y a tu propio ritmo. En el bloque de Calistenia, revisa que las barras, bancos, mesas, sillas y el suelo del parque o de tu casa sean estables y seguros antes de usarlos.'],
    ['4. Uso permitido', 'Puedes usar la app de forma personal. No la uses para fines ilegales ni intentes alterar su funcionamiento.'],
    ['5. Sin garantías', 'La app se ofrece «tal cual», sin garantía de resultados físicos ni de funcionamiento continuo o libre de errores. Tus datos viven en tu dispositivo: si borras los datos del navegador o cambias de celular sin hacer una copia de seguridad, podrías perderlos.'],
    ['6. Límite de responsabilidad', 'En la medida que permita la ley, quien creó la app no es responsable por lesiones, pérdidas de datos o daños derivados del uso de la app o de seguir sus recomendaciones.'],
    ['7. Cambios', 'Estos términos pueden actualizarse. Si cambian de forma importante, la app te pedirá aceptarlos otra vez.']
  ] },
  priv: { e: '🔒', name: 'Política de seguridad y privacidad', body: [
    ['1. Qué datos guardamos', 'Lo que tú escribes: propósito, altura, peso, contextura, lugar de entrenamiento, rutina, registros de días, pesos y repeticiones, metas, medallas y logros. Gimnasio y Calistenia guardan sus datos por separado.'],
    ['2. Dónde se guardan', 'Solo en tu dispositivo, en el almacenamiento del navegador. La app no tiene cuentas, anuncios, analíticas ni rastreadores, y no vende ni comparte tus datos.'],
    ['3. Copia en la nube', 'Si abres la app dentro de Claude, tus datos también se guardan en tu cuenta de Claude para que no se pierdan. Fuera de Claude (GitHub Pages, app instalada o extensión) no se envía ningún dato de entrenamiento a ningún servidor.'],
    ['4. Servicios externos', 'Al abrir la app con internet se cargan las fuentes de letra de Google Fonts. Google puede ver datos técnicos de la conexión, como tu dirección IP, pero no recibe tus datos de entrenamiento. Sin internet, la app usa las fuentes del sistema.'],
    ['5. Datos de salud', 'Tu peso y tu altura son datos personales. Se usan solo dentro de la app para calcular el IMC y ajustar la rutina, y nunca salen de tu dispositivo (salvo la copia en la nube de Claude descrita arriba).'],
    ['6. Cómo cuidar tus datos', 'Usa el bloqueo de pantalla de tu celular: quien tenga acceso a tu teléfono desbloqueado puede ver la app. Los archivos de copia de seguridad contienen todos tus datos, guárdalos en un lugar seguro.'],
    ['7. Tu control', 'Puedes exportar tus datos, importarlos o borrarlos cuando quieras desde Ajustes → «Borrar todos mis datos». También se borran al limpiar los datos del navegador.'],
    ['8. Menores de edad', 'La app está pensada para personas mayores de edad. Si eres menor, úsala con la guía de un adulto.'],
    ['9. Cambios', 'Esta política puede actualizarse. Si cambia de forma importante, la app te lo mostrará antes de continuar.']
  ] }
};

function stored() {
  try { var r = JSON.parse(localStorage.getItem(LKEY) || 'null'); if (r && +r.v >= LEGAL_V) return r; } catch (e) { /* ignorar */ }
  return mem && mem.v >= LEGAL_V ? mem : null;
}
function needed() { return !stored(); }
function accept() {
  var r = { v: LEGAL_V, at: U.dkey(new Date()) };
  mem = r;
  try { localStorage.setItem(LKEY, JSON.stringify(r)); } catch (e) { /* ignorar */ }
}

var st = { open: false, doc: 'tos', gate: false, done: null, chk: false };
function bodyHtml(d) {
  var h = '';
  DOCS[d].body.forEach(function (p) { h += '<h4>' + esc(p[0]) + '</h4><p>' + esc(p[1]) + '</p>'; });
  return h;
}
function render() {
  var m = $('#legal');
  if (!m) return;
  if (!st.open) { m.hidden = true; m.innerHTML = ''; document.body.classList.remove('noscroll', 'gated'); return; }
  var d = DOCS[st.doc], h = '<div class="sheet legal" role="dialog" aria-modal="true" aria-labelledby="lgTitle">';
  if (st.gate) h += '<div class="stack"><span class="label">Antes de empezar</span><h2 id="lgTitle">👋 Bienvenido a Primer Set</h2><p class="muted">Lee con calma los términos y la política de seguridad. Para entrar necesitas aceptarlos.</p></div>';
  else h += '<div class="card-head"><h2 id="lgTitle">' + d.e + ' ' + esc(d.name) + '</h2></div>';
  h += '<div class="seg" role="tablist" aria-label="Documento">';
  ['tos', 'priv'].forEach(function (k) {
    h += '<button type="button" class="btn" role="tab" data-act="legaltab" data-v="' + k + '" aria-pressed="' + (st.doc === k) + '">' + DOCS[k].e + ' ' + (k === 'tos' ? 'Términos' : 'Seguridad') + '</button>';
  });
  h += '</div><div class="legal-body" tabindex="0"><h3>' + d.e + ' ' + esc(d.name) + '</h3><p class="muted small">Versión ' + LEGAL_V + ' · ' + LEGAL_DATE + '</p>' + bodyHtml(st.doc) + '</div>';
  if (st.gate) {
    h += '<label class="chk legal-chk"><input type="checkbox" id="legalChk"' + (st.chk ? ' checked' : '') + '><span class="box"></span><span>He leído y acepto los términos y condiciones y la política de seguridad y privacidad.</span></label>' +
      '<button type="button" class="btn primary" data-act="legalaccept"' + (st.chk ? '' : ' disabled') + '>Aceptar y continuar</button>';
  } else {
    h += '<button type="button" class="btn primary" data-act="legalclose">Cerrar</button>';
  }
  m.innerHTML = h + '</div>';
  m.hidden = false;
  document.body.classList.add('noscroll');
  document.body.classList.toggle('gated', st.gate);
}
function show(gate, done, doc) { st = { open: true, doc: doc || 'tos', gate: !!gate, done: done || null, chk: false }; render(); var b = $('#legal .legal-body'); if (b) { try { b.focus({ preventScroll: true }); } catch (e) { /* ignorar */ } } }
function close() { st.open = false; render(); }

function card() {
  var s = stored(), when = s && s.at ? 'Aceptados el ' + U.longDate(U.parseKey(s.at)).toLowerCase() + '.' : 'Aceptados.';
  return '<div class="card"><h3>🔒 Seguridad y términos</h3><p class="muted small">Cómo cuidamos tus datos y las reglas de uso de la app. ' + esc(when) + '</p>' +
    '<div class="rowflex"><button type="button" class="btn" data-act="legalopen" data-v="priv">🔒 Política de seguridad</button><button type="button" class="btn" data-act="legalopen" data-v="tos">📜 Términos y condiciones</button></div></div>';
}

document.addEventListener('click', function (ev) {
  var el = ev.target && ev.target.closest ? ev.target.closest('[data-act]') : null;
  if (!el) return;
  var a = el.getAttribute('data-act'), v = el.getAttribute('data-v');
  if (a === 'legalopen') { show(false, null, v); return; }
  if (a === 'legalclose') { close(); return; }
  if (a === 'legaltab') { st.doc = v; render(); var b = $('#legal .legal-body'); if (b) b.scrollTop = 0; return; }
  if (a === 'legalaccept') {
    if (!st.chk) return;
    accept(); var cb = st.done; close(); if (cb) cb(); if ($('#v-per') && PS.ui.tab === 'per') V.renderPer(); return;
  }
}, true);
document.addEventListener('change', function (ev) {
  if (ev.target && ev.target.id === 'legalChk') {
    st.chk = !!ev.target.checked;
    var b = $('#legal [data-act=legalaccept]'); if (b) b.disabled = !st.chk;
  }
});
document.addEventListener('keydown', function (ev) { if (ev.key === 'Escape' && st.open && !st.gate) close(); });

V.legalReset = function () { mem = null; try { localStorage.removeItem(LKEY); } catch (e) { /* ignorar */ } };
V.legalNeeded = needed; V.showLegal = show; V.legalCard = card;
})();

(function () {
'use strict';
var U = PS.u, D = PS.d, ST = PS.s, V = PS.v;
var esc = U.esc;

/* Tarjeta de sugerencias en Inicio (solo aparece cuando hay algo que sugerir) */
function sugCard(today) {
  var list = ST.suggest(today);
  if (!list.length) return '';
  var h = '<div class="card sug"><span class="label">💡 Sugerencia para hoy</span>';
  list.forEach(function (s) {
    h += '<div class="sug-item"><span class="ex-emoji" aria-hidden="true">' + (s.kind === 'weight' ? '⬆️' : s.kind === 'deload' ? '🌿' : D.emojiFor(s.to)) + '</span><div class="sug-body"><b>' + esc(s.name) + '</b><p class="muted small">' + esc(s.text) + '</p>' +
      '<div class="rowflex">' + (s.kind === 'chain' ? '<button type="button" class="btn primary sm" data-act="sugapply" data-v="' + esc(s.key) + '">Cambiar a «' + esc(s.to) + '»</button>' : s.kind === 'deload' ? '<button type="button" class="btn primary sm" data-act="sugapply" data-v="' + esc(s.key) + '">Hacer descarga</button>' : '') +
      '<button type="button" class="btn ghost sm" data-act="sugno" data-v="' + esc(s.key) + '">' + (s.kind === 'chain' || s.kind === 'deload' ? 'Ahora no' : 'Entendido') + '</button></div></div></div>';
  });
  return h + '</div>';
}
document.addEventListener('click', function (ev) {
  var el = ev.target && ev.target.closest ? ev.target.closest('[data-act]') : null;
  if (!el) return;
  var a = el.getAttribute('data-act'), v = el.getAttribute('data-v');
  if (a !== 'sugapply' && a !== 'sugno') return;
  var t = V.today();
  if (a === 'sugno') { ST.dismissSug(v, t); PS.app.renderAll(); return; }
  if (v.indexOf('dl|') === 0) { ST.deloadDone(t); PS.app.renderAll(); PS.app.toast('🌿 Semana de descarga: ve más suave esta semana'); return; }
  var s = ST.applyChain(v, t);
  PS.app.renderAll();
  if (s) PS.app.toast('⬆️ Ahora haces «' + s.to + '»');
});
V.sugCard = sugCard;
})();

(function () {
'use strict';
var U = PS.u, D = PS.d, ST = PS.s;
var $ = U.$, esc = U.esc;

/* =====================================================================
   Prueba de nivel (Bloque B): flexiones, sentadillas, plancha y, si hay
   barra, dominadas. Sugiere principiante, intermedio o avanzado.
   ===================================================================== */
var st = { open: false, res: null, err: '', v: { push: '', squat: '', plank: '', pull: '' } };

function pts(v, cuts) { var p = 0; cuts.forEach(function (c) { if (v >= c) p++; }); return p; }
function evaluate(v) {
  var parts = [
    { id: 'push', n: 'Flexiones', p: pts(v.push, [5, 10, 20]) },
    { id: 'squat', n: 'Sentadillas', p: pts(v.squat, [15, 30, 50]) },
    { id: 'plank', n: 'Plancha', p: pts(v.plank, [20, 45, 90]) }
  ];
  if (v.pull !== null) parts.push({ id: 'pull', n: 'Dominadas', p: pts(v.pull, [1, 5, 10]) });
  var sum = 0, weak = parts[0];
  parts.forEach(function (x) { sum += x.p; if (x.p < weak.p) weak = x; });
  var avg = sum / parts.length;
  var lv = avg < 1.25 ? 'principiante' : avg < 2.25 ? 'intermedio' : 'avanzado';
  /* Un solo punto débil baja el nivel un escalón si es muy bajo (cuida la técnica y las articulaciones) */
  if (lv === 'avanzado' && weak.p === 0) lv = 'intermedio';
  return { level: lv, parts: parts, weak: weak, avg: avg };
}
function readInt(id, max) {
  var el = $('#' + id);
  if (!el) return null;
  var t = String(el.value).trim();
  if (t === '') return null;
  var n = parseInt(t, 10);
  if (isNaN(n) || n < 0) return NaN;
  return Math.min(max, n);
}

function render() {
  var m = $('#ltest');
  if (!m) return;
  if (!st.open) { m.hidden = true; m.innerHTML = ''; return; }
  var h = '<div class="sheet" role="dialog" aria-modal="true" aria-labelledby="ltTitle">';
  if (!st.res) {
    h += '<div class="stack"><span class="label">Bloque de Calistenia</span><h2 id="ltTitle">🧪 Prueba de nivel</h2>' +
      '<p class="muted">Calienta un par de minutos y haz cada ejercicio <b>con buena técnica y sin forzar</b>. Anota cuántas repeticiones seguidas logras. Si algo duele, detente: puedes escribir 0.</p></div>' +
      '<label class="field"><span class="label">🙌 Flexiones seguidas (en el suelo)</span><input type="number" id="ltPush" inputmode="numeric" min="0" max="200" placeholder="Ej.: 8" value="' + esc(st.v.push) + '"></label>' +
      '<label class="field"><span class="label">🦵 Sentadillas seguidas (peso corporal)</span><input type="number" id="ltSquat" inputmode="numeric" min="0" max="300" placeholder="Ej.: 25" value="' + esc(st.v.squat) + '"></label>' +
      '<label class="field"><span class="label">🧘 Plancha: segundos que aguantas</span><input type="number" id="ltPlank" inputmode="numeric" min="0" max="900" placeholder="Ej.: 40" value="' + esc(st.v.plank) + '"></label>' +
      '<label class="field"><span class="label">🧗 Dominadas seguidas (opcional, si tienes barra)</span><input type="number" id="ltPull" inputmode="numeric" min="0" max="100" placeholder="Déjalo vacío si no tienes barra" value="' + esc(st.v.pull) + '"></label>' +
      (st.err ? '<p class="err" role="alert">' + esc(st.err) + '</p>' : '') +
      '<div class="rowflex"><button type="button" class="btn primary" data-act="ltgo">Ver mi nivel</button><button type="button" class="btn ghost" data-act="ltclose">Cancelar</button></div>';
  } else {
    var r = st.res, lv = D.levelOf(r.level);
    h += '<div class="stack"><span class="label">Resultado</span><h2 id="ltTitle">' + lv.e + ' Nivel ' + esc(lv.name.toLowerCase()) + '</h2><p class="muted">' + esc(lv.desc) + '</p></div><div class="lt-bars">';
    r.parts.forEach(function (x) {
      h += '<div class="lt-row"><span>' + esc(x.n) + '</span><span class="lt-dots" aria-label="' + x.p + ' de 3">' + [1, 2, 3].map(function (i) { return '<i class="' + (i <= x.p ? 'on' : '') + '"></i>'; }).join('') + '</span></div>';
    });
    h += '</div>';
    if (r.weak.p === 0 && r.parts.length > 1) h += '<p class="muted small">Tu punto más flojo es <b>' + esc(r.weak.n.toLowerCase()) + '</b>. Es normal: empieza con la versión fácil y avanza con calma.</p>';
    h += '<p class="muted small">La prueba es solo una guía. Siempre puedes cambiar de nivel en Ajustes.</p>' +
      '<div class="rowflex"><button type="button" class="btn primary" data-act="ltuse" data-v="' + r.level + '">Usar este nivel</button><button type="button" class="btn ghost" data-act="ltagain">Repetir</button><button type="button" class="btn ghost" data-act="ltclose">Cerrar</button></div>';
  }
  m.innerHTML = h + '</div>';
  m.hidden = false;
}
function fire(act, v) {
  var b = document.createElement('button');
  b.hidden = true; b.setAttribute('data-act', act); b.setAttribute('data-v', v);
  document.body.appendChild(b); b.click(); b.remove();
}
function btn() {
  return D.T.id === 'cali' ? '<div><button type="button" class="btn" data-act="ltopen">🧪 No sé mi nivel: hacer la prueba</button></div>' : '';
}
document.addEventListener('click', function (ev) {
  var el = ev.target && ev.target.closest ? ev.target.closest('[data-act]') : null;
  if (!el) return;
  var a = el.getAttribute('data-act'), v = el.getAttribute('data-v');
  if (a.indexOf('lt') !== 0) return;
  if (a === 'ltopen') { st = { open: true, res: null, err: '', v: { push: '', squat: '', plank: '', pull: '' } }; render(); return; }
  if (a === 'ltclose') { st.open = false; render(); return; }
  if (a === 'ltagain') { st.res = null; st.err = ''; render(); return; }
  if (a === 'ltgo') {
    var vals = { push: readInt('ltPush', 200), squat: readInt('ltSquat', 300), plank: readInt('ltPlank', 900), pull: readInt('ltPull', 100) };
    st.v = { push: vals.push === null ? '' : String(vals.push), squat: vals.squat === null ? '' : String(vals.squat), plank: vals.plank === null ? '' : String(vals.plank), pull: vals.pull === null ? '' : String(vals.pull) };
    var bad = false;
    ['push', 'squat', 'plank'].forEach(function (k) { if (vals[k] === null || isNaN(vals[k])) bad = true; });
    if (bad || (vals.pull !== null && isNaN(vals.pull))) { st.err = 'Escribe un número (0 o más) en flexiones, sentadillas y plancha.'; render(); return; }
    st.err = ''; st.res = evaluate(vals); render(); return;
  }
  if (a === 'ltuse') {
    st.open = false; render();
    var wizard = $('#modal') && !$('#modal').hidden;
    if (ST.get().level === v) { PS.app.toast('Ya estás en ese nivel'); return; }
    fire(wizard ? 'mlevel' : 'level', v);
  }
});
document.addEventListener('keydown', function (ev) { if (ev.key === 'Escape' && st.open) { st.open = false; render(); } });
PS.v.levelTestBtn = btn;
})();

(function () {
'use strict';
var U = PS.u, D = PS.d, ST = PS.s, V = PS.v;
var $ = U.$, ui = PS.ui;
function S() { return ST.get(); }
function save() { ST.save(); }

/* ---------- Aviso ---------- */
var toastT = null;
function toast(msg, act, ms) {
  var t = $('#toast');
  t.textContent = msg;
  if (act) {
    var b = document.createElement('button');
    b.type = 'button'; b.className = 'toast-act'; b.setAttribute('data-act', act[0]); b.textContent = act[1];
    t.appendChild(b);
  }
  t.classList.toggle('has-act', !!act);
  t.hidden = false;
  t.classList.remove('show'); void t.offsetWidth; t.classList.add('show');
  clearTimeout(toastT);
  toastT = setTimeout(function () { t.hidden = true; }, ms || (act ? 7000 : 2600));
}

/* ---------- Dibujar solo la pestaña visible (más rápido) ---------- */
var VIEWS = ['hoy', 'cal', 'rut', 'pro', 'per'];
var VIEW_INFO = { hoy: ['🏠', 'Inicio'], cal: ['📅', 'Calendario'], rut: ['🏋️', 'Rutina'], pro: ['📊', 'Progreso'], per: ['⚙️', 'Ajustes'] };
function renderView(v) {
  if (v === 'hoy') V.renderHoy();
  else if (v === 'cal') V.renderCal();
  else if (v === 'rut') V.renderRut();
  else if (v === 'pro') V.renderPro();
  else V.renderPer();
}
function renderAll() {
  V.renderHeader(); renderView(ui.tab); updateIsland();
  if (ui.pending) { var pm = ui.pending; ui.pending = ''; setTimeout(function () { toast(pm); }, 350); }
}

/* ---------- Isla dinámica ---------- */
function updateIsland() {
  var isl = $('#island'), info = VIEW_INFO[ui.tab];
  if (!isl) return;
  $('#islIc').textContent = info[0]; $('#islLb').textContent = info[1];
  isl.setAttribute('data-open', ui.islandOpen ? 'true' : 'false');
  $('#islCur').setAttribute('aria-expanded', ui.islandOpen ? 'true' : 'false');
  var items = document.querySelectorAll('.itm');
  for (var i = 0; i < items.length; i++) {
    if (items[i].getAttribute('data-v') === ui.tab) items[i].setAttribute('aria-current', 'page');
    else items[i].removeAttribute('aria-current');
    items[i].tabIndex = ui.islandOpen ? 0 : -1;
  }
}
function setIsland(open) { ui.islandOpen = !!open; updateIsland(); }

var tabY = {};
function switchTab(v) {
  var prev = ui.tab, dir = VIEWS.indexOf(v) >= VIEWS.indexOf(prev) ? 'r' : 'l';
  if (v === prev) { /* tocar la pestaña actual: sube suavemente */
    ui.islandOpen = false; updateIsland();
    try { window.scrollTo({ top: 0, behavior: 'smooth' }); } catch (e) { window.scrollTo(0, 0); }
    return;
  }
  tabY[prev] = window.pageYOffset || 0;
  ui.tab = v; ui.confirmApply = false; ui.confirmReset = false; ui.islandOpen = false;
  VIEWS.forEach(function (id) { $('#v-' + id).classList.toggle('on', id === v); });
  renderAll();
  var el = $('#v-' + v);
  el.classList.remove('enter', 'dir-r', 'dir-l'); void el.offsetWidth; el.classList.add('enter', 'dir-' + dir);
  setTimeout(function () { el.classList.remove('enter', 'dir-r', 'dir-l'); }, 1100);
  window.scrollTo(0, Math.min(tabY[v] || 0, 400));
}

/* ---------- Cronómetro: cuenta hacia arriba o regresiva ---------- */
function newT() { return { mode: 'up', base: 0, start: 0, run: false, target: 0, label: '⏱️ Cronómetro' }; }
var TS = { gym: newT(), cali: newT() }, T = TS[ST.getSection()];
var lastShown = -1;
function elapsed() { return T.base + (T.run ? Date.now() - T.start : 0); }
function finished() { return T.mode === 'down' && elapsed() >= T.target; }
function secsShown() {
  return T.mode === 'down' ? Math.max(0, Math.ceil((T.target - elapsed()) / 1000)) : Math.floor(elapsed() / 1000);
}
function timerShow() {
  var s = secsShown(), txt = U.fmtClock(s);
  var c = $('#clock'), l = $('#clockLabel'), g = $('#tgo'), u = $('#tuse'), d = $('#liveDot');
  if (c) c.textContent = txt;
  if (l) l.textContent = T.label;
  if (g) {
    g.textContent = T.run ? '⏸ Pausar' : (elapsed() > 0 && !finished() ? '▶ Seguir' : '▶ Iniciar');
    g.classList.toggle('running', T.run);
  }
  if (u) u.hidden = !(T.mode === 'up' && elapsed() >= 60000);
  if (d) d.hidden = !T.run;
  var chip = $('#islTime'), isl = $('#island'), has = T.run || elapsed() > 0;
  if (chip) { chip.hidden = !has; chip.textContent = txt; }
  if (isl) { isl.setAttribute('data-chip', has ? 'true' : 'false'); isl.setAttribute('data-live', T.run ? 'true' : 'false'); }
  lastShown = s;
}
PS.timerSync = timerShow;
function beep() {
  try {
    var AC = window.AudioContext || window.webkitAudioContext;
    if (AC) {
      var ac = new AC(), o = ac.createOscillator(), g = ac.createGain();
      o.connect(g); g.connect(ac.destination);
      o.frequency.value = 880; g.gain.value = 0.15;
      o.start(); o.stop(ac.currentTime + 0.45);
      o.onended = function () { try { ac.close(); } catch (e) { /* ignorar */ } };
    }
  } catch (e) { /* sin sonido */ }
  try { if (navigator.vibrate) navigator.vibrate([200, 100, 200]); } catch (e) { /* sin vibración */ }
}
setInterval(function () {
  if (!T.run) return;
  if (finished()) { T.run = false; T.base = T.target; beep(); toast('⏰ Tiempo cumplido'); timerShow(); return; }
  if (secsShown() !== lastShown) timerShow();
}, 250);
document.addEventListener('visibilitychange', function () { if (document.visibilityState === 'visible') timerShow(); });
function timerGo() {
  if (T.run) { T.base = elapsed(); T.run = false; }
  else {
    if (finished()) T.base = 0;
    T.start = Date.now(); T.run = true;
  }
  timerShow();
}
function timerReset() { T.mode = 'up'; T.base = 0; T.run = false; T.target = 0; T.label = '⏱️ Cronómetro'; timerShow(); }
function countdown(secs, name) {
  T.mode = 'down'; T.target = secs * 1000; T.base = 0; T.start = Date.now(); T.run = true; T.label = '⏱️ ' + name;
  timerShow();
}

/* ---------- Cambio de sección: guarda, carga la otra y redibuja sin recargar ---------- */
function paintSection() {
  VIEW_INFO.rut[0] = D.T.rutEmoji;
  var r = document.querySelector('.itm[data-v="rut"] .e'); if (r) r.textContent = D.T.rutEmoji;
  var root = document.documentElement;
  root.classList.add('sec-swap'); setTimeout(function () { root.classList.remove('sec-swap'); }, 600);
}
function switchSection(sec) {
  if (sec === ST.getSection()) return;
  setIsland(false);
  T = TS[sec]; timerShow();
  $('#toast').hidden = true;
  if (!ST.setSection(sec)) return;
  ui.resetSection();
  VIEWS.forEach(function (id) { $('#v-' + id).classList.toggle('on', id === 'hoy'); });
  paintSection();
  V.closePicker && V.closePicker();
  renderAll(); timerShow();
  window.scrollTo(0, 0);
  if (!S().purpose) { ui.step = 1; V.renderModal(); } else V.closeModal();
  toast(D.T.emoji + ' Sección ' + D.T.name);
}

/* ---------- Registro de días ---------- */
function setStatus(k, status, min) {
  var l = ST.ensureLog(k);
  l.status = status; l.minutes = status === 'done' ? min : 0;
  if (status === 'done') ui.bump = true;
  save(); renderAll();
  toast(status === 'done' ? '✅ Entrenamiento registrado' : 'Día registrado como no entrenado');
}
function clearStatus(k) {
  var l = ST.getLog(k);
  if (!l) return;
  l.status = ''; l.minutes = 0;
  if (!l.checks.length && !Object.keys(l.lifts || {}).length) delete S().logs[k];
  save(); renderAll(); toast('Registro borrado');
}

/* ---------- Ajustes ---------- */
function syncPer(hId, wId) {
  var p = S().profile, h = $('#' + hId), w = $('#' + wId);
  if (h) p.height = V.readNum(h.value) || '';
  if (w) p.weight = V.readNum(w.value) || '';
}
function applyPlan() {
  var s = S(), old = s.routine.days, plan = ST.makePlan(s.level, s.profile.build, s.duration);
  plan.forEach(function (d, i) { if (old[i] && old[i].slot) d.slot = old[i].slot; });
  s.routine.days = plan;
  save();
}
var PROFILE_ERR = 'Revisa los datos: la altura va entre 100 y 230 cm y el peso entre 30 y 250 kg.';

/* ---------- Rutina ---------- */
function dayOf(el) { return S().routine.days[+el.getAttribute('data-d')]; }
function moveEx(el, delta) {
  var day = dayOf(el), i = +el.getAttribute('data-i'), j = i + delta;
  if (!day || j < 0 || j >= day.ex.length) return;
  var t = day.ex[i]; day.ex[i] = day.ex[j]; day.ex[j] = t;
  save(); V.renderRut();
}
function cloneEx(list) {
  return list.map(function (e) { var c = {}; for (var k in e) c[k] = e[k]; c.id = U.uid(); return c; });
}
/* Convierte un día en entreno o descanso. Al activar un día vacío, copia los ejercicios de otro día de entreno. */
function setDayTrain(di, on) {
  var s = S(), days = s.routine.days, day = days[di];
  if (!day) return;
  if (!on) { day.rest = true; return; }
  day.rest = false;
  if (!day.ex.length) {
    var src = null, i;
    for (i = 1; i <= 7 && !src; i++) { var c = days[(di - i + 7) % 7]; if (c !== day && !c.rest && c.ex.length) src = c; }
    if (!src) {
      var tpl = D.buildPlan(s.level, s.profile.build);
      for (i = 0; i < 7 && !src; i++) { if (!tpl[i].rest && tpl[i].ex.length) src = tpl[i]; }
    }
    if (src) { day.ex = cloneEx(src.ex); if (!day.label) day.label = src.label || ''; }
  }
}
function addToDay(di, ex) {
  var day = S().routine.days[di];
  if (!day) return;
  day.rest = false; day.ex.push(ex);
  save(); V.renderRut(); V.renderPickList(); V.renderHeader();
}
/* Duración objetivo: ajusta todos los días y avisa */
function setDuration(n, silent) {
  var s = S();
  s.duration = n;
  if (n) ST.fitAll(s.routine.days, n);
  save();
  if (!silent) { renderView(ui.tab); toast(n ? '⏱️ Ejercicios ajustados a unos ' + n + ' min' : 'Duración automática'); }
}

/* ---------- Clics ---------- */
document.addEventListener('click', function (ev) {
  var tg = ev.target;
  if (ui.islandOpen && tg && tg.closest && !tg.closest('#island')) setIsland(false);
  var el = tg && tg.closest ? tg.closest('[data-act]') : null;
  if (!el) return;
  var a = el.getAttribute('data-act'), k = el.getAttribute('data-k'), v = el.getAttribute('data-v');
  if (a === 'chk') return;
  var s = S(), d, day, lib, n;

  if (a === 'islandtoggle') { setIsland(!ui.islandOpen); return; }
  if (a === 'tab') { switchTab(v); return; }
  if (a === 'secset') { switchSection(v); return; }

  /* Tema */
  if (a === 'themecycle') {
    var order = ['system', 'light', 'dark'], nx = order[(order.indexOf(ST.getTheme()) + 1) % 3];
    ST.setTheme(nx); V.renderHeader();
    if (ui.tab === 'per') V.renderPer();
    toast(nx === 'system' ? '🌗 Tema del sistema' : nx === 'light' ? '☀️ Tema claro' : '🌙 Tema oscuro');
    return;
  }
  if (a === 'themeset') { ST.setTheme(v); V.renderHeader(); V.renderPer(); return; }

  /* Registro */
  if (a === 'done') {
    var inp = document.getElementById(el.getAttribute('data-in'));
    n = U.num(inp ? inp.value : '', 0, 600, 0);
    if (n < 1) { toast('Escribe cuántos minutos entrenaste'); return; }
    setStatus(k, 'done', n); return;
  }
  if (a === 'missed') { setStatus(k, 'missed', 0); return; }
  if (a === 'clear') { clearStatus(k); return; }

  /* Cronómetro */
  if (a === 'tgo') { timerGo(); return; }
  if (a === 'treset') { timerReset(); return; }
  if (a === 'timer') { countdown(U.num(el.getAttribute('data-s'), 1, 7200, 60), el.getAttribute('data-n')); return; }
  if (a === 'trest') { countdown(U.num(el.getAttribute('data-s'), 1, 600, 60), 'Descanso'); return; }
  if (a === 'tuse') {
    var mi = $('#minToday');
    if (mi) { mi.value = Math.max(1, Math.round(elapsed() / 60000)); toast('Minutos listos para registrar'); }
    return;
  }

  /* Calendario */
  if (a === 'calprev' || a === 'calnext') {
    d = U.parseKey(ui.month);
    ui.month = U.dkey(new Date(d.getFullYear(), d.getMonth() + (a === 'calnext' ? 1 : -1), 1));
    V.renderCal(); return;
  }
  if (a === 'calnow') {
    d = V.today(); ui.month = U.dkey(new Date(d.getFullYear(), d.getMonth(), 1)); ui.sel = U.dkey(d);
    V.renderCal(); return;
  }
  if (a === 'seldate') { ui.sel = k; V.renderCal(); return; }

  /* Rutina y semana */
  if (a === 'daytrain') {
    day = dayOf(el);
    if (day) { setDayTrain(+el.getAttribute('data-d'), day.rest); save(); renderAll(); }
    return;
  }
  if (a === 'rutday') { ui.rutDay = +el.getAttribute('data-d'); V.renderRut(); return; }
  if (a === 'dur') { setDuration(U.num(v, 0, 180, 0)); return; }
  if (a === 'fitday') {
    day = dayOf(el);
    if (day && s.duration) { ST.fitDay(day, s.duration); save(); V.renderRut(); toast('⏱️ Día ajustado a ' + U.fmtMin(s.duration)); }
    return;
  }
  if (a === 'openpick') { V.openPicker(+el.getAttribute('data-d')); return; }
  if (a === 'pickclose') { V.closePicker(); renderAll(); return; }
  if (a === 'pickadd') {
    lib = D.libFind(el.getAttribute('data-n'));
    if (lib) { addToDay(ui.pickDay, D.fromLib(lib)); toast('Añadido: ' + lib.n); }
    return;
  }
  if (a === 'pickown') {
    var q = ($('#pickQ') ? $('#pickQ').value : '').trim().slice(0, 80);
    addToDay(ui.pickDay, D.mk(q || 'Nuevo ejercicio', 3, 10, 60));
    toast('Ejercicio propio añadido. Edita sus datos en la lista.'); return;
  }
  if (a === 'cbtoggle') {
    var cbi = el.closest('.cb').querySelector('.cb-in'), open = !el.closest('.cb').querySelector('.cb-list').hidden;
    if (open) { V.cbClose(); } else { cbi.focus(); V.cbRender(cbi); }
    return;
  }
  if (a === 'cbpick' || a === 'cbown') {
    day = dayOf(el); var ce = day && day.ex[+el.getAttribute('data-i')];
    if (!ce) return;
    if (a === 'cbpick') {
      lib = D.libFind(el.getAttribute('data-n'));
      if (!lib) return;
      el.closest('.cb').querySelector('.cb-in').value = lib.n;
      var rep = D.fromLib(lib); rep.id = ce.id;
      day.ex[+el.getAttribute('data-i')] = rep;
      delete ui.cbBlank[ce.id]; save(); V.renderRut(); V.renderHeader(); toast(lib.e + ' ' + lib.n); return;
    }
    var typed = el.closest('.cb').querySelector('.cb-in').value.trim().slice(0, 80);
    if (!typed) return;
    if (ui.cbBlank[ce.id]) { ce.type = 'reps'; ce.sets = 3; ce.reps = 10; ce.secs = 0; ce.rest = 60; }
    ce.name = typed; delete ui.cbBlank[ce.id]; save(); V.renderRut(); return;
  }
  if (a === 'pickgrp') { ui.pickG = v || ''; V.renderPickList(); return; }
  if (a === 'exup') { moveEx(el, -1); return; }
  if (a === 'exdown') { moveEx(el, 1); return; }
  if (a === 'exdel') {
    day = dayOf(el);
    if (day) { day.ex.splice(+el.getAttribute('data-i'), 1); save(); V.renderRut(); }
    return;
  }

  /* Progreso */
  if (a === 'wprev' || a === 'wnext') {
    ui.week = U.dkey(U.addDays(U.parseKey(ui.week), a === 'wnext' ? 7 : -7)); V.renderPro(); return;
  }
  if (a === 'wnow') { ui.week = U.dkey(U.mondayOf(V.today())); V.renderPro(); return; }

  /* Perfil */
  if (a === 'savepurpose') {
    var pi = $('#purposeIn'), txt = pi ? pi.value.trim().slice(0, 140) : '';
    if (!txt) { toast('Escribe tu propósito'); return; }
    s.purpose = txt; save(); V.renderHeader(); toast('🎯 Propósito guardado'); return;
  }
  if (a === 'build' || a === 'level' || a === 'place') {
    syncPer('hIn', 'wIn');
    var curV = a === 'build' ? s.profile.build : a === 'place' ? s.place : s.level;
    if (v === curV) return;
    ui.perErr = ''; ui.confirmApply = false;
    ui.undo = { level: s.level, build: s.profile.build, place: s.place, days: JSON.parse(JSON.stringify(s.routine.days)) };
    if (a === 'build') s.profile.build = v; else if (a === 'place') { s.place = v; ST.syncCtx(); } else s.level = v;
    applyPlan(); renderAll();
    var lvN = D.levelOf(s.level);
    toast(a === 'place' ? (v === 'parque' ? '🌳 Parque' : '🏠 Casa') + ': tu rutina se adaptó' : a === 'level' ? lvN.e + ' Nivel ' + lvN.name.toLowerCase() + ': tu rutina cambió' : '✅ Contextura ' + v + ': tu rutina se ajustó', ['undo', 'Deshacer']);
    return;
  }
  if (a === 'undo') {
    var u = ui.undo;
    if (!u) return;
    s.level = u.level; s.profile.build = u.build; if (u.place) { s.place = u.place; ST.syncCtx(); } s.routine.days = u.days; ui.undo = null;
    save(); $('#toast').hidden = true; renderAll(); toast('↩️ Rutina anterior recuperada'); return;
  }
  if (a === 'calc') {
    syncPer('hIn', 'wIn');
    ui.perErr = V.validProfile(s.profile) ? '' : PROFILE_ERR;
    ui.confirmApply = false; save(); V.renderPer(); return;
  }
  if (a === 'apply') {
    if (!ui.confirmApply) { ui.confirmApply = true; V.renderPer(); return; }
    ui.confirmApply = false; applyPlan(); renderAll(); toast('✨ Tu rutina fue actualizada'); return;
  }
  if (a === 'applycancel') { ui.confirmApply = false; V.renderPer(); return; }
  if (a === 'reset') {
    if (!ui.confirmReset) { ui.confirmReset = true; V.renderPer(); return; }
    ui.confirmReset = false; ui.step = 1; ui.mErr = ''; ST.reset(); V.legalReset(); renderAll(); V.showLegal(true, function () { V.renderModal(); }); return;
  }
  if (a === 'resetcancel') { ui.confirmReset = false; V.renderPer(); return; }
  if (a === 'install') { if (PS.install && PS.install.prompt) PS.install.prompt(); return; }

  /* Bienvenida */
  if (a === 'm1') {
    var mp = $('#mPurpose'), t1 = mp ? mp.value.trim().slice(0, 140) : '';
    if (!t1) { ui.mErr = 'Escribe una frase corta para continuar.'; V.renderModal(); return; }
    s.purpose = t1; ui.mErr = ''; ui.step = 2; save(); V.renderHeader(); V.renderModal(); return;
  }
  if (a === 'mlevel') { s.level = v; save(); V.renderHeader(); V.renderModal(); return; }
  if (a === 'mdur') { s.duration = U.num(v, 0, 180, 0); save(); V.renderModal(); return; }
  if (a === 'm1b') { ui.mErr = ''; ui.step = 3; V.renderModal(); return; }
  if (a === 'mback') { ui.mErr = ''; ui.step = Math.max(1, ui.step - 1); V.renderModal(); return; }
  if (a === 'mplace') { syncPer('mH', 'mW'); s.place = v; ST.syncCtx(); ui.mErr = ''; save(); V.renderModal(); return; }
  if (a === 'mbuild') { syncPer('mH', 'mW'); s.profile.build = v; ui.mErr = ''; save(); V.renderModal(); return; }
  if (a === 'm2') {
    syncPer('mH', 'mW');
    if (!V.validProfile(s.profile)) { ui.mErr = PROFILE_ERR; V.renderModal(); return; }
    ui.mErr = ''; ui.step = 4; save(); V.renderModal(); return;
  }
  if (a === 'mskip') { ui.mErr = ''; ui.step = 4; V.renderModal(); return; }
  if (a === 'mapply') { applyPlan(); V.closeModal(); renderAll(); toast('🚀 Rutina lista. ¡A entrenar!'); return; }
});

/* ---------- Cambios en campos ---------- */
var LIMITS = { sets: [1, 10], reps: [1, 100] };
function readMin(v) { var n = parseFloat(String(v).replace(',', '.')); return isNaN(n) ? null : n; }
document.addEventListener('change', function (ev) {
  var t = ev.target;
  if (!t || !t.getAttribute || !t.isConnected) return;

  if (t.getAttribute('data-act') === 'chk') {
    var l = ST.ensureLog(t.getAttribute('data-k')), id = t.getAttribute('data-id'), ix = l.checks.indexOf(id);
    if (t.checked && ix < 0) l.checks.push(id);
    if (!t.checked && ix >= 0) l.checks.splice(ix, 1);
    save(); V.updateProg(); return;
  }

  var f = t.getAttribute('data-f');
  if (!f) return;

  if (f === 'dur') {
    var m = readMin(t.value);
    if (m === null) { t.value = S().duration && [30, 45, 60, 75, 90].indexOf(S().duration) < 0 ? S().duration : ''; return; }
    setDuration(Math.max(15, Math.min(180, Math.round(m))));
    return;
  }

  var day = S().routine.days[+t.getAttribute('data-d')];
  if (!day) return;

  if (f === 'slot') {
    day.slot = (t.value === 'manana' || t.value === 'noche') ? t.value : 'tarde';
    save(); renderAll(); return;
  }
  if (f === 'label') { day.label = t.value.trim().slice(0, 40); save(); return; }

  var e = day.ex[+t.getAttribute('data-i')];
  if (!e) return;
  if (f === 'name') {
    var nm = t.value.trim().slice(0, 80), wasBlank = !!ui.cbBlank[e.id];
    delete ui.cbBlank[e.id];
    if (!nm) { V.renderRut(); if (wasBlank) toast('Se mantuvo «' + e.name + '»'); return; }
    var hit = null;
    D.LIB.forEach(function (l) { if (U.plain(l.n) === U.plain(nm)) hit = l; });
    if (hit && hit.n !== e.name) {
      var rp = D.fromLib(hit); rp.id = e.id; day.ex[+t.getAttribute('data-i')] = rp;
    } else if (wasBlank && nm !== e.name) {
      e.type = 'reps'; e.sets = 3; e.reps = 10; e.secs = 0; e.rest = 60; e.name = nm;
    } else { e.name = nm; }
    save(); V.renderRut(); return;
  } else if (f === 'type') {
    e.type = t.value === 'time' ? 'time' : 'reps';
    if (e.type === 'time' && !e.secs) e.secs = 30;
    if (e.type === 'reps' && !e.reps) e.reps = 10;
    save(); V.renderRut(); return;
  } else if (f === 'secs' || f === 'rest') {
    var mn = readMin(t.value), lo = f === 'secs' ? 0.5 : 0, hi = f === 'secs' ? 120 : 10;
    if (mn === null) { t.value = U.toMinInput(e[f]); return; }
    mn = Math.max(lo, Math.min(hi, mn));
    e[f] = Math.round(mn * 60);
    t.value = U.toMinInput(e[f]);
  } else if (LIMITS[f]) {
    e[f] = U.num(t.value, LIMITS[f][0], LIMITS[f][1], e[f]); t.value = e[f];
  }
  save();
});

/* Buscador del selector y lista desplegable del nombre */
document.addEventListener('input', function (ev) {
  var t = ev.target;
  if (!t) return;
  if (t.id === 'pickQ') { ui.pickQ = t.value; V.renderPickList(); return; }
  if (t.getAttribute && t.getAttribute('data-cb')) {
    var day = S().routine.days[+t.getAttribute('data-d')], e = day && day.ex[+t.getAttribute('data-i')];
    t.setAttribute('data-touched', '1');
    if (e && !t.value.trim() && !ui.cbBlank[e.id]) { ui.cbBlank[e.id] = true; V.cbBlankRow(t); }
    V.cbRender(t);
  }
});
document.addEventListener('focusin', function (ev) {
  var t = ev.target;
  if (t && t.getAttribute && t.getAttribute('data-cb')) { V.cbRender(t); var l = t.closest('.cb').querySelector('.cb-list'); if (l && l.scrollIntoView) l.scrollIntoView({ block: 'nearest' }); }
});
document.addEventListener('focusout', function (ev) {
  var t = ev.target;
  if (t && t.getAttribute && t.getAttribute('data-cb')) setTimeout(function () { if (!t.closest('.cb').contains(document.activeElement)) V.cbClose(); }, 0);
});
/* Evita que tocar una opción quite el foco del campo antes de elegirla */
document.addEventListener('mousedown', function (ev) {
  var t = ev.target;
  if (t && t.closest && (t.closest('.cb-list') || t.closest('.cb-btn'))) ev.preventDefault();
});
document.addEventListener('keydown', function (ev) {
  var t = ev.target;
  if (t && t.getAttribute && t.getAttribute('data-cb')) {
    if (ev.key === 'ArrowDown') { ev.preventDefault(); V.cbMove(t, 1); return; }
    if (ev.key === 'ArrowUp') { ev.preventDefault(); V.cbMove(t, -1); return; }
    if (ev.key === 'Enter') {
      var act = t.closest('.cb').querySelector('.cb-opt.act');
      ev.preventDefault();
      if (act) act.click(); else t.blur();
      return;
    }
    if (ev.key === 'Escape') { V.cbClose(); return; }
  }
  if (ev.key !== 'Escape') return;
  if (!$('#picker').hidden) { V.closePicker(); renderAll(); }
  else if (ui.islandOpen) setIsland(false);
});
$('#picker').addEventListener('click', function (ev) {
  if (ev.target === ev.currentTarget) { V.closePicker(); renderAll(); }
});

/* ---------- Inicio ---------- */
function init() {
  ST.hooks.onRemote = function () {
    if (S().purpose && !$('#modal').hidden) V.closeModal();
    renderAll();
  };
  paintSection();
  renderAll();
  timerShow();
  var firstRun = function () { if (!S().purpose) { ui.step = 1; V.renderModal(); } };
  if (V.legalNeeded()) V.showLegal(true, firstRun); else firstRun();
  ST.initRemote();
  var lastDay = U.dkey(V.today());
  setInterval(function () {
    var nd = U.dkey(V.today());
    if (nd !== lastDay) { lastDay = nd; renderAll(); }
  }, 60000);
}
PS.app = { toast: toast, renderAll: renderAll, renderView: renderView, save: save, countdown: countdown, beep: beep, setStatus: setStatus };
init();
})();

(function () {
'use strict';
var U = PS.u, D = PS.d, ST = PS.s, V = PS.v;
var $ = U.$, ui = PS.ui, A = PS.app;
function S() { return ST.get(); }

/* Revisa metas y logros nuevos después de guardar algo */
/* Celebración corta de récord personal (solo transform/opacity; sin movimiento si el usuario lo reduce) */
function celebrate(n, w, r) {
  var txt = '🏆 ¡Récord en ' + n + '!' + (w ? ' ' + ST.fmtNum(w) + ' kg' : '') + (r ? (w ? ' × ' : ' ') + r + ' rep.' : '');
  A.toast(txt);
  try { if (navigator.vibrate) navigator.vibrate([60, 40, 90]); } catch (e) {}
  try { if (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) return; } catch (e) {}
  var old = document.getElementById('prfx'); if (old) old.remove();
  var box = document.createElement('div'); box.id = 'prfx'; box.setAttribute('aria-hidden', 'true');
  var em = ['🏆', '⭐', '✨', '🔥', '💪', '🎉'], h = '<span class="pr-big">🏆</span>', i, a, d;
  for (i = 0; i < 14; i++) {
    a = (i / 14) * Math.PI * 2; d = 90 + (i % 3) * 30;
    h += '<span class="pr-p" style="--x:' + Math.round(Math.cos(a) * d) + 'px;--y:' + Math.round(Math.sin(a) * d) + 'px;animation-delay:' + (i % 4) * 30 + 'ms">' + em[i % em.length] + '</span>';
  }
  box.innerHTML = h; document.body.appendChild(box);
  setTimeout(function () { if (box.parentNode) box.remove(); }, 1600);
}
function after() {
  var t = V.today(), gl = ST.checkGoals(t), al = ST.checkAch(t);
  if (!gl.length && !al.length) return;
  ST.save();
  A.toast(gl.length ? '🎉 Meta cumplida: ' + ST.goalTitle(gl[0]) : '🏅 Logro: ' + al[0].n);
  if (ui.tab === 'pro') V.renderPro();
}
function rwRender() { V.renderRewards(); }

document.addEventListener('click', function (ev) {
  var tg = ev.target, el = tg && tg.closest ? tg.closest('[data-act]') : null;
  if (!el) return;
  var a = el.getAttribute('data-act'), v = el.getAttribute('data-v'), k = el.getAttribute('data-k'), t = V.today(), s = S(), rw = ui.rw;

  if (a === 'done') { after(); return; }

  /* ---- Enfermedad ---- */
  if (a === 'sick') {
    var mon = U.dkey(U.mondayOf(U.parseKey(k)));
    if (ST.sickCount(mon, k) >= ST.SICK_MAX) { A.toast('Máximo ' + ST.SICK_MAX + ' días de enfermedad por semana'); return; }
    var l = ST.ensureLog(k); l.status = 'sick'; l.minutes = 0;
    A.save(); A.renderAll(); A.toast('🤒 Descansa y recupérate. No resta medallas ni rompe tu racha.'); return;
  }

  /* ---- Medallas y premios ---- */
  if (a === 'rwopen') { V.openRewards(); return; }
  if (a === 'rwclose') { V.closePicker(); A.renderAll(); return; }
  if (a === 'rwprize') { ui.rw = { v: 'target', prize: v, day: '', ids: [] }; rwRender(); return; }
  if (a === 'rwday') { rw.day = v; rw.ids = []; rwRender(); return; }
  if (a === 'rwex') {
    var p = ST.prizeOf(rw.prize), i = rw.ids.indexOf(v);
    if (i >= 0) rw.ids.splice(i, 1);
    else { rw.ids.push(v); if (rw.ids.length > p.n) rw.ids.shift(); }
    rwRender(); return;
  }
  if (a === 'rwnext') { var pz = ST.prizeOf(rw.prize); if (rw.day && (!pz.n || rw.ids.length === pz.n)) { rw.v = 'confirm'; rwRender(); } return; }
  if (a === 'rwback') { ui.rw = rw.v === 'confirm' ? { v: 'target', prize: rw.prize, day: rw.day, ids: rw.ids } : { v: 'list' }; rwRender(); return; }
  if (a === 'rwgo') {
    if (ST.redeem(rw.prize, rw.day, rw.ids, t)) {
      A.save(); ui.rw = { v: 'list' }; V.renderHeader(); rwRender(); A.toast('🎁 Premio canjeado: ' + ST.prizeOf(rw.prize).name);
      var al = ST.checkAch(t); if (al.length) { A.save(); }
    } else { A.toast('No se pudo canjear. Revisa tus medallas y el día elegido.'); ui.rw = { v: 'list' }; rwRender(); }
    return;
  }
  if (a === 'rwundo') {
    if (ST.undoRedeem(v, t)) { A.save(); V.renderHeader(); rwRender(); A.toast('↩️ Canje deshecho: medallas devueltas'); }
    return;
  }
  if (a === 'rwrest') {
    var rr = null; s.medals.redeems.forEach(function (x) { if (x.id === v) rr = x; });
    if (rr && !rr.used) { rr.used = true; A.save(); A.renderAll(); A.countdown(600, 'Descanso extra'); }
    return;
  }

  /* ---- Metas ---- */
  if (a === 'goalnew') { ui.goalForm.open = !ui.goalForm.open; ui.goalErr = ''; V.renderPro(); return; }
  if (a === 'goaltype') { ui.goalForm.type = v; ui.goalErr = ''; V.renderPro(); return; }
  if (a === 'goaldel') { s.goals = s.goals.filter(function (g) { return g.id !== v; }); A.save(); V.renderPro(); return; }
  if (a === 'goalsave') {
    var type = ui.goalForm.type, g;
    if (type === 'streak') {
      g = { type: 'streak', name: '', target: U.num($('#gDays').value, 1, 7, 3), weeks: U.num($('#gWeeks').value, 1, 52, 4) };
    } else {
      var tv = parseFloat(String($('#gTarget').value).replace(',', '.'));
      if (isNaN(tv) || tv <= 0) { ui.goalErr = 'Escribe un número mayor que 0.'; V.renderPro(); return; }
      g = { type: type, name: $('#gEx').value, target: type === 'weight' ? Math.round(tv * 10) / 10 : Math.round(tv), weeks: 0 };
    }
    if (!ST.addGoal(g)) { ui.goalErr = 'Puedes tener hasta 20 metas.'; V.renderPro(); return; }
    ui.goalForm.open = false; ui.goalErr = ''; ST.checkGoals(t); A.save(); V.renderPro(); A.toast('🎯 Meta guardada'); after(); return;
  }

  /* ---- Copia de seguridad ---- */
  if (a === 'bkexport') {
    try {
      ST.flush();
      var data = { app: 'primer-set', seccion: ST.getSection(), formato: 1, exportado: new Date().toISOString(), datos: s };
      var blob = new Blob([JSON.stringify(data, null, 1)], { type: 'application/json' }), url = URL.createObjectURL(blob), lk = document.createElement('a');
      lk.href = url; lk.download = 'primer-set-' + (ST.getSection() === 'cali' ? 'calistenia-' : '') + 'copia-' + U.dkey(t) + '.json';
      document.body.appendChild(lk); lk.click(); lk.remove();
      setTimeout(function () { URL.revokeObjectURL(url); }, 3000);
      A.toast('✅ Copia guardada en tus descargas');
    } catch (e) { A.toast('No se pudo descargar aquí. Prueba desde la app instalada.'); }
    return;
  }
  if (a === 'bkimport') { ui.impErr = ''; var fi = $('#impFile'); if (fi) { fi.value = ''; fi.click(); } return; }
  if (a === 'bkcancel') { ui.imp = null; ui.impErr = ''; V.renderPer(); return; }
  if (a === 'bkconfirm') {
    if (!ui.imp) return;
    ST.flush();
    try { ui.prevState = JSON.parse(JSON.stringify(s)); localStorage.setItem('primerset.prev', JSON.stringify(s)); } catch (e) { /* ignorar */ }
    ST.set(ui.imp); ui.imp = null; ST.save(); A.renderAll();
    A.toast('✅ Datos importados', ['undoimport', 'Deshacer']); return;
  }
  if (a === 'undoimport') {
    if (ui.prevState) { ST.set(ui.prevState); ST.save(); ui.prevState = null; A.renderAll(); A.toast('↩️ Datos anteriores recuperados'); }
    return;
  }
});

document.addEventListener('change', function (ev) {
  var t = ev.target;
  if (!t || !t.getAttribute) return;
  var f = t.getAttribute('data-f');

  if (f === 'liftw' || f === 'liftr') {
    var box = t.closest('.lift'), k = t.getAttribute('data-k'), n = t.getAttribute('data-n');
    var wi = box.querySelector('[data-f=liftw]'), ri = box.querySelector('[data-f=liftr]');
    var w = parseFloat(String(wi.value).replace(',', '.')), r = parseInt(ri.value, 10);
    w = isNaN(w) ? 0 : Math.round(Math.max(0, Math.min(1000, w)) * 10) / 10;
    r = isNaN(r) ? 0 : Math.max(0, Math.min(1000, r));
    wi.value = w || ''; ri.value = r || '';
    var pr = ST.isPR(k, n, w, r);
    ST.setLift(k, n, w, r); A.save();
    if (pr) celebrate(n, w, r);
    var sm = box.querySelector('summary'), txt = (w ? ST.fmtNum(w) + ' kg' : '') + (w && r ? ' × ' : '') + (r ? r + ' rep.' : '');
    sm.textContent = txt ? '📝 ' + txt : D.T.liftSum;
    after(); return;
  }
  if (f === 'liftsel') { ui.liftEx = t.value; V.renderPro(); return; }

  if (t.id === 'impFile') {
    var file = t.files && t.files[0];
    if (!file) return;
    if (file.size > 2000000) { ui.impErr = 'El archivo es demasiado grande para ser una copia de Primer Set.'; V.renderPer(); return; }
    var rd = new FileReader();
    rd.onload = function () {
      try {
        var o = JSON.parse(String(rd.result)), obj = o && o.datos ? o.datos : o;
        if (!obj || typeof obj !== 'object' || !((obj.routine && Array.isArray(obj.routine.days)) || obj.logs)) throw new Error('formato');
        var fsec = o && o.seccion === 'cali' ? 'cali' : 'gym';
        if (fsec !== ST.getSection()) { ui.imp = null; ui.impErr = 'Esta copia es de ' + (fsec === 'cali' ? 'Calistenia' : 'Gimnasio') + '. Cambia de sección en Ajustes para importarla.'; V.renderPer(); return; }
        ui.imp = ST.norm(obj); ui.impErr = '';
      } catch (e) { ui.imp = null; ui.impErr = 'Este archivo no parece una copia de Primer Set.'; }
      V.renderPer();
    };
    rd.onerror = function () { ui.impErr = 'No se pudo leer el archivo.'; V.renderPer(); };
    rd.readAsText(file);
  }
});
})();

(function () {
'use strict';
var U = PS.u, D = PS.d, ST = PS.s, V = PS.v, A = PS.app;
var $ = U.$, esc = U.esc;

/* =====================================================================
   Sesión guiada: te lleva ejercicio por ejercicio y serie por serie.
   Al terminar cada serie arranca solo el descanso, con sonido y vibración.
   Funciona igual en el Bloque A y en el Bloque B.
   ===================================================================== */
var G = null, ticker = null, wake = null;
var RING = 2 * Math.PI * 54;

function now() { return Date.now(); }

function buildItems(plan, k) {
  var log = ST.getLog(k), checks = log ? log.checks : [], sk = ST.skippedIds(k), items = [];
  var warm = D.warmFor ? D.warmFor(plan) : D.WARM, cool = D.coolFor ? D.coolFor(plan) : [];
  warm.forEach(function (w) {
    if (checks.indexOf(w.id) >= 0) return;
    items.push({ kind: 'warm', id: w.id, name: w.n, emoji: w.e, tip: w.tip, type: w.secs > 0 ? 'time' : 'once', sets: 1, secs: w.secs, meta: w.meta, rest: 0 });
  });
  plan.ex.forEach(function (e) {
    if (checks.indexOf(e.id) >= 0 || sk[e.id]) return;
    var lib = D.libFind(e.name);
    items.push({ kind: 'ex', id: e.id, name: e.name, emoji: D.emojiFor(e.name), tip: lib ? lib.tip : '', type: e.type, sets: e.sets, reps: e.reps, secs: e.secs, rest: e.rest });
  });
  cool.forEach(function (w) {
    if (checks.indexOf(w.id) >= 0) return;
    items.push({ kind: 'cool', id: w.id, name: w.n, emoji: w.e, tip: w.tip, type: w.secs > 0 ? 'time' : 'once', sets: 1, secs: w.secs, meta: w.meta, rest: 0 });
  });
  return items;
}
function cur() { return G && G.items[G.i] || null; }
function prepWork() {
  var it = cur();
  G.phase = 'work'; G.run = 'idle'; G.left = it && it.type === 'time' ? it.secs * 1000 : 0; G.end = 0;
}
function fmt(ms) { return U.fmtClock(Math.max(0, Math.ceil(ms / 1000))); }

/* ---------- Abrir y cerrar ---------- */
function open() {
  var t = V.today(), plan = ST.dayPlan(t), k = U.dkey(t);
  if (!ST.isTrain(plan)) return;
  var items = buildItems(plan, k), total = 0;
  items.forEach(function (it) { total += it.sets; });
  G = { items: items, i: 0, set: 1, phase: 'work', run: 'idle', left: 0, end: 0, t0: now(), k: k, doneSets: 0, totalSets: total, restTotal: 0, confirm: false, label: plan.label || '' };
  if (!items.length) G.phase = 'done'; else prepWork();
  var el = $('#guide');
  el.hidden = false; document.body.classList.add('guiding', 'noscroll');
  lock(); render();
  clearInterval(ticker); ticker = setInterval(tick, 250);
}
function close() {
  clearInterval(ticker); ticker = null; G = null;
  var el = $('#guide'); el.hidden = true; el.innerHTML = '';
  document.body.classList.remove('guiding', 'noscroll');
  unlock();
  A.renderAll();
}
function lock() {
  try { if (navigator.wakeLock && navigator.wakeLock.request) navigator.wakeLock.request('screen').then(function (w) { wake = w; }, function () { /* ignorar */ }); } catch (e) { /* ignorar */ }
}
function unlock() { try { if (wake) wake.release(); } catch (e) { /* ignorar */ } wake = null; }
document.addEventListener('visibilitychange', function () {
  if (document.visibilityState === 'visible' && G) { lock(); tick(); }
});

/* ---------- Dibujo ---------- */
function ring(id, pct, big, label) {
  return '<div class="g-ring"><svg viewBox="0 0 120 120" aria-hidden="true"><circle cx="60" cy="60" r="54" class="g-ring-bg"/><circle cx="60" cy="60" r="54" class="g-ring-fg" id="' + id + '" stroke-dasharray="' + RING.toFixed(1) + '" stroke-dashoffset="' + (RING * (1 - pct)).toFixed(1) + '"/></svg>' +
    '<div class="g-ring-t"><b class="num" id="gCount">' + big + '</b><span>' + esc(label) + '</span></div></div>';
}
function head() {
  var pct = G.totalSets ? Math.round(G.doneSets / G.totalSets * 100) : 100;
  var it = cur(), pos = G.items.length ? Math.min(G.i + 1, G.items.length) : 0;
  return '<div class="g-top"><button type="button" class="iconbtn" data-act="gclose" aria-label="Salir de la sesión guiada">✕</button>' +
    '<div class="g-top-c"><span class="label">' + (G.phase === 'done' ? 'Terminaste' : (it && it.kind === 'warm' ? 'Calentamiento' : it && it.kind === 'cool' ? 'Estiramiento' : 'Entrenamiento')) + '</span>' +
    '<span class="muted small">' + (G.phase === 'done' ? 'Sesión completa' : 'Paso ' + pos + ' de ' + G.items.length) + '</span></div>' +
    '<span class="pill num" id="gTotal">' + fmt(now() - G.t0) + '</span></div>' +
    '<div class="bar-prog" aria-hidden="true"><i style="width:' + pct + '%"></i></div>';
}
function liftFields(it) {
  if (it.kind !== 'ex' || it.type === 'time') return '';
  var v = ST.getLift(G.k, it.name) || {};
  return '<details class="lift g-lift"><summary>' + esc(D.T.liftSum) + '</summary><div class="lift-grid">' +
    '<label class="field"><span class="label">' + esc(D.T.liftW) + '</span><input type="number" id="gW" inputmode="decimal" min="0" max="1000" step="0.5" placeholder="0" value="' + (v.w || '') + '"></label>' +
    '<label class="field"><span class="label">Repeticiones</span><input type="number" id="gR" inputmode="numeric" min="0" max="1000" placeholder="0" value="' + (v.r || '') + '"></label></div></details>';
}
function target(it) {
  if (it.kind !== 'ex') return esc(it.meta || '');
  return it.type === 'time' ? U.fmtDur(it.secs) : it.reps + ' repeticiones';
}
function nextText() {
  var it = cur();
  if (!it) return '';
  if (G.set < it.sets) return 'Serie ' + (G.set + 1) + ' de ' + it.sets + ' · ' + it.name;
  var nx = G.items[G.i + 1];
  return nx ? nx.name + (nx.sets > 1 ? ' · serie 1 de ' + nx.sets : '') : 'Último paso';
}
function render() {
  var el = $('#guide');
  if (!el || !G) return;
  var it = cur(), h = '<div class="g-wrap">' + head();
  if (G.confirm) {
    h += '<div class="g-confirm" role="alertdialog" aria-label="Salir"><p><b>¿Salir de la sesión?</b><br><span class="muted small">Los ejercicios que ya terminaste se quedan marcados.</span></p>' +
      '<div class="rowflex"><button type="button" class="btn warn" data-act="gexit">Salir</button><button type="button" class="btn" data-act="gstay">Seguir entrenando</button></div></div>';
  }
  if (G.phase === 'done') {
    var mins = Math.max(1, Math.min(600, Math.round((now() - G.t0) / 60000)));
    var conf = '';
    for (var c = 0; c < 14; c++) conf += '<i style="--a:' + Math.round(c * 360 / 14) + 'deg;--d:' + (c % 4) * 70 + 'ms">' + ['🎉', '⭐', '💪', '✨'][c % 4] + '</i>';
    h += '<div class="g-main g-done"><div class="g-conf" aria-hidden="true">' + conf + '</div><div class="g-big-e" aria-hidden="true">🏆</div><h2>¡Sesión completada!</h2>' +
      '<p class="muted">Entrenaste unos <b class="num">' + U.fmtMin(mins) + '</b>' + (G.label ? ' · ' + esc(G.label) : '') + '. Buen trabajo.</p></div>' +
      '<div class="g-bottom"><button type="button" class="btn primary g-btn g-wide" data-act="gfinish" data-v="' + mins + '">✅ Registrar entrenamiento</button><button type="button" class="btn ghost" data-act="gexit">Cerrar sin registrar</button></div>';
  } else if (G.phase === 'rest') {
    var rem = G.end - now();
    h += '<div class="g-main g-rest"><span class="label">😴 Descanso</span>' + ring('gRing', Math.max(0, rem) / G.restTotal, fmt(rem), 'respira y recupera') +
      '<p class="g-next"><span class="muted small">Sigue</span><br><b>' + esc(nextText()) + '</b></p></div>' +
      '<div class="g-bottom"><button type="button" class="btn g-btn" data-act="gradd">+15 s</button><button type="button" class="btn primary g-btn" data-act="grskip">Saltar descanso →</button></div>';
  } else if (it) {
    var timed = it.type === 'time', once = it.type === 'once';
    h += '<div class="g-main"><div class="g-big-e" aria-hidden="true">' + it.emoji + '</div><h2>' + esc(it.name) + '</h2>';
    if (it.sets > 1) h += '<div class="g-sets" aria-label="Serie ' + G.set + ' de ' + it.sets + '">' + (function () { var s = ''; for (var q = 1; q <= it.sets; q++) s += '<i class="' + (q < G.set ? 'on' : q === G.set ? 'cur' : '') + '"></i>'; return s; })() + '</div><p class="g-set">Serie <b class="num">' + G.set + '</b> de ' + it.sets + '</p>';
    h += '<p class="g-target">' + target(it) + '</p>';
    if (timed) h += ring('gRing', it.secs ? Math.max(0, G.run === 'run' ? G.end - now() : G.left) / (it.secs * 1000) : 1, fmt(G.run === 'run' ? G.end - now() : G.left), G.run === 'run' ? 'en marcha' : G.run === 'pause' ? 'en pausa' : 'listo');
    if (it.tip) h += '<p class="ex-tip g-tip">' + esc(it.tip) + '</p>';
    h += liftFields(it) + '</div><div class="g-bottom">';
    if (timed) {
      h += G.run === 'run'
        ? '<button type="button" class="btn g-btn" data-act="gpause">⏸ Pausar</button>'
        : '<button type="button" class="btn primary g-btn" data-act="gstart">' + (G.run === 'pause' ? '▶ Seguir' : '▶ Iniciar') + '</button>';
      h += '<button type="button" class="btn g-btn" data-act="gset">✔ Hecho</button>';
    } else {
      h += '<button type="button" class="btn primary g-btn g-wide" data-act="gset">' + (once ? '✔ Hecho' : '✔ Serie hecha') + '</button>';
    }
    h += '<button type="button" class="btn ghost" data-act="gskip">Saltar este paso</button></div>';
  }
  el.innerHTML = h + '</div>';
  var main = el.querySelector('.g-main'); if (main) { main.classList.remove('swap'); void main.offsetWidth; main.classList.add('swap'); }
}

/* ---------- Avance ---------- */
function saveLift(it) {
  var w = $('#gW'), r = $('#gR');
  if (!w || !r) return;
  var wv = parseFloat(String(w.value).replace(',', '.')) || 0, rv = parseInt(r.value, 10) || 0;
  wv = Math.max(0, Math.min(1000, Math.round(wv * 10) / 10)); rv = Math.max(0, Math.min(1000, rv));
  if (!wv && !rv) return;
  var old = ST.getLift(G.k, it.name);
  if (!old || wv > old.w || (wv === old.w && rv > old.r)) ST.setLift(G.k, it.name, wv, rv);
}
function vib(p) { try { if (navigator.vibrate) navigator.vibrate(p); } catch (e) { /* ignorar */ } }
function markDone(it) {
  var l = ST.ensureLog(G.k);
  if (l.checks.indexOf(it.id) < 0) l.checks.push(it.id);
  ST.save();
}
function afterSet(skipItem) {
  var it = cur(), rest = it ? it.rest : 0;
  if (!skipItem && it) G.doneSets++;
  if (!skipItem && it && G.set < it.sets) {
    G.set++;
    if (rest > 0) { startRest(rest); return; }
    prepWork(); render(); return;
  }
  if (it) {
    if (skipItem) G.doneSets += (it.sets - G.set + 1) - 0;
    else markDone(it);
  }
  G.i++; G.set = 1;
  if (G.i >= G.items.length) { G.phase = 'done'; vib([120, 80, 120, 80, 300]); if (A.beep) A.beep(); G.doneSets = G.totalSets; render(); return; }
  if (!skipItem && rest > 0) { startRest(rest); return; }
  prepWork(); render();
}
function startRest(sec) {
  G.phase = 'rest'; G.end = now() + sec * 1000; G.restTotal = sec * 1000;
  render();
}
function endRest(auto) {
  prepWork();
  if (auto) { if (A.beep) A.beep(); }
  render();
}
function tick() {
  if (!G) return;
  var t = $('#gTotal'); if (t) t.textContent = fmt(now() - G.t0);
  if (G.phase === 'rest') {
    var rem = G.end - now();
    if (rem <= 0) { endRest(true); return; }
    paint(rem, G.restTotal);
  } else if (G.phase === 'work' && G.run === 'run') {
    var it = cur(), r2 = G.end - now();
    if (r2 <= 0) { if (A.beep) A.beep(); G.run = 'idle'; afterSet(false); return; }
    paint(r2, it.secs * 1000);
  }
}
function paint(rem, total) {
  var c = $('#gCount'), r = $('#gRing');
  if (c) c.textContent = fmt(rem);
  if (r && total) r.setAttribute('stroke-dashoffset', (RING * (1 - Math.max(0, rem) / total)).toFixed(1));
}

/* ---------- Eventos ---------- */
function after() {
  var t = V.today(), gl = ST.checkGoals(t), al = ST.checkAch(t);
  if (!gl.length && !al.length) return;
  ST.save();
  A.toast(gl.length ? '🎉 Meta cumplida: ' + ST.goalTitle(gl[0]) : '🏅 Logro: ' + al[0].n);
}
document.addEventListener('click', function (ev) {
  var el = ev.target && ev.target.closest ? ev.target.closest('[data-act]') : null;
  if (!el) return;
  var a = el.getAttribute('data-act');
  if (a === 'gopen') { open(); return; }
  if (a.charAt(0) !== 'g' || !G) return;
  var it = cur();
  if (a === 'gclose') { G.confirm = true; render(); return; }
  if (a === 'gstay') { G.confirm = false; render(); return; }
  if (a === 'gexit') { close(); return; }
  if (a === 'gset') { if (it) { saveLift(it); vib(30); } afterSet(false); return; }
  if (a === 'gskip') { if (it) { G.run = 'idle'; afterSet(true); } return; }
  if (a === 'gstart') { G.run = 'run'; G.end = now() + G.left; render(); return; }
  if (a === 'gpause') { G.left = Math.max(0, G.end - now()); G.run = 'pause'; render(); return; }
  if (a === 'gradd') { G.end += 15000; G.restTotal += 15000; render(); return; }
  if (a === 'grskip') { endRest(false); return; }
  if (a === 'gfinish') {
    var mins = U.num(el.getAttribute('data-v'), 1, 600, 1), k = G.k;
    close(); A.setStatus(k, 'done', mins); after(); return;
  }
});
document.addEventListener('keydown', function (ev) {
  if (ev.key === 'Escape' && G && G.phase !== 'done') { G.confirm = !G.confirm; render(); }
});
/* El botón "atrás" del celular no debe sacarte sin avisar: solo pide confirmar */
PS.guide = { open: open, close: close, active: function () { return !!G; } };
})();

(function () {
'use strict';
/* Arrastrar hacia abajo para cerrar las hojas (solo transform; no interfiere con el scroll interno) */
function attach(id) {
  var m = document.getElementById(id);
  if (!m) return;
  var y0 = 0, dy = 0, sh = null, on = false;
  m.addEventListener('touchstart', function (e) {
    sh = e.target.closest ? e.target.closest('.sheet') : null;
    on = false; dy = 0;
    if (!sh || e.touches.length !== 1) { sh = null; return; }
    var t = e.target;
    if (t.closest && t.closest('input,textarea,select,[contenteditable]')) { sh = null; return; }
    for (var n = t; n && n !== m; n = n.parentNode) { if (n.scrollTop > 0) { sh = null; return; } }
    y0 = e.touches[0].clientY;
  }, { passive: true });
  m.addEventListener('touchmove', function (e) {
    if (!sh) return;
    dy = e.touches[0].clientY - y0;
    if (dy > 12) { on = true; sh.style.transition = 'none'; sh.style.transform = 'translateY(' + Math.round(dy * 0.8) + 'px)'; }
    else if (on) { sh.style.transform = ''; }
  }, { passive: true });
  function end() {
    if (!sh) return;
    var s = sh; sh = null;
    s.style.transition = 'transform .22s ease, opacity .22s ease';
    if (on && dy > 110) {
      s.style.transform = 'translateY(100%)'; s.style.opacity = '0';
      setTimeout(function () { s.style.transition = ''; s.style.transform = ''; s.style.opacity = ''; m.click(); }, 200);
    } else {
      s.style.transform = '';
      setTimeout(function () { s.style.transition = ''; }, 240);
    }
    on = false;
  }
  m.addEventListener('touchend', end, { passive: true });
  m.addEventListener('touchcancel', end, { passive: true });
}
attach('picker'); attach('modal');
})();

/* Instalación como app y funcionamiento sin internet (solo versión web) */
(function () {
  'use strict';
  if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol)) {
    /* Si ya había una versión instalada y llega una nueva, recarga una vez para usarla */
    var hadController = !!navigator.serviceWorker.controller, reloaded = false;
    navigator.serviceWorker.addEventListener('controllerchange', function () {
      if (!hadController || reloaded) return;
      reloaded = true; location.reload();
    });
    window.addEventListener('load', function () {
      navigator.serviceWorker.register('sw.js').catch(function () { /* sin funcionamiento offline */ });
    });
  }
  window.addEventListener('beforeinstallprompt', function (ev) {
    ev.preventDefault();
    var saved = ev;
    PS.install = {
      can: true,
      prompt: function () {
        saved.prompt();
        saved.userChoice.then(function () { PS.install = null; PS.v.renderPer(); }, function () { /* ignorar */ });
      }
    };
    PS.v.renderPer();
  });
  window.addEventListener('appinstalled', function () { PS.install = null; PS.v.renderPer(); });
})();
