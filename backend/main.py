from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from database import engine, Base

from models import tender, bidder, application, document, audit_log
from routes import tender_routes, bidder_routes, application_routes, document_routes, dashboard_routes

app = FastAPI(title="GeM AI Compliance Verification Platform")

Base.metadata.create_all(bind=engine)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # for hackathon dev only — restrict this in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serves uploaded documents so the officer dashboard can open/preview them,
# e.g. GET /files/APP-XXXX/somefile.pdf
app.mount("/files", StaticFiles(directory="uploads"), name="files")

app.include_router(tender_routes.router)
app.include_router(bidder_routes.router)
app.include_router(application_routes.router)
app.include_router(document_routes.router)
app.include_router(dashboard_routes.router)


@app.get("/")
def root():
    return {"status": "running", "message": "GeM Compliance Platform API is up"}