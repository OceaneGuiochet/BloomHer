import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  updateDoc,
} from "firebase/firestore";
import { db } from "../config/firebase";
import { Activity, CreateActivityInput } from "../types/activity";

export async function createActivity(activity: CreateActivityInput) {
  const docRef = await addDoc(collection(db, "activities"), {
    title: activity.title,
    description: activity.description,
    category: activity.category,
    date: activity.date,
    time: activity.time,
    placeName: activity.placeName,
    placeAddress: activity.placeAddress,
    latitude: activity.latitude,
    longitude: activity.longitude,
    maxParticipants: activity.maxParticipants,
    creatorId: activity.creatorId,
    participantIds: [activity.creatorId],
    createdAt: new Date(),
  });

  return docRef.id;
}

export async function getActivities() {
  const snapshot = await getDocs(collection(db, "activities"));

  const activities: Activity[] = snapshot.docs.map((item) => ({
    id: item.id,
    ...(item.data() as Omit<Activity, "id">),
  }));
  return activities;
}

export async function getActivityById(id: string) {
  const snapshot = await getDoc(doc(db, "activities", id));
  if (!snapshot.exists()) {
    return null;
  }
  const activity: Activity = {
    id: snapshot.id,
    ...(snapshot.data() as Omit<Activity, "id">),
  };
  return activity;
}

export async function joinActivity(activityId: string, userId: string) {
  const activityRef = doc(db, "activities", activityId);
  const snapshot = await getDoc(activityRef);

  if (!snapshot.exists()) {
    throw new Error("Activité introuvable");
  }

  const activity = snapshot.data() as Omit<Activity, "id">;

  if (activity.participantIds.includes(userId)) {
    throw new Error("Tu es déjà inscrite");
  }
  if (activity.participantIds.length >= activity.maxParticipants) {
    throw new Error("Plus de places disponibles");
  }
  await updateDoc(activityRef, {
    participantIds: [...activity.participantIds, userId],
  });
}