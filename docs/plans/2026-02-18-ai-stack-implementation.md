# Local AI Intelligence Stack — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a zero-touch audio processing and EF scaffolding system that transcribes recordings, diarizes speakers, and generates structured Obsidian briefing docs using a fully local AI stack.

**Architecture:** `whisperx` handles transcription + speaker diarization in a single pipeline. `llama.cpp` serves a quantized Llama-3-8B as a local OpenAI-compatible API on port 8080. Python scripts (`watchman.py`, `meeting_assistant.py`) monitor a folder drop, process audio, and write Obsidian markdown. Supporting scripts handle Goblin Mode (clipboard task breakdown) and Plex watchlist. All services run as NSSM Windows services for reliability.

**Tech Stack:** Python 3.11+, whisperx, torch (CUDA 12.x), llama.cpp (CUDA prebuilt), plexapi, watchdog, pyperclip, python-dotenv, NSSM, AutoHotkey v2, pytest + pytest-mock

**Reference files:**
- Gap analysis: `docs/plans/2026-02-18-blueprint-gap-analysis.md`
- EF system prompt: `C:\AI_Tools\Assistant.md` (provided — do not modify)
- Original blueprint: `blueprint.md`

---

## Task 1: Initialize Project Structure

**Files:**
- Create: `C:\AI_Tools\` (directory)
- Create: `C:\AI_Tools\logs\` (directory)
- Create: `C:\AI_Tools\models\` (directory)
- Create: `C:\Users\Danny\Documents\Recordings\Incoming\` (watched folder)
- Create: `C:\Users\Danny\Documents\Recordings\failed\` (error quarantine)
- Create: `C:\AI_Tools\.gitignore`
- Create: `C:\AI_Tools\requirements.txt`

**Step 1: Create directory structure**

Run in PowerShell:
```powershell
New-Item -ItemType Directory -Force -Path "C:\AI_Tools\logs"
New-Item -ItemType Directory -Force -Path "C:\AI_Tools\models"
New-Item -ItemType Directory -Force -Path "C:\Users\Danny\Documents\Recordings\Incoming"
New-Item -ItemType Directory -Force -Path "C:\Users\Danny\Documents\Recordings\failed"
New-Item -ItemType Directory -Force -Path "C:\Users\Danny\Documents\DannyVault\Meetings"
```

**Step 2: Initialize git repo**

```bash
cd /c/AI_Tools
git init
```

**Step 3: Write `.gitignore`**

```
.env
__pycache__/
*.pyc
logs/
models/
*.gguf
```

**Step 4: Write `requirements.txt`**

```
whisperx
pyperclip
watchdog
requests
plexapi
python-dotenv
pytest
pytest-mock
```

> Note: `torch` is installed separately with CUDA support (see Task 3).

**Step 5: Commit**

```bash
git add .gitignore requirements.txt
git commit -m "chore: initialize project structure"
```

---

## Task 2: Create Config and Environment

**Files:**
- Create: `C:\AI_Tools\.env.example`
- Create: `C:\AI_Tools\.env` (never committed)
- Create: `C:\AI_Tools\config.py`
- Create: `C:\AI_Tools\tests\test_config.py`

**Step 1: Write `.env.example`**

```ini
# Copy this to .env and fill in real values
PLEX_TOKEN=your_plex_token_here
PLEX_URL=http://192.168.88.100
LLM_URL=http://localhost:8080/v1/chat/completions
LLM_API_KEY=your_llm_api_key_here
HA_URL=http://homeassistant:8123
HF_TOKEN=your_huggingface_token_here

