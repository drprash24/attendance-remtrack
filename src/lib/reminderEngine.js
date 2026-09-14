// Fires the reminder sequence described in the spec:
// 1) a short audio ping (~2s)
// 2) vibration (~3s), overlapping with an on-screen takeover
// 3) the on-screen takeover stays until the user picks one of three actions
//
// NOTE ON WEB LIMITS: this works reliably while the app tab/window is open
// (foreground). Browsers/OS will not let a website force a takeover once the
// app is closed or backgrounded — real "can't ignore it" behavior needs the
// native Capacitor build (planned as a v2 upgrade, see README).

let audioCtx = null

function beep(durationMs = 2000) {
  try {
    audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)()
    const osc = audioCtx.createOscillator()
    const gain = audioCtx.createGain()
    osc.type = 'sine'
    osc.frequency.value = 880
    gain.gain.setValueAtTime(0.001, audioCtx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.2, audioCtx.currentTime + 0.05)
    osc.connect(gain)
    gain.connect(audioCtx.destination)
    osc.start()
    osc.stop(audioCtx.currentTime + durationMs / 1000)
  } catch (e) {
    // AudioContext may be blocked until a user gesture; fail silently.
  }
}

function vibrate(pattern = [3000]) {
  if (navigator.vibrate) navigator.vibrate(pattern)
}

// triggers ping then vibration; caller is responsible for rendering the
// blocking on-screen component (see components/ReminderOverlay.jsx)
export function fireReminder() {
  beep(2000)
  setTimeout(() => vibrate([3000]), 2000)
}

export function stopReminder() {
  if (navigator.vibrate) navigator.vibrate(0)
}
