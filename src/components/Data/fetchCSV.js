import Papa from "papaparse";

async function fetchCSV(url) {
  return new Promise((resolve, reject) => {
    Papa.parse(url, {
      download: true,
      header: true,
      complete: function (results) {
        resolve(results.data); //for readabilty
      },
      error: function (error) {
        reject(error);
      },
    });
  });
}

export default fetchCSV;
