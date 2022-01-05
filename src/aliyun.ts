import Dns, * as $Dns from '@alicloud/alidns20150109'
import * as $OpenApi from '@alicloud/openapi-client'
import { ISetRecordOption } from "./dec"


export namespace aliyun {

	export interface IConfigOption {
		AccessKeyID: string
		AccessKeySecret: string
	}

	let AccessKeyID: string = ''
	let AccessKeySecret: string = ''

	export function config(conf: IConfigOption) {
		AccessKeyID = conf.AccessKeyID
		AccessKeySecret = conf.AccessKeySecret
	}

	export async function setRecord(option: ISetRecordOption) {
		//没有配置，忽略
		if (!AccessKeyID || !AccessKeySecret) return false

		//客户端
		const client = (() => {
			let config = new $OpenApi.Config({});
			config.accessKeyId = AccessKeyID;
			config.accessKeySecret = AccessKeySecret;
			return new Dns(config);
		})()

		//获取记录
		const record = await (async () => {
			let req = new $Dns.DescribeDomainRecordsRequest({})
			// 主域名
			req.domainName = option.domain
			// 主机记录
			req.RRKeyWord = option.record
			// 解析记录类型
			req.type = option.type == 'ipv4' ? 'A' : 'AAAA'
			try {
				let resp = await client.describeDomainRecords(req)
				return resp.body.domainRecords?.record?.[0] || null
			} catch (err: any) {
				throw new Error(`获取主机记录失败: ${err.message}`)
			}
		})()

		//添加记录
		if (!record) {
			// 修改解析记录
			let req = new $Dns.AddDomainRecordRequest({});
			//域名
			req.domainName = option.domain
			// 主机记录
			req.RR = option.record;
			// 主机记录值
			req.value = option.value;
			// 解析记录类型
			req.type = option.type == 'ipv4' ? 'A' : 'AAAA'

			//开始添加
			try {
				await client.addDomainRecord(req)
			} catch (err: any) {
				throw new Error(`添加主机记录失败: ${err.message}`)
			}
		}

		//修改记录
		else if (record.value != option.value) {
			// 修改解析记录
			let req = new $Dns.UpdateDomainRecordRequest({})
			// 主机记录
			req.RR = option.record
			// 记录ID
			req.recordId = record.recordId
			// 主机记录值
			req.value = option.value
			// 解析记录类型
			req.type = option.type == 'ipv4' ? 'A' : 'AAAA'

			//保存
			try {
				await client.updateDomainRecord(req)
			} catch (err: any) {
				throw new Error(`修改主机记录失败: ${err.message}`)
			}
		}

		//无变动，不需要处理
		else return false

		return true
	}

}