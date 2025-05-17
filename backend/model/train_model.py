import os
import librosa
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Dense, Dropout
from tensorflow.keras.callbacks import EarlyStopping
import soundfile as sf
import sys
from joblib import dump
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from preprocessing.extract_features import extract_mfcc  

# Đường dẫn tuyệt đối tới thư mục Project gốc
PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
BASE_DIR = os.path.dirname(__file__)
DATA_DIR = os.path.join(PROJECT_ROOT, 'data')
CLAP_DIR = os.path.join(DATA_DIR, 'clap')
NON_CLAP_DIR = os.path.join(DATA_DIR, 'noise')

def load_data():
    X, y = [], []

    for folder, label in [(CLAP_DIR, 1), (NON_CLAP_DIR, 0)]:
        for file in os.listdir(folder):
            if file.endswith('.wav'):
                path = os.path.join(folder, file)
                try:
                    y_audio, sr = librosa.load(path, sr=22050)
                    features = extract_mfcc(y_audio, sr)
                    X.append(features)
                    y.append(label)
                except Exception as e:
                    print(f"[!] Bỏ qua {file}: {e}")

    return np.array(X), np.array(y)

# xây dựng mô hình MLP
def build_model(input_dim):
    model = Sequential([
        Dense(64, activation='relu', input_shape=(input_dim,)),
        Dropout(0.2),
        Dense(32, activation='relu'),
        Dropout(0.2),
        Dense(1, activation='sigmoid')
    ])
    model.compile(optimizer='adam', loss='binary_crossentropy', metrics=['accuracy'])
    return model

def train_model():
    X, y = load_data()

    scaler = StandardScaler()
    X = scaler.fit_transform(X) 

    # Chia dữ liệu thành tập huấn luyện và tập kiểm tra
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    model = build_model(X_train.shape[1])

    # dùng EarlyStopping để ngăn chặn overfitting sau 5 epochs không cải thiện
    early_stopping = EarlyStopping(monitor='val_loss', patience=5, restore_best_weights=True)

    # Huấn luyện mô hình
    model.fit(
        X_train, y_train,
        validation_data=(X_test, y_test),
        epochs=30, 
        batch_size=8,
        callbacks=[early_stopping]
    )

    # lưu mô hình
    MODEL_PATH = os.path.join(BASE_DIR, 'mlp_model.h5')
    model.save(MODEL_PATH)
    # lưu scaler
    SCALER_PATH = os.path.join(BASE_DIR, 'scaler.pkl')
    dump(scaler,SCALER_PATH)
    print(f"Đã lưu mô hình tại {MODEL_PATH}")
    print(f"Đã lưu scaler tại {SCALER_PATH}")

if __name__ == "__main__":
    train_model()
    print("Huấn luyện mô hình đã xong.")