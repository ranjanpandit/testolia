export function generateErrorCSV(errors) {
  const headers = "row,error\n";
  const rows = errors
    .map(e => `${e.row},"${e.error.replace(/"/g, '""')}"`)
    .join("\n");

  return headers + rows;
}
