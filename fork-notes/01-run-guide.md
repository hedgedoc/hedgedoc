# Run Guide (Local Dev)

## Yêu cầu

- Node.js >= 22
- Yarn (workspace mode)
- Caddy

## Các bước chạy

1. Cài dependencies ở root:

   ```bash
   yarn install
   ```

2. Tạo/cập nhật `.env` ở root với cấu hình local:

   ```env
   HD_BASE_URL=http://localhost:8080
   HD_RENDERER_BASE_URL=http://localhost:8080
   HD_INTERNAL_API_URL=http://127.0.0.1:3000
   HD_BACKEND_PORT=3000
   HD_AUTH_SESSION_SECRET=local-dev-session-secret-change-me
   HD_AUTH_LOCAL_ENABLE_LOGIN=true
   HD_AUTH_LOCAL_ENABLE_REGISTER=true
   HD_DATABASE_TYPE=sqlite
   HD_DATABASE_NAME=./hedgedoc.sqlite
   HD_MEDIA_BACKEND_TYPE=filesystem
   HD_MEDIA_BACKEND_FILESYSTEM_UPLOAD_PATH=uploads/
   HD_NOTE_PERMISSIONS_MAX_GUEST_LEVEL=read
   HD_NOTE_PERMISSIONS_DEFAULT_EVERYONE=read
   HD_SECURITY_RATE_LIMIT_AUTH_MAX=0
   ```

3. Chạy dev mode:

   ```bash
   yarn start:dev
   ```

4. Truy cập:

   - `http://localhost:8080` (không dùng `127.0.0.1:8080` cho URL mở trên browser)

## Lưu ý vận hành

- Trước khi chạy lại stack, tránh để nhiều instance `yarn start:dev` cùng lúc.
- Nếu lỗi port đã dùng, dọn các process đang chiếm `3000`, `3001`, `8080`.
- Không chạy local bằng `yarn start` khi đang dev tính năng; dùng `yarn start:dev`.

