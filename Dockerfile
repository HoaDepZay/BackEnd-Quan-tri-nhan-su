# Sử dụng Node.js bản nhẹ
FROM node:18-alpine

# Tạo thư mục làm việc trong container
WORKDIR /app

# Copy file package.json vào trước để cài thư viện (tận dụng cache)
COPY package*.json ./
RUN npm install

# Copy toàn bộ code còn lại vào
COPY . .

# Mở port (Ví dụ server Node của bạn chạy port 3000)
EXPOSE 5000

# Lệnh chạy server
CMD ["npm", "start"]