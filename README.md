# FS0226IT---U5W2D3 — Archivio documenti con OCR

Full-stack application to scan documents (file upload or webcam), extract their text with OCR (Tesseract), correct the text by hand, and archive each document together with its original file, corrected text, title and processing status.

## Stack

- **Backend:** Spring Boot 3.5.5, Spring Web, Spring Data JPA / Hibernate, PostgreSQL, Bean Validation, Lombok, Tess4J (Tesseract OCR).
- **Frontend:** React 19 + Vite, JavaScript, ESLint, React Router.

## Project structure

```
FS0226IT---U5W2D3/
├── BE/   Spring Boot backend
└── FE/   React + Vite frontend
```

## Backend

### Requirements

- JDK 21+ (built and run on JDK 25).
- PostgreSQL running locally.
- Tesseract OCR engine installed, with the `tessdata` language files.

### Database

Create the database (name used by the app: `U5W1D3`):

```sql
CREATE DATABASE "U5W1D3";
```

Update credentials in `BE/src/main/resources/application.properties`
(`spring.datasource.username` / `spring.datasource.password`) to match your local PostgreSQL.

### Tesseract data

The `tessdata` folder is **not** committed (large binary language files).
Point `ocr.tessdata-path` in `application.properties` to a folder containing the
`*.traineddata` files, or create `BE/tessdata/` with at least:

- `eng.traineddata`
- `ita.traineddata`
- `osd.traineddata`

Language files: https://github.com/tesseract-ocr/tessdata

### Run

```bash
cd BE
mvn spring-boot:run
```

Backend starts on `http://localhost:8080`.

### REST API (`/api/document`)

| Method | Path            | Description                                             |
|--------|-----------------|---------------------------------------------------------|
| GET    | `/all`          | List all archived documents                             |
| GET    | `/{id}`         | Single document (metadata + text)                       |
| GET    | `/{id}/file`    | Serve the original file (inline)                        |
| POST   | `/scan`         | OCR only — returns extracted text, no save              |
| POST   | `/`             | Archive a document (file + title + corrected text + status) |
| PUT    | `/{id}`         | Update corrected text + status                          |

Processing status: `DA_CORREGGERE`, `SALVATO`, `OCR_FALLITO`.

## Frontend

### Run

```bash
cd FE
npm install
npm run dev
```

Frontend starts on `http://localhost:5173`.

API base URL is configured in `FE/.env` (`VITE_API_URL`).

### Features

- Upload a document (image or PDF) **or** capture it from the **webcam**.
- Run OCR and edit the extracted text in an editable textarea before saving.
- Archive list; reopen any document to see the original file and its text side by side.
- Reopen and correct the text again, then save.

## Notes

- Webcam capture uses `getUserMedia`, which requires a secure context.
  `localhost` counts as secure; over the LAN it needs HTTPS.
- OCR supports PNG, JPEG, TIFF, BMP, GIF and PDF (via Tess4J / PDFBox).
