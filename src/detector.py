from imblearn.ensemble import BalancedRandomForestClassifier
from sklearn.metrics import classification_report, roc_auc_score
import numpy as np

class FraudDetector:
    def __init__(self):
        # Using sampling techniques built into the classifier for class imbalance
        self.model = BalancedRandomForestClassifier(n_estimators=100, random_state=42)

    def train(self, X_train, y_train):
        """Trains the underlying risk assessment model."""
        self.model.fit(X_train, y_train)

    def evaluate(self, X_test, y_test):
        """Evaluates model performance metrics."""
        predictions = self.model.predict(X_test)
        probabilities = self.model.predict_proba(X_test)[:, 1]
        
        print("\n--- Model Evaluation Metrics ---")
        print(classification_report(y_test, predictions))
        print(f"ROC-AUC Score: {roc_auc_score(y_test, probabilities):.4f}\n")

    def assess_risk(self, scaled_features):
        """Calculates a dynamic risk score between 0 and 100 for a transaction."""
        prob = self.model.predict_proba(scaled_features)[:, 1][0]
        risk_score = round(prob * 100, 2)
        
        if risk_score < 30:
            verdict = "APPROVED (Low Risk)"
        elif risk_score < 75:
            verdict = "FLAGGED (Medium Risk - Require MFA)"
        else:
            verdict = "DECLINED (High Risk - Fraud Suspected)"
            
        return risk_score, verdict
