import React from "react";

interface SheetLinkProps {
  sheetUrl: string;
  label?: string;
}

const GoogleSheetsIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    {/* Grid background */}
    <rect x="3" y="3" width="18" height="18" rx="2" fill="#0F9D58" />
    {/* White grid lines */}
    <rect x="7" y="3" width="4" height="18" fill="#FFFFFF" opacity="0.9" />
    <rect x="13" y="3" width="4" height="18" fill="#FFFFFF" opacity="0.9" />
    <rect x="3" y="7" width="18" height="4" fill="#FFFFFF" opacity="0.9" />
    <rect x="3" y="13" width="18" height="4" fill="#FFFFFF" opacity="0.9" />
  </svg>
);

export default function SheetLink({ sheetUrl, label = "Open Sheet" }: SheetLinkProps) {
  return (
    <a
      href={sheetUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium px-3 py-1.5 rounded-md transition-colors"
    >
      <GoogleSheetsIcon className="w-4 h-4" />
      {label}
    </a>
  );
}
