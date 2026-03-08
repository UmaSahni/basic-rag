# Question AI - API Documentation

This document contains all the APIs available in the backend along with the required parameters, request bodies, and cURL commands for frontend integration.

## Base URL
Assuming the server is running locally on port `3000`. Adjust it if you are deploying to a different domain.
**URL:** `http://localhost:3000`

---

## 1. Authentication

### Register a User
Create a new user in the system.
- **Endpoint:** `/api/register`
- **Method:** `POST`
- **Headers:** `Content-Type: application/json`
- **Body:**
  ```json
  {
    "name": "Jane Doe",
    "email": "jane@example.com",
    "password": "strongPassword123"
  }
  ```
- **Responses:**
  - `201 Created`: `{ "message": "User created successfully", "user": { ... } }`
  - `400 Bad Request`: `{ "message": "User already exists" }`

**cURL Example:**
```bash
curl -X POST http://localhost:3000/api/register \
-H "Content-Type: application/json" \
-d '{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "strongPassword123"
}'
```

### Login a User
Authenticate an existing user to get a JWT token.
- **Endpoint:** `/api/login`
- **Method:** `POST`
- **Headers:** `Content-Type: application/json`
- **Body:**
  ```json
  {
    "email": "jane@example.com",
    "password": "strongPassword123"
  }
  ```
- **Responses:**
  - `200 OK`: `{ "message": "Login successful", "token": "JWT_TOKEN_HERE" }`
  - `401 Unauthorized`: `{ "message": "Invalid email or password" }`

**cURL Example:**
```bash
curl -X POST http://localhost:3000/api/login \
-H "Content-Type: application/json" \
-d '{
  "email": "jane@example.com",
  "password": "strongPassword123"
}'
```

---

## 2. File Operations (Requires Authentication)
> **Note:** For all the endpoints below, you will need to add an `Authorization` header containing the JWT token you received from login:
> `Authorization: Bearer <YOUR_JWT_TOKEN>`

### Upload PDF to Indexing Vector DB
Uploads a `.pdf` file, saves it to the database, and kicks off asynchronous indexing.
- **Endpoint:** `/api/upload`
- **Method:** `POST`
- **Headers:** `Authorization: Bearer <TOKEN>`
- **Body:** `multipart/form-data` containing a `pdf` file field.
- **Responses:**
  - `200 OK`: `{ "message": "Document scheduled for indexing", "file": { ... } }`

**cURL Example:**
```bash
curl -X POST http://localhost:3000/api/upload \
-H "Authorization: Bearer YOUR_JWT_TOKEN_HERE" \
-F "pdf=@/path/to/your/file.pdf"
```

### Get File Info
Retrieves file metadata from MongoDB using the file's ID.
- **Endpoint:** `/api/get/:id`
- **Method:** `GET`
- **Headers:** `Authorization: Bearer <TOKEN>`
- **URL Parameters:** `id` -> MongoDB `_id` of the file (e.g. `65bfda...`)
- **Responses:**
  - `200 OK`: `{ "file": { "_id": "...", "filename": "...", ... } }`
  - `404 Not Found`: `{ "message": "File not found" }`

**cURL Example:**
```bash
curl -X GET http://localhost:3000/api/get/FILE_ID_HERE \
-H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
```

### Delete File
Deletes the file metadata from MongoDB using its ID.
- **Endpoint:** `/api/delete/:id`
- **Method:** `DELETE`
- **Headers:** `Authorization: Bearer <TOKEN>`
- **URL Parameters:** `id` -> MongoDB `_id` of the file
- **Responses:**
  - `200 OK`: `{ "message": "File deleted successfully" }`
  - `404 Not Found`: `{ "message": "File not found" }`

**cURL Example:**
```bash
curl -X DELETE http://localhost:3000/api/delete/FILE_ID_HERE \
-H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
```

---

## 3. Question / AI Answering

### Ask a Question
Sends a question to the AI model connected to the RAG backend which returns an answer based on indexed documents.
- **Endpoint:** `/ask`  *(Note: This route is at the root level, not under `/api`)*
- **Method:** `POST`
- **Headers:** `Content-Type: application/json`
- **Body:**
  ```json
  {
    "question": "What is the summary of the inserted document?"
  }
  ```
- **Responses:**
  - `200 OK`: `{ "answer": "The AI response will be here based on the index..." }`

**cURL Example:**
```bash
curl -X POST http://localhost:3000/ask \
-H "Content-Type: application/json" \
-d '{
  "question": "What is the summary of the inserted document?"
}'
```

---

## 4. General / Health Check

### Health Verification
- **Endpoint:** `/`
- **Method:** `GET`
- **Responses:**
  - `200 OK`: `Welcome to the Question AI API` (Plain Text)

**cURL Example:**
```bash
curl -X GET http://localhost:3000/
```
