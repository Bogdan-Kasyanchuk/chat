import { getLocaleDate } from '@/helpers';

import { IMessage } from '@/interfaces';

class CreateMessage implements IMessage {
  public date: string = getLocaleDate(null, {
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
  });
  public id: string = crypto.randomUUID();
  public read: boolean = false;

  constructor(public body: string, public idOwner: string, public idInterlocutor: string) {
    this.body = body;
    this.idOwner = idOwner;
    this.idInterlocutor = idInterlocutor;
  }
}

export default CreateMessage;
