export const GRADIENT_COLORS = [
  "rgba(250,61,59,0.35)",
  "rgba(250,61,59,0.15)",
  "rgba(250,61,59,0.05)",
  "rgba(250,61,59,0)",
] as const;
export const GRADIENT_START = { x: 0, y: 0 };
export const GRADIENT_END = { x: 1, y: 0 };
export const SIDE_GRADIENT_STYLE = {
  position: "absolute" as const,
  left: 0,
  top: 0,
  bottom: 0,
  width: 20,
  borderTopLeftRadius: 16,
  borderBottomLeftRadius: 16,
  zIndex: 1,
};
