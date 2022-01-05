const path = require('path')
const tsNode = require('ts-node')

tsNode.register({
	project: path.join(__dirname, 'tsconfig.json'),
	files: true,
})

require('./src/index.ts')