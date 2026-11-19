# PeoplePulse – AI-Powered Employee Attrition Prediction System

\<p align="center">   \<strong>An intelligent workforce analytics and employee attrition prediction platform\</strong> \</p>

\<p align="center">   \<img src="[https://img.shields.io/badge/Python-3.10%2B-blue?logo=python](https://img.shields.io/badge/Python-3.10%2B-blue?logo=python)" />   \<img src="[https://img.shields.io/badge/React-Vite-61DAFB?logo=react](https://img.shields.io/badge/React-Vite-61DAFB?logo=react)" />   \<img src="[https://img.shields.io/badge/FastAPI-Backend-009688?logo=fastapi](https://img.shields.io/badge/FastAPI-Backend-009688?logo=fastapi)" />   \<img src="[https://img.shields.io/badge/Machine%20Learning-Scikit--learn-orange?logo=scikitlearn](https://img.shields.io/badge/Machine%20Learning-Scikit--learn-orange?logo=scikitlearn)" />   \<img src="[https://img.shields.io/badge/Status-Development-success](https://img.shields.io/badge/Status-Development-success)" /> \</p>

---

## 📌 Project Overview

**PeoplePulse** is an AI-powered Employee Attrition Prediction and Workforce Analytics System designed to help organizations understand employee turnover patterns and identify employees who may be at a higher risk of leaving an organization.

The application combines Machine Learning, Python, FastAPI, and React to provide an interactive dashboard for analyzing employee information, visualizing workforce trends, uploading custom employee datasets, and training machine learning models.

The system uses a Random Forest Classifier to predict employee attrition based on factors such as age, department, job role, monthly income, job satisfaction, work-life balance, overtime, and years at the company.

## ✨ Key Features

### 1. Interactive Dashboard

- Total employee overview.
- Employee attrition count.
- Employee retention statistics.
- Overall attrition rate.
- Workforce analytics and visualizations.

### 2. Employee Attrition Prediction

- Predict employee attrition risk.
- Analyze employee-related factors.
- Generate prediction probabilities.
- Provide higher-risk and lower-risk classifications.

### 3. Dataset Management

- Upload employee datasets in CSV format.
- Validate uploaded CSV files.
- Preview uploaded employee records.
- Check dataset status and record count.
- Train a new machine learning model using uploaded data.
- Activate the newly trained model.

### 4. Workforce Analytics

- Department-wise employee analysis.
- Job satisfaction analysis.
- Monthly income distribution.
- Overtime analysis.
- Employee attrition distribution.

### 5. Model Performance

- Accuracy
- Precision
- Recall
- F1-score

## 🛠️ Technology Stack

| Category         | Technologies               |
| ---------------- | -------------------------- |
| Frontend         | React.js, Vite, JavaScript |
| Styling          | CSS                        |
| Backend          | Python, FastAPI            |
| Machine Learning | Scikit-learn               |
| Data Processing  | Pandas, NumPy              |
| Model Storage    | Joblib                     |
| API Testing      | Swagger UI                 |
| Version Control  | Git, GitHub                |

## 🏗️ Project Architecture

```text
EMPLOYEE-ATTRITION-SYSTEM/
│
├── backend/
│   ├── app/
│   │   └── main.py
│   │
│   ├── data/
│   │   ├── employee_attrition_sample.csv
│   │   ├── attrition_model.joblib
│   │   └── metrics.json
│   │
│   ├── ml/
│   │   └── train.py
│   │
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── style.css
│   │
│   ├── package.json
│   └── index.html
│
├── .gitignore
└── README.md
```

*The structure above represents the main application files. Local virtual environments, installed dependencies, and uploaded datasets are excluded from version control.*

## ⚙️ Installation and Setup

Follow these steps to run PeoplePulse locally.

### Prerequisites

Install the following:

- Python 3.10 or above
- Node.js and npm
- Git
- Visual Studio Code

### Step 1: Clone the Repository

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
```

Navigate into the project:

```bash
cd EMPLOYEE-ATTRITION-SYSTEM
```

### Step 2: Setup Backend

Open a terminal:

```bash
cd backend
```

Create a Python virtual environment:

```bash
python3 -m venv .venv
```

Activate the environment on macOS/Linux:

```bash
source .venv/bin/activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

If the model and sample dataset are not included in the repository, generate the initial model and dataset:

```bash
python -m ml.train
```

Start the FastAPI server:

```bash
uvicorn app.main:app --reload
```

Backend URL:

```text
http://127.0.0.1:8000
```

API documentation:

```text
http://127.0.0.1:8000/docs
```

### Step 3: Setup Frontend

Open another terminal:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Start the React development server:

```bash
npm run dev
```

Frontend URL:

```text
http://localhost:5173
```

## 🔌 API Endpoints

The backend provides the following REST API endpoints:

| Method | Endpoint           | Description                    |
| ------ | ------------------ | ------------------------------ |
| GET    | `/`                | API information                |
| GET    | `/health`          | Backend health check           |
| GET    | `/summary`         | Employee summary               |
| GET    | `/metrics`         | Model evaluation metrics       |
| GET    | `/employees`       | Employee records               |
| GET    | `/analytics`       | Workforce analytics            |
| POST   | `/predict`         | Predict employee attrition     |
| POST   | `/dataset/upload`  | Upload employee CSV            |
| GET    | `/dataset/status`  | Check uploaded dataset         |
| GET    | `/dataset/preview` | Preview uploaded records       |
| POST   | `/dataset/train`   | Train and activate a new model |

## 📊 Dataset Information

The application supports CSV datasets containing the following columns:

| Column            | Description                               |
| ----------------- | ----------------------------------------- |
| Age               | Employee age                              |
| Department        | Employee department                       |
| JobRole           | Employee job role                         |
| MonthlyIncome     | Monthly salary                            |
| YearsAtCompany    | Years spent in the company                |
| JobSatisfaction   | Job satisfaction rating (1–4)             |
| WorkLifeBalance   | Work-life balance rating (1–4)            |
| OverTime          | Whether the employee works overtime       |
| PerformanceRating | Employee performance rating (1–4)         |
| Attrition         | Whether the employee left (Yes/No or 1/0) |

**Dataset validation requirements:**

- CSV format.
- Minimum 20 employee records.
- All required columns must be present.
- Both attrition classes must be represented.
- Numeric and categorical values must be valid.

## 🤖 Machine Learning Methodology

PeoplePulse uses a Random Forest Classifier for employee attrition prediction.

### Model Workflow

1. Employee dataset collection.
2. Dataset validation and preprocessing.
3. Numerical feature preprocessing.
4. Categorical feature encoding.
5. Train-test split (80:20).
6. Random Forest model training.
7. Model evaluation.
8. Model serialization using Joblib.
9. Prediction through FastAPI.

### Evaluation Metrics

The model is evaluated using:

- Accuracy
- Precision
- Recall
- F1-score

Metrics depend on the uploaded dataset and the train-test split. No fixed performance level is guaranteed.

