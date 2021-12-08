
import { Grit } from '@/generator'
import { getGenerator } from '@/generator/getGenerator'
import path from 'path'
import { modifyAction } from '.'
import { createAction } from '../../createAction'

let grit: Grit

describe('Modify Action', () => {
	beforeEach(async () => {
		grit = await getGenerator({
			generator: path.join(__dirname, 'fixtures', 'generator'),
			mock: true,
		})
	})

	it('should modify text file contents', async () => {
		const action = createAction.modify({
			files: ['foo.txt'],
			handler: (data, filepath) => {
				return 'bar'
			},
		})

		await grit.run()

		await expect(grit.hasOutputFile('foo.txt')).resolves.toBeTruthy()

		await expect(grit.readOutputFile('foo.txt')).resolves.toBe('foo')

		await modifyAction(grit, action)

		await expect(grit.readOutputFile('foo.txt')).resolves.toBe('bar')
	})

	it('should modify JSON file contents', async () => {
		const action = createAction.modify({
			files: ['bar.json'],
			handler: (data, filepath) => {
				console.log(data, filepath)
				return { bar: true }
			},
		})

		await grit.run()

		await expect(grit.hasOutputFile('bar.json')).resolves.toBeTruthy()

		const beforeModify = await grit.readOutputFile('bar.json')

		expect(beforeModify).toEqual({
			bar: false,
		})

		await modifyAction(grit, action)

		const afterModify = await grit.readOutputFile('bar.json')

		expect(afterModify).toEqual({
			bar: true,
		})
	})
})
