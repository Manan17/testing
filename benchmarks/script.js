const referenceCommit = 'c1bdc24';
const benchmarkBase = 'https://raw.githubusercontent.com/linkedin/Liger-Kernel/refs/heads/gh-pages/benchmarks';

let allCommits = [];
let allDataByCommit = {};
let kernelMeta = {};

function toggleTheme() {
  const body = document.body;
  const themeButton = document.querySelector('.theme-toggle');
  const isDark = body.getAttribute('data-theme') === 'dark';
  body.setAttribute('data-theme', isDark ? 'light' : 'dark');
  themeButton.textContent = isDark ? '☀️' : '🌙';
}

function goToDetailedView() {
    const baseUrl = window.location.href.endsWith('/') ? window.location.href : window.location.href + '/';
    window.location.href = baseUrl + 'detailed';
}

async function fetchCommits() {
  const res = await fetch(`${benchmarkBase}/commits.txt`);
  const text = await res.text();
  return text.trim().split('\n');
}

async function fetchCSV(commit) {
  const res = await fetch(`${benchmarkBase}/${commit}/benchmark.csv`);
  if (!res.ok) return null;
  const text = await res.text();
  const rows = text.trim().split('\n');
  const headers = rows[0].split(',');
  const data = {};

  for (let i = 1; i < rows.length; i++) {
    const cols = rows[i].split(',');
    const row = Object.fromEntries(headers.map((h, idx) => [h.trim(), cols[idx]?.trim()]));
    if (row.kernel_provider !== 'liger') continue;

    const baseKey = `${row.kernel_name}_${row.kernel_operation_mode}_${row.metric_name}`;
    const kernelKey = `${baseKey}`;

    if (!data[kernelKey]) {
      data[kernelKey] = parseFloat(row.y_value_50);
      if (!kernelMeta[kernelKey]) {
        kernelMeta[kernelKey] = {
          x_label: row.x_label,
          x_value: row.x_value
        };
      }
    }
  }
  return data;
}

async function loadData() {
  document.getElementById('speedTable').innerHTML = 'Loading...';
  document.getElementById('memoryTable').innerHTML = 'Loading...';

  const count = document.getElementById('commitCount').value;
  allCommits = await fetchCommits();
  const selectedCommits = count === 'all' ? allCommits : allCommits.slice(-parseInt(count));

  allDataByCommit = {};
  kernelMeta = {};

  await Promise.all(selectedCommits.map(async (commit) => {
    const data = await fetchCSV(commit);
    if (data) allDataByCommit[commit] = data;
  }));

  renderTables();
}

function compareMetric(current, reference) {
  if (current == null || reference == null) return '';
  const delta = (current - reference) / reference;
  if (delta > 0.10) return 'red';
  if (delta < 0) return 'green';
  return '';
}

function renderTables() {
  const metricType = document.getElementById('metricType').value;
  const searchQuery = document.getElementById('kernelSearch').value.toLowerCase();
  const speedTable = document.getElementById('speedTable');
  const memoryTable = document.getElementById('memoryTable');

  speedTable.innerHTML = '';
  memoryTable.innerHTML = '';

  const commits = Object.keys(allDataByCommit);
  const reference = allDataByCommit[referenceCommit];

  function createTable(table, filterMetric) {
    let header = '<tr><th>Kernel</th><th>X</th><th>Reference</th>';
    for (const commit of commits) {
      if (commit === referenceCommit) continue;
      header += `<th>${commit}</th>`;
    }
    header += '</tr>';
    table.innerHTML += header;

    const allKeys = new Set();
    for (const commit of commits) {
      for (const k in allDataByCommit[commit]) {
        if (k.includes(`_${metricType}_${filterMetric}`)) allKeys.add(k);
      }
    }

    [...allKeys].forEach(kernelKey => {
      if (searchQuery && !kernelKey.toLowerCase().includes(searchQuery)) return;
      const refVal = reference?.[kernelKey];
      const meta = kernelMeta[kernelKey] || { x_label: '?', x_value: '?' };

      let row = `<tr><td>${kernelKey}</td><td>${meta.x_label}=${meta.x_value}</td><td>${refVal != null ? refVal.toFixed(2) : 'N/A'}</td>`;
      for (const commit of commits) {
        if (commit === referenceCommit) continue;
        const val = allDataByCommit[commit]?.[kernelKey];
        const cls = compareMetric(val, refVal);
        row += `<td class="${cls}">${val != null ? val.toFixed(2) : 'N/A'}</td>`;
      }
      row += '</tr>';
      table.innerHTML += row;
    });
  }

  createTable(memoryTable, 'memory');
  createTable(speedTable, 'speed');
}

window.onload = loadData;
  