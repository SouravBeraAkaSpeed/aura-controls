"use client";

import React, { useRef, useState } from 'react';
import { animate, motion, useMotionValue, useMotionValueEvent, useTransform } from 'framer-motion';

const MAX_OVERFLOW = 50;

interface ElasticSliderProps {
  value: number;
  onValueChange?: (value: number) => void;
  startingValue?: number;
  maxValue?: number;
  className?: string;
  isStepped?: boolean;
  stepSize?: number;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const ElasticSlider: React.FC<ElasticSliderProps> = ({
  value,
  onValueChange = () => {},
  startingValue = 0,
  maxValue = 100,
  className = '',
  isStepped = false,
  stepSize = 1,
  leftIcon = <>-</>,
  rightIcon = <>+</>
}) => {
  const sliderRef = useRef<HTMLDivElement>(null);
  const [region, setRegion] = useState<'left' | 'middle' | 'right'>('middle');
  const clientX = useMotionValue(0);
  const overflow = useMotionValue(0);
  const scale = useMotionValue(1);

  useMotionValueEvent(clientX, 'change', (latest: number) => {
    if (sliderRef.current) {
      const { left, right } = sliderRef.current.getBoundingClientRect();
      let newValue: number;
      if (latest < left) { setRegion('left'); newValue = left - latest; } 
      else if (latest > right) { setRegion('right'); newValue = latest - right; } 
      else { setRegion('middle'); newValue = 0; }
      overflow.jump(decay(newValue, MAX_OVERFLOW));
    }
  });

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.buttons > 0 && sliderRef.current) {
      const { left, width } = sliderRef.current.getBoundingClientRect();
      let newValue = startingValue + ((e.clientX - left) / width) * (maxValue - startingValue);
      if (isStepped) { newValue = Math.round(newValue / stepSize) * stepSize; }
      newValue = Math.min(Math.max(newValue, startingValue), maxValue);
      onValueChange(newValue);
      clientX.jump(e.clientX);
    }
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    handlePointerMove(e);
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerUp = () => {
    animate(overflow, 0, { type: 'spring', bounce: 0.5 });
  };

  const getRangePercentage = (): number => {
    const totalRange = maxValue - startingValue;
    if (totalRange === 0) return 0;
    return ((value - startingValue) / totalRange) * 100;
  };

  return (
    <div className={`flex flex-col items-center justify-center gap-2 w-full ${className}`}>
      <motion.div
        onHoverStart={() => animate(scale, 1.1)}
        onHoverEnd={() => animate(scale, 1)}
        onTouchStart={() => animate(scale, 1.1)}
        onTouchEnd={() => animate(scale, 1)}
        style={{ scale }}
        className="flex w-full touch-none select-none items-center justify-center gap-4"
      >
        <motion.div
          animate={{ scale: region === 'left' ? [1, 1.2, 1] : 1, transition: { duration: 0.25 } }}
          style={{ x: useTransform(() => (region === 'left' ? -overflow.get() / scale.get() : 0)) }}
          className="flex-shrink-0"
        >
          {leftIcon}
        </motion.div>

        <div
          ref={sliderRef}
          className="relative flex w-full max-w-xs flex-grow cursor-grab touch-none select-none items-center py-4"
          onPointerMove={handlePointerMove}
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
        >
          <motion.div
            style={{
              scaleX: useTransform(() => (sliderRef.current ? 1 + overflow.get() / sliderRef.current.getBoundingClientRect().width : 1)),
              scaleY: useTransform(overflow, [0, MAX_OVERFLOW], [1, 0.8]),
              transformOrigin: useTransform(() => (sliderRef.current && clientX.get() < sliderRef.current.getBoundingClientRect().left + sliderRef.current.getBoundingClientRect().width / 2 ? 'right' : 'left')),
              height: useTransform(scale, [1, 1.1], [8, 10]),
              marginTop: useTransform(scale, [1, 1.1], [0, -1]),
              marginBottom: useTransform(scale, [1, 1.1], [0, -1])
            }}
            className="flex flex-grow"
          >
            {/* --- THE STYLING FIX IS HERE --- */}
            <div className="relative h-full w-full flex-grow overflow-hidden rounded-full bg-[#374151]">
              <div className="absolute h-full bg-purple-500 rounded-full" style={{ width: `${getRangePercentage()}%` }} />
            </div>
          </motion.div>
        </div>

        <motion.div
          animate={{ scale: region === 'right' ? [1, 1.2, 1] : 1, transition: { duration: 0.25 } }}
          style={{ x: useTransform(() => (region === 'right' ? overflow.get() / scale.get() : 0)) }}
          className="flex-shrink-0"
        >
          {rightIcon}
        </motion.div>
      </motion.div>
      
      {/* --- THE STYLING FIX IS HERE --- */}
      <p className="text-gray-400 text-sm font-medium">
        {Math.round(value)}
      </p>
    </div>
  );
};

function decay(value: number, max: number): number {
  if (max === 0) return 0;
  const entry = value / max;
  const sigmoid = 2 * (1 / (1 + Math.exp(-entry)) - 0.5);
  return sigmoid * max;
}

export default ElasticSlider;