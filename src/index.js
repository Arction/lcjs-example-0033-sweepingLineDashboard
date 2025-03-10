/**
 * Example showcasing sweeping ECG line charts.
 *
 * Sweeping line chart functionality is not built-in into the library.
 * However, it is very well possible to build performant and good looking sweeping line applications
 * with LightningChart JS. Performance is not affected, but application code is slightly more complicated than
 * scrolling axis and some built-in features like real-time axis ticks and glow effects are not applicable.
 */

const lcjs = require('@lightningchart/lcjs')

const { lightningChart, Themes, emptyLine, emptyFill, AxisTickStrategies, ColorHEX, SolidFill, PointShape } = lcjs

const channelCount = 6
const dataRateHz = 1000
const xViewMs = 15 * 1000

fetch(new URL(document.head.baseURI).origin + new URL(document.head.baseURI).pathname + 'examples/assets/0033/ecg.json')
    .then((r) => r.json())
    .then((ecgData) => {
        const CHANNELS = new Array(channelCount).fill(0).map((_, i) => ({ name: `ECG-${i + 1}`, yMin: -2500, yMax: 2500 }))

        const lc = lightningChart({
            resourcesBaseUrl: new URL(document.head.baseURI).origin + new URL(document.head.baseURI).pathname + 'resources/',
        })
        const chart = lc.ChartXY({
            theme: Themes[new URLSearchParams(window.location.search).get('theme') || 'darkGold'] || undefined,
        })
        const theme = chart.getTheme()
        const ecgBackgroundFill = new SolidFill({
            color: theme.isDark ? ColorHEX('#000000') : ColorHEX('#ffffff'),
        })
        chart
            .setSeriesBackgroundFillStyle(ecgBackgroundFill)
            .setSeriesBackgroundStrokeStyle(emptyLine)
            .setTitle(`Sweeping line chart ${CHANNELS.length} channels 1000 Hz`)
            .setCursorMode(undefined)
            .setUserInteractions(undefined)
        const axisX = chart
            .getDefaultAxisX()
            .setTickStrategy(AxisTickStrategies.Empty)
            .setStrokeStyle(emptyLine)
            .setScrollStrategy(undefined)
            .setInterval({ start: 0, end: xViewMs, stopAxisAfter: false })
        chart.getDefaultAxisY().dispose()
        const channels = CHANNELS.map((info, iCh) => {
            const axisY = chart
                .addAxisY({ iStack: CHANNELS.length - iCh })
                .setStrokeStyle(emptyLine)
                .setInterval({ start: info.yMin, end: info.yMax })
                .setTickStrategy(AxisTickStrategies.Empty)
                .setTitle(info.name)
                .setTitleRotation(0)

            // Series for displaying "old" data.
            const seriesRight = chart
                .addPointLineAreaSeries({
                    dataPattern: 'ProgressiveX',
                    automaticColorIndex: iCh,
                    yAxis: axisY,
                })
                .setName(info.name)
                .setAreaFillStyle(emptyFill)
                .setStrokeStyle((stroke) => stroke.setThickness(2))
                .setEffect(false)
                .setMaxSampleCount(dataRateHz * xViewMs)

            // Rectangle for hiding "old" data under incoming "new" data.
            const seriesOverlayRight = chart
                .addRectangleSeries({ yAxis: axisY })
                .setPointerEvents(false)
                .setEffect(false)
                .setCursorEnabled(false)
            const figureOverlayRight = seriesOverlayRight
                .add({ x1: 0, y1: 0, x2: 0, y2: 0 })
                .setFillStyle(ecgBackgroundFill)
                .setStrokeStyle(emptyLine)

            // Series for displaying new data.
            const seriesLeft = chart
                .addPointLineAreaSeries({
                    dataPattern: 'ProgressiveX',
                    automaticColorIndex: iCh,
                    yAxis: axisY,
                })
                .setName(info.name)
                .setAreaFillStyle(emptyFill)
                .setStrokeStyle((stroke) => stroke.setThickness(2))
                .setEffect(false)
                .setMaxSampleCount(dataRateHz * xViewMs)

            const seriesHighlightLastPoints = chart
                .addPointLineAreaSeries({ dataPattern: null, yAxis: axisY })
                .setPointFillStyle(new SolidFill({ color: theme.examples.highlightPointColor }))
                .setPointSize(5)
                .setStrokeStyle(emptyLine)
                .setEffect(false)
                .setCursorEnabled(false)

            // Synchronize highlighting of "left" and "right" series.
            let isHighlightChanging = false
            ;[seriesLeft, seriesRight].forEach((series) => {
                series.addEventListener('highlightchange', (event) => {
                    const { highlight } = event
                    if (isHighlightChanging) {
                        return
                    }
                    isHighlightChanging = true
                    seriesLeft.setHighlight(highlight)
                    seriesRight.setHighlight(highlight)
                    isHighlightChanging = false
                })
            })

            return {
                seriesLeft,
                seriesRight,
                seriesOverlayRight,
                figureOverlayRight,
                seriesHighlightLastPoints,
                axisY,
            }
        })

        // Setup logic for pushing new data points into a "custom sweeping line chart".
        // LightningChart JS does not provide built-in functionalities for sweeping line charts.
        // This example shows how it is possible to implement a performant sweeping line chart, with a little bit of extra application complexity.
        let prevPosX = 0
        // Keep track of data pushed to each channel.
        const handleIncomingData = (dataPointsAllChannels) => {
            // Keep track of the latest X (time position), clamped to the sweeping axis range.
            let posX = 0

            for (let iCh = 0; iCh < CHANNELS.length; iCh += 1) {
                const newDataPointsTimestamped = dataPointsAllChannels[iCh]
                const channel = channels[iCh]

                // NOTE: Incoming data points are timestamped, meaning their X coordinates can go outside sweeping axis interval.
                // Clamp timestamps onto the sweeping axis range.
                const newDataPointsSweeping = newDataPointsTimestamped.map((dp) => ({
                    x: dp.x % xViewMs,
                    y: dp.y,
                }))
                const newDataPointsCount = newDataPointsSweeping.length

                posX = Math.max(posX, newDataPointsSweeping[newDataPointsSweeping.length - 1].x)

                // Check if the channel completes a full sweep (or even more than 1 sweep even though it can't be displayed).
                let fullSweepsCount = 0
                let signPrev = false
                for (const dp of newDataPointsSweeping) {
                    const sign = dp.x < prevPosX
                    if (sign === true && sign !== signPrev) {
                        fullSweepsCount += 1
                    }
                    signPrev = sign
                }

                if (fullSweepsCount > 1) {
                    // The below algorithm is incapable of handling data input that spans over several full sweeps worth of data.
                    // To prevent visual errors, reset sweeping graph and do not process the data.
                    // This scenario is triggered when switching tabs or minimizing the example for extended periods of time.
                    channel.seriesRight.clear()
                    channel.seriesLeft.clear()
                } else if (fullSweepsCount === 1) {
                    // Sweeping cycle is completed.
                    // Categorize new data points into those belonging to current sweep and the next.
                    let dataCurrentSweep = []
                    let dataNextSweep = []
                    for (let i = 0; i < newDataPointsCount; i += 1) {
                        if (newDataPointsSweeping[i].x <= prevPosX) {
                            dataCurrentSweep = newDataPointsSweeping.slice(0, i)
                            dataNextSweep = newDataPointsSweeping.slice(i + 1)
                            break
                        }
                    }
                    // Finish current sweep.
                    channel.seriesLeft.add(dataCurrentSweep)
                    // Swap left and right series.
                    const nextLeft = channel.seriesRight
                    const nextRight = channel.seriesLeft
                    channel.seriesLeft = nextLeft
                    channel.seriesRight = nextRight
                    channel.seriesRight.setDrawOrder({ seriesDrawOrderIndex: 0 })
                    channel.seriesOverlayRight.setDrawOrder({ seriesDrawOrderIndex: 1 })
                    channel.seriesLeft.setDrawOrder({ seriesDrawOrderIndex: 2 })
                    // Start sweeping from left again.
                    channel.seriesLeft.clear()
                    channel.seriesLeft.add(dataNextSweep)
                } else {
                    // Append data to left.
                    channel.seriesLeft.add(newDataPointsSweeping)
                }

                // Highlight last data point.
                const highlightPoints = [newDataPointsSweeping[newDataPointsSweeping.length - 1]]
                channel.seriesHighlightLastPoints.clear().add(highlightPoints)
            }

            // Move overlays of old data to right locations.
            const overlayXStart = 0
            const overlayXEnd = posX + xViewMs * 0.03
            channels.forEach((channel) => {
                channel.figureOverlayRight.setDimensions({
                    x1: overlayXStart,
                    x2: overlayXEnd,
                    y1: channel.axisY.getInterval().start,
                    y2: channel.axisY.getInterval().end,
                })
            })

            prevPosX = posX
        }

        // Setup example data streaming
        let tStart = window.performance.now()
        let pushedDataCount = 0
        const xStep = 1000 / dataRateHz
        const streamData = () => {
            const tNow = window.performance.now()
            // NOTE: This code is for example purposes only (streaming stable data rate)
            // In real use cases, data should be pushed in when it comes.
            const shouldBeDataPointsCount = Math.floor((dataRateHz * (tNow - tStart)) / 1000)
            const newDataPointsCount = shouldBeDataPointsCount - pushedDataCount
            if (newDataPointsCount > 0) {
                const newDataPoints = []
                for (let iDp = 0; iDp < newDataPointsCount; iDp++) {
                    const x = (pushedDataCount + iDp) * xStep
                    const iData = (pushedDataCount + iDp) % ecgData.length
                    const y = ecgData[iData]
                    const point = { x, y }
                    newDataPoints.push(point)
                }

                // For this examples purposes, stream same data into all channels.
                handleIncomingData(new Array(CHANNELS.length).fill(0).map((_) => newDataPoints))
                pushedDataCount += newDataPointsCount
            }

            requestAnimationFrame(streamData)
        }
        streamData()
    })
