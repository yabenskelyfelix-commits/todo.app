from datetime import datetime, timezone
from enum import Enum
from typing import Literal, Optional
from sqlmodel import Field, SQLModel

PriorityLiteral = Literal["normale", "haute"]
CategoryLiteral = Literal["Travail", "Perso", "Études"]
StatusLiteral = Literal["todo", "in_progress", "done"]


class PriorityEnum(str, Enum):
    normale = "normale"
    haute = "haute"


class CategoryEnum(str, Enum):
    travail = "Travail"
    perso = "Perso"
    etudes = "Études"


class StatusEnum(str, Enum):
    todo = "todo"
    in_progress = "in_progress"
    done = "done"


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


class TaskBase(SQLModel):
    title: str = Field(min_length=1, max_length=255)
    description: Optional[str] = None
    completed: bool = False
    status: str = Field(default=StatusEnum.todo.value)
    priority: str = Field(default=PriorityEnum.normale.value)
    category: str = Field(default=CategoryEnum.travail.value)
    due_date: Optional[datetime] = None


class Task(TaskBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    created_at: datetime = Field(default_factory=utc_now)
    updated_at: datetime = Field(default_factory=utc_now)


class TaskCreate(SQLModel):
    title: str = Field(min_length=1, max_length=255)
    description: Optional[str] = None
    priority: PriorityLiteral = "normale"
    category: CategoryLiteral = "Travail"
    due_date: Optional[datetime] = None


class TaskUpdate(SQLModel):
    title: Optional[str] = Field(default=None, min_length=1, max_length=255)
    description: Optional[str] = None
    completed: Optional[bool] = None
    status: Optional[StatusLiteral] = None
    priority: Optional[PriorityLiteral] = None
    category: Optional[CategoryLiteral] = None
    due_date: Optional[datetime] = None


class TaskRead(SQLModel):
    id: int
    title: str
    description: Optional[str] = None
    completed: bool
    status: StatusLiteral
    priority: PriorityLiteral
    category: CategoryLiteral
    due_date: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime