import { GeneratorConfig } from '@/index'

const config: GeneratorConfig = {
	prompts() {
		this.confirm({
			name: 'confirm',
			message: 'Are you sure you want to confirm',
			default: true,
		})
	},
}

module.exports = config
