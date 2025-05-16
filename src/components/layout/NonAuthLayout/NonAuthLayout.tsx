"use client"

import { ReactNode } from "react";

interface ILayoutProps {
  children: ReactNode
}
const NonAuthLayout: React.FC<ILayoutProps> = ({ children }) => {
  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {children}
    </div>
  )
}

export default NonAuthLayout