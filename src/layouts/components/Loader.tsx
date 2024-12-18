const Loader = ({ relative }: { relative?: boolean }) => {
  return (
    <div
      className={`${
        relative ? "absolute" : "fixed"
      } top-0 left-0 flex items-center justify-center h-full w-full bg-white/90 dark:bg-darkmode-body/90 z-10 cursor-wait`}
    >
      <svg
        className="animate-spin h-7 w-7 text-sky-400"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        ></circle>
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        ></path>
      </svg>
    </div>
  );
};

export default Loader;
