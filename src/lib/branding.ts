import { isNativePlatform } from './platform';

export const getBrandName = () => isNativePlatform() ? 'MindMatch' : 'GuessingDuel';
export const getActionName = () => isNativePlatform() ? 'Match' : 'Duel';
export const getActionLower = () => isNativePlatform() ? 'match' : 'duel';
export const getAppTitle = () => isNativePlatform() ? 'MindMatch' : 'GuessingDuel';
