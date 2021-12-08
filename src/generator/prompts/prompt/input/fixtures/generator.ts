import { GeneratorConfig } from '@/index'

const config: GeneratorConfig = {
	prompts() {
		this.input({
			name: 'input',
			message: 'Input something today',
			default: 'input',
		})
	},
}

module.exports = config
