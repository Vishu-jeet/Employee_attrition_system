from pathlib import Path
import json
import joblib
import pandas as pd
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import io
from fastapi import UploadFile, File
import os
import shutil

from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.impute import SimpleImputer
from sklearn.pipeline import Pipeline
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score
)

BASE = Path(__file__).resolve().parents[1]
DATA = BASE / "data"
CSV = DATA / "employee_attrition_sample.csv"
MODEL = DATA / "attrition_model.joblib"
METRICS = DATA / "metrics.json"

UPLOAD_DIR = DATA / "uploads"
STAGED_CSV = UPLOAD_DIR / "uploaded_employee_dataset.csv"

MAX_UPLOAD_SIZE = 10 * 1024 * 1024  # 10 MB

REQUIRED_COLUMNS = [
    "Age",
    "Department",
    "JobRole",
    "MonthlyIncome",
    "YearsAtCompany",
    "JobSatisfaction",
    "WorkLifeBalance",
    "OverTime",
    "PerformanceRating",
    "Attrition"
]

NUMERIC_COLUMNS = [
    "Age",
    "MonthlyIncome",
    "YearsAtCompany",
    "JobSatisfaction",
    "WorkLifeBalance",
    "PerformanceRating"
]

app = FastAPI(title="Employee Attrition Prediction API", version="1.1.0",
              description="Educational API using synthetic employee records.")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True, allow_methods=["*"], allow_headers=["*"]
)

class Employee(BaseModel):
    Age: int = Field(ge=18, le=70)
    Department: str
    JobRole: str
    MonthlyIncome: float = Field(gt=0)
    YearsAtCompany: int = Field(ge=0, le=50)
    JobSatisfaction: int = Field(ge=1, le=4)
    WorkLifeBalance: int = Field(ge=1, le=4)
    OverTime: str
    PerformanceRating: int = Field(ge=1, le=4)

def dataset():
    if not CSV.exists():
        raise HTTPException(503, "Dataset missing. Run python -m ml.train in backend.")
    return pd.read_csv(CSV)

@app.get("/")
def root():
    return {"message": "Employee Attrition Prediction API", "docs": "/docs"}

@app.get("/health")
def health():
    return {"status": "ok", "message": "API is running"}

@app.get("/summary")
def summary():
    df = dataset()
    total = len(df)
    left = int(df["Attrition"].sum())
    return {"totalEmployees": total, "attritionCount": left,
            "attritionRate": round(left / total * 100, 1) if total else 0,
            "retainedCount": total-left, "dataType": "Synthetic sample data"}

@app.get("/metrics")
def metrics():
    if not METRICS.exists():
        raise HTTPException(503, "Metrics missing. Run the training script first.")
    return json.loads(METRICS.read_text())

@app.get("/employees")
def employees(limit: int = 100):
    return dataset().head(max(1, min(limit, 700))).to_dict(orient="records")

@app.get("/analytics")
def analytics():
    df = dataset()
    dept = df.groupby("Department", as_index=False).agg(
        employees=("Attrition", "size"), attrition=("Attrition", "sum"))
    dept["retained"] = dept["employees"] - dept["attrition"]
    dept["attritionRate"] = (dept["attrition"] / dept["employees"] * 100).round(1)

    sat = df.groupby("JobSatisfaction", as_index=False).agg(
        employees=("Attrition", "size"), attrition=("Attrition", "sum"))
    sat["label"] = sat["JobSatisfaction"].map(
        {1: "Low", 2: "Medium-low", 3: "Medium-high", 4: "High"})

    bins = [0, 30000, 50000, 75000, 100000, float("inf")]
    labels = ["<30k", "30–50k", "50–75k", "75–100k", "100k+"]
    df["incomeBand"] = pd.cut(df["MonthlyIncome"], bins=bins, labels=labels)
    income = df.groupby("incomeBand", observed=False).agg(
        employees=("Attrition", "size"), attrition=("Attrition", "sum")).reset_index()
    overtime = df.groupby("OverTime", as_index=False).agg(
        employees=("Attrition", "size"), attrition=("Attrition", "sum"))
    return {
        "department": dept.to_dict(orient="records"),
        "attritionDistribution": [
            {"name": "Retained", "value": int((df.Attrition == 0).sum())},
            {"name": "Left", "value": int((df.Attrition == 1).sum())}],
        "satisfaction": sat.to_dict(orient="records"),
        "income": [{"band": str(r.incomeBand), "employees": int(r.employees),
                    "attrition": int(r.attrition)} for r in income.itertuples()],
        "overtime": overtime.to_dict(orient="records"),
        "dataType": "Synthetic sample data"
    }

