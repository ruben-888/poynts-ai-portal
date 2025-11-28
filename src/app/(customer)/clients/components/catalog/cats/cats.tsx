"use client";

import loadingCatAnimation from "./loading-cat.json";
import loungingCatAnimation from "./lounging-cat.json";
import { useLottie } from "lottie-react";

type CatAnimationType = "loading" | "lounging";

interface CatsAnimationProps {
  type: CatAnimationType;
  className?: string;
}

const CatsAnimation = ({ type, className = "" }: CatsAnimationProps) => {
  // Create a deep copy of the animation data to avoid mutation issues
  const animationData = type === "loading" 
    ? JSON.parse(JSON.stringify(loadingCatAnimation))
    : JSON.parse(JSON.stringify(loungingCatAnimation));
  
  const defaultOptions = {
    animationData: animationData,
    loop: true,
  };

  const { View } = useLottie(defaultOptions);

  // Different sizes based on animation type
  const sizeClass = type === "loading" ? "w-64 h-64" : "w-48 h-48";

  return (
    <div className={`${sizeClass} ${className}`}>
      {View}
    </div>
  );
};

export default CatsAnimation;
