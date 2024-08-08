import { Button, Flex, Spin, Switch, Typography } from 'antd';
import { Observer } from 'mobx-react-lite';
import * as React from 'react';

import { VERSION } from '@/utils';

import OptionsSettingsVM from './App.vm';

import './App.scss';

const App: React.FC = () => {
    const vm = React.useMemo(() => new OptionsSettingsVM(), []);

    return (
        <Observer>
            {() => (
                <Flex justify="center" align="center">
                    <Flex
                        vertical
                        gap={12}
                        style={{
                            width: 176,
                            boxSizing: 'border-box',
                            padding: '12px 0',
                            userSelect: 'none',
                        }}
                    >
                        {vm.initialized ? (
                            <>
                                <Flex justify="space-between">
                                    <Typography.Text>版本</Typography.Text>
                                    <Typography.Text>{VERSION}</Typography.Text>
                                </Flex>
                                <Flex justify="space-between">
                                    <Typography.Text>是否折叠</Typography.Text>
                                    <Switch
                                        checked={vm.isCollapsed}
                                        onChange={vm.onChangeCollapsed}
                                    />
                                </Flex>
                                <Flex justify="end">
                                    <Button type="primary" onClick={vm.handleSubmit}>
                                        保存
                                    </Button>
                                </Flex>
                            </>
                        ) : (
                            <Spin />
                        )}
                    </Flex>
                </Flex>
            )}
        </Observer>
    );
};

export default App;
