from flask import Flask, jsonify
from flask_cors import CORS
import gymnasium as gym
import numpy as np

app = Flask(__name__)
CORS(app)  # ✅ Allow frontend to call backend

# Load the trained Q-table
q_table = np.load("q_table.npy")

# Create environment
env = gym.make("Taxi-v3")
state, info = env.reset()

@app.route("/", methods=["GET"])
def home():
    return jsonify({
        "message": "Taxi RL API is running",
        "routes": ["/reset", "/step", "/qvalues_map"]
    })

@app.route("/reset", methods=["GET"])
def reset_env():
    global state
    state, info = env.reset()
    return jsonify({
        "state": int(state)
    })

@app.route("/step", methods=["GET"])
def step_env():
    global state

    action = int(np.argmax(q_table[state]))
    next_state, reward, terminated, truncated, info = env.step(action)
    done = terminated or truncated
    state = next_state

    return jsonify({
        "action": action,
        "next_state": int(next_state),
        "reward": float(reward),
        "done": bool(done)
    })

# =========================
# 🔥 Q-VALUE HEATMAP PART
# =========================

def compute_qvalue_map(passenger, dest):
    values = []
    for row in range(5):
        for col in range(5):
            state_id = ((row * 5 + col) * 5 + passenger) * 4 + dest
            v = float(q_table[state_id].max())  # V(s) = max_a Q(s,a)
            values.append(v)
    return values

@app.route("/qvalues_map", methods=["GET"])
def qvalues_map():
    global state

    # Decode current state to get passenger & destination
    s = state
    dest = s % 4
    s //= 4
    passenger = s % 5

    values = compute_qvalue_map(passenger, dest)

    return jsonify({
        "values": values
    })

# =========================

if __name__ == "__main__":
    app.run(debug=True)
