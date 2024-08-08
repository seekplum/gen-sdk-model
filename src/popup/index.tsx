import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router-dom';

import App from './App';

import './App.scss';

const container = document.querySelector('#root');
if (!container) {
    throw new Error('popup root is empty!!!');
}
const root = createRoot(container);
root.render(
    <HashRouter>
        <App />
    </HashRouter>,
);
