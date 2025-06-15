import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import app from "./firebaseInit";

const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    console.log("User signed in: ", user);
    return user;
  } catch (error) {
    console.error("Error signing in: ", error);
    throw error;
  }
};
