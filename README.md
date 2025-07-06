# Mô tả chương trình
Chương trình phát hiện tiếng vỗ tay bằng mô hình MLP với đầu vào là âm thanh cần dự đoán xem thuộc loại âm thanh "Vỗ tay" hay "Còn lại". Hiện trang web chỉ mới triển khai trên localhost, người dùng cần ghi âm một đoạn âm thanh và nhấn gửi đoạn âm thanh đó về máy chủ bằng Flask. Sau đó, đoạn âm thanh sẽ được tiền xử lý mfcc và đưa vào mô hình để đưa ra dự đoán và trả về kết quả cho người dùng.

# cách chạy chương trình

## Bước 1. Chạy môi trường ảo venv (nếu trước đường dẫn có (venv) thì có thể bỏ qua)
- Mở Command Promt trong dự án và nhập lệnh để kích hoạt môi trường:

```
venv\Scripts\activate
```


## Bước 2. nhập lệnh sau để chuyển hướng vào thư mục backend

```
cd backend
```

## Bước 3. Huấn luyện mô hình (nếu trong thư mục model có file mlp_model.h5 thì có thể bỏ qua bước này)
- Nhập câu lệnh để chạy file huấn luyện train_model.py

```
python model/train_model.py
```

## Bước 4. Chạy file app.py để kết nối giữa frontend và backend bằng Flask

```
python app.py
```

## Bước 5. Dự đoán âm thanh có là tiếng vỗ tay
- Mở file index.html trong thư mục frontend và chạy lên trình duyệt 