WATCH_PATH=C:\Users\Danny\Documents\Recordings\Incoming
FAILED_PATH=C:\Users\Danny\Documents\Recordings\failed
OBSIDIAN_PATH=C:\Users\Danny\Documents\DannyVault
ASSISTANT_MD_PATH=C:\AI_Tools\Assistant.md
LOG_DIR=C:\AI_Tools\logs
```

**Step 2: Create `.env` with real values**

Copy `.env.example` to `.env` and fill in:
- `PLEX_TOKEN` = your token (from session context — do not hardcode anywhere else)
- `PLEX_URL` = `http://192.168.88.100`
- `HA_URL` = `http://homeassistant:8123`
- `HF_TOKEN` = HuggingFace token (required by whisperx/pyannote — create at https://huggingface.co/settings/tokens, accept pyannote model terms)
- `LLM_API_KEY` = choose any secret string (you'll set the same value in llama-server)

**Step 3: Write `config.py`**

```python
import os
from pathlib import Path
from dotenv import load_dotenv

load_dotenv(Path(__file__).parent / ".env")

PLEX_TOKEN = os.environ["PLEX_TOKEN"]
PLEX_URL = os.environ["PLEX_URL"]
LLM_URL = os.environ["LLM_URL"]
LLM_API_KEY = os.environ["LLM_API_KEY"]
HA_URL = os.environ["HA_URL"]
HF_TOKEN = os.environ["HF_TOKEN"]

WATCH_PATH = Path(os.environ["WATCH_PATH"])
FAILED_PATH = Path(os.environ["FAILED_PATH"])
OBSIDIAN_PATH = Path(os.environ["OBSIDIAN_PATH"])
ASSISTANT_MD_PATH = Path(os.environ["ASSISTANT_MD_PATH"])
LOG_DIR = Path(os.environ["LOG_DIR"])
```

**Step 4: Write failing test**

```python
# tests/test_config.py
import pytest
from unittest.mock import patch
import os

def test_config_loads_required_vars():
    required = [
        "PLEX_TOKEN", "PLEX_URL", "LLM_URL", "LLM_API_KEY",
        "HA_URL", "HF_TOKEN", "WATCH_PATH", "FAILED_PATH",
        "OBSIDIAN_PATH", "ASSISTANT_MD_PATH", "LOG_DIR"
    ]
    env = {k: "test_value" for k in required}
    with patch.dict(os.environ, env):
        import importlib
        import config
        importlib.reload(config)
        assert config.PLEX_TOKEN == "test_value"
        assert config.LLM_URL == "test_value"

def test_config_raises_on_missing_var():
    with patch.dict(os.environ, {}, clear=True):
        import importlib
        import config
        with pytest.raises(KeyError):
            importlib.reload(config)
```

**Step 5: Run test — expect FAIL**

```bash
cd /c/AI_Tools
pytest tests/test_config.py -v
```
Expected: FAIL — `config` module not found yet.

**Step 6: Run test after writing `config.py` — expect PASS**

```bash
pytest tests/test_config.py -v
```
Expected: PASS

**Step 7: Commit**

```bash
git add config.py .env.example requirements.txt tests/test_config.py
git commit -m "feat: add config module with env-based configuration"
```

---

## Task 3: Install Python Dependencies + CUDA PyTorch

**Step 1: Install CUDA-enabled PyTorch**

Run in PowerShell (check https://pytorch.org/get-started for current CUDA 12.x command):
```powershell
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu124
```

**Step 2: Install remaining dependencies**

```powershell
pip install -r C:\AI_Tools\requirements.txt
```

**Step 3: Verify GPU is accessible**

```python
# Run in Python REPL
import torch
print(torch.cuda.is_available())      # must be True
print(torch.cuda.get_device_name(0))  # should show RTX 5090
```

Expected output:
```
True
NVIDIA GeForce RTX 5090
```

**Step 4: Verify whisperx loads**

```python
import whisperx
print("whisperx OK")
```

Expected: `whisperx OK` (no import errors)

---

## Task 4: Install llama.cpp

**Step 1: Download prebuilt CUDA binary**

Go to: https://github.com/ggerganov/llama.cpp/releases
Download the latest Windows CUDA release, e.g.: `llama-bXXXX-bin-win-cuda-cu12.x.x-x64.zip`
Extract to `C:\AI_Tools\llama.cpp\`

**Step 2: Download the model**

Download `Llama-3-8B-Instruct-Q8_0.gguf` (~8.5GB) from HuggingFace:
```
https://huggingface.co/bartowski/Meta-Llama-3-8B-Instruct-GGUF
```
Save to: `C:\AI_Tools\models\Llama-3-8B-Instruct-Q8_0.gguf`

**Step 3: Test server starts correctly**

```powershell
cd C:\AI_Tools\llama.cpp
.\llama-server.exe -m ..\models\Llama-3-8B-Instruct-Q8_0.gguf --port 8080 --ngl 99 --api-key test123
```

Expected: Server starts, logs show model loaded, no errors.

**Step 4: Test API responds**

In a new PowerShell window:
```powershell
curl -X POST http://localhost:8080/v1/chat/completions `
  -H "Content-Type: application/json" `
  -H "Authorization: Bearer test123" `
  -d '{"model":"local","messages":[{"role":"user","content":"Say hello"}]}'
```

Expected: JSON response with a message.

**Step 5: Stop the test server** (Ctrl+C in its window)

---

## Task 5: Rewrite `meeting_assistant.py`

**Files:**
- Create: `C:\AI_Tools\meeting_assistant.py`
- Create: `C:\AI_Tools\tests\test_meeting_assistant.py`

**Step 1: Write failing tests**

```python
# tests/test_meeting_assistant.py
import pytest
from unittest.mock import patch, MagicMock, mock_open
from pathlib import Path

def test_load_system_prompt_reads_file(tmp_path):
    prompt_file = tmp_path / "Assistant.md"
    prompt_file.write_text("You are an EF assistant.")
    from meeting_assistant import load_system_prompt
    result = load_system_prompt(prompt_file)
    assert result == "You are an EF assistant."

def test_load_system_prompt_raises_if_missing(tmp_path):
    from meeting_assistant import load_system_prompt
    with pytest.raises(FileNotFoundError):
        load_system_prompt(tmp_path / "nonexistent.md")

def test_get_ef_briefing_calls_llm_with_auth(mocker):
    mock_post = mocker.patch("requests.post")
    mock_post.return_value.json.return_value = {
        "choices": [{"message": {"content": "# Briefing Doc\n..."}}]
    }
    from meeting_assistant import get_ef_briefing
    result = get_ef_briefing(
        transcript="Speaker A: Hello. Speaker B: Hi.",
        system_prompt="You are an EF assistant.",
        llm_url="http://localhost:8080/v1/chat/completions",
        llm_api_key="test123"
    )
    assert "Briefing Doc" in result
    call_kwargs = mock_post.call_args
    assert call_kwargs.kwargs["headers"]["Authorization"] == "Bearer test123"

def test_format_transcript_with_speakers():
    from meeting_assistant import format_transcript
    segments = [
        {"speaker": "SPEAKER_00", "text": " Hello there."},
        {"speaker": "SPEAKER_01", "text": " Hi Danny."},
    ]
    result = format_transcript(segments)
    assert "SPEAKER_00: Hello there." in result
    assert "SPEAKER_01: Hi Danny." in result

def test_process_audio_moves_file_to_failed_on_error(mocker, tmp_path):
    incoming = tmp_path / "Incoming"
    failed = tmp_path / "failed"
    incoming.mkdir(); failed.mkdir()
    audio_file = incoming / "test.wav"
    audio_file.write_bytes(b"fake audio")

    mocker.patch("meeting_assistant.transcribe_and_diarize", side_effect=RuntimeError("GPU OOM"))
    mocker.patch("meeting_assistant.FAILED_PATH", failed)

    from meeting_assistant import process_audio
    process_audio(audio_file)

    assert (failed / "test.wav").exists()
    assert not audio_file.exists()
```

**Step 2: Run tests — expect FAIL**

```bash
pytest tests/test_meeting_assistant.py -v
```
Expected: FAIL — module not found.

**Step 3: Write `meeting_assistant.py`**

```python
import os
import shutil
import logging
import subprocess
import urllib.parse
from pathlib import Path

import requests
import whisperx

import config

# Logging setup
logger = logging.getLogger(__name__)

FAILED_PATH = config.FAILED_PATH
OBSIDIAN_PATH = config.OBSIDIAN_PATH


def setup_logging():
    config.LOG_DIR.mkdir(parents=True, exist_ok=True)
    handler = logging.handlers.RotatingFileHandler(
        config.LOG_DIR / "processor.log", maxBytes=5_000_000, backupCount=3
    )
    logging.basicConfig(level=logging.INFO, handlers=[handler, logging.StreamHandler()])


def load_system_prompt(path: Path) -> str:
    if not path.exists():
        raise FileNotFoundError(f"Assistant.md not found at {path}")
    return path.read_text(encoding="utf-8")


def format_transcript(segments: list) -> str:
    lines = []
    for seg in segments:
        speaker = seg.get("speaker", "UNKNOWN")
        text = seg.get("text", "").strip()
        if text:
            lines.append(f"{speaker}: {text}")
    return "\n".join(lines)


def transcribe_and_diarize(file_path: Path) -> list:
    """Returns list of segments with speaker labels."""
    device = "cuda"
    compute_type = "float16"

    model = whisperx.load_model("large-v3", device=device, compute_type=compute_type)
    audio = whisperx.load_audio(str(file_path))
    result = model.transcribe(audio, batch_size=16)

    # Align
    align_model, metadata = whisperx.load_align_model(
        language_code=result["language"], device=device
    )
    result = whisperx.align(result["segments"], align_model, metadata, audio, device)

    # Diarize
    diarize_model = whisperx.DiarizationPipeline(
        use_auth_token=config.HF_TOKEN, device=device
    )
    diarize_segments = diarize_model(audio)
    result = whisperx.assign_word_speakers(diarize_segments, result)

    return result["segments"]


def get_ef_briefing(
    transcript: str,
    system_prompt: str,
    llm_url: str,
    llm_api_key: str,
) -> str:
    payload = {
        "model": "local",
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": transcript},
        ],
        "temperature": 0.2,
    }
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {llm_api_key}",
    }
    response = requests.post(llm_url, json=payload, headers=headers, timeout=300)
    response.raise_for_status()
    return response.json()["choices"][0]["message"]["content"]


def process_audio(file_path: Path) -> None:
    logger.info(f"Processing: {file_path}")
    try:
        system_prompt = load_system_prompt(config.ASSISTANT_MD_PATH)
        segments = transcribe_and_diarize(file_path)
        transcript = format_transcript(segments)
        logger.info(f"Transcript length: {len(transcript)} chars, segments: {len(segments)}")

        doc = get_ef_briefing(
            transcript=transcript,
            system_prompt=system_prompt,
            llm_url=config.LLM_URL,
            llm_api_key=config.LLM_API_KEY,
        )

        out_name = file_path.stem + ".md"
        out_path = config.OBSIDIAN_PATH / "Meetings" / out_name
        out_path.parent.mkdir(parents=True, exist_ok=True)
        out_path.write_text(doc, encoding="utf-8")
        logger.info(f"Briefing doc written: {out_path}")

        uri = f"obsidian://open?vault=DannyVault&file=Meetings/{urllib.parse.quote(out_name)}"
        subprocess.run(["cmd", "/c", "start", uri], check=False)

    except Exception as e:
        logger.error(f"Failed to process {file_path}: {e}", exc_info=True)
        dest = config.FAILED_PATH / file_path.name
        shutil.move(str(file_path), str(dest))
        logger.info(f"Moved to failed: {dest}")


if __name__ == "__main__":
    import logging.handlers
    import sys
    setup_logging()
    if len(sys.argv) > 1:
        process_audio(Path(sys.argv[1]))
```

**Step 4: Run tests — expect PASS**

```bash
pytest tests/test_meeting_assistant.py -v
```
Expected: All 5 tests PASS.

**Step 5: Commit**

```bash
git add meeting_assistant.py tests/test_meeting_assistant.py
git commit -m "feat: rewrite meeting_assistant with whisperx + auth + error handling"
```

---

## Task 6: Update `watchman.py`

**Files:**
- Create: `C:\AI_Tools\watchman.py`
- Create: `C:\AI_Tools\tests\test_watchman.py`

**Step 1: Write failing test**

```python
# tests/test_watchman.py
import pytest
from unittest.mock import patch, MagicMock
from pathlib import Path

def test_handler_ignores_non_audio_files(mocker):
    mock_process = mocker.patch("watchman.process_audio")
    from watchman import AudioHandler
    handler = AudioHandler()
    event = MagicMock()
    event.is_directory = False
    event.src_path = "C:/test/document.pdf"
    handler.on_created(event)
    mock_process.assert_not_called()

def test_handler_triggers_on_audio_file(mocker):
    mock_process = mocker.patch("watchman.process_audio")
    mocker.patch("time.sleep")
    from watchman import AudioHandler
    handler = AudioHandler()
    event = MagicMock()
    event.is_directory = False
    event.src_path = "C:/Incoming/meeting.m4a"
    handler.on_created(event)
    mock_process.assert_called_once_with(Path("C:/Incoming/meeting.m4a"))
```

**Step 2: Run — expect FAIL**

```bash
pytest tests/test_watchman.py -v
```

**Step 3: Write `watchman.py`**

```python
import time
import logging
import logging.handlers
from pathlib import Path
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler

import config
from meeting_assistant import process_audio

AUDIO_EXTENSIONS = {".wav", ".m4a", ".mp3", ".flac", ".ogg"}

logger = logging.getLogger(__name__)


def setup_logging():
    config.LOG_DIR.mkdir(parents=True, exist_ok=True)
    handler = logging.handlers.RotatingFileHandler(
        config.LOG_DIR / "watchman.log", maxBytes=5_000_000, backupCount=3
    )
    logging.basicConfig(level=logging.INFO, handlers=[handler, logging.StreamHandler()])


class AudioHandler(FileSystemEventHandler):
    def on_created(self, event):
        if event.is_directory:
            return
        path = Path(event.src_path)
        if path.suffix.lower() not in AUDIO_EXTENSIONS:
            logger.debug(f"Ignored non-audio file: {path}")
            return
        logger.info(f"Detected audio file: {path}")
        time.sleep(2)  # Buffer for network transfer completion
        process_audio(path)


if __name__ == "__main__":
    setup_logging()
    logger.info(f"Watching: {config.WATCH_PATH}")
    observer = Observer()
    observer.schedule(AudioHandler(), str(config.WATCH_PATH), recursive=False)
    observer.start()
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        observer.stop()
    observer.join()
```

**Step 4: Run tests — expect PASS**

```bash
pytest tests/test_watchman.py -v
```

**Step 5: Commit**

```bash
git add watchman.py tests/test_watchman.py
git commit -m "feat: watchman with logging, error handling, and audio extension filter"
```

---

## Task 7: Write `goblin_mode.py`

**Files:**
- Create: `C:\AI_Tools\goblin_mode.py`
- Create: `C:\AI_Tools\tests\test_goblin_mode.py`

**Step 1: Write failing test**

```python
# tests/test_goblin_mode.py
def test_get_micro_steps_calls_llm(mocker):
    mock_post = mocker.patch("requests.post")
    mock_post.return_value.json.return_value = {
        "choices": [{"message": {"content": "1. Open file\n2. Read line\n3. Save"}}]
    }
    from goblin_mode import get_micro_steps
    result = get_micro_steps(
        task="Write the report",
        llm_url="http://localhost:8080/v1/chat/completions",
        llm_api_key="test123"
    )
    assert "1. Open file" in result
    headers = mock_post.call_args.kwargs["headers"]
    assert headers["Authorization"] == "Bearer test123"

def test_get_micro_steps_prompt_contains_task(mocker):
    mock_post = mocker.patch("requests.post")
    mock_post.return_value.json.return_value = {
        "choices": [{"message": {"content": "steps"}}]
    }
    from goblin_mode import get_micro_steps
    get_micro_steps("Write the report", "http://localhost:8080/v1/chat/completions", "key")
    payload = mock_post.call_args.kwargs["json"]
    user_content = payload["messages"][-1]["content"]
    assert "Write the report" in user_content
```

**Step 2: Run — expect FAIL**

```bash
pytest tests/test_goblin_mode.py -v
```

**Step 3: Write `goblin_mode.py`**

```python
import sys
import pyperclip
import requests
import config

SYSTEM_PROMPT = (
    "You are an executive functioning assistant for someone with ADHD. "
    "Break the given task into exactly 3-5 concrete micro-steps. "
    "Each step must be a single, specific action that takes under 5 minutes. "
    "Format: numbered list only, no preamble, no commentary."
)


def get_micro_steps(task: str, llm_url: str, llm_api_key: str) -> str:
    payload = {
        "model": "local",
        "messages": [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": f"Task: {task}"},
        ],
        "temperature": 0.3,
    }
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {llm_api_key}",
    }
    response = requests.post(llm_url, json=payload, headers=headers, timeout=60)
    response.raise_for_status()
    return response.json()["choices"][0]["message"]["content"]


