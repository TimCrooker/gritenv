
import { getGenerator } from '@/generator/getGenerator'
import path from 'path'

const generator = path.join(__dirname, 'fixtures')

const injectedAnswers = {
	list: 'item2',
}

describe('run checkbox prompt in generator instance', () => {
	it('Should use default for mock', async () => {
		const grit = await getGenerator({
			generator: generator,
			mock: true,
		})

		await grit.run()

		expect(grit.answers).toStrictEqual({ list: 'item1' })
	})

	it('inject answers', async () => {
		const grit = await getGenerator({
			generator: generator,
			outDir: path.join(__dirname, 'fixtures', 'output'),
			answers: injectedAnswers,
		})

		await grit.run()

		expect(grit.answers).toStrictEqual(injectedAnswers)
	})
})
