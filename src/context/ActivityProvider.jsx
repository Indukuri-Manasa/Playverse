import { useCallback, useMemo } from 'react'
import { ActivityContext } from './activityContext'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { getGame } from '../data/games'
import { challengeStatus, dailyChallenge, dayKey } from '../utils/daily'

// Play history kept alongside best scores (separate key, so best scores are untouched).
const EMPTY = {
  playerName: 'Player One',
  sessions: {}, // gameId -> times launched
  recent: [], // [{ id, at }] newest first
  history: {}, // gameId -> [{ score, at }]
  ttt: { win: 0, loss: 0, draw: 0 }, // vs CPU
  days: [], // 'YYYY-MM-DD' days played
  daily: { date: null, snake: null, memory: null, tttWins: 0 },
  challengesDone: [], // day keys where the daily challenge was met
}

const normalize = (stored) => ({
  ...EMPTY,
  ...stored,
  ttt: { ...EMPTY.ttt, ...stored?.ttt },
  daily: { ...EMPTY.daily, ...stored?.daily },
})

function todaysDaily(state, key) {
  return state.daily.date === key ? state.daily : { ...EMPTY.daily, date: key }
}

function withChallengeCheck(state, key) {
  if (state.challengesDone.includes(key)) return state
  const { done } = challengeStatus(dailyChallenge(key), state.daily)
  return done ? { ...state, challengesDone: [...state.challengesDone, key].slice(-120) } : state
}

export function ActivityProvider({ children }) {
  const [stored, setStored] = useLocalStorage('playverse:activity', EMPTY)
  const activity = useMemo(() => normalize(stored), [stored])

  const update = useCallback((fn) => setStored((prev) => fn(normalize(prev))), [setStored])

  const recordSession = useCallback(
    (gameId) =>
      update((s) => {
        const key = dayKey()
        return {
          ...s,
          sessions: { ...s.sessions, [gameId]: (s.sessions[gameId] ?? 0) + 1 },
          recent: [{ id: gameId, at: Date.now() }, ...s.recent.filter((r) => r.id !== gameId)].slice(0, 8),
          days: s.days.includes(key) ? s.days : [...s.days, key].slice(-120),
        }
      }),
    [update],
  )

  const recordResult = useCallback(
    (gameId, score) =>
      update((s) => {
        const key = dayKey()
        const lower = getGame(gameId)?.score?.lowerIsBetter
        const daily = todaysDaily(s, key)
        const prevDaily = daily[gameId]
        const better = prevDaily == null || (lower ? score < prevDaily : score > prevDaily)
        const runs = [...(s.history[gameId] ?? []), { score, at: Date.now() }].slice(-50)
        return withChallengeCheck(
          {
            ...s,
            history: { ...s.history, [gameId]: runs },
            daily: better ? { ...daily, [gameId]: score } : daily,
          },
          key,
        )
      }),
    [update],
  )

  const recordTicTacToe = useCallback(
    (outcome) =>
      update((s) => {
        const key = dayKey()
        const daily = todaysDaily(s, key)
        return withChallengeCheck(
          {
            ...s,
            ttt: { ...s.ttt, [outcome]: s.ttt[outcome] + 1 },
            daily: outcome === 'win' ? { ...daily, tttWins: daily.tttWins + 1 } : daily,
          },
          key,
        )
      }),
    [update],
  )

  const setPlayerName = useCallback(
    (name) => update((s) => ({ ...s, playerName: name.trim().slice(0, 24) || EMPTY.playerName })),
    [update],
  )

  const resetActivity = useCallback(
    () => setStored((prev) => ({ ...EMPTY, playerName: normalize(prev).playerName })),
    [setStored],
  )

  const value = useMemo(
    () => ({ activity, recordSession, recordResult, recordTicTacToe, setPlayerName, resetActivity }),
    [activity, recordSession, recordResult, recordTicTacToe, setPlayerName, resetActivity],
  )

  return <ActivityContext.Provider value={value}>{children}</ActivityContext.Provider>
}
