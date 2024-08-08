import {
  InfoCircleOutlined,
  SettingOutlined,
  SwitcherOutlined,
} from '@ant-design/icons';
import { Flex, Spin, Switch, Typography } from 'antd';
import { Observer } from 'mobx-react-lite';
import * as React from 'react';

import { VERSION } from '@/utils';

import ControlListVM from './index.vm';
import ControlListItem from './item';

const ControlList: React.FC = () => {
    const vm = React.useMemo(() => new ControlListVM(), []);

    return (
        <Observer>
            {() =>
                vm.initialized ? (
                    <Flex vertical gap={4}>
                        <ControlListItem icon={<InfoCircleOutlined />}>
                            <Typography.Text>版本: {VERSION}</Typography.Text>
                        </ControlListItem>
                        <ControlListItem icon={<SwitcherOutlined />}>
                            <Flex justify="space-between" style={{ width: '100%' }}>
                                <Typography.Text>是否折叠</Typography.Text>
                                <Switch checked={vm.isCollapsed} onClick={vm.setIsCollapsed} />
                            </Flex>
                        </ControlListItem>
                        <ControlListItem icon={<SettingOutlined />} onClick={vm.handleAdvanced}>
                            <Typography.Text>更多设置</Typography.Text>
                        </ControlListItem>
                    </Flex>
                ) : (
                    <Spin />
                )
            }
        </Observer>
    );
};

export default ControlList;
