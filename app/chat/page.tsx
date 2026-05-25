"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar, type ChatHistoryItem } from "@/components/app-sidebar"
import { InputInline } from "@/components/ui/InputInline"
import { SelectBox } from "@/components/ui/SelectBox"
import { NavigationMenuDemo } from "@/components/ui/NavigationMenu"
import { PanelLeftOpen } from "lucide-react"
import { v4 as uuidv4 } from 'uuid';
import Link from "next/link"

/* ── types ────────────────────────────────────────── */
type Role = "system" | "user" | "assistant"
type Message = { role: Role; content: string }

const SYSTEM_PROMPT: Message = {
  role: "system",
  content: "You are a helpful assistant",
}

/* ── helpers ──────────────────────────────────────── */
//
const fmtDate = (d: Date) =>
  d.toLocaleDateString("zh-CN", { month: "short", day: "numeric" })

/* ── ChatPage ─────────────────────────────────────── */
export default function ChatPage() {
  /* ---------- state ---------- */
  const [input, setInput] = useState("")
  const [selectVal, setSelectVal] = useState("")
  const [messages, setMessages] = useState<Message[]>([SYSTEM_PROMPT])
  const [streaming, setStreaming] = useState(false)

  // sidebar / history
  const [history, setHistory] = useState<ChatHistoryItem[]>([])
  const [activeChatId, setActiveChatId] = useState<string | null>(null)

  /* ---------- refs ---------- */
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const abortRef = useRef<AbortController | null>(null)

  /* ---------- derived ---------- */
  const displayMessages = messages.filter((m) => m.role !== "system")
  const isEmpty = displayMessages.length === 0

  /* ---------- auto-scroll ---------- */
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [])
  
  //always scroll to bottom following messages
  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

  //fetch history chat on mounted
  useEffect(() => {
    async function fetchHistory(){
      const getHistory = await fetch("/api/chat", { method:"GET" })
      const data = await getHistory.json()
      if(!data) return
      setHistory(data)
    }
    fetchHistory()
  }, [])

  //fetch messages when active chat id changes
  useEffect(() => {
    async function fetchMessages(){
      const getMessages = await fetch(`/api/chat?chatId=${activeChatId}`, { 
        method:"GET"
      })
      const data = await getMessages.json()
      if(!data) return
      setMessages(data)
    }
    fetchMessages() 
  },[activeChatId])
  /* ---------- new chat ---------- */
  const handleNewChat = useCallback(() => {
    setMessages([SYSTEM_PROMPT])
    setInput("")
    setActiveChatId(null)
  }, [])

  /* ---------- delete history item ---------- */
  const handleDelete = useCallback((id: string) => {
    setHistory((prev) => prev.filter((h) => h.id !== id))
    if (id === activeChatId) {
      handleNewChat()
    }
  }, [activeChatId, handleNewChat])

  /* ---------- send message ---------- */
  async function sendMessage() {
    let isNewChat = false
    let chatId = activeChatId
    if (!input.trim() || streaming) return

    // start a new history entry if this is a new chat
    if (messages.length <= 1) {
      isNewChat = true
      chatId = uuidv4()
      setActiveChatId(chatId)
      const title = input.slice(0, 40) + (input.length > 40 ? "…" : "")
      const newHistoryItem = {
        id: chatId,
        title: title,
        date: fmtDate(new Date())
      }
      setHistory((prev) => [
        newHistoryItem,
        ...prev,
      ])
    }

    const userMessage: Message = { role: "user", content: input }
    const newMessages = [...messages, userMessage]
    setMessages(newMessages)
    setInput("")
    setStreaming(true)

    const controller = new AbortController()
    abortRef.current = controller

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          isNewChat: isNewChat,
          chatId: chatId,
          messages: newMessages,
          model: selectVal,
          date: fmtDate(new Date())
        }),
        signal: controller.signal,
      })

      let fullText = ""
      const reader = res.body?.getReader()
      if (!reader) return

      const decoder = new TextDecoder()
      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value)
        fullText += chunk
        setMessages([
          ...newMessages,
          { role: "assistant", content: fullText },
        ])
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name === "AbortError") return
      console.error("Stream error:", err)
      setMessages([
        ...newMessages,
        {
          role: "assistant",
          content: "⚠️ Something went wrong. Please try again.",
        },
      ])
    } finally {
      setStreaming(false)
    }
  }

  /* ── JSX ─────────────────────────────────────────── */
  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex h-screen w-full overflow-hidden bg-background">
        {/* ── Sidebar ─────────────────────────────── */}
        <AppSidebar
          history={history}
          activeId={activeChatId}
          onSelect={(id) => {setActiveChatId(id)}}
          onNew={handleNewChat}
          onDelete={handleDelete}
        />

        {/* ── Main ─────────────────────────────────── */}
        <main className="flex flex-1 flex-col min-w-0 h-screen">
          {/* ▸ nav bar — fixed at top */}
          <header className="sticky top-0 z-20 flex items-center gap-3 px-4 py-2.5 border-b border-border/30 bg-background/80 backdrop-blur-md">
            <SidebarTrigger className="size-9 hover:bg-zinc-800 rounded-lg transition-colors">
              <PanelLeftOpen className="size-5 text-zinc-400" />
            </SidebarTrigger>

            <div className="flex-1 flex items-center justify-between">
              <NavigationMenuDemo />

              <Link href="/login">
                <button className="bg-white text-black rounded-full w-20 h-10 font-semibold">Sign in</button>
              </Link>
            </div>
          </header>

          {/* ▸ chat body */}
          {isEmpty ? (
            /* ─── empty-state: everything centered ─── */
            <div className="flex flex-1 flex-col items-center justify-center gap-6 px-4">
              <div className="flex flex-col items-center gap-2">
                <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                  Jane returns!
                </h1>
                <p className="text-sm text-zinc-500 font-mono">
                  Your AI copilot
                </p>
              </div>

              <div className="w-full max-w-xl">
                <InputInline
                  input={input}
                  setInput={setInput}
                  sendMessage={sendMessage}
                />
              </div>

              <div className="flex items-center gap-3">
                <span className="text-[10px] text-zinc-600 font-mono uppercase tracking-widest">
                  Model
                </span>
                <SelectBox value={selectVal} onChange={setSelectVal} />
              </div>
            </div>
          ) : (
            /* ─── chat-state: messages + bottom input ─── */
            <div className="flex flex-1 flex-col min-h-0">
              {/* scrollable messages */}
              <div className="flex-1 overflow-y-auto px-4 py-6">
                <div className="mx-auto max-w-3xl space-y-6">
                  {displayMessages.map((msg, i) => (
                    <div
                      key={i}
                      className={`flex ${
                        msg.role === "user" ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[80%] rounded-2xl px-5 py-3 text-sm leading-relaxed ${
                          msg.role === "user"
                            ? "bg-zinc-700 text-zinc-100 rounded-br-md"
                            : "bg-zinc-800/80 text-zinc-200 rounded-bl-md border border-zinc-700/40"
                        }`}
                      >
                        <p className="whitespace-pre-wrap break-words">
                          {msg.content}
                        </p>
                      </div>
                    </div>
                  ))}

                  {streaming && (
                    <div className="flex justify-start">
                      <div className="bg-zinc-800/80 border border-zinc-700/40 rounded-2xl rounded-bl-md px-5 py-3">
                        <span className="inline-flex gap-1">
                          <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse [animation-delay:0.15s]" />
                          <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse [animation-delay:0.3s]" />
                        </span>
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>
              </div>

              {/* sticky bottom input area */}
              <div className="sticky bottom-0 z-10 border-t border-border/30 bg-gradient-to-t from-background via-background/98 to-background/60 backdrop-blur-md px-4 py-4">
                <div className="mx-auto max-w-3xl flex items-end gap-3">
                  <div className="flex-1">
                    <InputInline
                      input={input}
                      setInput={setInput}
                      sendMessage={sendMessage}
                    />
                  </div>
                  <SelectBox value={selectVal} onChange={setSelectVal} />
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </SidebarProvider>
  )
}
