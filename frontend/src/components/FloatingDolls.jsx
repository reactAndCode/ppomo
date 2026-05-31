import React, { useEffect, useState } from 'react';

const dolls = ['🧸', '🐰', '🐼', '🦊', '🐶', '🐱', '🦄', '🐧', '🐻', '🐨'];

const FloatingDolls = () => {
  const [elements, setElements] = useState([]);

  useEffect(() => {
    const newElements = Array.from({ length: 15 }).map((_, i) => {
      const randomDoll = dolls[Math.floor(Math.random() * dolls.length)];
      const left = Math.random() * 100; // 0 to 100vw
      const duration = 20 + Math.random() * 30; // 20s to 50s
      const delay = Math.random() * -50; // start already on screen
      const size = 1.5 + Math.random() * 2.5; // 1.5rem to 4rem
      const opacity = 0.05 + Math.random() * 0.15; // very subtle

      return {
        id: i,
        doll: randomDoll,
        style: {
          left: `${left}vw`,
          bottom: '-100px', // start below the screen
          animationDuration: `${duration}s`,
          animationDelay: `${delay}s`,
          fontSize: `${size}rem`,
          opacity: opacity,
        }
      };
    });
    setElements(newElements);
  }, []);

  return (
    <div className="floating-dolls-container">
      {elements.map((el) => (
        <div key={el.id} className="floating-doll" style={el.style}>
          {el.doll}
        </div>
      ))}
    </div>
  );
};

export default FloatingDolls;
