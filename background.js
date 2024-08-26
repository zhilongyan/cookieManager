// 后台脚本,用于处理跨域Cookie操作
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "getCookies") {
    chrome.cookies.getAll({domain: request.domain}, (cookies) => {
      sendResponse({cookies: cookies});
    });
    return true;  // 保持消息通道开放，以便异步发送响应
  }
});