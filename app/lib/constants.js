export const LETTERS = ["A", "B", "C", "D", "E"];

export const emptyQuestion = () => ({
  id: Math.random().toString(36).slice(2),
  text: "",
  type: "mc",
  options: ["", ""],
  correct_index: 0,
  correct_bool: true,
  sample_answer: "",
  position: 0,
});
