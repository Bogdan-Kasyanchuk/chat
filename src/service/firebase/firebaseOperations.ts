import type { User } from 'firebase/auth';
import { deleteUser as delUser, updateProfile } from 'firebase/auth';
import { deleteDoc, doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';

import firebaseAuth from '@/service/firebase/firebaseAuth';
import firebaseDB from '@/service/firebase/firebaseDB';

import { tryCatch } from '@/helpers';

import { IMessage, IUser } from '@/interfaces';

const currentUser = () => {
  return firebaseAuth.currentUser as User;
};

export const createUser = async (id: string, data: IUser) => {
  await tryCatch(setDoc(doc(firebaseDB, 'contacts', id), data));
};

export async function checkUser(id: string) {
  return tryCatch(getDoc(doc(firebaseDB, 'contacts', id)));
}

export const updateUser = async (id: string, data: Pick<IUser, 'name' | 'avatar'>) => {
  await tryCatch(
    updateProfile(currentUser(), {
      displayName: data.name,
      photoURL: data.avatar,
    }),
  );
  await tryCatch(updateDoc(doc(firebaseDB, 'contacts', id), data));
};

export const updateStatusUser = async (id: string, status: IUser['status']) => {
  await tryCatch(updateDoc(doc(firebaseDB, 'contacts', id), { status }));
};

export const deleteUser = async (id: string) => {
  await tryCatch(deleteDoc(doc(firebaseDB, 'contacts', id)));
  await tryCatch(delUser(currentUser()));
};

export const createMessage = async (id: string, data: IMessage) => {
  await tryCatch(setDoc(doc(firebaseDB, 'messages', id), data));
};
