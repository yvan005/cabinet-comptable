import { useState, useEffect } from "react";

// Détecte si l'app tourne sur un écran mobile (largeur ou user-agent), avec re-check au resize.
const useIsMobile = () => {
  const getIsMobile = () => {
    if (typeof window === "undefined") return false;
    return window.innerWidth <= 768 ||
      /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);
  };
  const [isMobile, setIsMobile] = useState(getIsMobile);
  useEffect(() => {
    const handler = () => setIsMobile(getIsMobile());
    window.addEventListener("resize", handler);
    // Force re-check after mount (fixes mobile initial render)
    setTimeout(() => setIsMobile(getIsMobile()), 100);
    return () => window.removeEventListener("resize", handler);
  }, []);
  return isMobile;
};

export default useIsMobile;
