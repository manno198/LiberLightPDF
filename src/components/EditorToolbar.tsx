import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Undo, Redo, Eraser, Pencil, Square } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface EditorToolbarProps {
  onToolChange: (tool: string) => void;
  onPenColorChange: (color: string) => void;
  onPenSizeChange: (size: number) => void;
  onHighlighterColorChange: (color: string) => void;
  onEraserSizeChange: (size: number) => void;
  darkMode?: boolean;
  fullScreen?: boolean;
}

const EditorToolbar: React.FC<EditorToolbarProps> = ({
  onToolChange,
  onPenColorChange,
  onPenSizeChange,
  onHighlighterColorChange,
  onEraserSizeChange,
  darkMode = false,
  fullScreen = false
}) => {
  const [activeTool, setActiveTool] = useState<string>("cursor");
  const [penColor, setPenColor] = useState<string>("#000000");
  const [penSize, setPenSize] = useState<number>(2);
  const [highlighterColor, setHighlighterColor] = useState<string>("#FFEB3B");
  const [eraserSize, setEraserSize] = useState<number>(20);
  const { toast } = useToast();

  const colors = [
    "#000000", // Black
    "#FF0000", // Red
    "#0000FF", // Blue
    "#008000", // Green
    "#FFA500", // Orange
    "#800080", // Purple
  ];

  const highlightColors = [
    "#FFEB3B", // Yellow
    "#4CAF50", // Green
    "#2196F3", // Blue 
    "#FF9800", // Orange
    "#E91E63", // Pink
    "#9C27B0", // Purple
  ];

  const handleToolChange = (value: string) => {
    if (value) {
      setActiveTool(value);
      onToolChange(value);
    }
  };

  const handlePenColorChange = (color: string) => {
    setPenColor(color);
    onPenColorChange(color);
  };

  const handlePenSizeChange = (value: number[]) => {
    const size = value[0];
    setPenSize(size);
    onPenSizeChange(size);
  };

  const handleHighlighterColorChange = (color: string) => {
    setHighlighterColor(color);
    onHighlighterColorChange(color);
  };

  const handleEraserSizeChange = (value: number[]) => {
    const size = value[0];
    setEraserSize(size);
    onEraserSizeChange(size);
  };

  const handleSave = () => {
    if ((window as any).pdfViewerSavePDF) {
      (window as any).pdfViewerSavePDF();
    }
    toast({
      title: "Saving PDF...",
      description: "Your annotated PDF is being saved.",
    });
  };

  const handleUndo = () => {
    // Use the function exposed by PDFViewer
    if ((window as any).pdfViewerUndo) {
      (window as any).pdfViewerUndo();
    }
  };

  const handleRedo = () => {
    // Use the function exposed by PDFViewer
    if ((window as any).pdfViewerRedo) {
      (window as any).pdfViewerRedo();
    }
  };

  return (
    <div className={`flex flex-wrap items-center gap-2 rounded-lg px-4 py-2 ${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}`}>
      <ToggleGroup type="single" value={activeTool} onValueChange={handleToolChange}>
        <ToggleGroupItem value="cursor" aria-label="Toggle cursor">
          <span className="flex items-center">
            <span className="mr-1">👆</span> Select
          </span>
        </ToggleGroupItem>
        
        <ToggleGroupItem value="highlighter" aria-label="Toggle highlighter">
          <span className="flex items-center">
            <span className="mr-1">🖌️</span> Highlight
          </span>
        </ToggleGroupItem>
        
        <ToggleGroupItem value="pen" aria-label="Toggle pen">
          <span className="flex items-center">
            <span className="mr-1">✏️</span> Draw
          </span>
        </ToggleGroupItem>
        
        <ToggleGroupItem value="eraser" aria-label="Toggle eraser">
          <span className="flex items-center">
            <span className="mr-1">🧽</span> Erase
          </span>
        </ToggleGroupItem>
      </ToggleGroup>

      <div className="ml-auto flex items-center gap-2">
        <Button 
          variant={darkMode ? 'secondary' : 'outline'}
          size="sm" 
          onClick={handleUndo}
          className={darkMode ? 'bg-gray-700 text-white border-gray-600 hover:bg-gray-600' : ''}
        >
          <Undo className="h-4 w-4 mr-1" /> Undo
        </Button>
        
        <Button 
          variant={darkMode ? 'secondary' : 'outline'}
          size="sm" 
          onClick={handleRedo}
          className={darkMode ? 'bg-gray-700 text-white border-gray-600 hover:bg-gray-600' : ''}
        >
          <Redo className="h-4 w-4 mr-1" /> Redo
        </Button>
        
        {activeTool === "pen" && (
          <Popover>
            <PopoverTrigger asChild>
              <Button 
                variant={darkMode ? 'secondary' : 'outline'}
                size="sm"
                className={`flex items-center gap-2 ${darkMode ? 'bg-gray-700 text-white border-gray-600 hover:bg-gray-600' : ''}`}
              >
                <div 
                  className="w-4 h-4 rounded-full" 
                  style={{ backgroundColor: penColor }}
                />
                <span>Pen Options</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className={`w-60 ${darkMode ? 'bg-gray-800 text-white' : ''}`} >
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Color</Label>
                  <div className="flex flex-wrap gap-2">
                    {colors.map((color) => (
                      <div
                        key={color}
                        className={`w-6 h-6 rounded-full cursor-pointer ${penColor === color ? 'ring-2 ring-offset-2 ring-primary' : ''}`}
                        style={{ backgroundColor: color }}
                        onClick={() => handlePenColorChange(color)}
                      />
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label>Size: {penSize}px</Label>
                  </div>
                  <Slider
                    value={[penSize]}
                    min={1}
                    max={10}
                    step={1}
                    onValueChange={handlePenSizeChange}
                  />
                </div>
              </div>
            </PopoverContent>
          </Popover>
        )}
        
        {activeTool === "highlighter" && (
          <Popover>
            <PopoverTrigger asChild>
              <Button 
                variant={darkMode ? 'secondary' : 'outline'}
                size="sm"
                className={`flex items-center gap-2 ${darkMode ? 'bg-gray-700 text-white border-gray-600 hover:bg-gray-600' : ''}`}
              >
                <div 
                  className="w-4 h-4 rounded-full" 
                  style={{ backgroundColor: highlighterColor }}
                />
                <span>Highlighter Options</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className={`w-60 ${darkMode ? 'bg-gray-800 text-white' : ''}`} >
              <div className="space-y-2">
                <Label>Color</Label>
                <div className="flex flex-wrap gap-2">
                  {highlightColors.map((color) => (
                    <div
                      key={color}
                      className={`w-6 h-6 rounded-full cursor-pointer ${highlighterColor === color ? 'ring-2 ring-offset-2 ring-primary' : ''}`}
                      style={{ backgroundColor: color }}
                      onClick={() => handleHighlighterColorChange(color)}
                    />
                  ))}
                </div>
              </div>
            </PopoverContent>
          </Popover>
        )}
        
        {activeTool === "eraser" && (
          <Popover>
            <PopoverTrigger asChild>
              <Button 
                variant={darkMode ? 'secondary' : 'outline'}
                size="sm"
                className={`flex items-center gap-2 ${darkMode ? 'bg-gray-700 text-white border-gray-600 hover:bg-gray-600' : ''}`}
              >
                <Eraser className="h-4 w-4 mr-1" /> <span>Eraser Options</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className={`w-60 ${darkMode ? 'bg-gray-800 text-white' : ''}`} >
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label>Size: {eraserSize}px</Label>
                </div>
                <Slider
                  value={[eraserSize]}
                  min={5}
                  max={50}
                  step={5}
                  onValueChange={handleEraserSizeChange}
                />
              </div>
            </PopoverContent>
          </Popover>
        )}
        
        <Button 
          variant="secondary" 
          size="sm" 
          onClick={handleSave}
          className={darkMode ? 'bg-blue-700 text-white border-gray-600 hover:bg-blue-600' : ''}
        >
          <span className="mr-1">💾</span> Save PDF
        </Button>
      </div>
    </div>
  );
};

export default EditorToolbar;
