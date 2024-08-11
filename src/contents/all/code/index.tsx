import { CopyTwoTone } from '@ant-design/icons';
import { Flex, Spin, Typography } from 'antd';
import classNames from 'classnames';
import { Observer } from 'mobx-react-lite';
import * as React from 'react';

import { type Platform } from '@/constants';

import { generate } from '../generate';
import styles from './index.scss';
import IndexVM from './index.vm';

function Code({ codes, elemRef }: { codes: string[]; elemRef: React.RefObject<HTMLDivElement> }) {
    const [tipsHeight, setTipsHeight] = React.useState(105);
    const [windowHeight, setWindowHeight] = React.useState(window.innerHeight);
    const handleCopy = React.useCallback(() => {
        navigator.clipboard.writeText(codes.join('\n'));
    }, [codes]);

    React.useEffect(() => {
        if (elemRef.current) {
            setTipsHeight(elemRef.current.clientHeight);
        }
    }, [elemRef]);
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
        <Flex gap={4} className={styles.codeBox} style={{ height: windowHeight - tipsHeight - 12 }}>
            <Flex vertical className={styles.numWrapper}>
                {Array.from({ length: codes.length }, (_, idx) => idx + 1).map((idx) => (
                    <Typography.Text
                        key={idx + 1}
                        className={classNames('forceNoWrap', styles.num)}
                    >
                        {idx + 1}
                    </Typography.Text>
                ))}
            </Flex>
            <Flex vertical className={styles.codeWrapper}>
                <div className={styles.copyWrapper}>
                    <CopyTwoTone onClick={handleCopy} className={styles.copy} />
                </div>
                {codes.map((line, idx) => {
                    return (
                        <div key={idx} className={styles.code}>
                            {line}
                        </div>
                    );
                })}
            </Flex>
        </Flex>
    );
}

function ReadOnlyCode({
    platform,
    response,
    elemRef,
}: {
    platform: Platform;
    response: string;
    elemRef: React.RefObject<HTMLDivElement>;
}) {
    const vm = React.useMemo(() => new IndexVM(), []);
    return (
        <Observer>
            {() =>
                vm.initialized && !!vm.config ? (
                    <Code codes={generate(platform, response, vm.config)} elemRef={elemRef} />
                ) : (
                    <Spin />
                )
            }
        </Observer>
    );
}

export default ReadOnlyCode;
