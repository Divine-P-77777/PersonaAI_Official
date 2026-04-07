import type { Metadata, ResolvingMetadata } from 'next'
import PublicChatClient from './chat-client'

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

type Props = {
  params: Promise<{ botId: string }>
}

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { botId } = await params;
  
  try {
    const res = await fetch(`${API_URL}/bots/${botId}`);
    if (!res.ok) {
        return {
           title: 'Persona Unavailable',
           description: 'This persona is currently in draft mode, private, or not found.'
        }
    }
    const bot = await res.json();
    
    if (bot.status !== 'ready') {
        return {
           title: 'Persona Not Ready',
           description: 'This persona is currently in draft mode or private.'
        }
    }

    const previousImages = (await parent).openGraph?.images || [];
    const imageUrl = bot.avatar_url || '/apple-touch-icon.png'; 

    return {
      title: `${bot.name} | Persona AI`,
      description: bot.description || `Chat with ${bot.name}, an AI persona.`,
      openGraph: {
        title: `${bot.name} | Persona AI`,
        description: bot.description || `Chat with ${bot.name}, an AI persona.`,
        images: [imageUrl, ...previousImages],
      },
      twitter: {
        card: "summary_large_image",
        title: `${bot.name} | Persona AI`,
        description: bot.description || `Chat with ${bot.name}, an AI persona.`,
        images: [imageUrl],
      }
    };
  } catch (err) {
    return {
      title: 'Persona AI',
      description: 'Chat with professional AI personas'
    }
  }
}

export default async function PublicChatPage({ params }: Props) {
    const { botId } = await params;
    return <PublicChatClient botId={botId} />;
}
