let chart;

document.addEventListener("DOMContentLoaded", async () => {
  const commits = await fetchCommitHashes();
  populateCommitDropdown(commits);

  document.getElementById("commit").addEventListener("change", (e) => {
    loadCSV(e.target.value);
  });

  if (commits.length > 0) {
    loadCSV(commits[0]); // Load first commit by default
  }
});

async function fetchCommitHashes() {
  try {
    const response = await fetch(
      "https://api.github.com/repos/Manan17/testing/contents/benchmarks?ref=gh-pages"
    );
    const data = await response.json();
    return data.filter(item => item.type === "dir").map(dir => dir.name);
  } catch (err) {
    console.error("Failed to fetch commit hashes:", err);
    return [];
  }
}

function populateCommitDropdown(commits) {
  const select = document.getElementById("commit");
  select.innerHTML = "";
  commits.forEach(commit => {
    const opt = document.createElement("option");
    opt.value = opt.textContent = commit;
    select.appendChild(opt);
  });
}

function loadCSV(commit) {
  Papa.parse(`https://raw.githubusercontent.com/Manan17/testing/refs/heads/gh-pages/benchmarks/${commit}/benchmark.csv`, {
    download: true,
    header: true,
    dynamicTyping: true,
    complete: (result) => {
      const data = result.data.filter(d => d.kernel_provider);
      setupControls(data);
      renderChart(data);
    },
    error: (err) => {
      alert("Failed to load CSV for commit: " + commit);
      console.error(err);
    }
  });
}

function setupControls(data) {
  const kernelSet = new Set(data.map(d => d.kernel_name));
  const metricSet = new Set(data.map(d => d.metric_name));
  const modeSet = new Set(data.map(d => d.kernel_operation_mode));

  const kernelSelect = document.getElementById("kernel");
  const metricSelect = document.getElementById("metric");
  const modeSelect = document.getElementById("mode");

  kernelSelect.innerHTML = "";
  metricSelect.innerHTML = "";
  modeSelect.innerHTML = "";

  kernelSet.forEach(k => {
    const opt = document.createElement("option");
    opt.value = opt.textContent = k;
    kernelSelect.appendChild(opt);
  });

  metricSet.forEach(m => {
    const opt = document.createElement("option");
    opt.value = opt.textContent = m;
    metricSelect.appendChild(opt);
  });

  modeSet.forEach(m => {
    const opt = document.createElement("option");
    opt.value = opt.textContent = m;
    modeSelect.appendChild(opt);
  });

  kernelSelect.addEventListener("change", () => renderChart(data));
  metricSelect.addEventListener("change", () => renderChart(data));
  modeSelect.addEventListener("change", () => renderChart(data));
}

function renderChart(data) {
  const kernel = document.getElementById("kernel").value;
  const metric = document.getElementById("metric").value;
  const mode = document.getElementById("mode").value;

  const filtered = data.filter(
    d =>
      d.kernel_name === kernel &&
      d.metric_name === metric &&
      d.kernel_operation_mode === mode
  );

  const batchSizes = [...new Set(filtered.map(d => d.x_value))].sort((a, b) => a - b);
  const providers = [...new Set(filtered.map(d => d.kernel_provider))];

  const datasets = providers.map(provider => {
    const values = batchSizes.map(bs => {
      const row = filtered.find(d => d.kernel_provider === provider && d.x_value === bs);
      return row ? row.y_value_50 : null;
    });

    return {
      label: provider,
      data: values,
      borderColor: provider === "liger" ? "orange" : "steelblue",
      backgroundColor: "transparent",
      tension: 0.2,
      pointRadius: 4,
      pointHoverRadius: 6,
    };
  });

  const ctx = document.getElementById("benchmarkChart").getContext("2d");
  if (chart) chart.destroy();

  chart = new Chart(ctx, {
    type: "line",
    data: {
      labels: batchSizes,
      datasets: datasets,
    },
    options: {
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: `Benchmark - ${kernel} - ${metric} (${mode})`,
        },
        legend: {
          position: "top",
        }
      },
      scales: {
        x: {
          title: { display: true, text: "Batch Size (B)" },
        },
        y: {
          title: { display: true, text: metric },
          beginAtZero: true
        }
      }
    }
  });
}
