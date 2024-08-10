import { Flex, Spin, Typography } from 'antd';
import classNames from 'classnames';
import { Observer } from 'mobx-react-lite';
import * as React from 'react';

import type { Platform } from '@/constants';
import * as printer from '@/utils/printer';

import { generate } from '../generate';
import styles from './index.scss';
import IndexVM from './index.vm';

function Code({ codes, elemRef }: { codes: string[]; elemRef: React.RefObject<HTMLDivElement> }) {
    const [expanded, setExpanded] = React.useState(false);
    const [tipsHeight, setTipsHeight] = React.useState(105);
    const docHeight = document.body?.scrollHeight || document.documentElement?.scrollHeight || 800;
    React.useEffect(() => {
        if (elemRef.current) {
            setTipsHeight(elemRef.current.clientHeight);
        }
    }, [elemRef]);
    printer.consoleLog(codes.join('\n'));
    return (
        <Flex className={styles.codeWrapper} style={{ height: docHeight - tipsHeight - 12 }}>
            <Typography.Paragraph
                className={classNames('forceWrap', styles.code)}
                copyable={{ text: codes.join('\n'), tabIndex: 0 }}
                ellipsis={{
                    rows: 30,
                    expandable: 'collapsible',
                    expanded,
                    onExpand: (_, info) => setExpanded(info.expanded),
                    symbol: '展开',
                }}
            >
                {codes.join('\n')}
            </Typography.Paragraph>
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
