import * as React from 'react'
import { useRouter } from 'next/router'
import { Panel } from '~/components'
import { Dropdowns, NameYield, TableFilters, TableHeader } from '~/components/Table'
import {
	YieldAttributes,
	TVLRange,
	FiltersByChain,
	YieldProjects,
	ResetAllYieldFilters,
	attributeOptions
} from '~/components/Filters'
import { YieldsSearch } from '~/components/Search'
import { columns, fallbackColumns, fallbackList, TableWrapper } from './shared'
import { useFormatYieldQueryParams } from './hooks'

const YieldPage = ({ loading, pools, projectList, chainList }) => {
	const { query, pathname } = useRouter()
	const { minTvl, maxTvl } = query

	const { selectedProjects, selectedChains, selectedAttributes, includeTokens, excludeTokens } =
		useFormatYieldQueryParams({ projectList, chainList })

	// if route query contains 'project' remove project href
	const idx = columns.findIndex((c) => c.accessor === 'project')

	if (query.projectName) {
		columns[idx] = {
			header: 'Project',
			accessor: 'project',
			disableSortBy: true,
			Cell: ({ value, rowValues }) => (
				<NameYield
					value={value}
					project={rowValues.project}
					airdrop={rowValues.airdrop}
					projectslug={rowValues.projectslug}
					rowType="accordion"
				/>
			)
		}
	} else {
		columns[idx] = {
			header: 'Project',
			accessor: 'project',
			disableSortBy: true,
			Cell: ({ value, rowValues }) => (
				<NameYield
					value={value}
					project={rowValues.project}
					airdrop={rowValues.airdrop}
					projectslug={rowValues.projectslug}
				/>
			)
		}
	}

	const poolsData = React.useMemo(() => {
		return pools.reduce((acc, curr) => {
			let toFilter = true

			attributeOptions.forEach((option) => {
				// check if this page has default attribute filter function
				if (option.defaultFilterFnOnPage[pathname]) {
					// apply default attribute filter function
					toFilter = toFilter && option.defaultFilterFnOnPage[pathname](curr)
				}
			})

			selectedAttributes.forEach((attribute) => {
				const attributeOption = attributeOptions.find((o) => o.key === attribute)

				if (attributeOption) {
					toFilter = toFilter && attributeOption.filterFn(curr)
				}
			})

			if (selectedProjects.length > 0) {
				toFilter = toFilter && selectedProjects.map((p) => p.toLowerCase()).includes(curr.project.toLowerCase())
			}

			const tokensInPool: string[] = curr.symbol.split('-').map((x) => x.toLowerCase())

			const includeToken =
				includeTokens.length > 0
					? includeTokens
							.map((t) => t.toLowerCase())
							.find((token) => {
								if (tokensInPool.includes(token.toLowerCase())) {
									return true
								} else if (token === 'eth') {
									return tokensInPool.find((x) => x.includes('weth') && x.includes(token))
								} else return false
							})
					: true

			const excludeToken = !excludeTokens
				.map((t) => t.toLowerCase())
				.find((token) => tokensInPool.includes(token.toLowerCase()))

			toFilter =
				toFilter &&
				selectedChains.map((t) => t.toLowerCase()).includes(curr.chain.toLowerCase()) &&
				includeToken &&
				excludeToken

			const isValidTvlRange =
				(minTvl !== undefined && !Number.isNaN(Number(minTvl))) ||
				(maxTvl !== undefined && !Number.isNaN(Number(maxTvl)))

			if (isValidTvlRange) {
				toFilter = toFilter && (minTvl ? curr.tvlUsd > minTvl : true) && (maxTvl ? curr.tvlUsd < maxTvl : true)
			}

			if (toFilter) {
				return acc.concat({
					id: curr.pool,
					pool: curr.symbol,
					projectslug: curr.project,
					project: curr.projectName,
					airdrop: curr.airdrop,
					chains: [curr.chain],
					tvl: curr.tvlUsd,
					apy: curr.apy,
					apyBase: curr.apyBase,
					apyReward: curr.apyReward,
					rewardTokensSymbols: curr.rewardTokensSymbols,
					change1d: curr.apyPct1D,
					change7d: curr.apyPct7D,
					outlook: curr.predictions.predictedClass,
					confidence: curr.predictions.binnedConfidence
				})
			} else return acc
		}, [])
	}, [
		minTvl,
		maxTvl,
		pools,
		selectedProjects,
		selectedChains,
		selectedAttributes,
		includeTokens,
		excludeTokens,
		pathname
	])

	return (
		<>
			<YieldsSearch step={{ category: 'Home', name: 'Yields' }} pathname={pathname} />

			<TableFilters>
				<TableHeader>Yield Rankings</TableHeader>
				<Dropdowns>
					<FiltersByChain chainList={chainList} selectedChains={selectedChains} pathname={pathname} />
					<YieldProjects projectList={projectList} selectedProjects={selectedProjects} pathname={pathname} />
					<YieldAttributes pathname={pathname} />
					<TVLRange />
					<ResetAllYieldFilters pathname={pathname} />
				</Dropdowns>
			</TableFilters>

			{loading ? (
				<TableWrapper data={fallbackList} columns={fallbackColumns} />
			) : poolsData.length > 0 ? (
				<TableWrapper data={poolsData} columns={columns} />
			) : (
				<Panel as="p" style={{ margin: 0, textAlign: 'center' }}>
					Couldn't find any pools for these filters
				</Panel>
			)}
		</>
	)
}

export default YieldPage
