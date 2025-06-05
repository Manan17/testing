import pandas as pd

url = "https://raw.githubusercontent.com/Manan17/testing/refs/heads/main/data/all_benchmark_data.csv"
df = pd.read_csv(url)

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
updated_df.head()