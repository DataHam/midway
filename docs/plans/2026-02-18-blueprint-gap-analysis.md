claud# Blueprint Gap Analysis — Local AI Intelligence Stack
**Date:** 2026-02-18
**Status:** Pre-implementation audit

---

## Confirmed Architecture (Updated from Blueprint)

| Component | Confirmed Value |
|-----------|----------------|
| Transcription + Diarization | `whisperx` (replaces `faster-whisper` + fake `diarizen`) |
| LLM Backend | `llama.cpp` server — needs install |
| Home Assistant | `http://homeassistant:8123` / `192.168.88.135` |
| Plex Server | `http://192.168.88.100` (token in `.env` only) |
| iOS Connectivity | Unifi Enterprise Identity VPN + SMB share (Tailscale removed) |
| EF System Prompt | `Assistant.md` — provided, complete |

---

## Section 1 — Completeness Gaps

Items referenced in the blueprint that are missing or incomplete.

| Item | Where Referenced | Status | Proposed Fix |
|------|-----------------|--------|--------------|
| `goblin_mode.py` | `goblin_mode.ahk` | ❌ Not written | Write: reads clipboard via `pyperclip`, calls LLM at `localhost:8080`, returns 3–5 micro-steps, writes result back to clipboard |
| `add_to_plex.py` | `configuration.yaml` shell_command | ❌ Not written | Write: accepts title arg, uses `plexapi` with `PLEX_URL` + `PLEX_TOKEN` from `.env` to add to Universal Watchlist |
| `Assistant.md` | Code comment in `meeting_assistant.py` | ✅ Resolved — provided by user | Store at `C:\AI_Tools\Assistant.md`; load as system prompt in `get_ef_briefing()` |
| Diarization integration | `meeting_assistant.py` import block | ✅ Resolved — `whisperx` handles this natively | Rewrite `process_audio()` with `whisperx`; segments already include `segment["speaker"]` |
| Structured LLM prompt | `get_ef_briefing()` | ❌ 4-sentence placeholder | Load `Assistant.md` content as the system message; user content = speaker-labeled transcript |

---

## Section 2 — Technical Accuracy Issues

### Critical — Will break at install or first run

| Item | Blueprint Says | Reality | Fix |
|------|---------------|---------|-----|
| `diarizen` package | `pip install diarizen` | ✅ Resolved — does not exist on PyPI | Replaced by `whisperx` |
| `DiariZenPipeline` | `from diarizen.pipelines.inference import DiariZenPipeline` | ✅ Resolved — no such class | Replaced by `whisperx` pipeline |
| `WavLM-Large-s80` | Listed as diarization backbone | ✅ Resolved — non-standard name, unverifiable | `whisperx` uses `pyannote.audio` internally; no manual backbone selection needed |
| `faster-whisper` | Transcription engine | Superseded | Replaced by `whisperx` (same speed + adds word-level timestamps + diarization) |

### Medium — Logic/integration mismatch

| Item | Blueprint Says | Reality | Fix |
|------|---------------|---------|-----|
| HA voice capture | `notify` platform writes `voice_capture.txt` | `watchman.py` only monitors `.wav/.m4a/.mp3` — `.txt` never picked up | Write separate `watchman_text.py` for text-only inputs, bypassing Whisper entirely |
| AHK syntax | `^!g:: {` with curly braces | AHK v2 syntax — silent fail on AHK v1 | Confirm AHK v2 is installed; document the version requirement |
| 70B model on 32GB VRAM | "70B variant for deep reasoning" | Q8_0 70B ≈ 70GB; Q4_K_M ≈ 40GB — both exceed VRAM | Use 8B for local tasks; use Claude API for heavy reasoning if needed |

---

## Section 3 — Implementation Risk

### High Risk

