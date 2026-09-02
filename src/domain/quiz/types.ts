export type Question = {
  id: string;
  planetId: string;
  prompt: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  coinReward?: number;
};
