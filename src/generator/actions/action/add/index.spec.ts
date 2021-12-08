import { Grit } from '@/generator'
import { getGenerator } from '@/generator/getGenerator'
import path from 'path'
import { addAction } from '.'
import { createAction } from '../../createAction'

let grit: Grit

describe('Add Action', () => {
	beforeEach(async () => {
		grit = await getGenerator({
			generator: path.join(__dirname, 'fixtures', 'generator'),
			mock: true,
		})
	})

	it('should add everything from template to outDir', async () => {
		const action = createAction.add({
			files: '**',
			templateDir: path.join(__dirname, 'fixtures', 'generator', 'template'),
			transform: false,
		})

		await addAction(grit, action)

		await expect(grit.hasOutputFile('foo.txt')).resolves.toBeTruthy()
		await expect(grit.hasOutputFile('bar.json')).resolves.toBeTruthy()
	})

	it('should transform file', async () => {
		const action = createAction.add({
			files: '**',
			templateDir: path.join(__dirname, 'fixtures', 'generator', 'template'),
		})

		const name = 'Tim'

		grit.answers = { name }

		await addAction(grit, action)

		await expect(grit.readOutputFile('foo.txt')).resolves.toEqual(name)

		const output = await grit.readOutputFile('bar.json')
		expect(output).toEqual({ bar: name })
	})

	it('should exclude foo.txt from transform', async () => {
		const action = createAction.add({
			files: '**',
			templateDir: path.join(__dirname, 'fixtures', 'generator', 'template'),
			transformExclude: ['foo.txt'],
		})

		const name = 'Tim'

		grit.answers = {
			name,
		}

		await addAction(grit, action)

		await expect(grit.readOutputFile('foo.txt')).resolves.toEqual('<%= name %>')

		const output = await grit.readOutputFile('bar.json')
		expect(output).toEqual({ bar: name })
	})

	it('should include only foo.txt for transform', async () => {
		const action = createAction.add({
			files: '**',
			templateDir: path.join(__dirname, 'fixtures', 'generator', 'template'),
			transformInclude: ['foo.txt'],
		})

		const name = 'Tim'

		grit.answers = {
			name,
		}

		await addAction(grit, action)

		await expect(grit.readOutputFile('foo.txt')).resolves.toEqual(name)

		const output = await grit.readOutputFile('bar.json')
		expect(output).toEqual({ bar: '<%= name %>' })
	})

	it('should use data function to transform files', async () => {
		const name = 'Tim'
		const action = createAction.add({
			files: '**',
			templateDir: path.join(__dirname, 'fixtures', 'generator', 'template'),
			data: () => ({ name }),
		})

		await addAction(grit, action)

		await expect(grit.readOutputFile('foo.txt')).resolves.toEqual(name)

		const output = await grit.readOutputFile('bar.json')
		expect(output).toEqual({ bar: name })
	})
})
