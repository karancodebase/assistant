import { useState, useEffect } from "react";

const useTheme = () => {
    const [theme, setTheme] = useState<"light" | "dark">(() => {
        if (typeof window !== "undefined") {
            return localStorage.getItem("theme") as "light" | "dark" || 
                (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
        }
        return "light"; // Default theme
    });

    useEffect(() => {
        if (typeof window !== "undefined") {
            document.documentElement.classList.remove("light", "dark");
            document.documentElement.classList.add(theme);
            localStorage.setItem("theme", theme);
        }
    }, [theme]);

    const toggleTheme = () => {
        setTheme((prev) => (prev === "light" ? "dark" : "light"));
    };

    return { theme, toggleTheme };
};

export default useTheme;