import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import "./styles.css";

import App from "./App";

import { ThemeProvider } from "./context/ThemeContext";
import { SettingsProvider } from "./context/SettingsContext";
import { AuthProvider } from "./context/AuthContext";

createRoot(document.getElementById("root")).render(

    <StrictMode>

        <ThemeProvider>

            <SettingsProvider>

                <AuthProvider>

                    <App />

                </AuthProvider>

            </SettingsProvider>

        </ThemeProvider>

    </StrictMode>

);