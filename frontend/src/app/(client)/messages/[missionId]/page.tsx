'use client';

import { MissionChatPage } from '@/components/mission-chat-page';

export default function ClientMissionChatPage({
  params,
}: {
  params: { missionId: string };
}) {
  return <MissionChatPage missionId={params.missionId} backPath="/messages" />;
}
