import { ReactNode } from 'react';

export default interface IModalConfirmProps {
  title: string;
  children: ReactNode;
  isOpened: boolean;
  onClose: () => void;
  onConfirm: () => void;
}
