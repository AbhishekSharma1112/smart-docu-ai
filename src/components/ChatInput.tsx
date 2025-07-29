import { useState, useRef } from "react";
import { Send, Paperclip } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  onFileSelect: (file: File) => void;
  isLoading: boolean;
  placeholder?: string;
}

export const ChatInput = ({ 
  onSendMessage, 
  onFileSelect, 
  isLoading, 
  placeholder = "Type your message..." 
}: ChatInputProps) => {
  const [message, setMessage] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const ACCEPTED_FILE_TYPES = ['.pdf', '.zip', '.7z', '.csv', '.xlsx', '.xls'];

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
      if (!ACCEPTED_FILE_TYPES.includes(fileExtension)) {
        toast({
          title: "File not supported",
          description: "Please upload a PDF, ZIP, 7Z, CSV, or Excel file.",
          variant: "destructive"
        });
        return;
      }
      onFileSelect(file);
    }
    // Reset input value to allow selecting the same file again
    e.target.value = '';
  };

  const handleFileUpload = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !isLoading) {
      onSendMessage(message.trim());
      setMessage("");
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const adjustTextareaHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.zip,.7z,.csv,.xlsx,.xls"
        onChange={handleFileSelect}
        className="hidden"
      />
      <div className="relative flex items-end gap-2 p-4 bg-gradient-glass backdrop-blur-sm border border-border rounded-2xl shadow-card">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleFileUpload}
          className="flex-shrink-0 h-10 w-10 p-0 hover:bg-muted/50 transition-colors"
          disabled={isLoading}
        >
          <Paperclip className="w-5 h-5" />
        </Button>
        
        <Textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => {
            setMessage(e.target.value);
            adjustTextareaHeight();
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={isLoading}
          className={cn(
            "flex-1 min-h-[2.5rem] max-h-32 resize-none border-0 bg-transparent",
            "focus-visible:ring-0 focus-visible:ring-offset-0 text-sm leading-relaxed",
            "placeholder:text-muted-foreground/70"
          )}
          style={{ height: "auto" }}
        />
        
        <Button
          type="submit"
          disabled={!message.trim() || isLoading}
          className={cn(
            "flex-shrink-0 h-10 w-10 p-0 bg-gradient-primary hover:opacity-90",
            "disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200",
            !message.trim() || isLoading ? "" : "shadow-glow animate-pulse-glow"
          )}
        >
          <Send className="w-5 h-5" />
        </Button>
      </div>
    </form>
  );
};