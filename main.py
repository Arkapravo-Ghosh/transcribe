import os
import uuid
import asyncio
import torch
import librosa
import platform
import psutil
import subprocess
import re
from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from transformers import WhisperProcessor, WhisperForConditionalGeneration
import threading
import queue
from sse_starlette.sse import EventSourceResponse

os.makedirs("./cache", exist_ok=True)
os.environ["TRANSFORMERS_CACHE"] = "./models"
os.environ["HF_HOME"] = "./models"

device = "mps" if torch.backends.mps.is_available() else "cpu"
print(f"Using device: {device}")

model_name = "openai/whisper-large"
processor = WhisperProcessor.from_pretrained(model_name)
model = WhisperForConditionalGeneration.from_pretrained(
    model_name, dtype=torch.float32
).to(device)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

transcription_jobs = {}


def remove_overlap(prev_text, curr_text, max_overlap_chars=80):
    max_overlap_chars = min(max_overlap_chars, len(prev_text), len(curr_text))
    for i in range(max_overlap_chars, 0, -1):
        if prev_text[-i:] == curr_text[:i]:
            return curr_text[i:]
    return curr_text


@app.post("/upload")
async def upload_audio(file: UploadFile = File(...)):
    job_id = str(uuid.uuid4())
    file_path = f"./cache/{job_id}_{file.filename}"
    with open(file_path, "wb") as f:
        f.write(await file.read())

    transcription_jobs[job_id] = {
        "file_path": file_path,
        "status": "pending",
        "char_queue": queue.Queue(),
        "full_text": "",
        "lock": threading.Lock(),
    }

    return {"job_id": job_id}


@app.get("/transcribe/{job_id}")
async def transcribe_stream(job_id: str):
    if job_id not in transcription_jobs:
        return {"error": "Job not found"}, 404

    job = transcription_jobs[job_id]
    file_path = job["file_path"]
    char_queue = job["char_queue"]

    def decode_chunks():
        audio, sr = librosa.load(file_path, sr=16000)

        chunk_duration = 10
        overlap_duration = 1
        chunk_length = chunk_duration * sr
        overlap_length = overlap_duration * sr
        num_chunks = (len(audio) + chunk_length - 1) // (chunk_length - overlap_length)

        full_text = ""

        for i in range(num_chunks):
            start = i * (chunk_length - overlap_length)
            end = min(start + chunk_length, len(audio))
            chunk = audio[start:end]

            inputs = processor(
                chunk, sampling_rate=16000, return_tensors="pt", padding=True
            ).to(device)
            inputs["input_features"] = inputs["input_features"].to(torch.float32)
            attention_mask = torch.ones_like(inputs["input_features"], device=device)

            with torch.no_grad():
                predicted_ids = model.generate(
                    inputs["input_features"],
                    attention_mask=attention_mask,
                    language="en",
                    task="transcribe",
                    max_new_tokens=400,
                    num_beams=3,
                )
                text = processor.batch_decode(predicted_ids, skip_special_tokens=True)[
                    0
                ].strip()

            text = remove_overlap(full_text, text)
            if not text.endswith(" "):
                text += " "
            full_text += text

            for char in text:
                char_queue.put(char)

        char_queue.put(None)
        job["status"] = "completed"

    decoder_thread = threading.Thread(target=decode_chunks)
    decoder_thread.start()

    async def event_generator():
        while True:
            try:
                char = char_queue.get(timeout=0.1)

                if char is None:
                    break

                yield {"event": "message", "data": char}

                if char in ".!?":
                    await asyncio.sleep(0.12)
                elif char in ",;:":
                    await asyncio.sleep(0.06)
                else:
                    await asyncio.sleep(0.02)
            except queue.Empty:
                await asyncio.sleep(0.05)

        decoder_thread.join()

        yield {"event": "done", "data": "complete"}

        await asyncio.sleep(5)
        if job_id in transcription_jobs:
            del transcription_jobs[job_id]

    return EventSourceResponse(event_generator())


