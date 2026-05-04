import { doc, getDoc, updateDoc, increment } from "firebase/firestore";
import { db } from "./firebase";
import { FREE_TRIAL_SECONDS } from "./plans";

export async function getBalance(userId: string): Promise<number> {
  const ref = doc(db, "profiles", userId);
  const snap = await getDoc(ref);
  if (!snap.exists()) return 0;
  return snap.data().balanceSeconds ?? 0;
}

export async function initFreeTrialIfNeeded(userId: string): Promise<void> {
  const ref = doc(db, "profiles", userId);
  const snap = await getDoc(ref);
  if (!snap.exists()) return;
  const data = snap.data();
  if (data.freeTrialUsed === undefined && data.balanceSeconds === undefined) {
    await updateDoc(ref, { balanceSeconds: FREE_TRIAL_SECONDS, freeTrialUsed: false });
  }
}

export async function deductBalance(userId: string, seconds: number): Promise<void> {
  const ref = doc(db, "profiles", userId);
  await updateDoc(ref, { balanceSeconds: increment(-seconds) });
}

export async function addBalance(userId: string, seconds: number): Promise<void> {
  const ref = doc(db, "profiles", userId);
  await updateDoc(ref, { balanceSeconds: increment(seconds) });
}

export async function markFreeTrialUsed(userId: string): Promise<void> {
  const ref = doc(db, "profiles", userId);
  await updateDoc(ref, { freeTrialUsed: true });
}
