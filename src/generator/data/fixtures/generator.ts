import { GeneratorConfig } from '@/index'

const config: GeneratorConfig = {
	data() {
		this.add({ name: 'Tim' })

		return { foo: 'bar' }
	},
}

module.exports = config
