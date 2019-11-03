<template>
  <div :id="id + '-wrapper'">
    <svg :width="actualWidth" :height="actualHeight" :id="id">
      <g :id="id + '-center'" :transform="'translate(' + (this.actualWidth / 2) + ',' + (this.actualHeight / 2) + ')'"/>
    </svg>
  </div>
</template>

<script>
  import * as d3 from 'd3'
  export default {
    name: 'PieChart',
    props: {
      width: {
        type: Number,
        default: 0
      },
      height: {
        type: Number,
        default: 0
      },
      chartData: {
        required: true,
        validator (v) {
          // allow either object or array
          return typeof v == 'object'
        },
      },
      sectionKeys: {
        type: Array,
        default: () =>[]
      },
      selectValue: {
        type: Function,
        default: (d) => d
      },
      selectColor: {
        type: Function,
        default: (_,i) => d3.schemeCategory10[i % 10]
      },
      selectIdentifier: {
        type: Function,
        default: (_,i) => i
      },
      sort: {
        type: Function
      },
      innerRadiusPercent: {
        type: Number,
        validator (v) {
          return v >= 0 && v < 1
        },
        default: 0
      },
      startAngle: {
        type: Number,
        validator (v) {
          return !v || (v >= 0 && v < 2 * Math.PI)
        },
        default: 0
      },
      endAngle: {
        type: Number,
        validator (v) {
          return !v || (v > 0 && v <= 2 * Math.PI)
        },
        default: 2 * Math.PI
      },
      padAngle: {
        type: Number,
        validator (v) {
          return !v || (v >= 0 && v < 2 * Math.PI)
        },
        default: 0
      },
      transitionDuration: {
        type: Number,
        default: 1500
      },
      legendLocation: {
        type: String,
        validator (v) {
          return !v || ['left','right','top','bottom'].includes(v)
        }
      }
    },
    mounted() {
      this.g = d3.select('g#' + this.id + '-center')
      this.updateWidth()
      this.transitionData(
        this.mergeSecondIntoFirst([], this.dataArray),
        this.mergeSecondIntoFirst(this.dataArray, []),
      )
    },
    data () {
      return {
        id: Math.random().toString(36).replace(/[^a-z]+/g, '')[0] + Math.random().toString(36).substr(2),
        chartWidth: 0,
        chartHeight: 0,
        g: null,
      }
    },
    watch: {
      chartData(_, oldData) {
        var old = this.buildDataArray(oldData, this.sectionKeys)
        this.transitionData(
          this.mergeSecondIntoFirst(old, this.dataArray),
          this.mergeSecondIntoFirst(this.dataArray, old),
        )
      },
      sectionKeys(_, oldKeys) {
        var old = this.buildDataArray(this.dataArray, oldKeys)
        this.transitionData(
          this.mergeSecondIntoFirst(old, this.dataArray),
          this.mergeSecondIntoFirst(this.dataArray, old),
        )
      },
      innerRadiusPercent() {
        this.transitionData(this.dataArray, this.dataArray)
      },
      startAngle() {
        this.transitionData(this.dataArray, this.dataArray)
      },
      endAngle() {
        this.transitionData(this.dataArray, this.dataArray)
      },
      padAngle() {
        this.transitionData(this.dataArray, this.dataArray)
      },
    },
    computed: {
      dataArray() {
        return this.buildDataArray(this.chartData, this.sectionKeys)
      },
      pie() {
        return d3.pie().value((d) => d.value).startAngle(this.startAngle).endAngle(this.endAngle)
          .padAngle(this.padAngle)
      },
      arc() {
        return d3.arc().outerRadius(this.outerRadius).innerRadius(this.innerRadius)
      },
      actualWidth() {
        return Math.max(this.width, this.chartWidth)
      },
      actualHeight() {
        return Math.max(this.height, this.chartHeight)
      },
      radius() {
        return Math.max(this.actualWidth, this.actualHeight) / 2
      },
      outerRadius() {
        if (this.hasInteraction) return 0.8 * this.radius
        return this.radius
      },
      innerRadius() {
        if (this.hasInteraction) return 0.8 * this.innerRadiusPercent * this.radius
        return 0
      },
      hasInteraction() {
        // TODO
        return true
      },
    },
    methods: {
      updateWidth() {
        var divSize = d3.select('div#' + this.id + '-wrapper').node().getBoundingClientRect()
        this.chartWidth = divSize.width
        this.chartHeight = divSize.width
      },
      buildDataArray(data, keys) {
        if (Array.isArray(data)) {
          return data.map((d,i) => {
            return {
              data: d,
              value: this.selectValue(d,i),
              id: this.selectIdentifier(d,i),
              key: null
            }
          })
        }
        return keys.map(k => {
          return {
            data: data[k],
            value: this.selectValue(data[k],k),
            id: null,
            key: k
          }
        })
      },
      mergeSecondIntoFirst(first, second) {
        var mergedIds = new Set()
        var merged = []
        first.forEach((e,i) => {
          mergedIds.add(e.id)
          merged.push({
            data: e.data,
            value: e.value,
            id: e.id,
            key: e.key,
            index: i
          })
        });
        second.forEach((e,i) => {
          if (!mergedIds.has(e.id)) {
            merged.push({
              data: e.data,
              value: 0,
              id: e.id,
              key: e.key,
              index: i
            })
          }
        })
        return this.sort ? merged.sort((a,b) => this.sort(a.key != null ? a.key : a.data, b.key != null ? b.key : b.data)): merged
      },
      transitionData(was, is) {
        this.g.selectAll('path').data(this.pie(was), (d) => d.data.key ? d.data.key : d.data.id)
          .enter().append('path')
            .attr('d', this.arc)
            .attr('fill', (d) => this.selectColor(d.data.data, d.data.index))
            .each(function (d) {
              this._current = d
            })

        var paths = this.g.selectAll('path').data(this.pie(is))
        var arc = this.arc
          
        paths.transition().duration(this.transitionDuration)
          .attrTween('d', function (a) {
            var i = d3.interpolate(this._current, a)
            this._current = i(0)
            return function(t) {
              return arc(i(t))
            }
          })
      },
    }
  }
</script>