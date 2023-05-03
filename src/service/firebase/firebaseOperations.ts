import type { User } from 'firebase/auth';
import { deleteUser as delUser, updateProfile } from 'firebase/auth';
import { deleteDoc, doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';

import { tryCatch } from '@/middlewares';

import { COLECTIONS } from '@/helpers';

import { IContact, IMessage } from '@/interfaces';

import firebaseAuth from './firebaseAuth';
import firebaseDB from './firebaseDB';

const currentUser = () => {
  return firebaseAuth.currentUser as User;
};

export const createUser = async (id: string, data: IContact) => {
  tryCatch(setDoc(doc(firebaseDB, COLECTIONS.CONTACTS, id), data));
};

export const checkUser = async (id: string) => {
  return tryCatch(getDoc(doc(firebaseDB, COLECTIONS.CONTACTS, id)));
};

export const updateUser = async (id: string, data: Pick<IContact, 'name' | 'avatar'>) => {
  await tryCatch(
    updateProfile(currentUser(), {
      displayName: data.name,
      photoURL: data.avatar,
    }),
  );
  tryCatch(updateDoc(doc(firebaseDB, COLECTIONS.CONTACTS, id), data));
};

export const updateStatusUser = async (id: string, status: string) => {
  tryCatch(updateDoc(doc(firebaseDB, COLECTIONS.CONTACTS, id), { status }));
};

export const deleteUser = async (id: string) => {
  await tryCatch(deleteDoc(doc(firebaseDB, COLECTIONS.CONTACTS, id)));
  tryCatch(delUser(currentUser()));
};

export const createMessage = async (id: string, data: IMessage) => {
  tryCatch(setDoc(doc(firebaseDB, COLECTIONS.MESSAGES, id), data));
};

export const updateReadMessage = async (id: string) => {
  tryCatch(updateDoc(doc(firebaseDB, COLECTIONS.MESSAGES, id), { read: true }));
};
