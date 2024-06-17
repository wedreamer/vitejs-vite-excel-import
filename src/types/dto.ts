import { Expose, Transform } from 'class-transformer'
import {
  IsNotEmpty,
  Length,
  Matches,
  IsOptional,
  IsString,
} from 'class-validator'

export class BulkDemoDto {
  // no: '编号',
  @Expose({ name: 'no' })
  @IsNotEmpty({ message: '采血管编号不能为空' })
  @Length(10, 100, { message: '采血管编号长度必须大于10位' })
  @Matches(/^(\d{10}(\/\d{10})*)$/, {
    message: `采血管编号格式不正确, 要求每位管码 10 位数字, 多个中间使用 '/' 进行连接`,
  })
  no: string

  @IsOptional()
  @IsString()
  remark?: string
}

export class ImprotRawDemoShell {
  // no: '编号',
  @IsNotEmpty({ message: '编号不能为空' })
  @Length(10, 100, { message: '编号长度必须大于10位' })
  @Matches(/^(\d{10}(\/\d{10})*)$/, {
    message: `编号格式不正确, 要求每位管码 10 位数字, 多个中间使用 '/' 进行连接`,
  })
  // 最基本的转换
  @Transform(
    ({ value }) => {
      if (!value) {
        // 等待校验报错即可
        return null
      }
      if (typeof value === 'number' ? value.toString() : value.trim()) {
        return value.toString().trim()
      } else if (typeof value === 'string') {
        return value.trim()
      }
    },
    {
      toClassOnly: true,
    }
  )
  no: string | number

  @IsOptional()
  @IsString()
  // 最基本的转换
  @Transform(({ value }) => value && String(value), {
    toClassOnly: true,
  })
  remark?: string
}
