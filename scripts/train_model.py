import os
import urllib.request
import pandas as pd
import numpy as np
import json
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import classification_report

DATASET_URL = "https://raw.githubusercontent.com/GabrielReisR/R/master/estrutura%20de%20dados/dados/dass42.csv"
CSV_PATH = "scripts/dass42.csv"

def download_dataset():
    if not os.path.exists(CSV_PATH):
        print(f"Downloading dataset from {DATASET_URL}...")
        os.makedirs(os.path.dirname(CSV_PATH), exist_ok=True)
        urllib.request.urlretrieve(DATASET_URL, CSV_PATH)
        print("Download complete.")
    else:
        print("Dataset already downloaded.")

def get_depression_level(score):
    if score <= 9: return 0
    if score <= 13: return 1
    if score <= 20: return 2
    if score <= 27: return 3
    return 4

def get_anxiety_level(score):
    if score <= 7: return 0
    if score <= 9: return 1
    if score <= 14: return 2
    if score <= 19: return 3
    return 4

def get_stress_level(score):
    if score <= 14: return 0
    if score <= 18: return 1
    if score <= 25: return 2
    if score <= 33: return 3
    return 4

def main():
    download_dataset()
    
    print("Loading dataset...")
    with open(CSV_PATH, 'r') as f:
        first_line = f.readline()
    sep = '\t' if '\t' in first_line else ','
    
    df = pd.read_csv(CSV_PATH, sep=sep)
    print(f"Dataset shape: {df.shape}")
    
    q_cols = [f"Q{i}A" for i in range(1, 22)]
    
    missing_cols = [c for c in q_cols if c not in df.columns]
    if missing_cols:
        print(f"Warning: missing columns: {missing_cols}")
        q_cols = [c for c in df.columns if c.upper().startswith('Q') and c.upper().endswith('A')][:21]
        print(f"Using found columns: {q_cols}")
        
    X = df[q_cols].copy()
    
    max_val = X.max().max()
    min_val = X.min().min()
    print(f"Original values range: {min_val} to {max_val}")
    
    if min_val >= 1 and max_val <= 4:
        print("Converting scale 1-4 to 0-3...")
        X = X - 1
    elif min_val >= 0 and max_val <= 3:
        print("Scale is already 0-3.")
    else:
        print("Unexpected values, cleaning rows outside [1, 4]...")
        for col in q_cols:
            df = df[(df[col] >= 1) & (df[col] <= 4)]
        X = df[q_cols].copy() - 1
        
    print(f"Cleaned dataset shape: {X.shape}")
    
    dep_indices = [3, 5, 10, 13, 16, 17, 21]
    anx_indices = [2, 4, 7, 9, 15, 19, 20]
    str_indices = [1, 6, 8, 11, 12, 14, 18]
    
    dep_cols = [f"Q{i}A" for i in dep_indices]
    anx_cols = [f"Q{i}A" for i in anx_indices]
    str_cols = [f"Q{i}A" for i in str_indices]
    
    dep_score = X[dep_cols].sum(axis=1) * 2
    anx_score = X[anx_cols].sum(axis=1) * 2
    str_score = X[str_cols].sum(axis=1) * 2
    
    y_dep = dep_score.apply(get_depression_level)
    y_anx = anx_score.apply(get_anxiety_level)
    y_str = str_score.apply(get_stress_level)
    
    model_weights = {}
    
    targets = {
        "depression": (y_dep, "Depression"),
        "anxiety": (y_anx, "Anxiety"),
        "stress": (y_str, "Stress")
    }
    
    for name, (y, label) in targets.items():
        print(f"\n--- Training Model for {label} ---")
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
        
        model = LogisticRegression(max_iter=1000)
        model.fit(X_train, y_train)
        
        preds = model.predict(X_test)
        print(f"Accuracy: {np.mean(preds == y_test):.4f}")
        print(classification_report(y_test, preds, target_names=["Normal", "Mild", "Moderate", "Severe", "Extremely Severe"]))
        
        model_weights[name] = {
            "classes": model.classes_.tolist(),
            "coef": model.coef_.tolist(),
            "intercept": model.intercept_.tolist()
        }
    
    output_dir = "public/model"
    os.makedirs(output_dir, exist_ok=True)
    output_path = os.path.join(output_dir, "dass21_weights.json")
    
    with open(output_path, 'w') as f:
        json.dump(model_weights, f, indent=2)
        
    print(f"\nSaved model weights to {output_path}")

if __name__ == "__main__":
    main()
