export const THEME = {
  // Top navigation bar (all pages)
  topbar: {
    bg: "bg-slate-900",
    text: "text-white",
    navLink: "px-3 py-1.5 text-sm rounded-md text-slate-300 hover:text-white hover:bg-slate-700 transition-colors",
    navLinkActive: "px-3 py-1.5 text-sm rounded-md text-white bg-slate-700",
    divider: "w-px h-5 bg-slate-700",
    logoWrap: "bg-white rounded px-1.5 py-0.5",
  },

  // Sub-header (week navigation bar)
  subheader: {
    bg: "bg-white border-b border-gray-200",
    navBtn: "flex items-center gap-1 px-3 py-1.5 border border-gray-300 rounded-md text-sm hover:bg-gray-100 transition-colors text-gray-700",
    label: "font-semibold text-gray-700",
  },

  // Table header rows (admin + schedule)
  header: {
    row1: "bg-gray-900 text-white",
    row2: "bg-gray-800 text-white",
    // print overrides are kept inline where needed
  },

  // Day column states in header
  day: {
    normal: "text-white",
    normalSubtext: "text-gray-300",
    weekend: "text-gray-300",
    holiday: "text-red-400",
    // print variants
    printNormal: "print:text-black",
    printNormalSubtext: "print:text-gray-700",
    printAccent: "print:text-red-600",
  },

  // Table cell backgrounds
  cell: {
    normal: "bg-white",
    weekend: "bg-gray-100",
    specialNormal: "bg-white",
    specialWeekend: "bg-gray-100",
    dragOver: "bg-blue-50 ring-2 ring-inset ring-blue-400",
    clickTarget: "hover:bg-blue-50 hover:ring-2 hover:ring-inset hover:ring-blue-200",
  },

  // Employee palette (admin drag/click area)
  palette: {
    chip: "bg-slate-500 text-white hover:bg-slate-600 cursor-grab active:cursor-grabbing",
    chipSelected: "bg-slate-800 text-white ring-2 ring-slate-400 scale-105",
    checkIcon: "text-slate-300",
  },

  // Assignment chips inside cells (admin grid)
  chip: {
    normal: "bg-slate-100 border-slate-300",
    normalText: "text-slate-800",
    holiday: "bg-red-50 border-red-200",
    holidayText: "text-red-700",
    pending: "bg-slate-100 border-slate-200 opacity-60",
    removeBtn: "text-slate-400 hover:text-red-500",
  },

  // Schedule (public view) employee name colors
  name: {
    normal: "text-gray-900",
    accent: "text-red-600", // holiday or weekend with custom time
  },
} as const;
