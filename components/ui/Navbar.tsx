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
    <div className="">
      <div className="">
        <div className="z-50 backdrop-blur-3xl w-[90vw] lg:w-[40vw] px-4 py-2 mt-4 flex flex-row justify-between items-center border border-neutral-600 hover:border-neutral-400 rounded-xl hover:rounded-none duration-300">
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