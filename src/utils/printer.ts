import { CRX_NAME } from '@/constants';

export function consoleLog(...args: any[]): void {
    console.log(`[${CRX_NAME}]`, ...args);
}

export function consoleError(...args: any[]): void {
    console.error(`[${CRX_NAME}]`, ...args);
}

export function consoleInfo(...args: any[]): void {
    console.info(`[${CRX_NAME}]`, ...args);
}
