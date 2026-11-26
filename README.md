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
2. Tạo file `part-b-hooks/.env` từ `part-b-hooks/.env.example`.
3. Sao chép URL đầy đủ của resource `expenses` từ MockAPI. Giữ nguyên tiền tố đường dẫn nếu project có thiết lập tiền tố.

```env
VITE_API_URL=https://YOUR_PROJECT_ID.mockapi.io/api/v1/expenses
```

Các trường của resource: `content` (string), `amount` (number), `category` (string), `date` (string).

File `.env` được Git bỏ qua. Vì `VITE_API_URL` xuất hiện trong mã chạy phía trình duyệt và resource cho phép thêm/xóa, hãy dùng MockAPI với dữ liệu minh họa. Khi chưa cấu hình URL, Phần B hiển thị hướng dẫn cấu hình.

## Hooks đã khắc phục thách thức của Class như thế nào?

- `useState` tách state theo mục đích, không phải gom tất cả vào `this.state` và không cần `this.setState`.
- `useEffect` đặt phần khởi tạo và dọn dẹp đồng hồ/fetch dữ liệu cạnh nhau, thay cho nhiều lifecycle method.
- `useClock`, `useFetch`, `useDebounce` tái sử dụng logic có state mà không cần Higher-Order Component hay render props.
- `useRef` focus ô nội dung trực tiếp sau khi thêm thành công.
- `useContext` chia sẻ chế độ sáng/tối mà không phải truyền props qua nhiều cấp.

