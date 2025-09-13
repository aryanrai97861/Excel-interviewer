import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";

interface FileUploadProps {
  onFileUpload: (file: File, message?: string) => void;
  onToggle: (visible: boolean) => void;
  isVisible: boolean;
  disabled?: boolean;
}

export default function FileUpload({ onFileUpload, onToggle, isVisible, disabled }: FileUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadMessage, setUploadMessage] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      setIsDragOver(true);
    }
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    if (disabled) return;

    const files = Array.from(e.dataTransfer.files);
    const excelFile = files.find(file => 
      file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
      file.type === 'application/vnd.ms-excel' ||
      file.name.endsWith('.xlsx') ||
      file.name.endsWith('.xls')
    );

    if (excelFile) {
      onFileUpload(excelFile, uploadMessage);
      setUploadMessage("");
    } else {
      alert("Please upload only Excel files (.xlsx or .xls)");
    }
  }, [disabled, onFileUpload, uploadMessage]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileUpload(file, uploadMessage);
      setUploadMessage("");
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const openFileDialog = () => {
    if (!disabled) {
      fileInputRef.current?.click();
    }
  };

  if (!isVisible) return null;

  return (
    <div className="space-y-4">
      {/* File Upload Zone */}
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer ${
          isDragOver
            ? "border-primary bg-primary/5"
            : disabled
            ? "border-muted bg-muted/20 cursor-not-allowed"
            : "border-border hover:border-primary/50"
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={openFileDialog}
        data-testid="file-upload-zone"
      >
        <div className="flex flex-col items-center space-y-2">
          <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
            disabled ? "bg-muted" : "bg-muted"
          }`}>
            <i className={`text-xl ${
              isDragOver 
                ? "fas fa-cloud-upload-alt text-primary" 
                : disabled
                ? "fas fa-cloud-upload-alt text-muted-foreground"
                : "fas fa-cloud-upload-alt text-muted-foreground"
            }`}></i>
          </div>
          <div>
            <p className={`text-sm font-medium ${disabled ? "text-muted-foreground" : ""}`}>
              {isDragOver 
                ? "Drop your Excel file here" 
                : "Upload your Excel solution"
              }
            </p>
            <p className={`text-xs ${disabled ? "text-muted-foreground" : "text-muted-foreground"}`}>
              Drag & drop or click to browse • .xlsx files only
            </p>
          </div>
        </div>
      </div>

      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        accept=".xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
        className="hidden"
        disabled={disabled}
        data-testid="file-input"
      />

      {/* Optional message input */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Optional: Add a note about your solution
        </label>
        <textarea
          value={uploadMessage}
          onChange={(e) => setUploadMessage(e.target.value)}
          placeholder="Explain your approach, any challenges faced, or additional context..."
          className="w-full px-3 py-2 border border-input rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-ring bg-background text-foreground"
          rows={2}
          disabled={disabled}
          data-testid="upload-message-input"
        />
      </div>

      {/* Upload with message button */}
      {uploadMessage.trim() && (
        <Button
          onClick={() => {
            if (fileInputRef.current) {
              fileInputRef.current.click();
            }
          }}
          disabled={disabled}
          variant="outline"
          size="sm"
          className="w-full"
          data-testid="button-upload-with-message"
        >
          <i className="fas fa-upload mr-2"></i>
          Upload File with Message
        </Button>
      )}
    </div>
  );
}
