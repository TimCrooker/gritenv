import { getGenerator } from '@/generator/getGenerator'
import path from 'path'

const generator = path.join(__dirname, '..')

describe('Name of the group', () => {
	it('defaults', async () => {
		const grit = await getGenerator({
			generator,
			mock: true,
			answers: {
				name: 'test',
				description: 'test',
				pluginTemplate: true,
				username: 'test',
				email: 'test',
				website: 'test',
			},
		})
		await grit.run()

		expect(await grit.getOutputFiles()).toMatchSnapshot()
	})
})
