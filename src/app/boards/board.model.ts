export interface Board {
  id: string;
  title: string;
  description: string;
  creatorId: string;
  memberIds: string[];
  idsOfInvitedUsers: string[];
}

export interface BoardBlueprint {
  title: string;
  description: string;
}

export interface Task {
  name: string;
  status: TaskStatus;
  id: string;
}

export type TaskStatus = 'todo' | 'progress' | 'done' | 'review';
