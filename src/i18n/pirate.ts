export function generatePirateSummary(
  impact: number,
  aiLeverage: number,
  quality: number
): string {
  const avgScore = (impact + aiLeverage + quality) / 3;

  if (avgScore >= 80) {
    return "Arrr, this code be sailin' smooth as a calm sea! Fine craftsmanship from a true code pirate!";
  }
  if (avgScore >= 60) {
    return "Shiver me timbers, there be some good work here, but the seas could be smoother!";
  }
  if (avgScore >= 40) {
    return "Avast! This PR be needin' some polish before it can sail the high seas!";
  }
  return "Arrr, this code be walkin' the plank! Time to refactor and try again, matey!";
}

export function generateRepoPirateSummary(
  totalScore: number,
  prCount: number
): string {
  if (totalScore >= 80) {
    return `Arrr, this repo be a treasure trove! ${prCount} PRs analyzed, all shining like gold doubloons!`;
  }
  if (totalScore >= 60) {
    return `Shiver me timbers! ${prCount} PRs show promise, but there be room to improve the code waters!`;
  }
  if (totalScore >= 40) {
    return `Avast! ${prCount} PRs be sailin', but many need a captain's touch to reach port!`;
  }
  return `Arrr, ${prCount} PRs be walkin' the plank! This repo needs a serious overhaul, matey!`;
}
