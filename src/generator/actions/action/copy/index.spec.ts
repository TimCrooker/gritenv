import { Grit } from '@/generator'
import { getGenerator } from '@/generator/getGenerator'
import { writeFileSync } from 'fs'
import path from 'path'
import { copyAction } from '.'
import { createAction } from '../../createAction'

// jest.mock('@/index')
let grit: Grit

const fixturePath = path.resolve(__dirname, 'fixtures')

describe('Copy Action', () => {
	beforeEach(async () => {
		grit = await getGenerator({
			generator: fixturePath,
			mock: true,
		})
	})

	afterEach(async () => {
		writeFileSync(path.join(fixturePath, 'foo.txt'), 'foo')
		writeFileSync(
			path.join(fixturePath, 'bar.json'),
			JSON.stringify({
				bar: false,
			})
		)
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
