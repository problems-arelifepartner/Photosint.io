import numpy as np
from src.processor import TransactionProcessor
from src.detector import FraudDetector

def main():
    print("Initializing SecurePay Shield Pipeline...")
    processor = TransactionProcessor()
    detector = FraudDetector()
    
    # 1. Generate & Process Data
    raw_data = processor.generate_synthetic_data()
    X_train, X_test, y_train, y_test = processor.prepare_data(raw_data)
    
    # 2. Train and Validate Engine
    print("Training real-time transaction risk scoring engine...")
    detector.train(X_train, y_train)
    detector.evaluate(X_test, y_test)
    
    # 3. Simulate Live Streaming Transactions
    print("--- Simulating Real-Time Risk Assessment ---")
    
    # Format: [Amount, TimeOfDay, Velocity, LocationMismatch]
    sample_legit_tx = np.array([[35.50, 14.5, 1, 0]]) 
    sample_fraud_tx = np.array([[450.00, 3.2, 6, 1]])
    
    for tx_type, tx in [("Standard Transaction", sample_legit_tx), ("High-Risk Transaction", sample_fraud_tx)]:
        scaled_tx = processor.scaler.transform(tx)
        score, verdict = detector.assess_risk(scaled_tx)
        print(f"\nEvaluating incoming {tx_type}:")
        print(f"Raw Input: Amount=${tx[0][0]}, Velocity={tx[0][2]} tx/hr, Location Mismatch={tx[0][3]}")
        print(f"Risk Score: {score}/100 -> Action: {verdict}")

if __name__ == "__main__":
    main()
