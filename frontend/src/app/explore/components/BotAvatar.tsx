"use client";

import { Bot } from "../../../types";
import { User } from "lucide-react";

interface BotAvatarProps {
  bot: Bot;
  className?: string;
}

export function BotAvatar({ bot, className }: BotAvatarProps) {
  const avatarUrl = bot.avatar_url || bot.owner?.avatar_url;

  if (!avatarUrl) {
    return (
      <div className={`bg-gray-100 flex items-center justify-center rounded-full ${className}`}>
        <User className="w-1/2 h-1/2 text-gray-400" />
      </div>
    );
  }

  return (
    <img
      src={avatarUrl}
      alt={bot.name}
      className={`object-cover rounded-full ${className}`}
      onError={(e) => {
        // Fallback if image fails to load
        (e.currentTarget as HTMLImageElement).style.display = "none";
        e.currentTarget.parentElement?.classList.add("bg-gray-100", "flex", "items-center", "justify-center");
        if (e.currentTarget.parentElement) {
            e.currentTarget.parentElement.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-user w-1/2 h-1/2 text-gray-400"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>';
        }
      }}
    />
  );
}
