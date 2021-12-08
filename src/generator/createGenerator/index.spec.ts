
import path from 'path'
import { getGenerator } from '../getGenerator'

describe('Name of the group', () => {
	it('should pass', async () => {
		await getGenerator({ generator: path.resolve(__dirname, './fixtures') })

		expect(true).toBe(true)
	})
})
