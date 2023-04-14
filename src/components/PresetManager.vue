<template>
	<div id="presetManager">
		<div id="searcher" @focusin="focus(true)" @focusout="focus(false)">
			<input type="text" v-model="text" id="presetSearch" placeholder="🔍 Preset Name" @keyup="keyPressed($event)" />
			<div class="suggestions" v-if="focused && search.length">
				<div
					class="searchResult"
					v-for="(result, i) in search"
					@click="clickResult(result, i)"
					:class="{ selected: selected == i }"
				>
					{{ result }}
				</div>
			</div>
		</div>
		&nbsp;
		<button v-if="searchIn.includes(text)" @click="loadPreset">
			<i class="fa-regular fa-folder-open fa-fw"></i>
		</button>
		<button v-else style="color: #666">
			<i class="fa-regular fa-folder-open fa-fw"></i>
		</button>
		&nbsp;
		<button v-if="text.length" @click="notesStore.addCustomPreset(text)">
			<i class="fa-regular fa-floppy-disk fa-fw"></i>
		</button>
		<button v-else style="color: #666">
			<i class="fa-regular fa-floppy-disk fa-fw"></i>
		</button>
		&nbsp;
		<button v-if="Object.keys(notesStore.customPresets).includes(text)">
			<i class="fa-solid fa-trash fa-fw"></i>
		</button>
		<button v-else style="color: #666">
			<i class="fa-solid fa-trash fa-fw"></i>
		</button>
	</div>
</template>
<script lang="ts">
import { notesStore } from "@/stores/notes"
export default {
	name: "PresetManager",
	data() {
		return {
			notesStore: notesStore(),
			text: "",
			focused: false,
			selected: -1,
		}
	},
	methods: {
		loadPreset() {
			this.notesStore.loadPreset(this.text)
		},
		focus(inout: boolean) {
			if (inout) this.focused = true
			else setTimeout(() => (this.focused = false), 150)
		},
		keyPressed(event: any) {
			switch (event.keyCode) {
				case 13:
					{
						if (this.selected !== -1) this.clickResult(this.search[this.selected])
						else {
							if (this.text) {
								const isIdentical = this.text.toLocaleLowerCase().trim() == this.search[0]?.toLocaleLowerCase().trim()
								if (isIdentical) this.text = this.search[0]
								this.clickResult(this.text)
							}
							this.text = ""
						}
					}
					//enter
					break
				case 40:
					if (++this.selected >= this.search.length) this.selected = -1
					//down
					break
				case 38:
					if (--this.selected <= -2) this.selected = this.search.length - 1
					//up
					break
				default:
					this.selected = -1
			}
		},
		clickResult(name: string, _i?: number) {
			this.text = name
		},
	},
	computed: {
		searchIn(): string[] {
			const x = Object.keys(this.notesStore.generalPresets)
			x.push(...Object.keys(this.notesStore.customPresets))
			return x
		},
		search(): string[] {
			let val = this.text.toLocaleLowerCase()

			let items: string[] = []
			//exact match
			let rnd = this.lcStrings.indexOf(val)
			if (rnd !== -1) items.push(this.searchIn[rnd])

			//matches which start with the input
			this.lcStrings.forEach((s, i) => {
				if (s.startsWith(val) && !items.includes(this.searchIn[i])) items.push(this.searchIn[i])
			})

			//matches which include the input consecutively
			this.lcStrings.forEach((s, i) => {
				if (s.includes(val) && !items.includes(this.searchIn[i])) items.push(this.searchIn[i])
			})

			//matches which include the input with characters in between (first letter of val has to be first letter of match)
			let r = ""
			for (let i = 0; i < val.length; i++) {
				r += val[i] + ".*"
			}
			let regex = new RegExp("^" + r)
			this.lcStrings.forEach((s, i) => {
				if (s.match(regex) && !items.includes(this.searchIn[i])) items.push(this.searchIn[i])
			})

			//matches which include the input with characters in between
			regex = new RegExp(".*" + r)
			this.lcStrings.forEach((s, i) => {
				if (s.match(regex) && !items.includes(this.searchIn[i])) items.push(this.searchIn[i])
			})

			return items
		},
		lcStrings(): string[] {
			let s = [] as string[]
			this.searchIn.forEach(el => s.push(el.toLocaleLowerCase()))
			return s
		},
	},
}
</script>
<style scoped>
#presetManager {
	grid-column: 2;
	height: 100%;
	grid-row: 1 / -1;
	display: flex;
	align-items: center;
}

#searcher {
	position: relative;
	width: calc(100% - 10rem);
}

input {
	width: 100%;
	border: none;
	border-bottom: 1px solid #eed;
	padding: 0.6rem 0.6rem 0.4rem 0.6rem;
	outline: none;
	font-size: 1rem;
	color: white;
	background-color: transparent;
	box-sizing: border-box;
	font-family: Verdana, Geneva, Tahoma, sans-serif;
}

.suggestions {
	width: 100%;
	position: absolute;
	box-sizing: border-box;
	max-height: 15rem;
	overflow-y: auto;
}

.searchResult {
	background-color: #333;
	padding: 0.3rem 0.2rem 0.1rem 0.2rem;
	color: white;
	font-family: Verdana, Geneva, Tahoma, sans-serif;
}
.searchResult:hover,
.searchResult.selected {
	background-color: #555;
}

button {
	border: none;
	background-color: transparent;
	color: white;
	font-size: 1.2rem;
	padding: 0.5rem;
	cursor: pointer;
}
button:hover {
	background-color: #fff3;
}
</style>
