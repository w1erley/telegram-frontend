"use client"

import React, { useState } from "react"
import { cn, formatTime } from "@/lib/utils"
import type { Message } from "@/types/chat"
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu"
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Reply,
  Copy,
  Pin,
  Forward,
  MousePointer,
  Trash2,
  Check,
  Pencil,
} from "lucide-react"

interface ChatMessageProps {
  message: Message
  isIncoming?: boolean
  me: number

  onReply?: (message: Message) => void
  onCopyText?: (message: Message) => void
  onPin?: (message: Message) => void
  onForward?: (message: Message) => void
  onSelect?: (message: Message) => void
  onDelete?: (message: Message) => void
  onEdit?: (message: Message, newBody: string) => void
}

export const ChatMessage = ({
  message,
  isIncoming = false,
  me,
  onReply,
  onCopyText,
  onPin,
  onForward,
  onSelect,
  onDelete,
  onEdit,
}: ChatMessageProps) => {
  const [editOpen, setEditOpen] = useState(false)
  const [editedText, setEditedText] = useState(message.body)

  const handleCopyText = () => {
    if (onCopyText) {
      onCopyText(message)
    } else {
      navigator.clipboard.writeText(message.body)
    }
  }

  const filteredStats = (message.stats || []).filter((s) => s.user_id !== me)
  const hasBeenRead = Array.isArray(filteredStats) && filteredStats.length > 0

  return (
    <>
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <ContextMenu>
          <ContextMenuTrigger asChild>
            <div
              className={cn(
                "flex flex-col mb-2 mx-3",
                isIncoming ? "items-start" : "items-end"
              )}
            >
              {isIncoming && (
                <div className="text-xs font-semibold mb-1 text-muted-foreground">
                  {message.sender?.name}
                </div>
              )}

              <div
                className={cn(
                  "max-w-[80%] rounded-lg px-3 py-2 cursor-pointer hover:opacity-90 transition-opacity relative",
                  isIncoming
                    ? "bg-muted"
                    : "bg-primary text-primary-foreground"
                )}
              >
                <div>{message.body}</div>

                <div
                  className={cn(
                    "flex items-center justify-end space-x-1 mt-1",
                    isIncoming ? "justify-start" : ""
                  )}
                >
                  <span className="text-xs opacity-70">
                    {formatTime(message.created_at)}
                  </span>

                  {!isIncoming && (
                    <span className="flex items-center space-x-0.5">
                      {hasBeenRead ? (
                        <>
                          <Check className="h-4 w-4 text-gray-200" />
                          <Check className="h-4 w-4 text-gray-200" />
                        </>
                      ) : (
                        <Check className="h-4 w-4 text-gray-200" />
                      )}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </ContextMenuTrigger>

          <ContextMenuContent className="w-64">
            {!isIncoming &&
              Array.isArray(message.stats) &&
              message.stats.length > 0 && (
                <>
                  <div className="px-2 py-1 text-xs font-semibold text-muted-foreground">
                    Read by:
                  </div>
                  <div className="flex flex-wrap gap-2 px-2 pb-2">
                    {filteredStats.map((s) => {
                      if (!s?.user?.username || !s?.read_at) return
                      const initial = s.user.username
                        ? s.user.username.charAt(0).toUpperCase()
                        : s.user_id.toString().charAt(0)

                      return (
                        <div
                          key={s.user_id}
                          className="flex flex-col items-center space-y-0.5"
                        >
                          <div className="w-12 h-12 rounded-full bg-foreground flex items-center justify-center text-primary-foreground">
                            {initial}
                          </div>
                          <span>{s.user.username}</span>
                          <div className="text-[10px] text-center text-muted-foreground">
                            {formatTime(s.read_at)}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                  <ContextMenuSeparator />
                </>
              )}

            <ContextMenuItem
              onClick={() => onReply?.(message)}
              disabled={!onReply}
            >
              <Reply className="mr-2 h-4 w-4" />
              Reply
            </ContextMenuItem>

            <ContextMenuItem onClick={handleCopyText}>
              <Copy className="mr-2 h-4 w-4" />
              Copy Text
            </ContextMenuItem>

            <ContextMenuItem
              onClick={() => onPin?.(message)}
              disabled={!onPin}
            >
              <Pin className="mr-2 h-4 w-4" />
              Pin
            </ContextMenuItem>

            <ContextMenuItem
              onClick={() => onForward?.(message)}
              disabled={!onForward}
            >
              <Forward className="mr-2 h-4 w-4" />
              Forward
            </ContextMenuItem>

            <ContextMenuItem
              onClick={() => onSelect?.(message)}
              disabled={!onSelect}
            >
              <MousePointer className="mr-2 h-4 w-4" />
              Select
            </ContextMenuItem>

            {!isIncoming && (
              <ContextMenuItem onClick={() => setEditOpen(true)}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </ContextMenuItem>
            )}

            <ContextMenuSeparator />

            <ContextMenuItem
              onClick={() => onDelete?.(message)}
              className="text-destructive focus:text-destructive"
              disabled={!onDelete || !!isIncoming}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>

        <DialogContent>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              if (onEdit) onEdit(message, editedText.trim())
              setEditOpen(false)
            }}
          >
            <DialogHeader>
              <DialogTitle className={'mb-5'}>Edit Message</DialogTitle>
            </DialogHeader>

            <Input
              value={editedText}
              onChange={(e) => setEditedText(e.target.value)}
              autoFocus
            />

            <DialogFooter className="mt-4">
              <Button type="submit" disabled={!editedText.trim()}>
                Save
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
