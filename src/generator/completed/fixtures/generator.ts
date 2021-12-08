import { GeneratorConfig } from '@/index'

const config: GeneratorConfig = {
	completed(grit) {
		grit.answers = { completed: 'yes' }
	},
}

module.exports = config
