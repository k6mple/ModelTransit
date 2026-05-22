"use client"

import { useState } from "react"
import { MessageSquarePlus, Trash2, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuAction,
} from "@/components/ui/sidebar"

export type ChatHistoryItem = {
  id: string
  title: string
  date: string
}

type AppSidebarProps = {
  history: ChatHistoryItem[]
  activeId: string | null
  onSelect: (id: string) => void
  onNew: () => void
  onDelete: (id: string) => void
}

export function AppSidebar({
  history,
  activeId,
  onSelect,
  onNew,
  onDelete,
}: AppSidebarProps) {
  return (
    <Sidebar
      collapsible="icon"
      variant="sidebar"
      className="border-r border-border/40"
    >
      <SidebarHeader className="px-3 py-4">
        <SidebarMenuButton
          size="lg"
          onClick={onNew}
          className="w-full justify-start gap-3 bg-zinc-800/80 hover:bg-zinc-700/80 border border-zinc-700/60 rounded-xl transition-colors"
        >
          <MessageSquarePlus className="size-5 text-emerald-400" />
          <span className="font-semibold text-sm">New Chat</span>
        </SidebarMenuButton>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs uppercase tracking-wider text-zinc-500 px-2">
            Chat History
          </SidebarGroupLabel>

          {history.length === 0 ? (
            <p className="px-3 py-6 text-xs text-zinc-600 text-center">
              No conversations yet
            </p>
          ) : (
            <SidebarMenu>
              {history.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    onClick={() => onSelect(item.id)}
                    isActive={item.id === activeId}
                    className={cn(
                      "group/item justify-start gap-3 rounded-lg transition-colors",
                      item.id === activeId
                        ? "bg-zinc-800 text-zinc-100"
                        : "text-zinc-400 hover:bg-zinc-800/60 hover:text-zinc-200"
                    )}
                  >
                    <ChevronRight
                      className={cn(
                        "size-3.5 transition-transform shrink-0",
                        item.id === activeId && "text-emerald-400"
                      )}
                    />
                    <div className="flex flex-col items-start min-w-0">
                      <span className="truncate text-sm font-medium w-full">
                        {item.title}
                      </span>
                      <span className="text-[10px] text-zinc-600">
                        {item.date}
                      </span>
                    </div>
                  </SidebarMenuButton>
                  <SidebarMenuAction
                    onClick={() => onDelete(item.id)}
                    className="opacity-0 group-hover/item:opacity-100 transition-opacity"
                    title="Delete chat"
                  >
                    <Trash2 className="size-3.5 text-zinc-500 hover:text-red-400" />
                  </SidebarMenuAction>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          )}
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="px-3 py-3 border-t border-border/40">
        <p className="text-[10px] text-zinc-600 text-center font-mono">
          AI Transfer v0.1
        </p>
      </SidebarFooter>
    </Sidebar>
  )
}
