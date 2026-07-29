# Android Audio Playback Debug Report

## Pipeline Trace (Current Implementation vs. Expected HTML5 Flow)

| Step | Status | Notes |
| :--- | :--- | :--- |
| **User taps Start Call** | SUCCESS | Triggered synchronously in `page.tsx`. |
| **AudioContext unlock()** | SUCCESS | `audioContext.resume()` succeeds and WebAudio is unlocked. |
| **fetch(/api/tts)** | SUCCESS | Request fires with correct headers. |
| **audio/mpeg received** | SUCCESS | Returns 200 OK with valid MP3 binary stream. |
| **Blob created** | FAILED | Code incorrectly attempts to use `AudioContext.decodeAudioData(arrayBuffer)` instead of creating a Blob. |
| **URL.createObjectURL()** | SKIPPED | Never reached due to WebAudio implementation. |
| **new Audio()** | FAILED | Code uses `audioContext.createBufferSource()` instead of HTML5 Audio. |
| **audio.play()** | FAILED | `source.start()` is called instead. |
| **speaker** | FAILED | Silence on Android. |

## Root Cause Analysis
The current implementation relies on WebAudio API (`AudioContext.decodeAudioData`) to decode the MP3 stream from ElevenLabs. 
While this works on Desktop Chrome (which is very forgiving), **Android Chrome's WebAudio decoder strictly rejects chunked or streaming MP3s** (like those returned by ElevenLabs) that lack full WAV/MP3 duration headers, failing silently or throwing a decoding error.

Furthermore, if we simply switch to `new Audio(URL.createObjectURL(blob))` asynchronously *after* the fetch resolves, Android Chrome will block playback with a `NotAllowedError` because the `new Audio()` element was created outside of the synchronous user gesture.

## Exact Fix Required
We must pivot from `AudioContext` to a **single, globally reused HTML5 `<audio>` element**.
1. Create `const audio = new Audio()` once.
2. Inside `unlock()` (synchronous user gesture), set a silent base64 `src` and call `audio.play()`. This permanently whitelists the element for autoplay.
3. In `processQueue()`, create the Blob, assign `audio.src = URL.createObjectURL(blob)`, and `await audio.play()`.

**Exact File:** `src/lib/tts/elevenlabs-tts.ts`
**Lines to modify:** 
- Line 5-8: Replace `audioContext` state with a single `audioElement`.
- Line 24 (`unlock`): Call `this.audioElement.play()` on a silent data URI.
- Line 102 (`processQueue`): Replace WebAudio decoding with `Blob` -> `URL.createObjectURL` -> `this.audioElement.src` -> `this.audioElement.play()`.
