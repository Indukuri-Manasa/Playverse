// Stockfish settings per difficulty.
// skill   → UCI "Skill Level" (0–20). Below 20 Stockfish deliberately picks weaker moves
//           from its candidate list, so play stays human-like rather than random.
// depth   → maximum search depth (plies); movetime → hard time cap in ms (whichever comes first).
// UCI_Elo isn't used because this build can't go below 1320 Elo, too strong for Beginner.
export const ENGINE_LEVELS = {
  beginner: { label: 'Beginner', skill: 0, depth: 1, movetime: 150, blurb: 'Learning the moves — misses tactics often.' },
  easy: { label: 'Easy', skill: 3, depth: 3, movetime: 300, blurb: 'Casual player — sees simple threats.' },
  medium: { label: 'Medium', skill: 8, depth: 6, movetime: 600, blurb: 'Club player — punishes loose pieces.' },
  hard: { label: 'Hard', skill: 14, depth: 10, movetime: 1000, blurb: 'Strong player — solid and tactical.' },
  expert: { label: 'Expert', skill: 20, depth: 16, movetime: 2000, blurb: 'Full-strength Stockfish. Good luck.' },
}

// Hints always use near-full strength so the suggestion is actually good.
export const HINT_LEVEL = { skill: 20, depth: 12, movetime: 800 }
