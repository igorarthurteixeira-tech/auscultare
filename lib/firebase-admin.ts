import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";

let _db: ReturnType<typeof getFirestore> | null = null;

function getAdminDb() {
  if (_db) return _db;
  const app = getApps().length > 0
    ? getApps()[0]
    : initializeApp({
        credential: cert(
          JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT!.replace(/^﻿/, ""))
        ),
      });
  _db = getFirestore(app);
  return _db;
}

export const adminIncrement = FieldValue.increment;
export { getAdminDb };
