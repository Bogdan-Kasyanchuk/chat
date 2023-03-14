// import { deleteDoc, doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';

// import db from 'service/firebaseDB';

// import initialData from 'helpers/initialData';
// import tryCatch from 'helpers/tryCatch';

// import { TIdGame } from 'types';

// export async function startGame(idGame: TIdGame) {
//   await tryCatch(setDoc(doc(db, 'games', idGame), initialData()));
// }

// export async function updateGame<T>(idGame: TIdGame, data: { [x: string]: T }) {
//   await tryCatch(updateDoc(doc(db, 'games', idGame), data));
// }

// export async function checkGame(idGame: TIdGame) {
//   return tryCatch(getDoc(doc(db, 'games', idGame)));
// }

// export async function deleteGame(idGame: TIdGame) {
//   await tryCatch(deleteDoc(doc(db, 'games', idGame)));
// }
