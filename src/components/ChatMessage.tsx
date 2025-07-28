import { cn } from "@/lib/utils";
import { Bot, User, FileText } from "lucide-react";

export interface ChatMessageProps {
  message: string;
  isUser: boolean;
  isLoading?: boolean;
  fileName?: string;
  fileType?: string;
}

export const ChatMessage = ({ message, isUser, isLoading, fileName, fileType }: ChatMessageProps) => {
  return (
    <div
      className={cn(
        "flex w-full animate-message-slide",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      <div
        className={cn(
          "flex max-w-[80%] gap-3 rounded-2xl p-4 shadow-message transition-all duration-300",
          isUser
            ? "bg-gradient-primary text-primary-foreground ml-auto"
            : "bg-chat-bot text-foreground border border-border"
        )}
      >
        <div className="flex-shrink-0">
          {isUser ? (
            <User className="w-5 h-5 mt-0.5" />
          ) : (
            <Bot className="w-5 h-5 mt-0.5" />
          )}
        </div>
        
        <div className="flex-1 space-y-2">
          {fileName && (
            <div className="flex items-center gap-2 px-3 py-2 bg-chat-upload/20 rounded-lg border border-chat-upload/30">
              <FileText className="w-4 h-4 text-chat-upload" />
              <span className="text-sm font-medium text-chat-upload">
                {fileName}
              </span>
              {fileType && (
                <span className="text-xs text-muted-foreground">
                  ({fileType.toUpperCase()})
                </span>
              )}
            </div>
          )}
          
          <div className="text-sm leading-relaxed">
            {isLoading ? (
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-current rounded-full animate-pulse" />
                <div className="w-2 h-2 bg-current rounded-full animate-pulse delay-100" />
                <div className="w-2 h-2 bg-current rounded-full animate-pulse delay-200" />
              </div>
            ) : (
              <p className="whitespace-pre-wrap">{message}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};