import http from 'http'
import https from 'https'

//进行请求
function request(url: string) {
	return new Promise<Buffer>((resolve, reject) => {
		const get = /^https:\/\//.test(url) ? https.get : http.get
		const req = get(url, { timeout: 10000 }, res => {
			const buffers: Array<Buffer> = []
			res.on('data', d => buffers.push(d))
			res.once('end', () => {
				resolve(Buffer.concat(buffers))
			})
			res.once('error', e => reject(e))
		})
		req.once('error', e => reject(e))
		req.once('timeout', () => reject(new Error('Timeout')))
	})
}

/**
 * 获取ipv4地址
 * @returns ipv4地址
 */
export async function getip4(): Promise<string | null> {
	try {
		const body = await request(`http://ipv4.lookup.test-ipv6.com/ip/?testdomain=test-ipv6.com&testname=test_asn4`)
		return JSON.parse(body + '').ip
	} catch (err) {
		return null
	}
}

/**
 * 获取ipv6地址
 * @returns ipv6地址
 */
export async function getip6(): Promise<string | null> {
	try {
		const body = await request(`http://ipv6.lookup.test-ipv6.com/ip/?testdomain=test-ipv6.com&testname=test_asn6`)
		return JSON.parse(body + '').ip
	} catch (err) {
		return null
	}
}