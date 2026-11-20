"use client";

import { FormEvent, useEffect, useState } from "react";
import {
  CategoryType,
  FilterByType,
  PriorityType,
  Task,
  createTask,
  deleteTask,
  fetchTasks,
  updateTask,
} from "@/lib/api";

export default function HomePage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Ajout rapide
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState<PriorityType>("normale");
  const [category, setCategory] = useState<CategoryType>("Travail");
  const [dueDate, setDueDate] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Filtres
  const [filterBy, setFilterBy] = useState<FilterByType>("all");
  const [filterCategory, setFilterCategory] = useState<CategoryType | "">("");

  // Édition inline
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editPriority, setEditPriority] = useState<PriorityType>("normale");
  const [editCategory, setEditCategory] = useState<CategoryType>("Travail");
  const [editDueDate, setEditDueDate] = useState("");

  async function loadTasks() {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchTasks({
        filterBy,
        category: filterCategory,
      });
      setTasks(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Impossible de charger les tâches"
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTasks();
  }, [filterBy, filterCategory]);

  async function handleAddTask(e: FormEvent) {
    e.preventDefault();
    const cleanTitle = title.trim();
    if (!cleanTitle) return;

    setSubmitting(true);
    setError(null);
    try {
      const created = await createTask({
        title: cleanTitle,
        priority,
        category,
        due_date: dueDate ? new Date(dueDate).toISOString() : null,
      });
      setTasks((prev) => [created, ...prev]);
      setTitle("");
      setDueDate("");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erreur lors de la création"
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function handleToggleCompleted(task: Task) {
    setError(null);
    try {
      const updated = await updateTask(task.id, {
        completed: !task.completed,
      });
      setTasks((prev) =>
        prev.map((item) => (item.id === task.id ? updated : item))
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erreur lors de la mise à jour"
      );
    }
  }

  function startEditing(task: Task) {
    setEditingId(task.id);
    setEditTitle(task.title);
    setEditPriority(task.priority);
    setEditCategory(task.category);
    setEditDueDate(task.due_date ? task.due_date.slice(0, 16) : "");
  }

  async function handleSaveEdit(id: number) {
    if (!editTitle.trim()) return;
    setError(null);
    try {
      const updated = await updateTask(id, {
        title: editTitle.trim(),
        priority: editPriority,
        category: editCategory,
        due_date: editDueDate ? new Date(editDueDate).toISOString() : null,
      });
      setTasks((prev) => prev.map((item) => (item.id === id ? updated : item)));
      setEditingId(null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erreur lors de la modification"
      );
    }
  }

  async function handleDelete(id: number) {
    setError(null);
    try {
      await deleteTask(id);
      setTasks((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erreur lors de la suppression"
      );
    }
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-slate-900">
        Mes Tâches (To-Do)
      </h1>

      {/* Ajout rapide */}
      <form
        onSubmit={handleAddTask}
        className="mb-6 rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
      >
        <div className="flex gap-2">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Nouvelle tâche... (Entrée pour ajouter)"
            className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none"
          />
          <button
            type="submit"
            disabled={submitting}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {submitting ? "Ajout..." : "Ajouter"}
          </button>
        </div>

        <div className="mt-3 flex flex-wrap gap-3 text-sm">
          <label className="flex items-center gap-1.5 text-slate-600">
            <span>Priorité :</span>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as PriorityType)}
              className="rounded-md border border-slate-300 px-2 py-1 text-slate-800"
            >
              <option value="normale">Normale</option>
              <option value="haute">Haute</option>
            </select>
          </label>

          <label className="flex items-center gap-1.5 text-slate-600">
            <span>Catégorie :</span>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as CategoryType)}
              className="rounded-md border border-slate-300 px-2 py-1 text-slate-800"
            >
              <option value="Travail">Travail</option>
              <option value="Perso">Perso</option>
              <option value="Études">Études</option>
            </select>
          </label>

          <label className="flex items-center gap-1.5 text-slate-600">
            <span>Date limite :</span>
            <input
              type="datetime-local"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="rounded-md border border-slate-300 px-2 py-1 text-slate-800"
            />
          </label>
        </div>
      </form>

      {/* Filtres */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2">
          {(
            [
              { key: "all", label: "Toutes" },
              { key: "todo", label: "À faire" },
              { key: "done", label: "Terminées" },
            ] as const
          ).map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setFilterBy(tab.key)}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium ${
                filterBy === tab.key
                  ? "bg-slate-900 text-white"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <select
          value={filterCategory}
          onChange={(e) =>
            setFilterCategory(e.target.value as CategoryType | "")
          }
          aria-label="Filtrer par catégorie"
          className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-800"
        >
          <option value="">Toutes catégories</option>
          <option value="Travail">Travail</option>
          <option value="Perso">Perso</option>
          <option value="Études">Études</option>
        </select>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Liste des tâches */}
      {loading ? (
        <p className="text-sm text-slate-500">Chargement des tâches...</p>
      ) : tasks.length === 0 ? (
        <p className="rounded-xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500">
          Aucune tâche à afficher.
        </p>
      ) : (
        <ul className="space-y-2.5">
          {tasks.map((task) => {
            const isEditing = editingId === task.id;
            return (
              <li
                key={task.id}
                className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
              >
                {isEditing ? (
                  <div className="space-y-2.5">
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-sm"
                    />
                    <div className="flex flex-wrap gap-2 text-sm">
                      <select
                        value={editPriority}
                        onChange={(e) =>
                          setEditPriority(e.target.value as PriorityType)
                        }
                        className="rounded-md border border-slate-300 px-2 py-1"
                      >
                        <option value="normale">Normale</option>
                        <option value="haute">Haute</option>
                      </select>
                      <select
                        value={editCategory}
                        onChange={(e) =>
                          setEditCategory(e.target.value as CategoryType)
                        }
                        className="rounded-md border border-slate-300 px-2 py-1"
                      >
                        <option value="Travail">Travail</option>
                        <option value="Perso">Perso</option>
                        <option value="Études">Études</option>
                      </select>
                      <input
                        type="datetime-local"
                        value={editDueDate}
                        onChange={(e) => setEditDueDate(e.target.value)}
                        className="rounded-md border border-slate-300 px-2 py-1"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => handleSaveEdit(task.id)}
                        className="rounded-md bg-emerald-600 px-3 py-1 text-xs font-medium text-white hover:bg-emerald-700"
                      >
                        Enregistrer
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingId(null)}
                        className="rounded-md bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-200"
                      >
                        Annuler
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={task.completed}
                        onChange={() => handleToggleCompleted(task)}
                        className="mt-1 h-4 w-4 cursor-pointer rounded border-slate-300"
                      />
                      <div>
                        <p
                          className={`text-sm font-medium ${
                            task.completed
                              ? "text-slate-400 line-through"
                              : "text-slate-900"
                          }`}
                        >
                          {task.title}
                        </p>
                        <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs">
                          <span className="rounded-full bg-slate-100 px-2.5 py-0.5 font-medium text-slate-700">
                            {task.category}
                          </span>
                          <span
                            className={`rounded-full px-2.5 py-0.5 font-medium ${
                              task.priority === "haute"
                                ? "bg-red-100 text-red-700"
                                : "bg-blue-100 text-blue-700"
                            }`}
                          >
                            Priorité : {task.priority}
                          </span>
                          {task.due_date && (
                            <span className="text-slate-500">
                              Échéance :{" "}
                              {new Date(task.due_date).toLocaleString("fr-FR", {
                                dateStyle: "short",
                                timeStyle: "short",
                              })}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex shrink-0 gap-2">
                      <button
                        type="button"
                        onClick={() => startEditing(task)}
                        className="rounded-md border border-slate-200 px-2.5 py-1 text-xs text-slate-700 hover:bg-slate-50"
                      >
                        Modifier
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(task.id)}
                        className="rounded-md border border-red-200 px-2.5 py-1 text-xs text-red-600 hover:bg-red-50"
                      >
                        Supprimer
                      </button>
                    </div>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
