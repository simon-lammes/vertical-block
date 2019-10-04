export interface Board {
  id: string;
  title: string;
  description: string;
  creatorId: string;
  memberIds: string[];
}

export interface BoardBlueprint {
  title: string;
  description: string;
}
