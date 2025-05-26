import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DuckSettings from "@/components/DuckSettings";
import PDFViewer from "@/components/PDFViewer";
import EditorToolbar from "@/components/EditorToolbar";
import { ArrowLeft, ArrowRight, ZoomIn, ZoomOut, Maximize2, Minimize2, Github, Linkedin } from "lucide-react";
import { Card } from "@/components/ui/card";
import WelcomeScreen from "@/components/WelcomeScreen";
import Duck from "@/components/Duck";

const defaultMessages = [
  "You're doing amazing! Keep going!",
  "Remember to stretch!",
  "Time to hydrate!",
  "Great progress! You've got this!",
  "Take a short break if needed!",
  "Your focus is impressive!",
  "Reading PDFs like a pro!",
  "Knowledge is power, and you're getting powerful!"
];

const Index = () => {
  const [pdfLoaded, setPdfLoaded] = useState(false);
  const [pdfFile, setPdfFile] = useState<File | undefined>(undefined);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [darkMode, setDarkMode] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  
  // Duck settings
  const [duckEnabled, setDuckEnabled] = useState(true);
  const [duckInterval, setDuckInterval] = useState(5);
  const [duckMessages, setDuckMessages] = useState(defaultMessages);
  const [duckCharacter, setDuckCharacter] = useState("🦆");
  
  // PDF editor settings
  const [activeTool, setActiveTool] = useState("cursor");
  const [penColor, setPenColor] = useState("#000000");
  const [penSize, setPenSize] = useState(2);
  const [highlighterColor, setHighlighterColor] = useState("#FFEB3B");
  const [eraserSize, setEraserSize] = useState(20);
  
  const [fullScreen, setFullScreen] = useState(false);
  
  const [notes, setNotes] = useState<{ [page: number]: string }>({});
  
  const handleFileUpload = (file: File) => {
    console.log("PDF file loaded:", file.name);
    setPdfFile(file);
    setPdfLoaded(true);
  };
  
  const handleOpenSamplePDF = () => {
    setPdfLoaded(true);
  };
  
  const handlePageChange = (direction: 'next' | 'prev') => {
    if (direction === 'next' && currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
    } else if (direction === 'prev' && currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  };
  
  const handleZoom = (direction: 'in' | 'out') => {
    if (direction === 'in' && zoomLevel < 2) {
      setZoomLevel(prev => Math.min(2, prev + 0.1));
    } else if (direction === 'out' && zoomLevel > 0.5) {
      setZoomLevel(prev => Math.max(0.5, prev - 0.1));
    }
  };
  
  const handleToggleTheme = () => {
    setDarkMode(!darkMode);
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <header className="border-b p-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold flex items-center">
          <span className="text-yellow-500 mr-2">🦆</span> 
          LiberLightPDF
        </h1>
        
        <div className="flex items-center space-x-2">
          <a href="https://github.com/manno198" target="_blank" rel="noopener noreferrer" className={`px-3 py-1 h-9 flex items-center justify-center ${darkMode ? 'text-white hover:bg-gray-700' : 'text-gray-900 hover:bg-gray-100'}`} aria-label="GitHub Profile">
            <Github className="h-4 w-4" />
          </a>
          <a href="https://www.linkedin.com/in/harshita-singh-ba0771274/" target="_blank" rel="noopener noreferrer" className={`px-3 py-1 h-9 flex items-center justify-center ${darkMode ? 'text-white hover:bg-gray-700' : 'text-gray-900 hover:bg-gray-100'}`} aria-label="LinkedIn Profile">
            <Linkedin className="h-4 w-4" />
          </a>
          {!fullScreen && (
            <Button 
              variant="outline"
              onClick={() => setFullScreen(true)}
              className={`px-3 py-1 h-9 ${darkMode ? 'bg-gray-700 text-white border-gray-600 hover:bg-gray-600' : ''}`}
            >
              <Maximize2 className="h-4 w-4 mr-1" /> Full Screen
            </Button>
          )}
          {fullScreen && (
            <Button 
              variant="outline"
              onClick={() => setFullScreen(false)}
              className={`px-3 py-1 h-9 ${darkMode ? 'bg-gray-700 text-white border-gray-600 hover:bg-gray-600' : ''}`}
            >
              <Minimize2 className="h-4 w-4 mr-1" /> Exit Full Screen
            </Button>
          )}
          <Button 
            variant="outline" 
            onClick={handleToggleTheme}
            className={`px-3 py-1 h-9 ${darkMode ? 'bg-gray-700 text-white border-gray-600 hover:bg-gray-600' : ''}`}
          >
            {darkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
          </Button>
        </div>
      </header>
      
      <main className={`container mx-auto p-4 ${fullScreen ? 'max-w-full w-full p-0' : ''}`}>
        {!pdfLoaded ? (
          <WelcomeScreen onUpload={handleFileUpload} />
        ) : (
          <div className={`flex ${fullScreen ? 'flex-col w-full h-[calc(100vh-64px)]' : 'grid grid-cols-1 lg:grid-cols-12 gap-4'}`}>
            <div className={`${fullScreen ? 'flex-1 flex flex-col w-full h-full' : 'lg:col-span-9'}`}>
              <Card className={`p-2 mb-4 ${darkMode ? 'bg-gray-800 text-white' : ''}`}>
                <EditorToolbar 
                  onToolChange={setActiveTool}
                  onPenColorChange={setPenColor}
                  onPenSizeChange={setPenSize}
                  onHighlighterColorChange={setHighlighterColor}
                  onEraserSizeChange={setEraserSize}
                  darkMode={darkMode}
                  fullScreen={fullScreen}
                />
              </Card>
              
              <div className={`relative border rounded-lg overflow-hidden ${darkMode ? 'bg-gray-800' : 'bg-white'} ${fullScreen ? 'flex-1 h-full' : ''}`}>
                <PDFViewer 
                  darkMode={darkMode} 
                  zoomLevel={zoomLevel} 
                  pdfFile={pdfFile}
                  activeTool={activeTool}
                  penColor={penColor}
                  penSize={penSize}
                  highlighterColor={highlighterColor}
                  eraserSize={eraserSize}
                  onPageChange={setCurrentPage}
                  onNumPages={setTotalPages}
                  currentPage={currentPage}
                  notes={notes}
                  setNotes={setNotes}
                  fullScreen={fullScreen}
                />
                
                <div className="absolute top-4 right-4 flex flex-col gap-2">
                  <Button 
                    variant="secondary" 
                    size="icon"
                    onClick={() => handleZoom('in')}
                  >
                    <ZoomIn className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="secondary" 
                    size="icon"
                    onClick={() => handleZoom('out')}
                  >
                    <ZoomOut className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
            
            {!fullScreen && (
            <div className="lg:col-span-3">
              <Tabs defaultValue="settings">
                  <TabsList className={`grid w-full grid-cols-3 ${darkMode ? 'bg-gray-800 text-white' : ''}`}>
                  <TabsTrigger value="settings">Settings</TabsTrigger>
                  <TabsTrigger value="info">Info</TabsTrigger>
                    <TabsTrigger value="notes">Notes</TabsTrigger>
                </TabsList>
                
                <TabsContent value="settings">
                    <Card className={`p-4 ${darkMode ? 'bg-gray-800 text-white' : ''}`}>
                    <h3 className="text-lg font-medium mb-4">Duck Settings</h3>
                      <DuckSettings
                        duckEnabled={duckEnabled}
                        setDuckEnabled={setDuckEnabled}
                        duckCharacter={duckCharacter}
                        setDuckCharacter={setDuckCharacter}
                        duckInterval={duckInterval}
                        setDuckInterval={setDuckInterval}
                        duckMessages={duckMessages}
                        setDuckMessages={setDuckMessages}
                      />
                  </Card>
                </TabsContent>
                
                <TabsContent value="info">
                    <Card className={`p-4 ${darkMode ? 'bg-gray-800 text-white' : ''}`}>
                    <h3 className="text-lg font-medium mb-2">PDF Info</h3>
                    {pdfLoaded && (
                      <div className="space-y-2">
                        <p><strong>Filename:</strong> {pdfFile ? pdfFile.name : 'Sample PDF'}</p>
                        <p><strong>Pages:</strong> {totalPages}</p>
                        <p><strong>Current Page:</strong> {currentPage}</p>
                        <p><strong>Zoom Level:</strong> {Math.round(zoomLevel * 100)}%</p>
                      </div>
                    )}
                  </Card>
                </TabsContent>
                  
                  <TabsContent value="notes">
                    <Card className={`p-4 ${darkMode ? 'bg-gray-800 text-white' : ''}`}>
                      <h3 className="text-lg font-medium mb-2">Notes for Page {currentPage}</h3>
                      <textarea
                        className="w-full min-h-[80px] p-2 rounded border border-gray-300 text-gray-900"
                        style={darkMode ? { background: '#222', color: '#fff', borderColor: '#444' } : {}}
                        value={notes[currentPage] || ''}
                        onChange={e => setNotes({ ...notes, [currentPage]: e.target.value })}
                        placeholder="Write your notes for this page..."
                      />
                      <div className="mt-4">
                        <h4 className="font-semibold mb-2">All Notes</h4>
                        <ul className="text-sm max-h-40 overflow-y-auto">
                          {Object.entries(notes).map(([page, note]) => (
                            <li key={page} className="mb-2">
                              <span className="font-bold">Page {page}:</span> {note}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </Card>
                  </TabsContent>
              </Tabs>
            </div>
            )}
          </div>
        )}
      </main>
      
      {/* Footer for "Developed by" text */}
      <footer className={`fixed bottom-0 left-0 right-0 h-8 bg-black text-white flex items-center justify-center text-sm`}>
        <span>Developed by Harshita Singh</span>
      </footer>

      {/* Duck component for motivation */}
      <Duck
        interval={duckInterval}
        messages={duckMessages}
        character={duckCharacter}
        enabled={duckEnabled && pdfLoaded}
      />
    </div>
  );
};

export default Index;