def main():
    task = pyperclip.paste().strip()
    if not task:
        print("Clipboard is empty — nothing to break down.", file=sys.stderr)
        sys.exit(1)

    steps = get_micro_steps(task, config.LLM_URL, config.LLM_API_KEY)
    output = f"--- Goblin Mode: {task[:60]} ---\n{steps}"
    pyperclip.copy(output)
    print(output)


if __name__ == "__main__":
    main()
```

**Step 4: Run tests — expect PASS**

```bash
pytest tests/test_goblin_mode.py -v
```

**Step 5: Commit**

```bash
git add goblin_mode.py tests/test_goblin_mode.py
git commit -m "feat: goblin_mode.py — clipboard task breakdown via local LLM"
```

---

## Task 8: Write `add_to_plex.py`

**Files:**
- Create: `C:\AI_Tools\add_to_plex.py`
- Create: `C:\AI_Tools\tests\test_add_to_plex.py`

**Step 1: Write failing test**

```python
# tests/test_add_to_plex.py
import pytest

def test_add_to_watchlist_searches_and_adds(mocker):
    mock_plex = mocker.MagicMock()
    mock_result = mocker.MagicMock()
    mock_result.addToWatchlist.return_value = None
    mock_plex.search.return_value = [mock_result]
    mocker.patch("add_to_plex.PlexServer", return_value=mock_plex)

    from add_to_plex import add_to_watchlist
    add_to_watchlist("Inception", "http://192.168.88.100", "token123")

    mock_plex.search.assert_called_once_with("Inception")
    mock_result.addToWatchlist.assert_called_once()

