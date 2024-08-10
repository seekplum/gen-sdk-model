import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router-dom';

import * as printer from '@/utils/printer';

import App from './App';

import './index.scss';

const container = document.createElement('div');
document.body?.appendChild(container) || document.documentElement?.append(container);
const root = createRoot(container);
root.render(
    <HashRouter>
        <App />
    </HashRouter>,
);

// 接收来自后台的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    const tabName = sender.tab ? `content-script(${sender.tab.url})` : 'popup或者background';
    printer.consoleLog(`收到来自 ${tabName} 的消息:`, request);
    if (request.cmd === 'update_font_size') {
        const ele = document.createElement('style');
        ele.innerHTML = `* {font-size: ${request.size}px !important;}`;
        document.head.append(ele);
    } else {
        sendResponse(`我收到你的消息了: ${JSON.stringify(request)}`);
    }
});
