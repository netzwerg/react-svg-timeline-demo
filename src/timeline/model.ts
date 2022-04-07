import { EventComponentFactory, TimelineEvent, TimelineLane, TimelineProps } from 'react-svg-timeline'

export type TimelineEventId = string
export type TimelineLaneId = string

export type ExampleLane = TimelineLane<TimelineLaneId>
export type ExampleEvent = TimelineEvent<TimelineEventId, TimelineLaneId>

export type ExampleProps = TimelineProps<TimelineEventId, TimelineLaneId, ExampleEvent>
export type ExampleComponentFactory = EventComponentFactory<TimelineEventId, TimelineLaneId, ExampleEvent>