def test_add_to_watchlist_raises_if_no_results(mocker):
    mock_plex = mocker.MagicMock()
    mock_plex.search.return_value = []
    mocker.patch("add_to_plex.PlexServer", return_value=mock_plex)

    from add_to_plex import add_to_watchlist
    with pytest.raises(ValueError, match="No results found"):
        add_to_watchlist("Nonexistent Movie XYZ", "http://192.168.88.100", "token123")
```

**Step 2: Run — expect FAIL**

```bash
pytest tests/test_add_to_plex.py -v
```

**Step 3: Write `add_to_plex.py`**

```python
import sys
from plexapi.server import PlexServer
import config


def add_to_watchlist(title: str, plex_url: str, plex_token: str) -> None:
    plex = PlexServer(plex_url, plex_token)
    results = plex.search(title)
    if not results:
        raise ValueError(f"No results found for: {title!r}")
    item = results[0]
    item.addToWatchlist()
    print(f"Added to watchlist: {item.title} ({getattr(item, 'year', 'N/A')})")


def main():
    if len(sys.argv) < 2:
        print("Usage: python add_to_plex.py <title>", file=sys.stderr)
        sys.exit(1)
    title = " ".join(sys.argv[1:])
    add_to_watchlist(title, config.PLEX_URL, config.PLEX_TOKEN)


