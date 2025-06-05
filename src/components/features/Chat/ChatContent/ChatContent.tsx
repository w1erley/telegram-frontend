"use client"

import React, { useEffect, useMemo, useRef, useState } from "react"
import { Virtuoso, VirtuosoHandle } from "react-virtuoso"
import { ChatMessage } from "./ChatMessage/ChatMessage"
import { useApi } from "@/hooks/useApi"
import { useChatStore } from "@/contexts/ChatStoreContext"
import type { ChatSummary, Message, MessageStat } from "@/types/chat"
import {toastError} from "@/lib/utils";

interface Props {
  activeChat: ChatSummary
}

const INITIAL_INDEX = 10_000
const PAGE = 20

export function ChatContent({ activeChat }: Props) {
  const { state, dispatch } = useChatStore()
  const { get, post, del, patch } = useApi()

  console.log("activeChat", activeChat);

  const vRef = useRef<VirtuosoHandle>(null)
  const atBottomRef = useRef(true)

  const prevTrimLenRef = useRef(0)
  const prevScrollLenRef = useRef(0)
  const prevFirstIdxRef = useRef(INITIAL_INDEX)

  const isRestoringScrollRef = useRef(false)

  const [loadingOlder, setLoadingOlder] = useState(false)
  const [firstIndex, setFirstIndex] = useState(INITIAL_INDEX)

  const msgs = useMemo(
    () => state.messages[activeChat.id!] ?? [],
    [state.messages, activeChat.id]
  )

  // щоб не надсилати повторних read-запитів для одного й того ж повідомлення
  const lastMarkedRef = useRef<number | null>(null)

  useEffect(() => {
    const prev = prevTrimLenRef.current
    if (prev && msgs.length < prev) {
      const removed = prev - msgs.length
      setFirstIndex((i) => i + removed)
    }
    prevTrimLenRef.current = msgs.length
  }, [msgs.length])

  useEffect(() => {
    if (!activeChat.id || msgs.length) return

    get<Message[]>(`/chats/${activeChat.id}/messages?limit=${PAGE}`).then((list) => {
      setFirstIndex(INITIAL_INDEX - list.length)
      dispatch({ type: "INIT_HISTORY", chatId: activeChat.id!, list })

      const savedIdx = state.scroll[activeChat.id!] ?? null

      if (savedIdx !== null && list.length > savedIdx) {
        isRestoringScrollRef.current = true

        setTimeout(() => {
          vRef.current?.scrollToIndex({
            index: INITIAL_INDEX - list.length + savedIdx,
            align: "start",
          })

          isRestoringScrollRef.current = false
        }, 0)
      } else {
        setTimeout(() => {
          const lastIdx = list.length - 1
          vRef.current?.scrollToIndex({
            index: INITIAL_INDEX - list.length + lastIdx,
            align: "end",
          })

          if (list.length > 0) {
            markReadUpTo(list[lastIdx].id)
          }
        }, 0)
      }
    })
  }, [activeChat.id])

  const loadOlder = async () => {
    if (!msgs.length) return
    setLoadingOlder(true)

    const older = await get<Message[]>(
      `/chats/${activeChat.id}/messages?before=${msgs[0].id}&limit=${PAGE}`
    )
    setLoadingOlder(false)

    if (!older.length) return

    setFirstIndex((i) => i - older.length)
    dispatch({ type: "PREPEND_OLDER", chatId: activeChat.id!, older })
  }

  const loadNewer = async () => {
    if (!msgs.length) return

    const newer = await get<Message[]>(
      `/chats/${activeChat.id}/messages?after=${msgs[msgs.length - 1].id}&limit=${PAGE}`
    )
    if (!newer.length) return

    dispatch({ type: "APPEND_NEWER", chatId: activeChat.id!, newer })

    const last = newer[newer.length - 1]
    // якщо юзер був унизу або це моє останнє власне повідомлення — скролимо в кінець
    if (atBottomRef.current || last.sender_id === activeChat.me_id) {
      vRef.current?.scrollToIndex({
        index: firstIndex + msgs.length + newer.length - 1,
        align: "end",
      })
    }
  }

  useEffect(() => {
    if (!msgs.length) return
    const lenIncreased = msgs.length > prevScrollLenRef.current
    const firstUnchanged = firstIndex === prevFirstIdxRef.current
    const isAppend = lenIncreased && firstUnchanged

    if (isAppend) {
      const last = msgs[msgs.length - 1]
      if (last.sender_id === activeChat.me_id) {
        vRef.current?.scrollToIndex({
          index: firstIndex + msgs.length - 1,
          align: "end",
        })
      }
    }
    prevScrollLenRef.current = msgs.length
    prevFirstIdxRef.current = firstIndex
  }, [msgs.length, firstIndex, activeChat.me_id])

  const markReadUpTo = (lastId: number) => {
    if (lastMarkedRef.current === lastId) return
    lastMarkedRef.current = lastId
    post(`/chats/${activeChat.id}/messages/${lastId}/read`)
  }

  const onBottomChange = (atBottom: boolean) => {
    atBottomRef.current = atBottom

    if (atBottom && msgs.length && !isRestoringScrollRef.current) {
      markReadUpTo(msgs[msgs.length - 1].id)
    }
  }

  // Коли змінюється кількість або скрол, перевіряємо видимий діапазон
  const onRangeChanged = ({
    startIndex,
    endIndex,
  }: {
    startIndex: number
    endIndex: number
  }) => {
    if (isRestoringScrollRef.current) return

    // Знайдемо індекс останнього видимого повідомлення
    const lastVisibleIndex = endIndex - firstIndex
    if (lastVisibleIndex < 0 || lastVisibleIndex >= msgs.length) return

    const msg = msgs[lastVisibleIndex]
    if (!msg) return

    // Перевіряємо, чи вже є у цього повідомлення статус читання від мене
    const hasMyStat = Array.isArray(msg.stats)
      ? msg.stats.some((s: MessageStat) => s.user_id === activeChat.me_id)
      : false

    if (!hasMyStat) {
      markReadUpTo(msg.id)
    }
  }

  console.log("messages", msgs)

  const components = {
    Header: () =>
      loadingOlder ? (
        <div className="flex justify-center py-2 text-sm text-primary-foreground">
          Loading…
        </div>
      ) : null,
  }

  const handleDelete = async (message: Message) => {
    try {
      await del(`/chats/${message.chat_id}/messages/${message.id}`)
    } catch (e) {
      toastError(e)
    }
  }

  const handleCopyText = (message: Message) => {
    navigator.clipboard.writeText(message.body)
  }

  const handleEdit = async (message: Message, newText: string) => {
    try {
      await patch(`/chats/${message.chat_id}/messages/${message.id}`, {
        body: {
          body: newText,
        }
      });
    } catch (e) {
      toastError(e);
    }
  };

  return (
    <Virtuoso
      ref={vRef}
      className="flex-1 overflow-y-auto"
      data={msgs}
      firstItemIndex={firstIndex}
      initialTopMostItemIndex={msgs.length - 1}
      startReached={loadOlder}
      endReached={loadNewer}
      atBottomStateChange={onBottomChange}
      rangeChanged={onRangeChanged}
      followOutput="smooth"
      overscan={200}
      components={components}
      itemContent={(idx, m) => (
        <ChatMessage
          key={m.id}
          message={m}
          isIncoming={m.sender_id !== activeChat.me_id}
          me={activeChat.me_id}
          onDelete={handleDelete}
          onCopyText={handleCopyText}
          onEdit={handleEdit}
        />
      )}
    />
  )
}
