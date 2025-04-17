import React from 'react';

interface TimerProps {
  time: string;
}

const Timer: React.FC<TimerProps> = ({ time }) => {
  return (
    <div className="timer">
      {time}
    </div>
  );
};

export default Timer; 