
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface DuckProps {
  interval: number; // in minutes
  messages: string[];
  character: string;
  enabled: boolean;
}

const Duck: React.FC<DuckProps> = ({ interval, messages, character, enabled }) => {
  const [visible, setVisible] = useState(false);
  const [currentMessage, setCurrentMessage] = useState("");
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (!enabled) return;
    
    // Set interval for duck appearance
    const intervalId = setInterval(() => {
      // Choose random message
      const randomMessage = messages[Math.floor(Math.random() * messages.length)];
      setCurrentMessage(randomMessage);
      
      // Choose random position (respecting viewport bounds)
      const maxX = window.innerWidth - 200;
      const maxY = window.innerHeight - 100;
      const randomX = Math.max(50, Math.floor(Math.random() * maxX));
      const randomY = Math.max(50, Math.floor(Math.random() * maxY));
      setPosition({ x: randomX, y: randomY });
      
      // Show duck
      setVisible(true);
      
      // Hide duck after 5 seconds
      setTimeout(() => {
        setVisible(false);
      }, 5000);
    }, interval * 60 * 1000); // Convert minutes to milliseconds
    
    // For demo purposes, show duck after 3 seconds initially
    const initialTimeout = setTimeout(() => {
      if (enabled && messages.length > 0) {
        const randomMessage = messages[Math.floor(Math.random() * messages.length)];
        setCurrentMessage(randomMessage);
        
        const maxX = window.innerWidth - 200;
        const maxY = window.innerHeight - 100;
        const randomX = Math.max(50, Math.floor(Math.random() * maxX));
        const randomY = Math.max(50, Math.floor(Math.random() * maxY));
        setPosition({ x: randomX, y: randomY });
        
        setVisible(true);
        
        setTimeout(() => {
          setVisible(false);
        }, 5000);
      }
    }, 3000);
    
    return () => {
      clearInterval(intervalId);
      clearTimeout(initialTimeout);
    };
  }, [enabled, interval, messages]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed z-50 pointer-events-none"
          style={{ 
            top: position.y,
            left: position.x
          }}
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
        >
          <div className="flex items-center">
            <motion.div
              className="text-4xl"
              animate={{
                y: [0, -10, 0],
              }}
              transition={{
                repeat: Infinity,
                duration: 2,
                ease: "easeInOut",
              }}
            >
              {character}
            </motion.div>
            
            <motion.div
              className="ml-2 p-2 bg-yellow-100 rounded-lg shadow-md max-w-xs"
              initial={{ opacity: 0, scale: 0.8, x: -5 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="text-sm font-medium text-yellow-800">
                {currentMessage}
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Duck;
