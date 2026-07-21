# 🚕 RouteMind AI

**Interactive Reinforcement Learning Simulation — Q-Learning on the Taxi-v3 Environment**

An end-to-end RL project pairing a trained Q-Learning agent with a real-time, browser-based dashboard for visualizing decision-making, state transitions, and learned value functions.

<p align="left">
  <img src="https://raw.githubusercontent.com/agrawalanshika/Routemind-AI/main/Demo.gif" alt="RouteMind AI Demo" width="900"/>
</p>

---

## 📖 Overview

RouteMind AI trains a **tabular Q-Learning agent** to solve OpenAI Gymnasium's `Taxi-v3` environment — picking up a passenger and dropping them at the correct destination in the fewest possible steps. The trained policy is served through a **Flask REST API** and visualized in an **interactive web dashboard** that renders the environment grid, live statistics, and a **Q-value heatmap** for interpreting the agent's learned behavior in real time.

The project is split into two independent parts:

| Component | Purpose |
|---|---|
| 🧠 **Training** (`RL.ipynb`) | Trains the Q-Learning agent, evaluates it against a random baseline, and exports the learned policy as `q_table.npy` |
| 🌐 **Simulation App** (`app.py` + `index.html` / `style.css` / `script.js`) | Serves the trained policy over a REST API and renders it as an interactive, step-by-step or auto-run simulation in the browser |

---

## ✨ Key Features

- **Q-Learning agent** trained from scratch on `Taxi-v3` (500 states, 6 actions)
- **Trained-vs-random baseline comparison** — reward, steps, and success rate
- **Hyperparameter study** on learning rate (α) and its effect on convergence
- **Interactive dashboard** with Step, Auto Run / Pause, Reset, and adjustable simulation speed
- **Real-time 5×5 grid visualization** of taxi position, passenger, and destination
- **Q-value heatmap** rendering the state-value function `V(s) = maxₐ Q(s, a)` directly on the grid
- **Live episode statistics**: current action, state ID, taxi position, passenger status, reward, total reward, step count, and episode status
- **Episode-complete overlay** summarizing total reward and steps taken

---

## 🧠 How It Works

### 1. Training (offline, in `RL.ipynb`)

The agent learns via the standard **Q-Learning update rule**:

```
Q(s, a) ← Q(s, a) + α [ r + γ · maxₐ' Q(s', a') − Q(s, a) ]
```

- **Policy:** ε-greedy, with ε decaying from `1.0 → 0.01` over training
- **Learning rate (α):** 0.7
- **Discount factor (γ):** 0.95
- **Episodes:** 8,000 (200 max steps each)
- The resulting Q-table is evaluated over 200 episodes and saved to `q_table.npy`

### 2. Serving (`app.py`)

A lightweight Flask server loads `q_table.npy` and exposes it through a small REST API that the frontend polls to drive the simulation (see [API Reference](#-api-reference) below).

### 3. Visualization (`index.html`, `style.css`, `script.js`)

The frontend decodes each Gymnasium `Taxi-v3` state integer into `(taxi_row, taxi_col, passenger_location, destination)`, renders it onto a 5×5 grid, and overlays a color-coded heatmap of the agent's learned state values — so you can *see* which parts of the grid the agent considers valuable, not just watch it move.

---

## 📊 Results

The trained agent was benchmarked against a random-action baseline over 200 evaluation episodes:

| Metric | Trained Agent | Random Agent |
|---|---|---|
| Mean Reward | ✅ Significantly higher | ❌ Frequently negative / times out |
| Avg. Steps to Complete | ✅ Near-optimal | ❌ Much higher / often fails |
| Success Rate | ✅ Consistently high | ❌ Low |

A learning-rate study (α = 0.1 vs α = 0.7) also confirmed that higher α values converge faster on this environment, at the cost of noisier early training.

<p align="left">
  <img src="https://github.com/user-attachments/assets/6db5d6b4-335f-4298-826f-8cacdbd657d3" alt="Training convergence curve" width="700"/>
</p>

<p align="left">
  <img src="https://github.com/user-attachments/assets/7d7af0d3-a476-45fc-bf9b-44dae0a393a0" alt="Trained vs random agent comparison" width="800"/>
</p>

*(Full metrics, plots, and hyperparameter comparisons are in `RL.ipynb`.)*

---

## 🛠️ Tech Stack

**Machine Learning**
- Python, NumPy
- Gymnasium (`Taxi-v3`)

**Backend**
- Flask, Flask-CORS

**Frontend**
- HTML5, CSS3, vanilla JavaScript (no framework — fetch-based REST calls)

---

## 📂 Project Structure

```
RouteMind-AI/
├── RL.ipynb          # Training notebook: Q-learning, evaluation, plots
├── app.py            # Flask backend serving the trained policy via REST API
├── q_table.npy        # Trained Q-table (500 states × 6 actions)
├── index.html          # Dashboard markup (landing + simulation pages)
├── style.css            # Dashboard styling and animations
├── script.js              # Dashboard logic: state decoding, rendering, API calls
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- Python 3.9+

### 1. Clone the repository

```bash
git clone https://github.com/agrawalanshika/RouteMind-AI.git
cd RouteMind-AI
```

### 2. Install backend dependencies

```bash
pip install flask flask-cors gymnasium numpy
```

### 3. Run the backend

```bash
python app.py
```

The API will start at **`http://127.0.0.1:5000`**.

### 4. Launch the dashboard

Open `index.html` directly in your browser, then click **Start Simulation**.

- **⚡ Step** — advance the agent one action at a time
- **▶ Auto Run / ⏸ Pause** — let the agent run continuously at an adjustable speed
- **⟲ Reset** — start a new episode
- Watch the **grid heatmap**, **live stats**, and **episode summary overlay** update in real time

> Optionally, retrain the agent yourself by running `RL.ipynb` end-to-end — it will regenerate `q_table.npy` for the backend to serve.

---

## 🔌 API Reference

The frontend communicates with the Flask backend via three endpoints:

| Method | Endpoint | Description | Response |
|---|---|---|---|
| `GET` | `/reset` | Resets the environment and starts a new episode | `{ "state": <int> }` |
| `GET` | `/step` | Takes the agent's greedy action for the current state | `{ "action": <int>, "reward": <float>, "next_state": <int>, "done": <bool> }` |
| `GET` | `/qvalues_map` | Returns the state-value estimate for each of the 25 grid cells | `{ "values": [<float> × 25] }` |

State integers are decoded client-side into `(row, col, passenger, destination)` following the standard `Taxi-v3` state encoding.

---

## 💡 What This Project Demonstrates

- Practical, from-scratch implementation of **tabular Q-Learning**
- Rigorous evaluation methodology: baseline comparison, hyperparameter sensitivity, reward distribution analysis
- Integration of an **ML model with a production-style REST API**
- Building an **explainable AI interface** — turning a Q-table into an intuitive, interactive visualization
- End-to-end ownership: data/environment → training → serving → frontend UX

---

## 🔮 Future Improvements

- [ ] Swap tabular Q-Learning for a Deep Q-Network (DQN) to generalize to larger/continuous state spaces
- [ ] Add live training visualization (train in-browser or stream metrics via WebSocket)
- [ ] Deploy the backend (e.g., Render/Railway) and host the frontend (e.g., GitHub Pages) for a live public demo
- [ ] Add unit tests for the Flask API and state-decoding logic

---

## 👩 Author 
### Anshika Agrawal

If you found this project interesting, consider giving it a ⭐!
