import os
import pandas as pd
import numpy as np
import joblib
from sklearn.model_selection import StratifiedKFold
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score
from sklearn.ensemble import RandomForestClassifier
from sklearn.svm import SVC
from sklearn.neighbors import KNeighborsClassifier
import xgboost as xgb
import warnings
warnings.filterwarnings('ignore')

# Configuration
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATASET_PATH = os.path.join(BASE_DIR, "pose_landmarks.csv")
MODEL_SAVE_DIR = os.path.join(BASE_DIR, "saved_models")

def main():
    print("Loading dataset...")
    df = pd.read_csv(DATASET_PATH)
    
    if df.empty:
        print("Dataset is empty!")
        return

    # Separate features and labels
    X = df.drop('label', axis=1).values
    y_labels = df['label'].values
    
    # Encode labels
    le = LabelEncoder()
    y = le.fit_transform(y_labels)
    num_classes = len(le.classes_)
    print(f"Found {num_classes} distinct poses.")

    # Initialize models
    models = {
        'Random Forest': RandomForestClassifier(n_estimators=100, random_state=42, n_jobs=-1),
        'SVM (RBF)': SVC(kernel='rbf', probability=True, random_state=42),
        'XGBoost': xgb.XGBClassifier(use_label_encoder=False, eval_metric='mlogloss', random_state=42, n_jobs=-1),
        'KNN': KNeighborsClassifier(n_neighbors=5, n_jobs=-1)
    }

    # Cross-validation Setup (K=5)
    print("\nStarting 5-Fold Cross Validation. This will train each model 5 times...")
    kf = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
    
    results = []

    for name, model in models.items():
        print(f"\nEvaluating {name}...")
        fold_acc, fold_prec, fold_rec, fold_f1 = [], [], [], []
        
        fold_idx = 1
        for train_index, test_index in kf.split(X, y):
            X_train, X_test = X[train_index], X[test_index]
            y_train, y_test = y[train_index], y[test_index]
            
            # Train
            model.fit(X_train, y_train)
            
            # Predict
            y_pred = model.predict(X_test)
            
            # Calculate metrics
            fold_acc.append(accuracy_score(y_test, y_pred))
            fold_prec.append(precision_score(y_test, y_pred, average='macro', zero_division=0))
            fold_rec.append(recall_score(y_test, y_pred, average='macro', zero_division=0))
            fold_f1.append(f1_score(y_test, y_pred, average='macro', zero_division=0))
            
            print(f"  Fold {fold_idx}/5 - F1: {fold_f1[-1]:.4f}")
            fold_idx += 1
            
        # Store average metrics
        results.append({
            'Model': name,
            'Accuracy': np.mean(fold_acc),
            'Precision': np.mean(fold_prec),
            'Recall': np.mean(fold_rec),
            'F1-Score': np.mean(fold_f1)
        })

    # Display Leaderboard
    results_df = pd.DataFrame(results).sort_values(by='F1-Score', ascending=False).reset_index(drop=True)
    print("\n" + "="*50)
    print("MODEL LEADERBOARD (Cross-Validation Averages)")
    print("="*50)
    print(results_df.to_string(index=False))
    print("="*50)

    # Select Best Model
    best_model_name = results_df.iloc[0]['Model']
    best_model = models[best_model_name]
    print(f"\nWinner: {best_model_name}! Retraining on FULL dataset for maximum performance...")
    
    # Retrain on full dataset
    best_model.fit(X, y)
    
    # Save Model & Encoder
    os.makedirs(MODEL_SAVE_DIR, exist_ok=True)
    model_path = os.path.join(MODEL_SAVE_DIR, "best_pose_classifier.pkl")
    encoder_path = os.path.join(MODEL_SAVE_DIR, "label_encoder.pkl")
    
    joblib.dump(best_model, model_path)
    joblib.dump(le, encoder_path)
    
    print("\nSuccessfully saved:")
    print(f"- Model: {model_path}")
    print(f"- Encoder: {encoder_path}")
    print("Step 4 complete. The virtual coach now has a brain!")

if __name__ == '__main__':
    main()
