import { useState, useEffect } from "react";

export function useScreenWidth(threshold: number) {
  const [isBelowThreshold, setIsBelowThreshold] = useState(window.innerWidth < threshold);
  const [isAboveThreshold, setIsAboveThreshold] = useState(window.innerWidth >= threshold);

  useEffect(() => {
    const handleResize = () => {
      const isBelow = window.innerWidth < threshold;
      setIsBelowThreshold(isBelow);
      setIsAboveThreshold(!isBelow);
    };

    handleResize(); // Initial check
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [threshold]);

  return { isBelowThreshold, isAboveThreshold };
}
