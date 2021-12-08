import { getGenerator } from '@/getGenerator'
import { Grit } from '@/generator'
import path from 'path'
import { copyAction } from '.'
import { createAction } from '../../createAction'

// jest.mock('@/index')
let grit: Grit

describe('Copy Action', () => {
	beforeEach(async () => {
		grit = await getGenerator({
			generator: path.join(__dirname, 'fixtures', 'generator'),
			mock: true,
		})
	})

	it('should copy file to output', async () => {
		const action = createAction.copy({
			patterns: {
				'foo.txt': 'newDir/foo.txt',
			},
		})

		await grit.run()

		await copyAction(grit, action)

		const hasFile = await grit.hasOutputFile('newDir/foo.txt')

		expect(hasFile).toBeTruthy()
	})

	it('should error on overwrite', async () => {
		const action = createAction.copy({
			patterns: {
				'foo.txt': 'foo.txt',
			},
			overwrite: false,
		})

		await grit.run()

		await expect(copyAction(grit, action)).rejects.toThrow()
	})

	it('should copy and rename file', async () => {
		const action = createAction.copy({
			patterns: {
				'foo.txt': 'fo.txt',
			},
		})

		await grit.run()

		await copyAction(grit, action)

		const hasFile = await grit.hasOutputFile('fo.txt')

		expect(hasFile).toBeTruthy()
	})
})
