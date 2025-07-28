import { useState } from "react";
import { ChatMessage, ChatMessageProps } from "./ChatMessage";
import { ChatInput } from "./ChatInput";
import { FileUpload } from "./FileUpload";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Bot, Sparkles } from "lucide-react";

interface Message extends Omit<ChatMessageProps, 'isLoading'> {
  id: string;
}

export const SmartChat = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      message: "Hello! I'm SmartChat AI. You can chat with me or upload files (PDF, ZIP, 7Z, CSV, Excel) for analysis. How can I help you today?",
      isUser: false
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const handleSendMessage = async (messageText: string) => {
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      message: messageText,
      isUser: true
    };
    
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      // Simulate API call to chat endpoint
      const response = await fetch('http://localhost:5001/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: messageText }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data = await response.json();
      
      // Add bot response
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        message: data.response || "I received your message, but I'm currently running in demo mode. Please make sure the backend is running on localhost:5001.",
        isUser: false
      };
      
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      // Add error message
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        message: "I'm currently running in demo mode. To enable full functionality, please start the backend server on localhost:5001 with the chat endpoint.",
        isUser: false
      };
      
      setMessages(prev => [...prev, errorMessage]);
      
      toast({
        title: "Connection Error",
        description: "Could not connect to the backend. Running in demo mode.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileSelect = async (file: File) => {
    setIsUploading(true);
    setShowFileUpload(false);

    // Add file upload message
    const fileMessage: Message = {
      id: Date.now().toString(),
      message: `I've uploaded "${file.name}" for analysis.`,
      isUser: true,
      fileName: file.name,
      fileType: file.type.split('/')[1] || file.name.split('.').pop()
    };
    
    setMessages(prev => [...prev, fileMessage]);
    setIsLoading(true);

    try {
      // Simulate API call to file endpoint
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('http://localhost:5001/file', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload file');
      }

      const data = await response.json();
      
      // Add bot response with file analysis
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        message: data.summary || `I've received your ${file.type} file "${file.name}". In demo mode, I can see it's a ${(file.size / 1024 / 1024).toFixed(2)}MB file. Connect the backend to get full file analysis capabilities.`,
        isUser: false
      };
      
      setMessages(prev => [...prev, botMessage]);
      
      toast({
        title: "File uploaded successfully",
        description: `${file.name} has been processed.`
      });
    } catch (error) {
      // Add error message
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        message: "I received your file, but I'm currently running in demo mode. Please connect the backend on localhost:5001 with the file endpoint for full analysis.",
        isUser: false
      };
      
      setMessages(prev => [...prev, errorMessage]);
      
      toast({
        title: "Upload Error",
        description: "Could not process file. Running in demo mode.",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-background">
      {/* Header */}
      <div className="flex items-center gap-3 p-6 border-b border-border bg-gradient-glass backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-gradient-primary rounded-lg shadow-glow">
            <Bot className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              SmartChat AI
            </h1>
            <p className="text-sm text-muted-foreground">
              Intelligent chat with file analysis
            </p>
          </div>
        </div>
        <div className="ml-auto">
          <Sparkles className="w-5 h-5 text-primary animate-pulse" />
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.map((message) => (
          <ChatMessage
            key={message.id}
            message={message.message}
            isUser={message.isUser}
            fileName={message.fileName}
            fileType={message.fileType}
          />
        ))}
        
        {isLoading && (
          <ChatMessage
            message=""
            isUser={false}
            isLoading={true}
          />
        )}
      </div>

      {/* Input */}
      <div className="p-6 border-t border-border bg-gradient-glass backdrop-blur-sm">
        <ChatInput
          onSendMessage={handleSendMessage}
          onFileUpload={() => setShowFileUpload(true)}
          isLoading={isLoading}
          placeholder="Ask me anything or upload a file for analysis..."
        />
      </div>

      {/* File Upload Dialog */}
      <Dialog open={showFileUpload} onOpenChange={setShowFileUpload}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Upload File for Analysis</DialogTitle>
          </DialogHeader>
          <FileUpload 
            onFileSelect={handleFileSelect}
            isUploading={isUploading}
          />
          <div className="flex justify-end gap-2 mt-4">
            <Button
              variant="outline"
              onClick={() => setShowFileUpload(false)}
              disabled={isUploading}
            >
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};