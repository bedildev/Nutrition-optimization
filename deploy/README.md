# Workspace Deploy

Folder ini menggabungkan frontend, backend, dan API untuk pengujian end-to-end secara lokal sebelum deployment.

## Menjalankan Lokal (semua service)
1. Instal tool dev di root:
   - npm install
2. Instal dependensi tiap aplikasi:
   - cd frontend && npm install
   - cd ../backend && npm install
3. Instal dependensi Python:
   - cd ../model
   - python -m pip install -r requirements.txt
4. Jalankan semua service dari root deploy:
   - npm run dev

## Endpoint Service (default)
- Frontend (Vite): http://localhost:5173
- Backend (Express): http://localhost:4000
- FastAPI: http://localhost:8000

## Environment
- Gunakan satu file di root: salin .env.example menjadi .env dan isi nilainya.

## Catatan Vercel
- Frontend dibangun dari deploy/frontend dan disajikan sebagai static output.
- Serverless API ada di deploy/api (Node) dan meneruskan request ke service FastAPI.
- Host FastAPI (deploy/model) secara terpisah, lalu set FASTAPI_BASE_URL di environment Vercel.
- Dokumentasi Swagger tersedia di /api/docs dan /api/openapi.json.
