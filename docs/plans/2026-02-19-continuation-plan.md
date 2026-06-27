# Local AI Intelligence Stack — Continuation Plan
> **Date:** 2026-02-19  
> **Hardware:** AMD 9800X3D | RTX 5090 (32GB GDDR7) | 128GB RAM | Windows 11 + WSL2  
> **Vault:** `Danny Notes` at `C:\Users\DannyTam-Tham\OneDrive - Tam-Tham\Documents\Obsidian Vault\Danny Notes`

---

## What's Already Done (from Claude Code Sessions 1–4)

Four Claude Code sessions ran on 2/18–2/19/2026. Here's the verified state of the project:

### ✅ Completed

| Task | Detail | Verified By |
|------|--------|-------------|
| Project structure | `C:\AI_Tools\` with `logs/`, `models/`, git repo initialized | claude-mem #7, #13 |
| `.gitignore` | Excludes `.env`, `__pycache__`, `logs/`, `models/`, `*.gguf` | claude-mem #14 |
| `requirements.txt` | whisperx, pyperclip, watchdog, requests, plexapi, pytest, pytest-mock (no python-dotenv) | claude-mem #15 |
| `config.py` | Reads from `os.environ` (Doppler injection), 13 vars including `OBSIDIAN_VAULT_NAME` | claude-mem #18, #40 |
| `.env.example` | Template with all 13 variables documented | claude-mem #17 |
| `tests/test_config.py` | 3 tests passing: loads vars, raises on missing, HA_TOKEN optional | claude-mem #21 |
| Doppler setup | Project `ai-tools`, dev environment, 13 secrets uploaded, `C:\AI_Tools` linked | claude-mem #37–39 |
| `.env` deleted | Secrets managed exclusively via Doppler | claude-mem #42 |
| PyTorch 2.8.0+cu128 | CUDA-accelerated, RTX 5090 detected, `torch.cuda.is_available() == True` | claude-mem #28–29 |
| WhisperX installed | With dependency downgrades for huggingface-hub and transformers | claude-mem #30 |
| Recordings dirs | `Incoming/` and `failed/` created under OneDrive Recordings path | claude-mem #12 |
| Obsidian dirs | `Meetings/` and `Inbox/` under Danny Notes vault | claude-mem #12 |
| llama-server (Vulkan) | Installed via winget, detects RTX 5090 with Vulkan backend | claude-mem #34–35 |

### ⚠️ Partially Done / Blocked

| Item | Status | Issue |
|------|--------|-------|
| llama.cpp CUDA build | Attempted in WSL2 but `nvcc` not installed | CUDA toolkit missing from WSL2 — nvidia-smi works but compiler absent |
| llama-server backend | Running on **Vulkan**, not CUDA | Vulkan is significantly slower than CUDA for LLM inference on RTX 5090 |
| Model file | Not yet downloaded | Llama-3-8B-Instruct-Q8_0.gguf was planned but never fetched |
| 3 Doppler secrets | Placeholder values | `LLM_API_KEY`, `HF_TOKEN`, `HA_TOKEN` need real values |
| API authentication | Questions raised at 1:57 AM but session ran out of context | llama-server `--api-key` flag + Bearer auth in callers |

### ❌ Not Started

| Task | Description |
|------|-------------|
| `meeting_assistant.py` | Core audio → transcript → EF briefing pipeline |
| `watchman.py` | Folder watcher for audio files |
| `goblin_mode.py` | Clipboard task breakdown via LLM |
| `add_to_plex.py` | Plex Universal Watchlist integration |
| `watchman_text.py` | HA voice capture text routing |
| NSSM services | Windows service registration for all daemons |
| End-to-end test | Drop audio → verify Obsidian briefing doc |

---

## Critical Fix: CUDA Instead of Vulkan

The current llama-server uses Vulkan, which wastes the RTX 5090's CUDA tensor cores. The RTX 5090 with CUDA delivers up to **67% faster inference** than a 4090, but only if the CUDA backend is actually used. Vulkan doesn't leverage tensor cores for matrix operations — it falls back to shader compute, which is dramatically slower for LLM inference.

**Two paths to fix this:**

### Path A: Build llama.cpp with CUDA in WSL2 (Recommended)

This gives you a CUDA-native llama-server binary that fully utilizes RTX 5090 tensor cores and flash attention. WSL2 has direct GPU passthrough via the NVIDIA driver.

**Paste this entire block into a WSL2 Ubuntu terminal:**

```bash
#!/bin/bash
# ============================================================
# llama.cpp CUDA Build for RTX 5090 — WSL2 Ubuntu
# ============================================================
# Prerequisites: WSL2 Ubuntu 22.04+, NVIDIA driver installed on Windows host
# nvidia-smi should already show RTX 5090 from WSL2

