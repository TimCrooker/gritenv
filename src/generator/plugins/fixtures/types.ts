import { PluginFileConfig } from '../pluginFile'

export const extendBase = {
	_app: {
		import: '',
	},
	_docs: {
		import: [],
	},
	_footer: 0,
}

export type ExtendBase = typeof extendBase

export type PluginFile = PluginFileConfig<ExtendBase>
