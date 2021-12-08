import { GeneratorConfig, Grit } from '@/index'

/*********************TYPES**********************/

/*********************METHODS**********************/

/**
 * Gather information, Execute custom functionality or inject data before the generator is run.
 */
class Prepare {
	private grit: Grit

	constructor(context: Grit) {
		this.grit = context
	}

	async run(
		grit: Grit = this.grit,
		config: GeneratorConfig['prepare'] = this.grit.opts.config.prepare
	): Promise<void> {
		// Runs completed section from the generator config
		typeof config === 'function' && (await config.call(this, grit))
	}

	/**
	 * Runtime availiable methods
	 */

	/**
	 * Runtime availiable Properties
	 */
}

/*********************EXPORTS**********************/

export { Prepare }
