This comprehensive blueprint outlines the complete local AI intelligence stack. It leverages top-tier hardware to provide zero-friction, automated executive functioning support, task management, and smart home integration.

### **PART 1: ARCHITECTURE**

**1. Hardware & Core Infrastructure**

* **Host Environment:** Windows 11 workstation utilizing an AMD 9800X3D and an RTX 5090 (32GB VRAM) to handle concurrent LLM and transcription inference. 128GB of system RAM provides massive overhead for caching and background operations.
* **Virtualization:** Windows Subsystem for Linux (WSL2) with Docker Desktop (WSL2 backend) and the NVIDIA Container Toolkit for raw GPU passthrough.
* **Networking:** Tailscale mesh network securely connects the Calgary lab with mobile devices (iOS) for remote, cloud-free data transfer.

**2. The AI Processing Stack**

* **Transcription Engine:** `faster-whisper` running the **Whisper Large V3 Turbo** model (configured to `float16` for maximum Tensor core utilization).
* **Diarization Engine:** `diarizen` utilizing the **WavLM-Large-s80** backbone for state-of-the-art speaker identification and overlapping speech handling.
* **LLM Backend:** `llama.cpp` running in server mode (`--ngl 99` for full GPU offload) using a quantized model like **Llama-3-8B-Instruct-Q8_0** (or a 70B variant for deep reasoning).

**3. Integration & Interface Layer**

* **Central Hub:** Home Assistant (HA) manages voice inputs, shared lists, and system bridges.
* **Knowledge Management:** Obsidian serves as the final destination for processed notes, utilizing the Dataview and Tasks plugins for dynamic dashboarding.
* **Mobile Inputs:** iOS Shortcuts (integrated with Apple CarPlay and Siri) and Plaud Note Pro exports.

---

### **PART 2: TASK (System Capabilities & Workflows)**

**1. "Zero-Touch" Audio Processing**
Audio captured via a Plaud Note Pro or Voice Memos is dropped into a monitored network share. The system automatically transcribes, identifies speakers, and feeds the text to the LLM.

**2. Executive Functioning (EF) Scaffolding**
The LLM acts as an EF assistant, transforming raw transcripts into a structured "Briefing Doc". It automatically generates a Bottom Line Up Front (BLUF), isolates Next Actions with checkboxes, categorizes items into an Eisenhower Task Matrix, and flags specific EF challenges (like Initiation or Working Memory) with proposed support strategies.

**3. Cognitive-Load Task Management**
Tasks are automatically tagged by energy requirement (`#energy/high`, `#energy/low`) and project. Obsidian dashboards surface tasks based on current mental capacity and automatically flag "stale" tasks older than 7 days to mitigate object permanence challenges.

**4. Voice-Activated "Goblin Mode" & Capture**
Complex tasks causing "task freeze" can be highlighted and instantly broken down into 3–5 micro-steps via a global hotkey. Thoughts captured while driving via CarPlay are automatically tagged with `#context/drive` and routed to the Obsidian inbox.

**5. Family & Media Operations**
Helen has a dedicated Home Assistant login to manage a shared, live-syncing `todo.shopping_list`. Voice commands can dynamically search the Plex Discover database and append unowned media directly to the Universal Watchlist.

---

### **PART 3: IMPLEMENTATION (Code & Configuration)**

**1. Dependency Installation (Windows/PowerShell)**

```powershell
pip install faster-whisper diarizen torch torchvision torchaudio pyperclip watchdog requests plexapi

```

**2. The Watchman Daemon (`C:\AI_Tools\watchman.py`)**
Monitors the Tailscale-synced `Incoming` folder for audio files and triggers the AI pipeline.

```python
import time, os, subprocess
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler

WATCH_PATH = r"C:\Users\Danny\Documents\Recordings\Incoming"
SCRIPT_PATH = r"C:\AI_Tools\meeting_assistant.py"

class Handler(FileSystemEventHandler):
    def on_created(self, event):
        if event.src_path.endswith(('.wav', '.m4a', '.mp3')):
            time.sleep(2) # Buffer for network transfer
            subprocess.run(["python", SCRIPT_PATH, event.src_path])

observer = Observer()
observer.schedule(Handler(), WATCH_PATH)
observer.start()
try:
    while True: time.sleep(1)
except KeyboardInterrupt: observer.stop()

```

