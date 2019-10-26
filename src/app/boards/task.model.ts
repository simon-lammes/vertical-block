import {Deserializable} from '../shared/deserializable.model';
import {Serializable} from '../shared/serializable.model';

export class Task implements Deserializable, Serializable {
  public name: string;
  public status: TaskStatus;
  public id: string;
  public description: string;

  deserialize(input: any): this {
    Object.assign(this, input);
    return this;
  }

  serialize(): any {
    return JSON.parse(JSON.stringify(this));
  }
}

export type TaskStatus = 'todo' | 'progress' | 'done' | 'review';
