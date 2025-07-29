export const theme = {
  button: {
    primary: "cursor-pointer bg-blue-600 text-white px-4 py-2.5 rounded-lg hover:bg-blue-700 transition-colors duration-300 flex items-center justify-center gap-2 shadow-sm",
    secondary: "cursor-pointer bg-gray-100 text-gray-900 px-4 py-2.5 rounded-lg hover:bg-gray-200 transition-colors duration-300 flex items-center justify-center gap-2",
    destructive: "cursor-pointer bg-red-600 text-white px-4 py-2.5 rounded-lg hover:bg-red-700 transition-colors duration-300 flex items-center justify-center gap-2",
    danger: "cursor-pointer bg-red-600 text-white px-4 py-2.5 rounded-lg hover:bg-red-700 transition-colors duration-300 flex items-center justify-center gap-2",
  },
  card: {
    base: "bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow duration-300",
    interactive: "cursor-pointer hover:scale-[1.02] transition-all duration-300",
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
  },
  layout: {
    page: "min-h-screen bg-gray-50 dark:bg-gray-900",
    container: "max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8",
    section: "py-6 space-y-6",
    authCard: "w-full max-w-md p-6 space-y-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-lg",
  },
  navbar: {
    base: "sticky top-0 z-50 w-full border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 bg-opacity-95 backdrop-blur supports-[backdrop-filter]:bg-opacity-60",
    container: "flex h-14 items-center",
    brand: "flex gap-2 items-center font-bold text-lg text-gray-900 dark:text-white",
  },
} as const;

export const commonClasses = {
  flexCenter: "flex items-center justify-center",
  flexBetween: "flex items-center justify-between",
  flexStart: "flex items-center justify-start",
  gridCards: "grid gap-4 md:grid-cols-2 lg:grid-cols-3",
  iconButton: "cursor-pointer rounded-full p-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors",
} as const;

export const animations = {
  fadeIn: "animate-in fade-in duration-500",
  slideIn: "animate-in slide-in-from-bottom duration-500",
  spinner: "animate-spin",
} as const; 