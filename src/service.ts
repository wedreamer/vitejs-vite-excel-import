import { BulkDemoDto } from './types/dto'

const request = (
  url: string,
  axiosConfig: Record<string, string> | { data: BulkDemoDto[] },
  returnData?: Record<string, string>[]
) => Promise.resolve(returnData ?? [])

export const createMethylationsBulk = async (data: BulkDemoDto[]) => {
  return request('/demo/bulk', {
    method: 'PATCH',
    data,
  })
}

export const createMethylationsSniff = async (data: BulkDemoDto[]) => {
  return request('/methylations/sniff', {
    method: 'POST',
    data,
  })
}

