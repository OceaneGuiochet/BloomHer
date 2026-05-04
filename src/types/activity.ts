export const ACTIVITY_CATEGORIES = [
   "sport",
   "magasin",
   "fête",
   "cafe",
   "balade",
   "cinema",
   "autre"]as const;
export type ActivityCategory = (typeof ACTIVITY_CATEGORIES)[number];

export type Activity = {
  id: string;
  title: string;
  description: string;
  category: ActivityCategory;
  date: string;
  time: string;
  placeName: string;
  placeAddress: string;
  latitude: number;
  longitude: number;
  maxParticipants: number;
  creatorId: string;
  participantIds: string[];
  createdAt: Date;
};

export type CreateActivityInput = {
  title: string;
  description: string;
  category: ActivityCategory;
  date: string;
  time: string;
  placeName: string;
  placeAddress: string;
  latitude: number;
  longitude: number;
  maxParticipants: number;
  creatorId: string;
};
