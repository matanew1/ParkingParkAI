import React, { createContext, useContext, useState } from 'react';

interface AnimationContextType {
  isReducedMotion: boolean;
  toggleReducedMotion: () => void;
  getTransitionProps: (duration?: number) => object;
}

const AnimationContext = createContext<AnimationContextType>({
  isReducedMotion: false,
  toggleReducedMotion: () => {},
  getTransitionProps: () => ({})
});

export const useAnimation = () => useContext(AnimationContext);

export const AnimationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isReducedMotion, setIsReducedMotion] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }
    return false;
  });

  const toggleReducedMotion = () => {
    setIsReducedMotion(prev => !prev);
  };

  const getTransitionProps = (duration = 300) => {
    if (isReducedMotion) {
      return {
        style: { transition: 'none' }
      };
    }

    return {
      style: {
        transition: `all ${duration}ms ease-in-out`
      }
    };
  };

  return (
    <AnimationContext.Provider 
      value={{ 
        isReducedMotion, 
        toggleReducedMotion,
        getTransitionProps 
      }}
    >
      {children}
    </AnimationContext.Provider>
  );
}