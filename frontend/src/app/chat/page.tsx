import { redirect } from 'next/navigation';

export default function ChatRootPage() {
    // Redirect /chat to /explore so users can find a persona to talk to
    redirect('/explore');
    return null;
}
