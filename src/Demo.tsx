import ImportExcel, { ImportExcelProps, indexStatus } from './ImportExcel'
import {
  ActionProvider,
  BaseRecord,
  ValidateStatus,
  ValidateStatusMapColor,
  ValidateStatusMapTxt,
  errorItem,
  getErrorMessage,
} from './ImportExcel/types'
import { ProColumns } from '@ant-design/pro-components'
import { Tag, Tooltip, message } from 'antd'
import { plainToInstance } from 'class-transformer'
import { validate } from 'class-validator'
import { createMethylationsBulk, createMethylationsSniff } from './service'
import { BulkDemoDto, ImprotRawDemoShell } from './types/dto'
import { useParams } from 'react-router-dom'

type T = ImprotRawDemoShell & BaseRecord
type R = BulkDemoDto & BaseRecord

const getProp: (
  data: ImprotRawDemoShell[]
) => ImportExcelProps<T, R> = data => ({
  title: '结果导入',
  rawDataSource: data.map((item, index) => ({
    ...item,
    id: index,
    status: ValidateStatus.WILL,
    errorAtt: [],
  })),
  rawColumns: [
    {
      title: '状态',
      key: 'status',
      dataIndex: 'status',
      width: 80,
      editable: false,
      render: (_, record) => (
        <>
          <Tag color={ValidateStatusMapColor[record.status]} key={record.id}>
            {ValidateStatusMapTxt[record.status]}
          </Tag>
        </>
      ),
    },
    {
      title: '编号',
      dataIndex: 'no',
      width: 180,
      ellipsis: false,
      formItemProps: {
        rules: [
          {
            required: true,
            message: '此项为必填项',
          },
        ],
      },
      render: (text, record) => {
        const { hasError, message } = getErrorMessage<ImprotRawDemoShell>(
          record.errorAtt,
          'no'
        )
        if (!hasError) {
          return (
            <Tooltip title={text?.toString()} key={record.id}>
              <span
                style={{
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  maxWidth: '180px', // 你可以根据需要调整这个值
                  display: 'inline-block',
                }}
              >
                {text}
              </span>
            </Tooltip>
          )
        }
        return {
          children: (
            <Tooltip
              title={message.join(',')}
              color="red-inverse"
              key={record.id}
            >
              <span
                style={{
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  maxWidth: '180px', // 你可以根据需要调整这个值
                  display: 'inline-block',
                  color: 'red',
                }}
              >
                {text}
              </span>
            </Tooltip>
          ),
          props: {
            style: { color: 'red !important' },
          },
        }
      },
    },
    {
      title: '备注',
      dataIndex: 'remark',
      formItemProps: {
        rules: [
          {
            required: false,
            message: '此项为必填项',
          },
        ],
      },
      render: (text, record) => {
        const { hasError, message } = getErrorMessage<ImprotRawDemoShell>(
          record.errorAtt,
          'remark'
        )
        if (!hasError) {
          return text
        }
        return {
          children: (
            <Tooltip
              title={message.join(',')}
              color="red-inverse"
              key={record.id}
            >
              {text}
            </Tooltip>
          ),
          props: {
            style: { color: 'red' },
          },
        }
      },
    },
    {
      title: '操作',
      width: 180,
      valueType: 'option',
      key: 'option',
      render: (text, record, _, action) => [
        <a
          key="editable"
          onClick={() => {
            action?.startEditable?.(record.id!)
          }}
        >
          编辑
        </a>,
        // <a
        //   key="delete"
        //   onClick={() => {
        //     action?.startEditable?.(record.id!);
        //   }}
        // >
        //   删除
        // </a>,
      ],
    },
  ],
  nextColumns: [
    {
      title: '状态',
      key: 'status',
      dataIndex: 'status',
      width: 80,
      editable: false,
      render: (_, record) => (
        <>
          <Tag color={ValidateStatusMapColor[record.status!]} key={record.id}>
            {ValidateStatusMapTxt[record.status!]}
          </Tag>
        </>
      ),
    },
    {
      title: '编号',
      dataIndex: 'no',
      width: 180,
      ellipsis: false,
      // TODO: 后续优化
      editable: false,
      formItemProps: {
        rules: [
          {
            required: true,
            message: '此项为必填项',
          },
        ],
      },
      render: (text, record) => {
        const { hasError, message } = getErrorMessage<ImprotRawDemoShell>(
          record.errorAtt,
          'no'
        )
        if (!hasError) {
          return (
            <Tooltip title={text?.toString()} key={record.id}>
              <span
                style={{
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  maxWidth: '180px', // 你可以根据需要调整这个值
                  display: 'inline-block',
                }}
              >
                {text}
              </span>
            </Tooltip>
          )
        }
        return {
          children: (
            <Tooltip
              title={message.join(',')}
              color="red-inverse"
              key={record.id}
            >
              <span
                style={{
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  maxWidth: '180px', // 你可以根据需要调整这个值
                  display: 'inline-block',
                  color: 'red',
                }}
              >
                {text}
              </span>
            </Tooltip>
          ),
          props: {
            style: { color: 'red !important' },
          },
        }
      },
    },
    {
      title: '备注',
      dataIndex: 'remark',
      formItemProps: {
        rules: [
          {
            required: false,
            message: '此项为必填项',
          },
        ],
      },
    },
    {
      title: '操作',
      valueType: 'option',
      key: 'option',
      render: (text, record, _, action) => [
        <a
          key="editable"
          onClick={() => {
            action?.startEditable?.(record.id)
          }}
        >
          编辑
        </a>,
        // <TableDropdown
        //   key="actionGroup"
        //   onSelect={() => action?.reload()}
        //   menus={[
        //     { key: 'copy', name: '复制' },
        //     { key: 'delete', name: '删除' },
        //   ]}
        // />,
      ],
    },
  ],
  stepItems: [
    {
      title: '原始数据',
      description: 'excel 导入的原始数据',
    },
    {
      title: '转换及校验',
      description: '转换及校验',
    },
    {
      title: '合并及处理',
      description: '日期转换, 合并同人',
    },
    {
      title: '接口检验',
      description: '接口嗅探检验',
    },
    {
      title: '准备上传',
      description: '数据可以准备上传',
    },
  ],
  stepActions: [
    () => {
      // 原始数据
      return { data: [], next: true }
    },
    // 转换及校验
    async (
      provider: ActionProvider<T, R>
    ): Promise<{ data: T[]; next: boolean }> => {
      // 可能在 table 中发生了数据变更
      const dataSource = provider.dataSource
      // 基础校验
      const rawJsonAtt = plainToInstance(ImprotRawDemoShell, dataSource) as T[]
      // 多余字段剔除 result
      rawJsonAtt.forEach(i => delete i.result)
      // 先转换, 校验再合并, 合并中再校验
      const errors = await Promise.all(
        rawJsonAtt.map(async item => {
          // 一行表头 一行 0
          // TODO: excel 元数据才时最可靠的
          // TODO: 此时可能 no 重复, 导致之后报错定位错误
          item.status = ValidateStatus.SUCCESS
          return await validate(item)
        })
      )
      const errorAtt = errors.filter(e => e.length > 0)
      errorAtt.forEach(error => {
        if (error.length > 0) {
          error.forEach(item => {
            const target = item.target as T & {
              errorAtt?: errorItem[]
            }
            target.status = ValidateStatus.ERROR
            target.errorAtt ??= []
            target.errorAtt.push({
              property: item.property,
              message: Object.keys(item.constraints!)
                .map(key => item.constraints![key])
                .join(';'),
              value: item.value,
            })
          })
        }
      })
      rawJsonAtt.sort((a, b) => b.errorAtt.length - a.errorAtt.length)
      indexStatus(rawJsonAtt)
      provider.setDataSource(rawJsonAtt)
      return { data: rawJsonAtt, next: errorAtt.length === 0 }
    },
    // 合并及处理
    async (
      provider: ActionProvider<T, R>
    ): Promise<{ data: R[]; next: boolean }> => {
      const dataSource = provider.dataSource
      // 可能在 table 中发生了数据变更
      // 不进行合并, 直接进行转换 ImprotMethylationResultShell -> BulkMethylationDto
      let targets = plainToInstance(BulkDemoDto, dataSource) as R[]
      targets = targets.map(i => ({ ...i, errorAtt: [] }))
      // 校验, 此时必合法
      const errors = await Promise.all(targets.map(item => validate(item)))
      errors.forEach(error => {
        if (error.length > 0) {
          error.forEach(item => {
            const target = item.target as R
            target.errorAtt ??= []
            target.errorAtt.push({
              property: item.property,
              message: Object.keys(item.constraints!)
                .map(key => item.constraints![key])
                .join(';'),
              value: item.value,
            })
          })
        }
      })
      const errorAtt = errors.filter(e => e.length > 0)
      targets.sort((a, b) => b.errorAtt.length - a.errorAtt.length)
      // 设置新的数据以及新的列
      provider.setColumns(provider.props.nextColumns as ProColumns<T | R>[])
      indexStatus(targets)
      provider.setDataSource(targets)
      return { data: targets, next: errorAtt.length === 0 }
    },
    // 嗅探业务校验
    async (provider: ActionProvider<T, R>) => {
      const dataSource = provider.dataSource
      const hide = message.loading('正在校验', 0)
      try {
        await createMethylationsSniff(dataSource as BulkDemoDto[])
        hide()

        const ok = true
        const noOk = !ok
        const warning = true

        if (ok) {
          // 没毛病 继续下一步
          return {
            data: [],
            next: true,
          }
        }

        if (noOk) {
          dataSource.forEach(target => {
            // 具体数据处理业务逻辑
            if (target) target.status = ValidateStatus.ERROR
          })
          indexStatus(dataSource)
          provider.setDataSource(Array.from(dataSource))
          return {
            data: [],
            next: false,
            notification: {
              type: 'error',
              message: '数据检验失败!',
              description: `相关失败数据信息已标红及注明详细原因, 查看更改或删除之后继续尝试上传!`,
            },
          }
        }

        if (warning) {
          dataSource.forEach(target => {
            // 具体数据处理业务逻辑
            if (target) target.status = ValidateStatus.WARNING
          })
          indexStatus(dataSource)
          provider.setDataSource(Array.from(dataSource))
          return {
            data: [],
            next: true,
            notification: {
              type: 'warning',
              message: `以下样本内有实验结果已存在，导入结果会覆盖已有实验结果！`,
              description: `xxx`,
            },
          }
        }
      } catch {
        hide()
      }
      // 可能 500
      return {
        data: [],
        next: false,
      }
    },
    // 上传
    async (provider: ActionProvider<T, R>) => {
      const dataSource = provider.dataSource
      const hide = message.loading('正在添加', 0)
      try {
        await createMethylationsBulk(dataSource as BulkDemoDto[])
        const ok = true
        const noOk = !ok
        const warning = true

        if (ok) {
          // 没毛病 继续下一步
          return {
            data: [],
            next: true,
          }
        }

        if (noOk) {
          dataSource.forEach(target => {
            // 具体数据处理业务逻辑
            if (target) target.status = ValidateStatus.ERROR
          })
          indexStatus(dataSource)
          provider.setDataSource(Array.from(dataSource))
          return {
            data: [],
            next: false,
            notification: {
              type: 'error',
              message: '数据检验失败!',
              description: `相关失败数据信息已标红及注明详细原因, 查看更改或删除之后继续尝试上传!`,
            },
          }
        }

        if (warning) {
          dataSource.forEach(target => {
            // 具体数据处理业务逻辑
            if (target) target.status = ValidateStatus.WARNING
          })
          indexStatus(dataSource)
          provider.setDataSource(Array.from(dataSource))
          return {
            data: [],
            next: true,
            notification: {
              type: 'warning',
              message: `以下样本内有实验结果已存在，导入结果会覆盖已有实验结果！`,
              description: `xxx`,
            },
          }
        }
      } catch {
        hide()
      }
      // 可能 500
      return {
        data: [],
        next: false,
      }
    },
  ],
})

const DemoImport = () => {
  const params = useParams() as { hash: string }
  const jsonStr = localStorage.getItem(params.hash)
  if (jsonStr) {
    const jsonData = JSON.parse(jsonStr) as {
      data: (ImprotRawDemoShell & { result: string })[]
    }
    return ImportExcel(getProp(jsonData.data ?? []))
  }
  message.error('本地不具有相关 excel 数据!')
}

export default DemoImport
