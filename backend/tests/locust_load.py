import random
import os
import time
from locust import HttpUser, task, between, LoadTestShape

# --- CONFIGURATION ---
# Set the prefix for your API. Defaulting to /api as per backend/api/main.py
API_PREFIX = "/api"
# Token provided via environment variable
AUTH_TOKEN = os.getenv("LOCUST_AUTH_TOKEN", "")
# Target a specific bot if provided
TARGET_BOT_ID = os.getenv("TARGET_BOT_ID", "")

class PersonaUser(HttpUser):
    """
    Simulates a user browsing personas, viewing details, and chatting.
    """
    wait_time = between(1, 4)
    active_bots = []

    def on_start(self):
        """Initial setup for each simulated user."""
        self.headers = {}
        if AUTH_TOKEN:
            self.headers["Authorization"] = f"Bearer {AUTH_TOKEN}"
        
        # Pre-fetch some bots to make subsequent tasks more realistic
        self.browse_explore()

    @task(5)
    def browse_explore(self):
        """Users frequently browse the 'Explore' page."""
        with self.client.get(f"{API_PREFIX}/bots/explore", catch_response=True) as response:
            if response.status_code == 200:
                try:
                    data = response.json()
                    if isinstance(data, list) and len(data) > 0:
                        # Extract bot IDs for use in other tasks
                        self.active_bots = [bot["id"] for bot in data if "id" in bot]
                except Exception:
                    pass
            elif response.status_code == 0:
                response.failure("Network error or connection refused")

    @task(3)
    def view_bot_details(self):
        """Users click into a specific persona's profile."""
        bot_id = TARGET_BOT_ID or (random.choice(self.active_bots) if self.active_bots else None)
        if not bot_id:
            return
        
        self.client.get(f"{API_PREFIX}/bots/{bot_id}", headers=self.headers, name=f"{API_PREFIX}/bots/[id]")

    @task(5)
    def chat_with_persona(self):
        """Users send messages to personas (using the provided token)."""
        bot_id = TARGET_BOT_ID or (random.choice(self.active_bots) if self.active_bots else None)
        if not bot_id:
            return
        
        payload = {
            "message": random.choice([
                "Hi! Can you tell me more about your experience?",
                "What's the best advice you've ever received?",
                "How do you stay productive?",
                "I'm looking for a mentor in AI, any tips?",
                "What should I focus on for my career growth?"
            ])
        }
        
        self.client.post(
            f"{API_PREFIX}/chat/{bot_id}", 
            json=payload, 
            headers=self.headers,
            name=f"{API_PREFIX}/chat/[id]"
        )

    @task(1)
    def check_health(self):
        """Occasional health check to monitor base system latency."""
        self.client.get("/health")


class StepLoadShape(LoadTestShape):
    """
    A step load shape to simulate the requested ramp-up:
    - Start: 100 users, 10/s
    - Step 1: 500 users, 25/s
    - Step 2: 1,000 users, 50/s
    - Step 3: 5,000 users, 100/s
    """
    
    # Duration for each step in seconds
    step_duration = 60
    
    steps = [
        {"users": 100, "spawn_rate": 10},
        {"users": 500, "spawn_rate": 25},
        {"users": 1000, "spawn_rate": 50},
        {"users": 5000, "spawn_rate": 100},
    ]

    def tick(self):
        run_time = self.get_run_time()
        
        # Determine which step we are in
        step_index = int(run_time // self.step_duration)
        
        if step_index < len(self.steps):
            return (self.steps[step_index]["users"], self.steps[step_index]["spawn_rate"])
        
        # After all steps are done, maintain the last user count (5000)
        return (self.steps[-1]["users"], self.steps[-1]["spawn_rate"])