export interface Board {
  id: string;
  title: string;
  description: string;
  members: {
    [userId: string]: BoardMemberRole;
  };
}

export interface BoardBlueprint {
  title: string;
  description: string;
}

export type BoardMemberRole = 'owner' | 'editor' | 'viewer';

export interface Task {
  name: string;
  status: TaskStatus;
  id: string;
  description: string;
}

export type TaskStatus = 'todo' | 'progress' | 'done' | 'review';
