import { GeneratorConfig } from '@/generatorConfig'

export const defaultGeneratorFile: GeneratorConfig = {
	templateDir: '.',
	actions: [
		{
			type: 'add',
			files: '**',
		},
	],
	async completed(grit) {
		grit.gitInit()
		if (await grit.hasOutputFile('package.json')) {
			await grit.npmInstall()
		}
		grit.showProjectTips()
	},
}
