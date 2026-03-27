"use client";

import { useEffect, useState } from "react";

interface LoaderProps {
  size?: string;
  stroke?: string;
  strokeLength?: string;
  bgOpacity?: string;
  speed?: string;
  color?: string;
  fullScreen?: boolean;
}

export function Loader({
  size = "40",
  stroke = "5",
  strokeLength = "0.15",
  bgOpacity = "0.1",
  speed = "0.9",
  color = "currentColor",
  fullScreen = false,
}: LoaderProps) {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    async function getLoader() {
      const { squircle } = await import("ldrs");
      squircle.register();
      setIsLoaded(true);
    }
    getLoader();
  }, []);

  if (!isLoaded) return null;

  const loaderElement = (
      <l-squircle
        size={size}
        stroke={stroke}
        stroke-length={strokeLength}
        bg-opacity={bgOpacity}
        speed={speed}
        color={color}
      ></l-squircle>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-white/80 backdrop-blur-sm">
        {loaderElement}
      </div>
    );
  }

  return loaderElement;
}
