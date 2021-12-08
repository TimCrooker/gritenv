import JoyCon from 'joycon'
import { PluginFileConfig } from '../pluginFileConfig'
import pa from 'path'
import { defaultPluginFile } from '..'
import { globalRequire } from 'youtill'
import { PLUGIN_FILE_NAME } from '@/config'

/*********************METHODS**********************/

const joycon = new JoyCon({
	files: PLUGIN_FILE_NAME,
})

/** load the generator config file */
const loadPluginConfig = async (
	cwd: string
): Promise<{ filePath: string; data: PluginFileConfig<unknown> }> => {
	const { path } = await joycon.load({
		cwd,
		stopDir: pa.dirname(cwd),
	})

	if (!path) throw new Error(`No plugin file found`)

	const data = path ? await globalRequire(path) : defaultPluginFile

	return { filePath: path, data }
}

/** Check generator has config file */
const hasPluginConfig = (cwd: string): boolean => {
	return Boolean(
		joycon.resolve({
			cwd,
			stopDir: pa.dirname(cwd),
		})
	)
}

/*********************EXPORTS**********************/

export { loadPluginConfig, hasPluginConfig }
