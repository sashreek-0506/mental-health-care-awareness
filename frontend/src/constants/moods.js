// Kept in sync with backend/models/MoodEntry.js MOODS enum.
export const MOODS = [
  { value: "happy", label: "Happy", emoji: "🙂" },
  { value: "calm", label: "Calm", emoji: "😌" },
  { value: "okay", label: "Okay", emoji: "😐" },
  { value: "tired", label: "Tired", emoji: "😴" },
  { value: "unmotivated", label: "Unmotivated", emoji: "😑" },
  { value: "anxious", label: "Anxious", emoji: "😟" },
  { value: "stressed", label: "Stressed", emoji: "😣" },
  { value: "overwhelmed", label: "Overwhelmed", emoji: "😵‍💫" },
  { value: "sad", label: "Sad", emoji: "😔" },
  { value: "angry", label: "Angry", emoji: "😠" },
];

export const MOOD_LABEL = Object.fromEntries(MOODS.map((m) => [m.value, m.label]));
export const MOOD_EMOJI = Object.fromEntries(MOODS.map((m) => [m.value, m.emoji]));

// A rough valence scale purely for charting mood history as a line (1 = hardest, 5 = best).
export const MOOD_SCORE = {
  angry: 1,
  overwhelmed: 1,
  sad: 2,
  stressed: 2,
  anxious: 2,
  unmotivated: 3,
  tired: 3,
  okay: 3,
  calm: 4,
  happy: 5,
};
