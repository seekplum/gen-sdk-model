import { MessageModules } from '@/constants';
import type { ContentMessageData } from '@/utils';
import * as printer from '@/utils/printer';

// 监听来自content-script的消息
chrome.runtime.onMessage.addListener(
    (
        request: ContentMessageData,
        sender: chrome.runtime.MessageSender,
        sendResponse: (response: any) => void,
    ) => {
        printer.consoleLog('收到来自content-script的消息:', request, sender, sendResponse);
        if (request.module === MessageModules.POPUP && request.data.cmd === 'popup.advanced') {
            // ff: opens up about:addons with openOptionsPage
            if (/Firefox/.test(navigator.userAgent)) {
                chrome.management.getSelf((extension) => {
                    chrome.tabs.create({ url: extension.optionsUrl });
                });
            } else {
                chrome.runtime.openOptionsPage();
            }
        }
        sendResponse(`我是后台，我已收到你的消息: ${JSON.stringify(request)}`);
    },
);

printer.consoleLog('This is background page!');

chrome.runtime.onInstalled.addListener(async () => {
    // // 移除所有数据
    // chrome.storage.local.clear();

    // 获取所有local存储的数据
    chrome.storage.local.get(null, (locals) => {
        printer.consoleLog('locals:', JSON.stringify(locals));
    });
});
export default undefined;
