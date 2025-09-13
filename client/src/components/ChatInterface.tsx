import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import FileUpload from "./FileUpload";
import type { ChatMessage } from "@/types/interview";

interface ChatInterfaceProps {
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
  onFileUpload: (file: File, message?: string) => void;
  onDownloadTemplate: (templateType: string) => void;
  isLoading: boolean;
  isCompleted: boolean;
}

export default function ChatInterface({
  messages,
  onSendMessage,
  onFileUpload,
  onDownloadTemplate,
  isLoading,
  isCompleted
}: ChatInterfaceProps) {
  const [inputValue, setInputValue] = useState("");
  const [showFileUpload, setShowFileUpload] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    if (inputValue.trim() && !isLoading) {
      onSendMessage(inputValue.trim());
      setInputValue("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffMinutes < 1) return "Just now";
    if (diffMinutes < 60) return `${diffMinutes} minutes ago`;
    if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)} hours ago`;
    return date.toLocaleDateString();
  };

  const renderMessage = (message: ChatMessage) => {
    const isAI = message.sender === "ai";
    
    return (
      <div key={message.id} className={`flex space-x-4 ${isAI ? "" : "justify-end"}`}>
        {isAI && (
          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
            <i className="fas fa-robot text-primary-foreground text-sm"></i>
          </div>
        )}
        
        <div className={`flex-1 ${isAI ? "" : "max-w-md"}`}>
          <div className={`rounded-lg p-4 shadow-sm ${
            isAI 
              ? "bg-card border border-border" 
              : "bg-primary text-primary-foreground"
          }`}>
            {message.messageType === "template_download" ? (
              <div className="border border-border rounded-lg p-4 bg-accent/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <i className="fas fa-file-excel text-green-600"></i>
                    </div>
                    <div>
                      <p className="font-medium text-sm">
                        {message.metadata?.templateType}_template.xlsx
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Excel Template • Time limit: {message.metadata?.timeLimit} minutes
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={() => onDownloadTemplate(message.metadata?.templateType)}
                    size="sm"
                    data-testid={`button-download-${message.metadata?.templateType}`}
                  >
                    <i className="fas fa-download mr-2"></i>
                    Download
                  </Button>
                </div>
              </div>
            ) : message.messageType === "file_upload" ? (
              <div className="flex items-center space-x-2">
                <i className="fas fa-file-excel text-green-500"></i>
                <span className="text-sm">Uploaded Excel file</span>
                {message.content && (
                  <span className="text-sm">: {message.content}</span>
                )}
              </div>
            ) : (
              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
            )}
          </div>
          <p className={`text-xs text-muted-foreground mt-2 ${isAI ? "" : "text-right"}`}>
            {isAI ? "AI Interviewer" : "You"} • {formatTimestamp(message.timestamp)}
          </p>
        </div>

        {!isAI && (
          <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-sm font-medium">You</span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex-1 flex flex-col">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.map(renderMessage)}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      {!isCompleted && (
        <div className="border-t border-border p-6 space-y-4">
          {/* File Upload Area */}
          <FileUpload
            onFileUpload={onFileUpload}
            onToggle={setShowFileUpload}
            isVisible={showFileUpload}
            disabled={isLoading}
          />

          {/* Text Input */}
          <div className="flex space-x-3">
            <div className="flex-1">
              <Textarea
                placeholder="Type your answer or explain your approach..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                className="resize-none"
                rows={3}
                disabled={isLoading}
                data-testid="input-message"
              />
            </div>
            <Button
              onClick={handleSend}
              disabled={!inputValue.trim() || isLoading}
              className="px-6 py-3"
              data-testid="button-send-message"
            >
              {isLoading ? (
                <i className="fas fa-spinner fa-spin"></i>
              ) : (
                <i className="fas fa-paper-plane"></i>
              )}
            </Button>
          </div>

          {/* Toggle File Upload Button */}
          <div className="flex justify-center">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFileUpload(!showFileUpload)}
              data-testid="button-toggle-upload"
            >
              <i className="fas fa-paperclip mr-2"></i>
              {showFileUpload ? "Hide" : "Show"} File Upload
            </Button>
          </div>
        </div>
      )}

      {isCompleted && (
        <div className="border-t border-border p-6 text-center">
          <p className="text-muted-foreground">
            Interview completed! Check your results above.
          </p>
        </div>
      )}
    </div>
  );
}
