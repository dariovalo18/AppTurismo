import { useContext } from "react";
import { ThemeContext } from "@/providers/ThemeProvider";

// export const useTema = () => useContext(ThemeContext);


export function useTheme() {
    const context = useContext(ThemeContext);


    if (!context) {
        throw new Error("useTheme must be used within a ThemeProvider");
    }

    return context;
}
