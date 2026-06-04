import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler

class TransactionProcessor:
    def __init__(self):
        self.scaler = StandardScaler()

    def generate_synthetic_data(self, num_samples=5000):
        """Generates mock transaction data with a heavy class imbalance (~2% fraud)."""
        np.random.seed(42)
        
        # Features: Amount, TimeOfDay, Velocity (transactions in last hour), LocationMismatches
        amounts = np.random.exponential(scale=50, size=num_samples)
        time_of_day = np.random.uniform(0, 24, size=num_samples)
        velocity = np.random.poisson(lam=2, size=num_samples)
        loc_mismatch = np.random.binomial(n=1, p=0.05, size=num_samples)
        
        df = pd.DataFrame({
            'amount': amounts,
            'time_of_day': time_of_day,
            'velocity': velocity,
            'location_mismatch': loc_mismatch,
            'is_fraud': 0
        })
        
        # Inject synthetic fraud rules
        fraud_condition = (df['amount'] > 250) | ((df['velocity'] > 5) & (df['location_mismatch'] == 1))
        df.loc[fraud_condition, 'is_fraud'] = np.random.binomial(n=1, p=0.8, size=sum(fraud_condition))
        
        return df

    def prepare_data(self, df):
        """Splits data and normalizes numerical features."""
        X = df.drop(columns=['is_fraud'])
        y = df['is_fraud']
        
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)
        
        # Scale continuous features
        X_train_scaled = self.scaler.fit_transform(X_train)
        X_test_scaled = self.scaler.transform(X_test)
        
        return X_train_scaled, X_test_scaled, y_train, y_test