@app.post("/predict")
def predict(employee: Employee):
    if not MODEL.exists():
        raise HTTPException(503, "Model missing. Run python -m ml.train in backend.")
    model = joblib.load(MODEL)
    row = pd.DataFrame([employee.model_dump()])
    cls = int(model.predict(row)[0])
    probability = float(model.predict_proba(row)[0][1])
    return {"prediction": "Higher predicted attrition risk" if cls else "Lower predicted attrition risk",
            "class": cls, "probability": round(probability, 4),
            "disclaimer": "Educational estimate from synthetic data only; not a decision about any real employee."}


def validate_uploaded_dataset(df):
    missing = [col for col in REQUIRED_COLUMNS if col not in df.columns]

    if missing:
        raise HTTPException(
            status_code=400,
            detail=f"Missing required columns: {missing}"
        )

    if len(df) < 20:
        raise HTTPException(
            status_code=400,
            detail="Dataset must contain at least 20 employee records."
        )

    df = df[REQUIRED_COLUMNS].copy()

    # Validate numeric columns
    for col in NUMERIC_COLUMNS:
        df[col] = pd.to_numeric(df[col], errors="coerce")

    if df[NUMERIC_COLUMNS].isnull().any().any():
        raise HTTPException(
            status_code=400,
            detail="Numeric columns contain missing or invalid values."
        )

    # Validate text columns
    text_columns = ["Department", "JobRole", "OverTime"]

    for col in text_columns:
        df[col] = df[col].astype(str).str.strip()

        if (df[col] == "").any():
            raise HTTPException(
                status_code=400,
                detail=f"{col} contains empty values."
            )

    # Normalize attrition labels
    attrition_map = {
        "yes": 1, "no": 0,
        "1": 1, "0": 0,
        "true": 1, "false": 0
    }

    labels = df["Attrition"].astype(str).str.strip().str.lower()
    normalized = labels.map(attrition_map)

    if normalized.isnull().any():
        raise HTTPException(
            status_code=400,
            detail="Attrition must contain Yes/No or 1/0 values."
        )

    df["Attrition"] = normalized.astype(int)

    if df["Attrition"].nunique() != 2:
        raise HTTPException(
            status_code=400,
            detail="Dataset must contain both attrition classes: 0 and 1."
        )

    if df["Attrition"].value_counts().min() < 2:
        raise HTTPException(
            status_code=400,
            detail="Each attrition class must have at least 2 records."
        )

    if (df["Age"] < 18).any() or (df["Age"] > 100).any():
        raise HTTPException(400, "Age must be between 18 and 100.")

    if (df["MonthlyIncome"] <= 0).any():
        raise HTTPException(400, "MonthlyIncome must be greater than zero.")

    if (df["YearsAtCompany"] < 0).any():
        raise HTTPException(400, "YearsAtCompany cannot be negative.")

    for col in ["JobSatisfaction", "WorkLifeBalance", "PerformanceRating"]:
        if not df[col].between(1, 4).all():
            raise HTTPException(400, f"{col} must contain ratings from 1 to 4.")

    overtime = df["OverTime"].str.lower()

    if not overtime.isin(["yes", "no"]).all():
        raise HTTPException(400, "OverTime must contain Yes or No.")

    df["OverTime"] = overtime.map({"yes": "Yes", "no": "No"})

    return df


@app.post("/dataset/upload")
async def upload_dataset(file: UploadFile = File(...)):
    if not file.filename or not file.filename.lower().endswith(".csv"):
        raise HTTPException(400, "Please upload a CSV file.")

    content = await file.read()

    if not content:
        raise HTTPException(400, "The uploaded file is empty.")

    if len(content) > MAX_UPLOAD_SIZE:
        raise HTTPException(400, "Maximum upload size is 10 MB.")

    try:
        df = pd.read_csv(io.BytesIO(content))
        df = validate_uploaded_dataset(df)
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(
            status_code=400,
            detail=f"Unable to read CSV file: {str(exc)}"
        )

    UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

    temporary_file = UPLOAD_DIR / "upload_temporary.csv"

    df.to_csv(temporary_file, index=False)
    temporary_file.replace(STAGED_CSV)

    return {
        "message": "Dataset uploaded and validated successfully.",
        "filename": file.filename,
        "totalRecords": len(df),
        "attritionCount": int(df["Attrition"].sum()),
        "retainedCount": int((df["Attrition"] == 0).sum()),
        "columns": REQUIRED_COLUMNS,
        "preview": df.head(5).to_dict(orient="records"),
        "readyForTraining": True
    }


