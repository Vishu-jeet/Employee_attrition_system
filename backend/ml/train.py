from pathlib import Path
import numpy as np, pandas as pd, joblib, json
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.impute import SimpleImputer
from sklearn.pipeline import Pipeline
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score

BASE = Path(__file__).resolve().parents[1]
DATA = BASE / "data"
DATA.mkdir(exist_ok=True)

def main():
    rng = np.random.default_rng(42)
    n = 700
    age = rng.integers(21, 61, n)
    income = rng.integers(22000, 150001, n)
    tenure = rng.integers(0, 21, n)
    satisfaction = rng.integers(1, 5, n)
    balance = rng.integers(1, 5, n)
    overtime = rng.choice(["Yes", "No"], n, p=[.32, .68])
    dept = rng.choice(["Sales", "Research", "Human Resources", "IT"], n)
    role = rng.choice(["Analyst", "Developer", "Manager", "Executive"], n)
    rating = rng.integers(1, 5, n)
    logit = -2.2 + .75*(overtime=="Yes") + .65*(satisfaction==1) + .35*(balance==1) + .25*(income<40000) - .035*tenure
    prob = 1/(1+np.exp(-logit))
    y = (rng.random(n)<prob).astype(int)
    df = pd.DataFrame({"Age":age,"Department":dept,"JobRole":role,"MonthlyIncome":income,
        "YearsAtCompany":tenure,"JobSatisfaction":satisfaction,"WorkLifeBalance":balance,
        "OverTime":overtime,"PerformanceRating":rating,"Attrition":y})
    df.to_csv(DATA/"employee_attrition_sample.csv", index=False)
    numeric = ["Age","MonthlyIncome","YearsAtCompany","JobSatisfaction","WorkLifeBalance","PerformanceRating"]
    categorical = ["Department","JobRole","OverTime"]
    prep = ColumnTransformer([
        ("num", Pipeline([("impute",SimpleImputer(strategy="median")),("scale",StandardScaler())]), numeric),
        ("cat", Pipeline([("impute",SimpleImputer(strategy="most_frequent")),("encode",OneHotEncoder(handle_unknown="ignore"))]), categorical)
    ])
    model = Pipeline([("prep",prep),("rf",RandomForestClassifier(n_estimators=250,random_state=42,class_weight="balanced"))])
    X = df[numeric+categorical]
    Xtr,Xte,ytr,yte = train_test_split(X,y,test_size=.2,random_state=42,stratify=y)
    model.fit(Xtr,ytr); pred=model.predict(Xte)
    joblib.dump(model, DATA/"attrition_model.joblib")
    metrics = {"accuracy":round(accuracy_score(yte,pred),4),"precision":round(precision_score(yte,pred,zero_division=0),4),
               "recall":round(recall_score(yte,pred,zero_division=0),4),"f1":round(f1_score(yte,pred,zero_division=0),4),
               "note":"Scores are from synthetic sample data only."}
    (DATA/"metrics.json").write_text(json.dumps(metrics,indent=2))
    print("Created synthetic dataset, trained model and metrics:", metrics)

if __name__ == "__main__": main()
