# Fixed Issues Log

Danh sách các lỗi đã gặp trong quá trình tích hợp và test local.

## 1) `Couldn't find the node_modules state file`

- Nguyên nhân: chưa install dependencies ở workspace root.
- Fix: chạy `yarn install` ở root repo.

## 2) `caddy` không tìm thấy

- Nguyên nhân: môi trường local không có binary `caddy` trong PATH.
- Fix:
  - Cài Caddy bằng Homebrew.
  - Cập nhật script trong `dev-reverse-proxy/package.json` để ưu tiên `/opt/homebrew/bin/caddy run`.

## 3) Login lỗi do URL mismatch (`localhost` vs `127.0.0.1`)

- Hiện tượng: "You can't open this page using this URL..."
- Nguyên nhân: `HD_BASE_URL` khác URL truy cập thực tế.
- Fix: chuẩn hóa chạy qua `http://localhost:8080`, đồng bộ `HD_BASE_URL` và `HD_RENDERER_BASE_URL`.

## 4) Proxy route private API trả 404

- Nguyên nhân: matcher trong `dev-reverse-proxy/Caddyfile` chưa cover đúng prefix path nested.
- Fix: đổi matcher sang dạng prefix cho backend routes (`/api*`, `/realtime*`, `/public*`, `/uploads*`, `/media*`).

## 5) EADDRINUSE (3000/3001/8080)

- Nguyên nhân: process cũ hoặc app khác (outline) chiếm port.
- Fix: kill process conflict, đảm bảo chỉ chạy một instance HedgeDoc dev stack.

## 6) Rate limit auth khi test nhiều lần

- Hiện tượng: `Rate limit exceeded...`
- Fix local: đặt `HD_SECURITY_RATE_LIMIT_AUTH_MAX=0` trong `.env` để không block test login/register.

## 7) Tiêu đề note không cập nhật theo H1 ngay trên Explore

- Nguyên nhân:
  - persist realtime note chậm khi rời editor,
  - explore list không refetch khi quay lại tab.
- Fix:
  - giảm thời gian destroy không client trong `realtime-note` để save sớm hơn,
  - thêm refetch khi `visibilitychange` trên explore notes list.

