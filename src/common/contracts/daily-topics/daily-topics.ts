import { Event } from "../config/config";
import { BaseApiResponse } from "../dashboard/dashboard";

export interface DailyPrayerTopic {
  id?: string;
  eventId?: string;
  event?: Event;
  date?: string;
  description?: string;
  imageUrl: string;
}

export interface DailyPrayerTopicResponse extends BaseApiResponse {
  data: DailyPrayerTopic[];
}
