import { PLUGIN_FILE_NAME, PLUGIN_MERGE_FILES } from '@/config'
import { Grit } from '@/index'
import {
	handleIgnore,
	mergePackages,
	mergePluginJsonFiles,
} from '@/generator/plugins/mergePlugins'
import chalk from 'chalk'
import path from 'path'
import { Action, ActionProvider } from '../actions'
import { AddAction } from '../actions/action'
import { DataProvider } from '../data'
import { Answers, Prompt } from '../prompts/prompt'
import { hasPluginConfig, loadPluginConfig } from './pluginFile/getPluginFile'
import { PluginFileConfig } from './pluginFile/pluginFileConfig'
import { mergeObjects, pathExists, pathExistsSync } from 'youtill'
import { defaultPluginFile } from './pluginFile'

/*********************TYPES**********************/

interface Ignore {
	/**
	 * List of plugins that the ignore applies to
	 * Defaults to all plugins
	 */
	plugin?: string[]
	/**
	 * function to determine if the files in the pattern should be ignored
	 *
	 * @param answers answers to the prompts
	 *
	 * @returns true if the file should be ignored
	 */
	when: (answers: Answers) => boolean
	/**'
	 * Glob pattern to match files to ignore
	 *
	 * @example ['**\/*.ts', '**\/*.js'] will ignore all files with a .ts or .js extension
	 */
	pattern: string[]
}

interface PluginConfig<T extends Record<string, any>> {
	/**
	 * The defined structure of data to inject in to the generator outputFile
	 * This is used for putting data directly into any file via EJS transformations
	 */
	extend?: T
	/**
	 * List of files to ignore when moving plugins into the main generator output Directory
	 */
	ignores?: Ignore[]
	/**
	 * List of JSON fileNames to merge when moving plugins into the main generator output Directory
	 */
	mergeFiles?: string[]
}

type PluginData = {
	name: string
	dirPath: string
	pluginFileData: PluginFileConfig
}

interface PluginsOptions {
	context: Grit
	selectedPlugins?: string[]
}

/*********************METHODS**********************/

class Plugins {
	grit: Grit
	/** absolute path to the directory containing all of the plugins */
	pluginsDir: string
	/** list of the plugins the user selected in the prompting section of the generator */
	selectedPlugins: string[]
	pluginData: PluginData[] = []
	/** user provided list of ignore objects to conditionally ignore files and directories */
	ignores: Ignore[]
	/** user provided list of json files to merge */
	mergeFiles: string[]
	/** user provided base structure for the extend object */
	baseExtend: Record<string, any>

	constructor(options: PluginsOptions) {
		const config = options.context.opts.config.plugins

		this.grit = options.context
		this.pluginsDir = path.resolve(this.grit.generator.path, 'plugins')
		this.selectedPlugins =
			options.selectedPlugins ||
			this.getSelectedPlugins(this.grit.prompts, this.grit.answers)

		this.baseExtend = config?.extend || {}
		this.ignores = config?.ignores || []
		this.mergeFiles = config?.mergeFiles || []

		// Check if the pluginsDir exists and if not then throw error
		if (this.selectedPlugins.length > 0 && !pathExistsSync(this.pluginsDir)) {
			throw new Error(`Plugins directory does not exist at ${this.pluginsDir}`)
		}
	}

	/**
	 * parse the prompts and answers to find which prompts are
	 * indicating plugins and return a list of plugins the user selected
	 */
	getSelectedPlugins(prompts: Prompt[], answers: Answers): string[] {
		// get the list of prompts where it is of type list or chekcbox and plugin property is set to true
		const pluginPrompts = prompts.filter((prompt) => {
			if (
				prompt.type === 'list' ||
				prompt.type === 'checkbox' ||
				prompt.type === 'confirm'
			) {
				return prompt.plugin === true
			}
		})

		// get answers where the key is equal to the name of a propmt in pluginPrompts
		const pluginAnswers = pluginPrompts.reduce((acc, prompt) => {
			acc[prompt.name] = answers[prompt.name]
			return acc
		}, {})

		// get an array of plugins from the pluginAnswers values
		const plugins = Object.entries(pluginAnswers)
			.reduce((acc: string[], [key, value]) => {
				if (typeof value === 'boolean' && value) return [...acc, key]
				if (typeof value === 'string') return [...(acc as string[]), value]
				if (Array.isArray(value)) return [...(acc as string[]), ...value]
				return acc
			}, [])
			.filter((value: string) => value !== 'none')

		return plugins
	}

