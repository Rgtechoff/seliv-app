'use client';

import { MissionChatPage } from '@/components/mission-chat-page';

export default function VendeurMissionChatPage({
  params,
}: {
  params: { missionId: string };
}) {
  return <MissionChatPage missionId={params.missionId} backPath="/vendeur/messages" />;
}
