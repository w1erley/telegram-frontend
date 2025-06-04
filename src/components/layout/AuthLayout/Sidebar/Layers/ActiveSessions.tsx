"use client"

import React, { useEffect, useState, useCallback } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  ArrowLeft,
  Smartphone,
  Monitor,
  Trash2,
  Chrome,
  Globe
} from "lucide-react"
import type { LayerType } from "@/components/layout/AuthLayout/Sidebar/Sidebar"
import { useApi } from "@/hooks/useApi"
import Bowser from "bowser"

interface DevicesProps {
  activeLayer: LayerType
  setActiveLayer: React.Dispatch<React.SetStateAction<LayerType>>
}

interface Session {
  id: number
  user_id: number
  personal_access_token_id: number
  device: string
  ip_address: string
  browser: string
  last_active_at: string
  created_at: string
  updated_at: string
}

interface Device {
  id: number
  name: string
  platform: string
  location: string
  timestamp?: string
  isCurrentDevice?: boolean
  icon: React.ReactNode
}

const ActiveSessions: React.FC<DevicesProps> = ({
  activeLayer,
  setActiveLayer,
}) => {
  const { get, del } = useApi()
  const [currentSession, setCurrentSession] = useState<Session | null>(null)
  const [otherSessions, setOtherSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState<boolean>(false)

  const fetchSessions = useCallback(async () => {
    setLoading(true)
    try {
      const data = await get<{
        current: Session | null
        others: Session[]
      }>("/sessions")
      setCurrentSession(data.current)
      setOtherSessions(data.others)
    } catch {
      // обробка помилки
    } finally {
      setLoading(false)
    }
  }, [get])

  useEffect(() => {
    fetchSessions()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleTerminateAllSessions = async () => {
    setLoading(true)
    try {
      await del("/sessions/others")
      await fetchSessions()
    } catch {
    } finally {
      setLoading(false)
    }
  }

  const handleTerminateSession = async (id: number) => {
    setLoading(true)
    try {
      await del(`/sessions/${id}`)
      await fetchSessions()
    } catch {
      // обробка помилки
    } finally {
      setLoading(false)
    }
  }

  const resolveIcon = (userAgent: string) => {
    try {
      const parser = Bowser.getParser(userAgent)
      const browserName = parser.getBrowserName()
      const platformType = parser.getPlatformType()

      if (browserName === "Chrome") {
        return <Chrome className="h-6 w-6 text-blue-500" />
      }

      if (browserName === "Firefox") {
        return <Monitor className="h-6 w-6 text-orange-500" />
      }

      if (platformType === "mobile" || browserName?.includes("iPhone")) {
        return <Smartphone className="h-6 w-6 text-gray-600" />
      }

      if (platformType === "desktop" || browserName === "Safari") {
        return <Monitor className="h-6 w-6 text-green-500" />
      }

      return <Globe className="h-6 w-6 text-muted-foreground" />
    } catch {
      return <Monitor className="h-6 w-6 text-muted-foreground" />
    }
  }

  const mapSessionToDevice = (
    session: Session,
    isCurrent = false
  ): Device => {
    const name = isCurrent
      ? session.browser.split(" ")[0] + " (this device)"
      : session.browser.split(" ")[0]
    const platform = session.browser
    const location = session.ip_address
    const timestamp = isCurrent
      ? undefined
      : new Date(session.last_active_at).toLocaleDateString([], {
        month: "short",
        day: "numeric",
      })
    return {
      id: session.id,
      name,
      platform,
      location,
      timestamp,
      isCurrentDevice: isCurrent,
      icon: resolveIcon(session.browser),
    }
  }

  const currentDevice =
    currentSession !== null
      ? mapSessionToDevice(currentSession, true)
      : null

  const activeSessions = otherSessions.map((s) =>
    mapSessionToDevice(s, false)
  )

  return (
    <div
      className={cn(
        "absolute inset-0 h-full border-r bg-background flex flex-col transition-transform duration-300 ease-in-out",
        activeLayer === "active_sessions"
          ? "translate-x-0 z-20"
          : "translate-x-full z-10"
      )}
    >
      {/* Header */}
      <div className="p-3 border-b flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setActiveLayer("settings")}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h2 className="font-medium">Devices</h2>
      </div>

      <div className="flex-1 overflow-y-auto">
        {currentDevice && (
          <div className="p-4">
            <div className="text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wide">
              This Device
            </div>

            <div className="flex items-center gap-3 p-3 rounded-lg">
              <div className="flex-shrink-0">{currentDevice.icon}</div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-foreground">
                  {currentDevice.name}
                </div>
                <div className="text-sm text-muted-foreground">
                  {currentDevice.platform}
                </div>
                <div className="text-sm text-muted-foreground">
                  – {currentDevice.location}
                </div>
              </div>
            </div>

            <Button
              variant="ghost"
              className="w-full justify-start mt-4 text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={handleTerminateAllSessions}
              disabled={loading || otherSessions.length === 0}
            >
              <div className="w-6 h-6 rounded-full border-2 border-destructive flex items-center justify-center mr-3">
                <div className="w-2 h-2 bg-destructive rounded-full" />
              </div>
              Terminate All Other Sessions
            </Button>
          </div>
        )}

        {activeSessions.length > 0 && (
          <div className="p-4 pt-0">
            <div className="text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wide">
              Active sessions
            </div>

            <div className="space-y-1">
              {activeSessions.map((device) => (
                <div
                  key={device.id}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-shrink-0">{device.icon}</div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-foreground">
                      {device.name}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {device.platform}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {device.location}
                    </div>
                  </div>
                  {device.timestamp && (
                    <div className="text-xs text-muted-foreground flex-shrink-0">
                      {device.timestamp}
                    </div>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:text-destructive/70 hover:bg-destructive/10"
                    onClick={() => handleTerminateSession(device.id)}
                    disabled={loading}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ActiveSessions