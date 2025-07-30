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
  const parseMarkdownForDoc = (text: string) => {
    const lines = text.split('\n');
    const children = [];
    
    for (const line of lines) {
      if (line.trim() === '') {
        continue;
      }
      
      // Headers
      if (line.match(/^#{1,6}\s+/)) {
        const level = line.match(/^#+/)[0].length;
        const text = line.replace(/^#+\s+/, '');
        children.push(new Paragraph({
          text: text,
          heading: level === 1 ? 'Heading1' : level === 2 ? 'Heading2' : 'Heading3',
          spacing: { after: 200 }
        }));
      }
      // Bullet points
      else if (line.match(/^\s*[-*+]\s+/)) {
        const text = line.replace(/^\s*[-*+]\s+/, '');
        children.push(new Paragraph({
          text: `• ${text}`,
          spacing: { after: 100 }
        }));
      }
      // Numbered lists
      else if (line.match(/^\s*\d+\.\s+/)) {
        const text = line.replace(/^\s*\d+\.\s+/, '');
        const number = line.match(/^\s*(\d+)\./)[1];
        children.push(new Paragraph({
          text: `${number}. ${text}`,
          spacing: { after: 100 }
        }));
      }
      // Blockquotes
      else if (line.match(/^>\s+/)) {
        const text = line.replace(/^>\s+/, '');
        children.push(new Paragraph({
          text: `"${text}"`,
          spacing: { after: 100, before: 100 }
        }));
      }
      // Regular paragraphs
      else {
        const cleanText = line
          .replace(/\*\*([^*]+)\*\*/g, '$1')
          .replace(/\*([^*]+)\*/g, '$1')
          .replace(/`([^`]+)`/g, '$1')
          .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
        
        if (cleanText.trim()) {
          children.push(new Paragraph({
            text: cleanText,
            spacing: { after: 200 }
          }));
        }
      }
    }
    
    return children;
  };

  const generateFormattedPDF = (text: string, fileName: string) => {
    const pdf = new jsPDF();
    const lines = text.split('\n');
    let yPosition = 20;
    const pageHeight = pdf.internal.pageSize.height;
    const margin = 15;
    
    for (const line of lines) {
      if (yPosition > pageHeight - 30) {
        pdf.addPage();
        yPosition = 20;
      }
      
      if (line.trim() === '') {
        yPosition += 5;
        continue;
      }
      
      // Headers
      if (line.match(/^#{1,6}\s+/)) {
        const level = line.match(/^#+/)[0].length;
        const text = line.replace(/^#+\s+/, '');
        const fontSize = level === 1 ? 18 : level === 2 ? 16 : 14;
        
        pdf.setFontSize(fontSize);
        pdf.setFont(undefined, 'bold');
        const wrappedText = pdf.splitTextToSize(text, 180);
        pdf.text(wrappedText, margin, yPosition);
        yPosition += wrappedText.length * (fontSize * 0.5) + 10;
      }
      // Bullet points
      else if (line.match(/^\s*[-*+]\s+/)) {
        const text = line.replace(/^\s*[-*+]\s+/, '');
        pdf.setFontSize(12);
        pdf.setFont(undefined, 'normal');
        const wrappedText = pdf.splitTextToSize(`• ${text}`, 170);
        pdf.text(wrappedText, margin + 10, yPosition);
        yPosition += wrappedText.length * 6 + 3;
      }
      // Numbered lists
      else if (line.match(/^\s*\d+\.\s+/)) {
        const text = line.replace(/^\s*\d+\.\s+/, '');
        const number = line.match(/^\s*(\d+)\./)[1];
        pdf.setFontSize(12);
        pdf.setFont(undefined, 'normal');
        const wrappedText = pdf.splitTextToSize(`${number}. ${text}`, 170);
        pdf.text(wrappedText, margin + 10, yPosition);
        yPosition += wrappedText.length * 6 + 3;
      }
      // Blockquotes
      else if (line.match(/^>\s+/)) {
        const text = line.replace(/^>\s+/, '');
        pdf.setFontSize(12);
        pdf.setFont(undefined, 'italic');
        const wrappedText = pdf.splitTextToSize(`"${text}"`, 170);
        pdf.text(wrappedText, margin + 15, yPosition);
        yPosition += wrappedText.length * 6 + 5;
      }
      // Regular text
      else {
        const cleanText = line
          .replace(/\*\*([^*]+)\*\*/g, '$1')
          .replace(/\*([^*]+)\*/g, '$1')
          .replace(/`([^`]+)`/g, '$1')
          .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
        
        if (cleanText.trim()) {
          pdf.setFontSize(12);
          pdf.setFont(undefined, 'normal');
          const wrappedText = pdf.splitTextToSize(cleanText, 180);
          pdf.text(wrappedText, margin, yPosition);
          yPosition += wrappedText.length * 6 + 8;
        }
      }
    }
    
    pdf.save(fileName);
  };

  const handleDownload = (format: 'pdf' | 'doc' | 'md') => {
    const baseFileName = `analysis-${fileName || 'document'}-${Date.now()}`;
    
    if (format === 'pdf') {
      generateFormattedPDF(message, `${baseFileName}.pdf`);
    } else if (format === 'doc') {
      const children = parseMarkdownForDoc(message);
      const doc = new Document({
        sections: [{
          properties: {},
          children: children
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
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  {isFileAnalysis ? 'Analyzing file' : 'Working'}
                </span>
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-current rounded-full animate-pulse" />
                  <div className="w-2 h-2 bg-current rounded-full animate-pulse delay-100" />
                  <div className="w-2 h-2 bg-current rounded-full animate-pulse delay-200" />
                </div>
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