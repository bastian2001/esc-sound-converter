<template>
	<div class="main-wrapper">
		<div id="intro">
			<h2>ESC Sound Converter</h2>
			<p class="introText">
				This is a tool to convert BlHeli32 and Bluejay startup sounds between each other.<br />Use the Transpose buttons
				if your sounds are too high or too low for your system. BlHeli32 allows you to go higher, while Bluejay goes
				lower.<br />If you find any bugs or have any suggestions, please open an issue on
				<a href="https://github.com/Bastian2001/esc-sound-converter/issues/new" style="color: inherit !important"
					>Github</a
				>.
			</p>
			<p :class="{ hide: timeEqual }" class="introText">
				<i class="fa-solid fa-triangle-exclamation"></i>&nbsp;&nbsp;Unequal lengths lead to asynchronous beeps at the
				end of the start sequence.
			</p>
		</div>
		<Converter @time="$event => calcTime(0, $event)" :time-equal="timeEqual" />
		<Converter @time="$event => calcTime(1, $event)" :time-equal="timeEqual" />
		<Converter @time="$event => calcTime(2, $event)" :time-equal="timeEqual" />
		<Converter @time="$event => calcTime(3, $event)" :time-equal="timeEqual" />
		<a href="https://github.com/Bastian2001/esc-sound-converter" id="githublink"><i class="fa-brands fa-github"></i></a>
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
	width: 1600px;
	max-width: 90%;
	margin: 0 auto;
	margin-top: 3rem;
	margin-bottom: 5rem;
}

#githublink {
	position: fixed;
	bottom: 0;
	right: 0;
	margin: 1rem;
	color: #eed;
	font-size: 1.5rem;
}

p {
	font-family: Verdana, Geneva, Tahoma, sans-serif;
	margin-top: 1rem;
}
#intro {
	margin-bottom: 2rem;
}

.hide {
	visibility: hidden;
}

.introText {
	line-height: 125%;
}
</style>
