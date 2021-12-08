import { Answers } from '@/generator/prompts/prompt'

export type Extend<T> =
	| Partial<T>
	| ((answers: Record<string, any>) => Partial<T>)

export type Package = Record<string, any>

export type Apply = (pkg: Package, answers: Answers) => Partial<Package>

export interface PluginFileConfig<T = Record<string, any>> {
	/**
	 * The name of the plugin.
	 */
	name: string
	/**
	 * Description of the plugin.
	 */
	description: string
	/**
	 * relevant URL for docs / help / links / etc. for the plugin.
	 */
	url?: string
	/**
	 * This is used to inject properties methods or really whatever you want directly into files
	 *
	 * Can be an object or a function that returns an object containing the properties you want to inject.
	 *
	 * function will recieve an object containing the answers the user provided
	 */
	extend?: Extend<T>
	/**
	 * This method is used to make direct modifications to the plugin package.json file.
	 */
	apply?: Apply
}
