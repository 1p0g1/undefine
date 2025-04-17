import React, { useEffect, useState } from 'react';
import ReactConfetti from 'react-confetti';

export default function Confetti() {
  const [windowDimensions, setWindowDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    const handleResize = () => {
      setWindowDimensions({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    window.addEventListener('resize', handleResize);

    // Stop the confetti after 5 seconds
    const timer = setTimeout(() => {
      setIsActive(false);
    }, 5000);

    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timer);
    };
  }, []);

  return (
    <ReactConfetti
      width={windowDimensions.width}
      height={windowDimensions.height}
      numberOfPieces={isActive ? 200 : 0}
      recycle={false}
      gravity={0.2}
      initialVelocityY={20}
      tweenDuration={100}
      colors={['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEEAD']}
    />
  );
} 