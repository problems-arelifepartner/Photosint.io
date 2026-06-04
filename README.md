# SecurePay-Shield
Project 

# SecurePay Shield: Real-Time Fraud Detection & Transaction Risk System

SecurePay Shield is an intelligent, real-time transaction risk scoring system engineered to detect fraudulent credit card activities. Using machine learning architectures specialized for extreme class imbalance, the system generates actionable risk metrics to approve, flag, or decline transactions dynamically.

## Features
- **Real-Time Risk Scoring**: Outputs a definitive transaction risk index (0–100).
- **Imbalance Mitigation**: Leverages Ensemble Learning (`BalancedRandomForestClassifier`) to counter sparse fraud distributions without over-biasing.
- **Dynamic Decision Pipeline**: Automatically categorizes transactions into Low, Medium (MFA required), or High risk tiers.

---

## Getting Started (Anaconda Setup)

Follow these instructions to run the framework natively within an Anaconda environment.

### Prerequisites
Make sure you have [Anaconda](https://www.anaconda.com/download) or [Miniconda](https://docs.conda.io/en/latest/miniconda.html) installed.

### 1. Clone the Repository
```bash
git clone [https://github.com/YOUR_USERNAME/SecurePay-Shield.git](https://github.com/YOUR_USERNAME/SecurePay-Shield.git)
cd SecurePay-Shield
