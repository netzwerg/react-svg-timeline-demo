import { timeFormat } from 'd3-time-format'
import 'react-app-polyfill/ie11'
import * as React from 'react'
import { FunctionComponent, useCallback, useMemo, useState } from 'react'
import cn from 'classnames'
import { Set as ImmutableSet } from 'immutable'
import Dataset1 from '../data/smallDataset.json'
import Dataset2 from '../data/largeDataset.json'
import { Card, InputLabel, MenuItem, Select, Switch, Typography, useTheme } from '@mui/material'
import { CustomizedTimeline } from '../../timeline/components/CustomizedTimeline'
import { ExampleEvent, ExampleProps, TimelineEventId, TimelineLaneId } from '../../timeline/model'
import { createTimelineTheme, LaneDisplayMode, Timeline, TimelineLayer, TimelineProps } from 'react-svg-timeline'
import { makeStyles } from '../../utils'
import AutoSizer, { Size } from 'react-virtualized-auto-sizer'

const useStyles = makeStyles()({
  root: {
    display: 'grid',
    width: '100%',
    gridTemplateRows: 'auto 300px 300px 300px',
    gridRowGap: 100,
  },
  largeDataset: {
    gridTemplateRows: 'auto auto 800px 800px',
  },
  controlPanel: {
    display: 'grid',
    width: '100%',
    gridTemplateColumns: '50% 50%',
    gridGap: 5,
  },
  card: {
    padding: 15,
  },
  hci: {
    color: '#9e9e9e',
    lineHeight: 0.8,
    '& td': {
      paddingRight: 10,
    },
  },
  configToggles: {
    display: 'grid',
    gridTemplateColumns: 'auto 1fr',
    alignItems: 'center',
  },
})

const dateFormat = (ms: number) => timeFormat('%d.%m.%Y %X')(new Date(ms))

/* Returns dataset object for the chosen option */
const getDataset = (choice: string) => {
  switch (choice) {
    case '1':
      return Dataset1
    case '2':
      return Dataset2
    default:
      return Dataset1
  }
}

const eventTooltip = (e: ExampleEvent) => {
  const { startTimeMillis, endTimeMillis, eventId, laneId } = e
  const eventDescription = `${eventId} (${laneId})`

  return endTimeMillis
    ? `${eventDescription}\n \nStart: ${dateFormat(startTimeMillis)}\nEnd: ${dateFormat(endTimeMillis)}`
    : `${eventDescription}\n \nOn: ${dateFormat(startTimeMillis)}`
}

export const Main = () => {
  const { classes } = useStyles()
  const [laneDisplayMode, setLaneDisplayMode] = useState<LaneDisplayMode>('expanded')
  const [isTrimming, setIsTrimming] = useState<boolean>(false)
  const [enableClustering, setEnableClustering] = useState<boolean>(false)
  const [suppressMarkAnimation, setSuppressMarkAnimation] = useState<boolean>(false)
  const [datasetChosen, setDatasetChosen] = useState<string>('1')
  const [useCustomRange, setUseCustomRange] = useState<boolean>(false)
  const rootClasses = cn(classes.root, datasetChosen === '2' ? classes.largeDataset : '')

  return (
    <div className={rootClasses}>
      <ConfigPanel
        laneDisplayMode={laneDisplayMode}
        setLaneDisplayMode={setLaneDisplayMode}
        suppressMarkAnimation={suppressMarkAnimation}
        setSuppressMarkAnimation={setSuppressMarkAnimation}
        isTrimming={isTrimming}
        setIsTrimming={setIsTrimming}
        enableClustering={enableClustering}
        setEnableClustering={setEnableClustering}
        datasetChosen={datasetChosen}
        setDatasetChosen={setDatasetChosen}
        useCustomRange={useCustomRange}
        setUseCustomRange={setUseCustomRange}
      />
      <DemoTimeline
        timelineComponent={Timeline}
        title={'Default'}
        laneDisplayMode={laneDisplayMode}
        suppressMarkAnimation={suppressMarkAnimation}
        isTrimming={isTrimming}
        enableClustering={enableClustering}
        datasetChosen={datasetChosen}
        useCustomRange={useCustomRange}
      />
      <DemoTimeline
        timelineComponent={CustomizedTimeline}
        title={'Custom Event Marks'}
        laneDisplayMode={laneDisplayMode}
        suppressMarkAnimation={suppressMarkAnimation}
        isTrimming={isTrimming}
        enableClustering={enableClustering}
        datasetChosen={datasetChosen}
        useCustomRange={useCustomRange}
      />
      <DemoTimeline
        timelineComponent={Timeline}
        title={'Custom Layer'}
        laneDisplayMode={laneDisplayMode}
        suppressMarkAnimation={suppressMarkAnimation}
        isTrimming={isTrimming}
        enableClustering={enableClustering}
        datasetChosen={datasetChosen}
        useCustomRange={useCustomRange}
        layers={[
          'grid',
          'axes',
          ({ height, width, domain, maxDomain }) => {
            const fontSize = 100 / ((domain[1] - domain[0]) / (maxDomain[1] - maxDomain[0]))

            return (
              <g>
                <text x={width / 2} y={height / 2} fontSize={fontSize} textAnchor="middle" fill="#9e9e9e">
                  Custom Layer
                </text>
              </g>
            )
          },
          'marks',
          'interaction',
        ]}
      />
    </div>
  )
}

