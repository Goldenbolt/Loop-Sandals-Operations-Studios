export interface Event {
  date: string;
  title: string;
  type: 'pending' | 'important' | 'update';
}

export interface Task {
  date: string;
  title: string;
  status: 'Not Started' | 'In Progress' | 'Completed';
  assignee?: string;
}

export interface Pass {
  id: number;
  tasks: Task[];
}

export interface TeamMember {
  name: string;
  role: string;
  tasks: string[];
}
