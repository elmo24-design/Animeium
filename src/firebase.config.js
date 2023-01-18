// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional

//Animeium - Orig
// const firebaseConfig = {
//   apiKey: "AIzaSyB1rkIiNuYSOXJzBAvwLJkDPZJNuPXhPmw",
//   authDomain: "animeium-6b3e3.firebaseapp.com",
//   projectId: "animeium-6b3e3",
//   storageBucket: "animeium-6b3e3.appspot.com",
//   messagingSenderId: "350403787375",
//   appId: "1:350403787375:web:3e4292c85263a0739dab9a"
// };

//Animeium - Backup
const firebaseConfig = {
  apiKey: "AIzaSyCm1CcbFc9WinfNjj06PwBHlr1MhI_RPwg",
  authDomain: "animeium-2.firebaseapp.com",
  projectId: "animeium-2",
  storageBucket: "animeium-2.appspot.com",
  messagingSenderId: "514676082104",
  appId: "1:514676082104:web:d79c998c68b4788c0a3b4d"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app)