export default interface IMessage {
  idOwner: string;
  idInterlocutor: string;
  id: string;
  body: string;
  date: string;
  read: boolean;
}
