import { getGenerator } from '@/getGenerator'
import path from 'path'

describe('Name of the group', () => {
	it('should pass', async () => {
		await getGenerator({ generator: path.resolve(__dirname, './fixtures') })

		expect(true).toBe(true)
	})
})
