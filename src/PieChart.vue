<template>
  <div :id="id + '-wrapper'" :class="{'vue-pie-chart-horizontal': ['right', 'left'].includes(legendLocation)}">
    <div v-if="['left','top'].includes(legendLocation)" :id="this.id + '-legend'" class="vue-pie-legend">
      <slot name="legend-label"></slot>
    </div>
    <svg :width="actualWidth" :height="actualHeight" :id="id">
      <g :id="id + '-center'" :transform="'translate(' + (this.actualWidth / 2) + ',' + (this.actualHeight / 2) + ')'"/>
    </svg>
    <div v-if="['right','bottom'].includes(legendLocation)" :id="this.id + '-legend'" class="vue-pie-legend">
      <slot name="legend-label"></slot>
    </div>
  </div>
</template>

<script>
  import {pie as d3pie, arc as d3arc} from 'd3-shape'
  import {select as d3select} from 'd3-selection'
  import {interpolate as d3interpolate} from 'd3-interpolate'
  import {schemeCategory10 as d3schemeCategory10} from 'd3-scale-chromatic'
  import {transition} from 'd3-transition'
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
        default: 0
      },
      endAngle: {
        type: Number,
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
      },
      formatLegendHtml: {
        type: Function,
      },
      formatLegend: {
        type: Function,
        default: (_,id) => id
      },
      hoverAnimation: {
        type: Boolean,
        default: false
      },
      maxSelectedSections: {
        type: Number,
        default: 0
      },
      selectedSectionIncreasePercent: {
        type: Number,
        validator (v) {
          return v >= 0 && v < 1
        },
        default: 0.1
      }
    },
    mounted() {
      this.g = d3select('g#' + this.id + '-center')
      this.drawLegend()
      this.updateWidth()
      this.transitionData(
        this.mergeSecondIntoFirst([], this.dataArray),
        this.mergeSecondIntoFirst(this.dataArray, []),
      )
      window.addEventListener('resize', () => {
        this.updateWidth()
        this.transitionDisplay()
      })
    },
    data () {
      return {
        id: Math.random().toString(36).replace(/[^a-z]+/g, '')[0] + Math.random().toString(36).substr(2),
        chartWidth: 0,
        chartHeight: 0,
        g: null,
        clickedIndices: [],
        legendSize: {
          width: 0,
          heigh: 0
        }
      }
    },
    watch: {
      legendLocation() {
        this.drawLegend()
        this.updateWidth()
        this.transitionDisplay()
      },
      width() {
        this.updateWidth()
        this.transitionDisplay()
      },
      height() {
        this.updateWidth()
        this.transitionDisplay()
      },
      chartData() {
        var oldData = this.g.selectAll('path').data().map(e => e.data.data)
        var old = this.buildDataArray(oldData, this.sectionKeys)
        this.clickedIndices = []
        this.drawLegend()
        this.updateWidth()
        this.transitionData(
          this.mergeSecondIntoFirst(old, this.dataArray),
          this.mergeSecondIntoFirst(this.dataArray, old),
        )
      },
      sectionKeys() {
        var oldKeys = this.g.selectAll('path').data().map(e => e.data.key).filter(k => k != null)
        var old = this.buildDataArray(this.dataArray, oldKeys)
        this.clickedIndices = []
        this.drawLegend()
        this.updateWidth()
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
        return d3pie().value((d) => d.value).startAngle(this.startAngle).endAngle(this.endAngle)
          .padAngle(this.padAngle).sortValues(null)
      },
      arc() {
        return d3arc().outerRadius(this.outerRadius).innerRadius(this.innerRadius)
      },
      expandedArc() {
        return d3arc().outerRadius(this.outerRadius / (1 - this.selectedSectionIncreasePercent)).innerRadius(this.innerRadius)
      },
      actualWidth() {
        return Math.max(this.width - this.legendSize.width, this.chartWidth)
      },
      actualHeight() {
        return Math.max(this.height, this.chartHeight)
      },
      radius() {
        return Math.max(this.actualWidth, this.actualHeight) / 2
      },
      outerRadius() {
        if (this.hasInteraction) return (1 - this.selectedSectionIncreasePercent) * this.radius
        return this.radius
      },
      innerRadius() {
        if (this.hasInteraction) return (1 - this.selectedSectionIncreasePercent) * this.innerRadiusPercent * this.radius
        return this.innerRadiusPercent * this.radius
      },
      colorFunc() {
        return this.selectColor ? this.selectColor : this.defaultSelectColor
      },
      hasInteraction() {
        return this.hoverAnimation || this.maxSelectedSections != 0
      }
    },
    methods: {
      updateWidth() {
        var node = d3select('div#' + this.id + '-wrapper').node()
        if (!node) return
        var divSize = node.getBoundingClientRect()
        var legendSize = { width: 0 }
        if (['left','right'].includes(this.legendLocation)){
          legendSize = d3select('div#' + this.id + '-legend').node().getBoundingClientRect()
          this.legendSize.width = legendSize.width
        } else this.legendSize.width = 0
        this.chartWidth = divSize.width - legendSize.width
        this.chartHeight = divSize.width- legendSize.width
      },
      buildDataArray(data, keys) {
        if (Array.isArray(data)) {
          return data.map((d,i) => {
            return {
              data: d,
              value: this.selectValue(d,this.selectIdentifier(d,i)),
              id: this.selectIdentifier(d,i),
              key: null
            }
          })
        }
        return keys.map(k => {
          return {
            data: data[k],
            value: this.selectValue(data[k],k),
            id: k,
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
        if (this.sort) merged.sort((a,b) => this.sort(a.id, b.id))
        return merged
      },
      canHover() {
        return this.hoverAnimation && (this.maxSelectedSections == 0 || this.clickedIndices.length == 0)
      },
      canClick() {
        return this.maxSelectedSections != 0
      },
      onClick(d) {
        if (this.canClick()) {
          var index = this.clickedIndices.indexOf(d.data.id)
          if (index > -1) {
            this.clickedIndices.splice(index, 1)
            this.$emit('unselected', d.data.id)
          }
          else {
            if (this.clickedIndices.length == this.maxSelectedSections) {
              this.$emit('unselected', this.clickedIndices.splice(0, 1))
            }
            this.clickedIndices.push(d.data.id)
            this.$emit('selected', d.data.id)
          }
          this.transitionDisplay()
        }
      },
      defaultFormatLegendHtml(d,id) {
        return '<span><span style="color:' + this.colorFunc(d,id) + '">'
          + this.formatLegend(d,id) + '</span><span style="float:right">' + this.selectValue(d,id) + '</span></span>'
      },
      defaultSelectColor(_,id) {
        var i = this.dataArray.findIndex(e => e.id == id)
        return d3schemeCategory10[i % 10]
      },
      drawLegend() {
        d3select('#' + this.id + '-legend').selectAll('div.vue-pie-legend-item').remove()
        d3select('#' + this.id + '-legend').selectAll('div.vue-pie-legend-item')
          .data(this.dataArray)
          .enter().append('div')
            .classed('vue-pie-legend-item', true)
            .classed('vue-pie-clickable', this.canClick)
            .html((d) => this.formatLegendHtml ? this.formatLegendHtml(d.data, d.id) : this.defaultFormatLegendHtml(d.data, d.id))
            .on('click', this.onClick)
      },
      transitionData(was, is) {
        this.g.selectAll('path').data(this.pie(was), (d) => d.data.id)
          .enter().append('path')
            .classed('vue-pie-clickable', this.canClick)
            .attr('opacity', 1)
            .attr('d', this.arc)
            .attr('fill', (d) => this.colorFunc(d.data.data, d.data.id))
            .each(function (d) {
              this._current = d
            })
            .on('mouseover', ((d,i) => {
              if (this.canHover()) {
                this.transitionDisplay(i)
                this.$emit('hover', d.data.id)
              }
            }).bind(this))
            .on('mouseout', (() => {
              if (this.canHover()) {
                this.transitionDisplay()
                this.$emit('hover')
              }
            }).bind(this))
            .on('click', this.onClick)

        var paths = this.g.selectAll('path').data(this.pie(is), (d) => d.data.id)
          .classed('vue-pie-clickable', this.canClick)
        var arc = this.arc
          
        paths.transition().duration(this.transitionDuration)
          .attrTween('d', function (a) {
            var i = d3interpolate(this._current, a)
            this._current = i(0)
            return function(t) {
              return arc(i(t))
            }
          })
      },
      transitionDisplay(hoverInd) {
        this.g.selectAll('path').classed('vue-pie-clickable', this.canClick)
          .transition().duration(this.transitionDuration / 3)
            .attr('opacity', ((d,i) => {
              if (i == hoverInd || this.clickedIndices.includes(d.data.id)) return 1
              if (hoverInd == null && ((this.maxSelectedSections != 0 && this.clickedIndices.length == 0) || this.maxSelectedSections == 0)) return 1
              return 0.3
            }).bind(this))
            .attr('d', ((d,i) => {
              if (i == hoverInd || this.clickedIndices.includes(d.data.id)) return this.expandedArc(d)
              return this.arc(d)
            }).bind(this))

        d3select('#' + this.id + '-legend').selectAll('div.vue-pie-legend-item')
          .classed('vue-pie-clickable', this.canClick)
          .classed('vue-pie-faded', ((d,i) => {
            if (i == hoverInd || this.clickedIndices.includes(d.data.id)) return false
            if (hoverInd == null && ((this.maxSelectedSections != 0 && this.clickedIndices.length == 0) || this.maxSelectedSections == 0)) return false
            return true
          }).bind(this))
      },
    }
  }
</script>

<style>
  .vue-pie-chart-horizontal {
    display: flex;
  }
  .vue-pie-legend {
    margin: auto;
    padding: 0.5em;
  }
  .vue-pie-legend-item span {
    margin: 0 0.25em;
  }
  .vue-pie-clickable {
    cursor: pointer;
  }
  .vue-pie-faded {
    opacity: 0.3;
  }
</style>