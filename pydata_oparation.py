import pandas as pd

data = {
    "task": ["Exam Form", "Project Report", "Read Notes", "Presentation"],
    "days_left": [1, 3, 7, 2],
    "estimated_hours": [1, 10, 4, 6],
    "past_delay_rate": [0.1, 0.7, 0.3, 0.5]  # user history
}

df = pd.DataFrame(data)