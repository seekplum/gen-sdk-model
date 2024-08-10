import type { Manifest } from 'webextension-polyfill';

import pkg from '../package.json';
import { __DEV__ } from '../server/utils/constants';

const manifest: Manifest.WebExtensionManifest = {
    name: pkg.displayName,
    version: pkg.version,
    description: pkg.description,
    manifest_version: 3,
    minimum_chrome_version: pkg.browserslist.split(' ')[2],
    permissions: ['storage', 'scripting'],
    content_security_policy: {
        extension_pages: "script-src 'self' http://localhost; object-src 'self';",
    },
    web_accessible_resources: [
        {
            matches: ['https://op.jinritemai.com/*'],
            resources: ['js/inject.js', 'js/injected.js', 'icons/*', 'images/*', 'fonts/*'],
        },
    ],
    background: {
        service_worker: 'js/background.js',
    },
    content_scripts: [
        {
            matches: ['https://op.jinritemai.com/docs/api-docs/*/*'],
            css: ['css/all.css'],
            run_at: 'document_start',
            js: ['js/injected.js', 'js/all.js'],
        },
    ],
    commands: {
        'Ctrl+B': {
            suggested_key: {
                default: 'Ctrl+B',
                mac: 'Command+B',
            },
            description: 'Ctrl+B',
        },
    },
    action: {
        default_popup: 'popup.html',
        default_icon: {
            '16': 'icons/extension-icon-x16.png',
            '32': 'icons/extension-icon-x32.png',
            '48': 'icons/extension-icon-x48.png',
            '128': 'icons/extension-icon-x128.png',
        },
    },
    host_permissions: ['http://*/*', 'https://*/*'],
    options_ui: {
        page: 'options.html',
        open_in_tab: true,
    },
    icons: {
        '16': 'icons/extension-icon-x16.png',
        '32': 'icons/extension-icon-x32.png',
        '48': 'icons/extension-icon-x48.png',
        '128': 'icons/extension-icon-x128.png',
    },
};
if (!__DEV__) {
    manifest.content_scripts?.unshift({
        matches: ['<all_urls>'],
        js: ['js/vendor.js'],
    });
}

export default manifest;
