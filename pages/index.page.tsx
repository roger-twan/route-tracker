import dynamic from 'next/dynamic'
import Layout from '@/components/layout'
import { ReactElement, useState } from 'react'
import type { PageWithLayout } from './_app.page'
import Head from 'next/head'
import { GetStaticProps } from 'next'
import { Trail, getTrails } from './trails.data'
import { Grid, Loading } from '@geist-ui/core'
import style from './trails.module.scss'

const MapComponent = dynamic(() => import('./map'), { ssr: false })

export const getStaticProps: GetStaticProps = async () => {
  const trailsData: Trail[] = await getTrails()

  return { props: { list: JSON.stringify(trailsData) } }
}

interface Props {
  list: string
}

const PageTrail: PageWithLayout<Props> = ({ list }: Props) => {
  const [isMapReady, setIsMapReady] = useState(false)

  return (
    <>
      <Head>
        <title>Roger&apos;s Trails</title>
      </Head>
      {!isMapReady && (
        <Grid.Container gap={2.5} className={style['map-loading']}>
          <Grid xs={24}>
            <Loading spaceRatio={2.5} />
          </Grid>
        </Grid.Container>
      )}
      <MapComponent
        list={JSON.parse(list)}
        onReady={() => setIsMapReady(true)}
      />
    </>
  )
}

PageTrail.getLayout = (page: ReactElement) => <Layout>{page}</Layout>

export default PageTrail
