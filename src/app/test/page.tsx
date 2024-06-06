"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";

const MovingComponent = () => {
  const [condition, setCondition] = useState(false);

  const handleToggle = () => {
    setCondition(!condition);
  };

  const variants = {
    start: { y: "50vh" },
    end: { y: "0vh" },
  };

  return (
    <div>
      <button onClick={handleToggle}>Toggle Position</button>
      <motion.div
        initial="start"
        animate={condition ? "end" : "start"}
        variants={variants}
        style={{
          position: "absolute",
          left: "50%",
          transform: "translateX(-50%)",
          width: "100px",
          height: "100px",
          backgroundColor: "blue",
        }}
      />
    </div>
  );
};

export default MovingComponent;
