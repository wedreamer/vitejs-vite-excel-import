import { ArrowRightOutlined, CloudUploadOutlined } from '@ant-design/icons';
import {
  ActionType,
  PageContainer,
  ProColumns,
  ProTable,
} from '@ant-design/pro-components';
import { Button, Space, StepProps, Steps, message, notification } from 'antd';
import { validate } from 'class-validator';
import { useRef, useState } from 'react';
import {
  ActionProvider,
  BaseRecord,
  ValidateStatus,
  validationErrorDeal,
} from './types';

type NotificationType = 'success' | 'info' | 'warning' | 'error';

// 定义排序顺序
export const order = [
  ValidateStatus.ERROR,
  ValidateStatus.WARNING,
  ValidateStatus.SUCCESS,
  ValidateStatus.WILL,
];

// 状态排序
export const indexStatus = <T extends BaseRecord>(newDataSource: (T)[]) => {
  newDataSource.sort(
    (a, b) => order.indexOf(a.status) - order.indexOf(b.status),
  );
};

export interface NotificationProp {
  type: NotificationType;
  message: string;
  description: string;
}

export interface ImportExcelProps<T, R> {
  title: string;
  // 原始数据
  rawDataSource: T[];
  // 完成
  // 原始列
  rawColumns: ProColumns<T>[];
  nextColumns: ProColumns<R>[];
  stepItems: StepProps[];
  stepActions: Array<
    (provider: ActionProvider<T, R>) =>
      | Promise<{
          data: (T | R | never)[];
          next: boolean;
          notification?: NotificationProp;
        }>
      | {
          data: (T | R | never)[];
          next: boolean;
          notification?: NotificationProp;
        }
  >;
}

const ImportExcel = <T extends BaseRecord, R extends BaseRecord>(
  props: ImportExcelProps<T, R>,
) => {
  const { rawDataSource, rawColumns, stepItems, stepActions, title } = props;

  const [api, contextHolder] = notification.useNotification();

  const [dataSource, setDataSource] = useState<(T | R)[]>(rawDataSource);
  const [columns, setColumns] = useState<ProColumns<T | R>[]>(
    rawColumns as ProColumns<T | R>[],
  );

  const [pageInfo, setPageInfo] = useState({ pageSize: 10, current: 1 });

  const actionRef = useRef<ActionType>();
  const [current, setCurrent] = useState<number>(0);
  // const [status, setStatus] = useState<'wait' | 'process' | 'finish' | 'error'>(
  //   'wait',
  // );

  const provider = {
    dataSource,
    setDataSource,
    columns,
    setColumns,
    props,
  };

  const hasError = (data: (T | R)[]) =>
    data.filter((i) => i.errorAtt.length).length !== 0;

  const openNotificationWithIcon: (props: NotificationProp) => void = ({
    type,
    message,
    description,
  }) => {
    api[type]({
      message,
      description,
    });
  };

  const stepChange = async (next: () => void) => {
    // 一步一步走, 暂时不跨步
    if (dataSource.length === 0) {
      return message.warning('无数据!');
    }
    if (hasError(dataSource)) {
      return message.warning('请先处理当前数据问题!');
    }
    // 去 stepActions 中选择对应的进行执行
    // 如果 1 去执行 1 对应的函数, 如果 2 去执行 2 对应的函数
    // setStatus('process');
    const action = stepActions[current];
    const res = await action(provider);
    const nestAble = res.next;
    if (res.notification) {
      openNotificationWithIcon(res.notification);
    }
    if (!res.next) {
      // return setStatus('error');
      return;
    }
    // setStatus('finish');
    if (nestAble) next();
  };

  return (
    <PageContainer>
      {contextHolder}
      <Space direction="vertical" size="large" style={{ display: 'flex' }}>
        <Steps
          current={current}
          // 有 bug
          // status={status}
          items={stepItems}
        />

        <ProTable<T | R>
          columns={columns as ProColumns<T | R>[]}
          dataSource={dataSource}
          actionRef={actionRef}
          cardBordered
          search={false}
          editable={{
            type: 'single',
            onSave: async (key, record) => {
              // 找到被编辑的行在数据源中的索引
              const index = dataSource.findIndex((item) => item.id === key);
              if (index > -1) {
                // 替换之前进行数据校验
                const rawRecord = dataSource[index];
                Object.assign(rawRecord, record);
                const errorAtt = await validate(rawRecord);
                rawRecord.errorAtt = [];
                validationErrorDeal([errorAtt]);
                rawRecord.status =
                  errorAtt.length > 0
                    ? ValidateStatus.ERROR
                    : ValidateStatus.SUCCESS;
                // 使用新的行数据替换原来的行数据
                const newDataSource = [...dataSource];
                newDataSource[index] = rawRecord;
                indexStatus(newDataSource);
                // 更新数据源
                setDataSource(newDataSource);
              }
            },
            onDelete: async (key) => {
              // 直接更新数据源
              setDataSource(dataSource.filter((i) => i.id !== key));
            },
          }}
          columnsState={{
            persistenceKey: 'pro-table-singe-demos',
            persistenceType: 'localStorage',
            defaultValue: {
              option: { fixed: 'right', disable: true },
            },
            onChange(value) {
              console.log('value: ', value);
            },
          }}
          rowKey="id"
          options={{
            setting: {
              listsHeight: 400,
            },
          }}
          form={{
            // 由于配置了 transform，提交的参与与定义的不同这里需要转化一下
            syncToUrl: (values, type) => {
              if (type === 'get') {
                return {
                  ...values,
                  created_at: [values.startTime, values.endTime],
                };
              }
              return values;
            },
          }}
          toolBarRender={() => [
            <>
              {current < stepItems.length - 1 && (
                <Button
                  key="button"
                  icon={<ArrowRightOutlined />}
                  onClick={async () => {
                    await stepChange(() => {
                      // 如果有 status 则有 bug 1 则设置 1, 其他设置 +1
                      setCurrent(current + 1);
                    });
                  }}
                  type="primary"
                >
                  下一步
                </Button>
              )}
            </>,
            <>
              {current >= stepItems.length - 1 && (
                <Button
                  key="button"
                  icon={<CloudUploadOutlined />}
                  disabled={current > stepItems.length - 1}
                  onClick={async () => {
                    await stepChange(() => {
                      // 如果有 status 则有 bug 1 则设置 1, 其他设置 +1
                      setCurrent(current + 1);
                    });
                  }}
                  type="primary"
                >
                  上传
                </Button>
              )}
            </>,
          ]}
          pagination={{
            pageSize: pageInfo.pageSize,
            onShowSizeChange: (current: number, size: number) =>
              setPageInfo({ pageSize: size, current: 1 }),
          }}
          dateFormatter="string"
          headerTitle={title}
        />
      </Space>
    </PageContainer>
  );
};

export default ImportExcel;
