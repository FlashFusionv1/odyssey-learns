import {
  Gamepad2,
  BookOpen,
  Palette,
  Heart,
  Music,
  Puzzle,
  Play as PlayIcon,
  Star,
  Sparkles,
  LucideIcon,
} from "lucide-react";

export const CONTENT_TYPE_ICONS: Record<string, LucideIcon> = {
  game: Gamepad2,
  story: BookOpen,
  adventure: Sparkles,
  coloring: Palette,
  self_soothing: Heart,
  roleplay: Star,
  video: PlayIcon,
  music: Music,
  puzzle: Puzzle,
  quiz_game: Gamepad2,
};

export const CONTENT_TYPE_LABELS: Record<string, string> = {
  game: "Games",
  story: "Stories",
  adventure: "Adventures",
  coloring: "Coloring",
  self_soothing: "Calm Down",
  roleplay: "Role Play",
  video: "Videos",
  music: "Music",
  puzzle: "Puzzles",
  quiz_game: "Quiz Games",
};

export const SUBJECT_COLORS: Record<string, string> = {
  math: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  reading: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  science: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
  social: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
  lifeskills: "bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300",
};
