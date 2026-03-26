"use client"

import * as React from "react"
import { Command as CommandPrimitive } from "cmdk"
import { Search, Zap, Bell, Webhook, Key, FileText, Settings, ArrowRight, Keyboard } from "lucide-react"
import { cn } from "../utils"
import { Dialog, DialogContent } from "./dialog"

export interface CommandAction {
  id: string
  label: string
  description?: string
  icon?: React.ComponentType<{ className?: string }>
  group: string
  keywords?: string[]
  shortcut?: string[]
  onSelect: () => void
}

interface CommandPaletteProps {
  actions: CommandAction[]
  open?: boolean
  onOpenChange?: (open: boolean) => void
  placeholder?: string
  accentColor?: string
  brandName?: string
}

export function CommandPalette({
  actions,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
  placeholder = "Search commands...",
  accentColor = "#6366f1",
  brandName,
}: CommandPaletteProps) {
  const [internalOpen, setInternalOpen] = React.useState(false)
  const open = controlledOpen ?? internalOpen
  const setOpen = controlledOnOpenChange ?? setInternalOpen

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen(!open)
      }
    }
    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [open, setOpen])

  const groups = React.useMemo(() => {
    const grouped = new Map<string, CommandAction[]>()
    for (const action of actions) {
      const existing = grouped.get(action.group) || []
      existing.push(action)
      grouped.set(action.group, existing)
    }
    return grouped
  }, [actions])

  const handleSelect = React.useCallback((action: CommandAction) => {
    action.onSelect()
    setOpen(false)
  }, [setOpen])

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-sm text-gray-400 hover:bg-white/10 hover:text-gray-300 transition-all group"
      >
        <Search className="w-3.5 h-3.5" />
        <span className="text-xs">Search</span>
        <kbd className="hidden lg:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-[10px] text-gray-500 font-mono ml-2">
          <span className="text-[9px]">⌘</span>K
        </kbd>
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="overflow-hidden p-0 max-w-[640px] bg-[#0f0f23]/95 backdrop-blur-xl border-white/10 shadow-2xl">
          <CommandPrimitive
            className="flex h-full w-full flex-col overflow-hidden text-white"
            loop
          >
            <div className="flex items-center gap-3 px-4 border-b border-white/10">
              <Search className="w-4 h-4 text-gray-500 shrink-0" />
              <CommandPrimitive.Input
                placeholder={placeholder}
                className="flex-1 h-12 bg-transparent text-sm text-white placeholder:text-gray-500 outline-none"
              />
              {brandName && (
                <span className="text-[10px] font-mono text-gray-600 tracking-wider shrink-0">{brandName}</span>
              )}
            </div>

            <CommandPrimitive.List className="max-h-[400px] overflow-y-auto p-2">
              <CommandPrimitive.Empty className="py-8 text-center text-sm text-gray-500">
                No commands found.
              </CommandPrimitive.Empty>

              {Array.from(groups.entries()).map(([group, items]) => (
                <CommandPrimitive.Group
                  key={group}
                  heading={group}
                  className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider [&_[cmdk-group-heading]]:text-gray-500"
                >
                  {items.map((action) => {
                    const Icon = action.icon || ArrowRight
                    return (
                      <CommandPrimitive.Item
                        key={action.id}
                        value={`${action.label} ${action.description || ""} ${action.keywords?.join(" ") || ""}`}
                        onSelect={() => handleSelect(action)}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer text-gray-300 data-[selected=true]:bg-white/10 data-[selected=true]:text-white transition-colors group/item"
                      >
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors"
                          style={{
                            background: `${accentColor}15`,
                            color: accentColor,
                          }}
                        >
                          <Icon
                            className="w-4 h-4 transition-colors"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{action.label}</p>
                          {action.description && (
                            <p className="text-xs text-gray-500 truncate">{action.description}</p>
                          )}
                        </div>
                        {action.shortcut && (
                          <div className="flex items-center gap-0.5 shrink-0">
                            {action.shortcut.map((key, i) => (
                              <kbd
                                key={i}
                                className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-[10px] text-gray-500 font-mono"
                              >
                                {key}
                              </kbd>
                            ))}
                          </div>
                        )}
                      </CommandPrimitive.Item>
                    )
                  })}
                </CommandPrimitive.Group>
              ))}
            </CommandPrimitive.List>

            <div className="flex items-center justify-between px-4 py-2 border-t border-white/10">
              <div className="flex items-center gap-3 text-[10px] text-gray-600">
                <span className="flex items-center gap-1">
                  <kbd className="px-1 py-0.5 rounded bg-white/5 border border-white/10 text-[9px] font-mono">↵</kbd>
                  select
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1 py-0.5 rounded bg-white/5 border border-white/10 text-[9px] font-mono">↑↓</kbd>
                  navigate
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1 py-0.5 rounded bg-white/5 border border-white/10 text-[9px] font-mono">esc</kbd>
                  close
                </span>
              </div>
              <span className="flex items-center gap-1 text-[10px] text-gray-600">
                <Keyboard className="w-3 h-3" /> Command Palette
              </span>
            </div>
          </CommandPrimitive>
        </DialogContent>
      </Dialog>
    </>
  )
}

export function useAppCommands(navigate: (path: string) => void, appDomain?: string) {
  const commands: CommandAction[] = React.useMemo(() => {
    const nav: CommandAction[] = [
      { id: "nav-dashboard", label: "Go to Dashboard", description: "Main overview", icon: Settings, group: "Navigation", keywords: ["home", "main"], shortcut: ["G", "D"], onSelect: () => navigate("/") },
      { id: "nav-extensions", label: "Go to Extensions", description: "Premium features and tools", icon: Zap, group: "Navigation", keywords: ["premium", "tools", "automation"], shortcut: ["G", "E"], onSelect: () => navigate("/extensions") },
      { id: "nav-import", label: "Go to Import Center", description: "Import data from external sources", icon: FileText, group: "Navigation", keywords: ["upload", "data", "csv"], shortcut: ["G", "I"], onSelect: () => navigate("/import") },
    ]

    const ext: CommandAction[] = [
      { id: "ext-automation", label: "Automation Rules", description: "Create and manage workflow automations", icon: Zap, group: "Extensions", keywords: ["workflow", "trigger", "action", "automate"], onSelect: () => navigate("/extensions") },
      { id: "ext-webhooks", label: "Webhook Manager", description: "Configure event-driven webhooks", icon: Webhook, group: "Extensions", keywords: ["events", "http", "callback", "endpoint"], onSelect: () => navigate("/extensions") },
      { id: "ext-notifications", label: "Notification Center", description: "View alerts and notifications", icon: Bell, group: "Extensions", keywords: ["alerts", "messages", "inbox"], onSelect: () => navigate("/extensions") },
      { id: "ext-api-keys", label: "Developer API Keys", description: "Manage API keys and access", icon: Key, group: "Extensions", keywords: ["developer", "token", "api", "key", "access"], onSelect: () => navigate("/extensions") },
    ]

    return [...nav, ...ext]
  }, [navigate])

  return commands
}
