/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { GeneratorConfig } from '@/generator/generatorConfig'
import path from 'path'

const generator = {
	prompts(grit) {
		this.input({
			name: 'name',
			message: 'What is the name of the project',
			default: path.basename(grit.outDir),
			filter: (val) => val.toLowerCase(),
		}),
			this.input({
				name: 'description',
				message: 'How would you describe the project',
				default: `my awesome new project`,
			}),
			this.confirm({
				plugin: true,
				name: 'pluginTemplate',
				message: 'Would you like to use plugins in the new generator?',
				default: true,
			})
		this.input({
			name: 'username',
			message: 'What is your GitHub username',
			default: grit.gitUser.username || grit.gitUser.name,
			filter: (val) => val.toLowerCase(),
			store: true,
		}),
			this.input({
				name: 'email',
				message: 'What is your email?',
				default: grit.gitUser.email,
				store: true,
			}),
			this.input({
				name: 'website',
				message: 'The URL of your website',
				default(answers) {
					return `github.com/${answers.username}`
				},
				store: true,
			})
	},
	actions() {
		this.add({
			files: '**',
			transformExclude: ['template/**'],
		}),
			this.move({
				patterns: {
					gitignore: '.gitignore',
					'_package.json': 'package.json',
				},
			})
	},
	async completed(grit) {},
} as GeneratorConfig

export default generator
