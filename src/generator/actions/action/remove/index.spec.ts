import { getGenerator } from '@/generator/getGenerator'
import { Grit } from '@/generator/index'
import { writeFileSync } from 'fs'
import path from 'path'
import { removeAction } from '.'
import { createAction } from '../../createAction'

let grit: Grit

const fixturePath = path.resolve(__dirname, 'fixtures', 'generator')

describe('Remove Action', () => {
	beforeEach(async () => {
		grit = await getGenerator({
			generator: fixturePath,
			mock: true,
		})
	})

	afterEach(async () => {
		writeFileSync(path.join(fixturePath, 'foo.txt'), 'foo')
	})

	it('should remove file from output directory', async () => {
		const action = createAction.remove({
			files: 'foo.txt',
		})

		await grit.run()

		await expect(grit.hasOutputFile('foo.txt')).resolves.toBeTruthy()

		await removeAction(grit, action)

		await expect(grit.hasOutputFile('foo.txt')).resolves.toBeFalsy()
	})
})
