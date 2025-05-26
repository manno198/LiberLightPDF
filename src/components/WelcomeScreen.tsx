import React, { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

interface WelcomeScreenProps {
  onUpload: (file: File) => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onUpload }) => {
  const { toast } = useToast();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file && file.type === "application/pdf") {
      toast({
        title: "PDF Uploaded",
        description: `Loading ${file.name}...`,
      });
      onUpload(file);
    } else {
      toast({
        title: "Invalid file type",
        description: "Please upload a valid PDF file.",
        variant: "destructive"
      });
    }
  }, [onUpload, toast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf']
    },
    maxFiles: 1
  });

  return (
    <div className="flex flex-col items-center justify-center">
      <Card className="w-full max-w-3xl p-8 text-center">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Welcome to LiberLightPDF</h2>
          <p className="text-muted-foreground">
            Upload a PDF file to get started. Your friendly duck assistant will help you stay motivated!
          </p>
        </div>

        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-12 transition-colors cursor-pointer
            ${isDragActive ? 'border-primary bg-primary/10' : 'border-gray-300 hover:border-primary'}`}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center gap-4">
            <div className="text-5xl">📄</div>
            {isDragActive ? (
              <p className="font-medium">Drop the PDF file here...</p>
            ) : (
              <>
                <p className="font-medium">Drag and drop a PDF file here, or click to select</p>
                <p className="text-sm text-muted-foreground">
                  Your PDF will be processed locally - nothing is uploaded to any server
                </p>
                <Button>Select PDF File</Button>
              </>
            )}
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
          <div className="p-4">
            <div className="text-3xl mb-2">✏️</div>
            <h3 className="font-medium">Edit & Annotate</h3>
            <p className="text-sm text-muted-foreground">Highlight text, draw, and make notes</p>
          </div>
          
          <div className="p-4">
            <div className="text-3xl mb-2">🦆</div>
            <h3 className="font-medium">Duck Motivation</h3>
            <p className="text-sm text-muted-foreground">Get cheerful reminders while you work</p>
          </div>
          
          <div className="p-4">
            <div className="text-3xl mb-2">💾</div>
            <h3 className="font-medium">Save Your Work</h3>
            <p className="text-sm text-muted-foreground">Export your edited PDFs anytime</p>
          </div>
        </div>
      </Card>
      
      <div className="mt-8 text-center text-sm text-muted-foreground">
        <p>
          This is a Chrome Extension demo. In the actual extension, you can open PDFs directly from your browser.
        </p>
      </div>
    </div>
  );
};

export default WelcomeScreen;