set -euo pipefail

echo "=== Step 1: Install CUDA Toolkit (compiler + libraries) ==="
# The NVIDIA driver is shared from Windows; we only need the toolkit
wget https://developer.download.nvidia.com/compute/cuda/repos/wsl-ubuntu/x86_64/cuda-keyring_1.1-1_all.deb
sudo dpkg -i cuda-keyring_1.1-1_all.deb
sudo apt-get update
sudo apt-get install -y cuda-toolkit-12-8
rm cuda-keyring_1.1-1_all.deb

# Add CUDA to PATH for this session and future shells
export PATH=/usr/local/cuda-12.8/bin:$PATH
export LD_LIBRARY_PATH=/usr/local/cuda-12.8/lib64:${LD_LIBRARY_PATH:-}
echo 'export PATH=/usr/local/cuda-12.8/bin:$PATH' >> ~/.bashrc
echo 'export LD_LIBRARY_PATH=/usr/local/cuda-12.8/lib64:${LD_LIBRARY_PATH:-}' >> ~/.bashrc

echo "=== Step 2: Verify nvcc is available ==="
nvcc --version

echo "=== Step 3: Install build dependencies ==="
sudo apt-get install -y build-essential cmake git libcurl4-openssl-dev

echo "=== Step 4: Clone and build llama.cpp with CUDA ==="
cd ~
git clone https://github.com/ggerganov/llama.cpp.git
cd llama.cpp
mkdir build && cd build

# RTX 5090 = Blackwell architecture = sm_120
# Also include sm_89 (Ada/4090) and sm_90 (Hopper) for compatibility
cmake .. \
  -DGGML_CUDA=ON \
  -DCMAKE_CUDA_ARCHITECTURES="89;90;120" \
  -DGGML_CUDA_F16=ON \
  -DGGML_CUDA_FA_ALL_QUANTS=ON \
  -DCMAKE_BUILD_TYPE=Release

# Build with all CPU cores
cmake --build . --config Release -j$(nproc)

echo "=== Step 5: Verify CUDA build ==="
./bin/llama-server --version

echo ""
echo "============================================================"
echo "BUILD COMPLETE — llama-server with CUDA is at:"
echo "  ~/llama.cpp/build/bin/llama-server"
echo ""
echo "To start with a model:"
echo "  ~/llama.cpp/build/bin/llama-server \\"
echo "    -m /path/to/model.gguf \\"
echo "    --port 8080 --n-gpu-layers 99 \\"
echo "    --api-key YOUR_KEY \\"
echo "    --flash-attn"
echo "============================================================"
```

**Key flags explained:**
- `GGML_CUDA=ON` — Enables CUDA backend (tensor core acceleration)
- `CMAKE_CUDA_ARCHITECTURES="89;90;120"` — Targets RTX 5090 Blackwell (sm_120) plus Ada (sm_89) and Hopper (sm_90) for forward compatibility
- `GGML_CUDA_F16=ON` — Uses FP16 CUDA intrinsics for faster matrix math
- `GGML_CUDA_FA_ALL_QUANTS=ON` — Enables flash attention for all quantization types
- `--flash-attn` at runtime — Activates flash attention for faster inference and lower VRAM usage

### Path B: Download Windows CUDA Prebuilt (Simpler, Less Control)

Go to [llama.cpp releases](https://github.com/ggerganov/llama.cpp/releases) and download the latest `llama-bXXXX-bin-win-cuda-cu12.x-x64.zip`. Extract to `C:\AI_Tools\llama.cpp\`. This gives you CUDA without compiling, but may not target sm_120 (Blackwell) specifically.

**Recommendation:** Use **Path A** (WSL2 build) for maximum RTX 5090 performance. The server can listen on `0.0.0.0:8080` and Windows Python scripts connect to it via `http://localhost:8080` seamlessly through WSL2's network bridge.

