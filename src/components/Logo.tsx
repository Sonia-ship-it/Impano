import React from "react";

interface LogoProps {
  size?: number;
}

export default function Logo({ size = 48 }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: "inline-block", verticalAlign: "middle" }}
    >
      <defs>
        {/* Metallic gold gradient for the 3D shiny effect */}
        <linearGradient id="gold-metallic" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFE259">
            <animate attributeName="stop-color" values="#FFE259;#FCD385;#FFA751;#EA8D24;#FFE259" dur="8s" repeatCount="indefinite" />
          </stop>
          <stop offset="30%" stopColor="#FCD385">
            <animate attributeName="stop-color" values="#FCD385;#FFA751;#EA8D24;#FFE259;#FCD385" dur="8s" repeatCount="indefinite" />
          </stop>
          <stop offset="70%" stopColor="#FFA751">
            <animate attributeName="stop-color" values="#FFA751;#EA8D24;#FFE259;#FCD385;#FFA751" dur="8s" repeatCount="indefinite" />
          </stop>
          <stop offset="100%" stopColor="#EA8D24">
            <animate attributeName="stop-color" values="#EA8D24;#FFE259;#FCD385;#FFA751;#EA8D24" dur="8s" repeatCount="indefinite" />
          </stop>
        </linearGradient>
        
        {/* Glow and bevel shadow filter */}
        <filter id="logo-glow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="1" dy="1.5" stdDeviation="1" floodColor="#000000" floodOpacity="0.8" />
        </filter>
      </defs>

      {/* Double Gold Ring Outlines */}
      <circle cx="50" cy="50" r="46" stroke="url(#gold-metallic)" strokeWidth="1.5" />
      <circle cx="50" cy="50" r="43" stroke="url(#gold-metallic)" strokeWidth="0.8" />
      
      {/* Background circle */}
      <circle cx="50" cy="50" r="42" fill="transparent" />

      {/* "IE" Monogram with Georgia/Playfair font styling */}
      <text
        x="49"
        y="58"
        fontFamily="Georgia, 'Times New Roman', Times, serif"
        fontSize="34"
        fontWeight="bold"
        fill="url(#gold-metallic)"
        textAnchor="middle"
        letterSpacing="-1.5"
        filter="url(#logo-glow)"
      >
        IE
      </text>

      {/* "Impano Ent" Subtext below the monogram */}
      <text
        x="50"
        y="78"
        fontFamily="Georgia, 'Times New Roman', Times, serif"
        fontSize="7.5"
        fontWeight="bold"
        fill="url(#gold-metallic)"
        textAnchor="middle"
        letterSpacing="0.5"
      >
        Impano Ent
      </text>
    </svg>
  );
}
