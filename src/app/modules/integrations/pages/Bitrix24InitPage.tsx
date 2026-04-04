"use client";

import { useEffect } from 'react';

export default function Bitrix24Init() {
  useEffect(() => {
    // Load Bitrix24 SDK script
    const script = document.createElement('script');
    script.src = '//api.bitrix24.com/api/v1/';
    script.async = true;
    
    script.onload = () => {
      // @ts-ignore - BX24 is loaded from external script
      if (typeof BX24 !== 'undefined') {
        // @ts-ignore
        BX24.init(function() {
          // Get current user info from Bitrix24
          // @ts-ignore
          BX24.callMethod('user.current', {}, function(result: any) {
            if(result.error()) {
              console.error('Error getting user:', result.error());
              alert('Failed to authenticate with Bitrix24: ' + result.error());
            } else {
              const user = result.data();
              console.log('Bitrix24 user:', user);
              
              // Redirect to main app with user info
              const redirectUrl = new URL(window.location.origin);
              redirectUrl.searchParams.set('bitrix24', 'true');
              redirectUrl.searchParams.set('bitrix24_user_id', user.ID);
              redirectUrl.searchParams.set('bitrix24_email', user.EMAIL || '');
              redirectUrl.searchParams.set('bitrix24_name', `${user.NAME} ${user.LAST_NAME}`.trim());
              
              window.location.href = redirectUrl.toString();
            }
          });
        });
      }
    };
    
    document.head.appendChild(script);
    
    return () => {
      // Cleanup
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, []);

  return (
    <div style={{
      margin: 0,
      padding: 0,
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      width: '100vw',
      position: 'fixed',
      top: 0,
      left: 0,
    }}>
      <div style={{
        textAlign: 'center',
        color: 'white',
      }}>
        <div style={{
          border: '4px solid rgba(255,255,255,0.3)',
          borderTop: '4px solid white',
          borderRadius: '50%',
          width: '50px',
          height: '50px',
          animation: 'spin 1s linear infinite',
          margin: '0 auto 20px',
        }} />
        <h2>Loading Bureau OCR...</h2>
        <p>Authenticating with Bitrix24...</p>
      </div>
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
