import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router-dom';

import { MessageModules } from '@/constants';
import type { ContentMessageData } from '@/utils';
import * as printer from '@/utils/printer';

import App from './App';

import './index.scss';

printer.consoleLog(`Current page's url must be prefixed with https://github.com`);

// 注意，必须设置了run_at=document_start 此段代码才会生效
sendMessageToBackground({
    module: MessageModules.BACKGROUND,
    data: {
        message: 'hello-from-content-script',
        description: 'hello background!',
    },
} as ContentMessageData);

const container = document.createElement('div');
document.body.append(container);
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

// 主动发送消息给后台
function sendMessageToBackground(message: ContentMessageData) {
    chrome.runtime.sendMessage(message, (response) => {
        printer.consoleLog('收到来自后台的回复:', response);
    });
}
