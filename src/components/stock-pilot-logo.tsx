
export const StockPilotLogo = () => (
  <div className="mx-auto mb-4 flex h-40 w-40 items-center justify-center rounded-full bg-white p-4 shadow-md">
    <svg
      className="h-full w-full text-black"
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Graph Axis */}
      <path d="M20 80H80" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M20 20V80" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M20 35H25" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M20 50H25" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M20 65H25" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M35 80V75" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M50 80V75" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M65 80V75" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />

      {/* Graph Line */}
      <path
        d="M25 60C30 50, 35 70, 40 65C45 60, 50 40, 55 45C60 50, 65 30, 70 35C75 40, 80 25, 85 30"
        stroke="currentColor"
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Clock */}
      <g stroke="#90EE90">
        <circle cx="75" cy="65" r="14" fill="#90EE90" fillOpacity="0.1" />
        <path d="M75 60 V65 H79" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </g>
    </svg>
  </div>
);
