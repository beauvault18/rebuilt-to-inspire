/**
 * Build a YouTube search URL for an exercise name.
 * Opens search results — no API key needed.
 */
export function youtubeSearchUrl(exerciseName: string): string {
  const query = encodeURIComponent(`${exerciseName} form tutorial`);
  return `https://www.youtube.com/results?search_query=${query}`;
}

/**
 * Build a YouTube embed URL that plays search results for an exercise.
 * Uses the listType=search embed parameter.
 */
export function youtubeEmbedSearchUrl(exerciseName: string): string {
  const query = encodeURIComponent(`${exerciseName} form tutorial`);
  return `https://www.youtube.com/embed?listType=search&list=${query}`;
}
