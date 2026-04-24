from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes import health
from app.routes.auth_routes import router as auth_router
from app.routes.employee_routes import router as employee_router
from app.routes.project_routes import router as project_router
from app.routes.allocation_routes import router as allocation_router
from app.routes.task_routes import router as task_router
from app.routes.time_log_routes import router as time_log_router
from app.routes.approval_routes import router as approval_router

app = FastAPI(
    title="TimeStamp API",
    description="TimeStamp Backend API",
    version="1.0.0",
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from app.database.session import SessionLocal
from app.database.init_db import init_db

# Register routes
app.include_router(health.router, tags=["Health"])

@app.on_event("startup")
def on_startup():
    db = SessionLocal()
    try:
        init_db(db)
    finally:
        db.close()
app.include_router(auth_router, prefix="/api")
app.include_router(employee_router, prefix="/api")
app.include_router(project_router, prefix="/api")
app.include_router(allocation_router, prefix="/api")
app.include_router(task_router, prefix="/api")
app.include_router(time_log_router, prefix="/api")
app.include_router(approval_router, prefix="/api")
