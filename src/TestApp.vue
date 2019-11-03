<template>
  <pie-chart legendLocation="left" :chartData="pie" :innerRadiusPercent="0.7" :endAngle="1.5 * Math.PI"/>
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
        pie: [1,2,3]
      }
    },
    mounted() {
      setTimeout((() => {
        // this.pie = [1,2,3,5]
        this.pie.push(5)
      }).bind(this),2000)
    }
  }
</script>