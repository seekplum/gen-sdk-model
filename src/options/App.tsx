import type { FormInstance } from 'antd';
import { Button, Form, Input, message, Select, Spin, Switch, Typography } from 'antd';
import { Observer } from 'mobx-react-lite';
import * as React from 'react';

import { type BaseModel, Language, Platform, PlatformNames } from '@/constants';
import { VERSION } from '@/utils';
import * as printer from '@/utils/printer';

import OptionsSettingsVM from './App.vm';

import './App.scss';

function RequestConfig({
    platform,
    form,
    requestConfig,
}: {
    platform: Platform;
    form: FormInstance;
    requestConfig: BaseModel;
}) {
    const platformName = PlatformNames[platform];
    return (
        <Form
            labelCol={{ span: 8 }}
            wrapperCol={{ span: 16 }}
            form={form}
            name="basic"
            style={{ maxWidth: 600 }}
        >
            <Form.Item
                label={`${platformName}子类参数基类名`}
                name="child"
                initialValue={requestConfig.child}
                rules={[{ required: true, message: '请输入子类参数基类名' }]}
            >
                <Input placeholder="请输入子类参数基类名" />
            </Form.Item>
            <Form.Item
                label={`${platformName}请求参数基类名`}
                name="param"
                initialValue={requestConfig.param}
                rules={[{ required: true, message: '请输入请求参数基类名' }]}
            >
                <Input placeholder="请输入请求参数基类名" />
            </Form.Item>
            <Form.Item
                label={`${platformName}响应参数基类名`}
                name="response"
                initialValue={requestConfig.response}
                rules={[{ required: true, message: '请输入响应参数基类名' }]}
            >
                <Input placeholder="请输入响应参数基类名" />
            </Form.Item>
            <Form.Item
                label={`${platformName}请求基类名`}
                name="request"
                initialValue={requestConfig.request}
                rules={[{ required: true, message: '请输入请求基类名' }]}
            >
                <Input placeholder="请输入请求基类名" />
            </Form.Item>
        </Form>
    );
}

const App: React.FC = () => {
    const [doudianForm] = Form.useForm();
    const [weixinForm] = Form.useForm();
    const [aliapyForm] = Form.useForm();
    const [alibabaForm] = Form.useForm();
    const [kuaishouForm] = Form.useForm();
    const [taobaoForm] = Form.useForm();
    const platformForms: Array<[Platform, FormInstance]> = React.useMemo(
        () => [
            [Platform.DOUDIAN, doudianForm],
            [Platform.WEIXIN, weixinForm],
            [Platform.ALIPAY, aliapyForm],
            [Platform.ALIBABA, alibabaForm],
            [Platform.KUAISHOU, kuaishouForm],
            [Platform.TAOBAO, taobaoForm],
        ],
        [doudianForm, weixinForm, aliapyForm, alibabaForm, kuaishouForm, taobaoForm],
    );
    const vm = React.useMemo(() => new OptionsSettingsVM(), []);

    const [messageApi, contextHolder] = message.useMessage();

    const handleValidate = React.useCallback(
        async (form: FormInstance, content: string): Promise<boolean> => {
            try {
                await form.validateFields();
                return true;
            } catch (error) {
                printer.consoleError(error);
                messageApi.open({
                    type: 'error',
                    content,
                });
                return false;
            }
        },
        [messageApi],
    );

    const handleChangePlatform = React.useCallback(
        async (value: Platform) => {
            const currItem = platformForms.find((item) => item[0] === vm.platform);
            if (currItem && currItem.length === 2) {
                const [platform, form] = currItem;
                vm.handleModelConfig(platform, form.getFieldsValue());
                const res = await handleValidate(form, '请先修正错误后再切换平台');
                if (!res) {
                    return;
                }
            }
            vm.onChangePlatform(value);
        },
        [vm, platformForms, handleValidate],
    );
    const handleSubmit = React.useCallback(
        async (values: Record<string, any>) => {
            vm.toggleSubmitting(true);
            for (const currItem of platformForms) {
                const [platform, form] = currItem;
                vm.handleModelConfig(platform, form.getFieldsValue());
                const res = await handleValidate(form, '请先修正错误再保存');
                if (!res) {
                    vm.toggleSubmitting(false);
                    return;
                }
            }

            vm.handleSubmit(values);
            messageApi.open({
                type: 'success',
                content: '保存成功',
            });
        },
        [vm, platformForms, messageApi, handleValidate],
    );

    return (
        <Observer>
            {() =>
                vm.initialized && !!vm.config && !!vm.modelConfig ? (
                    <Form
                        name="basic"
                        labelCol={{ span: 8 }}
                        wrapperCol={{ span: 16 }}
                        style={{ maxWidth: 600 }}
                        initialValues={{ remember: true }}
                        onFinish={handleSubmit}
                        autoComplete="off"
                    >
                        <Form.Item label="版本">
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
                        <Form.Item
                            label="首选语言"
                            name="language"
                            initialValue={vm.config.language}
                        >
                            <Select
                                value={vm.config.language}
                                style={{ width: 120 }}
                                options={[
                                    {
                                        value: Language.PYTHON,
                                        label: Language.PYTHON,
                                    },
                                    {
                                        value: Language.TYPESCRIPT,
                                        label: Language.TYPESCRIPT,
                                    },
                                ]}
                            />
                        </Form.Item>
                        <Form.Item label="开放平台" name="platform" initialValue={vm.platform}>
                            <Select
                                value={vm.platform}
                                style={{ width: 120 }}
                                onChange={handleChangePlatform}
                                options={platformForms.map((item) => {
                                    const [platform, _] = item;
                                    return {
                                        value: platform,
                                        label: PlatformNames[platform],
                                    };
                                })}
                            />
                        </Form.Item>
                        <Form.Item label="" wrapperCol={{ offset: 8 }}>
                            <Typography.Text>
                                以下配置仅针对
                                <Typography.Text strong>
                                    {PlatformNames[vm.platform]}
                                </Typography.Text>
                                平台生效，其它
                                {platformForms
                                    .filter((item) => item[0] !== vm.platform)
                                    .map((item) => PlatformNames[item[0]])
                                    .join('、')}
                                平台请切换后进行配置
                            </Typography.Text>
                        </Form.Item>
                        {platformForms.map((item) => {
                            const [platform, form] = item;
                            if (!vm.modelConfig || vm.platform !== platform) {
                                return null;
                            }
                            return (
                                <RequestConfig
                                    key={platform}
                                    platform={platform}
                                    form={form}
                                    requestConfig={vm.modelConfig[platform]}
                                />
                            );
                        })}
                        <Form.Item wrapperCol={{ offset: 8 }}>
                            {contextHolder}
                            <Button type="primary" htmlType="submit" disabled={vm.submitting}>
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
