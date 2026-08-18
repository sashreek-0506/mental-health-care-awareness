// Curated, real, publicly known calming/focus tracks and instrumental
// genres, grouped by mood. Titles and artist names only (no lyrics) — the
// app points the student to look these up on whatever platform they use.
// Each track has a stable id so the AI layer (see utils/aiSuggest.js) can
// select from this list instead of inventing tracks.

export const TRACKS = [
  { id: "t01", title: "Weightless", artist: "Marconi Union", tag: "ambient", moods: ["stressed", "anxious", "overwhelmed"], dayContexts: ["academic_pressure", "conflict"], why: "Composed with a sound therapist specifically to slow heart rate and breathing." },
  { id: "t02", title: "Clair de Lune", artist: "Claude Debussy", tag: "classical", moods: ["anxious", "sad", "overwhelmed"], dayContexts: ["isolation", "setback", "conflict"], why: "Slow, unhurried piano with long phrases — nothing demands your attention." },
  { id: "t03", title: "Gymnopédie No. 1", artist: "Erik Satie", tag: "classical", moods: ["anxious", "calm", "tired"], dayContexts: ["low_energy", "routine"], why: "Sparse and repetitive, easy for a busy mind to settle into." },
  { id: "t04", title: "Spiegel im Spiegel", artist: "Arvo Pärt", tag: "minimalist", moods: ["overwhelmed", "sad"], dayContexts: ["isolation", "setback"], why: "Extremely simple, spacious, and slow — good for when everything feels like too much at once." },
  { id: "t05", title: "River Flows in You", artist: "Yiruma", tag: "piano", moods: ["stressed", "unmotivated"], dayContexts: ["academic_pressure", "routine", "setback"], why: "Gentle and melodic, works well as background while you ease into studying." },
  { id: "t06", title: "Nuvole Bianche", artist: "Ludovico Einaudi", tag: "piano", moods: ["sad", "tired"], dayContexts: ["isolation", "setback", "low_energy"], why: "Warm and a little wistful, without tipping into heavy." },
  { id: "t07", title: "An Ending (Ascent)", artist: "Brian Eno", tag: "ambient", moods: ["overwhelmed", "angry"], dayContexts: ["conflict", "setback"], why: "Long, slow-building ambient textures with nothing sudden or jarring." },
  { id: "t08", title: "Avril 14th", artist: "Aphex Twin", tag: "piano", moods: ["angry", "sad"], dayContexts: ["conflict", "setback"], why: "Short, quiet, and unpretentious — a soft landing after something intense." },
  { id: "t09", title: "Metamorphosis Two", artist: "Philip Glass", tag: "minimalist", moods: ["angry", "stressed"], dayContexts: ["conflict", "academic_pressure"], why: "Steady, repetitive patterns that give restless energy somewhere to go." },
  { id: "t10", title: "Holocene", artist: "Bon Iver", tag: "acoustic", moods: ["tired", "sad"], dayContexts: ["low_energy", "isolation"], why: "Soft and unrushed, good for winding down without fully checking out." },
  { id: "t11", title: "Sunset Lover", artist: "Petit Biscuit", tag: "chill", moods: ["unmotivated", "okay"], dayContexts: ["routine", "low_energy", "academic_pressure"], why: "Mellow but forward-moving, decent for easing into a study session." },
  { id: "t12", title: "Comptine d'un autre été", artist: "Yann Tiersen", tag: "piano", moods: ["calm", "happy", "okay"], dayContexts: ["routine", "achievement"], why: "Light and a little playful without being high-energy." },
  { id: "t13", title: "Experience", artist: "Ludovico Einaudi", tag: "piano", moods: ["calm", "overwhelmed"], dayContexts: ["achievement", "setback", "academic_pressure"], why: "Builds slowly and gives feelings room to move without rushing anywhere." },
  { id: "t14", title: "Lofi study beats (genre, any 'lofi hip hop radio' station)", artist: "Various", tag: "lofi", moods: ["stressed", "unmotivated", "tired"], dayContexts: ["academic_pressure", "routine", "low_energy"], why: "Steady, low-stimulation beat under 90bpm — built for background focus, not attention." },
  { id: "t15", title: "Rain or ocean soundscape (genre, any long-form nature audio)", artist: "Various", tag: "nature", moods: ["anxious", "overwhelmed", "sad"], dayContexts: ["academic_pressure", "isolation", "low_energy"], why: "Unstructured, non-musical sound gives an anxious mind nothing to analyze." },
  { id: "t16", title: "Sunrise", artist: "Norah Jones", tag: "acoustic", moods: ["happy", "okay"], dayContexts: ["social_connection", "achievement", "routine"], why: "Warm and easy, good company for a lighter mood." },
  { id: "t17", title: "Banana Pancakes", artist: "Jack Johnson", tag: "acoustic", moods: ["happy", "calm", "okay"], dayContexts: ["social_connection", "routine", "achievement"], why: "Relaxed, sunny acoustic energy for a day that ended lighter than it began." },
  { id: "t18", title: "Home", artist: "Edward Sharpe & The Magnetic Zeros", tag: "acoustic", moods: ["happy", "okay", "sad"], dayContexts: ["social_connection", "isolation"], why: "Warm and people-centered, useful when your day was shaped by missing or finding connection." },
  { id: "t19", title: "Your Hand in Mine", artist: "Explosions in the Sky", tag: "instrumental", moods: ["calm", "happy", "unmotivated"], dayContexts: ["achievement", "setback"], why: "Hopeful instrumental build without lyrics competing for your attention." },
  { id: "t20", title: "A Walk", artist: "Tycho", tag: "chill", moods: ["okay", "unmotivated", "tired"], dayContexts: ["routine", "low_energy"], why: "Light momentum for a normal or low-battery day that still needs a gentle push." },
  { id: "t21", title: "We Move Lightly", artist: "Dustin O'Halloran", tag: "piano", moods: ["anxious", "stressed", "calm"], dayContexts: ["academic_pressure"], why: "Soft piano that keeps the room calm while your mind is full of deadlines." },
  { id: "t22", title: "Near Light", artist: "Ólafur Arnalds", tag: "minimalist", moods: ["sad", "overwhelmed", "calm"], dayContexts: ["isolation", "setback"], why: "Quiet, spacious, and restorative for a day that knocked the wind out of you." },
  { id: "t23", title: "Kiara", artist: "Bonobo", tag: "chill", moods: ["okay", "unmotivated"], dayContexts: ["routine", "academic_pressure"], why: "A steady pulse without pressure, useful for easing back into focus." },
  { id: "t24", title: "Elegy for the Arctic", artist: "Ludovico Einaudi", tag: "piano", moods: ["overwhelmed", "sad", "anxious"], dayContexts: ["setback", "isolation", "academic_pressure"], why: "Slow and serious without being harsh, a soft place to land after a rough day." },
];

export function curatedSuggestionsForMood(mood, limit = 3) {
  const matches = TRACKS.filter((t) => t.moods.includes(mood));
  const pool = matches.length ? matches : TRACKS.filter((t) => t.moods.includes("okay"));
  // simple shuffle so repeat check-ins don't always see the same 3
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, limit);
}
