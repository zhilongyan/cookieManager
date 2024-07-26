chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "copyCookies") {
    chrome.runtime.sendMessage({action: "getCookies", domain: request.domain}, (response) => {
      const cookies = response.cookies;
      console.log(cookies, '<<<<获取cookies')
      cookies.forEach(cookie => {
        document.cookie = `${cookie.name}=${cookie.value}; path=/`;
      });
      alert(`复制成功了${cookies.length}个！`)
    });
  }
});