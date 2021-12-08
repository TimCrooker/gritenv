import { getGenerator } from '@/getGenerator'
import { Grit } from '@/generator/index'
import path from 'path'
import { removeAction } from '.'
import { createAction } from '../../createAction'

let context: Grit

describe('Remove Action', () => {
	beforeEach(async () => {
		context = await getGenerator({
			generator: path.join(__dirname, 'fixtures', 'generator'),
			mock: true,
		})
	})

	it('should remove file from output directory', async () => {
		const action = createAction.remove({
			files: 'foo.txt',
		})

		await context.run()

		await expect(context.hasOutputFile('foo.txt')).resolves.toBeTruthy()

		await removeAction(context, action)

		await expect(context.hasOutputFile('foo.txt')).resolves.toBeFalsy()
	})
})
