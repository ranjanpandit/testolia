import csv from "csvtojson";

export async function parseCSV(file) {
  const text = await file.text();
  return csv().fromString(text);
}
