import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

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

interface DuckSettingsProps {
  duckEnabled: boolean;
  setDuckEnabled: (val: boolean) => void;
  duckCharacter: string;
  setDuckCharacter: (val: string) => void;
  duckInterval: number;
  setDuckInterval: (val: number) => void;
  duckMessages: string[];
  setDuckMessages: (val: string[]) => void;
}

const DuckSettings: React.FC<DuckSettingsProps> = ({
  duckEnabled,
  setDuckEnabled,
  duckCharacter,
  setDuckCharacter,
  duckInterval,
  setDuckInterval,
  duckMessages,
  setDuckMessages
}) => {
  const [customMessages, setCustomMessages] = useState("");
  const [showMessageEditor, setShowMessageEditor] = useState(false);
  const availableDucks = ["🦆", "🐤", "🐥", "🐣", "🦢", "🦩", "🦚", "🐧"];

  const handleIntervalChange = (value: number[]) => {
    setDuckInterval(value[0]);
  };
  
  const handleDuckChange = (duck: string) => {
    setDuckCharacter(duck);
  };

  const handleSaveMessages = () => {
    if (customMessages.trim()) {
      setDuckMessages(customMessages.split("\n").map(m => m.trim()).filter(Boolean));
    } else {
      setDuckMessages(defaultMessages);
    }
    setShowMessageEditor(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label htmlFor="duck-toggle">Motivational Duck</Label>
          <p className="text-sm text-muted-foreground">
            Enable duck motivation while reading
          </p>
        </div>
        <Switch 
          id="duck-toggle"
          checked={duckEnabled}
          onCheckedChange={setDuckEnabled}
        />
      </div>

      {duckEnabled && (
        <>
          <div className="space-y-3">
            <div className="flex justify-between items-end">
              <Label>Duck character</Label>
            </div>
            <div className="flex flex-wrap gap-2">
              {availableDucks.map(duck => (
                <button
                  key={duck}
                  onClick={() => handleDuckChange(duck)}
                  className={`text-2xl p-2 border rounded-md hover:bg-primary/10 transition-colors ${duckCharacter === duck ? 'border-primary bg-primary/10' : 'border-gray-200'}`}
                >
                  {duck}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-end">
              <Label>Appearance interval: {duckInterval} minutes</Label>
            </div>
            <Slider
              value={[duckInterval]}
              min={1}
              max={15}
              step={1}
              onValueChange={handleIntervalChange}
              className="my-4"
            />
          </div>

          <div className="space-y-3">
            <div className="flex justify-between">
              <div className="space-y-0.5">
                <Label>Motivational messages</Label>
                <p className="text-sm text-muted-foreground">
                  The duck will display these randomly
                </p>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowMessageEditor(!showMessageEditor)}
                className={typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'bg-gray-700 text-white border-gray-600 hover:bg-gray-600' : ''}
              >
                {showMessageEditor ? 'Cancel' : 'Customize'}
              </Button>
            </div>

            {showMessageEditor ? (
              <div className="space-y-3 mt-2">
                <Textarea
                  placeholder="Enter custom motivational messages, one per line"
                  value={customMessages}
                  onChange={(e) => setCustomMessages(e.target.value)}
                  rows={6}
                  className="dark:text-white dark:bg-gray-800 dark:border-gray-600 bg-white text-gray-900 border-gray-300"
                />
                <div className="text-xs text-muted-foreground">
                  Enter one message per line. Leave empty to use default messages.
                </div>
                <Button onClick={handleSaveMessages} className="w-full">
                  Save Messages
                </Button>
              </div>
            ) : (
              <div className="border rounded-md p-2 h-20 overflow-y-auto">
                <ul className="text-sm text-muted-foreground">
                  {duckMessages.slice(0, 3).map((message, idx) => (
                    <li key={idx} className="mb-1">• {message}</li>
                  ))}
                  <li className="text-xs italic">...and {duckMessages.length - 3} more</li>
                </ul>
              </div>
            )}
          </div>

          <div className="mt-4 p-3 bg-yellow-50 text-yellow-800 rounded-md text-sm">
            <div className="flex items-start">
              <div className="mr-2 text-xl">{duckCharacter}</div>
              <div>
                <p className="font-medium">Duck Preview</p>
                <p className="text-xs">
                  Your duck will appear every {duckInterval} minutes with a motivational message.
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default DuckSettings;
