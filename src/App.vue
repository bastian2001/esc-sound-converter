<template>
	<div class="main-wrapper">
		<div id="introBackground" :class="{ hide: hideIntro }" @click="hideIntro = true">
			<div id="intro" @click="$event.stopPropagation()">
				<h2>ESC Sound Converter</h2>
				<p class="introText">
					This is a tool to convert BlHeli32 and Bluejay startup sounds between each other.<br />Use the Transpose
					buttons if your sounds are too high or too low for your system. BlHeli32 allows you to go higher, while
					Bluejay goes lower.<br />If you find any bugs or have any suggestions, please open an issue on
					<a href="https://github.com/Bastian2001/esc-sound-converter/issues/new" style="color: inherit !important"
						>Github</a
					>.<br /><br />
					Three important things to note:<br />
					1. When you convert a Bluejay sound to BlHeli_32, always set the "Gen. Interval" to 0. Otherwise there will be
					a pause between each note. Other values make it impossible to know the actual length and it sounds straightup
					bad most of the time (because with different sounds, the ESC sounds fall out of sync from each other).
					Increase "Gen. Length" to make it slower or decrease it to make it faster.<br />
					2. When you convert a BlHeli_32 sound to Bluejay, use the "b=xxx" value to speed things up. The higher the
					value, the faster the sound.<br />
					3. I am not sure which note lengths exactly work with Bluejay. Therefore, there are only warnings for
					BlHeli_32 note lengths. It is likely that Bluejay supports a few more. If you find a source which ones work,
					please tell me.
				</p>
				<div class="alignright"><button @click="hideIntro = true">Got it!</button></div>
			</div>
		</div>
		<div class="header">
			<h2>ESC Sound Converter</h2>
			<p :class="{ hide: timeEqual }" class="warningText">
				<i class="fa-solid fa-triangle-exclamation"></i>&nbsp;&nbsp;Unequal lengths lead to asynchronous beeps at the
				end of the start sequence.
			</p>
			<PresetManager />
		</div>
		<Converter @time="$event => calcTime(0, $event)" :time-equal="timeEqual" :slot="0" />
		<Converter @time="$event => calcTime(1, $event)" :time-equal="timeEqual" :slot="1" />
		<Converter @time="$event => calcTime(2, $event)" :time-equal="timeEqual" :slot="2" />
		<Converter @time="$event => calcTime(3, $event)" :time-equal="timeEqual" :slot="3" />
		<a href="https://github.com/Bastian2001/esc-sound-converter" id="githublink"><i class="fa-brands fa-github"></i></a>
	</div>
</template>

<script lang="ts">
import Converter from "@/components/Converter.vue"
import { notesStore } from "./stores/notes"
import PresetManager from "./components/PresetManager.vue"
export default {
	name: "App",
	data() {
		return {
			timeEqual: true,
			times: ["0.00", "0.00", "0.00", "0.00"],
			hideIntro: false,
			notesStore: notesStore(),
		}
	},
	components: {
		Converter,
		PresetManager,
	},
	mounted() {
		this.notesStore.init()
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

#introBackground {
	background-color: #000a;
	position: fixed;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	z-index: 1;
	transition: all 0.5s ease-in-out, visibility 0s linear 0.5s;
}
.hide {
	opacity: 0;
	visibility: hidden;
}

#intro {
	position: absolute;
	top: 50%;
	left: 50%;
	transform: translate(-50%, -50%);
	color: #fff;
	background-color: #111118;
	padding: 4rem;
	border-radius: 3rem;
	width: 90%;
	max-width: 1500px;
	max-height: 90%;
	box-sizing: border-box;
	overflow-y: auto;
}
#intro h2 {
	color: white;
}

.introText {
	line-height: 150%;
	color: white;
}
#intro button {
	padding: 0.5rem 1rem;
	margin-top: 1rem;
	border-radius: 0.6rem;
	background-color: transparent;
	border: 1px solid white;
	color: white;
	text-align: right;
	font-size: 1rem;
	transition: all 0.3s ease-out;
	cursor: pointer;
}
#intro button:hover {
	background-color: #fff2;
}
.alignright {
	text-align: right;
}
.warningText {
	grid-column: 1;
	margin-top: 0;
}

h2 {
	margin-bottom: 0;
}

.header {
	display: grid;
	grid-template-columns: 1.5fr 1fr;
	grid-template-rows: 1fr 1fr;
	margin-bottom: 2rem;
	gap: 1rem;
}

@media (max-width: 1024px) {
	.header {
		grid-template-columns: 1fr;
	}
	.warningText {
		grid-column: 1;
	}
}
</style>
