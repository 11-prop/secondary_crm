# backend/schemas/__init__.py
from .user import UserBase, UserCreate, UserResponse
from .customer import CustomerBase, CustomerCreate, CustomerUpdate, CustomerResponse
from .property import PropertyBase, PropertyCreate, PropertyResponse
from .response import APIResponse, APIPaginatedResponse, PaginationMeta
from .agent import AgentBase, AgentCreate, AgentUpdate, AgentResponse
from .interaction_note import InteractionNoteBase, InteractionNoteCreate, InteractionNoteResponse
from .project import ProjectBase, ProjectCreate, ProjectResponse
from .floor_plan import FloorPlanBase, FloorPlanCreate, FloorPlanResponse
from .transaction import TransactionBase, TransactionCreate, TransactionResponse