if __name__ == "__main__":
    main()
```

**Step 4: Run tests — expect PASS**

```bash
pytest tests/test_add_to_plex.py -v
```

**Step 5: Commit**

```bash
git add add_to_plex.py tests/test_add_to_plex.py
git commit -m "feat: add_to_plex.py — add media to Plex Universal Watchlist via HA"
```

---

## Task 9: Write `watchman_text.py` (HA Voice Capture)

**Files:**
- Create: `C:\AI_Tools\watchman_text.py`

> This handles the HA `notify` text drop — separate from the audio watchman since the pipeline skips Whisper entirely.

**Step 1: Write `watchman_text.py`**

```python
import time
import logging
import logging.handlers
from pathlib import Path
import requests
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler

import config

TEXT_WATCH_PATH = config.WATCH_PATH.parent / "TextIncoming"
logger = logging.getLogger(__name__)


def setup_logging():
    config.LOG_DIR.mkdir(parents=True, exist_ok=True)
    handler = logging.handlers.RotatingFileHandler(
        config.LOG_DIR / "watchman_text.log", maxBytes=2_000_000, backupCount=2
    )
    logging.basicConfig(level=logging.INFO, handlers=[handler, logging.StreamHandler()])


def process_text_capture(file_path: Path) -> None:
    """Routes text directly to LLM, bypassing Whisper."""
    try:
        text = file_path.read_text(encoding="utf-8").strip()
        if not text:
            logger.warning(f"Empty text file: {file_path}")
            return

        from meeting_assistant import load_system_prompt, get_ef_briefing
        import urllib.parse, subprocess
        from pathlib import Path

        system_prompt = load_system_prompt(config.ASSISTANT_MD_PATH)
        doc = get_ef_briefing(
            transcript=f"[Voice capture — no speaker diarization]\n{text}",
            system_prompt=system_prompt,
            llm_url=config.LLM_URL,
            llm_api_key=config.LLM_API_KEY,
        )
        out_name = file_path.stem + ".md"
        out_path = config.OBSIDIAN_PATH / "Inbox" / out_name
        out_path.parent.mkdir(parents=True, exist_ok=True)
        out_path.write_text(doc, encoding="utf-8")
        logger.info(f"Text briefing written: {out_path}")

    except Exception as e:
        logger.error(f"Failed to process text capture {file_path}: {e}", exc_info=True)


