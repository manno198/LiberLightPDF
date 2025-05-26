import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface ChromeExtensionDemoProps {
  onOpenPDF: () => void;
}

const ChromeExtensionDemo: React.FC<ChromeExtensionDemoProps> = ({ onOpenPDF }) => {
  const [showAlert, setShowAlert] = useState(true);

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {showAlert && (
        <Alert className="w-72 bg-white shadow-lg border border-gray-200">
          <div className="flex justify-between items-start">
            <div>
              <AlertTitle className="mb-1 flex items-center">
                <span className="text-yellow-500 mr-2">🦆</span> 
                LiberLightPDF
              </AlertTitle>
              <AlertDescription className="text-sm">
                This demo simulates a Chrome extension. In the actual extension, you'd see this popup when viewing a PDF.
              </AlertDescription>
            </div>
            <button 
              className="text-gray-400 hover:text-gray-600 text-sm mt-1"
              onClick={() => setShowAlert(false)}
            >
              ✕
            </button>
          </div>
          <div className="mt-4">
            <Button 
              className="w-full"
              onClick={() => {
                onOpenPDF();
                setShowAlert(false);
              }}
            >
              Open Sample PDF in Editor
            </Button>
          </div>
        </Alert>
      )}
    </div>
  );
};

export default ChromeExtensionDemo;
