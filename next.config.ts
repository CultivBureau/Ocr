import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    // Get Bitrix24 domains from environment variable (comma-separated)
    const bitrixDomains = process.env.NEXT_PUBLIC_BITRIX24_DOMAINS?.split(',')
      .map(d => d.trim())
      .filter(Boolean) || [];
    
    // Allow all origins for testing if no domains specified, restrict in production
    const frameAncestors = bitrixDomains.length > 0 
      ? bitrixDomains.join(' ') 
      : '*';
    
    return [
      {
        // Apply to all routes
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: `frame-ancestors ${frameAncestors};`,
          },
          // Note: X-Frame-Options is not needed as CSP frame-ancestors takes precedence
        ],
      },
    ];
  },
};

export default nextConfig;
