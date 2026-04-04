"use client";

import { useEffect } from "react";

/**
 * IframeDetector Component
 * 
 * Detects if the application is running inside an iframe and:
 * - Adds CSS class to body for iframe-specific styling
 * - Optionally sends ready message to parent window (Bitrix24)
 * - Handles postMessage communication if needed
 */
export default function IframeDetector() {
  useEffect(() => {
    // Check if running inside iframe
    const isInIframe = window.self !== window.top;
    
    if (isInIframe) {
      // Add class to body for iframe-specific styling
      document.body.classList.add("in-iframe");
      
      // Optional: Send message to parent (Bitrix24) about iframe ready
      // This can be used by Bitrix24 to adjust iframe size or handle events
      if (window.parent && window.parent !== window.self) {
        try {
          window.parent.postMessage(
            { 
              type: "PDF_CONVERTER_READY", 
              source: "pdf-converter",
              url: window.location.href
            },
            "*" // In production, specify specific Bitrix24 domain for security
          );
        } catch (error) {
          // Silently fail if postMessage is not allowed (cross-origin restrictions)
          console.debug("Could not send message to parent window:", error);
        }
      }
      
      // Optional: Listen for messages from parent (Bitrix24)
      const handleMessage = (event: MessageEvent) => {
        // Verify origin in production for security
        // if (event.origin !== "https://yourcompany.bitrix24.com") return;
        
        if (event.data && event.data.type === "BITRIX24_RESIZE") {
          // Handle resize requests from Bitrix24 if needed
          // This is optional and depends on Bitrix24 implementation
        }
      };
      
      window.addEventListener("message", handleMessage);
      
      return () => {
        document.body.classList.remove("in-iframe");
        window.removeEventListener("message", handleMessage);
      };
    }
    
    return () => {
      document.body.classList.remove("in-iframe");
    };
  }, []);

  // This component doesn't render anything
  return null;
}
