import { GeneratorConfig } from '@/index'

const config: GeneratorConfig = {
	prompts() {
		this.number({
			name: 'number',
			message: 'Put in a number baby',
			default: 14,
		})
	},
}

module.exports = config