---

## Model Recommendation: Qwen 2.5 32B Instruct

The original plan specified Llama-3-8B-Instruct (8B parameters). With 32GB VRAM on the RTX 5090, you can run something **4× larger** that will produce dramatically better EF briefing docs.

### Why Qwen 2.5 32B Instruct

Your EF briefing task is demanding: it requires following a complex multi-section template with Eisenhower matrices, EF challenge identification with direct quotes, support scaffolds, and strict markdown formatting. This is exactly where bigger models with strong instruction following shine.

| Model | Params | Quant | VRAM | Tokens/sec (est.) | Fit |
|-------|--------|-------|------|---------------------|-----|
| Llama-3-8B-Instruct Q8_0 | 8B | Q8_0 | ~9GB | ~80 t/s | Comfortable but quality limited |
| Qwen2.5-32B-Instruct Q6_K | 32B | Q6_K | ~26GB | ~25–35 t/s | **Best quality/VRAM balance** |
| Qwen2.5-32B-Instruct Q5_K_M | 32B | Q5_K_M | ~23GB | ~30–40 t/s | Good with more headroom for whisperx |
| Llama-3.3-70B IQ4_XS | 70B | IQ4_XS | ~34GB | Won't fit | Exceeds VRAM |

**Recommended: `Qwen2.5-32B-Instruct-Q6_K.gguf`**

Near-lossless quantization at Q6_K (~26GB) leaves ~6GB headroom. Since whisperx runs *before* the LLM in the pipeline (not simultaneously), VRAM sharing isn't a concern during inference. The quality jump from 8B → 32B for structured output tasks is substantial.

### Download Command (WSL2)

```bash
# Download Qwen2.5-32B-Instruct Q6_K (~26GB)
cd ~/llama.cpp
mkdir -p models
cd models
wget -c "https://huggingface.co/Qwen/Qwen2.5-32B-Instruct-GGUF/resolve/main/qwen2.5-32b-instruct-q6_k.gguf"
```

If you want a smaller fallback for testing:
```bash
# Qwen2.5-32B-Instruct Q5_K_M (~23GB) — slightly faster, more headroom
wget -c "https://huggingface.co/Qwen/Qwen2.5-32B-Instruct-GGUF/resolve/main/qwen2.5-32b-instruct-q5_k_m.gguf"
```

### Start Command (WSL2 CUDA)

```bash
~/llama.cpp/build/bin/llama-server \
  -m ~/llama.cpp/models/qwen2.5-32b-instruct-q6_k.gguf \
  --host 0.0.0.0 --port 8080 \
  --n-gpu-layers 99 \
  --flash-attn \
  --ctx-size 8192 \
  --api-key "$(cat /mnt/c/AI_Tools/.llm-api-key 2>/dev/null || echo changeme)" \
  --threads $(nproc)
```

**Update Doppler** with:
- `LLM_API_KEY` = whatever you set in `--api-key`
- `LLM_URL` = `http://localhost:8080/v1/chat/completions` (WSL2 → Windows localhost works natively)

---

## Remaining Tasks — Execution Plan

Everything below builds on what's already in `C:\AI_Tools\` with Doppler injection.

### Task A: Set Real Doppler Secrets

```powershell
# In Windows PowerShell
doppler secrets set LLM_API_KEY "your-chosen-secret-key" --project ai-tools --config dev
doppler secrets set HF_TOKEN "hf_your_huggingface_token" --project ai-tools --config dev
doppler secrets set HA_TOKEN "your-ha-long-lived-token" --project ai-tools --config dev
```

