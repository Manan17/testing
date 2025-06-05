import os
import subprocess
import pandas as pd

# --- Configuration ---
GITHUB_USERNAME = "Manan17"
REPO_NAME = "testing"
BRANCH_NAME = "gh-pages"
CSV_PATH = "data/all_benchmark_data.csv"
GITHUB_TOKEN = "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"
CLONE_DIR = "repo_clone"

if os.path.exists(CLONE_DIR):
    subprocess.run(["rm", "-rf", CLONE_DIR])

repo_url = f"https://{GITHUB_USERNAME}:{GITHUB_TOKEN}@github.com/{GITHUB_USERNAME}/{REPO_NAME}.git"
subprocess.run(["git", "clone", "--branch", BRANCH_NAME, repo_url, CLONE_DIR], check=True)

# --- Load the CSV from the repo ---
csv_full_path = os.path.join(CLONE_DIR, CSV_PATH)
df = pd.read_csv(csv_full_path)

kernel_names = df['kernel_name'].unique().tolist()

# Prepare dummy_metadata for each kernel_name
dummy_metadata = {}

for kernel in kernel_names:
    dummy_metadata[kernel] = [
        {
            "kernel_name": kernel,
            "kernel_provider": "liger",
            "kernel_operation_mode": "dummy_mode",
            "metric_name": "speed",
            "metric_unit": "ms",
            "x_name": "batch_size",
            "x_label": "Batch Size",
            "x_value": -1,
            "y_value_50": -1,
            "y_value_20": -1,
            "y_value_80": -1,
            "extra_benchmark_config_str": "dummy_config",
            "gpu_name": "dummy_gpu",
            "timestamp": "2025-01-01 00:00:00",
            "liger_version": "0.0.0"
        },
        {
            "kernel_name": kernel,
            "kernel_provider": "huggingface",
            "kernel_operation_mode": "dummy_mode",
            "metric_name": "",
            "metric_unit": "ms",
            "x_name": "batch_size",
            "x_label": "Batch Size",
            "x_value": -1,
            "y_value_50": -1,
            "y_value_20": -1,
            "y_value_80": -1,
            "extra_benchmark_config_str": "dummy_config",
            "gpu_name": "dummy_gpu",
            "timestamp": "2025-01-01 00:00:00",
            "liger_version": "0.0.0"
        }
    ]

# Final output rows
new_rows = []
seen_kernels = set()

# Insert dummy rows before first occurrence of each kernel_name
for _, row in df.iterrows():
    kernel = row["kernel_name"]

    if kernel not in seen_kernels:
        if kernel in dummy_metadata:
            new_rows.extend(dummy_metadata[kernel])
        seen_kernels.add(kernel)

    new_rows.append(row.to_dict())

# Write updated DataFrame
updated_df = pd.DataFrame(new_rows)
updated_df.to_csv(csv_full_path, index=False)
subprocess.run(["git", "-C", CLONE_DIR, "config", "user.email", "shahmanan170602@gmail.com"], check=True)
subprocess.run(["git", "-C", CLONE_DIR, "config", "user.name", "Manan17"], check=True)
subprocess.run(["git", "-C", CLONE_DIR, "add", CSV_PATH])
subprocess.run(["git", "-C", CLONE_DIR, "commit", "-m", "Add dummy metadata rows per kernel_name"])
subprocess.run(["git", "-C", CLONE_DIR, "push", "origin", BRANCH_NAME])