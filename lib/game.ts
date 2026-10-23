export const LEVELS = [
  { name: "First light", max: 10, budget: 4, color: "#e0b46e" },
  { name: "A little curious", max: 20, budget: 5, color: "#b6cbb0" },
  { name: "Into the grove", max: 30, budget: 5, color: "#91b6a1" },
  { name: "Taking flight", max: 50, budget: 6, color: "#a8bfd4" },
  { name: "Cloud hopping", max: 75, budget: 7, color: "#c1b1d1" },
  { name: "The halfway moon", max: 100, budget: 7, color: "#baa1c2" },
  { name: "Wild wonder", max: 150, budget: 8, color: "#c4b17c" },
  { name: "Golden hour", max: 250, budget: 9, color: "#d7a575" },
  { name: "Almost magic", max: 500, budget: 10, color: "#c58f91" },
  { name: "A crown of stars", max: 1000, budget: 11, color: "#d2b472" },
] as const;
export type Guess = {
  value: number;
  direction: "higher" | "lower" | "correct";
  warmth: string;
  player?: number;
};
export type Round = {
  secret: number;
  max: number;
  budget: number;
  low: number;
  high: number;
  guesses: Guess[];
  spent: number;
  status: "playing" | "won" | "lost";
  hints: number;
};
export function makeRound(
  max: number,
  budget: number,
  secret = Math.floor(Math.random() * max) + 1,
): Round {
  if (!Number.isInteger(secret) || secret < 1 || secret > max)
    throw new Error("Invalid secret");
  return {
    secret,
    max,
    budget,
    low: 1,
    high: max,
    guesses: [],
    spent: 0,
    status: "playing",
    hints: 0,
  };
}
export function warmth(value: number, secret: number, max: number) {
  const distance = Math.abs(value - secret) / max;
  return distance === 0
    ? "Found it!"
    : distance <= 0.05
      ? "So close"
      : distance <= 0.15
        ? "Getting warm"
        : distance <= 0.35
          ? "A little chilly"
          : "Ice cold";
}
export function guess(round: Round, value: number): Round {
  if (round.status !== "playing") throw new Error("This round has ended");
  if (!Number.isInteger(value) || value < round.low || value > round.high)
    throw new Error(`Choose a whole number from ${round.low} to ${round.high}`);
  if (round.guesses.some((g) => g.value === value))
    throw new Error("You already tried that number");
  const direction =
    value === round.secret
      ? "correct"
      : value < round.secret
        ? "higher"
        : "lower";
  const spent = round.spent + 1;
  return {
    ...round,
    spent,
    low: direction === "higher" ? value + 1 : round.low,
    high: direction === "lower" ? value - 1 : round.high,
    guesses: [
      ...round.guesses,
      { value, direction, warmth: warmth(value, round.secret, round.max) },
    ],
    status:
      direction === "correct"
        ? "won"
        : spent >= round.budget
          ? "lost"
          : "playing",
  };
}
export function hint(round: Round): Round {
  if (round.status !== "playing" || round.low === round.high)
    throw new Error("No hint needed right now");
  const mid = Math.floor((round.low + round.high) / 2),
    spent = round.spent + 1;
  return {
    ...round,
    spent,
    hints: round.hints + 1,
    low: round.secret > mid ? mid + 1 : round.low,
    high: round.secret <= mid ? mid : round.high,
    status: spent >= round.budget ? "lost" : "playing",
  };
}
export function stars(round: Round) {
  return round.status !== "won"
    ? 0
    : round.spent <= Math.ceil(Math.log2(round.max + 1))
      ? 3
      : round.spent < round.budget
        ? 2
        : 1;
}
