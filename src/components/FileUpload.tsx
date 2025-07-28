import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { cn } from "@/lib/utils";
import { Upload, FileText, X, CheckCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  isUploading: boolean;
}

const ACCEPTED_FILE_TYPES = {
  'application/pdf': ['.pdf'],
  'application/zip': ['.zip'],
  'application/x-7z-compressed': ['.7z'],
  'text/csv': ['.csv'],
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
  'application/vnd.ms-excel': ['.xls']
};

export const FileUpload = ({ onFileSelect, isUploading }: FileUploadProps) => {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const { toast } = useToast();

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    if (rejectedFiles.length > 0) {
      toast({
        title: "File not supported",
        description: "Please upload a PDF, ZIP, 7Z, CSV, or Excel file.",
        variant: "destructive"
      });
      return;
    }

    const file = acceptedFiles[0];
    if (file) {
      setUploadedFile(file);
      setUploadStatus('idle');
      onFileSelect(file);
    }
  }, [onFileSelect, toast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED_FILE_TYPES,
    maxFiles: 1,
    disabled: isUploading
  });

  const removeFile = () => {
    setUploadedFile(null);
    setUploadStatus('idle');
  };

  const getFileIcon = () => {
    if (uploadStatus === 'success') return <CheckCircle className="w-5 h-5 text-chat-upload" />;
    if (uploadStatus === 'error') return <AlertCircle className="w-5 h-5 text-destructive" />;
    return <FileText className="w-5 h-5 text-muted-foreground" />;
  };

  const getStatusText = () => {
    if (isUploading) return "Processing...";
    if (uploadStatus === 'success') return "Processed successfully";
    if (uploadStatus === 'error') return "Processing failed";
    return "Ready to process";
  };

  return (
    <div className="space-y-4">
      {!uploadedFile && (
        <div
          {...getRootProps()}
          className={cn(
            "border-2 border-dashed border-border rounded-xl p-8 text-center cursor-pointer transition-all duration-300",
            "hover:border-primary/50 hover:bg-muted/50",
            isDragActive && "border-primary bg-primary/10 scale-105",
            isUploading && "opacity-50 cursor-not-allowed"
          )}
        >
          <input {...getInputProps()} />
          <Upload className={cn(
            "w-12 h-12 mx-auto mb-4 text-muted-foreground transition-colors",
            isDragActive && "text-primary"
          )} />
          <p className="text-lg font-medium mb-2">
            {isDragActive ? "Drop your file here" : "Upload a file"}
          </p>
          <p className="text-sm text-muted-foreground mb-4">
            Drag & drop or click to browse
          </p>
          <p className="text-xs text-muted-foreground">
            Supports: PDF, ZIP, 7Z, CSV, Excel (.xlsx, .xls)
          </p>
        </div>
      )}

      {uploadedFile && (
        <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-xl border border-border">
          {getFileIcon()}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{uploadedFile.name}</p>
            <p className="text-xs text-muted-foreground">
              {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB • {getStatusText()}
            </p>
          </div>
          {isUploading && (
            <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          )}
          {!isUploading && (
            <Button
              variant="ghost"
              size="sm"
              onClick={removeFile}
              className="h-8 w-8 p-0 hover:bg-destructive/20"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      )}
    </div>
  );
};