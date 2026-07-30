import React from "react";

export default function GeometricPattern() {
  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: "100%",
        height: "100%",
        overflow: "hidden",
        pointerEvents: "none",
        zIndex: 1,
      }}
    >
      <svg
        width="100%"
        height="100%"
        style={{ opacity: 0.95 }}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Subtle gold repeating stripes pattern */}
          <pattern
            id="stripes-pattern"
            width="40"
            height="40"
            patternUnits="userSpaceOnUse"
            patternTransform="rotate(45)"
          >
            <line
              x1="0"
              y1="0"
              x2="0"
              y2="40"
              stroke="rgba(252, 211, 133, 0.04)"
              strokeWidth="1.5"
            />
          </pattern>

          {/* Gradients for the overlapping diagonal blocks */}
          <linearGradient id="diagonal-grad-1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgba(255, 255, 255, 0.015)" />
            <stop offset="50%" stopColor="rgba(255, 255, 255, 0.005)" />
            <stop offset="100%" stopColor="transparent" />
          </linearGradient>

          <linearGradient id="diagonal-grad-2" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="rgba(252, 211, 133, 0.01)" />
            <stop offset="100%" stopColor="transparent" />
          </linearGradient>

          {/* Shadow filter to replicate the overlapping depth */}
          <filter id="shadow-effect" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow
              dx="-4"
              dy="4"
              stdDeviation="8"
              floodColor="#000000"
              floodOpacity="0.7"
            />
          </filter>
        </defs>

        {/* 1. Large broad diagonal panels matching the user's reference layout */}
        <path
          d="M -100,-100 L 400,-100 L 100,1000 L -400,1000 Z"
          fill="url(#diagonal-grad-1)"
          filter="url(#shadow-effect)"
        />

        <path
          d="M 250,-100 L 750,-100 L 450,1000 L -50,1000 Z"
          fill="url(#diagonal-grad-1)"
          filter="url(#shadow-effect)"
        />

        <path
          d="M 600,-100 L 1100,-100 L 800,1000 L 300,1000 Z"
          fill="url(#diagonal-grad-2)"
          filter="url(#shadow-effect)"
        />

        <path
          d="M 950,-100 L 1500,-100 L 1200,1000 L 650,1000 Z"
          fill="url(#diagonal-grad-1)"
          filter="url(#shadow-effect)"
        />

        {/* 2. Groups of fine parallel lines matching the reference pattern */}
        <g transform="translate(100, 150) rotate(-45)">
          <line x1="0" y1="0" x2="300" y2="0" stroke="rgba(255, 255, 255, 0.035)" strokeWidth="1" />
          <line x1="0" y1="12" x2="300" y2="12" stroke="rgba(255, 255, 255, 0.035)" strokeWidth="1" />
          <line x1="0" y1="24" x2="300" y2="24" stroke="rgba(255, 255, 255, 0.035)" strokeWidth="1" />
          <line x1="0" y1="36" x2="300" y2="36" stroke="rgba(255, 255, 255, 0.035)" strokeWidth="1" />
          <line x1="0" y1="48" x2="300" y2="48" stroke="rgba(255, 255, 255, 0.035)" strokeWidth="1" />
        </g>

        <g transform="translate(700, 500) rotate(-45)">
          <line x1="0" y1="0" x2="400" y2="0" stroke="rgba(252, 211, 133, 0.025)" strokeWidth="1" />
          <line x1="0" y1="12" x2="400" y2="12" stroke="rgba(252, 211, 133, 0.025)" strokeWidth="1" />
          <line x1="0" y1="24" x2="400" y2="24" stroke="rgba(252, 211, 133, 0.025)" strokeWidth="1" />
          <line x1="0" y1="36" x2="400" y2="36" stroke="rgba(252, 211, 133, 0.025)" strokeWidth="1" />
          <line x1="0" y1="48" x2="400" y2="48" stroke="rgba(252, 211, 133, 0.025)" strokeWidth="1" />
        </g>

        {/* 3. Areas filled with the diagonal stripes texture */}
        <rect
          x="35%"
          y="20%"
          width="120"
          height="320"
          fill="url(#stripes-pattern)"
          transform="rotate(15 400 300)"
        />
        <rect
          x="75%"
          y="40%"
          width="180"
          height="400"
          fill="url(#stripes-pattern)"
          transform="rotate(15 900 600)"
        />

        {/* 4. Individual long diagonal grid dividers */}
        <line
          x1="-200"
          y1="800"
          x2="1600"
          y2="-100"
          stroke="rgba(252, 211, 133, 0.015)"
          strokeWidth="3.5"
        />
        <line
          x1="-200"
          y1="500"
          x2="1600"
          y2="-400"
          stroke="rgba(255, 255, 255, 0.008)"
          strokeWidth="1.5"
        />
      </svg>
    </div>
  );
}
