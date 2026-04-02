import { Metadata, ResolvingMetadata } from 'next';
import { Bot } from '../../../types';

type Props = {
  params: Promise<{ botId: string }>
  children: React.ReactNode
}

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { botId } = await params;
  
  // Fetch bot data for dynamic metadata
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";
  
  try {
    const response = await fetch(`${API_URL}/bots/${botId}`, {
      next: { revalidate: 3600 } // Cache for 1 hour
    });
    
    if (!response.ok) throw new Error('Failed to fetch bot');
    
    const bot: Bot = await response.json();
    
    const title = `${bot.name} | PersonaBot`;
    const description = bot.description || `Chat with ${bot.name}, an AI-powered persona specialized in ${bot.persona_config.expertise?.join(', ') || 'mentorship'}.`;
    const ogImage = `https://api.dicebear.com/7.x/avataaars/svg?seed=${bot.name}`;

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        url: `https://personabot.ai/chat/${botId}`,
        siteName: "PersonaBot",
        images: [
          {
            url: ogImage,
            width: 800,
            height: 800,
            alt: bot.name,
          },
        ],
        type: 'profile',
      },
      twitter: {
        card: "summary",
        title,
        description,
        images: [ogImage],
      },
    }
  } catch (error) {
    return {
      title: 'Persona Not Found | PersonaBot',
      description: 'The requested AI persona could not be found.',
    }
  }
}

export default function BotLayout({ children }: Props) {
  return <>{children}</>;
}
