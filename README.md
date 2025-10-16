# Transcribe me Daddy! 🥴

A real-time audio transcription application powered by OpenAI's Whisper model, featuring a modern React frontend and FastAPI backend with Server-Sent Events (SSE) streaming.

## 🚀 Features

- **Real-time Transcription**: Upload audio files and watch the transcription stream in real-time
- **Whisper Large Model**: Utilizes OpenAI's Whisper-large model for accurate transcription
- **Hardware Acceleration**: Supports Apple Silicon (MPS) and CUDA for faster processing
- **Chunk-based Processing**: Processes audio in overlapping chunks for continuous transcription
- **System Information**: Displays detailed hardware specs (CPU, GPU, RAM)
- **Modern UI**: Built with React, TypeScript, and Tailwind CSS

## 📋 Prerequisites

- **Python**: 3.9 or higher
- **Node.js**: 18.x or higher
- **npm**: 9.x or higher

## 🛠️ Installation

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd whisper-test
```

### 2. Backend Setup (Python/FastAPI)

#### Install Python Dependencies

```bash
pip install -r requirements.txt
```

This will install all required packages including:

- FastAPI & Uvicorn (API server)
- PyTorch (ML framework)
- Transformers & Whisper (transcription models)
- Librosa (audio processing)
- And other dependencies

#### Model Download

On first run, the Whisper-large model (~6GB) will be automatically downloaded to the `./models` directory. This may take a few minutes depending on your internet connection.

### 3. Frontend Setup (React/TypeScript)

#### Install Node Dependencies

```bash
npm install
```

#### Configure Environment Variables

Create a `.env` file in the project root:

```bash
cp .env.example .env
```

The default configuration should work for local development:

```env
VITE_API_URL=http://localhost:8000
```

## 🚀 Running the Application

You need to run both the backend and frontend simultaneously in separate terminal windows.

### Terminal 1: Start Backend Server

```bash
uvicorn main:app --reload
```

The backend will be accessible at: **http://localhost:8000**

**Expected Output:**

```
INFO:     Will watch for changes in these directories: ['/path/to/whisper-test']
INFO:     Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)
INFO:     Started reloader process using StatReload
Using device: mps
INFO:     Started server process
INFO:     Waiting for application startup.
INFO:     Application startup complete.
```

### Terminal 2: Start Frontend Development Server

```bash
npm run dev
```

The frontend will be accessible at: **http://localhost:5173** (or the next available port)

**Note:** Vite typically runs on port 5173, not 3000. The CORS settings in the backend allow `localhost:3000` but you may need to update this if Vite uses a different port.

**Expected Output:**

```
VITE v7.x.x  ready in xxx ms

➜  Local:   http://localhost:3000/
➜  Network: use --host to expose
```

## 💻 Usage

1. Open your browser and navigate to the frontend URL (e.g., `http://localhost:3000`)
2. Click on the **"Upload Audio"** card or drag and drop an audio file
3. Supported formats: MP3, WAV, M4A, FLAC, OGG, etc.
4. Watch as the transcription streams in real-time!
5. View your system information in the **"System Info"** card

## 🏗️ Project Structure

```
whisper-test/
├── main.py                 # FastAPI backend server
├── requirements.txt        # Python dependencies
├── package.json           # Node.js dependencies
├── vite.config.ts         # Vite configuration
├── tsconfig.json          # TypeScript configuration
├── src/
│   ├── App.tsx            # Main React component
│   ├── components/        # React components
│   │   ├── AudioUploadCard.tsx
│   │   ├── TranscriptCard.tsx
│   │   ├── SystemInfoCard.tsx
│   │   └── ui/            # Shadcn UI components
│   ├── hooks/             # Custom React hooks
│   ├── lib/               # Utilities and axios config
│   └── types/             # TypeScript type definitions
├── cache/                 # Temporary audio file storage
└── models/                # Whisper model cache
```

## 🔧 Configuration

### Backend (main.py)

- **Device**: Automatically detects and uses MPS (Apple Silicon) or CPU
- **Model**: `openai/whisper-large` (can be changed to `whisper-base`, `whisper-medium`, etc. for faster/smaller models)
- **Chunk Duration**: 10 seconds with 1 second overlap
- **Port**: 8000 (default)

### Frontend

- **API URL**: Configured via `VITE_API_URL` environment variable
- **Port**: 3000

## 📦 API Endpoints

### `POST /upload`

Upload an audio file and receive a job ID.

**Response:**

```json
{
  "job_id": "uuid-string"
}
```

### `GET /transcribe/{job_id}`

Stream transcription results via Server-Sent Events (SSE).

**Events:**

- `message`: Individual characters of the transcription
- `done`: Transcription complete

### `GET /system-info`

Get system hardware information.

**Response:**

```json
{
  "hostname": "...",
  "cpu_name": "...",
  "cpu_cores": 8,
  "cpu_threads": 8,
  "gpu_name": "Apple M1 Pro",
  "gpu_cores": 16,
  "total_memory": "16.0 GB",
  "gpu_memory": "Shared with System RAM",
  "os": "macOS Sequoia 15.x",
  "device": "mps"
}
```

## 🐛 Troubleshooting

### Backend Issues

**Model Download Fails:**

- Check your internet connection
- Ensure you have ~3GB of free disk space
- Try manually downloading: `huggingface-cli download openai/whisper-large`

**MPS/GPU Not Detected:**

- For Apple Silicon: Update to macOS 12.3+ and PyTorch 2.0+
- For NVIDIA GPUs: Ensure CUDA toolkit is installed

**Port 8000 Already in Use:**

```bash
uvicorn main:app --reload --port 8001
```

Update `VITE_API_URL` accordingly.

### Frontend Issues

**CORS Errors:**

- Ensure backend is running on `localhost:8000`
- Check that frontend URL is in the `allow_origins` list in `main.py`

**Port 5173 Already in Use:**

```bash
npm run dev -- --port 3000
```

## 🤝 Contributing

Feel free to submit issues and pull requests!

## 📄 License

[Your License Here]

## 🙏 Acknowledgments

- OpenAI for the Whisper model
- Hugging Face for model hosting and Transformers library
- FastAPI and Vite for amazing developer experience

---

**Happy Transcribing! 🎙️✨**
