export const AI_WORDS: Record<number, string[]> = {
  4: [
    "GAME", "PLAY", "MIND", "WORD", "CODE", "BLUE", "RED", "TEAM", "DUEL", "FAST",
    "DARK", "GLOW", "CORE", "BASE", "OPEN", "JOIN", "WINS", "STAR", "FIRE", "WIND"
  ],
  5: [
    "MATCH", "GUESS", "ARENA", "SMART", "LEVEL", "SCORE", "BRAIN", "THINK", "START", "ENTER",
    "CLICK", "FLUID", "GLASS", "POWER", "FORCE", "LIGHT", "SPACE", "PIXEL", "DREAM", "WORLD"
  ],
  6: [
    "PLAYER", "GAMING", "BATTLE", "LEGEND", "MASTER", "STRIKE", "FUTURE", "COSMOS", "STREAM", "ACTIVE",
    "REWARD", "SHIELDS", "CRYPTO", "SYSTEM", "LOGINS", "SEARCH", "HIDDEN", "WINNER", "FRIEND", "VERSUS"
  ]
};

export const getRandomAIWord = (length: number): string => {
  const words = AI_WORDS[length] || AI_WORDS[5];
  return words[Math.floor(Math.random() * words.length)];
};
