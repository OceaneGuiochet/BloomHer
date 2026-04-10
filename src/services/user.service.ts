import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { db } from "../config/firebase";

export async function createUser(user: any) {
  await setDoc(doc(db, "users", user.uid), {
    uid: user.uid,
    email: user.email,
    firstname: "",
    birthDate: "",
    bio: "",
    photos: [],
    latitude: null,
    longitude: null,
    isProfileComplete: false,
    createdAt: new Date(),
  });
}

export async function getUserById(uid: string) {
  const snapshot = await getDoc(doc(db, "users", uid));

  if (!snapshot.exists()) return null;

  return snapshot.data();
}

export async function getOtherUsers(currentUserId: string) {
  const snapshot = await getDocs(collection(db, "users"));

  return snapshot.docs
    .map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))
    .filter(
      (user: any) =>
        user.id !== currentUserId && user.isProfileComplete === true
    );
}

export async function completeUserProfile(
  uid: string,
  firstname: string,
  birthDate: string,
  photos: string[],
  latitude: number,
  longitude: number
) {
  await updateDoc(doc(db, "users", uid), {
    firstname,
    birthDate,
    photos,
    latitude,
    longitude,
    isProfileComplete: true,
  });
}

export async function updateUserProfile(
  uid: string,
  firstname: string,
  birthDate: string,
  bio: string,
  photos: string[],
  latitude: number,
  longitude: number
) {
  await updateDoc(doc(db, "users", uid), {
    firstname,
    birthDate,
    bio,
    photos,
    latitude,
    longitude,
  });
}