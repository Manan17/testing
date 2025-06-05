import os
import pandas as pd

# --- Configuration ---
CSV_PATH = "data/all_benchmark_data.csv"

# --- Example kernel names ---
kernel_names = ["cross_entropy", "layer_norm", "softmax", "matmul"]

# --- Create dummy rows for each kernel_name ---
dummy_rows = []

for kernel in kernel_names:
    dummy_rows.append({
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
    })
    
    dummy_rows.append({
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
    })


if os.path.exists(CSV_PATH):
    os.remove(CSV_PATH)

# --- Create folder if needed and write new CSV ---
os.makedirs(os.path.dirname(CSV_PATH), exist_ok=True)
pd.DataFrame(dummy_rows).to_csv(CSV_PATH, index=False)