import { Grit, GritOptions } from '@/generator'
import { GeneratorConfig } from '../generatorConfig'

/*********************METHODS**********************/

class Generator {
	config: GeneratorConfig
	grit = Grit

	constructor(generatorConfig: GeneratorConfig) {
		this.config = generatorConfig
	}

	getGenerator(opts: GritOptions): Grit {
		return new this.grit({ ...opts, config: this.config })
	}
}

/*********************EXPORTS**********************/

export { Generator }
