import AsyncStorage from '@react-native-async-storage/async-storage';
import { addDaysLocal, getLocalISODate, parseLocalISODate } from '../utils/date';

const COMPLETIONS_KEY = 'focusTimer:completionsByDate:v1';
const STREAK_KEY = 'focusTimer:streakState:v1';

function safeParseJson(value, fallback) {
  try {
    if (value == null) return fallback;
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

async function readCompletionsByDate() {
  const raw = await AsyncStorage.getItem(COMPLETIONS_KEY);
  return safeParseJson(raw, {});
}

async function writeCompletionsByDate(map) {
  await AsyncStorage.setItem(COMPLETIONS_KEY, JSON.stringify(map));
}

async function readStreakState() {
  const raw = await AsyncStorage.getItem(STREAK_KEY);
  return safeParseJson(raw, null);
}

async function writeStreakState(state) {
  await AsyncStorage.setItem(STREAK_KEY, JSON.stringify(state));
}

function computeSummary(completionsByDate, streakState) {
  const todayStr = getLocalISODate();
  const completions = completionsByDate ?? {};
  const totalSessions = Object.values(completions).reduce((sum, v) => sum + (Number(v) || 0), 0);
  const todaySessions = Number(completions[todayStr] || 0);
  const streakCount = Number(streakState?.streakCount || 0);
  const lastCompletionDate = streakState?.lastCompletionDate || null;
  return {
    completionsByDate: completions,
    totalSessions,
    todaySessions,
    todayStr,
    completedToday: todaySessions > 0,
    streakCount,
    lastCompletionDate,
  };
}

function computeNextStreakForDate({ streakState, completionDateStr }) {
  if (!streakState || !streakState.lastCompletionDate) {
    return { streakCount: 1, lastCompletionDate: completionDateStr };
  }

  if (streakState.lastCompletionDate === completionDateStr) {
    return streakState;
  }

  const lastDate = parseLocalISODate(streakState.lastCompletionDate);
  const expectedNextDate = getLocalISODate(addDaysLocal(lastDate, 1));
  if (completionDateStr === expectedNextDate) {
    return { streakCount: (Number(streakState.streakCount) || 0) + 1, lastCompletionDate: completionDateStr };
  }

  return { streakCount: 1, lastCompletionDate: completionDateStr };
}

export async function getFocusTimerSummary() {
  const completionsByDate = await readCompletionsByDate();
  const streakState = await readStreakState();
  return computeSummary(completionsByDate, streakState);
}

export async function recordFocusCompletion(completionDate = new Date()) {
  const completionDateStr = getLocalISODate(completionDate);

  const completionsByDate = await readCompletionsByDate();
  const nextCompletionsByDate = { ...completionsByDate };
  nextCompletionsByDate[completionDateStr] = Number(nextCompletionsByDate[completionDateStr] || 0) + 1;
  await writeCompletionsByDate(nextCompletionsByDate);

  const streakState = await readStreakState();
  const nextStreakState = computeNextStreakForDate({ streakState, completionDateStr });
  await writeStreakState(nextStreakState);

  return computeSummary(nextCompletionsByDate, nextStreakState);
}

export async function resetFocusTimerData() {
  await AsyncStorage.removeItem(COMPLETIONS_KEY);
  await AsyncStorage.removeItem(STREAK_KEY);
  return getFocusTimerSummary();
}

