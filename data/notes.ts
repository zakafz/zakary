export type Note = {
  id: string;
  project_id: string | null;
  title: string;
  body: string;
  tags: string[];
  pinned: boolean;
  created_at: string;
  updated_at: string;
};

const HTML_TAG = /<[^>]+>/g;
const NBSP = /&nbsp;/g;
const WHITESPACE = /\s+/g;

/** The note body is stored as HTML; this flattens it to searchable text. */
export function notePlainText(body: string): string {
  return body
    .replace(HTML_TAG, " ")
    .replace(NBSP, " ")
    .replace(WHITESPACE, " ")
    .trim();
}

/** First bit of body text, used as a preview snippet under the title. */
export function noteSnippet(note: Note): string {
  return notePlainText(note.body).slice(0, 120);
}

export function noteMatches(note: Note, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) {
    return true;
  }
  return (
    note.title.toLowerCase().includes(q) ||
    notePlainText(note.body).toLowerCase().includes(q) ||
    note.tags.some((t) => t.toLowerCase().includes(q))
  );
}

/** Pinned first, then most-recently updated. */
export function sortNotes(notes: Note[]): Note[] {
  return [...notes].sort((a, b) => {
    if (a.pinned !== b.pinned) {
      return a.pinned ? -1 : 1;
    }
    return b.updated_at.localeCompare(a.updated_at);
  });
}
