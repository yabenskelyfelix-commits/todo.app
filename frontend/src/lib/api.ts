export type PriorityType = "normale" | "haute";
export type CategoryType = "Travail" | "Perso" | "Études";
export type FilterByType = "all" | "todo" | "done";

export interface Task {
  id: number;
  title: string;
  description: string | null;
  completed: boolean;
  status: "todo" | "in_progress" | "done";
  priority: PriorityType;
  category: CategoryType;
  due_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface TaskCreateInput {
  title: string;
  description?: string | null;
  priority?: PriorityType;
  category?: CategoryType;
  due_date?: string | null;
}

export interface TaskUpdateInput {
  title?: string;
  description?: string | null;
  completed?: boolean;
  priority?: PriorityType;
  category?: CategoryType;
  due_date?: string | null;
}

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Erreur HTTP ${res.status}`);
  }
  if (res.status === 204) {
    return undefined as T;
  }
  return res.json() as Promise<T>;
}

export async function fetchTasks(params?: {
  filterBy?: FilterByType;
  priority?: PriorityType | "";
  category?: CategoryType | "";
}): Promise<Task[]> {
  const search = new URLSearchParams();
  if (params?.filterBy) search.set("filter_by", params.filterBy);
  if (params?.priority) search.set("priority", params.priority);
  if (params?.category) search.set("category", params.category);

  const query = search.toString() ? `?${search.toString()}` : "";
  const res = await fetch(`${API_BASE_URL}/api/tasks${query}`, {
    cache: "no-store",
  });
  return handleResponse<Task[]>(res);
}

export async function createTask(payload: TaskCreateInput): Promise<Task> {
  const res = await fetch(`${API_BASE_URL}/api/tasks`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return handleResponse<Task>(res);
}

export async function updateTask(
  id: number,
  payload: TaskUpdateInput
): Promise<Task> {
  const res = await fetch(`${API_BASE_URL}/api/tasks/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return handleResponse<Task>(res);
}

export async function deleteTask(id: number): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/api/tasks/${id}`, {
    method: "DELETE",
  });
  return handleResponse<void>(res);
}
