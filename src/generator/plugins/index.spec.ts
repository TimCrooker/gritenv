import path from 'path'
import { Plugins } from '.'
import { Grit } from '..'
import { getGenerator } from '../getGenerator'

let pluginsWorker: Plugins
let grit: Grit

describe('Plugins', () => {
	beforeEach(async () => {
		grit = await getGenerator({
			generator: path.resolve(__dirname, 'fixtures'),
		})

		pluginsWorker = new Plugins({
			context: grit,
			selectedPlugins: ['plugin1', 'plugin2', 'plugin3'],
		})
	})

	it('should take plugins folder', () => {
		expect(pluginsWorker.pluginsDir).toBe(
			path.resolve(__dirname, 'fixtures', 'plugins')
		)
	})

	it('should take selected plugins', () => {
		expect(pluginsWorker.selectedPlugins).toEqual([
			'plugin1',
			'plugin2',
			'plugin3',
		])
	})

	it('should load plugin data', async () => {
		await pluginsWorker.loadPlugins()

		expect(pluginsWorker.pluginData[0].name).toEqual('plugin1')
		expect(pluginsWorker.pluginData[1].name).toEqual('plugin2')
		expect(pluginsWorker.pluginData[2].name).toEqual('plugin3')
	})

	it('should create actions', async () => {
		pluginsWorker.loadPlugins()
		const actionProvider = await pluginsWorker.addPluginActions()
		expect(actionProvider).toMatchInlineSnapshot(`[Function]`)

		const result = actionProvider(
			await getGenerator({
				generator: path.resolve(__dirname, 'fixtures'),
				mock: true,
			})
		)

		expect(result).toMatchInlineSnapshot(`
      Array [
        Object {
          "files": "package.json",
          "handler": [Function],
          "type": "modify",
        },
        Object {
          "files": "tsconfig.json",
          "handler": [Function],
          "type": "modify",
        },
        Object {
          "files": ".babelrc",
          "handler": [Function],
          "type": "modify",
        },
      ]
    `)
	})

	it('Should merge json files from plugins', async () => {
		const grit = await (
			await getGenerator({
				generator: path.resolve(__dirname, 'fixtures'),
				answers: { plugin: ['plugin1', 'plugin2', 'plugin3'] },
				mock: true,
			})
		).run()

		expect(grit.data).toEqual({
			_app: {
				import: 'plugin3',
			},
			_docs: { import: [] },
			_footer: 0,
			plugin: ['plugin1', 'plugin2', 'plugin3'],
			selectedPlugins: ['plugin1', 'plugin2', 'plugin3'],
		})

		const packageOutput = await grit.readOutputFile('package.json')

		expect(packageOutput).toEqual({
			app: 'plugin3',
			docs: '',
			footer: '0',
			name: 'package',
			dependencies: {
				'package-b': '1.0.0',
				'package-d': '1.0.0',
				'package-a': '2.0.0',
			},
			devDependencies: {
				'package-c': '1.0.0',
			},
			files: [
				'package.json',
				'package-b/package.json',
				'package-c/package.json',
				'package-a/package.json',
				'newfile',
			],
		})

		const tsConfigOutput = await grit.readOutputFile('tsconfig.json')

		expect(tsConfigOutput).toEqual({
			name: 'package',
			dependencies: {
				'package-a': '1.0.0',
				'package-b': '1.0.0',
			},
			devDependencies: {
				'package-c': '1.0.0',
			},
			files: [
				'package.json',
				'package-a/package.json',
				'package-b/package.json',
				'package-c/package.json',
				'package.json',
				'package-a/package.json',
				'package-b/package.json',
				'package-c/package.json',
				'package.json',
				'package-a/package.json',
				'package-b/package.json',
				'package-c/package.json',
			],
		})
	})

	it('should provide selectedPlugins array with only plugin1', async () => {
		// const prompts: Prompt[] = [
		// 	{
		// 		type: 'list',
		// 		name: 'plugin',
		// 		plugin: true,
		// 		message: 'Select plugin',
		// 		choices: [
		// 			{
		// 				name: 'Plugin 1',
		// 				value: 'plugin1',
		// 			},
		// 			{
		// 				name: 'Plugin 2',
		// 				value: 'plugin2',
		// 			},
		// 		],
		// 	},
		// 	{
		// 		type: 'list',
		// 		name: 'notplugin',
		// 		message: 'Select plugin',
		// 		choices: [
		// 			{
		// 				name: 'Plugin 1',
		// 				value: 'plugin1',
		// 			},
		// 			{
		// 				name: 'Plugin 2',
		// 				value: 'plugin2',
		// 			},
		// 		],
		// 	},
		// ]

		// const dataProvider = await addPluginData(prompts, {
		// 	plugin: 'plugin1',
		// 	notplugin: 'plugin2',
		// })

		// const data = dataProvider(
		// 	new Grit({ config: {}, generator: 'generator', mock: true })
		// )

		// expect(data).toMatchInlineSnapshot(`
		//   Object {
		//     "selectedPlugins": Array [
		//       "plugin1",
		//     ],
		//   }
		// `)
		expect(true)
	})
})
