import moment from 'moment'
import fs from 'fs'
import path from 'path'
import os from 'os'
import { consts } from './consts'

//初始化目录
const logfile = path.join(consts.homedir, 'log.txt')
fs.writeFileSync(logfile, '')

export namespace log {

	export function print(str: string) {
		const log = `[${moment().format('YYYY-MM-DD HH:mm:ss')}] ${str}\n`
		fs.appendFileSync(logfile, log)
	}

}