interface DemoTimelineProps {
  title: string
  timelineComponent: FunctionComponent<ExampleProps>
  laneDisplayMode: LaneDisplayMode
  suppressMarkAnimation: boolean
  isTrimming: boolean
  enableClustering: boolean
  datasetChosen: string
  useCustomRange: boolean
  layers?: ReadonlyArray<TimelineLayer>
}

const DemoTimeline = ({
  title,
  timelineComponent,
  laneDisplayMode,
  suppressMarkAnimation,
  isTrimming,
  enableClustering,
  datasetChosen,
  useCustomRange,
  layers,
}: DemoTimelineProps) => {
  const materialTheme = useTheme()
  const theme = createTimelineTheme(materialTheme.palette.mode, materialTheme)
  const [selectedEvents, setSelectedEvents] = useState<ImmutableSet<TimelineEventId>>(ImmutableSet())
  const [pinnedEvents, setPinnedEvents] = useState<ImmutableSet<TimelineEventId>>(ImmutableSet())
  const [zoomRange, setZoomRange] = useState<[number, number]>()
  const [cursorZoomRange, setCursorZoomRange] = useState<[number, number] | undefined>()
  const [trimRange, setTrimRange] = useState<[number, number] | undefined>()
  const dataset = getDataset(datasetChosen)
  const { lanes, events: rawEvents } = dataset

  const events = useMemo(
    () =>
      rawEvents.map((e) => {
        const { startTimeMillis, endTimeMillis, eventId, laneId } = e as ExampleEvent
        return {
          eventId,
          startTimeMillis,
          endTimeMillis,
          laneId,
          tooltip: eventTooltip(e as ExampleEvent),
          isSelected: selectedEvents.contains(e.eventId as TimelineEventId),
          isPinned: pinnedEvents.contains(e.eventId as TimelineEventId),
        }
      }),
    [rawEvents, selectedEvents, pinnedEvents]
  )

  const onEventHover = (e: TimelineEventId) => setSelectedEvents((prevSelectedEvents) => prevSelectedEvents.add(e))
  const onEventUnhover = (e: TimelineEventId) => setSelectedEvents((prevSelectedEvents) => prevSelectedEvents.remove(e))
  const onEventClick = (e: TimelineEventId) =>
    setPinnedEvents((prevPinnedEvents) =>
      prevPinnedEvents.contains(e) ? prevPinnedEvents.remove(e) : prevPinnedEvents.add(e)
    )
  const onZoomRangeChange = useCallback(
    (startMillis: number, endMillis: number) => setZoomRange([startMillis, endMillis]),
    [setZoomRange]
  )
  const onCursorMove = useCallback(
    (cursorMillis?: number, startMillis?: number, endMillis?: number) => {
      if (startMillis && endMillis) {
        setCursorZoomRange([startMillis, endMillis])
      } else {
        setCursorZoomRange(undefined)
      }
    },
    [setCursorZoomRange]
  )

  const onInteractionEnd = useCallback(() => {
    setCursorZoomRange(undefined)
  }, [setCursorZoomRange])

  const onTrimRangeChange = useCallback(
    (startMillis: number, endMillis: number) => setTrimRange([startMillis, endMillis]),
    [setTrimRange]
  )

  return (
    <div>
      <Typography variant="h6">{title}</Typography>
      {zoomRange && (
        <Typography variant="caption" display="block">
          <strong>Zoom Range:</strong> {new Date(zoomRange[0]).toLocaleString()} -{' '}
          {new Date(zoomRange[1]).toLocaleString()}
        </Typography>
      )}
      <Typography variant="caption" display="block">
        <strong>Zoom Range at Cursor:</strong>{' '}
        {cursorZoomRange
          ? `${new Date(cursorZoomRange[0]).toLocaleString()} - ${new Date(cursorZoomRange[1]).toLocaleString()}`
          : 'None'}
      </Typography>
      <Typography variant="caption">
        <strong>Trim Range:</strong>{' '}
        {trimRange ? `${new Date(trimRange[0]).toLocaleString()} - ${new Date(trimRange[1]).toLocaleString()}` : 'None'}
      </Typography>
      <AutoSizer>
        {({ width, height }: Size) => {
          const timelineProps: TimelineProps<TimelineEventId, TimelineLaneId, ExampleEvent> = {
            width,
            height,
            theme,
            dateFormat,
            lanes,
            events,
            laneDisplayMode,
            suppressMarkAnimation,
            isTrimming,
            onEventHover,
            onEventUnhover,
            onEventClick,
            onZoomRangeChange,
            onCursorMove,
            trimRange,
            onTrimRangeChange,
            onInteractionEnd,
            enableEventClustering: enableClustering,
            customRange: useCustomRange ? [315529200000, 1640991600000] : undefined,
            layers,
          }
          return React.createElement(timelineComponent, timelineProps)
        }}
      </AutoSizer>
    </div>
  )
}