For `HF_TOKEN`: Create at https://huggingface.co/settings/tokens, then accept pyannote model terms at:
- https://huggingface.co/pyannote/speaker-diarization-3.1
- https://huggingface.co/pyannote/segmentation-3.0

### Task B: Write Core Python Scripts

All scripts use `config.py` which reads from Doppler-injected environment. Run with `doppler run -- python <script>`.

**Build order (each depends on the previous):**

1. **`meeting_assistant.py`** — Core pipeline: audio → whisperx transcription + diarization → LLM EF briefing → Obsidian markdown
   - Loads `Assistant.md` as system prompt
   - Uses `config.OBSIDIAN_VAULT_NAME` ("Danny Notes") in Obsidian URI
   - Error handling: moves failed files to `FAILED_PATH`
   - Rotating log handler → `LOG_DIR/processor.log`

2. **`watchman.py`** — Folder watcher for audio files (.wav, .m4a, .mp3, .flac, .ogg)
   - Monitors `WATCH_PATH` for new files
   - 2-second buffer for network transfer completion
   - Calls `meeting_assistant.process_audio()`

3. **`goblin_mode.py`** — Clipboard → LLM → clipboard task breakdown
   - Reads task from clipboard via pyperclip
   - Sends to LLM with ADHD micro-step system prompt
   - Writes result back to clipboard

4. **`add_to_plex.py`** — Plex Universal Watchlist
   - Uses `plexapi.server.PlexServer` (not `MyPlexAccount` — local server)
   - Searches and adds first result to watchlist

5. **`watchman_text.py`** — HA voice capture text routing
   - Watches `TextIncoming/` folder for `.txt` files
   - Routes directly to LLM (bypasses whisperx)
   - Writes EF briefing to `Obsidian Vault/Inbox/`

**Each script gets a matching `tests/test_<name>.py` written first (TDD).**

### Task C: NSSM Service Registration with Doppler

Since you're using Doppler for secrets, NSSM services need Doppler in the command chain. The simplest approach is wrapping with `doppler run`:

```powershell
# === LLM Server (runs in WSL2, registered as Windows service) ===
# Create a wrapper script first:
@"
wsl -d Ubuntu -- bash -c 'cd ~/llama.cpp && ./build/bin/llama-server -m models/qwen2.5-32b-instruct-q6_k.gguf --host 0.0.0.0 --port 8080 --n-gpu-layers 99 --flash-attn --ctx-size 8192 --api-key YOUR_LLM_API_KEY --threads 16'
"@ | Set-Content C:\AI_Tools\start-llm-server.cmd

nssm install "LLM-Server" "C:\AI_Tools\start-llm-server.cmd"
nssm set "LLM-Server" AppDirectory "C:\AI_Tools"
nssm set "LLM-Server" AppStdout "C:\AI_Tools\logs\llm-server.log"
nssm set "LLM-Server" AppStderr "C:\AI_Tools\logs\llm-server-err.log"

# === Audio Watchman ===
nssm install "AI-Watchman" "doppler" "run --project ai-tools --config dev -- python C:\AI_Tools\watchman.py"
nssm set "AI-Watchman" AppDirectory "C:\AI_Tools"
nssm set "AI-Watchman" AppStdout "C:\AI_Tools\logs\watchman-svc.log"
nssm set "AI-Watchman" AppStderr "C:\AI_Tools\logs\watchman-svc-err.log"

# === Text Watchman ===
nssm install "AI-Watchman-Text" "doppler" "run --project ai-tools --config dev -- python C:\AI_Tools\watchman_text.py"
nssm set "AI-Watchman-Text" AppDirectory "C:\AI_Tools"
nssm set "AI-Watchman-Text" AppStdout "C:\AI_Tools\logs\watchman-text-svc.log"
nssm set "AI-Watchman-Text" AppStderr "C:\AI_Tools\logs\watchman-text-svc-err.log"
```

### Task D: End-to-End Integration Test

