document.addEventListener("DOMContentLoaded", () => {
    fetch('https://raw.githubusercontent.com/linkedin/Liger-Kernel/gh-pages/benchmarks/commits.txt')
      .then(response => response.text())
      .then(text => {
        const commitHashes = text.trim().split('\n');
        loadDetailedTable(commitHashes);
      });
  });
  
  async function loadDetailedTable(commitHashes) {
    const tableData = [];
  
    for (const commit of commitHashes) {
      const csvUrl = `https://raw.githubusercontent.com/linkedin/Liger-Kernel/gh-pages/benchmarks/${commit}/benchmark.csv`;
  
      try {
        const result = await fetchCsv(csvUrl);
        const data = result.data.filter(d => d.kernel_provider && d.metric_name && d.y_value_50 != null);
  
        const ligerRows = data.filter(d => d.kernel_provider === 'liger');
        const otherRows = data.filter(d => d.kernel_provider !== 'liger');
  
        ligerRows.forEach(ligerRow => {
          const match = otherRows.find(otherRow => (
            ligerRow.kernel_name === otherRow.kernel_name &&
            ligerRow.kernel_operation_mode === otherRow.kernel_operation_mode &&
            ligerRow.extra_benchmark_config_str === otherRow.extra_benchmark_config_str &&
            ligerRow.gpu_name === otherRow.gpu_name &&
            ligerRow.metric_name === otherRow.metric_name &&
            ligerRow.x_value === otherRow.x_value
          ));
  
          if (match) {
            const absDiff = Math.abs(match.y_value_50 - ligerRow.y_value_50);
  
            tableData.push({
              commit: commit.slice(0, 7),
              kernelName: ligerRow.kernel_name,
              operationMode: ligerRow.kernel_operation_mode,
              metric: ligerRow.metric_name,
              batchSize: ligerRow.x_value,
              ligerValue: ligerRow.y_value_50.toFixed(2),
              otherValue: match.y_value_50.toFixed(2),
              difference: absDiff.toFixed(2)
            });
          }
        });
      } catch (error) {
        console.error(`Failed to load ${csvUrl}`, error);
      }
    }
  
    populateDataTable(tableData);
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
  
  function populateDataTable(data) {
    const tableBody = document.querySelector('#benchmarkTable tbody');
    tableBody.innerHTML = '';
  
    data.forEach(row => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${row.commit}</td>
        <td>${row.kernelName}</td>
        <td>${row.operationMode}</td>
        <td>${row.metric}</td>
        <td>${row.batchSize}</td>
        <td>${row.ligerValue}</td>
        <td>${row.otherValue}</td>
        <td>${row.difference}</td>
      `;
      tableBody.appendChild(tr);
    });
  
    $('#benchmarkTable').DataTable({
      pageLength: 25
    });
  }
  