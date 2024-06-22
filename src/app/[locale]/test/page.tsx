"use client";
import React, { useState, useEffect, useRef } from "react";
import { motion, useAnimation } from "framer-motion";

const ScrollableContent = ({ children }) => {
  const [showTopShadow, setShowTopShadow] = useState(false);
  const [showBottomShadow, setShowBottomShadow] = useState(false);
  const controlsTop = useAnimation();
  const controlsBottom = useAnimation();
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

  useEffect(() => {
    controlsTop.start({ opacity: showTopShadow ? 1 : 0 });
  }, [showTopShadow, controlsTop]);

  useEffect(() => {
    controlsBottom.start({ opacity: showBottomShadow ? 1 : 0 });
  }, [showBottomShadow, controlsBottom]);

  return (
    <div className="relative w-full max-w-lg mx-auto">
      <motion.div
        className="absolute inset-x-0 top-0 h-6 bg-gradient-to-b from-gray-300"
        initial={{ opacity: 0 }}
        animate={controlsTop}
        transition={{ duration: 0.2 }}
      />
      <motion.div
        className="absolute inset-x-0 bottom-0 h-6 bg-gradient-to-t from-gray-300"
        initial={{ opacity: 0 }}
        animate={controlsBottom}
        transition={{ duration: 0.2 }}
      />
      <div
        className="overflow-y-auto"
        onScroll={handleScroll}
        ref={scrollContainerRef}
      >
        <div>{children}</div>
      </div>
    </div>
  );
};

export { ScrollableContent };
const App = () => {
  return (
    <div className="App">
      <ScrollableContent>
        {Array.from({ length: 1000 }).map((_, i) => (
          <div key={i}>
            <p className="mb-4">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit.
            </p>
            <p className="mb-4">
              Aliquam tincidunt arcu nec dui elementum, ac consectetur risus
              gravida.
            </p>
          </div>
        ))}
      </ScrollableContent>
    </div>
  );
};

export default App;
