import { InfoCircleOutlined, SettingOutlined } from '@ant-design/icons';
import { Flex, Typography } from 'antd';
import { Observer } from 'mobx-react-lite';
import * as React from 'react';

import { VERSION } from '@/utils';

import ControlListVM from './index.vm';
import ControlListItem from './item';

const ControlList: React.FC = () => {
    const vm = React.useMemo(() => new ControlListVM(), []);

    return (
        <Observer>
            {() => (
                <Flex vertical gap={4}>
                    <ControlListItem icon={<InfoCircleOutlined />}>
                        <Typography.Text>版本: {VERSION}</Typography.Text>
                    </ControlListItem>
                    <ControlListItem icon={<SettingOutlined />} onClick={vm.handleAdvanced}>
                        <Typography.Text>更多设置</Typography.Text>
                    </ControlListItem>
                </Flex>
            )}
        </Observer>
    );
};

export default ControlList;
