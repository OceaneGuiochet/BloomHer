import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { db } from "../config/firebase";

export async function createUser(user: any) {
  await setDoc(doc(db, "users", user.uid), {
    uid: user.uid,
    email: user.email,
    firstname: "",
    age: null,
    city: "",
    bio:"",
    photo: "",
    isProfileComplete: false,
    createdAt: new Date(),
  });
}

export async function getUserById(uid: string) {
  const snapshot = await getDoc(doc(db, "users", uid));

  if (!snapshot.exists()) {
    return null;
  }

  return snapshot.data();
}

export async function completeUserProfile(
  uid: string,
  firstname: string,
  age: number,
  city: string,
  photo: string
) {
  await updateDoc(doc(db, "users", uid), {
    firstname,
    age,
    city,
    photo,
    isProfileComplete: true,
  });
}