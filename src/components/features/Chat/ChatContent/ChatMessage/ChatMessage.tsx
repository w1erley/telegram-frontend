import { cn } from "@/lib/utils";

interface ChatMessageProps {
  sender: string;
  text: string;
  time: string;
  isIncoming?: boolean;
  isOutgoing?: boolean;
}

export function ChatMessage({ sender, text, time, isIncoming = false, isOutgoing = false }: ChatMessageProps) {
  return (
    <div className={cn("flex flex-col mb-2", isIncoming ? "items-start" : "items-end")}>
      {/* Sender's Name */}
      {isIncoming && (
        <div className={cn("text-xs font-semibold mb-1 text-muted-foreground")}>
          {sender}
        </div>
      )}

      {/* Message Bubble */}
      <div
        className={cn(
          "max-w-[80%] rounded-lg px-3 py-2",
          isIncoming ? "bg-muted" : "bg-primary text-primary-foreground"
        )}
      >
        <div>{text}</div>
        <div className="text-xs text-right mt-1 opacity-70">{time}</div>
      </div>
    </div>
  );
}
