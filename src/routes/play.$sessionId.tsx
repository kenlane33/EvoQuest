'use client';

import { createFileRoute } from '@tanstack/react-router';
import { PlaySession } from '@/components/play/PlaySession';

export const Route = createFileRoute('/play/$sessionId')({
  component: PlayRoute,
});

function PlayRoute() {
  const { sessionId } = Route.useParams();
  return <PlaySession sessionId={sessionId} />;
}
