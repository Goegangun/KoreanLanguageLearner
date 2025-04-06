import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { ThemeProvider } from "./context/ThemeContext";
import { NetworkProvider } from "./context/NetworkContext";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";

// Service worker registration disabled temporarily
// We'll add proper PWA support later

createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <NetworkProvider>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </NetworkProvider>
  </QueryClientProvider>
);
