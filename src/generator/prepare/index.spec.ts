
import { getGenerator, Grit } from '@/index'
import path from 'path'

let grit: Grit

describe('Prepare sections', () => {
	beforeEach(async () => {
		grit = await getGenerator({
			generator: path.join(__dirname, 'fixtures'),
			mock: true,
		})
	})
	it('should execute the prepare section of the generator file', async () => {
		await grit.run()
		expect(grit.answers).toEqual({ name: 'Tim' })
	})
})