@app.get("/system-info")
async def get_system_info():
    try:
        cpu_count = psutil.cpu_count(logical=False)
        cpu_count_logical = psutil.cpu_count(logical=True)
        memory = psutil.virtual_memory()
        total_memory_gb = round(memory.total / (1024**3), 2)
        gpu_name = "Not Available"
        gpu_cores = "N/A"
        gpu_memory = "N/A"
        if torch.cuda.is_available():
            gpu_name = torch.cuda.get_device_name(0)
            gpu_memory = f"{round(torch.cuda.get_device_properties(0).total_memory / (1024**3), 2)} GB"
            gpu_cores = torch.cuda.get_device_properties(0).multi_processor_count
        elif torch.backends.mps.is_available():
            try:
                gpu_info = subprocess.check_output(
                    ["system_profiler", "SPDisplaysDataType"]
                ).decode()
                chipset_match = re.search(r"Chipset Model:\s*(.+)", gpu_info)
                if chipset_match:
                    gpu_name = chipset_match.group(1).strip()
                else:
                    gpu_name = "Apple Silicon GPU"
                cores_match = re.search(r"Total Number of Cores:\s*(\d+)", gpu_info)
                if cores_match:
                    gpu_cores = int(cores_match.group(1))
                else:
                    gpu_cores = "Integrated"

                gpu_memory = "Shared with System RAM"
            except:
                gpu_name = "Apple Silicon GPU (MPS)"
                gpu_cores = "Integrated"
                gpu_memory = "Shared with System RAM"
        cpu_name = platform.processor() or "Unknown"
        if not cpu_name or cpu_name == "" or cpu_name == "arm":
            try:
                cpu_name = (
                    subprocess.check_output(
                        ["sysctl", "-n", "machdep.cpu.brand_string"]
                    )
                    .decode()
                    .strip()
                )
            except:
                try:
                    cpu_brand = (
                        subprocess.check_output(["sysctl", "-n", "machdep.cpu.brand"])
                        .decode()
                        .strip()
                    )
                    if cpu_brand:
                        cpu_name = f"Apple {cpu_brand}"
                    else:
                        cpu_name = "Apple Silicon"
                except:
                    cpu_name = "Apple Silicon" if cpu_name == "arm" else "Unknown"
        os_name = platform.system()
        if os_name == "Darwin":
            try:
                macos_version = (
                    subprocess.check_output(["sw_vers", "-productVersion"])
                    .decode()
                    .strip()
                )
                try:
                    friendly_name = (
                        subprocess.check_output(
                            [
                                "awk",
                                "/SOFTWARE LICENSE AGREEMENT FOR macOS/",
                                "/System/Library/CoreServices/Setup Assistant.app/Contents/Resources/en.lproj/OSXSoftwareLicense.rtf",
                            ],
                            shell=False,
                        )
                        .decode()
                        .strip()
                    )
                    if "macOS" in friendly_name:
                        friendly_part = friendly_name.split("macOS ")[-1]
                        friendly_part = friendly_part.rstrip("\\").strip()

                        if friendly_part:
                            parts = friendly_part.split()
                            if len(parts) >= 2:
                                name = parts[0]
                                os_name = f"macOS {name} {macos_version}"
                            else:
                                os_name = f"macOS {macos_version}"
                        else:
                            os_name = f"macOS {macos_version}"
                    else:
                        os_name = f"macOS {macos_version}"
                except:
                    os_name = f"macOS {macos_version}"
            except:
                os_name = f"macOS {platform.release()}"
        elif os_name == "Windows":
            os_name = f"Windows {platform.release()}"
        elif os_name == "Linux":
            try:
                import distro

                os_name = f"{distro.name()} {distro.version()}"
            except:
                os_name = f"Linux {platform.release()}"
        else:
            os_name = f"{platform.system()} {platform.release()}"
        return {
            "hostname": platform.node(),
            "cpu_name": cpu_name,
            "cpu_cores": cpu_count,
            "cpu_threads": cpu_count_logical,
            "gpu_name": gpu_name,
            "gpu_cores": gpu_cores,
            "total_memory": f"{total_memory_gb} GB",
            "gpu_memory": gpu_memory,
            "os": os_name,
            "device": device,
        }
    except Exception as e:
        return {"error": str(e)}
