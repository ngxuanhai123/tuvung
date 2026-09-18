# Hướng Dẫn Cấu Hình Bảo Mật Firebase Console (Dành cho Admin)

### 1. Cấu hình Firestore Database Rules:
1. Mở [Firebase Console](https://console.firebase.google.com/) > Chọn project `tuvung-88e8d`.
2. Vào mục **Build** > **Firestore Database** > Chọn tab **Rules**.
3. Sao chép nội dung trong file `firestore.rules` và dán đè vào khung soạn thảo.
4. Bấm **Publish** (Xuất bản).

### 2. Cấu hình Realtime Database Rules:
1. Vào mục **Build** > **Realtime Database** > Chọn tab **Rules**.
2. Sao chép nội dung trong file `database.rules.json` và dán đè vào khung soạn thảo.
3. Bấm **Publish** (Xuất bản).

### 3. Bật App Check chống spam bot (Khuyến nghị):
1. Vào mục **App Check** trên menu bên trái.
2. Đăng ký Web App với **reCAPTCHA v3**.
3. Áp dụng cho Firestore Database để chặn 99% các cuộc tấn công DDoS/bot tự động.
