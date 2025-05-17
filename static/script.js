// let mediaRecorder;
// let audioChunks = [];
// let audioBlob = null;

// const recordBtn = document.getElementById('recordBtn');
// const stopBtn = document.getElementById('stopBtn');
// const sendBtn = document.getElementById('sendBtn');
// const status = document.getElementById('status');
// const result = document.getElementById('result');
// const audioPreview = document.getElementById('audioPreview');

// recordBtn.onclick = async () => {
//     const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
//     mediaRecorder = new MediaRecorder(stream);
//     audioChunks = [];

//     mediaRecorder.ondataavailable = e => audioChunks.push(e.data);

//     mediaRecorder.onstop = () => {
//         audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
//         const audioURL = URL.createObjectURL(audioBlob);
//         audioPreview.src = audioURL;
//         audioPreview.style.display = 'block';
//         sendBtn.disabled = false;
//         status.textContent = "⏹️ Đã dừng ghi âm. Kiểm tra âm thanh trước khi gửi.";
//     };

//     mediaRecorder.start();
//     status.textContent = "🔴 Đang ghi âm...";
//     recordBtn.disabled = true;
//     stopBtn.disabled = false;
//     sendBtn.disabled = true;
//     audioPreview.style.display = 'none';
//     result.textContent = "";
// };

// stopBtn.onclick = () => {
//     mediaRecorder.stop();
//     recordBtn.disabled = false;
//     stopBtn.disabled = true;
// };

// sendBtn.onclick = async () => {
//     if (!audioBlob) return;

//     const formData = new FormData();
//     formData.append('audio', audioBlob, 'recorded.webm');

//     status.textContent = "📤 Đang gửi...";
//     try {
//         const res = await fetch('http://127.0.0.1:5000/predict', {
//             method: 'POST',
//             body: formData
//         });

//         const data = await res.json();
//         result.textContent = "🎧 Kết quả: " + data.result;
//         status.textContent = "✅ Hoàn tất!";
//     } catch (err) {
//         result.textContent = "❌ Lỗi gửi file.";
//         status.textContent = "⚠️ Thử lại sau.";
//     }
// };


let audioChunks = [];
let audioContext;
let processor;
let input;
let wavBlob = null;

const recordBtn = document.getElementById('recordBtn');
const stopBtn = document.getElementById('stopBtn');
const sendBtn = document.getElementById('sendBtn');
// const fileInput = document.getElementById('fileInput');
const status = document.getElementById('status');
const result = document.getElementById('result');
const audioPreview = document.getElementById('audioPreview');
const clapImage = document.getElementById('clapImage');
const noiseImage = document.getElementById('noiseImage');


recordBtn.onclick = async () => {
    try{
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        input = audioContext.createMediaStreamSource(stream);
        processor = audioContext.createScriptProcessor(4096, 1, 1);

        audioChunks = [];

        processor.onaudioprocess = (e) => {
            const channelData = e.inputBuffer.getChannelData(0);
            audioChunks.push(new Float32Array(channelData));
        };

        input.connect(processor);
        processor.connect(audioContext.destination);

        recordBtn.disabled = true;
        stopBtn.disabled = false;
        sendBtn.disabled = true;
        status.textContent = "🔴 Đang ghi âm...";
        audioPreview.style.display = 'none';
        result.textContent = "";
    }
    catch (err) {
        console.error("Error accessing microphone: ", err);
        status.textContent = "❌ Lỗi truy cập microphone.";
        recordBtn.disabled = false;
        stopBtn.disabled = true;
        sendBtn.disabled = true;
        return;
    }   
    
};

stopBtn.onclick = () => {
    processor.disconnect();
    input.disconnect();
    audioContext.close();
    wavBlob = exportWAV(audioChunks, audioContext.sampleRate); 
    const audioURL = URL.createObjectURL(wavBlob);
    audioPreview.src = audioURL;
    audioPreview.style.display = 'block';

    recordBtn.disabled = false;
    stopBtn.disabled = true;
    sendBtn.disabled = false;
    status.textContent = "👍Đã dừng ghi âm. Nghe lại trước khi gửi!👍";
};

// fileInput.onchange = (e) => {
//     const file = e.target.files[0];
//     if (file) {
//         const audioURL = URL.createObjectURL(file);
//         audioPreview.src = audioURL;
//         audioPreview.style.display = 'block';
//         wavBlob = file; // Set the wavBlob to the selected file
//         sendBtn.disabled = false;
//         status.textContent = "📂 Đã chọn file. Nhấn gửi để xử lý.";
//     } else {
//         audioPreview.style.display = 'none';
//         sendBtn.disabled = true;
//     }
// }

clapImage.style.display = 'none';
noiseImage.style.display = 'none';

sendBtn.onclick = async () => {
    if (!wavBlob) return;

    const formData = new FormData();
    formData.append('audio', wavBlob, 'recorded.wav');

    status.textContent = "📤 Đang gửi...";
    try {
        const res = await fetch('http://127.0.0.1:5000/predict', {
            method: 'POST',
            body: formData
        });

        const data = await res.json();
        const label = data.result.split(':')[0].trim();
        if (label ===  "Clap") {
            clapImage.style.display = 'block';
            noiseImage.style.display = 'none';
        }
        else if (label === "Noise") {
            clapImage.style.display = 'none';
            noiseImage.style.display = 'block';
        }
        
        result.textContent = "🎧 Kết quả: " + data.result;
        status.textContent = "✅ Hoàn tất!";
    
    } catch (err) {
        result.textContent = "❌ Lỗi gửi file.";
        status.textContent = "⚠️ Thử lại sau.";
    }
};

// ======== WAV Export Helpers ========

function mergeBuffers(buffers) {
    let length = buffers.reduce((sum, b) => sum + b.length, 0);
    let result = new Float32Array(length);
    let offset = 0;
    for (let b of buffers) {
        result.set(b, offset);
        offset += b.length;
    }
    return result;
}

function floatTo16BitPCM(output, offset, input) {
    for (let i = 0; i < input.length; i++, offset += 2) {
        let s = Math.max(-1, Math.min(1, input[i]));
        output.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
    }
}

function writeString(view, offset, string) {
    for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
    }
}

function encodeWAV(samples, sampleRate) {
    const buffer = new ArrayBuffer(44 + samples.length * 2);
    const view = new DataView(buffer);

    writeString(view, 0, 'RIFF');
    view.setUint32(4, 36 + samples.length * 2, true);
    writeString(view, 8, 'WAVE');
    writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true); // PCM
    view.setUint16(22, 1, true); // Mono
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    writeString(view, 36, 'data');
    view.setUint32(40, samples.length * 2, true);

    floatTo16BitPCM(view, 44, samples);

    return view;
}

function exportWAV(buffers, sampleRate) {
    const merged = mergeBuffers(buffers);
    const encoded = encodeWAV(merged, sampleRate);
    return new Blob([encoded], { type: 'audio/wav' });
}