| Risk | Description | Mitigation |
|------|------------|------------|
| HA placement | ✅ Resolved — `http://homeassistant:8123` on dedicated device at `192.168.88.135` | Store `HA_URL` in `.env` |
| llama.cpp not installed | Not yet on the workstation — blocks all LLM features | Download CUDA prebuilt binary from llama.cpp GitHub releases; download `Llama-3-8B-Instruct-Q8_0.gguf` (~8.5GB) |
| Docker/NVIDIA Container Toolkit | Listed in blueprint but no workload uses Docker | Remove from architecture or commit to containerizing — do not list infrastructure that isn't used |
| LLM server has no auth | `llama-server` on `:8080` with no API key | Add `--api-key` flag at startup; callers pass key from `.env` as `Authorization: Bearer` header |
| Process supervision | `cmd /k` windows — closing terminal kills service with no restart | Use NSSM to register `llama-server` and `watchman.py` as Windows services with auto-restart |

### Medium Risk

| Risk | Description | Mitigation |
|------|------------|------------|
| iOS → Windows file drop | Unifi Enterprise Identity VPN + SMB share — well-tested pattern | Setup: Windows SMB share with permissions; iOS Files app pointed to share; VPN profile on iPhone |
| No error handling | Failed processing silently dropped | `try/except` in `process_audio()`; move failed files to `failed/` subfolder; optionally notify via HA |
| No logging | Zero visibility into operations | Python `logging` with rotating file handler → `C:\AI_Tools\logs\` |
| Hardcoded paths | `C:\Users\Danny\...` everywhere | Centralize in `config.py` loading from `.env` |
| Obsidian URI reliability | `subprocess.run(['cmd', '/c', 'start', uri])` silently fails if Obsidian is closed | Check if `Obsidian.exe` process is running before attempting URI open |

---

## Architecture Changes from Blueprint

### Tailscale Removed
The blueprint listed Tailscale as the connectivity layer between Calgary lab and iOS devices.
**Replaced by:** Unifi Enterprise Identity VPN for all remote access. Remove Tailscale from dependency list, startup scripts, and network diagrams.

### AI Stack Updated

| Blueprint | Updated |
|-----------|---------|
| `faster-whisper` | `whisperx` |
| `diarizen` (fake) | `whisperx` (built-in via pyannote.audio) |
| `llama.cpp` | `llama.cpp` ✅ (same — but needs install) |

---

## Implementation Order

Based on dependencies and risk, recommended build sequence:

**Phase 1 — Infrastructure**
1. Install llama.cpp (CUDA build) + download Llama-3-8B-Instruct-Q8_0.gguf
2. Create `C:\AI_Tools\` directory structure
3. Create `config.py` + `.env` (all paths, URLs, keys)
4. Verify llama-server starts and responds to API calls

**Phase 2 — Core Audio Pipeline**
5. Rewrite `meeting_assistant.py` with `whisperx` + load `Assistant.md` as system prompt
6. Test end-to-end: drop audio file → get Obsidian briefing doc
7. Add logging + error handling + `failed/` folder

**Phase 3 — Supporting Scripts**
8. Write `goblin_mode.py`
9. Write `add_to_plex.py`
10. Test both scripts independently

**Phase 4 — Reliability**
11. Add `--api-key` to llama-server; update callers
12. Set up NSSM services for llama-server and watchman
13. Update `start_ai_stack.bat` or replace with NSSM

**Phase 5 — HA Integration**
14. Wire HA `shell_command` for Plex watchlist
15. Write `watchman_text.py` for HA voice capture text inputs
16. Test full HA → Python script flow

---

## Confirmed Dependency List

```
# pip install (Python)
whisperx
torch torchvision torchaudio   # CUDA 12.x build — must match RTX 5090 driver CUDA version
pyperclip
watchdog
requests
plexapi
python-dotenv

# Windows tools
llama.cpp (CUDA prebuilt binary — from GitHub releases)
NSSM (Non-Sucking Service Manager)
AutoHotkey v2
```

---

## Security Notes

- **Plex token** — store in `.env` as `PLEX_TOKEN`; never commit to git or include in code
- **LLM API key** — store in `.env` as `LLM_API_KEY`; pass to llama-server via `--api-key` flag
- **HA token** (if needed for API calls) — store in `.env` as `HA_TOKEN`
- Add `.env` to `.gitignore` when git is initialized
