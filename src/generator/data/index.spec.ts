import { getGenerator, Grit } from '@/index'
import path from 'path'

let grit: Grit

describe('Data sections', () => {
	beforeEach(async () => {
		grit = await getGenerator({
			generator: path.join(__dirname, 'fixtures'),
			mock: true,
		})
	})

	it('should inject data with the add function', async () => {
		await grit.run()
		expect(grit.data.name).toEqual('Tim')
	})

	it('should inject data by returning it', async () => {
		await grit.run()
		expect(grit.data.foo).toEqual('bar')
	})
})
