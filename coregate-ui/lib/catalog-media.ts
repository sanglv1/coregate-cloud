/** Mỗi dòng một URL ảnh demo. */
export function parseImageUrlLines(text: string): string[] {
  return text
    .split(/[\n,]+/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0 && /^https?:\/\//i.test(line));
}

export function formatImageUrlLines(urls: string[] | undefined): string {
  return (urls ?? []).join('\n');
}