1. Start llm-server (WSL2 CUDA) — verify API responds
2. Run all unit tests: `doppler run -- pytest tests/ -v`
3. Drop a short audio file into `Incoming/`
4. Monitor `logs/watchman.log` and `logs/processor.log`
5. Verify `Danny Notes/Meetings/<filename>.md` appears with full EF structure
6. Test Goblin Mode: copy task → `doppler run -- python goblin_mode.py` → paste result
7. Test Plex: `doppler run -- python add_to_plex.py "Dune Part Two"`

---

## RTX 5090 Optimization Checklist

Every component in the stack should leverage the RTX 5090's capabilities:

| Component | RTX 5090 Optimization | Status |
|-----------|----------------------|--------|
| **PyTorch** | 2.8.0+cu128 with CUDA 12.8 | ✅ Done |
| **WhisperX** | `device="cuda"`, `compute_type="float16"`, large-v3 model | ✅ Ready (code uses these) |
| **llama.cpp** | CUDA backend, sm_120 arch, flash attention, FP16 intrinsics | ❌ Currently Vulkan — **fix with WSL2 build** |
| **Model** | Qwen 2.5 32B Q6_K (~26GB fits in 32GB GDDR7) | ❌ Need to download |
| **Diarization** | pyannote runs on CUDA via whisperx | ✅ Ready (HF_TOKEN needed) |
| **Context size** | 8192 tokens (sufficient for briefings, memory-efficient) | Config ready |
| **Flash attention** | `--flash-attn` flag on llama-server | WSL2 build enables this |

---

## Execution Priority

```
┌─────────────────────────────────────────────────────────┐
│  PHASE 0: Fix Infrastructure (30 min)                   │
│  ├── Build llama.cpp CUDA in WSL2 (script above)        │
│  ├── Download Qwen 2.5 32B Q6_K model                  │
│  ├── Set real Doppler secrets (LLM_API_KEY, HF_TOKEN)   │
│  └── Verify llama-server CUDA + API key works           │
├─────────────────────────────────────────────────────────┤
│  PHASE 1: Core Pipeline (the whole point)               │
│  ├── meeting_assistant.py + tests                       │
│  ├── watchman.py + tests                                │
│  └── End-to-end: audio drop → Obsidian briefing doc     │
├─────────────────────────────────────────────────────────┤
│  PHASE 2: Supporting Scripts (parallel)                 │
│  ├── goblin_mode.py + tests                             │
│  ├── add_to_plex.py + tests                             │
│  └── watchman_text.py                                   │
├─────────────────────────────────────────────────────────┤
│  PHASE 3: Reliability                                   │
│  ├── NSSM services with Doppler wrapping                │
│  ├── AHK v2 goblin_mode.ahk                            │
│  └── Verify services survive reboot                     │
├─────────────────────────────────────────────────────────┤
│  PHASE 4: HA + Obsidian Polish                          │
│  ├── HA shell_command for Plex                          │
│  ├── CarPlay "Note to Lab" shortcut                     │
│  ├── ⚡ Brain Power Dashboard.md (Dataview queries)      │
│  └── Helen partner dashboard integration                │
└─────────────────────────────────────────────────────────┘
```

---

## Quick Reference

| Action | Command |
|--------|---------|
| Run any script with secrets | `doppler run --project ai-tools --config dev -- python <script>` |
| Run tests | `doppler run -- pytest tests/ -v` |
| Start LLM server (WSL2) | `~/llama.cpp/build/bin/llama-server -m ~/llama.cpp/models/qwen2.5-32b-instruct-q6_k.gguf --host 0.0.0.0 --port 8080 --n-gpu-layers 99 --flash-attn --api-key YOUR_KEY` |
| Test LLM API | `curl -H "Authorization: Bearer YOUR_KEY" -H "Content-Type: application/json" -d '{"model":"local","messages":[{"role":"user","content":"Hello"}]}' http://localhost:8080/v1/chat/completions` |
| Process specific audio | `doppler run -- python meeting_assistant.py path\to\audio.m4a` |
| Goblin Mode | `doppler run -- python goblin_mode.py` |
| Add to Plex | `doppler run -- python add_to_plex.py "Movie Title"` |
| Restart services | `nssm restart LLM-Server` / `nssm restart AI-Watchman` |
