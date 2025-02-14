"use client";
import Image from "next/image";
import { Menu} from "lucide-react";
import { useEffect, useState } from "react";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [progress, setProgress] = useState(100);

  const handleClick = () => {
    setIsMenuOpen(!isMenuOpen);
    setShowAlert(true);
    setProgress(100);

    setTimeout(() => setShowAlert(false), 5000);
  };
  useEffect(() => {
    if (showAlert) {
      setTimeout(() => setProgress(0), 100); // Smoothly shrink progress bar
    }
  }, [showAlert]);
  
  return (
    
      <div className="fixed top-0 left-0 w-full  backdrop-blur-3xl z-50">
        <div className="mx-auto px-4 lg:px-[29rem]">
          <div className="flex justify-between bg-gray-900 mt-1 rounded-full px-4 gap-10 items-center h-10">
            <div className="flex justify-center items-center gap-2">
              <Image
                src="/globe.svg"
                alt="name"
                width={24}
                height={24}
                className="rounded-full"
              />
              <h1 className="font-semibold text-gray-50">Aeris</h1>
            </div>
            <button className="text-gray-50" onClick={handleClick}>
              {showAlert && (
                <div className="fixed top-10 left-1/2 transform -translate-x-1/2 bg-gray-300 text-black px-6 py-3 rounded-lg shadow-lg transition-all duration-500 animate-drop">
                  <p className="text-center font-medium">
                    Feature under development...
                  </p>
                  <div className="h-1 bg-gray-300 mt-2 w-full rounded overflow-hidden">
                    <div
                      className="h-full bg-blue-500 transition-[width] duration-[4800ms] ease-linear"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                </div>
              )}
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

              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>
    
  );
}
