from flask import Flask, jsonify, request, render_template
from api.predict import predict_clap
from flask_cors import CORS

app = Flask(__name__)
CORS(app)
@app.route('/')

def index():
    return render_template('index.html')

@app.route('/predict', methods=['POST'])

def predict():
    if 'audio' not in request.files:
        return jsonify({'error': 'Không tìm thấy file âm thanh!'}), 400

    file = request.files['audio']
    if file.filename == '':
        return jsonify({'error': 'Chưa có file nào được chọn!'}), 400
    
    result = predict_clap(file)
    return jsonify({'result': result})

if __name__ == '__main__':
    app.run(debug=True)