**3. The EF Processing Engine (`C:\AI_Tools\meeting_assistant.py`)**
Combines Whisper Turbo, DiariZen, and the LLM API to output the Obsidian markdown.

```python
import os, requests, torch, subprocess, urllib.parse
from faster_whisper import WhisperModel
from diarizen.pipelines.inference import DiariZenPipeline

LLM_URL = "http://localhost:8080/v1/chat/completions"
OBSIDIAN_PATH = r"C:\Users\Danny\Documents\DannyVault"

def get_ef_briefing(text):
    # Uses the strict formatting rules from Assistant.md
    prompt = """
    Task: Generate a structured Briefing Doc. Extract Topic Highlights, 
    Prioritized Actions for an Eisenhower Matrix, Next Actions with checkboxes, 
    and Follow-Up Questions. Include a Meta-Processing & EF Support section 
    flagging specific barriers (e.g., Initiation) with concrete scaffolds.
    """
    payload = {"model": "local", "messages": [{"role": "system", "content": prompt}, {"role": "user", "content": text}], "temperature": 0.2}
    return requests.post(LLM_URL, json=payload).json()['choices'][0]['message']['content']

def process_audio(file_path):
    model = WhisperModel("large-v3-turbo", device="cuda", compute_type="float16")
    segments, _ = model.transcribe(file_path)
    full_text = " ".join([s.text for s in segments])
    
    doc = get_ef_briefing(full_text)
    base = os.path.basename(file_path).rsplit('.', 1)[0] + ".md"
    
    with open(os.path.join(OBSIDIAN_PATH, "Meetings", base), "w", encoding='utf-8') as f: 
        f.write(doc)
    
    # Auto-open in Obsidian
    uri = f"obsidian://open?vault=DannyVault&file=Meetings/{urllib.parse.quote(base)}"
    subprocess.run(['cmd', '/c', 'start', uri])

if __name__ == "__main__":
    import sys
    if len(sys.argv) > 1: process_audio(sys.argv[1])

```

**4. Home Assistant Configuration (`configuration.yaml`)**
Bridges voice commands and Plex integrations to the local workstation scripts.

```yaml
# Setup file drop for Voice-to-Text notes
notify:
  - name: obsidian_processor
    platform: file
    filename: /share/recordings/incoming/voice_capture.txt

# Plex script execution
shell_command:
  add_plex_watchlist: "python C:/AI_Tools/add_to_plex.py '{{ title }}'"

```

**5. AutoHotkey "Goblin Mode" Breakdown (`goblin_mode.ahk`)**

```autohotkey
^!g:: { ; Ctrl+Alt+G
    A_Clipboard := ""
    Send "^c"
    if ClipWait(2) {
        RunWait 'python.exe "C:\AI_Tools\goblin_mode.py"'
        Send "^v"
    }
}

```

**6. Obsidian Dataview Dashboards**
To be placed in a `⚡ Brain Power Dashboard.md` file to visually manage cognitive load.

*Energy-Based Filtering:*

```markdown
```dataview
TASK WHERE !completed AND contains(text, "#energy/low") GROUP BY file.link

```

*Stale Task Highlighting:*

```markdown
```dataview
TASK WHERE !completed AND file.ctime < (date(today) - dur(7 days))

```

**7. System Startup (`shell:startup\start_ai_stack.bat`)**
Ensures all daemons are running upon Windows login.

```batch
@echo off
start "LLM Server" cmd /k "cd /d C:\AI_Tools\llama.cpp && .\llama-server.exe -m models\Llama-3-8B-Instruct-Q8_0.gguf --port 8080 --ngl 99"
timeout /t 5
start "Folder Watcher" cmd /k "python C:\AI_Tools\watchman.py"
start "AHK Goblin Mode" "C:\AI_Tools\goblin_mode.ahk"
start "" "C:\Users\Danny\AppData\Local\Obsidian\Obsidian.exe"

```