"use client";

import { useState, useEffect } from "react";
import { Bot } from "../../../types";

interface BotAvatarProps {
  bot: Bot;
  className?: string;
}

// Simple in-memory cache to avoid redundant API calls during the session
const genderCache: Record<string, "male" | "female" | null> = {};

export function BotAvatar({ bot, className }: BotAvatarProps) {
  const [avatarUrl, setAvatarUrl] = useState<string>("");
  const name = bot.name.split(" ")[0]; // Just use first name for gender detection

  useEffect(() => {
    // 1. If the bot has a real avatar, use it immediately
    const realAvatar = bot.avatar_url;
    if (realAvatar) {
      setAvatarUrl(realAvatar);
      return;
    }

    // 2. Fallback to DiceBear with Gender Detection
    const fetchGenderAndSetAvatar = async () => {
      let gender = genderCache[name];

      if (gender === undefined) {
        try {
          // Genderize.io is free for up to 1000 names/day
          const response = await fetch(`https://api.genderize.io/?name=${encodeURIComponent(name)}`);
          const data = await response.json();
          gender = data.gender; // "male", "female" or null
          genderCache[name] = gender;
        } catch (err) {
          console.warn("Genderize.io failed, falling back to random avatar:", err);
          gender = null;
        }
      }

      // Construct DiceBear URL with gender-specific styles if gender is known
      let diceBearUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(bot.name)}`;
      
      if (gender === "male") {
        // Force male-leaning styles
        diceBearUrl += "&top=shortHair,shortCurly,shortFlat,shortRound,shortWaved,sides,frizzle,shaggy,shaggyMullet,theCaesar,theCaesarAndSidePart&facialHairProbability=40";
      } else if (gender === "female") {
        // Force female-leaning styles
        diceBearUrl += "&top=longHair,bob,curly,curvy,dreads,dreads01,dreads02,hijab,turban,straight01,straight02,straightAndStrand&facialHairProbability=0";
      }

      setAvatarUrl(diceBearUrl);
    };

    fetchGenderAndSetAvatar();
  }, [bot, name]);

  if (!avatarUrl) {
    return <div className={`animate-pulse bg-gray-100 rounded-full ${className}`} />;
  }

  return (
    <img
      src={avatarUrl}
      alt={bot.name}
      className={`object-cover rounded-full ${className}`}
      onError={(e) => {
        // Final fallback if anything fails
        (e.currentTarget as HTMLImageElement).src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${bot.name}`;
      }}
    />
  );
}
