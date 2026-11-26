# Sổ chi tiêu cá nhân

Bài tập xây dựng cùng một ứng dụng React theo hai cách:

- `part-a-class`: Class Component, dữ liệu mẫu nằm trong mã nguồn.
- `part-b-hooks`: Function Component + Hooks, dữ liệu được đọc/thêm/xóa qua MockAPI.

## Thông tin sinh viên

- Họ và tên: Trần Thế Phong
- Mã sinh viên: B25DCTV060

## Cách chạy

Yêu cầu Node.js 20.19+ hoặc 22.12+.

```bash
npm install
npm run dev:a
```

Mở terminal khác để chạy Phần B:

```bash
npm run dev:b
```

Kiểm tra cả hai bản build:

```bash
npm run build
```

Nếu dùng pnpm, chạy `pnpm install --frozen-lockfile` ở thư mục gốc. Dùng
`pnpm --filter part-a-class run dev` hoặc `pnpm --filter part-b-hooks run dev`
để mở từng bản và `pnpm --recursive run build` để build cả hai.

## Cấu hình MockAPI cho Phần B

1. Tạo project trên MockAPI và resource tên `expenses`.
2. Mở Phần B và dán URL HTTPS đầy đủ của resource vào mục **Kết nối MockAPI**, ví dụ `https://YOUR_PROJECT_ID.mockapi.io/api/v1/expenses`. Giữ nguyên tiền tố đường dẫn do MockAPI hiển thị.
3. Chọn **Lưu và kết nối**. URL được lưu trên trình duyệt. Để dùng resource khác, dán URL mới rồi lưu lại, hoặc chọn **Ngắt kết nối**.

Các trường của resource: `content` (string), `amount` (number), `category` (string), `date` (string).

Tùy chọn: dùng `VITE_API_URL` trong `part-b-hooks/.env` làm giá trị mặc định khi trình duyệt chưa có cấu hình. Git bỏ qua file `.env`. Resource cho phép thêm và xóa, nên chỉ dùng dữ liệu minh họa.

## Hooks đã khắc phục thách thức của Class như thế nào?

- `useState` tách state theo mục đích, không phải gom tất cả vào `this.state` và không cần `this.setState`.
- `useEffect` đặt phần khởi tạo và dọn dẹp đồng hồ/fetch dữ liệu cạnh nhau, thay cho nhiều lifecycle method.
- `useClock`, `useFetch`, `useDebounce` tái sử dụng logic có state mà không cần Higher-Order Component hay render props.
- `useRef` focus ô nội dung trực tiếp sau khi thêm thành công.
- `useContext` chia sẻ chế độ sáng/tối mà không phải truyền props qua nhiều cấp.

## Yêu cầu nâng cao

- Phần B dùng `useClock` để cập nhật đồng hồ mỗi giây và dọn bộ đếm khi ẩn đồng hồ.
- Cả hai phần thống kê tổng chi theo từng loại trên toàn bộ dữ liệu. Dòng **Tổng đang hiển thị** chỉ tính các khoản khớp với bộ lọc và từ khóa.
- Cả hai phần tìm theo nội dung với độ trễ 400 ms. Phần A dọn `setTimeout` bằng lifecycle của Class, Phần B dùng `useDebounce`.

