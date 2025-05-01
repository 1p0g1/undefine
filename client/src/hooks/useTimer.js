import { useState, useEffect } from 'react';
export const useTimer = (initialTime) => {
    const [time, setTime] = useState(initialTime);
    const [isRunning, setIsRunning] = useState(false);
    useEffect(() => {
        let interval;
        if (isRunning && time > 0) {
            interval = setInterval(() => {
                setTime((prev) => prev - 1);
            }, 1000);
        }
        return () => {
            if (interval) {
                clearInterval(interval);
            }
        };
    }, [isRunning, time]);
    const start = () => setIsRunning(true);
    const stop = () => setIsRunning(false);
    const reset = () => setTime(initialTime);
    return { time, isRunning, start, stop, reset };
};
