import { cn } from "@/lib/utils";
import { Bot, User, FileText, Download, FileDown } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import jsPDF from "jspdf";
import { Document, Packer, Paragraph } from "docx";

export interface ChatMessageProps {
  message: string;
  isUser: boolean;
  isLoading?: boolean;
  isStreaming?: boolean;
  fileName?: string;
  fileType?: string;
  isFileAnalysis?: boolean;
}

export const ChatMessage = ({ message, isUser, isLoading, isStreaming, fileName, fileType, isFileAnalysis }: ChatMessageProps) => {
  const handleDownload = (format: 'pdf' | 'doc' | 'md') => {
    const baseFileName = `analysis-${fileName || 'document'}-${Date.now()}`;
    
    if (format === 'pdf') {
      const pdf = new jsPDF();
      const lines = pdf.splitTextToSize(message, 180);
      pdf.text(lines, 15, 20);
      pdf.save(`${baseFileName}.pdf`);
    } else if (format === 'doc') {
      const doc = new Document({
        sections: [{
          properties: {},
          children: [new Paragraph(message)]
        }]
      });
      
      Packer.toBlob(doc).then(blob => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${baseFileName}.docx`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      });
    } else {
      const blob = new Blob([message], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${baseFileName}.md`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };
  return (
    <div
      className={cn(
        "flex w-full animate-message-slide",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      <div
        className={cn(
          "flex max-w-[80%] gap-3 rounded-2xl p-4 shadow-message transition-all duration-300 min-w-0",
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
        
        <div className="flex-1 space-y-2 min-w-0 overflow-hidden">
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
          
          <div className="text-sm leading-relaxed break-words overflow-wrap-anywhere">
            {isLoading ? (
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-current rounded-full animate-pulse" />
                <div className="w-2 h-2 bg-current rounded-full animate-pulse delay-100" />
                <div className="w-2 h-2 bg-current rounded-full animate-pulse delay-200" />
              </div>
            ) : (
              <div className="relative">
                <div className="markdown-content overflow-hidden">
                  <ReactMarkdown
                    components={{
                      h1: ({ children }) => <h1 className="text-lg font-bold mb-2 break-words">{children}</h1>,
                      h2: ({ children }) => <h2 className="text-base font-bold mb-2 break-words">{children}</h2>,
                      h3: ({ children }) => <h3 className="text-sm font-semibold mb-1 break-words">{children}</h3>,
                      p: ({ children }) => <p className="mb-2 last:mb-0 break-words">{children}</p>,
                      ul: ({ children }) => <ul className="list-disc list-inside mb-2 space-y-1 break-words">{children}</ul>,
                      ol: ({ children }) => <ol className="list-decimal list-inside mb-2 space-y-1 break-words">{children}</ol>,
                      li: ({ children }) => <li className="pl-1 break-words">{children}</li>,
                      strong: ({ children }) => <strong className="font-semibold break-words">{children}</strong>,
                      em: ({ children }) => <em className="italic break-words">{children}</em>,
                      code: ({ children }) => (
                        <code className="bg-muted px-1 py-0.5 rounded text-xs font-mono break-all">{children}</code>
                      ),
                      pre: ({ children }) => (
                        <pre className="bg-muted p-3 rounded-lg text-xs font-mono overflow-x-auto mb-2 max-w-full">{children}</pre>
                      ),
                      blockquote: ({ children }) => (
                        <blockquote className="border-l-4 border-border pl-4 italic mb-2 break-words">{children}</blockquote>
                      ),
                    }}
                  >
                    {message}
                  </ReactMarkdown>
                </div>
                {isStreaming && (
                  <span className="inline-block w-2 h-5 bg-current ml-1 animate-pulse" />
                )}
              </div>
            )}
            
            {/* Download button for file analysis results */}
            {!isUser && !isLoading && !isStreaming && isFileAnalysis && message.trim() && (
              <div className="mt-3 pt-2 border-t border-border/50">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs h-8 px-3"
                    >
                      <Download className="w-3 h-3 mr-1" />
                      Download Analysis
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => handleDownload('pdf')}>
                      <FileDown className="w-4 h-4 mr-2" />
                      Download as PDF
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleDownload('doc')}>
                      <FileDown className="w-4 h-4 mr-2" />
                      Download as DOC
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleDownload('md')}>
                      <FileDown className="w-4 h-4 mr-2" />
                      Download as Markdown
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};