	/** parse the selected plugins and load data about them */
	async loadPlugins(plugins = this.selectedPlugins): Promise<this> {
		const pluginData: PluginData[] = []
		// load plugin data for selected plugins
		for (const plugin of plugins) {
			// check if selected plugin exists
			const pluginPath = path.join(this.pluginsDir, plugin)
			if (!(await pathExists(pluginPath))) {
				throw new Error(`Plugin ${plugin} does not exist`)
			}

			// ensure plugin has a pluginfile
			if (!hasPluginConfig(pluginPath)) {
				throw new Error(`Plugin ${plugin} does not have a pluginfile`)
			}

			// load plugin file
			let pluginFileData: PluginFileConfig<unknown>
			try {
				const { data } = await loadPluginConfig(pluginPath)
				pluginFileData = data
			} catch (e) {
				pluginFileData = defaultPluginFile
			}

			// add plugin data to pluginData array
			pluginData.push({
				name: plugin,
				dirPath: pluginPath,
				pluginFileData,
			})
		}

		this.pluginData = pluginData

		return this
	}

	/** for each pluginData run the addAction function */
	async addPluginActions(): Promise<ActionProvider> {
		//ensure all strings in mergedFiles have the .json extension
		for (const file of this.mergeFiles) {
			if (!file.endsWith('.json')) {
				throw new Error(
					`Invalid merge file: ${chalk.cyan(
						file
					)}. Merge files must have a .json extension`
				)
			}
		}

		const mergeFiles = [...PLUGIN_MERGE_FILES, ...this.mergeFiles]

		const pluginActions: Action[] = []

		return (grit: Grit): Action[] => {
			try {
				// Merge plugins files
				pluginActions.push(
					// for each pluginData run the addAction function
					...this.pluginData.map((plugin) => {
						const action = {
							type: 'add',
							files: '**',
							templateDir: plugin.dirPath,
						} as AddAction

						action.filters = {}

						// dont add `pluginfile` to output
						for (const filename of PLUGIN_FILE_NAME) {
							action.filters[filename] = false
						}

						// ignore generator supplied ignores
						const filters = handleIgnore(
							this.ignores,
							grit.answers,
							plugin.name
						)
						action.filters = { ...action.filters, ...filters }

						// ignore common json config files to they can be merged later
						for (const filename of mergeFiles) {
							action.filters[filename] = false
						}

						return action
					})
				)

				// Sepecially handle the `package.json` file
				pluginActions.push({
					type: 'modify',
					files: 'package.json',
					handler: (fileData) => {
						return mergePackages(fileData, this.pluginData, grit.answers)
					},
				})

				// Merge plugin json files
				for (const mergeFile of mergeFiles) {
					if (mergeFile === 'package.json') continue

					pluginActions.push({
						type: 'modify',
						files: mergeFile,
						handler: (fileData) => {
							return mergePluginJsonFiles(
								fileData,
								this.pluginsDir,
								this.selectedPlugins,
								mergeFile
							)
						},
					})
				}
				return pluginActions
			} catch (e) {
				throw new Error(`Error in plugins Actions provider: ${e}`)
			}
		}
	}

	async addPluginData(): Promise<DataProvider> {
		return (grit): Record<string, any> => {
			// combine the data extends of the plugins
			try {
				const pluginExtends = this.pluginData.map((plugin) => {
					const extend = plugin.pluginFileData.extend
					if (extend) {
						return typeof extend === 'function' ? extend(grit.answers) : extend
					}
					return {}
				})

				const mergedExtends = mergeObjects(this.baseExtend, pluginExtends)
				return {
					...mergedExtends,
					selectedPlugins: this.selectedPlugins,
				}
			} catch (e) {
				throw new Error(`Error in plugins Data provider: ${e}`)
			}
		}
	}
}

/*********************EXPORTS**********************/

export { Plugins }

export { Ignore, PluginConfig, PluginData }

export * from './pluginFile'
