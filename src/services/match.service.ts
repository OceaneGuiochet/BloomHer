import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../config/firebase";

export async function likeUser(currentUserId: string, targetUserId: string) {
  const likeId = `${currentUserId}_${targetUserId}`;
  const reverseLikeId = `${targetUserId}_${currentUserId}`;

  await setDoc(doc(db, "likes", likeId), {
    fromUserId: currentUserId,
    toUserId: targetUserId,
    createdAt: new Date(),
  });

  const reverseLikeDoc = await getDoc(doc(db, "likes", reverseLikeId));

  if (reverseLikeDoc.exists()) {
    const matchId = [currentUserId, targetUserId].sort().join("_");

    await setDoc(doc(db, "matches", matchId), {
      users: [currentUserId, targetUserId].sort(),
      createdAt: new Date(),
    });

    return true;
  }

  return false;
}