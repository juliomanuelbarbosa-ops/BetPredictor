import React from 'react';

export const SpartaLogo = ({ className = "w-8 h-8", ...props }: React.SVGProps<SVGSVGElement>) => {
    return (
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} {...props}>
            <defs>
                <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="1" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
            </defs>
            
            {/* Tech Crest / Bar Chart */}
            <path 
                d="M12 0 L12 5 M8 1.5 L8 6 M16 1.5 L16 6 M4 5 L4 8 M20 5 L20 8" 
                stroke="#10b981" 
                strokeWidth="2" 
                strokeLinecap="round" 
            />
            
            {/* Helmet Main Body */}
            <path 
                d="M 3 10 C 3 2, 21 2, 21 10 L 21 22 L 16 17 L 16 13 L 14 13 L 14 18 L 10 18 L 10 13 L 8 13 L 8 17 L 3 22 Z" 
                fill="currentColor" 
            />
            
            {/* Glowing Eyes */}
            <g filter="url(#glow)" className="animate-pulse text-emerald-400">
                <rect x="7.5" y="13.5" width="2.5" height="2" fill="currentColor" />
                <rect x="14" y="13.5" width="2.5" height="2" fill="currentColor" />
            </g>
        </svg>
    );
};
