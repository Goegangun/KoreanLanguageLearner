import { WifiIcon, WifiOffIcon, MoonIcon, SunIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";

export default function Header() {
  // Temporarily use local state instead of the theme context
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  
  // Setup online/offline listeners
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);
  
  // Update based on HTML class
  useEffect(() => {
    setIsDarkMode(document.documentElement.classList.contains("dark"));
  }, []);
  
  const toggleDarkMode = () => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);
    if (newDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem('darkMode', String(newDarkMode));
  };

  return (
    <header className="bg-white dark:bg-neutral-900 shadow-md px-4 py-3 flex justify-between items-center">
      <div className="flex items-center">
        <h1 className="text-xl font-semibold text-primary dark:text-blue-400">
          ScoreScroll
        </h1>
      </div>

      <div className="flex items-center">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleDarkMode}
          className="rounded-full"
        >
          {isDarkMode ? (
            <SunIcon className="h-5 w-5" />
          ) : (
            <MoonIcon className="h-5 w-5" />
          )}
        </Button>

        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "ml-2 flex items-center rounded-full text-sm",
            isOnline
              ? "bg-secondary text-white hover:bg-secondary/90"
              : "bg-neutral-500 text-white hover:bg-neutral-500/90"
          )}
        >
          {isOnline ? (
            <>
              <WifiIcon className="h-4 w-4 mr-1" />
              온라인
            </>
          ) : (
            <>
              <WifiOffIcon className="h-4 w-4 mr-1" />
              오프라인
            </>
          )}
        </Button>
      </div>
    </header>
  );
}
