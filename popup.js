// 弹出窗口的JavaScript逻辑
document.addEventListener('DOMContentLoaded', function() {
  const domainInput = document.getElementById('domainInput');
  const domainList = document.getElementById('domainList');
  const copyButton = document.getElementById('copyButton');
  const historyContainer = document.getElementById('historyContainer');
  let domains = [];
  let history = [];

  function updateDatalist() {
    domainList.innerHTML = '';
    const value = domainInput.value.toLowerCase();
    const filteredDomains = domains.filter(domain => domain.toLowerCase().includes(value));
    filteredDomains.forEach(domain => {
      const item = document.createElement('div');
      item.className = 'datalist-item';
      item.textContent = domain;
      item.onclick = function() {
        domainInput.value = domain;
        domainList.style.display = 'none';
      };
      domainList.appendChild(item);
    });
    domainList.style.display = filteredDomains.length > 0 ? 'block' : 'none';
  }

  function updateHistory() {
    historyContainer.innerHTML = '';
    history.forEach(domain => {
      const item = document.createElement('div');
      item.className = 'history-item';
      item.textContent = domain;
      item.onclick = function(e) {
        if (e.target !== item.querySelector('.delete')) {
          copyCookies(domain);
        }
      };
      const deleteButton = document.createElement('span');
      deleteButton.className = 'delete';
      deleteButton.textContent = '×';
      deleteButton.onclick = function(e) {
        e.stopPropagation();
        history = history.filter(d => d !== domain);
        chrome.storage.local.set({history: history});
        updateHistory();
      };
      item.appendChild(deleteButton);
      historyContainer.appendChild(item);
    });
  }

  function copyCookies(domain) {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {action: "copyCookies", domain: domain});
      if (!history.includes(domain)) {
        history.unshift(domain);
        if (history.length > 5) {
          history.pop();
        }
        chrome.storage.local.set({history: history});
        updateHistory();
      }
    });
  }

  domainInput.addEventListener('input', updateDatalist);
  domainInput.addEventListener('focus', updateDatalist);

  document.addEventListener('click', function(e) {
    if (e.target !== domainInput && e.target !== domainList) {
      domainList.style.display = 'none';
    }
  });

  chrome.cookies.getAllCookieStores(function(cookieStores) {
    const allDomains = new Set();
    let processedStores = 0;

    cookieStores.forEach(store => {
      chrome.cookies.getAll({storeId: store.id}, function(cookies) {
        cookies.forEach(cookie => allDomains.add(cookie.domain));
        processedStores++;

        if (processedStores === cookieStores.length) {
          domains = Array.from(allDomains);
          updateDatalist();
        }
      });
    });
  });

  copyButton.addEventListener('click', function() {
    const selectedDomain = domainInput.value;
    if (selectedDomain) {
      copyCookies(selectedDomain);
    } else {
      alert('Please select or enter a domain');
    }
  });

  chrome.storage.local.get('history', function(result) {
    history = result.history || [];
    updateHistory();
  });
});