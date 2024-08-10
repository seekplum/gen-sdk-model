import { Button, Form, Input, Radio, Spin, Switch, Typography } from 'antd';
import { Observer } from 'mobx-react-lite';
import * as React from 'react';

import { Language, PartyName } from '@/constants';
import { VERSION } from '@/utils';

import OptionsSettingsVM from './App.vm';

import './App.scss';

const App: React.FC = () => {
    const vm = React.useMemo(() => new OptionsSettingsVM(), []);

    return (
        <Observer>
            {() =>
                vm.initialized && !!vm.config ? (
                    <Form
                        name="basic"
                        labelCol={{ span: 8 }}
                        wrapperCol={{ span: 16 }}
                        style={{ maxWidth: 600 }}
                        initialValues={{ remember: true }}
                        onFinish={vm.handleSubmit}
                        autoComplete="off"
                    >
                        <Form.Item label="版本" valuePropName="checked">
                            <Typography.Text>{VERSION}</Typography.Text>
                        </Form.Item>
                        <Form.Item
                            label="默认显示代码"
                            name="isExpanded"
                            initialValue={vm.config.isExpanded}
                            valuePropName="checked"
                        >
                            <Switch />
                        </Form.Item>
                        <Form.Item
                            label="是否需要已废弃字段"
                            name="needRemoved"
                            initialValue={vm.config.needRemoved}
                            valuePropName="checked"
                        >
                            <Switch />
                        </Form.Item>
                        <Form.Item
                            label="是否需要即将废弃字段"
                            name="needDeprecated"
                            initialValue={vm.config.needDeprecated}
                            valuePropName="checked"
                        >
                            <Switch />
                        </Form.Item>
                        <Form.Item
                            label="是否需要示例信息"
                            name="needExample"
                            initialValue={vm.config.needExample}
                            valuePropName="checked"
                        >
                            <Switch />
                        </Form.Item>
                        <Form.Item
                            label="是否需要描述信息"
                            name="needDescription"
                            initialValue={vm.config.needDescription}
                            valuePropName="checked"
                        >
                            <Switch />
                        </Form.Item>
                        <Form.Item label="语言" name="language" initialValue={vm.config.language}>
                            <Radio.Group value={vm.config.language}>
                                <Radio value={Language.PYTHON}>{Language.PYTHON}</Radio>
                            </Radio.Group>
                        </Form.Item>
                        <Form.Item label="库名" name="partyName" initialValue={vm.config.partyName}>
                            <Radio.Group
                                onChange={(e) => vm.onChangeFields('partyName', e.target.value)}
                                value={vm.config.partyName}
                            >
                                <Radio value={PartyName.PYDANTIC}>{PartyName.PYDANTIC}</Radio>
                            </Radio.Group>
                        </Form.Item>

                        <Form.Item
                            label="子类参数基类名"
                            name="childBaseType"
                            initialValue={vm.config.childBaseType}
                            rules={[{ required: true, message: '请输入子类参数基类名' }]}
                        >
                            <Input placeholder="请输入子类参数基类名" />
                        </Form.Item>
                        <Form.Item
                            label="请求参数基类名"
                            name="paramBaseType"
                            initialValue={vm.config.paramBaseType}
                            rules={[{ required: true, message: '请输入请求参数基类名' }]}
                        >
                            <Input placeholder="请输入请求参数基类名" />
                        </Form.Item>
                        <Form.Item
                            label="响应参数基类名"
                            name="responseBaseType"
                            initialValue={vm.config.responseBaseType}
                            rules={[{ required: true, message: '请输入响应参数基类名' }]}
                        >
                            <Input placeholder="请输入响应参数基类名" />
                        </Form.Item>
                        <Form.Item
                            label="请求基类名"
                            name="requestBaseType"
                            initialValue={vm.config.requestBaseType}
                            rules={[{ required: true, message: '请输入请求基类名' }]}
                        >
                            <Input placeholder="请输入请求基类名" />
                        </Form.Item>

                        <Form.Item wrapperCol={{ offset: 6, span: 16 }}>
                            <Button type="primary" htmlType="submit">
                                保存
                            </Button>
                        </Form.Item>
                    </Form>
                ) : (
                    <Spin />
                )
            }
        </Observer>
    );
};

export default App;