class TextHandler(FileSystemEventHandler):
    def on_created(self, event):
        if event.is_directory:
            return
        path = Path(event.src_path)
        if path.suffix.lower() != ".txt":
            return
        time.sleep(1)
        process_text_capture(path)


if __name__ == "__main__":
    setup_logging()
    TEXT_WATCH_PATH.mkdir(parents=True, exist_ok=True)
    logger.info(f"Watching for text captures: {TEXT_WATCH_PATH}")
    observer = Observer()
    observer.schedule(TextHandler(), str(TEXT_WATCH_PATH), recursive=False)
    observer.start()
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        observer.stop()
    observer.join()
```

**Step 2: Update HA `configuration.yaml`**

Change the HA notify path to write to the `TextIncoming` folder:
```yaml
notify:
  - name: obsidian_processor
    platform: file
    filename: /share/recordings/TextIncoming/voice_capture.txt
```

> Note: Ensure the HA share maps to the same network share that Windows monitors.

**Step 3: Commit**

```bash
git add watchman_text.py
git commit -m "feat: watchman_text.py — HA voice capture text routing"
```

---

## Task 10: Set Up NSSM Services

**Step 1: Download NSSM**

Download from https://nssm.cc/download
Extract `nssm.exe` to `C:\AI_Tools\`

**Step 2: Register llama-server as a Windows service**

Run in PowerShell as Administrator:
```powershell
C:\AI_Tools\nssm.exe install "LLM-Server" `
  "C:\AI_Tools\llama.cpp\llama-server.exe" `
  "-m C:\AI_Tools\models\Llama-3-8B-Instruct-Q8_0.gguf --port 8080 --ngl 99 --api-key YOUR_LLM_API_KEY"

