import numpy as np
import librosa
# hàm trích xuất đặc trưng MFCC
def extract_mfcc(y, sr, n_mfcc=13):
    mffc = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=n_mfcc)
    return np.mean(mffc, axis=1)