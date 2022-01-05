import { aliyun } from "./aliyun"
import { config } from "./config"
import { ISetRecordOption } from "./dec"
import { getip4, getip6 } from "./ip"
import { log } from "./log"

//默认时间间隔
const DEFAULT_TIMEOUT = 60 * 60

//系统配置
let sysConfig: { timeout?: string } = {} as any


//域名解析信息
interface IDomainConfig {
	name: string
	kind: 'aliyun'
	type: 'ipv4' | 'ipv6'
	domain: string
	record: string
}

//域名解析列表
const domains: Array<IDomainConfig> = []

/**
 * 解析
 * @param conf 解析配置
 * @param ip ip地址
 */
async function resolve(conf: IDomainConfig, ip: string) {
	try {
		const req: ISetRecordOption = { ...conf, value: ip }
		const name = `${req.value} → ${req.record}.${req.domain}`
		if (await aliyun.setRecord(req)) log.print(`主机记录解析成功: ${name}`)
		else log.print(`忽略主机记录: ${name}`)
	} catch (err: any) {
		log.print(err.message)
	}
}

/**
 * 监听ip地址
 * @param callback 回调函数
 */
function listenIP(callback: (type: 'ipv4' | 'ipv6', ip: string) => any) {
	//获取时间戳
	const unix = () => parseInt(Date.now() / 1000 as any)

	//ip状态
	let ips = { ipv4: '', ipv6: '' }
	let times = { ipv4: unix(), ipv6: unix() }
	let loading = { ipv4: false, ipv6: false }

	//超时时间
	let timeout = sysConfig?.timeout || DEFAULT_TIMEOUT
	if (typeof timeout != "number") timeout = parseInt(timeout)

	//自动获取ip地址
	const getIp = async (type: 'ipv4' | 'ipv6') => {
		//时间检测
		if (ips[type] && unix() - times[type] < timeout) return			//时间没到
		if (loading[type]) return										//正在获取

		loading[type] = true
		try {
			await (async () => {
				//获取ip
				const ip = await (type == 'ipv4' ? getip4() : getip6())
				if (!ip) return

				//更新ip
				if (ips[type] == ip) return
				ips[type] = ip
				times[type] = unix()

				await callback(type, ips[type])
			})()

		} catch (err: any) {
			console.error(err)
		}


		loading[type] = false
	}

	//获取ip地址
	const getIPs = () => {
		getIp('ipv4')
		getIp('ipv6')
	}

	//每秒钟检测一次
	setInterval(getIPs, 1000)
	getIPs()
}

//入口
async function main(args: Array<string>) {
	//配置文件
	const confFile = args[0]
	if (!confFile) return -1
	const configs = config(args[0])
	Object.keys(configs).forEach(group => {
		const conf = configs[group]
		//阿里云配置
		if (group == 'config.aliyun') return aliyun.config(conf as any)
		//添加域名
		const match = group.match(/^ddns\.([\s\S]+)$/)
		if (match) domains.push({ name: match[1], ...conf } as any)
	})

	//监听ip地址改变
	log.print('开始监听本机IP地址')
	listenIP((type, ip) => {
		//解析域名
		log.print(`取得本机${type}地址: ${ip}`)
		domains.filter(d => d.type == type).forEach(d => resolve(d, ip))
	})
}

main(process.argv.splice(2)).catch(e => {
	console.error(e)
	process.exit(-1)
})