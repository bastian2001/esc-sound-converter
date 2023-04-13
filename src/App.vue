<template>
	<div class="main-wrapper">
		<Converter @time="$event => calcTime(0, $event)" :time-equal="timeEqual" />
		<Converter @time="$event => calcTime(1, $event)" :time-equal="timeEqual" />
		<Converter @time="$event => calcTime(2, $event)" :time-equal="timeEqual" />
		<Converter @time="$event => calcTime(3, $event)" :time-equal="timeEqual" />
	</div>
</template>

<script lang="ts">
import Converter from "@/components/Converter.vue"
export default {
	name: "App",
	data() {
		return {
			timeEqual: true,
			times: ["0.00", "0.00", "0.00", "0.00"],
		}
	},
	components: {
		Converter,
	},
	methods: {
		calcTime(index: number, time: string) {
			this.times[index] = time
			this.timeEqual = true
			for (let i = 0; i < this.times.length; i++) {
				for (let j = i + 1; j < this.times.length; j++) {
					if (this.times[i] !== this.times[j]) {
						this.timeEqual = false
						break
					}
				}
			}
		},
	},
}
</script>

<style scoped>
.main-wrapper {
	width: 1500px;
	max-width: 90%;
	margin: 0 auto;
	margin-top: 3rem;
}
</style>
