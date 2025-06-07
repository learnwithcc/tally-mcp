const fs = require('fs');

function formatReport(reportPath) {
  const report = JSON.parse(fs.readFileSync(reportPath, 'utf-8'));

  const {
    requests,
    latency,
    throughput,
    errors,
  } = report;

  let output = '### Performance Test Results\n\n';
  output += '| Metric | Value |\n';
  output += '| --- | --- |\n';
  output += `| Requests/s | ${requests.mean.toFixed(2)} |\n`;
  output += `| Latency (ms) | ${latency.mean.toFixed(2)} |\n`;
  output += `| Throughput (bytes/s) | ${throughput.mean.toFixed(2)} |\n`;
  output += `| Errors | ${errors} |\n`;

  return output;
}

if (require.main === module) {
  const reportPath = process.argv[2];
  if (!reportPath) {
    console.error('Please provide a path to the performance report');
    process.exit(1);
  }
  const formattedReport = formatReport(reportPath);
  console.log(formattedReport);
}

module.exports = { formatReport }; 