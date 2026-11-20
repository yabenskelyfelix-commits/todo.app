from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlmodel import Session, select

from app.database import get_session
from app.models.task import Task, TaskCreate, TaskRead, TaskUpdate, utc_now

router = APIRouter(prefix="/api/tasks", tags=["tasks"])


@router.get("", response_model=list[TaskRead])
def list_tasks(
    filter_by: str = Query(default="all", pattern="^(all|todo|done)$"),
    priority: Optional[str] = None,
    category: Optional[str] = None,
    session: Session = Depends(get_session),
):
    statement = select(Task)

    if filter_by == "todo":
        statement = statement.where(Task.completed == False)  # noqa: E712
    elif filter_by == "done":
        statement = statement.where(Task.completed == True)  # noqa: E712

    if priority:
        statement = statement.where(Task.priority == priority)
    if category:
        statement = statement.where(Task.category == category)

    statement = statement.order_by(Task.created_at.desc())
    return session.exec(statement).all()


@router.post("", response_model=TaskRead, status_code=status.HTTP_201_CREATED)
def create_task(payload: TaskCreate, session: Session = Depends(get_session)):
    task = Task.model_validate(payload)
    session.add(task)
    session.commit()
    session.refresh(task)
    return task


@router.patch("/{task_id}", response_model=TaskRead)
def update_task(
    task_id: int,
    payload: TaskUpdate,
    session: Session = Depends(get_session),
):
    task = session.get(Task, task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Tâche introuvable")

    updates = payload.model_dump(exclude_unset=True)

    # Synchronise completed et status si l'un des deux est modifié
    if "completed" in updates and "status" not in updates:
        updates["status"] = "done" if updates["completed"] else "todo"
    elif "status" in updates and "completed" not in updates:
        updates["completed"] = updates["status"] == "done"

    for key, value in updates.items():
        setattr(task, key, value)

    task.updated_at = utc_now()
    session.add(task)
    session.commit()
    session.refresh(task)
    return task


@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_task(task_id: int, session: Session = Depends(get_session)):
    task = session.get(Task, task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Tâche introuvable")

    session.delete(task)
    session.commit()