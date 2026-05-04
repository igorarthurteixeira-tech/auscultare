import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { db } from "./firebase";

export interface Profile {
  name?: string;
  ageRange?: string;
  motivation?: string;
  aboutSelf?: string;
  onboardingCompleted: boolean;
}

export async function getProfile(userId: string): Promise<Profile | null> {
  const ref = doc(db, "profiles", userId);
  const snap = await getDoc(ref);
  return snap.exists() ? (snap.data() as Profile) : null;
}

export async function createProfile(userId: string) {
  const ref = doc(db, "profiles", userId);
  await setDoc(ref, { onboardingCompleted: false });
}

export async function saveProfile(userId: string, data: Partial<Profile>) {
  const ref = doc(db, "profiles", userId);
  await updateDoc(ref, { ...data });
}