@app.get("/dataset/preview")
def dataset_preview():
    if not STAGED_CSV.exists():
        raise HTTPException(404, "No uploaded dataset found.")

    df = pd.read_csv(STAGED_CSV)

    return {
        "totalRecords": len(df),
        "preview": df.head(10).to_dict(orient="records")
    }


@app.get("/dataset/status")
def dataset_status():
    if not STAGED_CSV.exists():
        return {
            "uploaded": False,
            "message": "No new dataset uploaded."
        }

    df = pd.read_csv(STAGED_CSV)

    return {
        "uploaded": True,
        "totalRecords": len(df),
        "filename": STAGED_CSV.name,
        "readyForTraining": True
    }

@app.post("/dataset/train")
def train_uploaded_dataset():
    if not STAGED_CSV.exists():
        raise HTTPException(
            status_code=404,
            detail="Upload and validate a dataset before training."
        )

    df = pd.read_csv(STAGED_CSV)
    df = validate_uploaded_dataset(df)

    numeric = [
        "Age", "MonthlyIncome", "YearsAtCompany",
        "JobSatisfaction", "WorkLifeBalance", "PerformanceRating"
    ]

    categorical = ["Department", "JobRole", "OverTime"]
    features = numeric + categorical

    X = df[features]
    y = df["Attrition"]

    if y.value_counts().min() < 2:
        raise HTTPException(
            status_code=400,
            detail="Not enough examples in both attrition classes."
        )

    prep = ColumnTransformer([
        ("num", Pipeline([
            ("impute", SimpleImputer(strategy="median")),
            ("scale", StandardScaler())
        ]), numeric),

        ("cat", Pipeline([
            ("impute", SimpleImputer(strategy="most_frequent")),
            ("encode", OneHotEncoder(handle_unknown="ignore"))
        ]), categorical)
    ])

    new_model = Pipeline([
        ("prep", prep),
        ("rf", RandomForestClassifier(
            n_estimators=250,
            random_state=42,
            class_weight="balanced"
        ))
    ])

    try:
        X_train, X_test, y_train, y_test = train_test_split(
            X, y,
            test_size=0.2,
            random_state=42,
            stratify=y
        )

        new_model.fit(X_train, y_train)
        predictions = new_model.predict(X_test)

        new_metrics = {
            "accuracy": round(accuracy_score(y_test, predictions), 4),
            "precision": round(
                precision_score(y_test, predictions, zero_division=0), 4
            ),
            "recall": round(
                recall_score(y_test, predictions, zero_division=0), 4
            ),
            "f1": round(
                f1_score(y_test, predictions, zero_division=0), 4
            ),
            "note": "Metrics from the uploaded dataset test split."
        }

        DATA.mkdir(parents=True, exist_ok=True)

        # Prepare new files without touching the active files.
        temp_model = DATA / "new_model.tmp"
        temp_metrics = DATA / "new_metrics.tmp"
        temp_csv = DATA / "new_dataset.tmp"

        joblib.dump(new_model, temp_model)
        temp_metrics.write_text(json.dumps(new_metrics, indent=2))
        df.to_csv(temp_csv, index=False)

        # Back up current active files before replacing anything.
        active_files = [MODEL, METRICS, CSV]
        backups = {}

        for active in active_files:
            if active.exists():
                backup = active.with_name(active.name + ".backup")
                shutil.copy2(active, backup)
                backups[active] = backup

        try:
            os.replace(temp_csv, CSV)
            os.replace(temp_model, MODEL)
            os.replace(temp_metrics, METRICS)

        except Exception:
            # Restore the previous working files if activation fails.
            for active in active_files:
                backup = backups.get(active)
                if backup and backup.exists():
                    shutil.copy2(backup, active)
            raise

        return {
            "message": "New model trained and activated successfully.",
            "totalRecords": len(df),
            "trainingRecords": len(X_train),
            "testingRecords": len(X_test),
            "metrics": new_metrics,
            "activeDataset": CSV.name
        }

    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Model training failed: {str(exc)}"
        )
