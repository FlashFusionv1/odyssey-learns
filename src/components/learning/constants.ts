export const LESSON_SUBJECTS = [
  { value: "Reading", label: "📚 Reading & Language Arts", icon: "📚" },
  { value: "Math", label: "🔢 Mathematics", icon: "🔢" },
  { value: "Science", label: "🔬 Science", icon: "🔬" },
  { value: "Social Studies", label: "🌍 Social Studies", icon: "🌍" },
  { value: "Emotional Intelligence", label: "💙 Emotional Intelligence", icon: "💙" },
  { value: "Life Skills", label: "🛠️ Life Skills", icon: "🛠️" },
  { value: "Art", label: "🎨 Art & Creativity", icon: "🎨" },
  { value: "Music", label: "🎵 Music", icon: "🎵" },
] as const;

export const TOPIC_SUGGESTIONS: Record<string, string[]> = {
  Reading: ["Dragons", "Space Adventure", "Friendship", "Mystery Solving", "Ocean Life"],
  Math: ["Pizza Fractions", "Money & Shopping", "Shapes in Nature", "Time Travel Math", "Sports Stats"],
  Science: ["Volcanoes", "Dinosaurs", "Space Exploration", "Weather Patterns", "Animal Habitats"],
  "Social Studies": ["Ancient Egypt", "Community Helpers", "World Cultures", "Famous Inventors", "Geography"],
  "Emotional Intelligence": ["Managing Anger", "Making Friends", "Self-Confidence", "Dealing with Change", "Empathy"],
  "Life Skills": ["Cooking Basics", "Money Saving", "Organization", "First Aid", "Digital Safety"],
  Art: ["Drawing Animals", "Color Theory", "Famous Artists", "Sculpture", "Digital Art"],
  Music: ["Rhythm Basics", "Instruments", "Famous Composers", "Songwriting", "Music Around the World"],
};

export type LessonSubject = (typeof LESSON_SUBJECTS)[number]["value"];
