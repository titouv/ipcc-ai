import { useState, useEffect, useRef } from "react";

const useScrollShadow = () => {
  const [showTopShadow, setShowTopShadow] = useState(false);
  const [showBottomShadow, setShowBottomShadow] = useState(false);
  const scrollContainerRef = useRef(null);

  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } =
        scrollContainerRef.current;
      setShowTopShadow(scrollTop > 0);
      setShowBottomShadow(scrollTop + clientHeight < scrollHeight);
    }
  };

  useEffect(() => {
    handleScroll();
  }, []);

  return {
    showTopShadow,
    showBottomShadow,
    scrollContainerRef,
    handleScroll,
  };
};

export default useScrollShadow;
