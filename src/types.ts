export interface TeamMember {
  id: number;
  name: string;
  role: string;
}

export interface Event {
  id: number;
  date: string;
  title: string;
  type: 'pending' | 'important' | 'update';
}

export interface Task {
  id: number;
  pass_id: number;
  date: string;
  title: string;
  status: 'Not Started' | 'In Progress' | 'Completed';
  assignee_id?: number;
}

export interface FinanceEntry {
  id: number;
  date: string;
  type: 'revenue' | 'expense';
  amount: number;
  description: string;
  member_id: number;
  member_name?: string;
}

export interface SocialPost {
  id: number;
  post_date: string;
  content: string;
  platform: string;
  assignee_id: number;
  assignee_name?: string;
  status: string;
}

export interface Product {
  id: number;
  name: string;
  price: number;
  category: string;
}

export interface SalesSession {
  id: number;
  member_id: number;
  member_name?: string;
  start_time: string;
  end_time?: string;
  sales_closed: number;
  total_revenue: number;
}

export interface AppData {
  team: TeamMember[];
  events: Event[];
  tasks: Task[];
  finance: FinanceEntry[];
  socialPosts: SocialPost[];
  products: Product[];
  activeSessions: SalesSession[];
}
