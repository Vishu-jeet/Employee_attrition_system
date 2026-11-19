# Employee Attrition Prediction System

Learning/demo project: React frontend + FastAPI backend + scikit-learn model.
All records are synthetic sample data. This is not a real company's HR system.

## GitHub setup
1. Create a GitHub repository named `employee-attrition-system`.
2. Download and extract this ZIP.
3. Upload all extracted files/folders using GitHub → Add file → Upload files.
4. Keep the paths exactly as shown below.

## Backend
Open terminal in `backend`:
```bash
python -m venv .venv
# Windows: .venv\\Scripts\\activate
# macOS/Linux: source .venv/bin/activate
pip install -r requirements.txt
python -m ml.train
uvicorn app.main:app --reload
```
API docs: http://127.0.0.1:8000/docs

## Frontend
Open a second terminal in `frontend`:
```bash
npm install
npm run dev
```
Open http://localhost:5173

## Files to upload
- README.md
- backend/requirements.txt
- backend/ml/train.py
- backend/app/main.py
- frontend/package.json
- frontend/index.html
- frontend/vite.config.js
- frontend/src/main.jsx
- frontend/src/App.jsx
- frontend/src/style.css
- .gitignore

The training script creates `backend/data/employee_attrition_sample.csv`, a trained model, and metrics. Those files are generated locally and excluded from Git. Model results are based on synthetic data, not real workplace evidence. Do not use predictions for actual employment decisions.