C:\AI_Tools\nssm.exe set "LLM-Server" AppDirectory "C:\AI_Tools\llama.cpp"
C:\AI_Tools\nssm.exe set "LLM-Server" AppStdout "C:\AI_Tools\logs\llm-server.log"
C:\AI_Tools\nssm.exe set "LLM-Server" AppStderr "C:\AI_Tools\logs\llm-server-err.log"
C:\AI_Tools\nssm.exe start "LLM-Server"
```

Replace `YOUR_LLM_API_KEY` with the value from `.env`.

**Step 3: Register watchman as a Windows service**

```powershell
C:\AI_Tools\nssm.exe install "AI-Watchman" `
  "python.exe" `
  "C:\AI_Tools\watchman.py"

C:\AI_Tools\nssm.exe set "AI-Watchman" AppDirectory "C:\AI_Tools"
C:\AI_Tools\nssm.exe set "AI-Watchman" AppStdout "C:\AI_Tools\logs\watchman-svc.log"
C:\AI_Tools\nssm.exe set "AI-Watchman" AppStderr "C:\AI_Tools\logs\watchman-svc-err.log"
C:\AI_Tools\nssm.exe start "AI-Watchman"
```

**Step 4: Register watchman_text as a Windows service**

```powershell
C:\AI_Tools\nssm.exe install "AI-Watchman-Text" `
  "python.exe" `
  "C:\AI_Tools\watchman_text.py"

