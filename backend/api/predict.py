import librosa
import numpy as np
from tensorflow.keras.models import load_model
from sklearn.preprocessing import StandardScaler
import soundfile as sf
import sys
import os
import joblib
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from preprocessing.extract_features import extract_mfcc

# MODEL_PATH = os.path.join(os.path.dirname(__file__), '..', 'model', 'mlp_model.h5')
# model = load_model(MODEL_PATH)
model = load_model('model/mlp_model.h5')
scaler = joblib.load('model/scaler.pkl')

# hàm kiểm tra âm thanh có tiếng không (im lặng)
def is_silent(y, threshold=0.0005):
    rms = librosa.feature.rms(y=y).mean()
    return rms < threshold

def predict_clap(audio_file):
    try:
        y, sr = librosa.load(audio_file, sr=22050)
        if(is_silent(y)):
            return "File quá im lặng, không có âm thanh rõ ràng"
        else:
            features = extract_mfcc(y, sr=sr) 
            features = features.reshape(1, -1)
            mfcc_scaler = scaler.transform(features)
            prediction = model.predict(mfcc_scaler)[0][0]
            return f"Clap: {prediction:.4f}" if prediction > 0.5 else f"Noise: {prediction:.4f}"

    except Exception as e:
        print(f"Lỗi xử lý file: {e}")
        return "Lỗi xử lý âm thanh"
