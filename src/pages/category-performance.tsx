import * as React from 'react'
import dynamic from 'next/dynamic'
import styled from 'styled-components'
import { Header } from '~/Theme'
import Layout from '~/layout'
import { ProtocolsChainsSearch } from '~/components/Search'
import { maxAgeForNext } from '~/api'
import { getCategoryPerformance } from '~/api/categories/protocols'
import { withPerformanceLogging } from '~/utils/perf'

import type { IBarChartProps } from '~/components/ECharts/types'
import { TableWithSearch } from '~/components/Table/TableWithSearch'
import { PerformanceColumn } from '~/components/Table/Defi/columns'
import { primaryColor } from '~/constants/colors'
import { Denomination, Filters } from '~/components/ECharts/ProtocolChart/Misc'

const BarChart = dynamic(() => import('~/components/ECharts/BarChart/NonTimeSeries'), {
	ssr: false
}) as React.FC<IBarChartProps>

const ChartsContainer = styled.div`
	background-color: ${({ theme }) => theme.advancedBG};
	border: 1px solid ${({ theme }) => theme.bg3};
	border-radius: 8px;
`

const TabContainer = styled.div`
	padding: 16px;
	display: flex;
	flex-direction: column;
	gap: 16px;
	min-height: 360px;
`

const TotalLocked = styled(Header)`
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 16px;
	flex-wrap: wrap;

	& > *:last-child {
		font-family: var(--font-jetbrains);
	}
`

export const getStaticProps = withPerformanceLogging('category-performance', async () => {
	const performance = await getCategoryPerformance()

	return {
		props: { ...performance },
		revalidate: maxAgeForNext([22])
	}
})

const PageView = ({ categoryPerformance }) => {
	const [groupBy, setGroupBy] = React.useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('weekly')

	categoryPerformance = categoryPerformance.sort((a, b) => b.wavg1W - a.wavg1W)

	const averages = categoryPerformance.map((i) => [i.categoryName, i.wavg1W.toFixed(2)])

	return (
		<>
			<ProtocolsChainsSearch step={{ category: 'Home', name: 'Category Performance' }} />

			<TotalLocked>
				<span>Average Category Performance</span>
			</TotalLocked>

			<ChartsContainer>
				<TabContainer>
					<>
						<Filters color={primaryColor} style={{ marginLeft: 'auto' }}>
							<Denomination as="button" active={groupBy === 'daily'} onClick={() => setGroupBy('daily')}>
								Daily
							</Denomination>

							<Denomination as="button" active={groupBy === 'weekly'} onClick={() => setGroupBy('weekly')}>
								Weekly
							</Denomination>

							<Denomination as="button" active={groupBy === 'monthly'} onClick={() => setGroupBy('monthly')}>
								Monthly
							</Denomination>

							<Denomination as="button" active={groupBy === 'yearly'} onClick={() => setGroupBy('yearly')}>
								Yearly
							</Denomination>
						</Filters>

						<BarChart title="" chartData={averages} valueSymbol="%" height="480px" />
					</>
				</TabContainer>
			</ChartsContainer>

			<TableWithSearch
				data={categoryPerformance}
				columns={PerformanceColumn}
				columnToSearch={'categoryName'}
				placeholder={'Search category...'}
			/>
		</>
	)
}

export default function CategoryPerformance(props) {
	return (
		<Layout title={`Category Performance - DefiLlama`} defaultSEO>
			<PageView {...props} />
		</Layout>
	)
}
