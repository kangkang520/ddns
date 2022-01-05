import fs from 'fs'
import path from 'path'

export function config(file: string) {
	const configs: { [i: string]: { [i: string]: string } } = {}
	//读取内容并按行分割
	file = path.resolve(process.cwd(), file)
	const content = fs.readFileSync(file) + ''
	const lines = content.split(/(\r?\n)+/g).map(s => s.trim()).filter(s => !!s)

	//解析
	let current: { [i: string]: string }
	lines.forEach(line => {
		//注释
		if (line[0] == '#') return
		//分组
		if (line[0] == '[') {
			//验证
			if (!/^\[[\s\S]+\]$/.test(line)) throw new Error('Format Error')
			//重置current
			const name = line.match(/^\[([\s\S]+)\]$/)?.[1] ?? ''
			current = configs[name] = {}
		}
		//配置项
		else if (/^[a-zA-Z_][a-zA-Z_0-9]*\s*=\s*[\s\S]+$/.test(line)) {
			const mt = line.match(/^([a-zA-Z_][a-zA-Z_0-9]*)\s*=\s*([\s\S]+)$/)
			const k = mt?.[1]
			const v = mt?.[2]
			if (k && v) current[k] = v
		}
	})

	return configs
}