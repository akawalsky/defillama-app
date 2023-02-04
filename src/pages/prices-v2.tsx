import Layout from '~/layout'
import ReturnsPage from '~/components/YieldsPage/indexReturns'
import { maxAgeForNext } from '~/api'
import { getReturnData } from '~/api/categories/protocols'
import { useRouter } from 'next/router'

export async function getStaticProps() {
	const data = await getReturnData()

	return {
		...data,
		revalidate: maxAgeForNext([22])
	}
}

export default function PriceReturn(data) {
	const { query } = useRouter()
	const prices = query.coin ? data.priceData.coins[`coingecko:${query.coin}`]?.prices ?? [] : []

	return (
		<Layout title={`Return Calculator  - DefiLlama Yield`} defaultSEO>
			<ReturnsPage prices={prices} key={`${prices[0]?.price} ${prices.slice(-1)[0]?.price}`} />
		</Layout>
	)
}
