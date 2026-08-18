import { classifyText } from "../ml/moodClassifier.js";
import { classifyDayContext } from "../ml/dayContextClassifier.js";

const CONTEXT_ENCOURAGEMENTS = {
  academic_pressure: {
    validation: "Exams and deadlines can feel overwhelming, but your worth is never defined by a single score.",
    strengthSpotlight: "You have shown immense dedication by sitting down to face your study load head-on.",
    reframing: "Break down your work into micro-tasks. Taking it one pomodoro at a time makes the mountain manageable.",
    mantra: "I am capable, prepared, and step by step I move forward.",
  },
  achievement: {
    validation: "Celebrating your wins — big or small — is an essential part of honoring your effort.",
    strengthSpotlight: "Your persistence and focus paid off today. Feel proud of how far you've come.",
    reframing: "Anchor this feeling of success so you can draw strength from it when future challenges arrive.",
    mantra: "I celebrate my progress and honor the effort I put in.",
  },
  social_connection: {
    validation: "Human connections ground us and remind us that we don't have to walk through life alone.",
    strengthSpotlight: "Your openness to connect and share your presence enriches the people around you.",
    reframing: "Cherish the warmth of shared moments — they nourish your mind and spirit.",
    mantra: "I am worthy of meaningful connection and supportive relationships.",
  },
  conflict: {
    validation: "Disagreements and friction are draining, but having boundaries is a healthy sign of self-respect.",
    strengthSpotlight: "Recognizing your feelings during conflict shows high emotional awareness and strength.",
    reframing: "Give yourself space to breathe before responding. Peace begins with taking a step back.",
    mantra: "I hold space for calm and protect my inner peace.",
  },
  isolation: {
    validation: "Feeling lonely or disconnected happens to everyone; it is okay to pause and be gentle with yourself.",
    strengthSpotlight: "Your self-reflection here proves that you are deeply tuned into your emotional needs.",
    reframing: "Even a small connection — texting a friend or sitting in a quiet cafe — can remind you that you belong.",
    mantra: "I am never truly alone, and I treat myself with kindness.",
  },
  low_energy: {
    validation: "Fatigue is your body's honest request for rest. Resting is productive, not lazy.",
    strengthSpotlight: "Listening to your body and granting yourself permission to slow down is true wisdom.",
    reframing: "Recharge without guilt. Tomorrow will have fresh energy waiting for you.",
    mantra: "Rest restores my energy and honors my wellbeing.",
  },
  routine: {
    validation: "Steady, quiet days give us the stability needed to process thoughts and rebuild strength.",
    strengthSpotlight: "Showing up consistently day after day is a quiet superpower.",
    reframing: "Find joy in the small ordinary moments today — a warm drink, quiet breath, or soft music.",
    mantra: "In peace and routine, I find balance and steady growth.",
  },
  setback: {
    validation: "Setbacks hurt, but they are detour signs, not dead ends.",
    strengthSpotlight: "The courage to reflect on a difficult moment is the first step toward resilience.",
    reframing: "Every hurdle carries a lesson. This hurdle does not define your future potential.",
    mantra: "I grow stronger through every challenge, and my story continues.",
  },
};

const DEFAULT_ENCOURAGEMENT = {
  validation: "Expressing your thoughts in writing is a powerful act of self-care and emotional clarity.",
  strengthSpotlight: "Taking time for honest self-reflection demonstrates self-awareness and strength.",
  reframing: "Be patient with yourself today. Small, consistent steps build lasting inner calm.",
  mantra: "I honor my journey and trust my resilience.",
};

/**
 * Generates an ML-driven Cognitive Encouragement object for a private journal entry.
 */
export function generateEncouragement(text) {
  if (!text || !text.trim()) {
    return DEFAULT_ENCOURAGEMENT;
  }

  const moodClass = classifyText(text);
  const contextClass = classifyDayContext(text);

  const detectedMood = moodClass?.label || "reflective";
  const detectedContext = contextClass?.label || "routine";

  const template = CONTEXT_ENCOURAGEMENTS[detectedContext] || DEFAULT_ENCOURAGEMENT;

  return {
    detectedMood,
    detectedContext,
    validation: template.validation,
    strengthSpotlight: template.strengthSpotlight,
    reframing: template.reframing,
    mantra: template.mantra,
  };
}