C:\AI_Tools\nssm.exe set "AI-Watchman-Text" AppDirectory "C:\AI_Tools"
C:\AI_Tools\nssm.exe start "AI-Watchman-Text"
```

**Step 5: Verify services are running**

```powershell
Get-Service "LLM-Server", "AI-Watchman", "AI-Watchman-Text"
```

Expected: All three show `Running`.

**Step 6: Remove old `start_ai_stack.bat`** (replaced by NSSM)

```bash
git rm start_ai_stack.bat 2>/dev/null || true
```

**Step 7: Commit NSSM setup docs**

```bash
cat > C:\AI_Tools\docs\services.md << 'EOF'
# Windows Services

Managed by NSSM. To restart any service:
  nssm.exe restart LLM-Server
  nssm.exe restart AI-Watchman
  nssm.exe restart AI-Watchman-Text

Logs: C:\AI_Tools\logs\
EOF

git add docs/services.md
git commit -m "chore: replace bat startup with NSSM services, add service docs"
```

---

## Task 11: End-to-End Integration Test

**Step 1: Run all unit tests**

```bash
cd /c/AI_Tools
pytest tests/ -v
```
Expected: All tests PASS.

**Step 2: Drop a real audio file**

Copy a short (30-60 second) `.m4a` or `.wav` file into:
```
C:\Users\Danny\Documents\Recordings\Incoming\
```

**Step 3: Monitor logs**

```powershell
Get-Content C:\AI_Tools\logs\watchman.log -Wait -Tail 20
Get-Content C:\AI_Tools\logs\processor.log -Wait -Tail 20
```

Expected log sequence:
```
Detected audio file: ...
Processing: ...
Transcript length: N chars, segments: N
Briefing doc written: C:\Users\Danny\Documents\DannyVault\Meetings\<name>.md
```

**Step 4: Check Obsidian**

Open `DannyVault/Meetings/<filename>.md` and confirm:
- BLUF section present
- Next Actions with `- [ ]` checkboxes
- Topic-by-topic highlights
- Task Matrix with Eisenhower quadrants
- EF Support section

**Step 5: Test Goblin Mode**

1. Copy any task description to clipboard
2. Run: `python C:\AI_Tools\goblin_mode.py`
3. Paste clipboard — confirm 3–5 micro-steps appear

**Step 6: Test Plex (from command line)**

```powershell
python C:\AI_Tools\add_to_plex.py "Dune Part Two"
```
Expected: `Added to watchlist: Dune: Part Two (2024)`

**Step 7: Final commit**

```bash
git add .
git commit -m "docs: add integration test results and verified working state"
```

---

## Quick Reference

| Service | Manage with |
|---------|------------|
| LLM server | `nssm restart LLM-Server` |
| Audio watchman | `nssm restart AI-Watchman` |
| Text watchman | `nssm restart AI-Watchman-Text` |

| Script | Run directly |
|--------|-------------|
| Process a specific file | `python C:\AI_Tools\meeting_assistant.py path\to\audio.m4a` |
| Goblin Mode | `python C:\AI_Tools\goblin_mode.py` (clipboard in → clipboard out) |
| Add to Plex | `python C:\AI_Tools\add_to_plex.py "Movie Title"` |

| Logs | Location |
|------|----------|
| Audio processing | `C:\AI_Tools\logs\processor.log` |
| Watchman | `C:\AI_Tools\logs\watchman.log` |
| LLM server | `C:\AI_Tools\logs\llm-server.log` |
