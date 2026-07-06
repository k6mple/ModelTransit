import fs from "fs"
import path from "path"

/* ── types ──────────────────────────────────────────── */
export interface Chunk {
  content: string
  source: string
  chunkIndex: number
}

interface DocMeta {
  filename: string
  mtime: number
}

/* ── config ─────────────────────────────────────────── */
const DOCS_DIR = path.join(process.cwd(), "data", "documents")
const CHUNK_SIZE = 500
const CHUNK_OVERLAP = 50

/* ── text splitter ──────────────────────────────────── */
function splitText(text: string, source: string): Chunk[] {
  const chunks: Chunk[] = []
  // split on double-newline first, then single newline, then sentence boundaries
  const paragraphs = text
    .split(/\n\n+/)
    .flatMap((p) => p.split(/\n/))
    .flatMap((s) => s.split(/(?<=[。！？.!?])\s*/))

  const merged: string[] = []
  let current = ""

  for (const seg of paragraphs) {
    const trimmed = seg.trim()
    if (!trimmed) continue
    if (current.length + trimmed.length > CHUNK_SIZE && current.length > 0) {
      merged.push(current.trim())
      current = ""
    }
    current += (current ? " " : "") + trimmed
  }
  if (current.trim()) merged.push(current.trim())

  // add overlap
  for (let i = 0; i < merged.length; i++) {
    let content = merged[i]
    if (i > 0) {
      const prev = merged[i - 1]
      const overlap = prev.slice(-CHUNK_OVERLAP)
      content = overlap + " " + content
    }
    chunks.push({ content, source, chunkIndex: i })
  }

  return chunks
}

/* ── document store ─────────────────────────────────── */
function ensureDir() {
  if (!fs.existsSync(DOCS_DIR)) {
    fs.mkdirSync(DOCS_DIR, { recursive: true })
  }
}

export function listDocuments(): DocMeta[] {
  ensureDir()
  return fs.readdirSync(DOCS_DIR).map((f) => {
    const stat = fs.statSync(path.join(DOCS_DIR, f))
    return { filename: f, mtime: stat.mtimeMs }
  })
}

export function readDocument(filename: string): string | null {
  const p = path.join(DOCS_DIR, filename)
  if (!fs.existsSync(p)) return null
  return fs.readFileSync(p, "utf-8")
}

export function saveDocument(filename: string, content: string): void {
  ensureDir()
  fs.writeFileSync(path.join(DOCS_DIR, filename), content, "utf-8")
}

export function deleteDocument(filename: string): boolean {
  const p = path.join(DOCS_DIR, filename)
  if (!fs.existsSync(p)) return false
  fs.unlinkSync(p)
  return true
}

/* ── chunk index ────────────────────────────────────── */
let chunkCache: Chunk[] | null = null
let cacheKey = ""

function getAllChunks(): Chunk[] {
  const docs = listDocuments()
  const key = docs.map((d) => `${d.filename}:${d.mtime}`).join("|")

  if (chunkCache && key === cacheKey) return chunkCache

  const chunks: Chunk[] = []
  for (const doc of docs) {
    const content = readDocument(doc.filename)
    if (content) {
      chunks.push(...splitText(content, doc.filename))
    }
  }

  chunkCache = chunks
  cacheKey = key
  return chunks
}

export function invalidateCache() {
  chunkCache = null
  cacheKey = ""
}

/* ── keyword retriever ──────────────────────────────── */

// simple TF-IDF inspired scoring
function termFrequency(term: string, text: string): number {
  const regex = new RegExp(term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi")
  const matches = text.match(regex)
  return matches ? matches.length / Math.max(text.split(/\s+/).length, 1) : 0
}

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\w一-鿿]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 1)
}

export function retrieveChunks(query: string, topK: number = 4): Chunk[] {
  const chunks = getAllChunks()
  if (chunks.length === 0) return []

  const queryTokens = tokenize(query)
  if (queryTokens.length === 0) return []

  // IDF-like: how many chunks contain each token
  const docFreq = new Map<string, number>()
  for (const t of queryTokens) {
    let count = 0
    for (const c of chunks) {
      if (c.content.toLowerCase().includes(t)) count++
    }
    docFreq.set(t, count)
  }

  const N = chunks.length

  const scored = chunks.map((c) => {
    let score = 0
    const lower = c.content.toLowerCase()
    for (const t of queryTokens) {
      const tf = termFrequency(t, c.content)
      const df = docFreq.get(t) || 1
      const idf = Math.log((N - df + 0.5) / (df + 0.5) + 1)
      // bonus for exact phrase match
      const phraseBonus = lower.includes(query.toLowerCase()) ? 2 : 0
      score += tf * idf + phraseBonus
    }
    return { chunk: c, score }
  })

  scored.sort((a, b) => b.score - a.score)

  const seen = new Set<string>()
  const result: Chunk[] = []
  for (const { chunk, score } of scored) {
    if (score <= 0) continue
    const dedupeKey = chunk.source + chunk.content.slice(0, 40)
    if (seen.has(dedupeKey)) continue
    seen.add(dedupeKey)
    result.push(chunk)
    if (result.length >= topK) break
  }

  return result
}

export function retrieveContext(query: string, topK: number = 4): string {
  const chunks = retrieveChunks(query, topK)
  if (chunks.length === 0) return ""

  return chunks
    .map(
      (c, i) =>
        `[来源${i + 1}: ${c.source}]\n${c.content}`
    )
    .join("\n\n")
}

export function getChunkCount(): number {
  return getAllChunks().length
}
