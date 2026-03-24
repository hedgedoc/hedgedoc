# Folder Feature Contributions

Tổng hợp các phần đã thêm/cải thiện cho tính năng tổ chức note theo folder.

## Backend

- Thêm migration tạo bảng folder và quan hệ note-folder.
- Thêm `FolderService` + module cho CRUD folder, move note vào/ra folder.
- Thêm private API cho folders:
  - create/get/update/delete folder,
  - move note theo alias vào folder.
- Tăng kiểm tra ownership cho các endpoint folder (tránh IDOR).
- Bổ sung filter `folderId` cho explore/my ở controller + service.
- Đảm bảo các insert note có `folderId` hợp lệ theo schema mới.

## Commons / Database Types

- Thêm DTO/schema cho folder:
  - create/update/folder dto.
- Cập nhật DTO/type note metadata để có `folderId`.
- Cập nhật types phía `database` package cho `folder` và `note`.

## Frontend

- Thêm API client cho folders.
- Thêm UI `FolderSidebar` để:
  - duyệt root/subfolder,
  - tạo/rename/delete folder,
  - breadcrumb theo path folder hiện tại.
- Thêm menu move note vào folder ở từng note entry.
- Explore notes list:
  - gửi `folderId` lên server để filter đúng theo folder,
  - bỏ filter client-side cũ,
  - refetch đúng khi đổi folder/filter.
- Hiển thị `folder path` dưới title note khi note nằm trong folder.
- Tạo note trong `My notes` khi đang đứng trong folder:
  - tự gán note mới vào folder đang chọn (không cần move thủ công).
- Chặn duplicate khi tạo folder con do submit/click lặp.

## Chất lượng và vận hành

- Build/test loop đã xử lý các lỗi runtime chính để stack local chạy ổn định.
- Cập nhật cấu hình local để đăng nhập và realtime hoạt động nhất quán trong môi trường dev.

