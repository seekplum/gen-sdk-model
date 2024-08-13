import type { FormInstance, RadioChangeEvent } from 'antd';
import {
  Button,
  Form,
  Input,
  message,
  Radio,
  Select,
  Spin,
  Switch,
  Typography,
} from 'antd';
import { Observer } from 'mobx-react-lite';
import * as React from 'react';

import { Language, Platform, PlatformNames } from '@/constants';
import type { IRequestConfig } from '@/typings';
import { VERSION } from '@/utils';

import OptionsSettingsVM from './App.vm';

import './App.scss';

interface RequestConfigProps {
    form: FormInstance;
    requestConfig: IRequestConfig;
    onFinish: (values: IRequestConfig) => void;
}

function RequestConfig(props: RequestConfigProps) {
    const { form, requestConfig, onFinish } = props;
    return (
        <Form
            form={form}
            name="basic"
            labelCol={{ span: 8 }}
            wrapperCol={{ span: 16 }}
            style={{ maxWidth: 600 }}
            initialValues={{ remember: true }}
            onFinish={onFinish}
            autoComplete="off"
        >
            <Form.Item
                label="子类参数基类名"
                name="childBaseType"
                initialValue={requestConfig.childBaseType}
                rules={[{ required: true, message: '请输入子类参数基类名' }]}
            >
                <Input placeholder="请输入子类参数基类名" />
            </Form.Item>
            <Form.Item
                label="请求参数基类名"
                name="paramBaseType"
                initialValue={requestConfig.paramBaseType}
                rules={[{ required: true, message: '请输入请求参数基类名' }]}
            >
                <Input placeholder="请输入请求参数基类名" />
            </Form.Item>
            <Form.Item
                label="响应参数基类名"
                name="responseBaseType"
                initialValue={requestConfig.responseBaseType}
                rules={[{ required: true, message: '请输入响应参数基类名' }]}
            >
                <Input placeholder="请输入响应参数基类名" />
            </Form.Item>
            <Form.Item
                label="请求基类名"
                name="requestBaseType"
                initialValue={requestConfig.requestBaseType}
                rules={[{ required: true, message: '请输入请求基类名' }]}
            >
                <Input placeholder="请输入请求基类名" />
            </Form.Item>
        </Form>
    );
}

const App: React.FC = () => {
    const vm = React.useMemo(() => new OptionsSettingsVM(), []);
    const [doudianForm] = Form.useForm();
    const [weixinForm] = Form.useForm();

    const [messageApi, contextHolder] = message.useMessage();
    const handleChangePlatform = React.useCallback(
        (e: RadioChangeEvent) => {
            const { value } = e.target;
            if (value === Platform.DOUDIAN) {
                weixinForm.submit();
            } else {
                doudianForm.submit();
            }
            vm.onChangePlatform(value);
        },
        [vm, doudianForm, weixinForm],
    );
    const handleSubmit = React.useCallback(
        (values: Record<string, any>) => {
            doudianForm.submit();
            weixinForm.submit();

            vm.handleSubmit(values);
            messageApi.open({
                type: 'success',
                content: '保存成功',
            });
        },
        [vm, doudianForm, weixinForm],
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
                        <Form.Item label="开放平台">
                            <Radio.Group onChange={handleChangePlatform} value={vm.platform}>
                                <Radio value={Platform.DOUDIAN}>
                                    {PlatformNames[Platform.DOUDIAN]}
                                </Radio>
                                <Radio value={Platform.WEIXIN}>
                                    {PlatformNames[Platform.WEIXIN]}
                                </Radio>
                            </Radio.Group>
                        </Form.Item>

                        {Platform.DOUDIAN === vm.platform && (
                            <RequestConfig
                                form={doudianForm}
                                requestConfig={vm.modelConfig[Platform.DOUDIAN]}
                                onFinish={(values: IRequestConfig) =>
                                    vm.handleModelConfig(Platform.DOUDIAN, values)
                                }
                            />
                        )}
                        {Platform.WEIXIN === vm.platform && (
                            <RequestConfig
                                form={weixinForm}
                                requestConfig={vm.modelConfig[Platform.WEIXIN]}
                                onFinish={(values: IRequestConfig) =>
                                    vm.handleModelConfig(Platform.WEIXIN, values)
                                }
                            />
                        )}
                        <Form.Item wrapperCol={{ offset: 6, span: 16 }}>
                            {contextHolder}
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
