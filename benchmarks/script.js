let allCommitData = [];
let currentPage = 1;
const commitsPerPage = 8;
document.getElementById('detailedPageButton').addEventListener('click', () => {
    const baseUrl = window.location.href.endsWith('/') ? window.location.href : window.location.href + '/';
    window.location.href = baseUrl + 'detailed';
  });
  
  
document.addEventListener("DOMContentLoaded", () => {
  fetch('https://raw.githubusercontent.com/linkedin/Liger-Kernel/gh-pages/benchmarks/commits.txt')
    .then(response => response.text())
    .then(text => {
      const commitHashes = text.trim().split('\n');
      loadAllBenchmarks(commitHashes);
    });

  document.getElementById('prevPage').addEventListener('click', () => changePage(-1));
  document.getElementById('nextPage').addEventListener('click', () => changePage(1));
});

async function loadAllBenchmarks(commitHashes) {
  for (const commit of commitHashes) {
    if (commit === "b6ed735"){
        continue;
    }
    const csvUrl = `https://raw.githubusercontent.com/linkedin/Liger-Kernel/gh-pages/benchmarks/${commit}/benchmark.csv`;

    try {
      const result = await fetchCsv(csvUrl);
      const data = result.data.filter(d => d.kernel_provider && d.metric_name && d.y_value_50 != null);

      const speedData = data.filter(d => d.metric_name === 'speed');
      const memoryData = data.filter(d => d.metric_name === 'memory');

      const ligerSpeed = average(speedData.filter(d => d.kernel_provider === 'liger'));
      const othersSpeed = average(speedData.filter(d => d.kernel_provider !== 'liger'));

      const ligerMemory = average(memoryData.filter(d => d.kernel_provider === 'liger'));
      const othersMemory = average(memoryData.filter(d => d.kernel_provider !== 'liger'));

      allCommitData.push({
        commit,
        ligerSpeed,
        othersSpeed,
        ligerMemory,
        othersMemory
      });
    } catch (error) {
      console.error(`Failed to load ${csvUrl}`, error);
    }
    
  }

  renderCurrentPage();
}

function fetchCsv(url) {
  return new Promise((resolve, reject) => {
    Papa.parse(url, {
      download: true,
      header: true,
      dynamicTyping: true,
      complete: results => resolve(results),
      error: err => reject(err)
    });
  });
}

function average(data) {
  if (data.length === 0) return null;
  return data.reduce((sum, d) => sum + d.y_value_50, 0) / data.length;
}

function renderCurrentPage() {
  const totalPages = Math.ceil(allCommitData.length / commitsPerPage);
  const startIdx = (currentPage - 1) * commitsPerPage;
  const endIdx = startIdx + commitsPerPage;
  const currentData = allCommitData.slice(startIdx, endIdx);

  document.getElementById('pageInfo').textContent = `Page ${currentPage} of ${totalPages}`;

  const commits = currentData.map(d => d.commit.slice(0, 7));

  const ligerSpeeds = currentData.map(d => d.ligerSpeed);
  const othersSpeeds = currentData.map(d => d.othersSpeed);

  const ligerMemories = currentData.map(d => d.ligerMemory);
  const othersMemories = currentData.map(d => d.othersMemory);

  renderGroupedBarChart('Memory Performance (Lower is Better in MB)', 'memoryHistoryChart', commits, ligerMemories, othersMemories);
  renderGroupedBarChart('Speed Performance (Lower is Better in ms)', 'speedHistoryChart', commits, ligerSpeeds, othersSpeeds);
}

let memoryChart, speedChart;

function renderGroupedBarChart(title, canvasId, labels, ligerData, othersData) {
  const ctx = document.getElementById(canvasId).getContext('2d');

  if (canvasId === 'memoryHistoryChart' && memoryChart) {
    memoryChart.destroy();
  }
  if (canvasId === 'speedHistoryChart' && speedChart) {
    speedChart.destroy();
  }

  const chart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [
        {
          label: 'Liger',
          data: ligerData,
          backgroundColor: 'orange'
        },
        {
          label: 'Others',
          data: othersData,
          backgroundColor: 'steelblue'
        }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        title: { display: true, text: title }
      },
      scales: {
        y: { beginAtZero: true },
        x: { ticks: { maxRotation: 0, minRotation: 0, autoSkip: false } }
      }
    }
  });

  if (canvasId === 'memoryHistoryChart') memoryChart = chart;
  if (canvasId === 'speedHistoryChart') speedChart = chart;
}

function changePage(direction) {
  const totalPages = Math.ceil(allCommitData.length / commitsPerPage);
  currentPage += direction;

  if (currentPage < 1) currentPage = 1;
  if (currentPage > totalPages) currentPage = totalPages;

  renderCurrentPage();
}
