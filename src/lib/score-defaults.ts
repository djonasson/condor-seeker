export function computeHoleDefaults(par: number, handicapStrokes: number) {
  return {
    grossScore: par + handicapStrokes,
    putts: 2,
    fairwayHit: par > 3 ? true : undefined,
    greenInRegulation: true,
  }
}
