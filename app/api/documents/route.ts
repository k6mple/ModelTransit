import { NextResponse } from "next/server"
import { listDocuments, saveDocument, deleteDocument, invalidateCache, getChunkCount } from "@/lib/rag"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  if (searchParams.get("chunks") === "true") {
    return NextResponse.json({ chunkCount: getChunkCount() })
  }

  try {
    const docs = listDocuments()
    return NextResponse.json(docs)
  } catch (error) {
    console.error("Failed to list documents", error)
    return NextResponse.json([], { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData()
    const file = formData.get("file") as File | null
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    const filename = file.name
    const content = await file.text()

    saveDocument(filename, content)
    invalidateCache()

    return NextResponse.json({ success: true, filename })
  } catch (error) {
    console.error("Failed to upload document", error)
    return NextResponse.json({ error: "Upload failed" }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  try {
    const { filename } = await req.json()
    if (!filename) {
      return NextResponse.json({ error: "No filename provided" }, { status: 400 })
    }

    const deleted = deleteDocument(filename)
    if (deleted) invalidateCache()

    return NextResponse.json({ success: deleted })
  } catch (error) {
    console.error("Failed to delete document", error)
    return NextResponse.json({ error: "Delete failed" }, { status: 500 })
  }
}
