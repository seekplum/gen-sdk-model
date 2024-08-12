import { CopyTwoTone } from '@ant-design/icons';
import { message, Spin } from 'antd';
import { Observer } from 'mobx-react-lite';
import * as React from 'react';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { vs2015 } from 'react-syntax-highlighter/dist/esm/styles/hljs';

import { type Platform } from '@/constants';

import { generate, generateByDocument } from '../generate';
import styles from './index.scss';
import IndexVM from './index.vm';

interface BaseProps {
    tipsHeight: number;
    language: string;
}

export interface ReadOnlyCodeProps extends BaseProps {
    platform: Platform;
    response: string;
}

export interface DocumentCodeProps extends BaseProps {
    platform: Platform;
}

interface HighlighterCodeProps extends BaseProps {
    codes: string[];
}

function HighlighterCode(props: HighlighterCodeProps) {
    const { codes, tipsHeight, language } = props;
    const rawCode = codes.join('\n');
    const [windowHeight, setWindowHeight] = React.useState(window.innerHeight);

    const [messageApi, contextHolder] = message.useMessage();

    const handleCopy = React.useCallback(() => {
        navigator.clipboard.writeText(rawCode);
        messageApi.open({
            type: 'success',
            content: '复制代码成功',
        });
    }, [rawCode]);

    React.useEffect(() => {
        function handleResize() {
            setWindowHeight(window.innerHeight);
        }

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);
    return (
        <div className={styles.codeBox}>
            <div className={styles.copyWrapper}>
                <div className={styles.copyContainer}>
                    {contextHolder}
                    <CopyTwoTone onClick={handleCopy} className={styles.copy} />
                </div>
            </div>
            <SyntaxHighlighter
                showLineNumbers={true}
                language={language}
                style={vs2015}
                customStyle={{ height: windowHeight - tipsHeight - 48 }}
            >
                {rawCode}
            </SyntaxHighlighter>
        </div>
    );
}

export function ReadOnlyCode(props: ReadOnlyCodeProps) {
    const vm = React.useMemo(() => new IndexVM(), []);
    const { platform, response, ...extra } = props;
    return (
        <Observer>
            {() =>
                vm.initialized && !!vm.config ? (
                    <HighlighterCode {...extra} codes={generate(platform, response, vm.config)} />
                ) : (
                    <Spin />
                )
            }
        </Observer>
    );
}

export function DocumentCode(props: DocumentCodeProps) {
    const vm = React.useMemo(() => new IndexVM(), []);
    const { platform, ...extra } = props;
    return (
        <Observer>
            {() =>
                vm.initialized && !!vm.config ? (
                    <HighlighterCode {...extra} codes={generateByDocument(platform, vm.config)} />
                ) : (
                    <Spin />
                )
            }
        </Observer>
    );
}
