# Scale 1 — Bits & Variables

> *One switch. ON or OFF. Our entire digital world is built on this simple concept.*

<div style="text-align: center; margin: 2.5rem 0; padding: 3rem 1rem; background: var(--bg-elevated); border-radius: var(--radius-lg); border: 1px solid var(--border); box-shadow: 0 10px 30px rgba(0,0,0,0.05);">
  <svg id="bulb" width="120" height="180" viewBox="0 0 100 150" style="transition: all 0.3s ease; fill: #d1d5db; stroke: #374151; stroke-width: 4;">
    <path d="M50 10 C25 10 10 30 10 55 C10 75 25 90 35 110 L65 110 C75 90 90 75 90 55 C90 30 75 10 50 10 Z" />
    <rect x="35" y="110" width="30" height="20" fill="#9ca3af" stroke="#374151" />
    <path d="M40 130 L60 130 L55 145 L45 145 Z" fill="#4b5563" stroke="#374151" />
  </svg>
  <br>
  <button onclick="
    let b = document.getElementById('bulb');
    let l = document.getElementById('bulb-label');
    let s = document.getElementById('bulb-state');
    if(b.style.fill === 'rgb(253, 224, 71)' || b.style.fill === '#fde047') { 
      b.style.fill = '#d1d5db'; 
      b.style.filter = 'none';
      l.innerText = 'OFF';
      s.innerText = '0';
      s.style.color = 'var(--text-muted)';
    } else { 
      b.style.fill = '#fde047'; 
      b.style.filter = 'drop-shadow(0 0 25px rgba(253,224,71,0.8))';
      l.innerText = 'ON';
      s.innerText = '1';
      s.style.color = 'var(--teal)';
    }
  " style="margin-top: 2rem; padding: 12px 32px; font-size: 1.1rem; cursor: pointer; border-radius: 40px; border: 2px solid rgba(0,0,0,0.25); background: transparent; font-weight: 700; color: rgba(0,0,0,0.7); font-family: var(--font-sans); transition: all 0.2s;" onmouseover="this.style.background='rgba(0,0,0,0.05)'" onmouseout="this.style.background='transparent'">
    Toggle Switch
  </button>
  <div style="margin-top: 1.5rem; font-family: var(--font-mono); font-size: 1.1rem; color: var(--text-secondary);">
    Circuit State: <span id="bulb-label" style="font-weight: bold;">OFF</span> 
    <span style="opacity: 0.5; margin: 0 8px;">|</span>
    Binary: <span id="bulb-state" style="font-weight: 900; font-size: 1.3rem; color: var(--text-muted);">0</span>
  </div>
</div>

You just interacted with a program. One variable holding one of two states (0 or 1), changing the entire flow of the visual output.

## 📖 What Is a Bit?

A bit is the smallest possible piece of information. It has exactly two states: **0 or 1**. Off or on. False or true.

Your button demo has one bit: the variable `isOn`. It can only be `false` (0) or `true` (1).

When you clicked the button, you flipped a bit. That single flip changed the color of the box. Scale that up: your phone screen has **25 million pixels**, each controlled by bits that flip millions of times per second.

---

## 📦 What Is a Variable?

A variable is a **named container** for a value that can change.

```js
let score = 0;        // a number
let name = "Maya";    // text (a "string")
let isOn = false;     // a boolean (true/false)
```

Think of a variable like a sticky note on a whiteboard:
- The name on the sticky note (`score`, `name`, `isOn`) never changes.
- The value written *on* the sticky note can be erased and rewritten anytime.

---

## 🛠 Guided Build: The Reaction Timer

Build a simple reaction timer. Press a button when the box turns green. See how fast you are.

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <title>Reaction Timer</title>
  <style>
    body { font-family: sans-serif; display:flex; flex-direction:column; align-items:center; padding:40px; gap:20px; background:#0a0e1a; color:#e8ecf4; }
    #target { width:160px; height:160px; background:#1a2040; border-radius:12px; transition:background 0.2s; cursor:pointer; border:2px solid #2a3060; }
    #target.green { background:#4ade80; border-color:#4ade80; }
    #result { font-size:1.4rem; font-weight:700; color:#22d1c3; }
    button { padding:12px 28px; background:#22d1c3; color:#0a0e1a; border:none; border-radius:8px; font-size:1rem; font-weight:700; cursor:pointer; }
  </style>
</head>
<body>
  <h1>Reaction Timer</h1>
  <p>Wait for green, then click the box as fast as you can.</p>
  <div id="target"></div>
  <div id="result">–</div>
  <button onclick="startGame()">Start</button>

  <script>
    let startTime = 0;
    let waiting = false;

    function startGame() {
      const target = document.getElementById('target');
      const result = document.getElementById('result');
      
      target.classList.remove('green');
      result.textContent = 'Wait for it…';
      waiting = false;

      // Random delay between 1 and 4 seconds
      let delay = 1000 + Math.random() * 3000;

      setTimeout(() => {
        target.classList.add('green');
        startTime = Date.now();
        waiting = true;
      }, delay);
    }

    document.getElementById('target').addEventListener('click', () => {
      if (!waiting) return;
      let elapsed = Date.now() - startTime;
      waiting = false;
      document.getElementById('target').classList.remove('green');
      document.getElementById('result').textContent = `${elapsed}ms — ${elapsed < 200 ? '⚡ Lightning!' : elapsed < 350 ? '👍 Good' : '🐢 Slow...'}`;
    });
  </script>
</body>
</html>
```

**Save as `reaction.html`, open in browser, press Start.**

Variables used:
- `startTime` — stores *when* the box turned green
- `waiting` — a boolean that tracks game state
- `elapsed` — stores how many milliseconds passed

Three variables. One complete game.

---

## 🎨 Remix Challenge

Pick one:
1. **Change the color** — make it turn blue instead of green. What variable controls color?
2. **Change the label** — instead of "Lightning / Good / Slow," write your own three tier labels.
3. **Add a score** — add a variable called `attempts` that counts up each time you click, and display it.

You have the code. Pull one thread and see what unravels.

---

## Scale Comparison

> **One bit** (`true`/`false`) → **One variable** → **One interaction** → **A reaction timer game**

Next scale: what happens when the program has to *choose* between more than two things?
