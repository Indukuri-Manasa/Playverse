import { useContext } from 'react'
import { ActivityContext } from '../context/activityContext'

export function useActivity() {
  const ctx = useContext(ActivityContext)
  if (!ctx) throw new Error('useActivity must be used inside <ActivityProvider>')
  return ctx
}
