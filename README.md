# 🚕 RouteMind AI

RouteMind AI is an interactive reinforcement learning simulation based on the Taxi-v3 environment. It demonstrates how a Q-Learning agent learns to navigate, pick up passengers, and drop them at destinations while minimizing cost. The project includes a real-time web dashboard with visualization, controls, and a Q-value heatmap for interpretability.

<img align="left" width="800" height="600" alt="image" src="https://github.com/user-attachments/assets/dddcb393-f133-4f7d-a34e-85523a4afcd6" />

---


## 📌 Key Features

- Q-Learning agent trained on the Taxi-v3 environment  
- Interactive web dashboard for step-by-step and automatic simulation  
- Real-time grid visualization of the environment  
- Q-value heatmap to visualize the value function V(s) = maxₐ Q(s, a)  
- Episode statistics: reward, steps, state, action, and status  
- Simulation controls: Step, Auto Run, Pause, Reset, and Speed control  
- Clean and modern UI with smooth transitions  

---

## 🧠 Project Overview

- The agent uses **Q-Learning**, a model-free reinforcement learning algorithm, to learn an optimal policy for the Taxi-v3 environment.
- At each state, the agent selects the action with the highest Q-value (greedy policy).
- The backend serves the environment state and policy decisions through REST APIs.
- The frontend renders the environment grid, displays episode statistics, and visualizes the learned value function using a heatmap.
- The heatmap represents the state-value function V(s) = maxₐ Q(s, a), allowing users to interpret how the agent evaluates different positions in the grid.

---

## 🛠️ Tech Stack

- **Python**, **Flask**, **Flask-CORS**  
- **Gymnasium (Taxi-v3)**, **NumPy**  
- **HTML**, **CSS**, **JavaScript**  

---

## 🧪 Training

The Q-learning agent was trained in a separate Jupyter/Colab notebook which contains the full training loop, experiments, and Q-table generation process.

<img align="left" width="700" height="500" alt="image" src="https://github.com/user-attachments/assets/6db5d6b4-335f-4298-826f-8cacdbd657d3" />


<img align="left" width="800" height="600" alt="image" src="https://github.com/user-attachments/assets/7d7af0d3-a476-45fc-bf9b-44dae0a393a0" />

---

## 🚀 How to Run the Project

### 1️⃣ Backend Setup

Install dependencies:

```bash
pip install flask flask-cors gymnasium numpy
```

Run the Flask server:
``` python app.py ```

The backend will start at:
http://127.0.0.1:5000

### 2️⃣ Frontend Setup

Open index.html in your browser

Click Start Simulation to launch the dashboard

Use Step, Auto Run, Pause, and Reset to control the simulation

---

## 📂 Project Structure
├── app.py
├── q_table.npy
├── index.html
├── style.css
├── script.js

---

## 📊 What This Project Demonstrates

Practical implementation of Reinforcement Learning using Q-Learning

Integration of an ML backend with an interactive web frontend

Real-time environment simulation and visualization

Interpretation of learned policies using a Q-value heatmap

Building explainable and user-friendly AI systems

---
