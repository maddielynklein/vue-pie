<template>
  <div style="width: 75%;margin: 4em">
     <!-- <pie-chart legendLocation="top" :chartData="pie" :innerRadiusPercent="0.7" :endAngle="1.5 * Math.PI"
    :startAngle="-.5 * Math.PI" :hoverAnimation="true" :maxSelectedSections="2" :selectIdentifier="(d,i) => ['First','Second','Third','Fourth'][i]"/> -->
    <pie-chart
      :chartData="{
        a: {
          val: 300,
          col: '#62d2e3',
          label: 'React'
        },
        b: {
          val: 700,
          col: '#d5f28d',
          label: 'Vue'
        },
        c: {
          val: 400,
          col: '#f2928d',
          label: 'Angular'
        },
        d: {
          val: 150,
          col: '#9c8df2',
          label: 'ExtJs'
        },
        e: {
          val: 475,
          col: '#f2e88d',
          label: 'jQuery'
        }
      }"
      :sectionKeys="['a','b','c','d','e']"
      :selectValue="(d) => d.val"
      :selectColor="(d) => d.col"
      :innerRadiusPercent="0.3"
      legendLocation="left"
      :formatLegend="(d) => d.label"
      :maxSelectedSections="1"
    />
    <!-- <pie-chart :chartData="pie" /> -->
    <!-- <pie-chart :chartData="{a:3,b:9,c:2,d:6,e:4}" :sectionKeys="['a','b','c','d','e']" :innerRadiusPercent="0.6"
    legendLocation="right" :formatLegend="(_,id) => 'Section ' + id.toUpperCase()" :hoverAnimation="true"
    :selectColor="scheme3"/> -->
    <!-- <pie-chart :chartData="[1,1,1]" :padAngle="0.05 * Math.PI" :innerRadiusPercent="0.7" :endAngle="endAngle" :startAngle="startAngle" :transitionDuration="1000"/> -->
  </div>
</template>

<script>
  import PieChart from './PieChart'
  import * as d3 from 'd3'

  export default {
    name: 'TestApp',
    components: {
      PieChart
    },
    data() {
      return {
        pie: [1,2,3,4],
        endAngle: 0,
        startAngle: -.65 * Math.PI
      }
    },
    mounted() {
      // setTimeout((() => {
      //   this.pie = [4,1,7]
      //   // this.pie.push(5)
      // }).bind(this),2000)
      // d3.interval((function(){
      //   this.endAngle += 1 * Math.PI
      //   this.startAngle += 1 * Math.PI
      // }).bind(this), 500)
    },
    methods: {
      scheme3(d) {
        return d3.schemePaired[d]
      }
    }
  }
</script>