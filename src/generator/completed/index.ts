import { GeneratorConfig, Grit } from '@/index'

export class Completed {
	private grit: Grit

	constructor(context: Grit) {
		this.grit = context
	}

	async run(
		grit: Grit = this.grit,
		config: GeneratorConfig['completed'] = this.grit.opts.config.completed
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
