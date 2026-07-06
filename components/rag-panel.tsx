"use client"

import { useState, useEffect, useCallback } from "react"
import { Upload, Trash2, FileText, ToggleLeft, ToggleRight } from "lucide-react"
import { cn } from "@/lib/utils"

type DocItem = { filename: string; mtime: number }

type Props = {
  ragEnabled: boolean
  onRagToggle: (enabled: boolean) => void
}

export function RagPanel({ ragEnabled, onRagToggle }: Props) {
  const [docs, setDocs] = useState<DocItem[]>([])
  const [uploading, setUploading] = useState(false)
  const [chunkCount, setChunkCount] = useState(0)

  const fetchDocs = useCallback(async () => {
    try {
      const res = await fetch("/api/documents")
      if (!res.ok) return
      const data = await res.json()
      if (Array.isArray(data)) setDocs(data)
    } catch {
      // silent
    }
  }, [])

  const fetchChunkCount = useCallback(async () => {
    try {
      const res = await fetch("/api/documents?chunks=true")
      if (!res.ok) return
      const data = await res.json()
      setChunkCount(data.chunkCount ?? 0)
    } catch {
      // silent
    }
  }, [])

  useEffect(() => {
    fetchDocs()
    fetchChunkCount()
  }, [fetchDocs, fetchChunkCount])

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    const form = new FormData()
    form.append("file", file)

    try {
      const res = await fetch("/api/documents", { method: "POST", body: form })
      if (res.ok) {
        await fetchDocs()
        await fetchChunkCount()
      }
    } catch {
      // silent
    } finally {
      setUploading(false)
      e.target.value = ""
    }
  }

  const handleDelete = async (filename: string) => {
    try {
      const res = await fetch("/api/documents", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filename }),
      })
      if (res.ok) {
        setDocs((prev) => prev.filter((d) => d.filename !== filename))
        await fetchChunkCount()
      }
    } catch {
      // silent
    }
  }

  return (
    <div className="px-3 py-3 border-t border-border/40 space-y-3">
      {/* RAG toggle */}
      <button
        onClick={() => onRagToggle(!ragEnabled)}
        className="flex items-center gap-2 w-full text-left group"
      >
        {ragEnabled ? (
          <ToggleRight className="size-5 text-emerald-400" />
        ) : (
          <ToggleLeft className="size-5 text-zinc-600 group-hover:text-zinc-400 transition-colors" />
        )}
        <span
          className={cn(
            "text-xs font-medium transition-colors",
            ragEnabled ? "text-emerald-400" : "text-zinc-500 group-hover:text-zinc-400"
          )}
        >
          RAG {ragEnabled ? "ON" : "OFF"}
        </span>
        {ragEnabled && chunkCount > 0 && (
          <span className="text-[10px] text-zinc-600 ml-auto">
            {chunkCount} chunks
          </span>
        )}
      </button>

      {/* upload button */}
      <label
        className={cn(
          "flex items-center justify-center gap-2 w-full py-2 rounded-lg border border-dashed cursor-pointer transition-colors text-xs",
          "border-zinc-700/60 text-zinc-500 hover:border-zinc-600 hover:text-zinc-300",
          uploading && "opacity-50 pointer-events-none"
        )}
      >
        <Upload className="size-3.5" />
        {uploading ? "Uploading..." : "Upload document"}
        <input
          type="file"
          accept=".txt,.md,.csv,.json"
          onChange={handleUpload}
          className="hidden"
          disabled={uploading}
        />
      </label>

      {/* document list */}
      {docs.length > 0 && (
        <div className="space-y-1 max-h-40 overflow-y-auto">
          {docs.map((doc) => (
            <div
              key={doc.filename}
              className="flex items-center gap-2 px-2 py-1.5 rounded-md group/item hover:bg-zinc-800/60 transition-colors"
            >
              <FileText className="size-3 text-zinc-600 shrink-0" />
              <span className="text-xs text-zinc-400 truncate flex-1">
                {doc.filename}
              </span>
              <button
                onClick={() => handleDelete(doc.filename)}
                className="opacity-0 group-hover/item:opacity-100 transition-opacity shrink-0"
                title="Delete document"
              >
                <Trash2 className="size-3 text-zinc-600 hover:text-red-400 transition-colors" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
