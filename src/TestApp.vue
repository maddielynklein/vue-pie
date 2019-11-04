<template>
  <div style="width: 75%">
    <pie-chart legendLocation="left" :chartData="pie" :innerRadiusPercent="0.7" :endAngle="1.5 * Math.PI"
    :startAngle="-.5 * Math.PI" :hoverAnimation="true" :maxSelectedSections="2" :selectIdentifier="(d,i) => ['First','Second','Third','Fourth'][i]"/>
  </div>
</template>

<script>
  import PieChart from './PieChart'

  export default {
    name: 'TestApp',
    components: {
      PieChart
    },
    data() {
      return {
        pie: [1,2,3,4]
      }
    },
    mounted() {
      setTimeout((() => {
        this.pie = [4,1,7]
        // this.pie.push(5)
      }).bind(this),2000)
    }
  }
</script>