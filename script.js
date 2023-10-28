let db;
const dataList = document.getElementById('dataList');
const form = document.getElementById('crud-form');

window.onload = function () {
    let request = window.indexedDB.open("formDB", 1);

    request.onerror = function (event) {
        console.log("Database error: " + event.target.errorCode);
    };

    request.onsuccess = function (event) {
        db = event.target.result;
        displayData();
    };

    request.onupgradeneeded = function (event) {
        let db = event.target.result;
        let objectStore = db.createObjectStore("data", { keyPath: "nim" });
        console.log("Database setup complete");
    };

    form.addEventListener('submit', addData);
};

function addData(e) {
    e.preventDefault();
    let nim = document.getElementById('nim').value;
    let nama = document.getElementById('nama').value;
    let newData = { nim: nim, nama: nama };

    let transaction = db.transaction(["data"], "readwrite");
    let objectStore = transaction.objectStore("data");

    let request = objectStore.add(newData);
    request.onsuccess = function (event) {
        displayData();
        document.getElementById('nim').value = '';
        document.getElementById('nama').value = '';
    };

    transaction.oncomplete = function (event) {
        console.log("Transaction completed: database modification finished.");
    };

    transaction.onerror = function (event) {
        console.log("Transaction not opened due to error. Duplicate items not allowed.");
    };
}

function displayData() {
    while (dataList.firstChild) {
        dataList.removeChild(dataList.firstChild);
    }

    let objectStore = db.transaction("data").objectStore("data");
    objectStore.openCursor().onsuccess = function (event) {
        let cursor = event.target.result;
        if (cursor) {
            const listItem = document.createElement('li');
            listItem.className = 'list-group-item';
            listItem.appendChild(document.createTextNode(`NIM: ${cursor.value.nim}, Nama: ${cursor.value.nama}`));
            dataList.appendChild(listItem);

            const deleteButton = document.createElement('button');
            deleteButton.className = 'btn btn-danger btn-sm float-right delete';
            deleteButton.appendChild(document.createTextNode('Delete'));
            deleteButton.onclick = deleteItem.bind(null, cursor.value.nim);
            listItem.appendChild(deleteButton);

            cursor.continue();
        } else {
            console.log("No more entries");
        }
    };
}

function deleteItem(nim) {
    let transaction = db.transaction(["data"], "readwrite");
    let objectStore = transaction.objectStore("data");
    let request = objectStore.delete(nim);
    request.onsuccess = function (event) {
        displayData();
        console.log("Data deleted");
    };
}
