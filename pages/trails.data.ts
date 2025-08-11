import { notesReposReq } from '@/utils/octokit'
import metadataParser from 'markdown-yaml-metadata-parser'
import { parse as yamlParser } from 'yaml'

enum Mode {
  Air = 'Air',
  Driving = 'Driving',
  Walking = 'Walking',
  Cycling = 'Cycling',
  Ship = 'Ship',
  Train = 'Train',
}

interface Trail {
  title: string
  mode: Mode
  date: string
  center?: number[]
  zoom?: number
  geojson?: string
  gpx?: string[]
  markers?: string[]
}

let _data: Trail[] = []

const _fetchTrails = async () => {
  const result: Trail[] = []
  const folderData = await notesReposReq('/contents/{path}', {
    path: 'Trail',
  })

  const files = folderData.data.filter(
    (t: any) => t.type === 'file' && t.name !== '_index.md'
  )

  for (const trail of files) {
    const trailData = await notesReposReq(
      '/contents/{path}',
      {
        path: trail.path,
      },
      {
        Accept: 'application/vnd.github.v3.raw',
      }
    )
    const { content, metadata } = metadataParser(trailData.data)
    const trailDataObj = _getTrailData(content)

    if (trailDataObj) {
      result.push({
        title: trail.name.replace('.md', ''),
        mode: metadata?.mode[0],
        date: metadata?.date,
        center: [trailDataObj.lat, trailDataObj.long],
        zoom: trailDataObj?.defaultZoom || 0,
        geojson: trailDataObj?.geojson
          ? await _getTrailFileContent(trailDataObj?.geojson)
          : undefined,
        gpx: trailDataObj?.gpx
          ? await Promise.all(
              trailDataObj?.gpx.map(
                async (file: string) => await _getTrailFileContent(file)
              )
            )
          : undefined,
        markers: trailDataObj?.marker || null,
      })
    }
  }

  _data = result
}

const _getTrailData = (data: string) => {
  const codeBlockRegex = /```leaflet(?:\w+)?\n([\s\S]+?)\n```/g
  const match = codeBlockRegex.exec(
    data.replace(/- ,/g, '- _,').replace(/\[\[/g, '').replace(/\]\]/g, '')
  )

  return match ? yamlParser(match[1]) : null
}

const _getTrailFileContent = async (file: string) => {
  const data = await notesReposReq(
    '/contents/{path}',
    {
      path: 'Trail/files/' + file,
    },
    {
      Accept: 'application/vnd.github.v3.raw',
    }
  )

  return data.data
}

const getTrails = async () => {
  !_data.length && (await _fetchTrails())

  return _data
}

export { getTrails, type Trail, Mode }
