export type Priority = "LOW" | "NORMAL" | "HIGH";
export type TaskStatus = "GIVEN" | "COMPLETED";

export type LabelDTO = {
  id: string;
  name: string;
  icon: string;
};

export type ReactionDTO = {
  emoji: string;
  note: string | null;
};

export type TaskDTO = {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: Priority;
  order: number;
  createdAt: string;
  completedAt: string | null;
  label: LabelDTO;
  reaction: ReactionDTO | null;
};

export const REACTION_EMOJIS = ["👏", "❤️", "🔥", "😍", "🙂", "😐", "😤", "😡"] as const;
