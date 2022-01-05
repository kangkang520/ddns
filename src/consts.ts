import fs from 'fs'
import path from 'path'
import os from 'os'

export namespace consts {
	export const homedir = path.join(os.homedir(), '.ddns')
	if (!fs.existsSync(homedir)) fs.mkdirSync(homedir, { recursive: true })
}