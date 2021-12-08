import { getGenerator, Grit } from '@/index'
import path from 'path'

let grit: Grit

describe('Completed sections', () => {
	beforeEach(async () => {
		grit = await getGenerator({
			generator: path.join(__dirname, 'fixtures'),
		})
	})

	it('should overwrite answers in the completed section', async () => {
		grit.answers = { completed: 'no', name: 'test' }

		await grit.run()
		expect(grit.answers).toEqual({ completed: 'yes' })
	})
})
