from sqlalchemy.orm import Session
from app.models.employee import Employee
from app.core.security import hash_password
from app.database.session import engine, Base

def init_db(db: Session) -> None:
    # Tables are already created by SQLAlchemy in most setups, 
    # but ensuring Base.metadata.create_all is called is safe.
    Base.metadata.create_all(bind=engine)

    # Check if admin already exists
    admin = db.query(Employee).filter(Employee.email == "admin@timestamp.com").first()
    if not admin:
        admin = Employee(
            name="System Administrator",
            email="admin@timestamp.com",
            password=hash_password("admin123"),
            role="admin"
        )
        db.add(admin)
        db.commit()
        db.refresh(admin)
        print(f"Created initial admin user: {admin.email}")
    else:
        print(f"Admin user already exists: {admin.email}")
