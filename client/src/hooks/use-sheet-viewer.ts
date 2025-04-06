import { useState, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";

export function useSheetViewer() {
  // Retrieve settings from API
  const { data: settings } = useQuery({
    queryKey: ["/api/settings"],
  });

  // State for sheet viewer
  const [zoom, setZoom] = useState(100);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [brightness, setBrightness] = useState(100);
  const [scrollSpeed, setScrollSpeed] = useState(5);
  const [isAutoScrolling, setIsAutoScrolling] = useState(false);
  
  // Reference to auto scroll interval
  const scrollIntervalRef = useRef<number | null>(null);
  
  // Initialize values from settings
  useEffect(() => {
    if (settings) {
      setZoom(settings.defaultZoom);
      setBrightness(settings.defaultBrightness);
      setScrollSpeed(settings.defaultScrollSpeed);
    }
  }, [settings]);

  // Zoom functions
  const zoomIn = () => setZoom((prev) => Math.min(prev + 10, 200));
  const zoomOut = () => setZoom((prev) => Math.max(prev - 10, 50));
  
  // Page navigation
  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
    }
  };
  
  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };
  
  // Auto-scroll functions
  const startAutoScroll = () => {
    if (scrollIntervalRef.current) {
      window.clearInterval(scrollIntervalRef.current);
    }
    
    setIsAutoScrolling(true);
    
    scrollIntervalRef.current = window.setInterval(() => {
      window.scrollBy({ top: scrollSpeed, behavior: 'smooth' });
    }, 100);
  };
  
  const stopAutoScroll = () => {
    if (scrollIntervalRef.current) {
      window.clearInterval(scrollIntervalRef.current);
      scrollIntervalRef.current = null;
    }
    
    setIsAutoScrolling(false);
  };
  
  // Clean up interval on unmount
  useEffect(() => {
    return () => {
      if (scrollIntervalRef.current) {
        window.clearInterval(scrollIntervalRef.current);
      }
    };
  }, []);

  return {
    zoom,
    setZoom,
    zoomIn,
    zoomOut,
    currentPage,
    setCurrentPage,
    totalPages,
    setTotalPages,
    brightness,
    setBrightness,
    scrollSpeed,
    setScrollSpeed,
    isAutoScrolling,
    startAutoScroll,
    stopAutoScroll,
  };
}
