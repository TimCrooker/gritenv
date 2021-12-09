import { getGenerator } from '@/generator/getGenerator'
import { Grit } from '@/generator/index'
import { writeFileSync } from 'fs'
import path from 'path'
import { moveAction } from '.'
import { createAction } from '../../createAction'

let grit: Grit

const fixturePath = path.resolve(__dirname, 'fixtures')

describe('move Action', () => {
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

	it('should move file to output', async () => {
		const action = createAction.move({
			patterns: {
				'foo.txt': 'newDir/foo.txt',
			},
		})

		await grit.run()

		await moveAction(grit, action)

		const hasFile = await grit.hasOutputFile('newDir/foo.txt')

		expect(hasFile).toBeTruthy()
	})

	it('should remove old item', async () => {
		const action = createAction.move({
			patterns: {
				'foo.txt': 'newDir/foo.txt',
			},
		})

		await grit.run()

		await moveAction(grit, action)

		await expect(grit.hasOutputFile('foo.txt')).resolves.toBeFalsy()
	})

	it('should error on overwrite', async () => {
		const action = createAction.move({
			patterns: {
				'foo.txt': 'foo.txt',
			},
			overwrite: false,
		})

		await grit.run()

		await expect(moveAction(grit, action)).rejects.toThrow()
	})

	it('should succeed on overwrite', async () => {
		const action = createAction.move({
			patterns: {
				'foo.txt': 'foo.txt',
			},
		})

		await grit.run()

		await expect(moveAction(grit, action)).resolves.not.toThrow()
	})

	it('should move and rename file', async () => {
		const action = createAction.move({
			patterns: {
				'foo.txt': 'fo.txt',
			},
		})

		await grit.run()

		await moveAction(grit, action)

		const hasFile = await grit.hasOutputFile('fo.txt')

		expect(hasFile).toBeTruthy()
	})
})
