// socket-gateway/dto/schedule-tiktok.dto.ts
import { InteractionStatus } from '@prisma/client';
export interface ScheduleTiktokDTO {
  id: number;
  user_id: number;
  video_url: string;
  views_count: number;
  items: string[];
  comment?: string;
  status: InteractionStatus;
}
