import data from './data.json' assert {
  type: 'json'
};
const items = data;
let articles = [];
let items2 = [];

function sortArticle(a, b) {
  'use strict';
  if (a.articleNumber < b.articleNumber) {
    return -1;
  }
  if (a.articleNumber > b.articleNumber) {
    return 1;
  }
  return 0;
}

function generateReport(sortOrder) {
  'use strict';
  let tbody = document.querySelector('tbody');
  let i = 0;
  tbody.textContent = '';
  while (i < items.length) {
    let index = articles.indexOf(String(items[i].articleNumber));
    if (articles.includes(String(items[i].articleNumber))) {
      items2.push(items[i]);
    }
    if (index !== -1) {
      articles.splice(index, 1);
    }
    i += 1;
  }
  i = 0;
  while (i < articles.length) {
    items2.push({
      articleDescription: '',
      articleNumber: articles[i],
      department: '',
      layout: ''
    });
    i += 1;
  }
  items2.sort(sortArticle);
  i = 0;
  while (i < items2.length) {
    let row = tbody.insertRow();
    let cell = row.insertCell();
    let text = document.createTextNode(items2[i].department);
    row.addEventListener('click', () => {
      let rows = tbody.querySelectorAll('tr');
      let i = 0;
      while (i < rows.length) {
        rows[i].classList.remove('selected');
        i += 1;
      }
      row.classList.toggle('selected');
      JsBarcode('.barcode', row.querySelector('td:nth-child(3)').textContent, {
        displayValue: false
      });
    });
    cell.appendChild(text);
    cell = row.insertCell();
    text = document.createTextNode(items2[i].layout);
    cell.appendChild(text);
    cell = row.insertCell();
    text = document.createTextNode(items2[i].articleNumber);
    cell.appendChild(text);
    cell = row.insertCell();
    text = document.createTextNode(items2[i].articleDescription);
    cell.appendChild(text);
    i += 1;
  }
}

async function startCamera() {
  'use strict';
  document.querySelector('.view').classList.add('hidden');
  document.querySelector('.view2').classList.remove('hidden');
  try {
    const video = document.querySelector('video');
    const media = await navigator.mediaDevices.getUserMedia({
      audio: false,
      video: {
        facingMode: 'environment'
      }
    });
    await navigator.wakeLock.request('screen');
    video.srcObject = media;
    video.play();
  } catch (error) {
    console.error(error);
  }
}

async function stopCamera() {
  'use strict';
  document.querySelector('.view').classList.remove('hidden');
  document.querySelector('.view2').classList.add('hidden');
  try {
    const video = document.querySelector('video');
    const tracks = await video.srcObject.getTracks();
    tracks.forEach((track) => track.stop());
    video.srcObject = null;
  } catch (error) {
    console.error(error);
  }
  generateReport();
}

function filterTexts(text) {
  'use strict';
  if (/^([0-9]{8}|[0-9]{11})$/.test(text) && !articles.includes(text)) {
    articles.push(text);
  }
}

async function importReport() {
  'use strict';
  let log = document.querySelector('.log');
  try {
    const textDetector = new TextDetector();
    const video = document.querySelector('video');
    const texts = await textDetector.detect(video);
    texts.forEach(text => filterTexts(text.rawValue));
    articles.sort();
    sessionStorage.setItem('articles', JSON.stringify(articles));
    log.textContent = `Total: ${articles.length}\n${articles.join('\n')}`;
  } catch (error) {
    log.textContent = error;
  }
}

function deleteReport() {
  'use strict';
  if (confirm('Delete report?')) {
    document.querySelector('tbody').textContent = '';
    document.querySelector('.barcode').textContent = '';
    document.querySelector('.log').textContent = 'Total: 0';
    articles = [];
    items2 = [];
    try {
      sessionStorage.clear();
    } catch (error) {
      console.error(error);
    }
  }
}

function setTestItems() {
  'use strict';
  if (confirm('Set items?')) {
    let i = 0;
    items2 = [];
    while (items2.length < 39) {
      if (items[i].department === 'Grocery') {
        items2.push(items[i]);
      }
      i += 1;
    }
    generateReport();
  }
}

function setItems() {
  'use strict';
  if (confirm('Set items?')) {
    let i = 0;
    items2 = [];
    while (i < items.length) {
      if (
        !items[i].articleDescription || !items[i].articleNumber ||
        !items[i].department || (/[^0-9]/).test(items[i].layout[0])
      ) {
        items2.push(items[i]);
      }
      i += 1;
    }
    generateReport();
  }
}

function removeRow() {
  'use strict';
  const row = document.querySelector('.selected');
  if (row) {
    row.parentElement.deleteRow(row.rowIndex - 1);
  }
}

function sortLayout(a, b) {
  'use strict';
  if (a.layout === '') {
    return 1;
  }
  if (b.layout === '') {
    return -1;
  }
  if (a.layout < b.layout) {
    return -1;
  }
  if (a.layout > b.layout) {
    return 1;
  }
  return 0;
}

function findNext() {
  'use strict';
  let row = document.querySelector('.selected');
  const sortedLayout = items2.sort(sortLayout);
  let next = false;
  let i = 0;
  const rows = document.querySelector('tbody').rows;
  if (!sortedLayout.length) {
    return;
  }
  if (row) {
    row = row.children[2].textContent;
    if (sortedLayout[sortedLayout.length - 1].articleNumber === row) {
      return;
    }
    next = true;
  } else {
    row = sortedLayout[0].articleNumber;
  }
  if (next) {
    while (i < sortedLayout.length) {
      if (sortedLayout[i].articleNumber === row) {
        row = sortedLayout[i + 1].articleNumber;
        break;
      }
      i += 1;
    }
  }
  i = 0;
  while (i < rows.length) {
    if (rows[i].children[2].textContent === row) {
      rows[i].click();
      document.querySelector('.selected').scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
      break;
    }
    i += 1;
  }
}

function main() {
  'use strict';
  let assistantButton = document.querySelector('.assistant-button');
  let photoButton = document.querySelector('.photo-button');
  let removeButton = document.querySelector('.remove-button');
  let deleteButton = document.querySelector('.delete-button');
  let textButton = document.querySelector('.text-button');
  let dataButton = document.querySelector('.data-button');
  let arrowButton = document.querySelector('.arrow-button');
  let documentButton = document.querySelector('.document-button');
  assistantButton.addEventListener('click', findNext);
  photoButton.addEventListener('click', startCamera);
  removeButton.addEventListener('click', removeRow);
  deleteButton.addEventListener('click', deleteReport);
  textButton.addEventListener('click', setTestItems);
  dataButton.addEventListener('click', setItems);
  arrowButton.addEventListener('click', stopCamera);
  documentButton.addEventListener('click', importReport);
  try {
    articles = JSON.parse(sessionStorage.getItem('articles')) || [];
  } catch (error) {
    console.error(error);
  }
  if (articles.length) {
    generateReport();
  }
}

main();
