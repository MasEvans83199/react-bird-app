import { useState } from "react";

function useDarkMode() {
  const [isDarkMode, setIsDarkMode] = useState(false);

  const toggleIsDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  return [isDarkMode, toggleIsDarkMode];
}

export default useDarkMode;
