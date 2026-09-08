// js/firebase-user.js

import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";

import { app } from "./firebase-config.js";

const db = getFirestore(app);


// ------------------------------------
// CREATE USER PROFILE
// ------------------------------------

async function createUserProfile(user) {

  const userRef = doc(
    db,
    "users",
    user.uid
  );

  const existingProfile =
    await getDoc(userRef);


  // Don't overwrite an existing profile
  if (existingProfile.exists()) {

    return existingProfile.data();

  }


  await setDoc(userRef, {

    name: user.displayName || "",

    email: user.email || "",

    picture: user.photoURL || "",

    plan: "free",

    createdAt: serverTimestamp(),

    updatedAt: serverTimestamp()

  });


  return {
    plan: "free"
  };

}


// ------------------------------------
// GET USER PROFILE
// ------------------------------------

async function getUserProfile(uid) {

  const userRef = doc(
    db,
    "users",
    uid
  );

  const snapshot =
    await getDoc(userRef);


  if (snapshot.exists()) {

    return snapshot.data();

  }


  return null;

}


export {
  db,
  createUserProfile,
  getUserProfile
};