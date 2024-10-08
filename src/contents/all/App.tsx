import { LeftCircleTwoTone, RightCircleTwoTone } from '@ant-design/icons';
import { Flex, Radio, Spin, Typography } from 'antd';
import { Observer } from 'mobx-react-lite';
import * as React from 'react';

import { Language, Platform } from '@/constants';

import * as styles from './App.scss';
import AppVM from './App.vm';
import { DocumentCode, ReadOnlyCode } from './code';

const App: React.FC = () => {
    const [tipsHeight, setTipsHeight] = React.useState(105);

    const [language, setLanguage] = React.useState<Language | null>(null);

    const vm = React.useMemo(() => new AppVM(), []);
    const elemRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        if (elemRef.current) {
            setTipsHeight(elemRef.current.clientHeight);
        }
    }, [elemRef]);

    return (
        <Observer>
            {() => (
                <Flex id={`${styles.plumChromeExtensionBox}`} gap={4}>
                    <Flex align="baseline">
                        {vm.config?.isExpanded ? (
                            <RightCircleTwoTone
                                onClick={vm.toggleCollapsed}
                                style={{ fontSize: 30, cursor: 'pointer' }}
                            />
                        ) : (
                            <LeftCircleTwoTone
                                onClick={vm.toggleCollapsed}
                                style={{ fontSize: 30, cursor: 'pointer' }}
                            />
                        )}
                    </Flex>
                    {vm.config ? (
                        vm.config.isExpanded && (
                            <Flex vertical className={styles.codeBox}>
                                <div ref={elemRef} style={{ marginBottom: 16 }}>
                                    <Flex
                                        gap={8}
                                        style={{ margin: '0 16px' }}
                                        justify="center"
                                        align="center"
                                    >
                                        <Typography.Title style={{ fontSize: 18 }}>
                                            自动生成SDK代码
                                        </Typography.Title>
                                    </Flex>
                                    <Flex vertical gap={4}>
                                        <Typography.Text>
                                            请求参数可以精确的判断是否必选，响应参数无法精确，需要根据实际情况进行判断
                                        </Typography.Text>
                                        <Typography.Text>
                                            响应参数建议按实际使用情况调整字段，只保留需要的字段
                                        </Typography.Text>
                                        <Typography.Text strong>
                                            参数可以根据「描述」细化下类型定义，比如定义成枚举类型等(
                                            <Typography.Text style={{ color: 'blue' }}>
                                                复制按钮在右上角
                                            </Typography.Text>
                                            )
                                        </Typography.Text>
                                    </Flex>
                                </div>
                                <Flex vertical gap={4}>
                                    {vm.platformResponse || vm.platform === Platform.WEIXIN ? (
                                        <>
                                            <Flex gap={12}>
                                                <Typography.Text>选择语言:</Typography.Text>
                                                <Radio.Group
                                                    value={language || vm.config.language}
                                                    onChange={(e) => {
                                                        setLanguage(e.target.value as Language);
                                                        vm.toggleLanguage(
                                                            e.target.value as Language,
                                                        );
                                                    }}
                                                >
                                                    <Radio value={Language.PYTHON}>
                                                        {Language.PYTHON}
                                                    </Radio>
                                                    <Radio value={Language.TYPESCRIPT}>
                                                        {Language.TYPESCRIPT}
                                                    </Radio>
                                                </Radio.Group>
                                            </Flex>
                                            {vm.platformResponse ? (
                                                <ReadOnlyCode
                                                    tipsHeight={tipsHeight}
                                                    language={language || vm.config.language}
                                                    platform={vm.platformResponse.platform}
                                                    response={vm.platformResponse.response}
                                                />
                                            ) : (
                                                <DocumentCode
                                                    tipsHeight={tipsHeight}
                                                    language={language || vm.config.language}
                                                    platform={Platform.WEIXIN}
                                                />
                                            )}
                                        </>
                                    ) : vm.initialized ? (
                                        <Typography.Text strong type="danger">
                                            获取请求数据失败，请尝试刷新页面，或者切换其它接口后再返回
                                        </Typography.Text>
                                    ) : (
                                        <Spin />
                                    )}
                                </Flex>
                            </Flex>
                        )
                    ) : (
                        <Spin />
                    )}
                </Flex>
            )}
        </Observer>
    );
};

export default App;
