import { Flex, Spin, Typography } from 'antd';
import { Observer } from 'mobx-react-lite';
import * as React from 'react';

import styles from './App.scss';
import AppVM from './App.vm';

const App: React.FC = () => {
    const vm = React.useMemo(() => new AppVM(), []);
    return (
        <Observer>
            {() =>
                vm.isCollapsed ? null : (
                    <Flex id={`${styles.plumChromeExtensionBox}`} vertical gap={4} align="center">
                        {vm.initialized ? (
                            <>
                                <Flex gap={8} style={{ margin: '0 16px' }}>
                                    <Typography.Title style={{ fontSize: 18 }}>
                                        插件页面内容
                                    </Typography.Title>
                                </Flex>
                                <Flex vertical gap={4}>
                                    <Typography.Text>正文内容1</Typography.Text>
                                    <Typography.Text>正文内容2</Typography.Text>
                                    <Typography.Text>正文内容3</Typography.Text>
                                </Flex>
                            </>
                        ) : (
                            <Spin />
                        )}
                    </Flex>
                )
            }
        </Observer>
    );
};

export default App;
