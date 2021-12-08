import { GeneratorConfig } from '@/index'

const config: GeneratorConfig = {
	prompts() {
		this.list({
			name: 'list',
			message: 'Put in a selection baby',
			choices: [
				{ name: 'item1', value: 'item1' },
				{ name: 'item2', value: 'item2' },
			],
			default: 'item1',
		})
	},
}

module.exports = config
