import { useState, useEffect } from "react";

const useTheme = () => {
    const [theme, setTheme] = useState("dark");

    useEffect(() => {
        // Read user preference from system settings
        const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
        setTheme(systemTheme);
    }, []);

    useEffect(() => {
        document.body.setAttribute("data-theme", theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme((prev) => (prev === "light" ? "dark" : "light"));
    };

    return { theme, toggleTheme };
};

export default useTheme;
