// True when two plain values (objects, arrays, primitives) contain the same data
export const haveSameValues = (first: unknown, second: unknown): boolean =>
  JSON.stringify(first) === JSON.stringify(second);
