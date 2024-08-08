import { Flex, Tooltip } from 'antd';
import classNames from 'classnames';

import styles from './item.module.scss';

interface ControlListItemProps {
    children?: React.ReactNode;
    icon?: React.ReactNode;
    onClick?: () => void;
    disabled?: boolean;
    disabledReason?: string;
}

const ControlListItem: React.FC<ControlListItemProps> = (props: ControlListItemProps) => {
    const { icon, children, onClick, disabled, disabledReason } = props;

    return (
        <Tooltip
            title={disabled ? disabledReason : undefined}
            autoAdjustOverflow
            rootClassName={styles.tooltipRoot}
        >
            <Flex
                className={classNames(styles.wrapper, disabled && styles.wrapperDisabled)}
                align="center"
                onClick={disabled ? undefined : onClick}
            >
                {!!icon && (
                    <div
                        style={{
                            marginRight: 8,
                            color: 'rgba(0,0,0,0.45)',
                            fontSize: 16,
                            fontWeight: 500,
                        }}
                    >
                        {icon}
                    </div>
                )}
                {children}
            </Flex>
        </Tooltip>
    );
};

export default ControlListItem;
