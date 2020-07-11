let db;
const request = indexedDB.open("budgetTracker", 1);

request.onupgradeneeded = function(event) {
   // create object store called "pending" and set autoIncrement to true
  const db = event.target.result;
  db.createObjectStore("pending", { autoIncrement: true });
};

request.onsuccess = function(event) {
  db = event.target.result;
  console.log(navigator)
  if (navigator.onLine) {
    checkDatabase();
  }
};

request.onerror = function(event) {
  console.log("Woops! " + event.target.errorCode);
};

function saveRecord(record) {
  //save data
  db.transaction(["pending"], "readwrite").objectStore("pending").add(record);
}

function checkDatabase() {
  const offlineData = db.transaction(["pending"], "readwrite").objectStore("pending").getAll();
  console.log(offlineData);
  offlineData.onsuccess = function() {
    if (offlineData.result.length > 0) {
      fetch("/api/transaction/bulk", {
        method: "POST",
        body: JSON.stringify(offlineData.result),
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json"
        }
      })
      .then(response => response.json())
      .then(() => {
        //clear pending data
        db.transaction(["pending"], "readwrite").objectStore("pending").clear();
      });
    }
  };
}

// listen for app coming back online
window.addEventListener("online", checkDatabase);