interface ConfigProps {
  laneDisplayMode: LaneDisplayMode
  setLaneDisplayMode: (laneDisplayMode: LaneDisplayMode) => void
  suppressMarkAnimation: boolean
  setSuppressMarkAnimation: (suppressMarkAnimation: boolean) => void
  isTrimming: boolean
  setIsTrimming: (isTrimming: boolean) => void
  enableClustering: boolean
  setEnableClustering: (enableClustering: boolean) => void
  datasetChosen: string
  setDatasetChosen: (datasetChoice: string) => void
  useCustomRange: boolean
  setUseCustomRange: (useCustomRange: boolean) => void
}

const ConfigPanel = (props: ConfigProps) => {
  const { classes } = useStyles()
  return (
    <div className={classes.controlPanel}>
      <Card className={classes.card}>
        <KeyboardShortcuts />
      </Card>
      <Card className={classes.card}>
        <ConfigOptions {...props} />
      </Card>
    </div>
  )
}

const KeyboardShortcuts = () => {
  const { classes } = useStyles()
  return (
    <Typography className={classes.hci} component={'div'}>
      <table>
        <tbody>
          <tr>
            <td>Zoom In:</td>
            <td>Click</td>
          </tr>
          <tr>
            <td>Zoom Out:</td>
            <td>Alt + Click</td>
          </tr>
          <tr>
            <td>Zoom Custom:</td>
            <td>Shift + Click + Drag</td>
          </tr>
          <tr>
            <td>Pan:</td>
            <td>Click + Drag</td>
          </tr>
          <tr>
            <td>Reset:</td>
            <td>Esc</td>
          </tr>
        </tbody>
      </table>
    </Typography>
  )
}

const ConfigOptions = ({
  laneDisplayMode,
  setLaneDisplayMode,
  suppressMarkAnimation,
  setSuppressMarkAnimation,
  isTrimming,
  setIsTrimming,
  enableClustering,
  setEnableClustering,
  datasetChosen,
  setDatasetChosen,
  useCustomRange,
  setUseCustomRange,
}: ConfigProps) => {
  const { classes } = useStyles()

  const laneDisplayModeChecked = laneDisplayMode === 'collapsed'
  const onLaneDisplayModeChange = () => setLaneDisplayMode(laneDisplayModeChecked ? 'expanded' : 'collapsed')

  const onSuppressMarkAnimationChange = () => setSuppressMarkAnimation(!suppressMarkAnimation)

  const onIsTrimmingChange = () => setIsTrimming(!isTrimming)

  const onEnableClusteringChange = () => setEnableClustering(!enableClustering)

  const onDatasetChange = (event: any) => {
    const newDataset = event.target.value
    setDatasetChosen(newDataset)
  }

  const onUseCustomRangeChange = () => setUseCustomRange(!useCustomRange)

  return (
    <div className={classes.configToggles}>
      <Typography>Collapse Lanes</Typography>
      <Switch checked={laneDisplayModeChecked} onChange={onLaneDisplayModeChange} />
      <Typography>Trim</Typography>
      <Switch checked={isTrimming} onChange={onIsTrimmingChange} />
      <Typography>Cluster Events</Typography>
      <Switch checked={enableClustering} onChange={onEnableClusteringChange} />
      <Typography>Animate Marks</Typography>
      <Switch checked={!suppressMarkAnimation} onChange={onSuppressMarkAnimationChange} />
      <Typography>Custom Range</Typography>
      <Switch checked={useCustomRange} onChange={onUseCustomRangeChange} />
      <InputLabel id="dataset">
        <Typography>Dataset</Typography>
      </InputLabel>
      <Select labelId="dataset" id="select" value={datasetChosen} onChange={onDatasetChange}>
        <MenuItem value="1">Dataset 1</MenuItem>
        <MenuItem value="2">Dataset 2</MenuItem>
      </Select>
    </div>
  )
}
