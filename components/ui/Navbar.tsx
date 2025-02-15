"use client";

import { Menu } from "lucide-react";
import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import useTheme from "../hooks/useTheme";

export default function Navbar() {
  const { toggleTheme } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [progress, setProgress] = useState(100);


  // Ensure theme only runs on client

  const handleClick = () => {
    setIsMenuOpen(!isMenuOpen);
    setShowAlert(true);
    setProgress(100);
  };

  useEffect(() => {
    if (!showAlert) return;

    const interval = setInterval(() => {
      setProgress((prev) => (prev > 0 ? prev - 2 : 0));
    }, 100);

    const timeout = setTimeout(() => {
      setShowAlert(false);
      clearInterval(interval);
      setProgress(100);
    }, 5000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [showAlert]);

  return (
    <div className="fixed top-0 left-0 w-full backdrop-blur-3xl z-50">
      <div className="mx-auto px-4 lg:px-[29rem]">
        <div className="flex justify-between mt-1 rounded-full border border-zinc-500 dark:border-gray-600 bg-transparent px-3 py-1 text-base shadow-sm transition-colors backdrop-blur-md backdrop-brightness-95 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-400 dark:focus-visible:ring-gray-500">
          <div className="flex items-center gap-2">
            <Avatar>
              <AvatarImage src="https://github.com/shadcn.png" />
              <AvatarFallback>AS</AvatarFallback>
            </Avatar>
            <h1 className="font-semibold">Aeris</h1>
          </div>

          <div className="flex gap-4 items-center">
            <Switch onClick={toggleTheme} />
            <button className="relative" onClick={handleClick}>
              {showAlert && (
                <div className="fixed top-10 left-1/2 transform -translate-x-1/2 bg-gray-300 text-black px-6 py-3 rounded-lg shadow-lg transition-all animate-drop">
                  <p className="text-center font-medium">
                    Feature under development...
                  </p>
                  <div className="h-1 bg-gray-200 dark:bg-gray-700 mt-2 w-full rounded overflow-hidden">
                    <div
                      className="h-full bg-blue-500 transition-[width] duration-[4800ms] ease-linear"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              )}
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes drop {
          from {
            transform: translate(-50%, -100%);
            opacity: 0;
          }
          to {
            transform: translate(-50%, 0);
            opacity: 1;
          }
        }
        .animate-drop {
          animation: drop 0.5s ease-out;
        }
      `}</style>
    </div>
  );
}
