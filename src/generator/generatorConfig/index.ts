import { Grit } from '..'
import { Action, Actions } from '../actions'
import { Completed } from '../completed'
import { Data } from '../data'
import { PluginConfig } from '../plugins'
import { Prepare } from '../prepare'
import { Prompt, Prompts } from '../prompts'

/*********************TYPES**********************/

type DataType = Record<string, any>

interface GeneratorConfig<T extends Record<string, any> = Record<string, any>> {
	/**
	 * Generator description
	 * Used in CLI output
	 */
	description?: string
	/**
	 * Check updates for npm generators
	 * Defaults to `true`
	 */
	updateCheck?: boolean
	/**
	 * Transform template content with `ejs`
	 * Defaults to `true`
	 */
	transform?: boolean
	/**
	 * Directory to template folder
	 * Defaults to `./template` in your generator folder
	 */
	templateDir?: string
	/**
	 * Run some operations before running actions
	 */
	prepare?: (this: Prepare, ctx: Grit) => Promise<void> | void
	/**
	 * Use prompts to ask questions before generating project
	 */
	prompts?:
		| Prompt[]
		| ((
				this: Prompts,
				ctx: Grit
		  ) => Prompt[] | Promise<Prompt[]> | void | Promise<void>)
	/**
	 * configure the use of plugins in the generator
	 */
	plugins?: PluginConfig<T>
	/**
	 * Extra data to use in template transformation
	 */
	data?: (
		this: Data,
		ctx: Grit
	) => DataType | Promise<DataType> | void | Promise<void>
	/**
	 * Use actions to control how files are generated
	 */
	actions?:
		| Action[]
		| ((
				this: Actions,
				ctx: Grit
		  ) => Action[] | Promise<Action[]> | void | Promise<void>)
	/**
	 * Run some operations when completed
	 * e.g. log some success message
	 */
	completed?: (this: Completed, ctx: Grit) => Promise<void> | void
}

/*********************EXPORTS**********************/

export { DataType, GeneratorConfig }
