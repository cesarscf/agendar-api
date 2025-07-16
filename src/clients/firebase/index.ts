import { env } from "@/env"
import { type App, cert, getApps, initializeApp } from "firebase-admin/app"
import { getAuth } from "firebase-admin/auth"
import { getFirestore } from "firebase-admin/firestore"
import { getMessaging } from "firebase-admin/messaging"
import { getStorage } from "firebase-admin/storage"

const app: App =
  getApps().length === 0
    ? initializeApp({
        credential: cert(
          JSON.parse(atob(env.FIREBASE_SERVICE_ACCOUNT_KEY_ENCODED_JSON))
        ),
        storageBucket: "agendar-dev-d7450.appspot.com",
      })
    : getApps()[0]

console.log("[firebase] Firebase Admin SDK está pronto")

export const firebaseAuth = getAuth(app)
export const firestore = getFirestore(app)
export const firebaseStorage = getStorage(app)
export const messaging = getMessaging(app)
