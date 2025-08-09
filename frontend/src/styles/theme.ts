export const theme = {
  button: {
    primary:
      "cursor-pointer relative overflow-hidden bg-gradient-to-tr from-blue-600 via-blue-500 to-blue-400 text-white px-2 py-2 rounded-lg shadow-md transition-all duration-200 flex items-center justify-center gap-1.5 font-semibold tracking-wide focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2   text-base " +
      "hover:from-blue-700 hover:to-blue-500 hover:shadow-xl hover:brightness-105 hover:ring-2 hover:ring-blue-300",
    secondary:
      "cursor-pointer relative overflow-hidden bg-gradient-to-tr from-gray-100 via-gray-50 to-gray-200 text-gray-900 px-2 py-2 rounded-lg shadow-sm transition-all duration-200 flex items-center justify-center gap-1.5 font-medium tracking-wide focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2   dark:bg-gradient-to-tr dark:from-gray-800 dark:via-gray-700 dark:to-gray-900 dark:text-gray-100 text-base " +
      "hover:from-gray-200 hover:to-gray-300 hover:shadow-lg hover:brightness-105 hover:ring-2 hover:ring-gray-300 dark:hover:from-gray-700 dark:hover:to-gray-800",
    destructive:
      "cursor-pointer relative overflow-hidden bg-gradient-to-tr from-red-600 via-red-500 to-pink-500 text-white px-2 py-2 rounded-lg shadow-md transition-all duration-200 flex items-center justify-center gap-1.5 font-semibold tracking-wide focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2   text-base " +
      "hover:from-red-700 hover:to-pink-600 hover:shadow-xl hover:brightness-105 hover:ring-2 hover:ring-red-300",
    danger:
      "cursor-pointer relative overflow-hidden bg-gradient-to-tr from-red-600 via-red-500 to-pink-500 text-white px-2 py-2 rounded-lg shadow-md transition-all duration-200 flex items-center justify-center gap-1.5 font-semibold tracking-wide focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2   text-base " +
      "hover:from-red-700 hover:to-pink-600 hover:shadow-xl hover:brightness-105 hover:ring-2 hover:ring-red-300",
  },
  card: {
    base: "bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow duration-300",
    interactive:
      "cursor-pointer hover:scale-[1.02] transition-all duration-300",
    roomCard:
      "group relative bg-white dark:bg-gray-900 rounded-xl shadow border border-gray-200 dark:border-gray-800 transition-all duration-200 cursor-pointer overflow-hidden " +
      "hover:border-blue-400 " +
      "before:content-[''] before:absolute before:inset-0 before:rounded-xl before:pointer-events-none " +
      "before:transition-all before:duration-200 " +
      "before:opacity-0 hover:before:opacity-100 " +
      "before:border-2 before:border-blue-400 before:border-solid before:shadow-[0_0_8px_0_rgba(59,130,246,0.15)] " +
      "before:z-10",
  },
  input: {
    base: "text-white w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300",
    withIcon: "pl-10",
    error: "border-red-500 focus:ring-red-500",
  },
  text: {
    title: "text-2xl font-semibold text-gray-900 dark:text-white",
    subtitle: "text-sm text-gray-500 dark:text-gray-400",
    body: "text-gray-600 dark:text-gray-300",
    error: "text-sm font-medium text-red-600 dark:text-red-400",
    label: "text-sm font-medium text-gray-900 dark:text-gray-300",
  },
  layout: {
    page: "min-h-screen bg-gray-50 dark:bg-gray-900",
    container: "max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8",
    section: "py-6 space-y-6",
    authCard:
      "w-full max-w-md p-6 space-y-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-lg",
  },
  navbar: {
    base: "sticky top-0 z-50 w-full border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 bg-opacity-95 backdrop-blur supports-[backdrop-filter]:bg-opacity-60",
    container: "flex h-14 items-center",
    brand:
      "flex gap-2 items-center font-bold text-lg text-gray-900 dark:text-white",
  },
} as const;

export const commonClasses = {
  flexCenter: "flex items-center justify-center",
  flexBetween: "flex items-center justify-between",
  flexStart: "flex items-center justify-start",
  gridCards: "grid gap-4 md:grid-cols-2 lg:grid-cols-3",
  iconButton:
    "cursor-pointer rounded-full p-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors",
} as const;

export const animations = {
  fadeIn: "animate-in fade-in duration-500",
  slideIn: "animate-in slide-in-from-bottom duration-500",
  spinner: "animate-spin",
} as const;
