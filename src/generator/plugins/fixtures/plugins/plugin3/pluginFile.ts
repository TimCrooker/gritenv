import { PluginFile } from '../../types'

const config: PluginFile = {
	name: 'plugin2',
	description: 'plugin2 description',
	extend: {
		_app: {
			import: 'plugin3',
		},
	},
}

module.exports = config
