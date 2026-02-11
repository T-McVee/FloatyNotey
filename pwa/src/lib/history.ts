/** Session-scoped navigation history for note switching. */
let back: number[] = [];
let forward: number[] = [];

export function pushHistory(noteId: number) {
  back.push(noteId);
  forward = [];
}

export function goBack(currentId: number): number | null {
  if (back.length === 0) return null;
  forward.push(currentId);
  return back.pop()!;
}

export function goForward(currentId: number): number | null {
  if (forward.length === 0) return null;
  back.push(currentId);
  return forward.pop()!;
}

export function canGoBack() {
  return back.length > 0;
}

export function canGoForward() {
  return forward.length > 0;
}
