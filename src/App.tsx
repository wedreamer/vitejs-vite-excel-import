import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { Button, Upload, message } from 'antd'
import { UploadOutlined } from '@ant-design/icons'
import { UploadRequestOption } from 'rc-upload/lib/interface'
import * as XLSX from 'xlsx'
import { ImprotRawDemoShell } from './types/dto'

const getExtname = (filename: string) =>
  filename.slice(filename.lastIndexOf('.'))
const isExcel = (filename: string) => {
  const extname = getExtname(filename)
  return ['.xlsx', '.xls'].includes(extname)
}

async function hashStr(str: string) {
  // 创建一个新的 TextEncoder 实例
  const encoder = new TextEncoder()

  // 将字符串转换为 Uint8Array
  const data = encoder.encode(str)

  // 使用 SHA-256 算法计算哈希
  const hash = await window.crypto.subtle.digest('SHA-256', data)

  // 将 ArrayBuffer 转换为十六进制字符串
  const hashArray = Array.from(new Uint8Array(hash))
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')

  return hashHex
}

function App() {
  const [count, setCount] = useState(0)

  const handleImportFile = async (
    info: UploadRequestOption<Record<string, string>>
  ) => {
    const file = info.file
    // const name = file.name; // 文件名称
    if (!isExcel((file as File).name)) {
      message.error('请上传Excel文件')
      return
    }

    const reader = new FileReader()
    reader.onload = async e => {
      const data = new Uint8Array(e.target.result as ArrayBuffer)
      const workbook = XLSX.read(data, { type: 'array' })

      // 获取第一个工作表
      const worksheetName = workbook.SheetNames[0]
      const worksheet = workbook.Sheets[worksheetName]

      // 将工作表转换为 JSON 对象数组
      const headerMapKey: Record<string, string> = {
        no: '编号',
        remark: '备注',
      }
      const jsonData = XLSX.utils.sheet_to_json(worksheet)
      const jsonStr = JSON.stringify({
        data: jsonData.map(
          item =>
            ({
              no: item[headerMapKey['no']],
              remark: item[headerMapKey['remark']],
            } as ImprotRawDemoShell)
        ),
      })
      const hash = await hashStr(jsonStr)
      localStorage.setItem(hash, jsonStr)
      window.open(`/import-demo/${hash}`, '_blank')
    }
    reader.readAsArrayBuffer(file as Blob)
  }

  return (
    <>
      <div>
        <a href="https://vitejs.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount(count => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <div className="card">
        <Upload
          key="res-import"
          name="file"
          customRequest={options => handleImportFile(options)}
          accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
          showUploadList={false}
        >
          <Button icon={<UploadOutlined />}>Click to Upload</Button>
        </Upload>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  )
}

export default App


